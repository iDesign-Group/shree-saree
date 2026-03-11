const db = require('../config/db');
const { sendOrderConfirmationEmail } = require('../config/email');

// POST /api/orders
const placeOrder = async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        const { shop_id, items, notes } = req.body;
        // items = [{ product_id, bundles_ordered }]

        // Get shop & user info
        const [shops] = await conn.query(`
            SELECT s.*, u.email, u.name AS owner_name
            FROM shops s JOIN users u ON s.user_id = u.id
            WHERE s.id = ?`, [shop_id]);
        if (shops.length === 0) throw new Error('Shop not found.');
        const shop = shops[0];

        let total_bundles = 0, total_sarees = 0, total_amount = 0;
        const orderItems = [];

        for (const item of items) {
            const [products] = await conn.query(`
                SELECT p.price_per_saree,
                       pb.sarees_per_bundle, pb.bundle_price
                FROM products p
                JOIN product_bundles pb ON p.id = pb.product_id
                WHERE p.id = ? AND p.is_active = 1`, [item.product_id]);

            if (products.length === 0)
                throw new Error(`Product ${item.product_id} not found.`);

            const prod = products[0];
            const total_sarees_item = item.bundles_ordered
                                    * prod.sarees_per_bundle;
            const line_total = item.bundles_ordered * prod.bundle_price;

            // Check stock
            const [stock] = await conn.query(`
                SELECT SUM(bundles_available) AS total_bundles
                FROM stock_ledger WHERE product_id = ?`,
                [item.product_id]);
            if (stock[0].total_bundles < item.bundles_ordered)
                throw new Error(
                    `Insufficient stock for product ${item.product_id}.`);

            total_bundles += item.bundles_ordered;
            total_sarees  += total_sarees_item;
            total_amount  += line_total;
            orderItems.push({ ...item, ...prod,
                total_sarees: total_sarees_item, line_total });
        }

        // Generate order number
        const order_number = `SS-${new Date().getFullYear()}-`
            + String(Date.now()).slice(-6);

        // Payment due date = today + 60 days
        const due = new Date();
        due.setDate(due.getDate() + (shop.credit_days || 60));
        const payment_due_date = due.toISOString().split('T')[0];

        // Insert order
        const [orderResult] = await conn.query(`
            INSERT INTO orders (order_number, user_id, shop_id,
                broker_id, total_bundles, total_sarees,
                total_amount, payment_due_date)
            VALUES (?,?,?,?,?,?,?,?)`,
            [order_number, req.user.id, shop_id,
             shop.broker_id, total_bundles,
             total_sarees, total_amount, payment_due_date]);

        const order_id = orderResult.insertId;

        // Insert order items & deduct stock
        for (const item of orderItems) {
            await conn.query(`
                INSERT INTO order_items (order_id, product_id,
                    bundles_ordered, sarees_per_bundle, total_sarees,
                    price_per_saree, bundle_price, line_total)
                VALUES (?,?,?,?,?,?,?,?)`,
                [order_id, item.product_id, item.bundles_ordered,
                 item.sarees_per_bundle, item.total_sarees,
                 item.price_per_saree, item.bundle_price, item.line_total]);

            // Deduct from stock_ledger (FIFO — first available shelf)
            const [stockRows] = await conn.query(`
                SELECT id, bundles_available FROM stock_ledger
                WHERE product_id = ? AND bundles_available > 0
                ORDER BY id ASC`, [item.product_id]);

            let remaining = item.bundles_ordered;
            for (const row of stockRows) {
                if (remaining <= 0) break;
                const deduct = Math.min(row.bundles_available, remaining);
                await conn.query(`
                    UPDATE stock_ledger
                    SET bundles_available = bundles_available - ?,
                        sarees_available = sarees_available - ?
                    WHERE id = ?`,
                    [deduct, deduct * item.sarees_per_bundle, row.id]);
                remaining -= deduct;
            }
        }

        // Insert payment tracking
        await conn.query(`
            INSERT INTO payment_tracking
                (order_id, shop_id, total_amount,
                 balance_due, due_date)
            VALUES (?,?,?,?,?)`,
            [order_id, shop_id, total_amount,
             total_amount, payment_due_date]);

        await conn.commit();

        // Send confirmation email
        try {
            await sendOrderConfirmationEmail(shop.email, {
                order_number, shop_name: shop.shop_name,
                total_bundles, total_sarees,
                total_amount, payment_due_date
            });
        } catch (emailErr) {
            console.error('Email failed:', emailErr.message);
        }

        res.json({ success: true, message: 'Order placed successfully.',
            order_number, order_id, total_amount, payment_due_date });

    } catch (err) {
        await conn.rollback();
        res.status(500).json({ success: false, message: err.message });
    } finally {
        conn.release();
    }
};

// GET /api/orders (Admin/Broker)
const getAllOrders = async (req, res) => {
    try {
        const { status, shop_id, broker_id,
                page = 1, limit = 20 } = req.query;
        let query = `
            SELECT o.*, s.shop_name, u.name AS ordered_by,
                   b.broker_code
            FROM orders o
            LEFT JOIN shops s ON o.shop_id = s.id
            LEFT JOIN users u ON o.user_id = u.id
            LEFT JOIN brokers b ON o.broker_id = b.id
            WHERE 1=1`;
        const params = [];

        if (status) { query += ' AND o.order_status = ?';
            params.push(status); }
        if (shop_id) { query += ' AND o.shop_id = ?';
            params.push(shop_id); }
        if (broker_id) { query += ' AND o.broker_id = ?';
            params.push(broker_id); }
        if (req.user.role === 'broker') {
            query += ' AND o.broker_id = (SELECT id FROM brokers WHERE user_id = ?)';
            params.push(req.user.id);
        }

        query += ` ORDER BY o.created_at DESC
                   LIMIT ? OFFSET ?`;
        params.push(parseInt(limit),
                    (parseInt(page) - 1) * parseInt(limit));

        const [orders] = await db.query(query, params);
        res.json({ success: true, data: orders });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/orders/:id
const getOrderById = async (req, res) => {
    try {
        const [orders] = await db.query(`
            SELECT o.*, s.shop_name, s.city, u.name AS ordered_by
            FROM orders o
            LEFT JOIN shops s ON o.shop_id = s.id
            LEFT JOIN users u ON o.user_id = u.id
            WHERE o.id = ?`, [req.params.id]);

        if (orders.length === 0)
            return res.status(404).json({
                success: false, message: 'Order not found.' });

        const [items] = await db.query(`
            SELECT oi.*, p.product_code, p.name AS product_name
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?`, [req.params.id]);

        res.json({ success: true,
            data: { ...orders[0], items } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { placeOrder, getAllOrders, getOrderById };
