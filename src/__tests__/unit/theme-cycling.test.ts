import { describe, it, expect } from 'vitest';

// Theme cycling logic test
const THEMES = [
  'Kitchen Appliances',
  'Vehicles',
  'Furniture',
  'Animals',
  'Fruits',
];

const getThemeForRound = (roundNumber: number): string => {
  return THEMES[(roundNumber - 1) % THEMES.length];
};

describe('Theme Cycling', () => {
  it('should cycle through 5 themes', () => {
    expect(getThemeForRound(1)).toBe('Kitchen Appliances');
    expect(getThemeForRound(2)).toBe('Vehicles');
    expect(getThemeForRound(3)).toBe('Furniture');
    expect(getThemeForRound(4)).toBe('Animals');
    expect(getThemeForRound(5)).toBe('Fruits');
  });

  it('should repeat themes after 5 rounds', () => {
    expect(getThemeForRound(6)).toBe('Kitchen Appliances');
    expect(getThemeForRound(7)).toBe('Vehicles');
    expect(getThemeForRound(10)).toBe('Fruits');
    expect(getThemeForRound(11)).toBe('Kitchen Appliances');
  });

  it('should handle arbitrary round numbers', () => {
    expect(getThemeForRound(100)).toBe(THEMES[(100 - 1) % THEMES.length]);
  });
});
