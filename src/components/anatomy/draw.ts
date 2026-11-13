/** Shared pen strokes for the isometric figures, bound to one camera. */
import * as k from '../../vendor/anatomy/iso-kit.mjs';
import type { Plan, Point2, Point3, Projection, SolidPaths, SolidStyle } from '../../vendor/anatomy/iso-kit.mjs';

export const PLATE_H = 10;
export const FOOT_H = 5;

export interface Draw {
  readonly P: Projection;
  at(point: Point3): Point2;
  S(paths: SolidPaths, style?: SolidStyle): string;
  L(d: string, tone?: string): string;
  D(points: Point3[], size?: number, tone?: string): string;
  slab(plan: Plan, z: number, height: number, style?: SolidStyle, bevel?: number): string;
  post(x: number, y: number, radius: number, z: number, height: number, style?: SolidStyle): string;
  /** A round foot under a post, so nothing stands straight on the plate. */
  collar(x: number, y: number, radius: number): string;
}

export function createDraw(P: Projection): Draw {
  const at = (point: Point3): Point2 => k.iso(point, P);
  const S = (paths: SolidPaths, style?: SolidStyle): string => k.solidSvg(paths, style);
  const L = (d: string, tone = 'lo'): string => k.lineSvg(d, { tone });
  const D = (points: Point3[], size = 0.5, tone = 'mid'): string => k.dotsSvg(points.map(at), { size, tone });
  const slab: Draw['slab'] = (plan, z, height, style, bevel = 0.5) => S(k.slabOf(plan, z, height, P, 4, bevel), style);
  const post: Draw['post'] = (x, y, radius, z, height, style) => S(k.cylinder(x, y, radius, z, height, P, 24), style);
  const collar: Draw['collar'] = (x, y, radius) =>
    post(x, y, radius + 3.2, 0, 2.4, { tone: 'mid' }) + D([[x + radius + 1.6, y, 2.4]], 0.4, 'lo');
  return { P, at, S, L, D, slab, post, collar };
}

/**
 * The bench every figure stands on: a plate on round feet, a soft shadow under it,
 * an inset line, a screw at each corner and, where asked, a ruler strip along the front.
 */
export function benchPlate(draw: Draw, plate: Plan, ruler?: { from: number; length: number }): string {
  const { P, L, D, slab, post } = draw;
  const out = [`<path class="iso-halo" d="${k.haloOf(plate, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  const feet = [...k.corners(plate, 24), [0, plate.y + 24] as Point2, [0, plate.y + plate.d - 24] as Point2];
  for (const [x, y] of feet.sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P))) {
    out.push(post(x, y, 8, -PLATE_H - FOOT_H, FOOT_H, { tone: 'mid' }));
  }
  out.push(slab(plate, -PLATE_H, PLATE_H, { tone: 'mid' }, 1.6));
  out.push(L(k.planOutline(k.insetPlan(plate, 6), 0, P)));
  const screws = k.corners(plate, 12);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.4, 0, P, 16)).join('')));
  out.push(D(screws.map(([x, y]): Point3 => [x, y, 0])));

  if (ruler) {
    const strip: Plan = { x: ruler.from, y: plate.y + plate.d - 20, w: ruler.length, d: 7, r: 1 };
    out.push(slab(strip, 0, 0.7, { tone: 'lo', crease: 'none' }, 0));
    const ticks = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 5, 8, strip.y + 0.8, 0.7, [2, 3.8], P);
    out.push(L(ticks.minor), L(ticks.major, 'mid'));
  }
  return out.join('');
}

export const fine = (value: number): number => Math.round(value * 100) / 100;
