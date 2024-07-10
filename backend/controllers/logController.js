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
  const { employeeId, action } = req.params;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  console.log("action",action)
  const query = {
    employeeId,
    action: 'login',
    timestamp: { $gte: start, $lte: end }
  };

  console.log(`Fetching logs for employeeId: ${employeeId}, action: ${action}`);
  console.log(`Query:`, query);

  try {
    const logs = await Log.find(query).sort({ timestamp: -1 });
    console.log(`Logs found:`, logs);
    res.status(200).json({ logs });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ message: 'Error fetching logs' });
  }
};

module.exports = { createLog, getLogs };
