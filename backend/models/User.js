const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  employeeId: { type: String, required: true },
  department: { type: String, required: true },
});

module.exports = mongoose.model('User', UserSchema);
