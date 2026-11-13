/** Types for the parts of the Anatomy drawing kit this site uses. */
export interface Projection {
  origin: [number, number];
  scale: number;
  azimuth: number;
  elevation: number;
}
export interface Plan {
  x: number;
  y: number;
  w: number;
  d: number;
  r: number;
}
export interface SolidPaths {
  fill: string;
  top: string;
  outline: string;
  shades: string[];
}
export interface SolidStyle {
  tone?: string;
  crease?: string;
  halo?: boolean;
  lit?: boolean;
  flat?: boolean;
  className?: string;
  inner?: string;
}
export interface LineStyle {
  tone?: string;
  dotted?: boolean;
  dashed?: boolean;
  flow?: boolean;
  className?: string;
}
export type Point2 = [number, number];
export type Point3 = [number, number, number];
export interface Ticks {
  minor: string;
  major: string;
}

export function fitProjection(points: Point3[], width: number, height: number, options?: { pad?: number; headroom?: number; azimuth?: number; elevation?: number }): Projection;
export function iso(point: Point3, projection: Projection): Point2;
export function depthOf(point: Point3, projection: Projection): number;
export function axisVector(projection: Projection, by: Point3): Point2;
export function boxCorners(plan: Pick<Plan, 'x' | 'y' | 'w' | 'd'>, z0: number, z1: number): Point3[];
export function corners(plan: Pick<Plan, 'x' | 'y' | 'w' | 'd'>, inset?: number): Point2[];
export function insetPlan(plan: Plan, by: number): Plan;
export function slabOf(plan: Plan, z: number, height: number, projection: Projection, steps?: number, bevel?: number): SolidPaths;
export function cylinder(cx: number, cy: number, radius: number, z: number, height: number, projection: Projection, steps?: number, bevel?: number): SolidPaths;
export function haloOf(plan: Plan, z: number, height: number, projection: Projection): string;
export function planOutline(plan: Plan, z: number, projection: Projection, steps?: number): string;
export function lineOnTop(from: Point2, to: Point2, z: number, projection: Projection): string;
export function segment(from: Point3, to: Point3, projection: Projection): string;
export function ring(cx: number, cy: number, radius: number, z: number, projection: Projection, steps?: number): string;
export function knurl(cx: number, cy: number, radius: number, z0: number, z1: number, count: number, projection: Projection, inset?: number): string;
export function sideArc(cx: number, cy: number, radius: number, z: number, projection: Projection, steps?: number): string;
export function topTicks(from: number, to: number, step: number, every: number, edge: number, z: number, lengths: [number, number], projection: Projection, axis?: 'x' | 'y'): Ticks;
export function radialTicks(cx: number, cy: number, radius: number, count: number, every: number, z: number, lengths: [number, number], projection: Projection, from?: number, span?: number): Ticks;
export function solidSvg(paths: SolidPaths, style?: SolidStyle): string;
export function lineSvg(d: string, style?: LineStyle): string;
export function dotsSvg(points: Point2[], style?: { size?: number; tone?: string }): string;
