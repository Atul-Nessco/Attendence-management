const Attendance = require('../models/Attendance');
const Log = require('../models/Log');
const { googleSheetsClient } = require('../config/googleSheets');
const { createLog } = require('./logController');

const { sheets } = googleSheetsClient();

const createMapsLink = (latitude, longitude) => {
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
};

const getISTTime = () => {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds
  const istTime = new Date(now.getTime() + istOffset);
  const formattedTime = istTime.toISOString().slice(0, 19).replace('T', ' ');
  return formattedTime;
};

const createAttendance = async (req, res) => {
  const { employeeId, employeeName, geoLocation, photo, type, status } = req.body;

  try {
    const mapsLink = createMapsLink(geoLocation.latitude, geoLocation.longitude);
    const currentTimeIST = getISTTime();

    // Check if attendance record exists for the same day
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    let attendance = await Attendance.findOne({ 
      employeeId, 
      inTime: { $gte: start, $lte: end }
    });

    if (!attendance && type === 'IN') {
      attendance = new Attendance({
        employeeId,
        employeeName,
        inTime: currentTimeIST,
        geoLocationIn: mapsLink,
        photoUrlIn: photo,
        status: status || 'normal',
      });
      await attendance.save();
      await createLog(employeeId, employeeName, `Checked ${type}`, status || 'normal', mapsLink, photo, currentTimeIST, null);

      await sheets.spreadsheets.values.append({
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: 'Sheet2!A:G', // Adjust range as necessary
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [[employeeId, employeeName, currentTimeIST, mapsLink, photo, 'IN', status || 'normal']],
        },
      });

    } else if (attendance && type === 'OUT') {
      attendance.outTime = currentTimeIST;
      attendance.geoLocationOut = mapsLink;
      attendance.photoUrlOut = photo;
      attendance.status = status || 'normal';
      await attendance.save();
      await createLog(employeeId, employeeName, `Checked ${type}`, status || 'normal', mapsLink, photo, attendance.inTime, currentTimeIST);

      const sheetData = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: 'Sheet2!A:G',
      });
      const rows = sheetData.data.values;
      const rowIndex = rows.findIndex(row => row[0] === employeeId && row[5] === 'IN');
      if (rowIndex !== -1) {
        const updatedRow = [
          employeeId,
          employeeName,
          attendance.inTime,
          attendance.geoLocationIn,
          attendance.photoUrlIn,
          'IN',
          status || 'normal',
          currentTimeIST,
          mapsLink,
          photo,
          'OUT',
          status || 'normal'
        ];
        await sheets.spreadsheets.values.update({
          spreadsheetId: process.env.SPREADSHEET_ID,
          range: `Sheet2!A${rowIndex + 2}:L${rowIndex + 2}`, // Update the range as necessary
          valueInputOption: 'USER_ENTERED',
          resource: {
            values: [updatedRow],
          },
        });
      } else {
        throw new Error('Attendance record for IN not found.');
      }

    } else {
      // Update existing IN record
      attendance.inTime = type === 'IN' ? currentTimeIST : attendance.inTime;
      attendance.geoLocationIn = type === 'IN' ? mapsLink : attendance.geoLocationIn;
      attendance.photoUrlIn = type === 'IN' ? photo : attendance.photoUrlIn;
      attendance.outTime = type === 'OUT' ? currentTimeIST : attendance.outTime;
      attendance.geoLocationOut = type === 'OUT' ? mapsLink : attendance.geoLocationOut;
      attendance.photoUrlOut = type === 'OUT' ? photo : attendance.photoUrlOut;
      attendance.status = status || 'normal';
      await attendance.save();

      await createLog(employeeId, employeeName, `Checked ${type}`, status || 'normal', mapsLink, photo, attendance.inTime, attendance.outTime);

      // Update Google Sheet
      const sheetData = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: 'Sheet2!A:G',
      });
      const rows = sheetData.data.values;
      const rowIndex = rows.findIndex(row => row[0] === employeeId && row[5] === 'IN');
      if (rowIndex !== -1) {
        const updatedRow = [
          employeeId,
          employeeName,
          attendance.inTime,
          attendance.geoLocationIn,
          attendance.photoUrlIn,
          'IN',
          status || 'normal',
          attendance.outTime,
          attendance.geoLocationOut,
          attendance.photoUrlOut,
          'OUT',
          status || 'normal'
        ];
        await sheets.spreadsheets.values.update({
          spreadsheetId: process.env.SPREADSHEET_ID,
          range: `Sheet2!A${rowIndex + 2}:L${rowIndex + 2}`, // Update the range as necessary
          valueInputOption: 'USER_ENTERED',
          resource: {
            values: [updatedRow],
          },
        });
      }
    }

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
      attendance.inTime = log.inTime;
      attendance.geoLocationIn = log.geoLocation;
      attendance.photoUrlIn = log.photoUrl;
    } else if (action === 'CheckOut') {
      attendance.outTime = log.timestamp;
      attendance.geoLocationOut = log.geoLocation;
      attendance.photoUrlOut = log.photoUrl;
    }
    attendance.status = 'Append';
    await attendance.save();

    const sheetData = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'Sheet2!A:L',
    });
    const rows = sheetData.data.values;
    const rowIndex = rows.findIndex(row => row[0] === employeeId && row[5] === 'IN');
    if (rowIndex !== -1) {
      const updatedRow = [
        employeeId,
        attendance.employeeName,
        attendance.inTime,
        attendance.geoLocationIn,
        attendance.photoUrlIn,
        'IN',
        attendance.status,
        attendance.outTime,
        attendance.geoLocationOut,
        attendance.photoUrlOut,
        'OUT',
        attendance.status
      ];
      await sheets.spreadsheets.values.update({
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: `Sheet2!A${rowIndex + 2}:L${rowIndex + 2}`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [updatedRow],
        },
      });
    }

    res.status(200).json({ success: true, attendance });
  } catch (error) {
    console.error('Error updating attendance from log:', error);
    res.status(500).json({ success: false, message: 'Error updating attendance from log' });
  }
};

module.exports = { createAttendance, updateAttendance, updateAttendanceFromLog, getAttendanceByEmployeeId };
