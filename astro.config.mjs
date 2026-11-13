import { defineConfig } from 'astro/config';

// Static output, served by GitHub Pages at https://ckc-kai.github.io/MyWebsite/
// (built and deployed by .github/workflows/deploy.yml).
export default defineConfig({
  site: 'https://ckc-kai.github.io',
  base: '/MyWebsite',
  server: { port: 4321 },
  devToolbar: { enabled: false },
});
