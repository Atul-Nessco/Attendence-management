const express = require('express');
const router = express.Router();
const { getLogs } = require('../controllers/logController');

router.get('/:employeeId/:action', getLogs);

module.exports = router;
