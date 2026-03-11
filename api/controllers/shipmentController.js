const db = require('../config/db');
const { sendShipmentEmail } = require('../config/email');

// POST /api/shipments (Admin only)
const createShipment = async (req, res) => {
    try {
        const { order_id, courier_name, tracking_number,
                dispatch_date, expected_delivery,
                shipped_from_godown, notes } = req.body;

        const [result] = await db.query(`
            INSERT INTO shipments (order_id, courier_name,
                tracking_number, dispatch_date, expected_delivery,
                shipped_from_godown, notes, shipment_status)
            VALUES (?,?,?,?,?,?,?,'dispatched')`,
            [order_id, courier_name, tracking_number,
             dispatch_date, expected_delivery,
             shipped_from_godown, notes]);

        // Update order status
        await db.query(
            "UPDATE orders SET order_status = 'shipped' WHERE id = ?",
            [order_id]);

        // Get order + shop + email
        const [orderData] = await db.query(`
            SELECT o.order_number, s.shop_name,
                   s.email AS shop_email, u.email AS user_email
            FROM orders o
            JOIN shops s ON o.shop_id = s.id
            JOIN users u ON o.user_id = u.id
            WHERE o.id = ?`, [order_id]);

        if (orderData.length > 0) {
            const emailTo = orderData[0].shop_email
                         || orderData[0].user_email;
            try {
                await sendShipmentEmail(emailTo, {
                    order_number: orderData[0].order_number,
                    shop_name: orderData[0].shop_name,
                    courier_name, tracking_number,
                    dispatch_date, expected_delivery
                });
                await db.query(`
                    UPDATE shipments
                    SET email_sent = 1, email_sent_at = NOW()
                    WHERE id = ?`, [result.insertId]);
            } catch (e) {
                console.error('Shipment email error:', e.message);
            }
        }

        res.json({ success: true,
            message: 'Shipment created and email sent.',
            shipment_id: result.insertId });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// PUT /api/shipments/:id (Update tracking)
const updateShipment = async (req, res) => {
    try {
        await db.query(
            'UPDATE shipments SET ?, updated_at = NOW() WHERE id = ?',
            [req.body, req.params.id]);
        res.json({ success: true, message: 'Shipment updated.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { createShipment, updateShipment };
