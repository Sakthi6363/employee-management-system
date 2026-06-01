const express = require('express');
const router = express.Router();
const { getStats, getLoginHistory, getLoginChart, getAuditLogs } = require('../controllers/dashboard.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

router.use(verifyToken);

// Admin-only endpoints
router.get('/stats',        isAdmin, getStats);
router.get('/login-chart',  isAdmin, getLoginChart);
router.get('/audit-logs',   isAdmin, getAuditLogs);

// Login history: admin sees all, user sees own
router.get('/login-history', getLoginHistory);

module.exports = router;
