const bcrypt = require('bcryptjs');
const cases = require('./caseData');

// In-memory collections for offline/demo operation when MongoDB daemon is not running
const users = new Map();
const investigations = new Map();

// Helper to check if Mongoose is connected
const isDbConnected = (mongoose) => {
  return mongoose && mongoose.connection && mongoose.connection.readyState === 1;
};

// Seed a default detective if in-memory
const getOrCreateDemoUser = async () => {
  let demo = Array.from(users.values()).find((u) => u.email === 'detective@mindmaze.local');
  if (!demo) {
    const passwordHash = await bcrypt.hash('Detective123!', 10);
    demo = {
      _id: 'demo_user_001',
      username: 'sherlock_holmes',
      email: 'detective@mindmaze.local',
      password: passwordHash,
      xp: 1200,
      rank: 'Junior Detective',
      casesCompleted: 1,
      totalScore: 920,
      achievements: [
        { id: 'first_case', name: 'First Case Closed', description: 'Complete your first investigation.', icon: '🔍', unlockedAt: new Date() },
      ],
      isActive: true,
      createdAt: new Date(),
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
    users.set(demo._id, demo);
  }
  return demo;
};

// Initialize demo user
getOrCreateDemoUser();

module.exports = {
  users,
  investigations,
  cases,
  isDbConnected,
  getOrCreateDemoUser,
};
