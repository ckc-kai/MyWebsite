import { describe, expect, test } from 'vitest';
import {
  AUTO_SPEED_DEG_PER_S,
  RESUME_DELAY_S,
  TRAVEL_MAX_S,
  TRAVEL_MIN_S,
  beginDrag,
  createRotation,
  dragBy,
  endDrag,
  shortestDelta,
  step,
  travelDuration,
  travelTo,
} from '../../src/lib/rotation';

const run = (state: ReturnType<typeof createRotation>, seconds: number, dt = 1 / 60) => {
  let current = state;
  for (let elapsed = 0; elapsed < seconds; elapsed += dt) current = step(current, dt);
  return current;
};

describe('shortestDelta', () => {
  test('takes the short way across the antimeridian', () => {
    expect(shortestDelta(170, -170)).toBe(20);
    expect(shortestDelta(-170, 170)).toBe(-20);
  });

  test('returns zero for equal longitudes a full turn apart', () => {
    expect(shortestDelta(30, 390)).toBe(0);
  });
});

describe('travelDuration', () => {
  test('never drops below the minimum for a short hop', () => {
    expect(travelDuration(0)).toBe(TRAVEL_MIN_S);
    expect(travelDuration(2)).toBeGreaterThanOrEqual(TRAVEL_MIN_S);
    expect(travelDuration(2)).toBeLessThan(TRAVEL_MIN_S + 0.1);
  });

  test('never exceeds the maximum for a half turn', () => {
    expect(travelDuration(180)).toBe(TRAVEL_MAX_S);
  });

  test('grows with angular distance in between', () => {
    expect(travelDuration(120)).toBeGreaterThan(travelDuration(40));
  });
});

describe('auto rotation', () => {
  test('eases in instead of starting at full speed', () => {
    const early = step(createRotation(0, { auto: true }), 0.1);
    expect(early.lambda).toBeGreaterThan(0);
    expect(early.lambda).toBeLessThan(AUTO_SPEED_DEG_PER_S * 0.1);
  });

  test('settles at the cruising speed', () => {
    const before = run(createRotation(0, { auto: true }), 5);
    const after = step(before, 1);
    expect(after.lambda - before.lambda).toBeCloseTo(AUTO_SPEED_DEG_PER_S, 5);
  });

  test('stays still when auto rotation is disabled', () => {
    expect(run(createRotation(42, { auto: false }), 10).lambda).toBe(42);
  });
});

describe('manual takeover', () => {
  test('follows the pointer one to one while dragging', () => {
    const dragging = dragBy(beginDrag(createRotation(10, { auto: true })), 15, 0.016);
    expect(dragging.lambda).toBe(25);
    expect(dragging.mode).toBe('drag');
  });

  test('does not advance on its own while held', () => {
    const held = beginDrag(createRotation(10, { auto: true }));
    expect(run(held, 2).lambda).toBe(10);
  });

  test('keeps gliding after release and then comes to rest', () => {
    const released = endDrag(dragBy(beginDrag(createRotation(0, { auto: true })), 4, 0.016));
    const shortlyAfter = step(released, 0.1);
    expect(shortlyAfter.mode).toBe('inertia');
    expect(shortlyAfter.lambda).toBeGreaterThan(released.lambda);
    expect(run(released, 2).mode).toBe('rest');
  });

  test('a release without movement goes straight to rest', () => {
    expect(endDrag(beginDrag(createRotation(0, { auto: true }))).mode).toBe('rest');
  });

  test('hands control back to auto rotation after the resume delay', () => {
    const resting = endDrag(beginDrag(createRotation(0, { auto: true })));
    expect(run(resting, RESUME_DELAY_S - 0.5).mode).toBe('rest');
    expect(run(resting, RESUME_DELAY_S + 0.5).mode).toBe('auto');
  });

  test('never resumes when auto rotation is disabled', () => {
    const resting = endDrag(beginDrag(createRotation(0, { auto: false })));
    expect(run(resting, RESUME_DELAY_S * 3).mode).toBe('rest');
  });
});

describe('travel', () => {
  test('arrives at the target and holds there', () => {
    const arrived = run(travelTo(createRotation(170, { auto: true }), -170), TRAVEL_MAX_S + 0.1);
    expect(arrived.mode).toBe('hold');
    expect(shortestDelta(arrived.lambda, -170)).toBeCloseTo(0, 6);
  });

  test('goes the short way round', () => {
    const midway = run(travelTo(createRotation(170, { auto: true }), -170), 0.3);
    expect(midway.lambda).toBeGreaterThan(170);
    expect(midway.lambda).toBeLessThan(190);
  });

  test('does not mutate the state it is given', () => {
    const start = createRotation(0, { auto: true });
    step(start, 1);
    expect(start.lambda).toBe(0);
  });
});
