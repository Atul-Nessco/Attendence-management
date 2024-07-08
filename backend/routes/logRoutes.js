const express = require('express');
const router = express.Router();
const { getLogsByEmployeeIdAndDate } = require('../controllers/logController');

router.get('/:employeeId/:date', getLogsByEmployeeIdAndDate);

module.exports = router;
