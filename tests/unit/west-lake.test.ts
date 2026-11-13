import { describe, expect, it } from 'vitest';
import { drawWestLake, type WestLakeKey } from '../../src/components/westlake/scenes';
import { JOURNEY_ZH, type StationCopy } from '../../src/content/zh';

const KEYS: readonly WestLakeKey[] = ['duanqiao', 'santan', 'leifeng', 'sudi', 'quyuan'];
/** Five sketches inline on the page: keep them together under this many bytes before compression. */
const BUDGET_BYTES = 160_000;

describe('the West Lake sketches', () => {
  it('each draws a complete picture with no broken numbers', () => {
    for (const key of KEYS) {
      const svg = drawWestLake(key);
      expect(svg.startsWith('<svg'), key).toBe(true);
      expect(svg).toContain('viewBox="0 0 360 260"');
      expect(svg, key).not.toMatch(/NaN|undefined|Infinity/);
    }
  });

  it('draws the same picture on every build', () => {
    for (const key of KEYS) expect(drawWestLake(key)).toBe(drawWestLake(key));
  });

  it('gives every sketch its own filter ids, so five can share a page', () => {
    const prefixes = KEYS.map((key) => /id="(\w+)-rough"/.exec(drawWestLake(key))?.[1]);
    expect(new Set(prefixes).size).toBe(KEYS.length);
  });

  it('stays light enough to inline', () => {
    const total = KEYS.reduce((sum, key) => sum + drawWestLake(key).length, 0);
    expect(total).toBeLessThan(BUDGET_BYTES);
  });

  it('is what the Hangzhou stop asks for', () => {
    const hangzhou: StationCopy | undefined = JOURNEY_ZH.stations.find((station) => station.id === 'hangzhou');
    expect(hangzhou?.sketches?.map((sketch) => sketch.key)).toEqual(KEYS);
  });
});
