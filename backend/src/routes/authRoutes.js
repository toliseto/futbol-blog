const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/users', requireAuth, requireAdmin, authController.listUsers);
router.delete('/users/:id', requireAuth, requireAdmin, authController.removeUser);

module.exports = router;
