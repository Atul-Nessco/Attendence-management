const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  action: { type: String, required: true },
  status: { type: String, default: 'normal' },
  timestamp: { type: Date, default: Date.now },
  geoLocation: { type: String },
  photoUrl: { type: String },
  inTime: { type: String },
  outTime: { type: String },
  locationStatusIn: { type: String, enum: ['inhouse', 'field'], default: 'field' },
  locationStatusOut: { type: String, enum: ['inhouse', 'field'], default: 'field' }
});

module.exports = mongoose.model('Log', logSchema);
