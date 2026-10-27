const mongoose = require('mongoose');
const Investigation = require('../models/Investigation');
const Case = require('../models/Case');
const User = require('../models/User');
const { calculateScore, getRank, calculateAchievements, evaluateTimeline } = require('../services/scoringService');
const { investigations, isDbConnected, cases } = require('../services/memoryStore');

// Helper: ensure investigation belongs to user
const getUserInvestigation = async (investigationId, userId) => {
  if (isDbConnected(mongoose)) {
    const inv = await Investigation.findById(investigationId);
    if (!inv) return null;
    if (inv.userId.toString() !== userId.toString()) return 'forbidden';
    return inv;
  }

  const inv = investigations.get(investigationId.toString());
  if (!inv) return null;
  if (inv.userId.toString() !== userId.toString()) return 'forbidden';
  return inv;
};

// Helper: get case doc
const getCaseDoc = async (caseId, withSolution = false) => {
  if (isDbConnected(mongoose)) {
    if (withSolution) {
      return await Case.findOne({ caseId })
        .select('+solution.culpritId +solution.explanation +solution.keyEvidence clues scoring');
    }
    return await Case.findOne({ caseId, isActive: true });
  }
  return cases.find((c) => c.caseId === caseId);
};

// POST /api/investigations
const createInvestigation = async (req, res, next) => {
  try {
    const { caseId } = req.body;

    const caseDoc = await getCaseDoc(caseId);
    if (!caseDoc) {
      return res.status(404).json({ success: false, message: 'Case not found.' });
    }

    if (isDbConnected(mongoose)) {
      let investigation = await Investigation.findOne({ userId: req.user._id, caseId, status: 'active' });
      if (investigation) {
        return res.json({ success: true, message: 'Investigation already active.', investigation });
      }
      investigation = await Investigation.create({ userId: req.user._id, caseId });
      return res.status(201).json({ success: true, investigation });
    }

    // In-memory fallback
    const active = Array.from(investigations.values()).find(
      (i) => i.userId.toString() === req.user._id.toString() && i.caseId === caseId && i.status === 'active'
    );
    if (active) {
      return res.json({ success: true, message: 'Investigation already active.', investigation: active });
    }

    const id = 'inv_' + Date.now();
    const newInv = {
      _id: id,
      userId: req.user._id,
      caseId,
      status: 'active',
      startedAt: new Date(),
      discoveredClues: [],
      clueXpAwarded: [],
      connections: [],
      boardPositions: {},
      timelineSubmission: null,
      notes: [],
      hintsUsed: [],
      score: 0,
      xpEarned: 0,
      save: async function () { return this; },
    };
    investigations.set(id, newInv);
    res.status(201).json({ success: true, investigation: newInv });
  } catch (error) {
    next(error);
  }
};

// GET /api/investigations/:id
const getInvestigation = async (req, res, next) => {
  try {
    const inv = await getUserInvestigation(req.params.id, req.user._id);
    if (!inv) return res.status(404).json({ success: false, message: 'Investigation not found.' });
    if (inv === 'forbidden') return res.status(403).json({ success: false, message: 'Access denied.' });

    res.json({ success: true, investigation: inv });
  } catch (error) {
    next(error);
  }
};

// GET /api/investigations (user's own)
const getMyInvestigations = async (req, res, next) => {
  try {
    if (isDbConnected(mongoose)) {
      const list = await Investigation.find({ userId: req.user._id }).sort({ updatedAt: -1 });
      return res.json({ success: true, investigations: list });
    }

    const list = Array.from(investigations.values())
      .filter((i) => i.userId.toString() === req.user._id.toString())
      .sort((a, b) => (b.startedAt || 0) - (a.startedAt || 0));
    res.json({ success: true, investigations: list });
  } catch (error) {
    next(error);
  }
};

