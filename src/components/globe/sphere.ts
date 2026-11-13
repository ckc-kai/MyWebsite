/**
 * Orthographic projection of points on a tilted, spinning sphere, done by hand so that
 * thousands of points can be placed per frame without per-point trigonometry.
 * Matches d3's `geoOrthographic().rotate([lambda, tilt])`.
 */

const DEG = Math.PI / 180;

export interface SphereView {
  readonly cx: number;
  readonly cy: number;
  readonly radius: number;
  readonly lambdaDeg: number;
  readonly tiltDeg: number;
}

/** A point on the unit sphere. */
export type UnitVector = readonly [number, number, number];

export interface ScreenPoint {
  readonly x: number;
  readonly y: number;
  /** 1 at the centre of the disc, 0 on the limb, negative on the far side. */
  readonly depth: number;
}

export function toUnitVector(lonDeg: number, latDeg: number): UnitVector {
  const cosLat = Math.cos(latDeg * DEG);
  return [cosLat * Math.cos(lonDeg * DEG), cosLat * Math.sin(lonDeg * DEG), Math.sin(latDeg * DEG)];
}

export type Projector = (point: UnitVector) => ScreenPoint;

export function createProjector(view: SphereView): Projector {
  const cosLambda = Math.cos(view.lambdaDeg * DEG);
  const sinLambda = Math.sin(view.lambdaDeg * DEG);
  const cosTilt = Math.cos(view.tiltDeg * DEG);
  const sinTilt = Math.sin(view.tiltDeg * DEG);

  return ([ux, uy, uz]) => {
    const x1 = ux * cosLambda - uy * sinLambda;
    const y1 = ux * sinLambda + uy * cosLambda;
    return {
      x: view.cx + view.radius * y1,
      y: view.cy - view.radius * (uz * cosTilt + x1 * sinTilt),
      depth: x1 * cosTilt - uz * sinTilt,
    };
  };
}

export interface GeoPoint {
  readonly lonDeg: number;
  readonly latDeg: number;
}

/** The place on the globe under a screen position, or null when it misses the sphere. */
export function invertPoint(view: SphereView, x: number, y: number): GeoPoint | null {
  const y1 = (x - view.cx) / view.radius;
  const tilted = -(y - view.cy) / view.radius;
  const depthSquared = 1 - y1 * y1 - tilted * tilted;
  if (depthSquared < 0) return null;

  const depth = Math.sqrt(depthSquared);
  const cosTilt = Math.cos(view.tiltDeg * DEG);
  const sinTilt = Math.sin(view.tiltDeg * DEG);
  const x1 = depth * cosTilt + tilted * sinTilt;
  const uz = tilted * cosTilt - depth * sinTilt;

  const cosLambda = Math.cos(view.lambdaDeg * DEG);
  const sinLambda = Math.sin(view.lambdaDeg * DEG);
  const ux = x1 * cosLambda + y1 * sinLambda;
  const uy = -x1 * sinLambda + y1 * cosLambda;
  return { lonDeg: Math.atan2(uy, ux) / DEG, latDeg: Math.asin(Math.max(-1, Math.min(1, uz))) / DEG };
}

/** Near the poles a tiny pointer move would spin the globe wildly; treat them as this latitude. */
const MAX_GRAB_LATITUDE_DEG = 72;
/** Stop short of the limb, where the surface turns edge-on and the answer blows up. */
const MAX_GRAB_SINE = 0.985;

/**
 * The rotation that puts a grabbed place directly under the pointer's x position.
 * This is what makes a drag feel like holding the surface: the spot under the finger
 * stays under the finger at any latitude, instead of the whole globe turning at one rate.
 */
export function lambdaForGrab(grabbed: GeoPoint, pointerX: number, view: Pick<SphereView, 'cx' | 'radius'>): number {
  const latitude = Math.max(-MAX_GRAB_LATITUDE_DEG, Math.min(MAX_GRAB_LATITUDE_DEG, grabbed.latDeg));
  const sine = (pointerX - view.cx) / (view.radius * Math.cos(latitude * DEG));
  const clamped = Math.max(-MAX_GRAB_SINE, Math.min(MAX_GRAB_SINE, sine));
  return Math.asin(clamped) / DEG - grabbed.lonDeg;
}
