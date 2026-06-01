const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const pool = require('../config/db');

// ── Register (creates 'user' role only — admins are created by existing admins) ──
const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;

  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already registered.' });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Public registration always creates 'user' role — never admin
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 'user']
    );

    const token = jwt.sign(
      { id: result.insertId, email, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully.',
      token,
      user: { id: result.insertId, name, email, role: 'user' }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

// ── Login (supports both admin_id+password and email+password) ──
const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, admin_id } = req.body;

  try {
    let user;

    if (admin_id) {
      // Admin login path: requires admin_id + password
      const [rows] = await pool.query(
        "SELECT * FROM users WHERE admin_id = ? AND role = 'admin'",
        [admin_id.trim().toUpperCase()]
      );
      if (rows.length === 0) {
        return res.status(401).json({ message: 'Invalid Admin ID or password.' });
      }
      user = rows[0];
      // Also verify email matches if provided
      if (email && user.email !== email.toLowerCase().trim()) {
        return res.status(401).json({ message: 'Invalid Admin ID or password.' });
      }
    } else {
      // Regular user login: email + password
      const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
      if (rows.length === 0) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }
      user = rows[0];

      // Block regular users from using admin login path
      // (admins can still log in via email if they want)
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const msg = admin_id ? 'Invalid Admin ID or password.' : 'Invalid email or password.';
      return res.status(401).json({ message: msg });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Record login history
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
      || req.socket.remoteAddress
      || 'unknown';
    const ua = req.headers['user-agent'] || 'unknown';
    await pool.query(
      'INSERT INTO login_history (user_id, user_name, user_email, user_role, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
      [user.id, user.name, user.email, user.role, ip, ua]
    );

    res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        admin_id: user.admin_id || null,
        must_change_password: !!user.must_change_password
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

// ── Get current user profile ──────────────────────────────────
const getProfile = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, role, admin_id, must_change_password, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json({ user: rows[0] });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ── Change password (authenticated user) ─────────────────────
const changePassword = async (req, res) => {
  const { current_password, new_password } = req.body;

  if (!current_password || !new_password) {
    return res.status(400).json({ message: 'Both current and new password are required.' });
  }
  if (new_password.length < 8) {
    return res.status(400).json({ message: 'New password must be at least 8 characters.' });
  }

  try {
    const [rows] = await pool.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'User not found.' });

    const isMatch = await bcrypt.compare(current_password, rows[0].password);
    if (!isMatch) return res.status(401).json({ message: 'Current password is incorrect.' });

    const salt = await bcrypt.genSalt(12);
    const hashed = await bcrypt.hash(new_password, salt);

    await pool.query(
      'UPDATE users SET password = ?, must_change_password = 0 WHERE id = ?',
      [hashed, req.user.id]
    );

    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { register, login, getProfile, changePassword };
