const jwt = require('jsonwebtoken');
const { googleSheetsClient } = require('../config/googleSheets');
const validateUser = require('../utils/validateUser');
const { createLog } = require('./logController');

const login = async (req, res, next) => {
  try {
    const { employeeId, password } = req.body;
    console.log(`Login attempt for employeeId: ${employeeId}`);

    const { sheets } = googleSheetsClient();
    console.log('Google Sheets client initialized');

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'Sheet1!A2:D', // Adjust the range as needed
    });
    console.log('Google Sheets data fetched');

    const rows = response.data.values;
    console.log(`Fetched rows: ${rows.length}`);

    const user = validateUser(rows, employeeId, password);
    if (!user) {
      console.log('Invalid credentials');
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    console.log('User validated');

    const token = jwt.sign({ id: user.id, email: user.employeeId }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('JWT token generated');

    // Create a log entry for the login action
    await createLog(user.employeeId, user.name, 'login');
    console.log('Log entry created');

    res.json({ token, user });
  } catch (err) {
    console.error('Error in login:', err);
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    const { employeeId, name } = req.body;

    // Create a log entry for the logout action
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
    console.log(`Password change attempt for employeeId: ${employeeId}`);

    const { sheets } = googleSheetsClient();
    console.log('Google Sheets client initialized');

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'Sheet1!A2:D', // Adjust the range as needed
    });
    console.log('Google Sheets data fetched');

    const rows = response.data.values;
    console.log(`Fetched rows: ${rows.length}`);

    const user = validateUser(rows, employeeId, currentPassword);
    if (!user) {
      console.log('Invalid current password');
      return res.status(401).json({ message: 'Invalid current password' });
    }
    console.log('Current password validated');

    const userRowIndex = rows.findIndex(row => row[0] === employeeId) + 2; // Adjust index for 1-based row numbers and headers

    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `Sheet1!D${userRowIndex}`, // Column D for passwords
      valueInputOption: 'RAW',
      resource: {
        values: [[newPassword]],
      },
    });
    console.log('Password updated in Google Sheets');

    // Create a log entry for the password change action
    await createLog(employeeId, user.name, 'change_password');
    console.log('Log entry created for password change');

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Error in changing password:', err);
    next(err);
  }
};

module.exports = { login, logout, changePassword };