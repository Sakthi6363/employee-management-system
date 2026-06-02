const pool = require('../config/db');

// ── GET /api/dashboard/stats (admin only) ─────────────────────
const getStats = async (req, res) => {
  try {
    const [[empTotal]]    = await pool.query('SELECT COUNT(*) AS total FROM employees');
    const [[empActive]]   = await pool.query("SELECT COUNT(*) AS total FROM employees WHERE status='active'");
    const [[empInactive]] = await pool.query("SELECT COUNT(*) AS total FROM employees WHERE status='inactive'");
    const [[userTotal]]   = await pool.query('SELECT COUNT(*) AS total FROM users');
    const [[adminTotal]]  = await pool.query("SELECT COUNT(*) AS total FROM users WHERE role='admin'");
    const [[userOnly]]    = await pool.query("SELECT COUNT(*) AS total FROM users WHERE role='user'");
    const [deptRows]      = await pool.query(
      'SELECT DISTINCT department FROM employees WHERE department IS NOT NULL ORDER BY department'
    );

    // Login counts
    const [[todayLogins]]  = await pool.query("SELECT COUNT(*) AS total FROM login_history WHERE DATE(login_at)=CURDATE()");
    const [[weekLogins]]   = await pool.query("SELECT COUNT(*) AS total FROM login_history WHERE login_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)");
    const [[monthLogins]]  = await pool.query("SELECT COUNT(*) AS total FROM login_history WHERE MONTH(login_at)=MONTH(NOW()) AND YEAR(login_at)=YEAR(NOW())");

    // Active sessions proxy: distinct users who logged in within last 30 minutes
    const [[activeSessions]] = await pool.query(
      "SELECT COUNT(DISTINCT user_id) AS total FROM login_history WHERE login_at >= DATE_SUB(NOW(), INTERVAL 30 MINUTE)"
    );

    // Audit log count
    const [[auditCount]] = await pool.query('SELECT COUNT(*) AS total FROM audit_logs');

    res.json({
      employees: {
        total:       empTotal.total,
        active:      empActive.total,
        inactive:    empInactive.total,
        departments: deptRows.map(r => r.department)
      },
      users: {
        total:   userTotal.total,
        admins:  adminTotal.total,
        regular: userOnly.total
      },
      logins: {
        today:      todayLogins.total,
        thisWeek:   weekLogins.total,
        thisMonth:  monthLogins.total,
        activeLast30Min: activeSessions.total
      },
      audit: {
        totalActions: auditCount.total
      }
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ message: 'Server error fetching stats.' });
  }
};

// ── GET /api/dashboard/login-history (admin: all | user: own) ─
const getLoginHistory = async (req, res) => {
  try {
    const page   = parseInt(req.query.page)  || 1;
    const limit  = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    let countQuery, dataQuery, countParams, dataParams;

    if (req.user.role === 'admin') {
      countQuery  = 'SELECT COUNT(*) AS total FROM login_history';
      dataQuery   = `SELECT id, user_id, user_name, user_email, user_role, ip_address, login_at
                     FROM login_history ORDER BY login_at DESC LIMIT ? OFFSET ?`;
      countParams = [];
      dataParams  = [limit, offset];
    } else {
      // Non-admin users can only see their own login history
      countQuery  = 'SELECT COUNT(*) AS total FROM login_history WHERE user_id = ?';
      dataQuery   = `SELECT id, user_id, user_name, user_email, user_role, ip_address, login_at
                     FROM login_history WHERE user_id = ? ORDER BY login_at DESC LIMIT ? OFFSET ?`;
      countParams = [req.user.id];
      dataParams  = [req.user.id, limit, offset];
    }

    const [[{ total }]] = await pool.query(countQuery, countParams);
    const [rows]        = await pool.query(dataQuery, dataParams);

    res.json({
      history: rows,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    console.error('Login history error:', err);
    res.status(500).json({ message: 'Server error fetching login history.' });
  }
};

// ── GET /api/dashboard/login-chart (admin only) ───────────────
const getLoginChart = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT DATE(login_at) AS date, COUNT(*) AS count
      FROM login_history
      WHERE login_at >= DATE_SUB(CURDATE(), INTERVAL 13 DAY)
      GROUP BY DATE(login_at)
      ORDER BY date ASC
    `);

    const result = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const found = rows.find(r => new Date(r.date).toISOString().split('T')[0] === dateStr);
      result.push({ date: dateStr, count: found ? Number(found.count) : 0 });
    }

    res.json({ chart: result });
  } catch (err) {
    console.error('Login chart error:', err);
    res.status(500).json({ message: 'Server error fetching chart data.' });
  }
};

// ── GET /api/dashboard/audit-logs (admin only) ────────────────
const getAuditLogs = async (req, res) => {
  try {
    const page   = parseInt(req.query.page)  || 1;
    const limit  = parseInt(req.query.limit) || 15;
    const offset = (page - 1) * limit;

    const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM audit_logs');
    const [rows] = await pool.query(
      `SELECT id, admin_id, admin_name, action, target_type, target_id, details, ip_address, created_at
       FROM audit_logs ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    res.json({
      logs: rows,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    console.error('Audit logs error:', err);
    res.status(500).json({ message: 'Server error fetching audit logs.' });
  }
};

module.exports = { getStats, getLoginHistory, getLoginChart, getAuditLogs };
