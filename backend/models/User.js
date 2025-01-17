const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: [true, 'Username is required'], 
    unique: true,
    trim: true 
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'] 
  },
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true 
  },
  employeeId: { 
    type: String, 
    required: [true, 'Employee ID is required'],
    unique: true,
    trim: true 
  },
  department: { 
    type: String, 
    required: [true, 'Department is required'],
    trim: true 
  },
  lastLogin: { 
    type: Date,
    default: null 
  }
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);

