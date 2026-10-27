const cases = require('../backend/services/caseData');
const scoringService = require('../backend/services/scoringService');

describe('MindMaze System Integrity Tests', () => {
  test('all case IDs are unique', () => {
    const ids = cases.map((c) => c.caseId);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  test('all suspect IDs across all cases are unique', () => {
    const allSuspectIds = cases.flatMap((c) => c.suspects.map((s) => s.id));
    const unique = new Set(allSuspectIds);
    expect(unique.size).toBe(allSuspectIds.length);
  });

  test('all clue IDs across all cases are unique', () => {
    const allClueIds = cases.flatMap((c) => c.clues.map((cl) => cl.id));
    const unique = new Set(allClueIds);
    expect(unique.size).toBe(allClueIds.length);
  });

  test('all timeline event IDs across all cases are unique', () => {
    const allEventIds = cases.flatMap((c) => c.timelineEvents.map((e) => e.id));
    const unique = new Set(allEventIds);
    expect(unique.size).toBe(allEventIds.length);
  });

  test('achievements definition list is non-empty and has unique IDs', () => {
    expect(scoringService.ACHIEVEMENTS.length).toBeGreaterThan(0);
    const ids = scoringService.ACHIEVEMENTS.map((a) => a.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });
});
