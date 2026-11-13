import { describe, expect, test } from 'vitest';
import { isTheme } from '../../src/lib/theme';

describe('isTheme', () => {
  test('accepts the two themes', () => {
    expect(isTheme('day')).toBe(true);
    expect(isTheme('night')).toBe(true);
  });

  test('rejects anything else a button or the address bar might carry', () => {
    for (const value of ['', 'Day', 'dark', null, undefined, 1]) expect(isTheme(value)).toBe(false);
  });
});
