# Kaicheng Chu — personal site

A résumé told as a journey: a slowly turning globe, the route from Hangzhou to Los Angeles drawn on it,
and one screen per stop. Day or night follows the visitor's clock. Chinese at `/`, American English at `/en/`.

**Live:** [ckc-kai.github.io/MyWebsite](https://ckc-kai.github.io/MyWebsite/)

## Stack

- [Astro](https://astro.build) 5, static output, no UI framework: each page ships ~55 KB of gzipped JS
  (the globe) and ~13 KB of CSS.
- The globe is a `<canvas>` drawn with `d3-geo`; land comes from `world-atlas`, province/state lines and
  the night-time land dots are precomputed into JSON.
- The three engineering drawings (sEMG wristband, SDG&E pipeline, research desk) and the five West Lake
  ink sketches are SVG generated at build time and inlined, so they work without JavaScript.

## Layout

```text
src/
├── pages/            index.astro (zh) · en/index.astro
├── layouts/Base.astro
├── content/          all copy: zh.ts, en.ts, flagship-*.ts, sharing the shapes in types.ts
├── components/
│   ├── journey/      the stops, the photo prints, scroll observation
│   ├── globe/        canvas globe: projection, drawing, interaction, geo data
│   ├── anatomy/      isometric engineering drawings (built on src/vendor/anatomy, MIT)
│   ├── westlake/     West Lake ink sketches
│   ├── opening/ site/ ui/
├── lib/              pure logic (rotation physics, routes, ink strokes, SVG path compaction) — unit tested
├── styles/           tokens.css (both themes) · global.css · fonts.css (generated)
└── assets/           photos (resized at build) · fonts (generated subsets)
scripts/              one-off generators for fonts, borders and land dots
tests/unit/           Vitest
tests/e2e/            Playwright (uses the machine's Chrome)
```

## Commands

Needs Node 22.23.4 or later (Astro 7).

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server at `http://localhost:4321/MyWebsite/` |
| `npm run build` | Static build into `dist/` |
| `npm run preview` | Serve the build |
| `npm test` | Unit tests |
| `npm run test:e2e` | End-to-end tests |
| `npm run build:fonts` | Re-cut the web fonts after changing Chinese copy (needs Python 3 + `pip install fonttools brotli`) |
| `npm run build:borders -- <geojson>` | Regenerate province/state lines from Natural Earth |
| `npm run build:dots` | Regenerate the night-view land dots |

## Performance notes

- **Fonts.** The two Chinese faces (Noto Serif SC 900 for headings, Long Cang for the handwritten lines)
  are cut down to exactly the characters the site uses: three files of 8–136 KB instead of ~100 slices
  per face. The English page only downloads the 8 KB slice of Chinese it shows. A unit test fails if copy
  gains a character the fonts don't have — run `npm run build:fonts`.
- **SVG.** Drawing paths are rewritten with relative steps at build time (`src/lib/svg-path.ts`):
  identical geometry, ~30% less HTML.
- **Photos.** Served at 2× their largest display size as AVIF with a WebP fallback, lazy and low priority.
- **Script.** The night-view land dots are only fetched when night is shown.

## Deploy

Every push to `main` runs `.github/workflows/deploy.yml`: install, unit tests, build, publish to GitHub Pages.
One-time setting: *Settings → Pages → Build and deployment → Source: GitHub Actions*.

Private material (résumés, original photos, design reviews) lives in `resources/`, `review/` and `docs/`,
which are git-ignored and never published.
