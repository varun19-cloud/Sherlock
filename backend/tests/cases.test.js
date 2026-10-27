const cases = require('../services/caseData');

describe('Mystery Cases Data Validation', () => {
  test('includes at least two complete mystery cases', () => {
    expect(cases.length).toBeGreaterThanOrEqual(2);
  });

  cases.forEach((c) => {
    describe(`Case: ${c.title} (${c.caseId})`, () => {
      test('has required top-level metadata', () => {
        expect(c.caseId).toBeDefined();
        expect(c.title).toBeTruthy();
        expect(c.description).toBeTruthy();
        expect(['Easy', 'Medium', 'Hard', 'Expert']).toContain(c.difficulty);
        expect(c.category).toBeTruthy();
        expect(c.setting).toBeTruthy();
        expect(c.crimeSceneDescription).toBeTruthy();
      });

      test('has at least three suspects with full profiles', () => {
        expect(c.suspects.length).toBeGreaterThanOrEqual(3);

        c.suspects.forEach((suspect) => {
          expect(suspect.id).toBeTruthy();
          expect(suspect.name).toBeTruthy();
          expect(suspect.occupation).toBeTruthy();
          expect(suspect.motive).toBeTruthy();
          expect(suspect.alibi).toBeTruthy();
          expect(Array.isArray(suspect.statements)).toBe(true);
          expect(suspect.statements.length).toBeGreaterThan(0);
        });
      });

      test('has discoverable clues with valid properties and hotspots', () => {
        expect(c.clues.length).toBeGreaterThanOrEqual(4);

        c.clues.forEach((clue) => {
          expect(clue.id).toBeTruthy();
          expect(clue.name).toBeTruthy();
          expect(clue.description).toBeTruthy();
          expect(clue.location).toBeTruthy();
          expect(['physical', 'testimony', 'document', 'digital', 'trace']).toContain(clue.type);
          expect(clue.xpReward).toBeGreaterThan(0);

          if (clue.imageHotspot) {
            expect(typeof clue.imageHotspot.x).toBe('number');
            expect(typeof clue.imageHotspot.y).toBe('number');
            expect(clue.imageHotspot.x).toBeGreaterThanOrEqual(0);
            expect(clue.imageHotspot.x).toBeLessThanOrEqual(100);
            expect(clue.imageHotspot.y).toBeGreaterThanOrEqual(0);
            expect(clue.imageHotspot.y).toBeLessThanOrEqual(100);
          }
        });
      });

      test('has timeline events with sequential correctOrder indices', () => {
        expect(c.timelineEvents.length).toBeGreaterThanOrEqual(3);

        const orders = c.timelineEvents.map((e) => e.correctOrder);
        const sortedOrders = [...orders].sort((a, b) => a - b);

        // Ensure 1-indexed sequential ordering without duplicates
        sortedOrders.forEach((val, idx) => {
          expect(val).toBe(idx + 1);
        });
      });

      test('has progressive hints with ordered progression and penalties', () => {
        expect(c.hints.length).toBeGreaterThanOrEqual(2);

        c.hints.forEach((hint) => {
          expect(hint.id).toBeTruthy();
          expect(hint.text).toBeTruthy();
          expect(hint.order).toBeGreaterThan(0);
          expect(hint.xpPenalty).toBeGreaterThanOrEqual(0);
        });
      });

      test('has definitive server-side solution matching suspect and evidence', () => {
        expect(c.solution).toBeDefined();
        expect(c.solution.culpritId).toBeTruthy();
        expect(c.solution.explanation).toBeTruthy();
        expect(Array.isArray(c.solution.keyEvidence)).toBe(true);
        expect(c.solution.keyEvidence.length).toBeGreaterThan(0);

        // Culprit must exist in suspects
        const culprit = c.suspects.find((s) => s.id === c.solution.culpritId);
        expect(culprit).toBeDefined();
        expect(culprit.isGuilty).toBe(true);

        // Other suspects must not be guilty
        const innocentSuspects = c.suspects.filter((s) => s.id !== c.solution.culpritId);
        innocentSuspects.forEach((innocent) => {
          expect(innocent.isGuilty).toBeFalsy();
        });

        // Key evidence must reference actual clues
        const clueIds = c.clues.map((cl) => cl.id);
        c.solution.keyEvidence.forEach((evidenceId) => {
          expect(clueIds).toContain(evidenceId);
        });
      });

      test('has valid scoring parameters', () => {
        expect(c.scoring).toBeDefined();
        expect(c.scoring.baseXP).toBeGreaterThan(0);
        expect(c.scoring.maxScore).toBeGreaterThanOrEqual(c.scoring.baseXP);
      });
    });
  });
});
