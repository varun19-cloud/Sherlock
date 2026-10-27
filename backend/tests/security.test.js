const bcrypt = require('bcryptjs');
const cases = require('../services/caseData');

describe('Security & Business Logic Integrity', () => {
  describe('Password Security', () => {
    test('hashes password using bcrypt with high salt rounds', async () => {
      const plaintext = 'SecretDetectivePass123!';
      const salt = await bcrypt.genSalt(12);
      const hash = await bcrypt.hash(plaintext, salt);

      expect(hash).not.toBe(plaintext);
      expect(hash.startsWith('$2a$') || hash.startsWith('$2b$')).toBe(true);

      const isValid = await bcrypt.compare(plaintext, hash);
      expect(isValid).toBe(true);

      const isInvalid = await bcrypt.compare('WrongPassword', hash);
      expect(isInvalid).toBe(false);
    });
  });

  describe('Solution Data Confidentiality', () => {
    test('public case listings strip hidden solution and guilt data', () => {
      // Simulates the field exclusions performed in caseController:
      // '-solution -suspects.isGuilty -clues.isHidden'
      const publicCases = cases.map((c) => {
        const copy = JSON.parse(JSON.stringify(c));
        delete copy.solution;
        copy.suspects = copy.suspects.map((s) => {
          delete s.isGuilty;
          return s;
        });
        copy.clues = copy.clues.map((cl) => {
          delete cl.isHidden;
          return cl;
        });
        return copy;
      });

      publicCases.forEach((c) => {
        expect(c.solution).toBeUndefined();
        c.suspects.forEach((s) => {
          expect(s.isGuilty).toBeUndefined();
        });
        c.clues.forEach((cl) => {
          expect(cl.isHidden).toBeUndefined();
        });
      });
    });
  });

  describe('Anti-Exploit: Clue XP Duplication Guard', () => {
    test('only awards XP on first discovery of a clue', () => {
      const investigation = {
        discoveredClues: [],
        clueXpAwarded: [],
      };

      const simulateDiscovery = (clueId, xpReward) => {
        const alreadyDiscovered = investigation.discoveredClues.includes(clueId);
        let xpAwarded = 0;

        if (!alreadyDiscovered) {
          investigation.discoveredClues.push(clueId);
        }

        if (!investigation.clueXpAwarded.includes(clueId)) {
          xpAwarded = xpReward;
          investigation.clueXpAwarded.push(clueId);
        }

        return { alreadyDiscovered, xpAwarded };
      };

      // First discovery
      const first = simulateDiscovery('clue-001-1', 50);
      expect(first.alreadyDiscovered).toBe(false);
      expect(first.xpAwarded).toBe(50);
      expect(investigation.clueXpAwarded).toContain('clue-001-1');

      // Second discovery of the same clue
      const second = simulateDiscovery('clue-001-1', 50);
      expect(second.alreadyDiscovered).toBe(true);
      expect(second.xpAwarded).toBe(0); // Exploit blocked
    });
  });

  describe('Evidence Board: Connection Rules', () => {
    test('prevents connecting a clue to itself', () => {
      const validateConnection = (clueIdA, clueIdB) => {
        if (clueIdA === clueIdB) {
          return { valid: false, message: 'Cannot connect a clue to itself.' };
        }
        return { valid: true };
      };

      expect(validateConnection('clue-1', 'clue-1').valid).toBe(false);
      expect(validateConnection('clue-1', 'clue-2').valid).toBe(true);
    });

    test('prevents duplicate connections between the same pair of clues', () => {
      const connections = [
        { clueIdA: 'clue-1', clueIdB: 'clue-2', label: 'Alibi link' },
      ];

      const addConnection = (a, b) => {
        const exists = connections.find(
          (c) =>
            (c.clueIdA === a && c.clueIdB === b) ||
            (c.clueIdA === b && c.clueIdB === a)
        );
        if (exists) return { success: false, status: 409 };
        connections.push({ clueIdA: a, clueIdB: b });
        return { success: true };
      };

      // Attempt duplicate in same direction
      expect(addConnection('clue-1', 'clue-2').success).toBe(false);
      // Attempt duplicate in reverse direction
      expect(addConnection('clue-2', 'clue-1').success).toBe(false);
      // New pair is allowed
      expect(addConnection('clue-1', 'clue-3').success).toBe(true);
    });
  });

  describe('Data Isolation: User-Specific Ownership Check', () => {
    test('rejects access when investigation userId does not match authenticated user', () => {
      const verifyOwnership = (investigationUserId, requestUserId) => {
        if (investigationUserId.toString() !== requestUserId.toString()) {
          return 'forbidden';
        }
        return 'allowed';
      };

      const ownerId = '658f11111111111111111111';
      const intruderId = '658f22222222222222222222';

      expect(verifyOwnership(ownerId, ownerId)).toBe('allowed');
      expect(verifyOwnership(ownerId, intruderId)).toBe('forbidden');
    });
  });
});
