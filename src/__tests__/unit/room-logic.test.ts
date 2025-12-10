import { describe, it, expect } from 'vitest';

// Test room code generation validation
const isValidRoomCode = (code: string): boolean => {
  return /^\d{4}$/.test(code);
};

// Test player validation
const isValidPlayerName = (name: string): boolean => {
  return name.trim().length > 0 && name.length <= 10;
};

// Test round validation
const canStartRound = (playerCount: number, roundNumber: number, totalRounds: number): boolean => {
  return playerCount >= 2 && roundNumber <= totalRounds;
};

describe('Room Logic', () => {
  describe('Room Code Validation', () => {
    it('should accept 4-digit codes', () => {
      expect(isValidRoomCode('1234')).toBe(true);
      expect(isValidRoomCode('0000')).toBe(true);
      expect(isValidRoomCode('9999')).toBe(true);
    });

    it('should reject non-numeric codes', () => {
      expect(isValidRoomCode('abcd')).toBe(false);
      expect(isValidRoomCode('12a4')).toBe(false);
    });

    it('should reject incorrect length', () => {
      expect(isValidRoomCode('123')).toBe(false);
      expect(isValidRoomCode('12345')).toBe(false);
    });
  });

  describe('Player Name Validation', () => {
    it('should accept valid names', () => {
      expect(isValidPlayerName('Alice')).toBe(true);
      expect(isValidPlayerName('Bob')).toBe(true);
      expect(isValidPlayerName('J')).toBe(true);
    });

    it('should reject empty names', () => {
      expect(isValidPlayerName('')).toBe(false);
      expect(isValidPlayerName('   ')).toBe(false);
    });

    it('should reject names over 10 characters', () => {
      expect(isValidPlayerName('VeryLongName')).toBe(false);
      expect(isValidPlayerName('1234567890X')).toBe(false);
    });

    it('should accept exactly 10 characters', () => {
      expect(isValidPlayerName('1234567890')).toBe(true);
    });
  });

  describe('Round Validation', () => {
    it('should allow starting round with 2+ players', () => {
      expect(canStartRound(2, 1, 4)).toBe(true);
      expect(canStartRound(3, 1, 4)).toBe(true);
      expect(canStartRound(10, 1, 4)).toBe(true);
    });

    it('should prevent starting with less than 2 players', () => {
      expect(canStartRound(0, 1, 4)).toBe(false);
      expect(canStartRound(1, 1, 4)).toBe(false);
    });

    it('should prevent starting round beyond total rounds', () => {
      expect(canStartRound(2, 5, 4)).toBe(false);
      expect(canStartRound(2, 4, 4)).toBe(true);
    });
  });
});
