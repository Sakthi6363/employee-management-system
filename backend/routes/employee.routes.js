const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getDepartments
} = require('../controllers/employee.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

const employeeValidation = [
  body('first_name').trim().notEmpty().withMessage('First name is required.'),
  body('last_name').trim().notEmpty().withMessage('Last name is required.'),
  body('email').isEmail().withMessage('Valid email is required.').normalizeEmail(),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number required.'),
  body('salary').optional().isFloat({ min: 0 }).withMessage('Salary must be a positive number.')
];

// All routes require authentication
router.use(verifyToken);

// GET /api/employees
router.get('/', getEmployees);

// GET /api/employees/departments
router.get('/departments', getDepartments);

// GET /api/employees/:id
router.get('/:id', getEmployee);

// POST /api/employees (admin only)
router.post('/', isAdmin, employeeValidation, createEmployee);

// PUT /api/employees/:id (admin only)
router.put('/:id', isAdmin, employeeValidation, updateEmployee);

// DELETE /api/employees/:id (admin only)
router.delete('/:id', isAdmin, deleteEmployee);

module.exports = router;
