const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const config = require('../config/config');
const User = require('../models/User');
const { users } = require('../services/memoryStore');

const isDbConnected = () => mongoose.connection && mongoose.connection.readyState === 1;

const authenticate = async (req, res, next) => {
  try {
    let token;

    // Check Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);

    let user;
    if (isDbConnected()) {
      user = await User.findById(decoded.id).select('-password');
    } else {
      user = users.get(decoded.id);
    }

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'User not found or inactive.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired.' });
    }
    next(error);
  }
};

module.exports = { authenticate };
