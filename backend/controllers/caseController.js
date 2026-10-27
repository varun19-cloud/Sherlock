const mongoose = require('mongoose');
const Case = require('../models/Case');
const casesData = require('../services/caseData');

const isDbConnected = () => mongoose.connection && mongoose.connection.readyState === 1;

// Strip solution and hidden fields from case object
const sanitizeCase = (c) => {
  const obj = JSON.parse(JSON.stringify(c));
  delete obj.solution;
  if (obj.suspects) {
    obj.suspects = obj.suspects.map((s) => {
      delete s.isGuilty;
      return s;
    });
  }
  if (obj.clues) {
    obj.clues = obj.clues.map((cl) => {
      delete cl.isHidden;
      return cl;
    });
  }
  return obj;
};

// GET /api/cases
const getCases = async (req, res, next) => {
  try {
    const { category, difficulty, search } = req.query;

    if (isDbConnected()) {
      const filter = { isActive: true };
      if (category) filter.category = category;
      if (difficulty) filter.difficulty = difficulty;
      if (search) filter.title = { $regex: search, $options: 'i' };

      const cases = await Case.find(filter).select(
        '-solution -suspects.isGuilty -clues.isHidden'
      );
      return res.json({ success: true, count: cases.length, cases });
    }

    // In-memory fallback
    let list = casesData.filter((c) => c.isActive !== false);
    if (category && category !== 'all') list = list.filter((c) => c.category.toLowerCase() === category.toLowerCase());
    if (difficulty && difficulty !== 'all') list = list.filter((c) => c.difficulty.toLowerCase() === difficulty.toLowerCase());
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((c) => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
    }

    const sanitized = list.map(sanitizeCase);
    res.json({ success: true, count: sanitized.length, cases: sanitized });
  } catch (error) {
    next(error);
  }
};

// GET /api/cases/:caseId
const getCaseById = async (req, res, next) => {
  try {
    const { caseId } = req.params;

    if (isDbConnected()) {
      const caseDoc = await Case.findOne({ caseId, isActive: true }).select(
        '-solution -suspects.isGuilty'
      );
      if (!caseDoc) {
        return res.status(404).json({ success: false, message: 'Case not found.' });
      }
      return res.json({ success: true, case: caseDoc });
    }

    // In-memory fallback
    const found = casesData.find((c) => c.caseId === caseId && c.isActive !== false);
    if (!found) {
      return res.status(404).json({ success: false, message: 'Case not found.' });
    }

    res.json({ success: true, case: sanitizeCase(found) });
  } catch (error) {
    next(error);
  }
};

// GET /api/cases/:caseId/suspects
const getCaseSuspects = async (req, res, next) => {
  try {
    const { caseId } = req.params;

    if (isDbConnected()) {
      const caseDoc = await Case.findOne({ caseId }).select('suspects');
      if (!caseDoc) return res.status(404).json({ success: false, message: 'Case not found.' });

      const suspects = caseDoc.suspects.map((s) => {
        const obj = s.toObject();
        delete obj.isGuilty;
        return obj;
      });
      return res.json({ success: true, suspects });
    }

    // In-memory fallback
    const found = casesData.find((c) => c.caseId === caseId);
    if (!found) return res.status(404).json({ success: false, message: 'Case not found.' });

    const suspects = (found.suspects || []).map((s) => {
      const copy = { ...s };
      delete copy.isGuilty;
      return copy;
    });

    res.json({ success: true, suspects });
  } catch (error) {
    next(error);
  }
};

// GET /api/cases/:caseId/clues
const getCaseClues = async (req, res, next) => {
  try {
    const { caseId } = req.params;

    if (isDbConnected()) {
      const caseDoc = await Case.findOne({ caseId }).select('clues');
      if (!caseDoc) return res.status(404).json({ success: false, message: 'Case not found.' });

      const clues = caseDoc.clues.map((c) => ({
        id: c.id,
        name: c.name,
        location: c.location,
        type: c.type,
        imageHotspot: c.imageHotspot,
      }));
      return res.json({ success: true, clues });
    }

    // In-memory fallback
    const found = casesData.find((c) => c.caseId === caseId);
    if (!found) return res.status(404).json({ success: false, message: 'Case not found.' });

    const clues = (found.clues || []).map((c) => ({
      id: c.id,
      name: c.name,
      location: c.location,
      type: c.type,
      imageHotspot: c.imageHotspot,
    }));

    res.json({ success: true, clues });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCases, getCaseById, getCaseSuspects, getCaseClues };
