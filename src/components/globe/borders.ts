import type { MultiLineString } from 'geojson';
import bordersData from './borders.json';

/**
 * Lines between provinces of China and between states of the US, where the route runs.
 * Only lines inside one country: the globe draws no national borders. Regenerate with `npm run build:borders`.
 */
export const BORDERS = bordersData as MultiLineString;
