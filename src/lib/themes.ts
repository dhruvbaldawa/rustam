// ABOUTME: Theme definitions and selection utilities
// ABOUTME: Provides theme list and helper functions for theme selection

export const THEMES = [
  'Kitchen Appliances',
  'Vehicles',
  'Furniture',
  'Animals',
  'Fruits',
  'Sports Equipment',
  'Musical Instruments',
  'Office Supplies',
  'Board Games',
  'Snacks',
] as const;

export type Theme = typeof THEMES[number];

export const RANDOM_THEME = 'Random' as const;

export const getThemeForRound = (roundNumber: number): string => {
  // Handle edge case where roundNumber is 0 or negative
  const index = ((roundNumber - 1) % THEMES.length + THEMES.length) % THEMES.length;
  return THEMES[index];
};

export const getRandomTheme = (): string => {
  return THEMES[Math.floor(Math.random() * THEMES.length)];
};
