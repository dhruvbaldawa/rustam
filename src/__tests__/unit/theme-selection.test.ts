import { describe, it, expect } from 'vitest';
import { THEMES, RANDOM_THEME, getThemeForRound, getRandomTheme } from '../../lib/themes';

describe('Theme Selection', () => {
  describe('THEMES constant', () => {
    it('should have at least 5 themes', () => {
      expect(THEMES.length).toBeGreaterThanOrEqual(5);
    });

    it('should contain expected theme categories', () => {
      expect(THEMES).toContain('Kitchen Appliances');
      expect(THEMES).toContain('Vehicles');
      expect(THEMES).toContain('Fruits');
    });

    it('should have all unique themes', () => {
      const uniqueThemes = new Set(THEMES);
      expect(uniqueThemes.size).toBe(THEMES.length);
    });

    it('should not contain invalid theme values', () => {
      // Document that invalid themes should be rejected
      const invalidThemes = ['FakeTheme', '', 'InvalidCategory', '<script>alert("xss")</script>'];
      invalidThemes.forEach((invalidTheme) => {
        expect(THEMES).not.toContain(invalidTheme);
      });
    });
  });

  describe('RANDOM_THEME constant', () => {
    it('should be defined as "Random"', () => {
      expect(RANDOM_THEME).toBe('Random');
    });
  });

  describe('getThemeForRound', () => {
    it('should return first theme for round 1', () => {
      expect(getThemeForRound(1)).toBe(THEMES[0]);
    });

    it('should return second theme for round 2', () => {
      expect(getThemeForRound(2)).toBe(THEMES[1]);
    });

    it('should cycle through themes for rounds beyond array length', () => {
      const totalThemes = THEMES.length;
      expect(getThemeForRound(totalThemes + 1)).toBe(THEMES[0]);
      expect(getThemeForRound(totalThemes + 2)).toBe(THEMES[1]);
    });

    it('should handle large round numbers', () => {
      const theme = getThemeForRound(100);
      expect(THEMES).toContain(theme);
    });

    it('should handle round 0 edge case', () => {
      const theme = getThemeForRound(0);
      expect(THEMES).toContain(theme);
      expect(theme).toBe(THEMES[THEMES.length - 1]);
    });
  });

  describe('getRandomTheme', () => {
    it('should return a theme from THEMES array', () => {
      const theme = getRandomTheme();
      expect(THEMES).toContain(theme);
    });

    it('should return varying themes over multiple calls', () => {
      const themes = new Set<string>();
      // Run 50 times to get statistical variation
      for (let i = 0; i < 50; i++) {
        themes.add(getRandomTheme());
      }
      // Should get at least 2 different themes (probability of same theme 50 times is astronomically low)
      expect(themes.size).toBeGreaterThanOrEqual(2);
    });

    it('should never return undefined or null', () => {
      for (let i = 0; i < 10; i++) {
        const theme = getRandomTheme();
        expect(theme).toBeDefined();
        expect(theme).not.toBeNull();
        expect(typeof theme).toBe('string');
        expect(theme.length).toBeGreaterThan(0);
      }
    });
  });
});
