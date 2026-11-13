/**
 * Regenerates the province and state lines drawn on the globe, from Natural Earth's public-domain
 * 1:50m admin-1 boundaries. Only lines shared by two provinces of the same country are kept:
 * the globe draws no national borders anywhere.
 *
 *   npm run build:borders -- path/to/ne_50m_admin_1_states_provinces.geojson
 *
 * Source: https://github.com/nvkelso/natural-earth-vector (geojson/ne_50m_admin_1_states_provinces.geojson)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { Feature, FeatureCollection, Geometry, MultiLineString } from 'geojson';
import { mesh } from 'topojson-client';
import { topology } from 'topojson-server';
import { presimplify, quantile, simplify } from 'topojson-simplify';

/** The countries the route passes through. */
const COUNTRIES = new Set(['CN', 'US']);
/** Share of the finest detail dropped: plenty at the size the globe is drawn. */
const DETAIL_DROPPED = 0.6;
const DECIMALS = 2;
const OUTPUT = fileURLToPath(new URL('../src/components/globe/borders.json', import.meta.url));

type Province = Feature<Geometry, { iso_a2?: string }>;

const source = process.argv[2];
if (!source) throw new Error('Pass the path to ne_50m_admin_1_states_provinces.geojson');

const all = JSON.parse(readFileSync(source, 'utf8')) as FeatureCollection<Geometry, { iso_a2?: string }>;
const provinces: FeatureCollection<Geometry, { iso_a2?: string }> = {
  type: 'FeatureCollection',
  features: all.features
    .filter((feature) => COUNTRIES.has(feature.properties?.iso_a2 ?? ''))
    .map((feature): Province => ({ type: 'Feature', geometry: feature.geometry, properties: { iso_a2: feature.properties?.iso_a2 } })),
};

const topo = presimplify(topology({ provinces }));
const simplified = simplify(topo, quantile(topo, DETAIL_DROPPED));
const object = simplified.objects.provinces;
if (object.type !== 'GeometryCollection') throw new Error('Expected a collection of provinces');

const sameCountry = (a: { properties?: unknown }, b: { properties?: unknown }): boolean =>
  a !== b && (a.properties as { iso_a2?: string }).iso_a2 === (b.properties as { iso_a2?: string }).iso_a2;
const lines = mesh(simplified, object, sameCountry) as MultiLineString;

const round = (value: number): number => Number(value.toFixed(DECIMALS));
const borders: MultiLineString = {
  type: 'MultiLineString',
  coordinates: lines.coordinates.map((line) => line.map(([lon, lat]) => [round(lon), round(lat)])),
};

writeFileSync(OUTPUT, `${JSON.stringify(borders)}\n`);
const points = borders.coordinates.reduce((sum, line) => sum + line.length, 0);
process.stdout.write(`Wrote ${borders.coordinates.length} lines (${points} points) to ${OUTPUT}\n`);
