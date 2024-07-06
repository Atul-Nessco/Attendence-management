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

    let attendance = await Attendance.findOne({ employeeId, inTime: { $exists: true, $ne: null }, outTime: { $exists: false } });

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
      await createLog(employeeId, employeeName, `Checked ${type}`, status || 'normal');

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
      await createLog(employeeId, employeeName, `Checked ${type}`, status || 'normal');

      const sheetData = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: 'Sheet2!A:G',
      });
      const rows = sheetData.data.values;
      const rowIndex = rows.findIndex(row => row[0] === employeeId && row[5] === 'IN');
      if (rowIndex !== -1) {
        const updatedRow = [
          ...rows[rowIndex].slice(0, 6), // Keep the first 6 elements unchanged
          'OUT',
          currentTimeIST,
          mapsLink,
          photo,
          status || 'normal'
        ];
        await sheets.spreadsheets.values.update({
          spreadsheetId: process.env.SPREADSHEET_ID,
          range: `Sheet2!A${rowIndex + 2}:J${rowIndex + 2}`, // Update the range as necessary
          valueInputOption: 'USER_ENTERED',
          resource: {
            values: [updatedRow],
          },
        });
      } else {
        throw new Error('Attendance record for IN not found.');
      }

    } else {
      throw new Error('Invalid operation');
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
      await createLog(employeeId, attendance.employeeName, `${type} ${action}`, status || 'normal');
    } else if (action === 'append') {
      attendance.status = status;
      await attendance.save();
      await createLog(employeeId, attendance.employeeName, 'Append', status);
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

const getLogsByEmployeeId = async (req, res) => {
  const { employeeId, date } = req.params;
  const query = { employeeId };

  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    query.timestamp = { $gte: start, $lte: end };
  }

  try {
    const logs = await Log.find(query);
    res.status(200).json({ logs });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ message: 'Error fetching logs' });
  }
};

module.exports = { createAttendance, updateAttendance, getAttendanceByEmployeeId, getLogsByEmployeeId };
