const express = require('express');
const router = express.Router();
const { getUsers, updateUserRole, deleteUser, createAdminUser } = require('../controllers/user.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// All user management routes require admin
router.use(verifyToken, isAdmin);

router.get('/',              getUsers);
router.post('/create-admin', createAdminUser);
router.put('/:id/role',      updateUserRole);
router.delete('/:id',        deleteUser);

module.exports = router;
