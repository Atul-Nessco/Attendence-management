const express = require('express');
const { createAttendance, updateAttendance, updateAttendanceFromLog, getAttendanceByEmployeeId, getTodayAttendance } = require('../controllers/attendanceController');
const { uploadPhoto } = require('../controllers/photoController');
const { getLogs, updateLogSelection, verifyEmployeeId } = require('../controllers/logController'); // Add verifyEmployeeId here
const router = express.Router();

router.post('/attendance', createAttendance);
router.post('/attendance/update', updateAttendance);
router.post('/attendance/updateFromLog', updateAttendanceFromLog);
router.get('/attendance/:employeeId', getAttendanceByEmployeeId);
router.post('/upload-photo', uploadPhoto);
router.get('/logs/:employeeId/:action', getLogs); // Updated action to be part of params       
router.post('/logs/verify-employee-id', verifyEmployeeId); // New route for employee ID verification
router.post('/logs/update-selection', updateLogSelection);
router.get('/attendance/today/:employeeId', getTodayAttendance)

module.exports = router;