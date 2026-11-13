import { describe, expect, test } from 'vitest';
import { DAY_START_HOUR, NIGHT_START_HOUR, themeForHour } from '../../src/lib/theme';

describe('themeForHour', () => {
  test('is day at noon', () => {
    expect(themeForHour(12)).toBe('day');
  });

  test('is night at midnight and late evening', () => {
    expect(themeForHour(0)).toBe('night');
    expect(themeForHour(23)).toBe('night');
  });

  test('switches exactly on the boundary hours', () => {
    expect(themeForHour(DAY_START_HOUR - 1)).toBe('night');
    expect(themeForHour(DAY_START_HOUR)).toBe('day');
    expect(themeForHour(NIGHT_START_HOUR - 1)).toBe('day');
    expect(themeForHour(NIGHT_START_HOUR)).toBe('night');
  });
});
