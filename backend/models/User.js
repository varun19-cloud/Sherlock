const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const achievementSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, default: '🏆' },
  unlockedAt: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [20, 'Username cannot exceed 20 characters'],
      match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    xp: { type: Number, default: 0 },
    rank: { type: String, default: 'Rookie Detective' },
    casesCompleted: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    achievements: [achievementSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Calculate and update rank based on XP
userSchema.methods.updateRank = function () {
  const xp = this.xp;
  if (xp >= 5000) this.rank = 'Chief Inspector';
  else if (xp >= 3000) this.rank = 'Senior Detective';
  else if (xp >= 1500) this.rank = 'Detective';
  else if (xp >= 500) this.rank = 'Junior Detective';
  else this.rank = 'Rookie Detective';
};

// Public profile (no password)
userSchema.methods.toPublicJSON = function () {
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
};

module.exports = mongoose.model('User', userSchema);
