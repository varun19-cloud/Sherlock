const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const config = require('../config/config');
const { users, isDbConnected } = require('../services/memoryStore');

const generateToken = (userId) => {
  return jwt.sign({ id: userId.toString() }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
};

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (isDbConnected(mongoose)) {
      const user = await User.create({ username, email, password });
      const token = generateToken(user._id);

      return res.status(201).json({
        success: true,
        message: 'Registration successful.',
        token,
        user: user.toPublicJSON(),
      });
    }

    // In-memory fallback
    const exists = Array.from(users.values()).find(
      (u) => u.email.toLowerCase() === email.toLowerCase() || u.username.toLowerCase() === username.toLowerCase()
    );
    if (exists) {
      return res.status(400).json({ success: false, message: 'Username or email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const id = 'user_' + Date.now();
    const newUser = {
      _id: id,
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      xp: 0,
      rank: 'Rookie Detective',
      casesCompleted: 0,
      totalScore: 0,
      achievements: [],
      isActive: true,
      createdAt: new Date(),
      updateRank() {
        const xp = this.xp;
        if (xp >= 5000) this.rank = 'Chief Inspector';
        else if (xp >= 3000) this.rank = 'Senior Detective';
        else if (xp >= 1500) this.rank = 'Detective';
        else if (xp >= 500) this.rank = 'Junior Detective';
        else this.rank = 'Rookie Detective';
      },
      toPublicJSON() {
        return {
          id: this._id,
          username: this.username,
          xp: this.xp,
          rank: this.rank,
          casesCompleted: this.casesCompleted,
          totalScore: this.totalScore,
          achievements: this.achievements,
          createdAt: this.createdAt,
        };
      },
    };
    users.set(id, newUser);

    const token = generateToken(id);
    res.status(201).json({
      success: true,
      message: 'Registration successful.',
      token,
      user: newUser.toPublicJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (isDbConnected(mongoose)) {
      const user = await User.findOne({ email, isActive: true }).select('+password');
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      const token = generateToken(user._id);
      return res.json({
        success: true,
        message: 'Login successful.',
        token,
        user: user.toPublicJSON(),
      });
    }

    // In-memory fallback
    const user = Array.from(users.values()).find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.isActive
    );
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id);
    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: user.toPublicJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user.toPublicJSON ? req.user.toPublicJSON() : req.user });
};

// PUT /api/auth/me
const updateProfile = async (req, res, next) => {
  try {
    const { username } = req.body;

    if (isDbConnected(mongoose)) {
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { username },
        { new: true, runValidators: true }
      );
      return res.json({ success: true, user: user.toPublicJSON() });
    }

    // In-memory fallback
    req.user.username = username;
    res.json({ success: true, user: req.user.toPublicJSON ? req.user.toPublicJSON() : req.user });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, updateProfile };
