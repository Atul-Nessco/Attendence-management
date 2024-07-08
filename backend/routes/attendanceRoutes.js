const express = require('express');
const { createAttendance, updateAttendance, updateAttendanceFromLog, getAttendanceByEmployeeId } = require('../controllers/attendanceController');
const { uploadPhoto } = require('../controllers/photoController');
const { getLogs } = require('../controllers/logController');
const router = express.Router();

router.post('/attendance', createAttendance);
router.post('/attendance/update', updateAttendance);
router.post('/attendance/updateFromLog', updateAttendanceFromLog);
router.get('/attendance/:employeeId', getAttendanceByEmployeeId);
router.post('/upload-photo', uploadPhoto);
router.get('/logs/:employeeId/:date', getLogs);
router.get('/logs/:employeeId', getLogs);

module.exports = router;
