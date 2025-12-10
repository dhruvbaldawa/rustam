import { describe, it, expect } from 'vitest';

// Test game state transitions
type GameStatus = 'lobby' | 'active' | 'revealed' | 'ended';

const isValidTransition = (from: GameStatus, to: GameStatus): boolean => {
  const validTransitions: Record<GameStatus, GameStatus[]> = {
    'lobby': ['active'],
    'active': ['revealed'],
    'revealed': ['active', 'ended'],
    'ended': ['lobby'],
  };
  return validTransitions[from]?.includes(to) ?? false;
};

describe('Game State Transitions', () => {
  it('should allow lobby → active', () => {
    expect(isValidTransition('lobby', 'active')).toBe(true);
  });

  it('should allow active → revealed', () => {
    expect(isValidTransition('active', 'revealed')).toBe(true);
  });

  it('should allow revealed → active (next round)', () => {
    expect(isValidTransition('revealed', 'active')).toBe(true);
  });

  it('should allow revealed → ended', () => {
    expect(isValidTransition('revealed', 'ended')).toBe(true);
  });

  it('should allow ended → lobby (new game)', () => {
    expect(isValidTransition('ended', 'lobby')).toBe(true);
  });

  it('should not allow invalid transitions', () => {
    expect(isValidTransition('lobby', 'revealed')).toBe(false);
    expect(isValidTransition('active', 'ended')).toBe(false);
    expect(isValidTransition('ended', 'active')).toBe(false);
  });
});
