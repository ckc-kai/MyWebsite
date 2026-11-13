import { defineConfig } from '@playwright/test';

const PORT = 4321;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  reporter: [['list']],
  use: {
    // The site lives under /MyWebsite/ (astro.config.mjs); tests navigate relative to it.
    baseURL: `http://localhost:${PORT}/MyWebsite/`,
    // The machine's own Chrome: no separate browser download needed.
    channel: 'chrome',
    viewport: { width: 1440, height: 900 },
  },
  webServer: {
    // --ignore-lock keeps the server in the foreground, where Playwright can own it: Astro 7 sends it
    // to the background on its own when an AI agent runs the command.
    command: 'npm run dev -- --ignore-lock',
    url: `http://localhost:${PORT}/MyWebsite/`,
    reuseExistingServer: true,
  },
});
