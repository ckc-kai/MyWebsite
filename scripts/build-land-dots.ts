/**
 * Regenerates the night-view land dots. Sampling the coastline takes several seconds,
 * so it is done once here and committed, not on every page render.
 *
 *   npm run build:dots
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { buildLandDots } from '../src/components/globe/land-dots';

const LAND_DOT_STEP_DEG = 1.6;
const OUTPUT = fileURLToPath(new URL('../src/components/globe/land-dots.json', import.meta.url));

const dots = buildLandDots(LAND_DOT_STEP_DEG);
writeFileSync(OUTPUT, `${JSON.stringify(dots)}\n`);
process.stdout.write(`Wrote ${dots.length / 2} land dots to ${OUTPUT}\n`);
