import { describe, expect, test } from 'vitest';
import { approach } from '../../src/lib/motion';

describe('approach', () => {
  test('moves towards the target without overshooting', () => {
    const next = approach(1, 2, 0.1, 0.3);
    expect(next).toBeGreaterThan(1);
    expect(next).toBeLessThan(2);
  });

  test('covers the same ground in one long step as in many short ones', () => {
    let stepped = 1;
    for (let i = 0; i < 10; i += 1) stepped = approach(stepped, 2, 0.05, 0.3);
    expect(approach(1, 2, 0.5, 0.3)).toBeCloseTo(stepped, 10);
  });

  test('stays put when no time has passed', () => {
    expect(approach(1, 2, 0, 0.3)).toBe(1);
  });

  test('settles on the target', () => {
    expect(approach(1, 2, 10, 0.3)).toBeCloseTo(2, 6);
  });
});
