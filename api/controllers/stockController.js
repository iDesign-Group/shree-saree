const db = require('../config/db');

// POST /api/stock/inward (Admin only)
const stockInward = async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        const { product_id, godown_id, rack_id, shelf_id,
                bundles_received, inward_date,
                invoice_number, supplier_name, remarks } = req.body;

        // Get bundle info
        const [bundle] = await conn.query(
            'SELECT * FROM product_bundles WHERE product_id = ?',
            [product_id]);
        if (bundle.length === 0) throw new Error('Bundle config not found.');

        const sarees_per_bundle = bundle[0].sarees_per_bundle;
        const total_sarees = bundles_received * sarees_per_bundle;

        // Insert stock inward record
        await conn.query(`
            INSERT INTO stock_inward (product_id, godown_id, rack_id,
                shelf_id, bundles_received, sarees_per_bundle,
                total_sarees, inward_date, invoice_number,
                supplier_name, remarks, created_by)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
            [product_id, godown_id, rack_id, shelf_id,
             bundles_received, sarees_per_bundle, total_sarees,
             inward_date, invoice_number, supplier_name,
             remarks, req.user.id]);

        // Update stock ledger (INSERT or UPDATE)
        await conn.query(`
            INSERT INTO stock_ledger
                (product_id, godown_id, rack_id, shelf_id,
                 bundles_available, sarees_available)
            VALUES (?,?,?,?,?,?)
            ON DUPLICATE KEY UPDATE
                bundles_available = bundles_available + VALUES(bundles_available),
                sarees_available  = sarees_available  + VALUES(sarees_available)`,
            [product_id, godown_id, rack_id, shelf_id,
             bundles_received, total_sarees]);

        await conn.commit();
        res.json({ success: true, message: 'Stock inward recorded.',
            total_sarees });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ success: false, message: err.message });
    } finally {
        conn.release();
    }
};

// GET /api/stock/product/:product_id
const getStockByProduct = async (req, res) => {
    try {
        const [stock] = await db.query(`
            SELECT sl.*, g.name AS godown_name,
                   r.rack_number, s.shelf_label
            FROM stock_ledger sl
            JOIN godowns g ON sl.godown_id = g.id
            JOIN racks r ON sl.rack_id = r.id
            JOIN shelves s ON sl.shelf_id = s.id
            WHERE sl.product_id = ?`, [req.params.product_id]);
        res.json({ success: true, data: stock });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/stock/godown/:godown_id
const getStockByGodown = async (req, res) => {
    try {
        const [stock] = await db.query(`
            SELECT sl.*, p.product_code, p.name AS product_name,
                   r.rack_number, s.shelf_label
            FROM stock_ledger sl
            JOIN products p ON sl.product_id = p.id
            JOIN racks r ON sl.rack_id = r.id
            JOIN shelves s ON sl.shelf_id = s.id
            WHERE sl.godown_id = ?
            ORDER BY r.rack_number, s.shelf_label`,
            [req.params.godown_id]);
        res.json({ success: true, data: stock });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { stockInward, getStockByProduct, getStockByGodown };
