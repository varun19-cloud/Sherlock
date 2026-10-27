const mongoose = require('mongoose');

const clueSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  type: { type: String, enum: ['physical', 'testimony', 'document', 'digital', 'trace'], default: 'physical' },
  isHidden: { type: Boolean, default: true },
  xpReward: { type: Number, default: 50 },
  relatedSuspects: [{ type: String }],
  relatedClues: [{ type: String }],
  imageHotspot: {
    x: Number,
    y: Number,
    width: Number,
    height: Number,
  },
});

const suspectSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  age: { type: Number },
  occupation: { type: String },
  background: { type: String },
  motive: { type: String },
  alibi: { type: String },
  imageUrl: { type: String },
  isGuilty: { type: Boolean, default: false, select: false }, // never expose
  statements: [{ type: String }],
  revealedByClues: [{ type: String }],
});

const timelineEventSchema = new mongoose.Schema({
  id: { type: String, required: true },
  time: { type: String, required: true },
  description: { type: String, required: true },
  correctOrder: { type: Number, required: true },
  relatedClues: [{ type: String }],
});

const hintSchema = new mongoose.Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  order: { type: Number, required: true },
  xpPenalty: { type: Number, default: 25 },
});

const caseSchema = new mongoose.Schema(
  {
    caseId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    subtitle: { type: String },
    description: { type: String, required: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard', 'Expert'], default: 'Medium' },
    estimatedTime: { type: String, default: '30-45 min' },
    category: { type: String, default: 'Mystery' },
    setting: { type: String },
    crimeSceneDescription: { type: String },
    crimeSceneImageUrl: { type: String },
    suspects: [suspectSchema],
    clues: [clueSchema],
    timelineEvents: [timelineEventSchema],
    hints: [hintSchema],
    solution: {
      culpritId: { type: String, select: false }, // never expose in list
      explanation: { type: String, select: false },
      keyEvidence: [{ type: String, select: false }],
    },
    scoring: {
      baseXP: { type: Number, default: 500 },
      maxScore: { type: Number, default: 1000 },
      timeBonus: { type: Boolean, default: true },
    },
    isActive: { type: Boolean, default: true },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Case', caseSchema);
