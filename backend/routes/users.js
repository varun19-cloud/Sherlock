const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getLeaderboard, getDashboard } = require('../controllers/leaderboardController');

router.get('/leaderboard', getLeaderboard);
router.get('/dashboard', authenticate, getDashboard);

module.exports = router;
