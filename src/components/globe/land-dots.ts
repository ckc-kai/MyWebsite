import { geoContains } from 'd3-geo';
import { LAND } from './land';

const MAX_LATITUDE = 84;
const MIN_COS_LATITUDE = 0.2;
const DEG = Math.PI / 180;
const round1 = (value: number): number => Math.round(value * 10) / 10;

/**
 * Samples land on an equal-spacing grid, for the night view where continents are
 * drawn as points of light. Runs at build time; the result ships as plain numbers.
 * Returns a flat [lon, lat, lon, lat, …] list in degrees.
 */
export function buildLandDots(stepDeg: number): number[] {
  const dots: number[] = [];
  for (let lat = -MAX_LATITUDE; lat <= MAX_LATITUDE; lat += stepDeg) {
    const lonStep = stepDeg / Math.max(MIN_COS_LATITUDE, Math.cos(lat * DEG));
    for (let lon = -180; lon < 180; lon += lonStep) {
      if (geoContains(LAND, [lon, lat])) dots.push(round1(lon), round1(lat));
    }
  }
  return dots;
}
