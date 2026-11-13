import { describe, expect, test } from 'vitest';
import { spreadMarks } from '../../src/lib/spread';

const countMarked = (marks: boolean[]): number => marks.filter(Boolean).length;

describe('spreadMarks', () => {
  test('marks exactly as many as asked', () => {
    for (const marked of [0, 10, 15, 19, 76, 100]) {
      expect(countMarked(spreadMarks(100, marked))).toBe(marked);
    }
  });

  test('rounds a fractional count', () => {
    expect(countMarked(spreadMarks(100, 76.46))).toBe(76);
    expect(countMarked(spreadMarks(100, 19.42))).toBe(19);
  });

  test('never marks more than there are slots, nor fewer than none', () => {
    expect(countMarked(spreadMarks(20, 50))).toBe(20);
    expect(countMarked(spreadMarks(20, -3))).toBe(0);
  });

  test('spreads the marks instead of bunching them at one end', () => {
    const marks = spreadMarks(100, 10);
    expect(countMarked(marks.slice(0, 50))).toBe(5);
    expect(countMarked(marks.slice(50))).toBe(5);
  });
});
