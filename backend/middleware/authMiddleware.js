const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ 
        message: 'You are not logged in. Please log in to get access.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ 
        message: 'The user belonging to this token no longer exists.' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ 
      message: 'Invalid token. Please log in again.' 
    });
  }
};

