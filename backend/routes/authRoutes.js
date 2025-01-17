const express = require('express');
const { login, logout, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/login', login);
router.post('/logout', protect, logout);
router.post('/change-password', protect, changePassword);

module.exports = router;

