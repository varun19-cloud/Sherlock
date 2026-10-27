const cases = require('../services/caseData');
const {
  calculateScore,
  getRank,
  calculateAchievements,
  evaluateTimeline,
} = require('../services/scoringService');

describe('Full Player Detective Journey — End-to-End Simulation', () => {
  test('simulates a complete investigation walkthrough for Case 1', () => {
    const caseDoc = cases.find((c) => c.caseId === 'case-001');
    expect(caseDoc).toBeDefined();

    // 1. Player profile initialization
    const player = {
      _id: 'detective_user_001',
      username: 'baker_street_detective',
      xp: 0,
      rank: 'Rookie Detective',
      casesCompleted: 0,
      totalScore: 0,
      achievements: [],
    };

    // 2. Open new investigation
    const investigation = {
      _id: 'inv_case_001_session',
      userId: player._id,
      caseId: caseDoc.caseId,
      status: 'active',
      startedAt: new Date(Date.now() - 18 * 60 * 1000), // 18 minutes ago (qualifies for speed solver)
      discoveredClues: [],
      clueXpAwarded: [],
      connections: [],
      boardPositions: {},
      timelineSubmission: null,
      notes: [],
      hintsUsed: [],
    };

    // 3. Examine crime scene and discover all clues
    caseDoc.clues.forEach((clue) => {
      investigation.discoveredClues.push(clue.id);
      if (!investigation.clueXpAwarded.includes(clue.id)) {
        investigation.clueXpAwarded.push(clue.id);
        player.xp += clue.xpReward;
      }
    });

    expect(investigation.discoveredClues.length).toBe(caseDoc.clues.length);
    expect(player.xp).toBeGreaterThan(0);

    // 4. Evidence Board: Pin clues and connect them
    investigation.boardPositions = {
      'clue-001-1': { x: 100, y: 150 },
      'clue-001-3': { x: 300, y: 150 },
    };
    investigation.connections.push({
      _id: 'conn_001',
      clueIdA: 'clue-001-1',
      clueIdB: 'clue-001-3',
      label: 'Points to inner passage route',
    });

    expect(investigation.connections.length).toBe(1);

    // 5. Timeline reconstruction: Arrange all events chronologically
    const canonicalOrder = [...caseDoc.timelineEvents]
      .sort((a, b) => a.correctOrder - b.correctOrder)
      .map((e) => e.id);

    const timelineResult = evaluateTimeline(canonicalOrder, caseDoc.timelineEvents);
    expect(timelineResult.isCorrect).toBe(true);
    expect(timelineResult.score).toBe(100);

    investigation.timelineSubmission = {
      order: canonicalOrder,
      isCorrect: true,
      score: 100,
      submittedAt: new Date(),
    };

    // 6. Detective notebook entry
    investigation.notes.push({
      _id: 'note_001',
      title: 'Pawn shop receipts & debt letter',
      content: 'Victor Ashworth owes £10,000 to London loan sharks. Strong motive.',
      color: 'amber',
    });
    expect(investigation.notes.length).toBe(1);

    // 7. Request 1 progressive hint
    investigation.hintsUsed.push('hint-001-1');

    // 8. Submit final accusation: Correct Culprit
    const accusedSuspectId = caseDoc.solution.culpritId;
    const reasoning = 'Victor used the servants passage to steal the violin to settle his gambling debts.';
    const isCorrect = caseDoc.solution.culpritId === accusedSuspectId;

    expect(isCorrect).toBe(true);

    // 9. Calculate score and rewards
    const minutesElapsed = 18;
    const scoreResult = calculateScore({
      isCorrect,
      hintsUsed: investigation.hintsUsed.length,
      cluesDiscovered: investigation.discoveredClues.length,
      totalClues: caseDoc.clues.length,
      timelineCorrect: investigation.timelineSubmission.isCorrect,
      minutesElapsed,
      caseScoring: caseDoc.scoring,
    });

    expect(scoreResult.score).toBeGreaterThan(600);
    expect(scoreResult.breakdown.clueBonus).toBeGreaterThan(0);
    expect(scoreResult.breakdown.timelineBonus).toBeGreaterThan(0);
    expect(scoreResult.breakdown.timeBonus).toBeGreaterThan(0);
    expect(scoreResult.breakdown.hintPenalty).toBe(-30);

    // 10. Update player profile and check rank progression
    player.xp += scoreResult.xpEarned;
    player.totalScore += scoreResult.score;
    player.casesCompleted += 1;
    player.rank = getRank(player.xp);

    expect(player.rank).toBe('Junior Detective'); // > 500 XP
    expect(player.casesCompleted).toBe(1);

    // 11. Check achievements
    const newAchievements = calculateAchievements({
      user: player,
      investigation,
      caseData: caseDoc,
      minutesElapsed,
      isCorrect,
    });

    const achievementIds = newAchievements.map((a) => a.id);
    expect(achievementIds).toContain('first_case');
    expect(achievementIds).toContain('sharp_eye'); // All clues found
    expect(achievementIds).toContain('speed_solver'); // Under 20 min
    expect(achievementIds).toContain('perfect_timeline'); // Correct timeline

    // 12. Complete investigation
    investigation.status = 'completed';
    investigation.accusation = {
      suspectId: accusedSuspectId,
      reasoning,
      isCorrect,
      submittedAt: new Date(),
    };
    investigation.score = scoreResult.score;
    investigation.xpEarned = scoreResult.xpEarned;

    expect(investigation.status).toBe('completed');
  });
});
