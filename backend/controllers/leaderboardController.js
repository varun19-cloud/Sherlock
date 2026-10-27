const mongoose = require('mongoose');
const User = require('../models/User');
const Investigation = require('../models/Investigation');
const { users, investigations, isDbConnected } = require('../services/memoryStore');

// GET /api/leaderboard
const getLeaderboard = async (req, res, next) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    if (isDbConnected(mongoose)) {
      const players = await User.find({ isActive: true, casesCompleted: { $gt: 0 } })
        .select('username xp rank casesCompleted totalScore')
        .sort({ xp: -1, casesCompleted: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await User.countDocuments({ isActive: true, casesCompleted: { $gt: 0 } });

      const leaderboard = players.map((p, idx) => ({
        rank: skip + idx + 1,
        username: p.username,
        xp: p.xp,
        detectiveRank: p.rank,
        casesCompleted: p.casesCompleted,
        totalScore: p.totalScore,
      }));

      return res.json({ success: true, total, page: parseInt(page), leaderboard });
    }

    // In-memory fallback
    const allUsers = Array.from(users.values())
      .filter((u) => u.isActive)
      .sort((a, b) => b.xp - a.xp);

    const paginated = allUsers.slice(skip, skip + parseInt(limit));
    const leaderboard = paginated.map((p, idx) => ({
      rank: skip + idx + 1,
      username: p.username,
      xp: p.xp,
      detectiveRank: p.rank,
      casesCompleted: p.casesCompleted,
      totalScore: p.totalScore,
    }));

    res.json({ success: true, total: allUsers.length, page: parseInt(page), leaderboard });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/dashboard
const getDashboard = async (req, res, next) => {
  try {
    const user = req.user;

    let userInvs = [];
    if (isDbConnected(mongoose)) {
      userInvs = await Investigation.find({ userId: user._id })
        .sort({ updatedAt: -1 })
        .limit(20);
    } else {
      userInvs = Array.from(investigations.values())
        .filter((i) => i.userId.toString() === user._id.toString());
    }

    const active = userInvs.filter((i) => i.status === 'active');
    const completed = userInvs.filter((i) => i.status === 'completed');

    const avgScore =
      completed.length > 0
        ? Math.round(completed.reduce((s, i) => s + (i.score || 0), 0) / completed.length)
        : 0;

    res.json({
      success: true,
      user: user.toPublicJSON ? user.toPublicJSON() : user,
      stats: {
        casesActive: active.length,
        casesCompleted: completed.length,
        avgScore,
        totalXP: user.xp,
      },
      activeInvestigations: active,
      completedInvestigations: completed,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getLeaderboard, getDashboard };
