const db = require('../config/db');
const path = require('path');
const fs = require('fs');

// GET /api/products
const getAllProducts = async (req, res) => {
    try {
        const { category_id, brand_id, search, page = 1,
                limit = 20 } = req.query;
        let query = `
            SELECT p.*, pb.sarees_per_bundle,
                   pb.bundle_price, c.name AS category_name,
                   b.name AS brand_name,
                   (SELECT image_path FROM product_images
                    WHERE product_id = p.id AND is_primary = 1
                    LIMIT 1) AS primary_image
            FROM products p
            LEFT JOIN product_bundles pb ON p.id = pb.product_id
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN brands b ON p.brand_id = b.id
            WHERE p.is_active = 1`;
        const params = [];

        if (category_id) { query += ' AND p.category_id = ?';
            params.push(category_id); }
        if (brand_id) { query += ' AND p.brand_id = ?';
            params.push(brand_id); }
        if (search) { query += ' AND (p.name LIKE ? OR p.product_code LIKE ?)';
            params.push(`%${search}%`, `%${search}%`); }

        const offset = (page - 1) * limit;
        query += ` LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));

        const [products] = await db.query(query, params);
        res.json({ success: true, data: products });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/products/:id
const getProductById = async (req, res) => {
    try {
        const [products] = await db.query(`
            SELECT p.*, pb.sarees_per_bundle, pb.bundle_price,
                   c.name AS category_name, b.name AS brand_name
            FROM products p
            LEFT JOIN product_bundles pb ON p.id = pb.product_id
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN brands b ON p.brand_id = b.id
            WHERE p.id = ?`, [req.params.id]);

        if (products.length === 0)
            return res.status(404).json({
                success: false, message: 'Product not found.' });

        const [images] = await db.query(
            'SELECT * FROM product_images WHERE product_id = ?',
            [req.params.id]);

        res.json({ success: true,
            data: { ...products[0], images } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST /api/products (Admin only)
const createProduct = async (req, res) => {
    try {
        const { product_code, name, category_id, brand_id, fabric,
                occasion, description, additional_description,
                meta_title, meta_description,
                price_per_saree, sarees_per_bundle } = req.body;

        const slug = name.toLowerCase().replace(/\s+/g, '-')
                         .replace(/[^a-z0-9-]/g, '');

        const [result] = await db.query(`
            INSERT INTO products (product_code, name, slug, category_id,
                brand_id, fabric, occasion, description,
                additional_description, meta_title, meta_description,
                price_per_saree)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
            [product_code, name, slug, category_id, brand_id,
             fabric, occasion, description, additional_description,
             meta_title, meta_description, price_per_saree]);

        const product_id = result.insertId;

        const bundle_price = parseFloat(price_per_saree)
                           * parseInt(sarees_per_bundle);
        await db.query(`
            INSERT INTO product_bundles
                (product_id, sarees_per_bundle, bundle_price)
            VALUES (?, ?, ?)`,
            [product_id, sarees_per_bundle, bundle_price]);

        if (req.file) {
            await db.query(`
                INSERT INTO product_images
                    (product_id, image_path, is_primary)
                VALUES (?, ?, 1)`,
                [product_id, req.file.path]);
        }

        res.json({ success: true, message: 'Product created.', product_id });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// PUT /api/products/:id (Admin only)
const updateProduct = async (req, res) => {
    try {
        const { price_per_saree, sarees_per_bundle, ...fields } = req.body;
        await db.query('UPDATE products SET ?, updated_at = NOW() WHERE id = ?',
            [fields, req.params.id]);

        if (price_per_saree && sarees_per_bundle) {
            const bundle_price = parseFloat(price_per_saree)
                               * parseInt(sarees_per_bundle);
            await db.query(`
                UPDATE product_bundles
                SET sarees_per_bundle = ?, bundle_price = ?
                WHERE product_id = ?`,
                [sarees_per_bundle, bundle_price, req.params.id]);
            await db.query(
                'UPDATE products SET price_per_saree = ? WHERE id = ?',
                [price_per_saree, req.params.id]);
        }
        res.json({ success: true, message: 'Product updated.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// DELETE /api/products/:id (Admin only)
const deleteProduct = async (req, res) => {
    try {
        const id = req.params.id;

        // Check product exists
        const [rows] = await db.query(
            'SELECT id FROM products WHERE id = ?', [id]);
        if (rows.length === 0)
            return res.status(404).json({
                success: false, message: 'Product not found.' });

        // Delete associated image files from disk
        const [images] = await db.query(
            'SELECT image_path FROM product_images WHERE product_id = ?', [id]);
        for (const img of images) {
            const filePath = path.join(__dirname, '..', img.image_path);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        // Delete product (cascades to product_images, product_bundles)
        await db.query('DELETE FROM products WHERE id = ?', [id]);

        res.json({ success: true, message: 'Product deleted successfully.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { getAllProducts, getProductById,
                   createProduct, updateProduct, deleteProduct };
