import { describe, expect, it } from 'vitest';
import { inkBandPath, lineSeed, mergeLineRects, noise } from '../../src/lib/ink';

const BAND = { from: 0.2, to: 0.95 };

function numbersIn(path: string): number[] {
  return (path.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
}

describe('mergeLineRects', () => {
  it('joins the boxes of one line into one strip', () => {
    const merged = mergeLineRects([
      { left: 40, top: 100, width: 30, height: 20 },
      { left: 10, top: 100, width: 30, height: 20 },
      { left: 72, top: 101, width: 50, height: 19 },
    ]);
    expect(merged).toEqual([{ left: 10, top: 100, width: 112, height: 20 }]);
  });

  it('keeps separate lines apart, in reading order', () => {
    const merged = mergeLineRects([
      { left: 10, top: 130, width: 80, height: 20 },
      { left: 10, top: 100, width: 80, height: 20 },
    ]);
    expect(merged.map((line) => line.top)).toEqual([100, 130]);
  });

  it('starts a new strip across a wide gap on the same line', () => {
    const merged = mergeLineRects([
      { left: 10, top: 100, width: 40, height: 20 },
      { left: 400, top: 100, width: 40, height: 20 },
    ]);
    expect(merged).toHaveLength(2);
  });

  it('drops empty boxes', () => {
    expect(mergeLineRects([{ left: 10, top: 100, width: 0, height: 20 }])).toEqual([]);
  });
});

describe('inkBandPath', () => {
  const line = { left: 100, top: 200, width: 300, height: 24 };

  it('draws the same stroke for the same seed', () => {
    expect(inkBandPath(line, 42, BAND)).toBe(inkBandPath(line, 42, BAND));
  });

  it('draws a different stroke for a different seed', () => {
    expect(inkBandPath(line, 42, BAND)).not.toBe(inkBandPath(line, 43, BAND));
  });

  it('stays close to the line it marks', () => {
    const values = numbersIn(inkBandPath(line, 7, BAND));
    const xs = values.filter((_, i) => i % 2 === 0);
    const ys = values.filter((_, i) => i % 2 === 1);
    expect(Math.min(...xs)).toBeGreaterThan(line.left - 12);
    expect(Math.max(...xs)).toBeLessThan(line.left + line.width + 12);
    expect(Math.min(...ys)).toBeGreaterThan(line.top);
    expect(Math.max(...ys)).toBeLessThan(line.top + line.height + 4);
  });

  it('keeps the start of a stroke when the selection grows', () => {
    const short = inkBandPath(line, 9, BAND).split(' L')[1];
    const long = inkBandPath({ ...line, width: 600 }, 9, BAND).split(' L')[1];
    expect(short.split(' ')[0]).toBe(long.split(' ')[0]);
  });
});

describe('noise and lineSeed', () => {
  it('noise stays in [0, 1)', () => {
    const samples = Array.from({ length: 200 }, (_, i) => noise(12345, i));
    expect(Math.min(...samples)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...samples)).toBeLessThan(1);
  });

  it('gives a line the same seed wherever the page is scrolled', () => {
    const atTop = lineSeed({ left: 10, top: 500, width: 1, height: 1 }, 0, 0);
    const scrolled = lineSeed({ left: 10, top: 200, width: 1, height: 1 }, 0, 300);
    expect(scrolled).toBe(atTop);
  });
});
