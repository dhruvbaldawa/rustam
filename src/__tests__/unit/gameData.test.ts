import { describe, it, expect } from 'vitest';
import {
  gameData,
  getThemeNames,
  getThemeByName,
  getRandomWordFromTheme,
  getQuestionsForWord,
  getPhysicalFormatInfo,
  shuffleArray,
  Question,
} from '../../lib/gameData';

describe('gameData', () => {
  describe('gameData constant', () => {
    it('should have gameInfo with required fields', () => {
      expect(gameData.gameInfo).toBeDefined();
      expect(gameData.gameInfo.name).toBe('Rustam');
      expect(gameData.gameInfo.version).toBeDefined();
    });

    it('should have themes array', () => {
      expect(Array.isArray(gameData.themes)).toBe(true);
      expect(gameData.themes.length).toBeGreaterThan(0);
    });

    it('should have physicalFormats', () => {
      expect(gameData.physicalFormats).toBeDefined();
      expect(gameData.physicalFormats.thumbs).toBeDefined();
      expect(gameData.physicalFormats.fingers).toBeDefined();
      expect(gameData.physicalFormats.stand).toBeDefined();
      expect(gameData.physicalFormats.point).toBeDefined();
    });
  });

  describe('getThemeNames', () => {
    it('should return array of theme names', () => {
      const themes = getThemeNames();
      expect(Array.isArray(themes)).toBe(true);
      expect(themes.length).toBeGreaterThan(0);
      expect(themes.every((t) => typeof t === 'string')).toBe(true);
    });

    it('should include known themes', () => {
      const themes = getThemeNames();
      expect(themes).toContain('Kitchen Appliances');
      expect(themes).toContain('Vehicles');
    });
  });

  describe('getThemeByName', () => {
    it('should return theme for valid theme name', () => {
      const theme = getThemeByName('Kitchen Appliances');
      expect(theme).toBeDefined();
      expect(theme?.name).toBe('Kitchen Appliances');
      expect(theme?.words).toBeDefined();
      expect(Array.isArray(theme?.words)).toBe(true);
    });

    it('should return undefined for unknown theme', () => {
      const theme = getThemeByName('Nonexistent Theme');
      expect(theme).toBeUndefined();
    });

    it('should return theme with correct structure', () => {
      const theme = getThemeByName('Vehicles');
      expect(theme).toBeDefined();
      expect(theme?.id).toBeDefined();
      expect(theme?.nameHindi).toBeDefined();
      expect(theme?.difficulty).toMatch(/^(easy|medium|hard)$/);
      expect(theme?.style).toMatch(/^(yours|youAreIt)$/);
    });

    it('should have words with nested questions', () => {
      const theme = getThemeByName('Kitchen Appliances');
      expect(theme?.words.length).toBeGreaterThan(0);
      theme?.words.forEach((word) => {
        expect(word.word).toBeDefined();
        expect(word.wordHindi).toBeDefined();
        expect(Array.isArray(word.questions)).toBe(true);
        expect(word.questions.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getRandomWordFromTheme', () => {
    it('should return a word from the theme', () => {
      const word = getRandomWordFromTheme('Kitchen Appliances');
      expect(word).toBeDefined();
      expect(word?.word).toBeDefined();
      expect(word?.wordHindi).toBeDefined();
      expect(Array.isArray(word?.questions)).toBe(true);
    });

    it('should return undefined for unknown theme', () => {
      const word = getRandomWordFromTheme('Nonexistent');
      expect(word).toBeUndefined();
    });

    it('should return different words over multiple calls', () => {
      const words = new Set<string>();
      for (let i = 0; i < 50; i++) {
        const word = getRandomWordFromTheme('Kitchen Appliances');
        if (word) words.add(word.word);
      }
      // Should get at least 2 different words
      expect(words.size).toBeGreaterThanOrEqual(2);
    });
  });

  describe('getQuestionsForWord', () => {
    it('should return questions array for valid theme and word', () => {
      const questions = getQuestionsForWord('Kitchen Appliances', 'Mixer-grinder');
      expect(Array.isArray(questions)).toBe(true);
      expect(questions.length).toBeGreaterThan(0);
    });

    it('should return empty array for unknown theme', () => {
      const questions = getQuestionsForWord('Nonexistent', 'Mixer-grinder');
      expect(questions).toEqual([]);
    });

    it('should return empty array for unknown word', () => {
      const questions = getQuestionsForWord('Kitchen Appliances', 'Nonexistent Item');
      expect(questions).toEqual([]);
    });

    it('should return questions with correct type field', () => {
      const questions = getQuestionsForWord('Kitchen Appliances', 'Mixer-grinder');
      questions.forEach((q: Question) => {
        expect(['hotSeat', 'physical']).toContain(q.type);
        expect(q.question).toBeDefined();
        expect(q.questionHindi).toBeDefined();
      });
    });
  });

  describe('getPhysicalFormatInfo', () => {
    it('should return format info for thumbs', () => {
      const info = getPhysicalFormatInfo('thumbs');
      expect(info).toBeDefined();
      expect(info.name).toBeDefined();
      expect(info.nameHindi).toBeDefined();
      expect(info.instructions).toBeDefined();
      expect(info.instructionsHindi).toBeDefined();
    });

    it('should return format info for fingers', () => {
      const info = getPhysicalFormatInfo('fingers');
      expect(info).toBeDefined();
      expect(info.name).toBeDefined();
    });

    it('should return format info for stand', () => {
      const info = getPhysicalFormatInfo('stand');
      expect(info).toBeDefined();
    });

    it('should return format info for point', () => {
      const info = getPhysicalFormatInfo('point');
      expect(info).toBeDefined();
    });
  });

  describe('shuffleArray', () => {
    it('should return array with same elements', () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray(original);
      expect(shuffled.sort()).toEqual(original.sort());
    });

    it('should not mutate original array', () => {
      const original = [1, 2, 3, 4, 5];
      const originalCopy = [...original];
      shuffleArray(original);
      expect(original).toEqual(originalCopy);
    });

    it('should handle empty array', () => {
      const shuffled = shuffleArray([]);
      expect(shuffled).toEqual([]);
    });

    it('should handle single element array', () => {
      const shuffled = shuffleArray(['only']);
      expect(shuffled).toEqual(['only']);
    });

    it('should produce different orderings over many runs', () => {
      const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const results = new Set<string>();

      // Run 50 times and collect unique orderings
      for (let i = 0; i < 50; i++) {
        results.add(JSON.stringify(shuffleArray(original)));
      }

      // Should produce at least 2 different orderings
      expect(results.size).toBeGreaterThanOrEqual(2);
    });
  });
});
