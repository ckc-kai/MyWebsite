import { describe, expect, it } from 'vitest';
import { compactPath, compactSvg } from '../../src/lib/svg-path';

/** Reads an M/m/L/l/Z path back into absolute subpaths, so a compacted path can be compared point by point. */
function absolute(d: string): number[][][] {
  const tokens = d.match(/[MmLlZz]|-?(?:\d+\.?\d*|\.\d+)/g) ?? [];
  const subpaths: number[][][] = [];
  let command = 'M';
  let x = 0;
  let y = 0;
  let startX = 0;
  let startY = 0;
  for (let at = 0; at < tokens.length; ) {
    const token = tokens[at];
    if (/[A-Za-z]/.test(token)) {
      command = token;
      at += 1;
      if (command === 'Z' || command === 'z') {
        subpaths.at(-1)?.push(['Z' as unknown as number]);
        x = startX;
        y = startY;
      }
      continue;
    }
    const dx = Number(tokens[at]);
    const dy = Number(tokens[at + 1]);
    at += 2;
    const relative = command === command.toLowerCase();
    // `+ 0` folds -0 into 0: the same point either way.
    x = Math.round((relative ? x + dx : dx) * 10) / 10 + 0;
    y = Math.round((relative ? y + dy : dy) * 10) / 10 + 0;
    if (command === 'M' || command === 'm') {
      subpaths.push([[x, y]]);
      startX = x;
      startY = y;
      command = relative ? 'l' : 'L';
    } else {
      subpaths.at(-1)?.push([x, y]);
    }
  }
  return subpaths;
}

describe('compactPath', () => {
  it('draws exactly the same points, in fewer characters', () => {
    const d = 'M71.2 204.5L71.5 203.1L72.4 201.8L73.7 200.6L237.9 83.3ZM10 10L-0.3 -4.5L0 0Z';
    const compact = compactPath(d);
    expect(compact.length).toBeLessThan(d.length);
    expect(absolute(compact)).toEqual(absolute(d));
  });

  it('keeps several open subpaths apart', () => {
    const d = 'M0 0L10 0M20 5L20.5 5.5L21 7';
    expect(absolute(compactPath(d))).toEqual(absolute(d));
  });

  it('never lets rounding drift accumulate over a long run', () => {
    const points = Array.from({ length: 400 }, (_, index) => `${index ? 'L' : 'M'}${(index * 0.7).toFixed(1)} ${(Math.sin(index) * 50).toFixed(1)}`);
    const d = points.join('');
    expect(absolute(compactPath(d))).toEqual(absolute(d));
  });

  it('leaves a path it does not understand untouched', () => {
    const arc = 'M10 10A5 5 0 0 1 20 20';
    expect(compactPath(arc)).toBe(arc);
  });
});

describe('compactSvg', () => {
  it('rewrites every d attribute and nothing else', () => {
    const svg = '<g class="L"><path class="iso-top" d="M1 1L2 2L3 3Z"/><path d="M0 0L0.5 0.5"/></g>';
    expect(compactSvg(svg)).toBe('<g class="L"><path class="iso-top" d="M1 1l1 1 1 1Z"/><path d="M0 0l.5.5"/></g>');
  });
});
