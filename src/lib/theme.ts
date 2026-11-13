/** Day or night follows the visitor's own clock, like the cabin lights on a long flight. */

export const DAY_START_HOUR = 6;
export const NIGHT_START_HOUR = 18;
export const THEME_STORAGE_KEY = 'theme-override';

export type Theme = 'day' | 'night';

export function themeForHour(hour: number): Theme {
  return hour >= DAY_START_HOUR && hour < NIGHT_START_HOUR ? 'day' : 'night';
}

export function isTheme(value: unknown): value is Theme {
  return value === 'day' || value === 'night';
}
