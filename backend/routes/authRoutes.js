const express = require('express');
const { login, logout, changePassword } = require('../controllers/authController');

const router = express.Router();

router.post('/login', login);
router.post('/logout', logout);
router.post('/change-password', changePassword);

module.exports = router;