// POST /api/investigations/:id/clues/:clueId
const discoverClue = async (req, res, next) => {
  try {
    const { id, clueId } = req.params;

    const inv = await getUserInvestigation(id, req.user._id);
    if (!inv) return res.status(404).json({ success: false, message: 'Investigation not found.' });
    if (inv === 'forbidden') return res.status(403).json({ success: false, message: 'Access denied.' });
    if (inv.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Investigation is not active.' });
    }

    const caseDoc = await getCaseDoc(inv.caseId);
    const clue = caseDoc.clues.find((c) => c.id === clueId);
    if (!clue) return res.status(404).json({ success: false, message: 'Clue not found in this case.' });

    const alreadyDiscovered = inv.discoveredClues.includes(clueId);
    let xpAwarded = 0;

    if (!alreadyDiscovered) {
      inv.discoveredClues.push(clueId);
    }

    if (!inv.clueXpAwarded.includes(clueId)) {
      xpAwarded = clue.xpReward;
      inv.clueXpAwarded.push(clueId);

      if (isDbConnected(mongoose)) {
        const user = await User.findById(req.user._id);
        user.xp += xpAwarded;
        user.updateRank();
        await user.save();
      } else {
        req.user.xp += xpAwarded;
        if (req.user.updateRank) req.user.updateRank();
      }
    }

    await inv.save();

    res.json({
      success: true,
      alreadyDiscovered,
      xpAwarded,
      clue: {
        id: clue.id,
        name: clue.name,
        description: clue.description,
        location: clue.location,
        type: clue.type,
        relatedSuspects: clue.relatedSuspects,
        relatedClues: clue.relatedClues,
      },
      discoveredClues: inv.discoveredClues,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/investigations/:id/timeline
const submitTimeline = async (req, res, next) => {
  try {
    const { order } = req.body;

    const inv = await getUserInvestigation(req.params.id, req.user._id);
    if (!inv) return res.status(404).json({ success: false, message: 'Investigation not found.' });
    if (inv === 'forbidden') return res.status(403).json({ success: false, message: 'Access denied.' });
    if (inv.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Investigation is not active.' });
    }

    const caseDoc = await getCaseDoc(inv.caseId);
    const { isCorrect, score, correctOrder } = evaluateTimeline(order, caseDoc.timelineEvents);

    inv.timelineSubmission = {
      order,
      isCorrect,
      submittedAt: new Date(),
      score,
    };
    await inv.save();

    res.json({
      success: true,
      isCorrect,
      score,
      correctOrder: isCorrect ? correctOrder : undefined,
      feedback: isCorrect
        ? 'Perfect! Your timeline reconstruction is correct.'
        : `Your timeline scored ${score}%. Keep investigating to refine your understanding.`,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/investigations/:id/connections
const addConnection = async (req, res, next) => {
  try {
    const { clueIdA, clueIdB, label } = req.body;

    if (clueIdA === clueIdB) {
      return res.status(400).json({ success: false, message: 'Cannot connect a clue to itself.' });
    }

    const inv = await getUserInvestigation(req.params.id, req.user._id);
    if (!inv) return res.status(404).json({ success: false, message: 'Investigation not found.' });
    if (inv === 'forbidden') return res.status(403).json({ success: false, message: 'Access denied.' });

    const exists = inv.connections.find(
      (c) =>
        (c.clueIdA === clueIdA && c.clueIdB === clueIdB) ||
        (c.clueIdA === clueIdB && c.clueIdB === clueIdA)
    );
    if (exists) {
      return res.status(409).json({ success: false, message: 'Connection already exists.' });
    }

    const newConn = {
      _id: 'conn_' + Date.now(),
      clueIdA,
      clueIdB,
      label: label || '',
      createdAt: new Date(),
    };
    inv.connections.push(newConn);
    await inv.save();

    res.status(201).json({ success: true, connections: inv.connections });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/investigations/:id/connections/:connectionId
const removeConnection = async (req, res, next) => {
  try {
    const inv = await getUserInvestigation(req.params.id, req.user._id);
    if (!inv) return res.status(404).json({ success: false, message: 'Investigation not found.' });
    if (inv === 'forbidden') return res.status(403).json({ success: false, message: 'Access denied.' });

    inv.connections = inv.connections.filter(
      (c) => c._id.toString() !== req.params.connectionId.toString()
    );
    await inv.save();
    res.json({ success: true, connections: inv.connections });
  } catch (error) {
    next(error);
  }
};

// PUT /api/investigations/:id/board
const updateBoardPositions = async (req, res, next) => {
  try {
    const { positions } = req.body;

    const inv = await getUserInvestigation(req.params.id, req.user._id);
    if (!inv) return res.status(404).json({ success: false, message: 'Investigation not found.' });
    if (inv === 'forbidden') return res.status(403).json({ success: false, message: 'Access denied.' });

    if (inv.boardPositions instanceof Map) {
      inv.boardPositions = new Map(Object.entries(positions));
    } else {
      inv.boardPositions = positions;
    }
    await inv.save();

    const output = inv.boardPositions instanceof Map ? Object.fromEntries(inv.boardPositions) : inv.boardPositions;
    res.json({ success: true, boardPositions: output });
  } catch (error) {
    next(error);
  }
};

// GET /api/investigations/:id/notes
const getNotes = async (req, res, next) => {
  try {
    const inv = await getUserInvestigation(req.params.id, req.user._id);
    if (!inv) return res.status(404).json({ success: false, message: 'Investigation not found.' });
    if (inv === 'forbidden') return res.status(403).json({ success: false, message: 'Access denied.' });

    res.json({ success: true, notes: inv.notes });
  } catch (error) {
    next(error);
  }
};

// POST /api/investigations/:id/notes
const addNote = async (req, res, next) => {
  try {
    const { title, content, color } = req.body;

    const inv = await getUserInvestigation(req.params.id, req.user._id);
    if (!inv) return res.status(404).json({ success: false, message: 'Investigation not found.' });
    if (inv === 'forbidden') return res.status(403).json({ success: false, message: 'Access denied.' });

    const newNote = {
      _id: 'note_' + Date.now(),
      title,
      content,
      color: color || 'amber',
      createdAt: new Date(),
    };
    inv.notes.push(newNote);
    await inv.save();

    res.status(201).json({ success: true, notes: inv.notes });
  } catch (error) {
    next(error);
  }
};

// PUT /api/investigations/:id/notes/:noteId
const updateNote = async (req, res, next) => {
  try {
    const { title, content, color } = req.body;

    const inv = await getUserInvestigation(req.params.id, req.user._id);
    if (!inv) return res.status(404).json({ success: false, message: 'Investigation not found.' });
    if (inv === 'forbidden') return res.status(403).json({ success: false, message: 'Access denied.' });

    let note = inv.notes.id ? inv.notes.id(req.params.noteId) : inv.notes.find((n) => n._id.toString() === req.params.noteId.toString());
    if (!note) return res.status(404).json({ success: false, message: 'Note not found.' });

    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (color !== undefined) note.color = color;

    await inv.save();
    res.json({ success: true, notes: inv.notes });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/investigations/:id/notes/:noteId
const deleteNote = async (req, res, next) => {
  try {
    const inv = await getUserInvestigation(req.params.id, req.user._id);
    if (!inv) return res.status(404).json({ success: false, message: 'Investigation not found.' });
    if (inv === 'forbidden') return res.status(403).json({ success: false, message: 'Access denied.' });

    inv.notes = inv.notes.filter((n) => n._id.toString() !== req.params.noteId.toString());
    await inv.save();
    res.json({ success: true, notes: inv.notes });
  } catch (error) {
    next(error);
  }
};

// POST /api/investigations/:id/hints/:hintId
const useHint = async (req, res, next) => {
  try {
    const { id, hintId } = req.params;

    const inv = await getUserInvestigation(id, req.user._id);
    if (!inv) return res.status(404).json({ success: false, message: 'Investigation not found.' });
    if (inv === 'forbidden') return res.status(403).json({ success: false, message: 'Access denied.' });

    const caseDoc = await getCaseDoc(inv.caseId);
    const hint = caseDoc.hints.find((h) => h.id === hintId);
    if (!hint) return res.status(404).json({ success: false, message: 'Hint not found.' });

    const alreadyUsed = inv.hintsUsed.includes(hintId);
    if (!alreadyUsed) {
      inv.hintsUsed.push(hintId);
      await inv.save();
    }

    res.json({
      success: true,
      hint: { id: hint.id, text: hint.text, order: hint.order, xpPenalty: hint.xpPenalty },
      alreadyUsed,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/investigations/:id/accusations
const submitAccusation = async (req, res, next) => {
  try {
    const { suspectId, reasoning } = req.body;

    const inv = await getUserInvestigation(req.params.id, req.user._id);
    if (!inv) return res.status(404).json({ success: false, message: 'Investigation not found.' });
    if (inv === 'forbidden') return res.status(403).json({ success: false, message: 'Access denied.' });
    if (inv.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Investigation already concluded.' });
    }

    const caseDoc = await getCaseDoc(inv.caseId, true);
    const isCorrect = caseDoc.solution.culpritId === suspectId;

    const startTimeMs = inv.startedAt ? new Date(inv.startedAt).getTime() : Date.now();
    const minutesElapsed = Math.floor((Date.now() - startTimeMs) / 60000);

    const { score, xpEarned, breakdown } = calculateScore({
      isCorrect,
      hintsUsed: inv.hintsUsed.length,
      cluesDiscovered: inv.discoveredClues.length,
      totalClues: caseDoc.clues.length,
      timelineCorrect: inv.timelineSubmission ? inv.timelineSubmission.isCorrect : false,
      minutesElapsed,
      caseScoring: caseDoc.scoring,
    });

    inv.accusation = {
      suspectId,
      reasoning,
      isCorrect,
      submittedAt: new Date(),
      revealed: true,
    };
    inv.status = 'completed';
    inv.completedAt = new Date();
    inv.score = score;
    inv.xpEarned = xpEarned;
    await inv.save();

    let user = req.user;
    if (isDbConnected(mongoose)) {
      user = await User.findById(req.user._id);
    }

    if (isCorrect) {
      user.xp += xpEarned;
      user.totalScore += score;
      user.casesCompleted += 1;
      if (user.updateRank) user.updateRank();
    }

    const newAchievements = calculateAchievements({
      user,
      investigation: inv,
      caseData: caseDoc,
      minutesElapsed,
      isCorrect,
    });

    if (newAchievements.length > 0) {
      user.achievements.push(...newAchievements);
    }

    if (isDbConnected(mongoose)) {
      await user.save();
    }

    res.json({
      success: true,
      isCorrect,
      score,
      xpEarned: isCorrect ? xpEarned : 0,
      breakdown,
      newAchievements,
      solution: {
        culpritId: caseDoc.solution.culpritId,
        explanation: caseDoc.solution.explanation,
        keyEvidence: caseDoc.solution.keyEvidence,
      },
      userStats: user.toPublicJSON ? user.toPublicJSON() : user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createInvestigation,
  getInvestigation,
  getMyInvestigations,
  discoverClue,
  submitTimeline,
  addConnection,
  removeConnection,
  updateBoardPositions,
  getNotes,
  addNote,
  updateNote,
  deleteNote,
  useHint,
  submitAccusation,
};
