/**
 * Globe rotation as a pure state machine. Longitude only: the tilt is fixed,
 * so the globe can be spun left or right but never tumbled.
 *
 * `lambda` is the projection's rotation angle in degrees. Increasing it moves
 * the surface from left to right on screen, which is the way the Earth turns.
 */

export const AUTO_SPEED_DEG_PER_S = 2.5;
export const AUTO_RAMP_S = 1.5;
export const RESUME_DELAY_S = 3;
export const INERTIA_HALF_LIFE_S = 0.22;
export const INERTIA_STOP_DEG_PER_S = 1.5;
export const INERTIA_MAX_DEG_PER_S = 240;
export const TRAVEL_MIN_S = 0.9;
export const TRAVEL_MAX_S = 2.4;

const HALF_TURN = 180;
const FULL_TURN = 360;
const VELOCITY_SMOOTHING = 0.6;

export type RotationMode = 'auto' | 'drag' | 'inertia' | 'rest' | 'travel' | 'hold';

interface Travel {
  readonly from: number;
  readonly delta: number;
  readonly duration: number;
}

export interface RotationState {
  readonly lambda: number;
  readonly mode: RotationMode;
  /** Degrees per second; meaningful in `drag` and `inertia`. */
  readonly velocity: number;
  /** Seconds spent in the current mode. */
  readonly modeTime: number;
  readonly autoEnabled: boolean;
  readonly travel: Travel | null;
}

export interface RotationOptions {
  readonly auto: boolean;
}

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));
const easeOutCubic = (t: number): number => 1 - (1 - t) ** 3;
const easeInOutCubic = (t: number): number => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);

/** Signed shortest angular distance from one longitude to another, in [-180, 180]. */
export function shortestDelta(from: number, to: number): number {
  const wrapped = (((to - from + HALF_TURN) % FULL_TURN) + FULL_TURN) % FULL_TURN;
  return wrapped - HALF_TURN;
}

/** Longer hops take longer, but a short one never drags and a long one never drags on. */
export function travelDuration(deltaDeg: number): number {
  const share = Math.abs(deltaDeg) / HALF_TURN;
  return clamp(TRAVEL_MIN_S + share * (TRAVEL_MAX_S - TRAVEL_MIN_S), TRAVEL_MIN_S, TRAVEL_MAX_S);
}

export function createRotation(lambda: number, options: RotationOptions): RotationState {
  return {
    lambda,
    mode: options.auto ? 'auto' : 'rest',
    velocity: 0,
    modeTime: 0,
    autoEnabled: options.auto,
    travel: null,
  };
}

const enter = (state: RotationState, mode: RotationMode, patch: Partial<RotationState> = {}): RotationState => ({
  ...state,
  travel: null,
  velocity: 0,
  ...patch,
  mode,
  modeTime: 0,
});

export function beginDrag(state: RotationState): RotationState {
  return enter(state, 'drag');
}

export function dragBy(state: RotationState, deltaDeg: number, dt: number): RotationState {
  if (state.mode !== 'drag' || dt <= 0) return state;
  const instant = clamp(deltaDeg / dt, -INERTIA_MAX_DEG_PER_S, INERTIA_MAX_DEG_PER_S);
  const velocity = state.velocity * (1 - VELOCITY_SMOOTHING) + instant * VELOCITY_SMOOTHING;
  return { ...state, lambda: state.lambda + deltaDeg, velocity };
}

export function endDrag(state: RotationState): RotationState {
  if (state.mode !== 'drag') return state;
  return Math.abs(state.velocity) > INERTIA_STOP_DEG_PER_S
    ? enter(state, 'inertia', { velocity: state.velocity })
    : enter(state, 'rest');
}

export function travelTo(state: RotationState, targetLambda: number): RotationState {
  const delta = shortestDelta(state.lambda, targetLambda);
  return enter(state, 'travel', {
    travel: { from: state.lambda, delta, duration: travelDuration(delta) },
  });
}

/** Releases a held or travelling globe back to free viewing. */
export function release(state: RotationState): RotationState {
  return enter(state, 'rest');
}

export function step(state: RotationState, dt: number): RotationState {
  const modeTime = state.modeTime + dt;

  switch (state.mode) {
    case 'auto': {
      // Sample the ramp at the middle of the frame so the ease-in doesn't depend on frame rate.
      const ramp = easeOutCubic(clamp((state.modeTime + dt / 2) / AUTO_RAMP_S, 0, 1));
      return { ...state, modeTime, lambda: state.lambda + AUTO_SPEED_DEG_PER_S * ramp * dt };
    }
    case 'inertia': {
      const velocity = state.velocity * 0.5 ** (dt / INERTIA_HALF_LIFE_S);
      if (Math.abs(velocity) < INERTIA_STOP_DEG_PER_S) return enter(state, 'rest');
      return { ...state, modeTime, velocity, lambda: state.lambda + velocity * dt };
    }
    case 'rest':
      return state.autoEnabled && modeTime >= RESUME_DELAY_S ? enter(state, 'auto') : { ...state, modeTime };
    case 'travel': {
      if (!state.travel) return enter(state, 'hold');
      const progress = clamp(modeTime / state.travel.duration, 0, 1);
      const lambda = state.travel.from + state.travel.delta * easeInOutCubic(progress);
      return progress >= 1 ? enter(state, 'hold', { lambda }) : { ...state, modeTime, lambda };
    }
    case 'drag':
    case 'hold':
      return { ...state, modeTime };
  }
}

/** True when the next frame will look different from this one. */
export function isMoving(state: RotationState): boolean {
  return state.mode === 'auto' || state.mode === 'inertia' || state.mode === 'travel' || state.mode === 'drag';
}
