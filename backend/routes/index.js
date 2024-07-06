const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const attendanceRoutes = require('./attendanceRoutes');

router.use('/auth', authRoutes);
router.use('/api', attendanceRoutes);

module.exports = router;
