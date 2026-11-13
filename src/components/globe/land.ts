import type { FeatureCollection, MultiPolygon, Polygon } from 'geojson';
import { feature } from 'topojson-client';
import type { GeometryCollection, Topology } from 'topojson-specification';
import landTopology from 'world-atlas/land-110m.json';

type LandTopology = Topology<{ land: GeometryCollection }>;

/** Merged landmasses only. No country borders are drawn anywhere on the globe. */
export const LAND = feature(
  landTopology as unknown as LandTopology,
  (landTopology as unknown as LandTopology).objects.land,
) as FeatureCollection<Polygon | MultiPolygon>;
