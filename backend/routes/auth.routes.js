const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, getProfile, changePassword } = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// POST /api/auth/register  — public, always creates 'user' role
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('email').isEmail().withMessage('Valid email is required.').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.')
], register);

// POST /api/auth/login  — supports email+password OR admin_id+password
router.post('/login', [
  body('password').notEmpty().withMessage('Password is required.')
], login);

// GET /api/auth/profile
router.get('/profile', verifyToken, getProfile);

// PUT /api/auth/change-password
router.put('/change-password', verifyToken, changePassword);

module.exports = router;
