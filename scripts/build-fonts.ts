/**
 * Regenerates the site's web fonts: src/assets/fonts/*.woff2, their manifest and src/styles/fonts.css.
 * Run it after changing any Chinese copy (a unit test fails until you do):
 *
 *   npm run build:fonts
 *
 * - The two Chinese faces are cut down to the characters the site uses (scripts/subset-cjk.py, which
 *   needs Python 3 with fonttools and brotli). A whole Chinese face is ~100 slices of 30–80 KB each,
 *   and a page of Chinese headings used to pull dozens of them; now each face is one small file.
 *   Noto Serif SC is split once more: the few glyphs the English page shows get their own file.
 * - The Latin faces are fontsource's own Latin files, WOFF2 only: every browser the site supports reads it.
 */
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { displayText, handText, sharedDisplayText } from './font-text';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const FONTSOURCE = join(ROOT, 'node_modules/@fontsource');
const OUT_DIR = join(ROOT, 'src/assets/fonts');
const CSS_OUT = join(ROOT, 'src/styles/fonts.css');
const MANIFEST_OUT = join(OUT_DIR, 'glyphs.json');

/** Google Fonts' "latin" range, as fontsource splits it. */
const LATIN_RANGE =
  'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD';

interface Face {
  readonly family: string;
  readonly style: 'normal' | 'italic';
  readonly weight: number;
  readonly file: string;
  readonly range: string;
}

const LATIN_FACES: readonly Omit<Face, 'file' | 'range'>[] = [
  { family: 'Source Serif 4', style: 'normal', weight: 700 },
  { family: 'Source Serif 4', style: 'italic', weight: 400 },
  { family: 'Source Serif 4', style: 'italic', weight: 700 },
  { family: 'Source Sans 3', style: 'normal', weight: 400 },
  { family: 'Source Sans 3', style: 'normal', weight: 600 },
  { family: 'Caveat', style: 'normal', weight: 500 },
  { family: 'Long Cang', style: 'normal', weight: 400 },
];

const shared = sharedDisplayText();
const CJK_FACES = [
  { family: 'Noto Serif SC', weight: 900, text: shared, out: 'noto-serif-sc-900-shared.woff2' },
  {
    family: 'Noto Serif SC',
    weight: 900,
    text: [...displayText()].filter((char) => !shared.includes(char)).join(''),
    out: 'noto-serif-sc-900-zh.woff2',
  },
  { family: 'Long Cang', weight: 400, text: handText(), out: 'long-cang-400-site.woff2' },
] as const;

const slug = (family: string): string => family.toLowerCase().replace(/\s+/g, '-');

function unicodeRange(codePoints: readonly number[]): string {
  const hex = (point: number): string => point.toString(16).toUpperCase().padStart(4, '0');
  const ranges: string[] = [];
  for (let at = 0; at < codePoints.length; ) {
    let end = at;
    while (end + 1 < codePoints.length && codePoints[end + 1] === codePoints[end] + 1) end += 1;
    ranges.push(end === at ? `U+${hex(codePoints[at])}` : `U+${hex(codePoints[at])}-${hex(codePoints[end])}`);
    at = end + 1;
  }
  return ranges.join(', ');
}

function fontFace({ family, style, weight, file, range }: Face): string {
  return `@font-face {
  font-family: '${family}';
  font-style: ${style};
  font-display: swap;
  font-weight: ${weight};
  src: url('../assets/fonts/${file}') format('woff2');
  unicode-range: ${range};
}`;
}

rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR, { recursive: true });
const work = mkdtempSync(join(tmpdir(), 'site-fonts-'));
const faces: Face[] = [];
const manifest: Record<string, string> = {};

for (const face of LATIN_FACES) {
  const style = face.style === 'italic' ? 'italic' : 'normal';
  const file = `${slug(face.family)}-latin-${face.weight}-${style}.woff2`;
  copyFileSync(join(FONTSOURCE, slug(face.family), 'files', file), join(OUT_DIR, file));
  faces.push({ ...face, file, range: LATIN_RANGE });
}

for (const face of CJK_FACES) {
  const pkg = slug(face.family);
  const slices = readdirSync(join(FONTSOURCE, pkg, 'files'))
    .filter((name) => new RegExp(`^${pkg}-\\d+-${face.weight}-normal\\.woff2$`).test(name))
    .map((name) => join(FONTSOURCE, pkg, 'files', name));
  const textFile = join(work, `${pkg}.txt`);
  writeFileSync(textFile, face.text);
  const output = execFileSync('python3', [join(ROOT, 'scripts/subset-cjk.py'), join(OUT_DIR, face.out), textFile, ...slices], {
    encoding: 'utf8',
  });
  const covered = JSON.parse(output.trim().split('\n').at(-1) ?? '[]') as number[];
  const missing = [...face.text].filter((char) => !covered.includes(char.codePointAt(0) ?? -1));
  if (missing.length) process.stderr.write(`${face.family} has no glyph for: ${missing.join('')}\n`);
  manifest[face.family] = (manifest[face.family] ?? '') + String.fromCodePoint(...covered);
  faces.push({ family: face.family, style: 'normal', weight: face.weight, file: face.out, range: unicodeRange(covered) });
}
rmSync(work, { recursive: true, force: true });

writeFileSync(MANIFEST_OUT, `${JSON.stringify(manifest, null, 2)}\n`);
writeFileSync(
  CSS_OUT,
  `/* Generated by scripts/build-fonts.ts — do not edit by hand. */\n\n${faces.map(fontFace).join('\n\n')}\n`,
);
process.stdout.write(`Wrote ${faces.length} faces to ${OUT_DIR}\n`);
