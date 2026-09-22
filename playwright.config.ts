// SPDX-FileCopyrightText: Copyright 2026 Stacklok, Inc.
// SPDX-License-Identifier: Apache-2.0

import { defineConfig, devices } from '@playwright/test';

// Fixed port so `webServer` and `use.baseURL` agree without extra
// plumbing. Not the default 3000 that `npm start`/`npm run serve` use, so
// a visual test run never collides with a dev server already running on
// the default port.
const PORT = 3005;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './tests/visual',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['html'], ['github']] : 'list',
  timeout: 30_000,
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
        // The PR screenshot summary embeds these at whatever width
        // GitHub's PR body happens to be (~700-900px, well under 1280) —
        // capturing at 2x means that downscale is supersampling real
        // extra resolution rather than stretching a 1x image, which is
        // the difference between crisp and visibly soft body text for a
        // page this text-dense. Doubles PNG size; still small enough not
        // to matter for a doc site's screenshot count.
        deviceScaleFactor: 2,
      },
      testIgnore: /mobile\.spec\.ts$/,
    },
    {
      name: 'mobile',
      // Viewport-only, deliberately not a full `devices['iPhone ...']`
      // preset: the layout breakpoint is what we're testing, not
      // touch/UA-driven rendering differences on top of it.
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
        // Real mobile hardware is almost universally >1x DPR too — same
        // supersampling reasoning as the desktop project above.
        deviceScaleFactor: 2,
      },
      testMatch: /mobile\.spec\.ts$/,
    },
  ],
  webServer: {
    // Production build, not the dev server: matches what's actually
    // deployed (Vercel serves the build) and avoids dev-mode HMR/overlay
    // noise in the screenshots.
    command: `npm run build && npm run serve -- --port ${PORT} --no-open`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
