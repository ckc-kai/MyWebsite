import { defineConfig } from 'astro/config';

// Static output, served by GitHub Pages at https://ckc-kai.github.io/MyWebsite/
// (built and deployed by .github/workflows/deploy.yml).
export default defineConfig({
  site: 'https://ckc-kai.github.io',
  base: '/MyWebsite',
  server: { port: 4321 },
  devToolbar: { enabled: false },
  // Astro 7 defaults to 'jsx', which drops the spaces between inline tags and moves text; keep the
  // whitespace the pages were designed with.
  compressHTML: true,
});
