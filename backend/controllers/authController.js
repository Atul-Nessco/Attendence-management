const jwt = require('jsonwebtoken');
const { googleSheetsClient } = require('../config/googleSheets');
const User = require('../models/User');
const { createLog } = require('./logController');
const { AppError } = require('../utils/appError');

// Cache configuration
let userCache = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Utility function to generate JWT
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h'
  });
};

async function getUserData(sheets) {
  try {
    const currentTime = Date.now();
    if (userCache && currentTime - lastFetchTime < CACHE_DURATION) {
      return userCache;
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'Sheet1!A2:D',
    });

    userCache = response.data.values || [];
    lastFetchTime = currentTime;
    return userCache;
  } catch (error) {
    throw new AppError('Failed to fetch user data from Google Sheets', 500);
  }
}

// Sync Google Sheets data with MongoDB
async function syncWithMongoDB(rows) {
  try {
    for (const row of rows) {
      const [employeeId, name, department, password] = row;
      await User.findOneAndUpdate(
        { employeeId },
        { 
          name,
          department,
          username: employeeId,
          password
        },
        { 
          upsert: true,
          new: true,
          setDefaultsOnInsert: true
        }
      );
    }
  } catch (error) {
    throw new AppError('Failed to sync data with MongoDB', 500);
  }
}

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        message: 'Please provide username and password' 
      });
    }

    // First try MongoDB
    const user = await User.findOne({ username });
    
    if (user && await user.comparePassword(password)) {
      const token = signToken(user._id);
      user.lastLogin = new Date();
      await user.save();
      await createLog(user.employeeId, user.name, 'login');

      return res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          employeeId: user.employeeId,
          department: user.department
        }
      });
    }

    // If not in MongoDB, try Google Sheets
    const { sheets } = googleSheetsClient();
    const rows = await getUserData(sheets);
    await syncWithMongoDB(rows);

    // Try MongoDB again after sync
    const syncedUser = await User.findOne({ username });
    
    if (syncedUser && await syncedUser.comparePassword(password)) {
      const token = signToken(syncedUser._id);
      syncedUser.lastLogin = new Date();
      await syncedUser.save();
      await createLog(syncedUser.employeeId, syncedUser.name, 'login');

      return res.json({
        token,
        user: {
          id: syncedUser._id,
          name: syncedUser.name,
          employeeId: syncedUser.employeeId,
          department: syncedUser.department
        }
      });
    }

    return res.status(401).json({ message: 'Invalid credentials' });
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const { employeeId, name } = req.body;
    await createLog(employeeId, name, 'logout');
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { employeeId, currentPassword, newPassword } = req.body;

    if (!employeeId || !currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: 'Please provide all required fields' 
      });
    }

    const user = await User.findOne({ employeeId });
    
    if (!user || !(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ message: 'Invalid current password' });
    }

    // Update password in MongoDB
    user.password = newPassword;
    await user.save();

    // Update password in Google Sheets
    const { sheets } = googleSheetsClient();
    const rows = await getUserData(sheets);
    const userRowIndex = rows.findIndex(row => row[0] === employeeId) + 2;

    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `Sheet1!D${userRowIndex}`,
      valueInputOption: 'RAW',
      resource: {
        values: [[newPassword]]
      }
    });

    userCache = null; // Invalidate cache
    await createLog(employeeId, user.name, 'change_password');

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

