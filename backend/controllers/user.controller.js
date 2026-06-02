const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { writeAudit } = require('../middleware/auth.middleware');

// ── GET all users (admin only) ────────────────────────────────
const getUsers = async (req, res) => {
  try {
    const page   = parseInt(req.query.page)  || 1;
    const limit  = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM users');
    const [users] = await pool.query(
      'SELECT id, name, email, role, admin_id, must_change_password, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );

    res.json({ users, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ── UPDATE user role (admin only) ─────────────────────────────
const updateUserRole = async (req, res) => {
  const { role } = req.body;
  if (!['admin', 'user'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role. Must be admin or user.' });
  }

  try {
    const [existing] = await pool.query('SELECT id, name FROM users WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ message: 'User not found.' });

    await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);

    await writeAudit(req, 'UPDATE_USER_ROLE', 'user', parseInt(req.params.id),
      `Changed role of ${existing[0].name} to ${role}`);

    res.json({ message: 'User role updated successfully.' });
  } catch (err) {
    console.error('Update role error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ── DELETE user (admin only) ──────────────────────────────────
const deleteUser = async (req, res) => {
  try {
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account.' });
    }

    const [existing] = await pool.query('SELECT id, name, email FROM users WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ message: 'User not found.' });

    await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);

    await writeAudit(req, 'DELETE_USER', 'user', parseInt(req.params.id),
      `Deleted user: ${existing[0].name} (${existing[0].email})`);

    res.json({ message: 'User deleted successfully.' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ── CREATE admin user (admin only) ───────────────────────────
const createAdminUser = async (req, res) => {
  const { name, email, password, admin_id } = req.body;

  if (!name || !email || !password || !admin_id) {
    return res.status(400).json({ message: 'name, email, password, and admin_id are required.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  }

  try {
    const [emailCheck] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (emailCheck.length > 0) return res.status(409).json({ message: 'Email already registered.' });

    const [idCheck] = await pool.query('SELECT id FROM users WHERE admin_id = ?', [admin_id.toUpperCase()]);
    if (idCheck.length > 0) return res.status(409).json({ message: 'Admin ID already in use.' });

    const salt = await bcrypt.genSalt(12);
    const hashed = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role, admin_id, must_change_password) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashed, 'admin', admin_id.toUpperCase(), 1]
    );

    await writeAudit(req, 'CREATE_ADMIN', 'user', result.insertId,
      `Created admin user: ${name} (${email}) with Admin ID: ${admin_id.toUpperCase()}`);

    res.status(201).json({
      message: 'Admin user created successfully.',
      user: { id: result.insertId, name, email, role: 'admin', admin_id: admin_id.toUpperCase() }
    });
  } catch (err) {
    console.error('Create admin error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getUsers, updateUserRole, deleteUser, createAdminUser };
