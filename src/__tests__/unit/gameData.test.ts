import { describe, it, expect, vi } from 'vitest';
import {
  gameData,
  getThemeNames,
  getCategoryByName,
  getQuestionsForCategory,
  getOptionsForCategory,
  getPhysicalFormatInfo,
  shuffleArray,
  getRandomOptions,
} from '../../lib/gameData';

describe('gameData', () => {
  describe('gameData constant', () => {
    it('should have gameInfo with required fields', () => {
      expect(gameData.gameInfo).toBeDefined();
      expect(gameData.gameInfo.name).toBe('Rustam');
      expect(gameData.gameInfo.version).toBeDefined();
    });

    it('should have categories array', () => {
      expect(Array.isArray(gameData.categories)).toBe(true);
      expect(gameData.categories.length).toBeGreaterThan(0);
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

  describe('getCategoryByName', () => {
    it('should return category for valid theme name', () => {
      const category = getCategoryByName('Kitchen Appliances');
      expect(category).toBeDefined();
      expect(category?.name).toBe('Kitchen Appliances');
      expect(category?.options).toBeDefined();
      expect(category?.questions).toBeDefined();
    });

    it('should return undefined for unknown theme', () => {
      const category = getCategoryByName('Nonexistent Theme');
      expect(category).toBeUndefined();
    });

    it('should return category with correct structure', () => {
      const category = getCategoryByName('Vehicles');
      expect(category).toBeDefined();
      expect(category?.id).toBeDefined();
      expect(category?.nameHindi).toBeDefined();
      expect(category?.difficulty).toMatch(/^(easy|medium|hard)$/);
      expect(category?.style).toMatch(/^(yours|youAreIt)$/);
    });
  });

  describe('getQuestionsForCategory', () => {
    it('should return questions array for valid category', () => {
      const questions = getQuestionsForCategory('Kitchen Appliances');
      expect(Array.isArray(questions)).toBe(true);
      expect(questions.length).toBeGreaterThan(0);
    });

    it('should return empty array for unknown category', () => {
      const questions = getQuestionsForCategory('Nonexistent');
      expect(questions).toEqual([]);
    });

    it('should return questions with correct type field', () => {
      const questions = getQuestionsForCategory('Kitchen Appliances');
      questions.forEach((q) => {
        expect(['hotSeat', 'physical']).toContain(q.type);
        expect(q.question).toBeDefined();
        expect(q.questionHindi).toBeDefined();
      });
    });
  });

  describe('getOptionsForCategory', () => {
    it('should return options array for valid category', () => {
      const options = getOptionsForCategory('Kitchen Appliances');
      expect(Array.isArray(options)).toBe(true);
      expect(options.length).toBeGreaterThan(0);
      expect(options.every((o) => typeof o === 'string')).toBe(true);
    });

    it('should return empty array for unknown category', () => {
      const options = getOptionsForCategory('Nonexistent');
      expect(options).toEqual([]);
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

  describe('getRandomOptions', () => {
    it('should return requested number of options', () => {
      const options = getRandomOptions('Kitchen Appliances', 3);
      expect(options.length).toBe(3);
    });

    it('should return unique options', () => {
      const options = getRandomOptions('Kitchen Appliances', 5);
      const uniqueOptions = new Set(options);
      expect(uniqueOptions.size).toBe(options.length);
    });

    it('should limit to available options if count exceeds', () => {
      const allOptions = getOptionsForCategory('Kitchen Appliances');
      const requested = allOptions.length + 10;
      const options = getRandomOptions('Kitchen Appliances', requested);
      expect(options.length).toBe(allOptions.length);
    });

    it('should return empty array for unknown category', () => {
      const options = getRandomOptions('Nonexistent', 5);
      expect(options).toEqual([]);
    });

    it('should return different selections on repeated calls', () => {
      const results = new Set<string>();

      for (let i = 0; i < 20; i++) {
        results.add(JSON.stringify(getRandomOptions('Kitchen Appliances', 3).sort()));
      }

      // Should get at least 2 different selections
      expect(results.size).toBeGreaterThanOrEqual(2);
    });
  });
});
