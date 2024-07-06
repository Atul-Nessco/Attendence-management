const Log = require('../models/Log');

const getISTTime = () => {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds
  const istTime = new Date(now.getTime() + istOffset);
  const formattedTime = istTime.toISOString().slice(0, 19).replace('T', ' ');
  return formattedTime;
};

const createLog = async (employeeId, employeeName, action, status = 'normal') => {
  try {
    const timestampIST = getISTTime();
    const log = new Log({
      employeeId,
      employeeName,
      action,
      timestamp: timestampIST,
      status,
    });
    await log.save();
  } catch (error) {
    console.error('Error creating log:', error);
  }
};

module.exports = { createLog };
