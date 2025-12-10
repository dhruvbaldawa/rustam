// ABOUTME: Game data types and loader for rustam-game-data.json
// ABOUTME: Provides TypeScript types and helper functions for accessing game data

import gameDataJson from '../../rustam-game-data.json';

// Physical response format types
export type PhysicalFormat = 'thumbs' | 'fingers' | 'stand' | 'point';

export interface PhysicalFormatInfo {
  name: string;
  nameHindi: string;
  instructions: string;
  instructionsHindi: string;
}

// Question types
export interface HotSeatQuestion {
  type: 'hotSeat';
  question: string;
  questionHindi: string;
}

export interface PhysicalQuestion {
  type: 'physical';
  question: string;
  questionHindi: string;
  format: PhysicalFormat;
}

export type Question = HotSeatQuestion | PhysicalQuestion;

// Category (theme) structure
export interface Category {
  id: number;
  name: string;
  nameHindi: string;
  difficulty: 'easy' | 'medium' | 'hard';
  style: 'yours' | 'youAreIt';
  styleHindi: string;
  options: string[];
  optionsHindi: string[];
  questions: Question[];
}

// Game info
export interface GameInfo {
  name: string;
  nameHindi: string;
  tagline: string;
  taglineHindi: string;
  version: string;
}

// Full game data structure
export interface GameData {
  gameInfo: GameInfo;
  physicalFormats: Record<PhysicalFormat, PhysicalFormatInfo>;
  categories: Category[];
}

// Type assertion for imported JSON
export const gameData: GameData = gameDataJson as GameData;

// Helper: Get all category names (themes)
export const getThemeNames = (): string[] => {
  return gameData.categories.map((cat) => cat.name);
};

// Helper: Get category by name
export const getCategoryByName = (name: string): Category | undefined => {
  return gameData.categories.find((cat) => cat.name === name);
};

// Helper: Get questions for a category
export const getQuestionsForCategory = (categoryName: string): Question[] => {
  const category = getCategoryByName(categoryName);
  return category?.questions ?? [];
};

// Helper: Get options for a category
export const getOptionsForCategory = (categoryName: string): string[] => {
  const category = getCategoryByName(categoryName);
  return category?.options ?? [];
};

// Helper: Get physical format info
export const getPhysicalFormatInfo = (format: PhysicalFormat): PhysicalFormatInfo => {
  return gameData.physicalFormats[format];
};

// Helper: Shuffle array (Fisher-Yates)
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Helper: Get N unique random options from a category
export const getRandomOptions = (categoryName: string, count: number): string[] => {
  const options = getOptionsForCategory(categoryName);
  const shuffled = shuffleArray(options);
  return shuffled.slice(0, Math.min(count, shuffled.length));
};
