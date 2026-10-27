const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, maxlength: 100 },
    content: { type: String, required: true, maxlength: 2000 },
    color: { type: String, default: '#1a1a2e' },
  },
  { timestamps: true }
);

const connectionSchema = new mongoose.Schema({
  clueIdA: { type: String, required: true },
  clueIdB: { type: String, required: true },
  label: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

const investigationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    caseId: { type: String, required: true },
    status: {
      type: String,
      enum: ['active', 'completed', 'abandoned'],
      default: 'active',
    },
    discoveredClues: [{ type: String }], // array of clue IDs
    connections: [connectionSchema],
    notes: [noteSchema],
    timelineSubmission: {
      order: [{ type: String }], // ordered event IDs
      isCorrect: { type: Boolean },
      submittedAt: { type: Date },
      score: { type: Number, default: 0 },
    },
    accusation: {
      suspectId: { type: String },
      reasoning: { type: String },
      isCorrect: { type: Boolean },
      submittedAt: { type: Date },
      revealed: { type: Boolean, default: false },
    },
    hintsUsed: [{ type: String }], // hint IDs
    score: { type: Number, default: 0 },
    xpEarned: { type: Number, default: 0 },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    // Clue XP tracking to prevent double-rewards
    clueXpAwarded: [{ type: String }],
    // Board positions for evidence board
    boardPositions: {
      type: Map,
      of: new mongoose.Schema(
        { x: Number, y: Number },
        { _id: false }
      ),
      default: {},
    },
  },
  { timestamps: true }
);

// Index for fast user+case lookup
investigationSchema.index({ userId: 1, caseId: 1 });

module.exports = mongoose.model('Investigation', investigationSchema);
