import { geoOrthographic } from 'd3-geo';
import { describe, expect, test } from 'vitest';
import { createProjector, invertPoint, lambdaForGrab, toUnitVector } from '../../src/components/globe/sphere';

const VIEW = { cx: 400, cy: 300, radius: 250, lambdaDeg: 165, tiltDeg: -38 };
const HANGZHOU: [number, number] = [120.15, 30.27];
// Close to the antipode of the view centre (165°W, 38°N).
const CAPE_TOWN: [number, number] = [18.42, -33.92];

describe('createProjector', () => {
  test('agrees with d3 orthographic projection', () => {
    const d3 = geoOrthographic()
      .scale(VIEW.radius)
      .translate([VIEW.cx, VIEW.cy])
      .rotate([VIEW.lambdaDeg, VIEW.tiltDeg]);
    const expected = d3(HANGZHOU);
    const actual = createProjector(VIEW)(toUnitVector(...HANGZHOU));

    expect(expected).not.toBeNull();
    expect(actual.x).toBeCloseTo(expected![0], 6);
    expect(actual.y).toBeCloseTo(expected![1], 6);
  });

  test('reports a point facing the viewer as in front', () => {
    expect(createProjector(VIEW)(toUnitVector(...HANGZHOU)).depth).toBeGreaterThan(0);
  });

  test('reports a point on the far side as behind', () => {
    expect(createProjector(VIEW)(toUnitVector(...CAPE_TOWN)).depth).toBeLessThan(0);
  });
});

describe('invertPoint', () => {
  test('recovers the place a projected point came from', () => {
    const screen = createProjector(VIEW)(toUnitVector(...HANGZHOU));
    const place = invertPoint(VIEW, screen.x, screen.y);

    expect(place).not.toBeNull();
    expect(place!.lonDeg).toBeCloseTo(HANGZHOU[0], 6);
    expect(place!.latDeg).toBeCloseTo(HANGZHOU[1], 6);
  });

  test('returns null outside the sphere', () => {
    expect(invertPoint(VIEW, VIEW.cx + VIEW.radius + 10, VIEW.cy)).toBeNull();
  });
});

describe('lambdaForGrab', () => {
  const grabbed = { lonDeg: HANGZHOU[0], latDeg: HANGZHOU[1] };

  test('puts the grabbed place exactly under the pointer', () => {
    for (const pointerX of [VIEW.cx - 120, VIEW.cx, VIEW.cx + 85]) {
      const lambdaDeg = lambdaForGrab(grabbed, pointerX, VIEW);
      const screen = createProjector({ ...VIEW, lambdaDeg })(toUnitVector(...HANGZHOU));
      expect(screen.x).toBeCloseTo(pointerX, 6);
      expect(screen.depth).toBeGreaterThan(0);
    }
  });

  test('stays finite when the pointer leaves the sphere', () => {
    expect(Number.isFinite(lambdaForGrab(grabbed, VIEW.cx + VIEW.radius * 3, VIEW))).toBe(true);
  });

  test('does not spin wildly for a grab near the pole', () => {
    const nearPole = { lonDeg: 0, latDeg: 89 };
    const turn = lambdaForGrab(nearPole, VIEW.cx + 20, VIEW) - lambdaForGrab(nearPole, VIEW.cx, VIEW);
    expect(Math.abs(turn)).toBeLessThan(20);
  });
});
