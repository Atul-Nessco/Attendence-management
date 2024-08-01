const express = require('express');
const { getMonthlyReport } = require('../controllers/reportController');
const router = express.Router();

router.get('/monthly-report', getMonthlyReport);

module.exports = router;
