const {
  calculateScore,
  getRank,
  calculateAchievements,
  evaluateTimeline,
  ACHIEVEMENTS,
} = require('../services/scoringService');

describe('Scoring Service — MindMaze Deduction Engine', () => {
  describe('calculateScore', () => {
    test('returns 0 score and 0 XP for an incorrect accusation', () => {
      const result = calculateScore({
        isCorrect: false,
        hintsUsed: 0,
        cluesDiscovered: 5,
        totalClues: 5,
        timelineCorrect: true,
        minutesElapsed: 15,
        caseScoring: { baseXP: 500, maxScore: 1000 },
      });

      expect(result.score).toBe(0);
      expect(result.xpEarned).toBe(0);
      expect(result.breakdown.reason).toBe('Incorrect accusation');
    });

    test('calculates correct score with base XP and full clue bonus', () => {
      const result = calculateScore({
        isCorrect: true,
        hintsUsed: 0,
        cluesDiscovered: 10,
        totalClues: 10,
        timelineCorrect: false,
        minutesElapsed: 45, // No time bonus
        caseScoring: { baseXP: 500, maxScore: 1000, timeBonus: false },
      });

      // Base: 500
      // Clue bonus: 500 * 0.20 = 100
      // Timeline bonus: 0
      // Hint penalty: 0
      // Total: 600
      expect(result.score).toBe(600);
      expect(result.xpEarned).toBe(600);
      expect(result.breakdown.base).toBe(500);
      expect(result.breakdown.clueBonus).toBe(100);
      expect(result.breakdown.hintPenalty).toBe(0);
    });

    test('deducts penalties for hints used', () => {
      const result = calculateScore({
        isCorrect: true,
        hintsUsed: 2, // 2 * 30 = -60 penalty
        cluesDiscovered: 5,
        totalClues: 10, // 50% = 50 clue bonus
        timelineCorrect: false,
        minutesElapsed: 45,
        caseScoring: { baseXP: 500, maxScore: 1000, timeBonus: false },
      });

      // 500 + 50 - 60 = 490
      expect(result.score).toBe(490);
      expect(result.breakdown.hintPenalty).toBe(-60);
    });

    test('awards timeline bonus when timeline is correct', () => {
      const result = calculateScore({
        isCorrect: true,
        hintsUsed: 0,
        cluesDiscovered: 10,
        totalClues: 10,
        timelineCorrect: true, // 500 * 0.15 = 75
        minutesElapsed: 45,
        caseScoring: { baseXP: 500, maxScore: 1000, timeBonus: false },
      });

      // 500 + 100 + 75 = 675
      expect(result.score).toBe(675);
      expect(result.breakdown.timelineBonus).toBe(75);
    });

    test('awards time decay bonus when solved under 30 minutes', () => {
      const result = calculateScore({
        isCorrect: true,
        hintsUsed: 0,
        cluesDiscovered: 10,
        totalClues: 10,
        timelineCorrect: true,
        minutesElapsed: 15, // 50% of 30 min window = 50% of time bonus (500 * 0.1 * 0.5 = 25)
        caseScoring: { baseXP: 500, maxScore: 1000, timeBonus: true },
      });

      expect(result.breakdown.timeBonus).toBeGreaterThan(0);
      expect(result.score).toBeGreaterThan(675);
    });

    test('caps score at maxScore and floors at 0', () => {
      const capped = calculateScore({
        isCorrect: true,
        hintsUsed: 0,
        cluesDiscovered: 10,
        totalClues: 10,
        timelineCorrect: true,
        minutesElapsed: 5,
        caseScoring: { baseXP: 900, maxScore: 950, timeBonus: true },
      });
      expect(capped.score).toBeLessThanOrEqual(950);

      const floored = calculateScore({
        isCorrect: true,
        hintsUsed: 50, // Massive penalty
        cluesDiscovered: 0,
        totalClues: 10,
        timelineCorrect: false,
        minutesElapsed: 50,
        caseScoring: { baseXP: 100, maxScore: 1000 },
      });
      expect(floored.score).toBe(0);
    });
  });

  describe('getRank', () => {
    test('assigns correct detective ranks across XP tiers', () => {
      expect(getRank(0)).toBe('Rookie Detective');
      expect(getRank(499)).toBe('Rookie Detective');
      expect(getRank(500)).toBe('Junior Detective');
      expect(getRank(1499)).toBe('Junior Detective');
      expect(getRank(1500)).toBe('Detective');
      expect(getRank(2999)).toBe('Detective');
      expect(getRank(3000)).toBe('Senior Detective');
      expect(getRank(4999)).toBe('Senior Detective');
      expect(getRank(5000)).toBe('Chief Inspector');
      expect(getRank(100000)).toBe('Chief Inspector');
    });
  });

  describe('evaluateTimeline', () => {
    const canonicalEvents = [
      { id: 'ev-1', correctOrder: 1 },
      { id: 'ev-2', correctOrder: 2 },
      { id: 'ev-3', correctOrder: 3 },
      { id: 'ev-4', correctOrder: 4 },
    ];

    test('returns 100% and isCorrect=true for exact order', () => {
      const submitted = ['ev-1', 'ev-2', 'ev-3', 'ev-4'];
      const result = evaluateTimeline(submitted, canonicalEvents);

      expect(result.isCorrect).toBe(true);
      expect(result.score).toBe(100);
      expect(result.correctOrder).toEqual(['ev-1', 'ev-2', 'ev-3', 'ev-4']);
    });

    test('returns partial score for partially correct order', () => {
      const submitted = ['ev-1', 'ev-2', 'ev-4', 'ev-3']; // 2 out of 4 correct
      const result = evaluateTimeline(submitted, canonicalEvents);

      expect(result.isCorrect).toBe(false);
      expect(result.score).toBe(50);
    });

    test('returns 0% for completely reversed or misplaced order', () => {
      const submitted = ['ev-4', 'ev-3', 'ev-2', 'ev-1'];
      const result = evaluateTimeline(submitted, canonicalEvents);

      expect(result.isCorrect).toBe(false);
      expect(result.score).toBe(0);
    });
  });

  describe('calculateAchievements', () => {
    test('awards first_case achievement on initial completion', () => {
      const mockUser = {
        casesCompleted: 0,
        achievements: [],
      };
      const mockInv = {
        hintsUsed: [],
        discoveredClues: ['c1'],
        timelineSubmission: { isCorrect: true },
        score: 700,
      };
      const mockCase = {
        clues: ['c1', 'c2'],
        scoring: { maxScore: 1000 },
      };

      const achievements = calculateAchievements({
        user: mockUser,
        investigation: mockInv,
        caseData: mockCase,
        minutesElapsed: 15,
        isCorrect: true,
      });

      const ids = achievements.map((a) => a.id);
      expect(ids).toContain('first_case');
      expect(ids).toContain('no_hints');
      expect(ids).toContain('speed_solver');
      expect(ids).toContain('perfect_timeline');
    });

    test('awards sharp_eye when all clues are discovered', () => {
      const mockUser = {
        casesCompleted: 1,
        achievements: [{ id: 'first_case' }],
      };
      const mockInv = {
        hintsUsed: ['h1'],
        discoveredClues: ['c1', 'c2', 'c3'],
        timelineSubmission: null,
        score: 650,
      };
      const mockCase = {
        clues: ['c1', 'c2', 'c3'],
        scoring: { maxScore: 1000 },
      };

      const achievements = calculateAchievements({
        user: mockUser,
        investigation: mockInv,
        caseData: mockCase,
        minutesElapsed: 35,
        isCorrect: true,
      });

      const ids = achievements.map((a) => a.id);
      expect(ids).toContain('sharp_eye');
      expect(ids).not.toContain('no_hints');
      expect(ids).not.toContain('first_case'); // Already has it
    });

    test('awards five_cases when reaching 5 cases completed', () => {
      const mockUser = {
        casesCompleted: 4, // Next will be 5
        achievements: [{ id: 'first_case' }],
      };
      const mockInv = {
        hintsUsed: ['h1'],
        discoveredClues: ['c1'],
        timelineSubmission: null,
        score: 600,
      };
      const mockCase = {
        clues: ['c1', 'c2'],
        scoring: { maxScore: 1000 },
      };

      const achievements = calculateAchievements({
        user: mockUser,
        investigation: mockInv,
        caseData: mockCase,
        minutesElapsed: 40,
        isCorrect: true,
      });

      const ids = achievements.map((a) => a.id);
      expect(ids).toContain('five_cases');
    });

    test('awards no achievements on incorrect accusation', () => {
      const mockUser = { casesCompleted: 0, achievements: [] };
      const mockInv = { hintsUsed: [], discoveredClues: ['c1'], score: 0 };
      const mockCase = { clues: ['c1'], scoring: { maxScore: 1000 } };

      const achievements = calculateAchievements({
        user: mockUser,
        investigation: mockInv,
        caseData: mockCase,
        minutesElapsed: 10,
        isCorrect: false,
      });

      expect(achievements).toEqual([]);
    });
  });
});
