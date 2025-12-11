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

// Word with its specific questions
export interface Word {
  word: string;
  wordHindi: string;
  questions: Question[];
}

// Theme structure (contains words, each with their own questions)
export interface Theme {
  id: number;
  name: string;
  nameHindi: string;
  difficulty: 'easy' | 'medium' | 'hard';
  style: 'yours' | 'youAreIt';
  styleHindi: string;
  words: Word[];
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
  themes: Theme[];
}

// Type assertion for imported JSON
export const gameData: GameData = gameDataJson as GameData;

// Helper: Get all theme names
export const getThemeNames = (): string[] => {
  return gameData.themes.map((theme) => theme.name);
};

// Helper: Get theme by name
export const getThemeByName = (name: string): Theme | undefined => {
  return gameData.themes.find((theme) => theme.name === name);
};

// Helper: Get a random word from a theme
export const getRandomWordFromTheme = (themeName: string): Word | undefined => {
  const theme = getThemeByName(themeName);
  if (!theme || theme.words.length === 0) return undefined;
  const randomIndex = Math.floor(Math.random() * theme.words.length);
  return theme.words[randomIndex];
};

// Helper: Get questions for a specific word in a theme
export const getQuestionsForWord = (themeName: string, wordText: string): Question[] => {
  const theme = getThemeByName(themeName);
  const word = theme?.words.find((w) => w.word === wordText);
  return word?.questions ?? [];
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
