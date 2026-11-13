/**
 * Brush helpers for the West Lake ink sketches. A stroke is a centre line turned into a filled shape
 * whose width swells and tapers like a brush pressed down and lifted off. Everything is drawn at build
 * time into SVG path strings, and every bit of randomness is seeded, so each build draws the same picture.
 */

export type Point = readonly [number, number];

const round = (n: number): number => Math.round(n * 10) / 10;

export const pt = ([x, y]: Point): string => `${round(x)} ${round(y)}`;

/** Samples per segment when a line is smoothed: enough for the eye, few enough to keep the page light. */
const SAMPLES = 6;

/** A Catmull-Rom curve through the points, sampled densely. */
export function smooth(points: readonly Point[], perSegment = SAMPLES): Point[] {
  if (points.length < 3) return [...points];
  const out: Point[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    for (let s = 0; s < perSegment; s++) {
      const t = s / perSegment;
      const t2 = t * t;
      const t3 = t2 * t;
      const c = (a: number, b: number, c2: number, d: number): number =>
        0.5 * (2 * b + (-a + c2) * t + (2 * a - 5 * b + 4 * c2 - d) * t2 + (-a + 3 * b - 3 * c2 + d) * t3);
      out.push([c(p0[0], p1[0], p2[0], p3[0]), c(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(points[points.length - 1]);
  return out;
}

export interface StrokeOptions {
  /** The widest the stroke gets. */
  readonly w?: number;
  /** Share of the length over which the brush presses on. */
  readonly start?: number;
  /** Share of the length over which it lifts off. */
  readonly end?: number;
  /** How thin the tips are, as a share of `w`. */
  readonly min?: number;
}

/** A brush stroke along the points, as a closed path. */
export function stroke(points: readonly Point[], { w = 3, start = 0.18, end = 0.3, min = 0.12 }: StrokeOptions = {}): string {
  const p = smooth(points);
  const lengths = p.reduce<number[]>((acc, q, i) => [...acc, i === 0 ? 0 : acc[i - 1] + Math.hypot(q[0] - p[i - 1][0], q[1] - p[i - 1][1])], []);
  const total = lengths[lengths.length - 1] || 1;
  const sides = p.map((q, i) => {
    const t = lengths[i] / total;
    const a = p[Math.max(0, i - 1)];
    const b = p[Math.min(p.length - 1, i + 1)];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const nx = -(b[1] - a[1]) / len;
    const ny = (b[0] - a[0]) / len;
    let k = 1;
    if (start > 0 && t < start) k = min + (1 - min) * Math.sin(((t / start) * Math.PI) / 2);
    else if (end > 0 && t > 1 - end) k = min + (1 - min) * Math.sin((((1 - t) / end) * Math.PI) / 2);
    const half = (w * k) / 2;
    return { left: [q[0] + nx * half, q[1] + ny * half] as Point, right: [q[0] - nx * half, q[1] - ny * half] as Point };
  });
  const left = sides.map((side) => side.left);
  const right = sides.map((side) => side.right).reverse();
  return `M${left.map(pt).join('L')}L${right.map(pt).join('L')}Z`;
}

/** A closed, smoothed outline through the points. */
export function blob(points: readonly Point[]): string {
  const p = smooth([...points, points[0], points[1]], 8).slice(0, -8);
  return `M${p.map(pt).join('L')}Z`;
}

/** A repeatable pseudo-random sequence in [0, 1). */
export function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface WillowOptions {
  readonly base: Point;
  readonly top: Point;
  readonly spread?: number;
  readonly count?: number;
  readonly drop?: number;
  readonly seed?: number;
  readonly w?: number;
  readonly trunkWidth?: number;
}

export interface Willow {
  readonly trunk: string;
  readonly branches: readonly string[];
  readonly leaves: readonly string[];
}

/** A willow: a leaning trunk with a fork, and long branches that arch out and then hang. */
export function willow({ base, top, spread = 70, count = 9, drop = 90, seed = 1, w = 1, trunkWidth = 4.6 }: WillowOptions): Willow {
  const r = rng(seed);
  const lean = top[0] - base[0];
  const mid: Point = [base[0] + lean * 0.35 + 5, base[1] + (top[1] - base[1]) * 0.55];
  const trunk =
    stroke([base, mid, [top[0] - 2, top[1] + 10], top], { w: trunkWidth, start: 0.02, end: 0.45, min: 0.3 }) +
    stroke([mid, [mid[0] + 10, mid[1] - 14], [mid[0] + 20, mid[1] - 22]], { w: trunkWidth * 0.5, start: 0.02, end: 0.6, min: 0.2 });
  const branches: string[] = [];
  const leaves: string[] = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const ox = top[0] + (t - 0.5) * spread * 0.5;
    const oy = top[1] + Math.abs(t - 0.5) * 10;
    const out = (t - 0.5) * spread;
    const peak: Point = [ox + out * 0.45, oy - 2 - r() * 4];
    const len = drop * (0.55 + r() * 0.5);
    const sway = (r() - 0.5) * 8;
    const pts: Point[] = [[ox, oy], peak, [ox + out * 0.9, oy + len * 0.35], [ox + out + sway * 0.5, oy + len * 0.7], [ox + out + sway, oy + len]];
    branches.push(stroke(pts, { w, start: 0.05, end: 0.5, min: 0.1 }));
    const dense = smooth(pts, 8);
    for (let j = 10; j < dense.length - 1; j += 3) {
      const [x, y] = dense[j];
      const side = j % 2 ? 1 : -1;
      leaves.push(stroke([[x, y], [x + side * 2.2, y + 3]], { w: 1.3, start: 0.3, end: 0.6, min: 0.2 }));
    }
  }
  return { trunk, branches, leaves };
}

/** A few short level strokes for water. Each line is [x, y, length]. */
export function ripples(lines: ReadonlyArray<readonly [number, number, number]>, seed = 3): string[] {
  const r = rng(seed);
  return lines.map(([x, y, len]) => {
    const wob = (r() - 0.5) * 1.2;
    return stroke([[x, y], [x + len * 0.5, y + wob], [x + len, y + wob * 0.3]], { w: 1.4 + r() * 0.8, start: 0.25, end: 0.45, min: 0.1 });
  });
}
