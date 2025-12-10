// ABOUTME: Theme definitions and selection utilities
// ABOUTME: Derives theme list from game data JSON

import { getThemeNames } from './gameData';

// Get themes from game data
export const THEMES = getThemeNames();

export type Theme = string;

export const RANDOM_THEME = 'Random' as const;

export const getThemeForRound = (roundNumber: number): string => {
  // Handle edge case where roundNumber is 0 or negative
  const index = ((roundNumber - 1) % THEMES.length + THEMES.length) % THEMES.length;
  return THEMES[index];
};

export const getRandomTheme = (): string => {
  return THEMES[Math.floor(Math.random() * THEMES.length)];
};
