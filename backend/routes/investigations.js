const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
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
} = require('../controllers/investigationController');

// All routes require authentication
router.use(authenticate);

// CRUD
router.post('/', [body('caseId').notEmpty().withMessage('caseId is required.')], validate, createInvestigation);
router.get('/', getMyInvestigations);
router.get('/:id', getInvestigation);

// Clue discovery
router.post('/:id/clues/:clueId', discoverClue);

// Timeline
router.put(
  '/:id/timeline',
  [body('order').isArray({ min: 1 }).withMessage('order must be a non-empty array.')],
  validate,
  submitTimeline
);

// Evidence board connections
router.post(
  '/:id/connections',
  [
    body('clueIdA').notEmpty().withMessage('clueIdA is required.'),
    body('clueIdB').notEmpty().withMessage('clueIdB is required.'),
  ],
  validate,
  addConnection
);
router.delete('/:id/connections/:connectionId', removeConnection);

// Board positions
router.put('/:id/board', [body('positions').isObject().withMessage('positions must be an object.')], validate, updateBoardPositions);

// Notes
router.get('/:id/notes', getNotes);
router.post(
  '/:id/notes',
  [
    body('title').trim().notEmpty().withMessage('Title is required.').isLength({ max: 100 }),
    body('content').trim().notEmpty().withMessage('Content is required.').isLength({ max: 2000 }),
  ],
  validate,
  addNote
);
router.put('/:id/notes/:noteId', updateNote);
router.delete('/:id/notes/:noteId', deleteNote);

// Hints
router.post('/:id/hints/:hintId', useHint);

// Accusation
router.post(
  '/:id/accusations',
  [
    body('suspectId').notEmpty().withMessage('suspectId is required.'),
    body('reasoning').trim().isLength({ min: 10 }).withMessage('Please provide reasoning (min 10 chars).'),
  ],
  validate,
  submitAccusation
);

module.exports = router;
