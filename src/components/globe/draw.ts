import { geoGraticule10, geoOrthographic, geoPath } from 'd3-geo';
import type { GeoPermissibleObjects } from 'd3-geo';
import { LEGS, STATIONS } from '../../lib/journey';
import type { LegKind, StationId } from '../../lib/journey';
import { LAND } from './land';
import { createProjector, toUnitVector } from './sphere';
import type { SphereView, UnitVector } from './sphere';

export type LandMode = 'fill' | 'dots';

export interface GlobePalette {
  readonly sphere: string;
  readonly sphereEdge: string;
  readonly graticule: string;
  readonly land: string;
  readonly landMode: LandMode;
  readonly study: string;
  readonly work: string;
  readonly station: string;
  readonly stationRing: string;
}

/** Sizes are tuned at this radius and scale with the globe. */
const REFERENCE_RADIUS = 500;
const ROUTE_WIDTH = 2.2;
const STATION_RADIUS = 4.6;
const STATION_RING_WIDTH = 1.6;
const DOT_RADIUS = 1.45;
const DOT_ALPHA = 0.55;
const DOT_MIN_DEPTH = 0.05;
const WORK_DASH: readonly [number, number] = [1, 7];
const LIMB_SHADE_CENTER: readonly [number, number] = [-0.16, -0.24];
/** Road not yet travelled stays on the map, but only faintly. */
const UNLIT_ALPHA = 0.2;
const CURRENT_RING_SCALE = 2.3;
const CURRENT_RING_WIDTH = 1.8;

const GRATICULE = geoGraticule10();
const LEG_LINES = LEGS.map((leg) => ({
  kind: leg.kind,
  line: {
    type: 'LineString',
    coordinates: [[...STATIONS[leg.from].lonLat], [...STATIONS[leg.to].lonLat]],
  } satisfies GeoPermissibleObjects,
}));
const STATION_POINTS = Object.values(STATIONS).map((station) => ({
  id: station.id,
  vector: toUnitVector(...station.lonLat),
}));

/** Where the story currently is: drives which road is lit and which station is ringed. */
export interface RouteProgress {
  /** Legs travelled so far, or null when the whole route is shown. */
  readonly litLegs: number | null;
  readonly current: StationId | null;
  /** The globe's radius before zooming, so strokes and dots keep their size when it grows. */
  readonly baseRadius: number;
}

export function toDotVectors(flatLonLat: readonly number[]): UnitVector[] {
  const vectors: UnitVector[] = [];
  for (let i = 0; i + 1 < flatLonLat.length; i += 2) {
    vectors.push(toUnitVector(flatLonLat[i], flatLonLat[i + 1]));
  }
  return vectors;
}

export function readPalette(element: Element): GlobePalette {
  const style = getComputedStyle(element);
  const read = (name: string): string => style.getPropertyValue(name).trim();
  return {
    sphere: read('--globe-sphere'),
    sphereEdge: read('--globe-sphere-edge'),
    graticule: read('--globe-graticule'),
    land: read('--globe-land'),
    landMode: read('--globe-land-mode') === 'dots' ? 'dots' : 'fill',
    study: read('--color-study'),
    work: read('--color-work'),
    station: read('--globe-station'),
    stationRing: read('--globe-station-ring'),
  };
}

export type GlobePainter = (
  view: SphereView,
  palette: GlobePalette,
  dots: readonly UnitVector[],
  progress: RouteProgress,
) => void;

export function createGlobePainter(ctx: CanvasRenderingContext2D): GlobePainter {
  const projection = geoOrthographic().clipAngle(90).precision(0.4);
  const path = geoPath(projection, ctx);
  const routeColor = (palette: GlobePalette, kind: LegKind): string => (kind === 'study' ? palette.study : palette.work);

  return (view, palette, dots, progress) => {
    const { cx, cy, radius } = view;
    const scale = progress.baseRadius / REFERENCE_RADIUS;
    projection.scale(radius).translate([cx, cy]).rotate([view.lambdaDeg, view.tiltDeg]);

    const shade = ctx.createRadialGradient(
      cx + radius * LIMB_SHADE_CENTER[0], cy + radius * LIMB_SHADE_CENTER[1], 0,
      cx, cy, radius,
    );
    shade.addColorStop(0, palette.sphere);
    shade.addColorStop(1, palette.sphereEdge);
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = shade;
    ctx.fill();

    if (palette.graticule !== 'transparent') {
      ctx.beginPath();
      path(GRATICULE);
      ctx.lineWidth = Math.max(0.6, scale);
      ctx.strokeStyle = palette.graticule;
      ctx.stroke();
    }

    if (palette.landMode === 'fill') {
      ctx.beginPath();
      path(LAND);
      ctx.fillStyle = palette.land;
      ctx.fill();
    } else {
      const project = createProjector(view);
      const dotRadius = Math.max(0.9, DOT_RADIUS * scale);
      ctx.beginPath();
      for (const dot of dots) {
        const point = project(dot);
        if (point.depth < DOT_MIN_DEPTH) continue;
        ctx.moveTo(point.x + dotRadius, point.y);
        ctx.arc(point.x, point.y, dotRadius, 0, Math.PI * 2);
      }
      ctx.globalAlpha = DOT_ALPHA;
      ctx.fillStyle = palette.land;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    ctx.lineWidth = Math.max(1.4, ROUTE_WIDTH * scale);
    ctx.lineCap = 'round';
    LEG_LINES.forEach((leg, index) => {
      const lit = progress.litLegs === null || index < progress.litLegs;
      ctx.beginPath();
      path(leg.line);
      ctx.setLineDash(leg.kind === 'work' ? WORK_DASH.map((n) => n * Math.max(0.8, scale)) : []);
      ctx.globalAlpha = lit ? 1 : UNLIT_ALPHA;
      ctx.strokeStyle = routeColor(palette, leg.kind);
      ctx.stroke();
    });
    ctx.globalAlpha = 1;
    ctx.setLineDash([]);

    const project = createProjector(view);
    const stationRadius = Math.max(3.2, STATION_RADIUS * scale);
    for (const { id, vector } of STATION_POINTS) {
      const point = project(vector);
      if (point.depth <= 0) continue;
      ctx.beginPath();
      ctx.arc(point.x, point.y, stationRadius, 0, Math.PI * 2);
      ctx.fillStyle = palette.station;
      ctx.fill();
      ctx.lineWidth = STATION_RING_WIDTH;
      ctx.strokeStyle = palette.stationRing;
      ctx.stroke();
      if (id === progress.current) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, stationRadius * CURRENT_RING_SCALE, 0, Math.PI * 2);
        ctx.lineWidth = CURRENT_RING_WIDTH;
        ctx.strokeStyle = palette.station;
        ctx.stroke();
      }
    }
  };
}
