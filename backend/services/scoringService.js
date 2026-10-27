/**
 * Scoring Service
 * All score calculations happen server-side.
 */

const RANKS = [
  { minXP: 5000, rank: 'Chief Inspector' },
  { minXP: 3000, rank: 'Senior Detective' },
  { minXP: 1500, rank: 'Detective' },
  { minXP: 500, rank: 'Junior Detective' },
  { minXP: 0, rank: 'Rookie Detective' },
];

const ACHIEVEMENTS = [
  { id: 'first_case', name: 'First Case Closed', description: 'Complete your first investigation.', icon: '🔍' },
  { id: 'sharp_eye', name: 'Sharp Eye', description: 'Discover all clues in a case.', icon: '👁️' },
  { id: 'no_hints', name: 'Mind Like a Razor', description: 'Solve a case without using any hints.', icon: '🧠' },
  { id: 'speed_solver', name: 'Speed Solver', description: 'Complete a case in under 20 minutes.', icon: '⚡' },
  { id: 'perfect_timeline', name: 'Chronologist', description: 'Submit a perfect timeline on first try.', icon: '🕐' },
  { id: 'five_cases', name: 'Veteran Investigator', description: 'Complete five investigations.', icon: '🏅' },
  { id: 'perfect_score', name: 'Flawless Deduction', description: 'Achieve a perfect score on any case.', icon: '💎' },
];

/**
 * Calculate accusation score
 * @param {Object} params
 * @param {boolean} params.isCorrect
 * @param {number} params.hintsUsed
 * @param {number} params.cluesDiscovered
 * @param {number} params.totalClues
 * @param {boolean} params.timelineCorrect
 * @param {number} params.minutesElapsed
 * @param {Object} params.caseScoring
 * @returns {{ score: number, xpEarned: number, breakdown: Object }}
 */
const calculateScore = ({
  isCorrect,
  hintsUsed = 0,
  cluesDiscovered = 0,
  totalClues = 1,
  timelineCorrect = false,
  minutesElapsed = 60,
  caseScoring = {},
}) => {
  const baseXP = caseScoring.baseXP || 500;
  const maxScore = caseScoring.maxScore || 1000;

  if (!isCorrect) {
    return { score: 0, xpEarned: 0, breakdown: { reason: 'Incorrect accusation' } };
  }

  let score = baseXP;

  // Clue discovery bonus (up to 20% of base)
  const clueRatio = totalClues > 0 ? cluesDiscovered / totalClues : 0;
  const clueBonus = Math.floor(baseXP * 0.2 * clueRatio);
  score += clueBonus;

  // Timeline bonus
  const timelineBonus = timelineCorrect ? Math.floor(baseXP * 0.15) : 0;
  score += timelineBonus;

  // Hint penalty (30 XP per hint used)
  const hintPenalty = hintsUsed * 30;
  score -= hintPenalty;

  // Time bonus (only if case supports it and under 30 minutes)
  let timeBonus = 0;
  if (caseScoring.timeBonus && minutesElapsed < 30) {
    timeBonus = Math.floor(baseXP * 0.1 * (1 - minutesElapsed / 30));
    score += timeBonus;
  }

  // Cap at maxScore
  score = Math.max(0, Math.min(score, maxScore));

  return {
    score,
    xpEarned: score,
    breakdown: {
      base: baseXP,
      clueBonus,
      timelineBonus,
      hintPenalty: -hintPenalty || 0,
      timeBonus,
      total: score,
    },
  };
};

/**
 * Get detective rank for given XP
 */
const getRank = (xp) => {
  for (const entry of RANKS) {
    if (xp >= entry.minXP) return entry.rank;
  }
  return 'Rookie Detective';
};

/**
 * Calculate achievements earned for this investigation
 */
const calculateAchievements = ({
  user,
  investigation,
  caseData,
  minutesElapsed,
  isCorrect,
}) => {
  const newAchievements = [];
  const existingIds = user.achievements.map((a) => a.id);

  const addIfNew = (id) => {
    const def = ACHIEVEMENTS.find((a) => a.id === id);
    if (def && !existingIds.includes(id)) {
      newAchievements.push({ ...def, unlockedAt: new Date() });
    }
  };

  if (isCorrect) {
    // First case
    if (user.casesCompleted <= 1) addIfNew('first_case');

    // Five cases
    if (user.casesCompleted >= 4) addIfNew('five_cases');

    // No hints
    if (investigation.hintsUsed.length === 0) addIfNew('no_hints');

    // Speed solver
    if (minutesElapsed < 20) addIfNew('speed_solver');

    // All clues discovered
    const totalClues = caseData.clues.length;
    if (investigation.discoveredClues.length >= totalClues) addIfNew('sharp_eye');

    // Perfect timeline
    if (investigation.timelineSubmission && investigation.timelineSubmission.isCorrect) {
      addIfNew('perfect_timeline');
    }

    // Perfect score
    const maxScore = caseData.scoring ? caseData.scoring.maxScore : 1000;
    if (investigation.score >= maxScore) addIfNew('perfect_score');
  }

  return newAchievements;
};

/**
 * Evaluate timeline submission
 * @param {string[]} submittedOrder - array of event IDs in submitted order
 * @param {Array} timelineEvents - canonical event objects with correctOrder
 * @returns {{ isCorrect: boolean, score: number, correctOrder: string[] }}
 */
const evaluateTimeline = (submittedOrder, timelineEvents) => {
  const sorted = [...timelineEvents].sort((a, b) => a.correctOrder - b.correctOrder);
  const correctOrder = sorted.map((e) => e.id);

  const isCorrect = submittedOrder.length === correctOrder.length &&
    submittedOrder.every((id, i) => id === correctOrder[i]);

  // Partial scoring: count positions correct
  let correct = 0;
  for (let i = 0; i < Math.min(submittedOrder.length, correctOrder.length); i++) {
    if (submittedOrder[i] === correctOrder[i]) correct++;
  }
  const score = Math.floor((correct / correctOrder.length) * 100);

  return { isCorrect, score, correctOrder };
};

module.exports = {
  calculateScore,
  getRank,
  calculateAchievements,
  evaluateTimeline,
  ACHIEVEMENTS,
};
