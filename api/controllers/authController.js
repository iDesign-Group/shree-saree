const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Get JWT expiry based on role
const getExpiry = (role) => {
    if (role === 'admin') return process.env.JWT_ADMIN_EXPIRY;
    if (role === 'broker') return process.env.JWT_BROKER_EXPIRY;
    return process.env.JWT_SHOP_EXPIRY; // 24h for shop owners
};

// POST /api/auth/login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const [users] = await db.query(
            'SELECT * FROM users WHERE email = ? AND is_active = 1', [email]);

        if (users.length === 0) {
            return res.status(401).json({ success: false,
                message: 'Invalid email or password.' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false,
                message: 'Invalid email or password.' });
        }

        // Update last login
        await db.query('UPDATE users SET last_login = NOW() WHERE id = ?',
            [user.id]);

        const payload = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET,
            { expiresIn: getExpiry(user.role) });

        res.json({
            success: true,
            message: 'Login successful.',
            token,
            user: { id: user.id, name: user.name,
                    email: user.email, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST /api/auth/register (Admin only)
const register = async (req, res) => {
    try {
        const { name, email, phone, password, role } = req.body;
        const hashed = await bcrypt.hash(password, 10);
        const [result] = await db.query(
            `INSERT INTO users (name, email, phone, password_hash, role)
             VALUES (?, ?, ?, ?, ?)`,
            [name, email, phone, hashed, role]
        );
        res.json({ success: true, message: 'User created.',
            user_id: result.insertId });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST /api/auth/change-password
const changePassword = async (req, res) => {
    try {
        const { old_password, new_password } = req.body;
        const [users] = await db.query(
            'SELECT * FROM users WHERE id = ?', [req.user.id]);
        const isMatch = await bcrypt.compare(
            old_password, users[0].password_hash);
        if (!isMatch) return res.status(400).json({
            success: false, message: 'Old password incorrect.' });
        const hashed = await bcrypt.hash(new_password, 10);
        await db.query('UPDATE users SET password_hash = ? WHERE id = ?',
            [hashed, req.user.id]);
        res.json({ success: true, message: 'Password updated.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { login, register, changePassword };
