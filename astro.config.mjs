import { defineConfig } from 'astro/config';

// Static output. `site` / `base` get set once hosting is decided.
export default defineConfig({
  server: { port: 4321 },
  devToolbar: { enabled: false },
});
