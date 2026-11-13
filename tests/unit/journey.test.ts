import { describe, expect, test } from 'vitest';
import { LEGS, STATIONS, STOPS, findStop } from '../../src/lib/journey';

describe('journey data', () => {
  test('every leg connects two known stations', () => {
    for (const leg of LEGS) {
      expect(STATIONS[leg.from]).toBeDefined();
      expect(STATIONS[leg.to]).toBeDefined();
    }
  });

  test('legs form one continuous path through time', () => {
    const visited = new Set<string>([LEGS[0].from]);
    for (const leg of LEGS) {
      expect(visited.has(leg.from)).toBe(true);
      visited.add(leg.to);
    }
  });

  test('every station has valid coordinates and both language names', () => {
    for (const station of Object.values(STATIONS)) {
      const [lon, lat] = station.lonLat;
      expect(Math.abs(lon)).toBeLessThanOrEqual(180);
      expect(Math.abs(lat)).toBeLessThanOrEqual(90);
      expect(station.name.zh.length).toBeGreaterThan(0);
      expect(station.name.en.length).toBeGreaterThan(0);
    }
  });
});

describe('stops', () => {
  test('never light more road than exists, and never un-light it going forward', () => {
    let previous = 0;
    for (const stop of STOPS) {
      if (stop.litLegs === null) continue;
      expect(stop.litLegs).toBeLessThanOrEqual(LEGS.length);
      expect(stop.litLegs).toBeGreaterThanOrEqual(previous);
      previous = stop.litLegs;
    }
  });

  test('dock at the place the last lit leg arrives at', () => {
    for (const stop of STOPS) {
      if (stop.litLegs === null || stop.litLegs === 0) continue;
      expect(LEGS[stop.litLegs - 1].to, stop.id).toBe(stop.station);
    }
  });

  test('have unique ids, and open and close on a freely turning globe', () => {
    expect(new Set(STOPS.map((stop) => stop.id)).size).toBe(STOPS.length);
    expect(STOPS[0].station).toBeNull();
    expect(STOPS[STOPS.length - 1].station).toBeNull();
  });

  test('can be looked up by id', () => {
    expect(findStop('uva')?.station).toBe('VA');
    expect(findStop('nowhere')).toBeUndefined();
  });
});
