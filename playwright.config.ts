import { defineConfig } from '@playwright/test';

const PORT = 4321;
// GitHub Actions sets CI=true.
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  // CI machines are small and slow: a test that only ran out of time gets another go there,
  // and is reported as flaky. Locally a failure is a failure.
  retries: isCI ? 2 : 0,
  reporter: [['list']],
  use: {
    // The site lives under /MyWebsite/ (astro.config.mjs); tests navigate relative to it.
    baseURL: `http://localhost:${PORT}/MyWebsite/`,
    // The machine's own Chrome: no separate browser download needed.
    channel: 'chrome',
    viewport: { width: 1440, height: 900 },
  },
  webServer: {
    // On CI, test the built site that will actually ship: it is served ready-made, so pages load far
    // faster than from the dev server, which compiles each request on the spot.
    // --ignore-lock keeps the server in the foreground, where Playwright can own it: Astro 7 sends it
    // to the background on its own when an AI agent runs the command.
    command: isCI ? 'npm run build && npm run preview -- --ignore-lock' : 'npm run dev -- --ignore-lock',
    url: `http://localhost:${PORT}/MyWebsite/`,
    reuseExistingServer: !isCI,
    // Room for the build before the server answers.
    timeout: 180_000,
  },
});
