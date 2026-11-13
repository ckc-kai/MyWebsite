/**
 * Moves a value towards a target with exponential smoothing: fast at first, settling gently,
 * and independent of frame rate. `timeConstant` is the time to cover about 63% of the gap.
 */
export function approach(current: number, target: number, dt: number, timeConstant: number): number {
  if (timeConstant <= 0 || dt <= 0) return dt <= 0 ? current : target;
  return target + (current - target) * Math.exp(-dt / timeConstant);
}
