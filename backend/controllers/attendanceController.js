const Attendance = require('../models/Attendance');
const Log = require('../models/Log');
const { googleSheetsClient } = require('../config/googleSheets');
const { createLog } = require('./logController');

const { sheets } = googleSheetsClient();

const createMapsLink = (latitude, longitude) => {
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
};

const getISTTime = (date = new Date()) => {
  // const istOffset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds
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

const updateGoogleSheet = async (employeeId, employeeName, attendance, status) => {
  const start = new Date(attendance.inTime);
  start.setHours(0, 0, 0, 0);

  const inTimeFormatted = attendance.inTime ? formatDateForSheet(getISTTime(new Date(attendance.inTime))) : '';
  const outTimeFormatted = attendance.outTime ? formatDateForSheet(getISTTime(new Date(attendance.outTime))) : '';

  const sheetData = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: 'Sheet2!A:L',
  });
  const rows = sheetData.data.values;
  const rowIndex = rows.findIndex(row => row[0] === employeeId && row[2] && new Date(row[2]).toDateString() === start.toDateString());

  const updatedRow = [
    employeeId,
    employeeName,
    inTimeFormatted,
    attendance.geoLocationIn,
    attendance.photoUrlIn,
    'IN',
    status || 'normal',
    outTimeFormatted,
    attendance.geoLocationOut,
    attendance.photoUrlOut,
    'OUT'
  ];

  if (rowIndex !== -1) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `Sheet2!A${rowIndex + 1}:L${rowIndex + 1}`, // Update the range as necessary
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [updatedRow],
      },
    });
  } else {
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'Sheet2!A:L', // Adjust range as necessary
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [updatedRow],
      },
    });
  }
};

const createAttendance = async (req, res) => {
  const { employeeId, employeeName, geoLocation, photo, type, status } = req.body;

  try {
    const mapsLink = createMapsLink(geoLocation.latitude, geoLocation.longitude);
    const currentTimeIST = getISTTime();

    // Start and end of the current day in IST
    const start = new Date(currentTimeIST);
    start.setHours(0, 0, 0, 0);
    const end = new Date(currentTimeIST);
    end.setHours(23, 59, 59, 999);

    let attendance = await Attendance.findOne({
      employeeId,
      inTime: { $gte: start, $lte: end }
    });

    if (!attendance) {
      attendance = new Attendance({
        employeeId,
        employeeName,
        inTime: type === 'IN' ? formatDateForMongo(currentTimeIST) : null,
        outTime: type === 'OUT' ? formatDateForMongo(currentTimeIST) : null,
        geoLocationIn: type === 'IN' ? mapsLink : null,
        geoLocationOut: type === 'OUT' ? mapsLink : null,
        photoUrlIn: type === 'IN' ? photo : null,
        photoUrlOut: type === 'OUT' ? photo : null,
        status: status || 'normal',
      });
    } else {
      if (type === 'IN') {
        attendance.inTime = formatDateForMongo(currentTimeIST);
        attendance.geoLocationIn = mapsLink;
        attendance.photoUrlIn = photo;
      } else if (type === 'OUT') {
        attendance.outTime = formatDateForMongo(currentTimeIST);
        attendance.geoLocationOut = mapsLink;
        attendance.photoUrlOut = photo;
      }
      attendance.status = status || 'normal';
    }
    await attendance.save();
    await createLog(employeeId, employeeName, `Checked ${type}`, status || 'normal', mapsLink, photo, formatDateForMongo(currentTimeIST), null);

    await updateGoogleSheet(employeeId, employeeName, attendance, status);

    res.status(200).json({ success: true, attendance });
  } catch (error) {
    console.error('Error recording attendance:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateAttendance = async (req, res) => {
  const { employeeId, type, action, status } = req.body;
  try {
    let attendance = await Attendance.findOne({ employeeId });
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    if (action === 'clear' || action === 'delete') {
      if (type === 'IN') {
        attendance.inTime = null;
        attendance.geoLocationIn = null;
        attendance.photoUrlIn = null;
      } else if (type === 'OUT') {
        attendance.outTime = null;
        attendance.geoLocationOut = null;
        attendance.photoUrlOut = null;
      }
      await attendance.save();
      await createLog(employeeId, attendance.employeeName, `${type} ${action}`, status || 'normal', attendance.geoLocationIn, attendance.photoUrlIn, attendance.inTime, attendance.outTime);
    } else if (action === 'append') {
      attendance.status = status;
      await attendance.save();
      await createLog(employeeId, attendance.employeeName, 'Append', status, attendance.geoLocationIn, attendance.photoUrlIn, attendance.inTime, attendance.outTime);
    }

    res.status(200).json({ success: true, attendance });
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({ success: false, message: 'Error updating attendance' });
  }
};

const getAttendanceByEmployeeId = async (req, res) => {
  const { employeeId } = req.params;
  try {
    const attendance = await Attendance.findOne({ employeeId });
    res.status(200).json(attendance);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ message: 'Error fetching attendance' });
  }
};

const updateAttendanceFromLog = async (req, res) => {
  const { logId, employeeId, action } = req.body;
  try {
    const log = await Log.findById(logId);
    if (!log) {
      return res.status(404).json({ message: 'Log not found' });
    }

    let attendance = await Attendance.findOne({
      employeeId,
      inTime: { $gte: new Date(log.timestamp).setHours(0, 0, 0, 0), $lte: new Date(log.timestamp).setHours(23, 59, 59, 999) }
    });

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    if (action === 'CheckIn') {
      attendance.inTime = formatDateForMongo(new Date(log.timestamp));
      attendance.geoLocationIn = log.geoLocation;
      attendance.photoUrlIn = log.photoUrl;
    } else if (action === 'CheckOut') {
      attendance.outTime = formatDateForMongo(new Date(log.timestamp));
      attendance.geoLocationOut = log.geoLocation;
      attendance.photoUrlOut = log.photoUrl;
    }
    attendance.status = 'Append';
    await attendance.save();

    await updateGoogleSheet(employeeId, attendance.employeeName, attendance, attendance.status);

    res.status(200).json({ success: true, attendance });
  } catch (error) {
    console.error('Error updating attendance from log:', error);
    res.status(500).json({ success: false, message: 'Error updating attendance from log' });
  }
};

module.exports = { createAttendance, updateAttendance, updateAttendanceFromLog, getAttendanceByEmployeeId };
