const Log = require('../models/Log');

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
      timestamp: new Date().toISOString()
    });
    await log.save();
  } catch (error) {
    console.error('Error creating log:', error);
  }
};

const getLogs = async (req, res) => {
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

module.exports = { createLog, getLogs };
