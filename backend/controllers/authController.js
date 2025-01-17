const jwt = require('jsonwebtoken');
const { googleSheetsClient } = require('../config/googleSheets');
const validateUser = require('../utils/validateUser');
const { createLog } = require('./logController');

// Cache for storing user data
let userCache = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function getUserData(sheets) {
  const currentTime = Date.now();
  if (userCache && currentTime - lastFetchTime < CACHE_DURATION) {
    return userCache;
  }

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: 'Sheet1!A2:D', // Adjust the range as needed
  });

  userCache = response.data.values || [];
  lastFetchTime = currentTime;
  return userCache;
}

const login = async (req, res, next) => {
  try {
    const { employeeId, password } = req.body;
    const { sheets } = googleSheetsClient();

    const rows = await getUserData(sheets);
    const user = validateUser(rows, employeeId, password);

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.employeeId },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    await createLog(user.employeeId, user.name, 'login');

    res.json({ token, user });
  } catch (err) {
    console.error('Error in login:', err);
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    const { employeeId, name } = req.body;
    await createLog(employeeId, name, 'logout');
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Error in logout:', err);
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { employeeId, currentPassword, newPassword } = req.body;
    const { sheets } = googleSheetsClient();

    const rows = await getUserData(sheets);
    const user = validateUser(rows, employeeId, currentPassword);

    if (!user) {
      return res.status(401).json({ message: 'Invalid current password' });
    }

    const userRowIndex = rows.findIndex(row => row[0] === employeeId) + 2;

    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `Sheet1!D${userRowIndex}`,
      valueInputOption: 'RAW',
      resource: {
        values: [[newPassword]],
      },
    });

    // Invalidate the cache after password change
    userCache = null;

    await createLog(employeeId, user.name, 'change_password');

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Error in changing password:', err);
    next(err);
  }
};

module.exports = { login, logout, changePassword };

