const express = require('express');
const router = express.Router();
const { getCases, getCaseById, getCaseSuspects, getCaseClues } = require('../controllers/caseController');

// Public case catalog browsing endpoints
router.get('/', getCases);
router.get('/:caseId', getCaseById);
router.get('/:caseId/suspects', getCaseSuspects);
router.get('/:caseId/clues', getCaseClues);

module.exports = router;
