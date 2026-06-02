const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// ── Verify JWT and attach fresh user to req.user ──────────────
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [rows] = await pool.query(
      'SELECT id, name, email, role, admin_id, must_change_password FROM users WHERE id = ?',
      [decoded.id]
    );
    if (rows.length === 0) {
      return res.status(401).json({ message: 'User not found.' });
    }
    req.user = rows[0];
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
};

// ── Admin-only guard ──────────────────────────────────────────
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ message: 'Access denied. Admin role required.' });
};

// ── Audit logger — call after isAdmin ────────────────────────
const auditLog = (action, targetType = null) => async (req, res, next) => {
  // Store action metadata on req so the controller can call it after success
  req._audit = { action, targetType };
  next();
};

// ── Helper: write an audit record (called from controllers) ──
const writeAudit = async (req, action, targetType, targetId, details) => {
  try {
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
      || req.socket?.remoteAddress
      || 'unknown';
    await pool.query(
      `INSERT INTO audit_logs (admin_id, admin_name, action, target_type, target_id, details, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, req.user.name, action, targetType, targetId || null, details || null, ip]
    );
  } catch (err) {
    console.error('Audit log error:', err.message);
  }
};

module.exports = { verifyToken, isAdmin, auditLog, writeAudit };
