const { validationResult } = require('express-validator');
const pool = require('../config/db');
const { writeAudit } = require('../middleware/auth.middleware');

// ── GET all employees (admin: full details | user: limited view) ──
const getEmployees = async (req, res) => {
  try {
    const page       = parseInt(req.query.page)   || 1;
    const limit      = parseInt(req.query.limit)  || 10;
    const search     = req.query.search     || '';
    const department = req.query.department || '';
    const status     = req.query.status     || '';
    const offset     = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (search) {
      whereClause += ' AND (e.first_name LIKE ? OR e.last_name LIKE ? OR e.email LIKE ? OR e.position LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }
    if (department) { whereClause += ' AND e.department = ?'; params.push(department); }
    if (status)     { whereClause += ' AND e.status = ?';     params.push(status); }

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM employees e ${whereClause}`, params
    );

    // Admins see salary + created_by; regular users see a limited set
    const selectCols = req.user.role === 'admin'
      ? 'e.*, u.name AS created_by_name'
      : 'e.id, e.first_name, e.last_name, e.department, e.position, e.status, e.hire_date';

    const [employees] = await pool.query(
      `SELECT ${selectCols}
       FROM employees e
       LEFT JOIN users u ON e.created_by = u.id
       ${whereClause}
       ORDER BY e.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({ employees, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    console.error('Get employees error:', err);
    res.status(500).json({ message: 'Server error fetching employees.' });
  }
};

// ── GET single employee (admin only for full details) ─────────
const getEmployee = async (req, res) => {
  try {
    const selectCols = req.user.role === 'admin'
      ? 'e.*, u.name AS created_by_name'
      : 'e.id, e.first_name, e.last_name, e.department, e.position, e.status, e.hire_date';

    const [rows] = await pool.query(
      `SELECT ${selectCols}
       FROM employees e
       LEFT JOIN users u ON e.created_by = u.id
       WHERE e.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Employee not found.' });
    res.json({ employee: rows[0] });
  } catch (err) {
    console.error('Get employee error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ── CREATE employee (admin only) ──────────────────────────────
const createEmployee = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { first_name, last_name, email, phone, department, position, salary, hire_date, status } = req.body;

  try {
    const [existing] = await pool.query('SELECT id FROM employees WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(409).json({ message: 'Employee email already exists.' });

    const [result] = await pool.query(
      `INSERT INTO employees (first_name, last_name, email, phone, department, position, salary, hire_date, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, email, phone, department, position, salary, hire_date, status || 'active', req.user.id]
    );

    await writeAudit(req, 'CREATE_EMPLOYEE', 'employee', result.insertId,
      `Created employee: ${first_name} ${last_name} (${email})`);

    const [[newEmployee]] = await pool.query('SELECT * FROM employees WHERE id = ?', [result.insertId]);
    res.status(201).json({ message: 'Employee created successfully.', employee: newEmployee });
  } catch (err) {
    console.error('Create employee error:', err);
    res.status(500).json({ message: 'Server error creating employee.' });
  }
};

// ── UPDATE employee (admin only) ──────────────────────────────
const updateEmployee = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { first_name, last_name, email, phone, department, position, salary, hire_date, status } = req.body;

  try {
    const [existing] = await pool.query('SELECT id FROM employees WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Employee not found.' });

    const [emailCheck] = await pool.query(
      'SELECT id FROM employees WHERE email = ? AND id != ?', [email, req.params.id]
    );
    if (emailCheck.length > 0) return res.status(409).json({ message: 'Email already used by another employee.' });

    await pool.query(
      `UPDATE employees SET first_name=?, last_name=?, email=?, phone=?, department=?,
       position=?, salary=?, hire_date=?, status=? WHERE id=?`,
      [first_name, last_name, email, phone, department, position, salary, hire_date, status, req.params.id]
    );

    await writeAudit(req, 'UPDATE_EMPLOYEE', 'employee', parseInt(req.params.id),
      `Updated employee: ${first_name} ${last_name}`);

    const [[updated]] = await pool.query('SELECT * FROM employees WHERE id = ?', [req.params.id]);
    res.json({ message: 'Employee updated successfully.', employee: updated });
  } catch (err) {
    console.error('Update employee error:', err);
    res.status(500).json({ message: 'Server error updating employee.' });
  }
};

// ── DELETE employee (admin only) ──────────────────────────────
const deleteEmployee = async (req, res) => {
  try {
    const [existing] = await pool.query(
      'SELECT id, first_name, last_name FROM employees WHERE id = ?', [req.params.id]
    );
    if (existing.length === 0) return res.status(404).json({ message: 'Employee not found.' });

    await pool.query('DELETE FROM employees WHERE id = ?', [req.params.id]);

    await writeAudit(req, 'DELETE_EMPLOYEE', 'employee', parseInt(req.params.id),
      `Deleted employee: ${existing[0].first_name} ${existing[0].last_name}`);

    res.json({ message: 'Employee deleted successfully.' });
  } catch (err) {
    console.error('Delete employee error:', err);
    res.status(500).json({ message: 'Server error deleting employee.' });
  }
};

// ── GET departments list ──────────────────────────────────────
const getDepartments = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT DISTINCT department FROM employees WHERE department IS NOT NULL ORDER BY department'
    );
    res.json({ departments: rows.map(r => r.department) });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getEmployees, getEmployee, createEmployee, updateEmployee, deleteEmployee, getDepartments };
