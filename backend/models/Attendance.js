const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
  },
  employeeName: {
    type: String,
    required: true,
  },
  inTime: {
    type: Date,
  },
  outTime: {
    type: Date,
  },
  geoLocationIn: {
    type: String,
  },
  geoLocationOut: {
    type: String,
  },
  photoUrlIn: {
    type: String,
  },
  photoUrlOut: {
    type: String,
  },
});

module.exports = mongoose.model('Attendance', AttendanceSchema);
