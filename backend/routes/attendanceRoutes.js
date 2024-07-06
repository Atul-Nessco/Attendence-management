const express = require('express');
const { createAttendance, updateAttendance, getAttendanceByEmployeeId, getLogsByEmployeeId } = require('../controllers/attendanceController');
const { uploadPhoto } = require('../controllers/photoController');
const router = express.Router();

router.post('/attendance', createAttendance);
router.post('/attendance/update', updateAttendance);
router.get('/attendance/:employeeId', getAttendanceByEmployeeId);
router.post('/upload-photo', uploadPhoto);
router.get('/logs/:employeeId/:date', getLogsByEmployeeId); // Ensure this route is defined
router.get('/logs/:employeeId', getLogsByEmployeeId); // Ensure this route is defined

module.exports = router;
