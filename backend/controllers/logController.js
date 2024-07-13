const Log = require('../models/Log');
const Attendance = require('../models/Attendance');
const { googleSheetsClient } = require('../config/googleSheets');

const { sheets } = googleSheetsClient();

const getISTTime = (date = new Date()) => {
  return new Date(date.getTime());
};

const formatDateForMongo = (date) => {
  return date.toISOString();
};

const formatDateForSheet = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
};

const createLog = async (employeeId, employeeName, action, status, geoLocation, photoUrl, inTime, outTime) => {
  try {
    const log = new Log({
      employeeId,
      employeeName,
      action,
      status,
      geoLocation,
      photoUrl,
      inTime,
      outTime,
      timestamp: formatDateForMongo(new Date())
    });
    await log.save();
  } catch (error) {
    console.error('Error creating log:', error);
  }
};

const getLogs = async (req, res) => {
  const { employeeId, action } = req.params;
  const start = getISTTime();
  start.setHours(0, 0, 0, 0);
  const end = getISTTime();
  end.setHours(23, 59, 59, 999);

  let query = {
    employeeId,
    timestamp: { $gte: start, $lte: end }
  };

  if (action) {
    query.action = action;
  }

  try {
    const logs = await Log.find(query).sort({ timestamp: -1 });
    res.status(200).json({ logs });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ message: 'Error fetching logs' });
  }
};

const verifyEmployeeId = async (req, res) => {
  const { employeeId, inputEmployeeId } = req.body;
  try {
    if (employeeId === inputEmployeeId) {
      res.status(200).json({ verified: true });
    } else {
      res.status(401).json({ verified: false });
    }
  } catch (error) {
    console.error('Error verifying employee ID:', error);
    res.status(500).json({ message: 'Error verifying employee ID' });
  }
};

const updateLogSelection = async (req, res) => {
  console.log('Received request body:', req.body); // Log the request body

  const { logId } = req.body;

  if (!logId) {
    console.error('logId is required');
    return res.status(400).json({ message: 'logId is required' });
  }

  try {
    const log = await Log.findById(logId);
    if (!log) {
      console.error('Log not found');
      return res.status(404).json({ message: 'Log not found' });
    }

    // Update the main database (Attendance)
    const attendance = await Attendance.findOne({
      employeeId: log.employeeId,
      inTime: { $gte: new Date(log.timestamp).setHours(0, 0, 0, 0), $lte: new Date(log.timestamp).setHours(23, 59, 59, 999) }
    });

    if (!attendance) {
      console.error('Attendance record not found');
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    if (log.action === 'Checked IN') {
      attendance.inTime = formatDateForMongo(new Date(log.timestamp));
      attendance.geoLocationIn = log.geoLocation;
      attendance.photoUrlIn = log.photoUrl;
      attendance.locationStatusIn = log.locationStatusIn;
    } else if (log.action === 'Checked OUT') {
      attendance.outTime = formatDateForMongo(new Date(log.timestamp));
      attendance.geoLocationOut = log.geoLocation;
      attendance.photoUrlOut = log.photoUrl;
      attendance.locationStatusOut = log.locationStatusOut;
    }
    attendance.status = 'Append';
    await attendance.save();

    // Update Google Sheets
    const inTimeFormatted = attendance.inTime ? formatDateForSheet(getISTTime(new Date(attendance.inTime))) : '';
    const outTimeFormatted = attendance.outTime ? formatDateForSheet(getISTTime(new Date(attendance.outTime))) : '';

    const start = new Date(log.timestamp);
    start.setHours(0, 0, 0, 0);
    const sheetData = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'Sheet2!A:N', // Update the range to include the new columns
    });
    const rows = sheetData.data.values;
    const rowIndex = rows.findIndex(row => row[0] === log.employeeId && row[2] && new Date(row[2]).toDateString() === start.toDateString());

    const updatedRow = [
      attendance.employeeId,
      attendance.employeeName,
      inTimeFormatted,
      attendance.geoLocationIn,
      attendance.photoUrlIn,
      'IN',
      attendance.status,
      outTimeFormatted,
      attendance.geoLocationOut,
      attendance.photoUrlOut,
      'OUT',
      attendance.locationStatusIn || '', // Include the locationStatusIn or an empty string
      attendance.locationStatusOut || '' // Include the locationStatusOut or an empty string
    ];

    if (rowIndex !== -1) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: `Sheet2!A${rowIndex + 1}:N${rowIndex + 1}`, // Update the range as necessary
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [updatedRow],
        },
      });
    }

    res.status(200).json({ message: 'Log updated successfully' });
  } catch (error) {
    console.error('Error updating log:', error);
    res.status(500).json({ message: 'Error updating log' });
  }
};

module.exports = { createLog, getLogs, updateLogSelection, verifyEmployeeId };
