const db = require('../config/db');
const bcrypt = require('bcryptjs');

// ============================================
// GET /api/users — Get all users (Admin only)
// ============================================
const getAllUsers = async (req, res) => {
    try {
        const { role, is_active, search, page = 1, limit = 20 } = req.query;

        let query = `
            SELECT id, name, email, phone, role,
                   is_active, last_login, created_at
            FROM users WHERE 1=1`;
        const params = [];

        if (role) {
            query += ' AND role = ?';
            params.push(role);
        }
        if (is_active !== undefined) {
            query += ' AND is_active = ?';
            params.push(is_active);
        }
        if (search) {
            query += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);
        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const [users] = await db.query(query, params);

        // Get total count
        const [countResult] = await db.query(
            'SELECT COUNT(*) AS total FROM users WHERE 1=1', []);

        res.json({
            success: true,
            data: users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: countResult[0].total
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ============================================
// GET /api/users/:id — Get single user
// ============================================
const getUserById = async (req, res) => {
    try {
        const [users] = await db.query(`
            SELECT id, name, email, phone, role,
                   is_active, last_login, created_at
            FROM users WHERE id = ?`, [req.params.id]);

        if (users.length === 0)
            return res.status(404).json({
                success: false, message: 'User not found.' });

        const user = users[0];

        // Fetch extra profile based on role
        if (user.role === 'broker') {
            const [broker] = await db.query(
                'SELECT * FROM brokers WHERE user_id = ?', [user.id]);
            user.broker_profile = broker[0] || null;
        }

        if (user.role === 'shop_owner') {
            const [shop] = await db.query(`
                SELECT s.*, b.broker_code
                FROM shops s
                LEFT JOIN brokers b ON s.broker_id = b.id
                WHERE s.user_id = ?`, [user.id]);
            user.shop_profile = shop[0] || null;
        }

        res.json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ============================================
// POST /api/users — Create user with profile
// (Admin only)
// ============================================
const createUser = async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const {
            name, email, phone, password, role,
            // Broker fields
            broker_code, commission_percent,
            broker_address, broker_city, broker_state, broker_pincode,
            // Shop fields
            shop_name, owner_name, gst_number, shop_phone, shop_email,
            shop_address, shop_city, shop_state, shop_pincode,
            credit_days, credit_limit, broker_id
        } = req.body;

        // Check if email already exists
        const [existing] = await conn.query(
            'SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0)
            return res.status(400).json({
                success: false, message: 'Email already registered.' });

        // Hash password
        const password_hash = await bcrypt.hash(password, 10);

        // Set token expiry hours based on role
        const token_expiry_hours = role === 'shop_owner' ? 24 : null;

        // Insert user
        const [userResult] = await conn.query(`
            INSERT INTO users
                (name, email, phone, password_hash, role, token_expiry_hours)
            VALUES (?,?,?,?,?,?)`,
            [name, email, phone, password_hash, role, token_expiry_hours]);

        const user_id = userResult.insertId;

        // Insert broker profile if role is broker
        if (role === 'broker') {
            await conn.query(`
                INSERT INTO brokers
                    (user_id, broker_code, commission_percent,
                     address, city, state, pincode)
                VALUES (?,?,?,?,?,?,?)`,
                [user_id, broker_code, commission_percent || 0,
                 broker_address, broker_city,
                 broker_state, broker_pincode]);
        }

        // Insert shop profile if role is shop_owner
        if (role === 'shop_owner') {
            await conn.query(`
                INSERT INTO shops
                    (user_id, broker_id, shop_name, owner_name,
                     gst_number, phone, email, address, city,
                     state, pincode, credit_days, credit_limit)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                [user_id, broker_id || null, shop_name, owner_name,
                 gst_number, shop_phone || phone, shop_email || email,
                 shop_address, shop_city, shop_state, shop_pincode,
                 credit_days || 60, credit_limit || 0]);
        }

        await conn.commit();

        res.json({
            success: true,
            message: `${role} created successfully.`,
            user_id
        });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ success: false, message: err.message });
    } finally {
        conn.release();
    }
};

// ============================================
// PUT /api/users/:id — Update user (Admin only)
// ============================================
const updateUser = async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const {
            name, email, phone, is_active,
            // Broker fields
            broker_code, commission_percent,
            broker_address, broker_city, broker_state, broker_pincode,
            // Shop fields
            shop_name, owner_name, gst_number, shop_phone, shop_email,
            shop_address, shop_city, shop_state, shop_pincode,
            credit_days, credit_limit, broker_id
        } = req.body;

        // Update core user info
        await conn.query(`
            UPDATE users
            SET name = ?, email = ?, phone = ?, is_active = ?
            WHERE id = ?`,
            [name, email, phone, is_active, req.params.id]);

        // Get user role
        const [users] = await conn.query(
            'SELECT role FROM users WHERE id = ?', [req.params.id]);
        const role = users[0]?.role;

        // Update broker profile
        if (role === 'broker') {
            await conn.query(`
                UPDATE brokers
                SET broker_code = ?, commission_percent = ?,
                    address = ?, city = ?, state = ?, pincode = ?
                WHERE user_id = ?`,
                [broker_code, commission_percent,
                 broker_address, broker_city,
                 broker_state, broker_pincode, req.params.id]);
        }

        // Update shop profile
        if (role === 'shop_owner') {
            await conn.query(`
                UPDATE shops
                SET shop_name = ?, owner_name = ?, gst_number = ?,
                    phone = ?, email = ?, address = ?, city = ?,
                    state = ?, pincode = ?, credit_days = ?,
                    credit_limit = ?, broker_id = ?
                WHERE user_id = ?`,
                [shop_name, owner_name, gst_number,
                 shop_phone, shop_email, shop_address, shop_city,
                 shop_state, shop_pincode, credit_days,
                 credit_limit, broker_id, req.params.id]);
        }

        await conn.commit();
        res.json({ success: true, message: 'User updated successfully.' });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ success: false, message: err.message });
    } finally {
        conn.release();
    }
};

// ============================================
// PUT /api/users/:id/toggle-status
// Activate / Deactivate user (Admin only)
// ============================================
const toggleUserStatus = async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT is_active FROM users WHERE id = ?', [req.params.id]);

        if (users.length === 0)
            return res.status(404).json({
                success: false, message: 'User not found.' });

        const newStatus = users[0].is_active === 1 ? 0 : 1;
        await db.query(
            'UPDATE users SET is_active = ? WHERE id = ?',
            [newStatus, req.params.id]);

        res.json({
            success: true,
            message: `User ${newStatus === 1 ? 'activated' : 'deactivated'}.`,
            is_active: newStatus
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ============================================
// PUT /api/users/:id/reset-password (Admin only)
// ============================================
const resetPassword = async (req, res) => {
    try {
        const { new_password } = req.body;
        const password_hash = await bcrypt.hash(new_password, 10);
        await db.query(
            'UPDATE users SET password_hash = ? WHERE id = ?',
            [password_hash, req.params.id]);
        res.json({ success: true, message: 'Password reset successfully.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ============================================
// GET /api/users/brokers/list
// Get all brokers with commission info
// ============================================
const getBrokersList = async (req, res) => {
    try {
        const [brokers] = await db.query(`
            SELECT u.id, u.name, u.email, u.phone,
                   u.is_active, b.broker_code,
                   b.commission_percent, b.city, b.state,
                   (SELECT COUNT(*) FROM shops
                    WHERE broker_id = b.id) AS total_shops,
                   (SELECT COUNT(*) FROM orders
                    WHERE broker_id = b.id) AS total_orders
            FROM users u
            JOIN brokers b ON u.id = b.user_id
            WHERE u.role = 'broker'
            ORDER BY u.name ASC`);

        res.json({ success: true, data: brokers });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ============================================
// GET /api/users/shops/list
// Get all shops (Admin/Broker)
// ============================================
const getShopsList = async (req, res) => {
    try {
        const { broker_id, city, state } = req.query;

        let query = `
            SELECT u.id AS user_id, u.name, u.email AS login_email,
                   u.is_active, u.last_login,
                   s.id AS shop_id, s.shop_name, s.owner_name,
                   s.gst_number, s.phone, s.email AS shop_email,
                   s.city, s.state, s.credit_days,
                   s.credit_limit, b.broker_code,
                   (SELECT COUNT(*) FROM orders
                    WHERE shop_id = s.id) AS total_orders
            FROM users u
            JOIN shops s ON u.id = s.user_id
            LEFT JOIN brokers b ON s.broker_id = b.id
            WHERE u.role = 'shop_owner'`;

        const params = [];

        // Broker can only see their own shops
        if (req.user.role === 'broker') {
            query += ` AND s.broker_id = (
                SELECT id FROM brokers WHERE user_id = ?)`;
            params.push(req.user.id);
        } else if (broker_id) {
            query += ' AND s.broker_id = ?';
            params.push(broker_id);
        }

        if (city) {
            query += ' AND s.city LIKE ?';
            params.push(`%${city}%`);
        }
        if (state) {
            query += ' AND s.state LIKE ?';
            params.push(`%${state}%`);
        }

        query += ' ORDER BY s.shop_name ASC';

        const [shops] = await db.query(query, params);
        res.json({ success: true, data: shops });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ============================================
// GET /api/users/profile/me
// Get own profile (any logged-in user)
// ============================================
const getMyProfile = async (req, res) => {
    try {
        const [users] = await db.query(`
            SELECT id, name, email, phone, role,
                   last_login, created_at
            FROM users WHERE id = ?`, [req.user.id]);

        if (users.length === 0)
            return res.status(404).json({
                success: false, message: 'User not found.' });

        const user = users[0];

        if (user.role === 'broker') {
            const [broker] = await db.query(
                'SELECT * FROM brokers WHERE user_id = ?', [user.id]);
            user.broker_profile = broker[0] || null;
        }

        if (user.role === 'shop_owner') {
            const [shop] = await db.query(
                'SELECT * FROM shops WHERE user_id = ?', [user.id]);
            user.shop_profile = shop[0] || null;
        }

        res.json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    toggleUserStatus,
    resetPassword,
    getBrokersList,
    getShopsList,
    getMyProfile
};
