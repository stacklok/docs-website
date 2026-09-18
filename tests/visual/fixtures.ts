// SPDX-FileCopyrightText: Copyright 2026 Stacklok, Inc.
// SPDX-License-Identifier: Apache-2.0

import fs from 'node:fs';
import path from 'node:path';
import {
  expect,
  type Locator,
  type Page,
  type TestInfo,
} from '@playwright/test';

/**
 * Waits out generic sources of false-positive visual diffs: in-flight
 * client work (networkidle) and web fonts still loading. Nothing here has
 * a client-side loading skeleton (the MCP metadata panel's content is
 * baked in at build time), so unlike a stateful app there's no third
 * generic thing to wait for.
 */
async function waitForVisualStability(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
}

function slugifySnapshotName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Writes a `<name>.json` next to each baseline PNG: which spec produced
 * it and the page URL, plus a ready-to-paste repro command. Not debug
 * fluff — `scripts/pr-screenshot-summary.mjs` reads this to label and link
 * each screenshot in the PR description.
 */
async function writeSnapshotMetadata(
  page: Page,
  testInfo: TestInfo,
  pngName: string
): Promise<void> {
  const pngPath = testInfo.snapshotPath(pngName);
  const jsonPath = pngPath.replace(/\.png$/, '.json');
  const testFile = path.relative(process.cwd(), testInfo.file);
  const pageUrl = new URL(page.url());

  await fs.promises.writeFile(
    jsonPath,
    `${JSON.stringify(
      {
        titlePath: testInfo.titlePath,
        testFile,
        url: {
          origin: pageUrl.origin,
          path: pageUrl.pathname + pageUrl.search + pageUrl.hash,
        },
        reproCommand: `npx playwright test ${testFile} -g ${JSON.stringify(testInfo.title)}`,
      },
      null,
      2
    )}\n`
  );
}

async function fileMtimeMs(filePath: string): Promise<number | null> {
  try {
    return (await fs.promises.stat(filePath)).mtimeMs;
  } catch {
    return null;
  }
}

export async function captureColorScheme(
  page: Page,
  testInfo: TestInfo,
  name: string,
  scheme: 'light' | 'dark',
  options: { mask?: Locator[] } = {}
): Promise<void> {
  await page.emulateMedia({ colorScheme: scheme });
  await waitForVisualStability(page);

  const pngName = `${slugifySnapshotName(name)}-${scheme}.png`;
  const pngPath = testInfo.snapshotPath(pngName);
  const before = await fileMtimeMs(pngPath);
  // scale: 'device' — toHaveScreenshot() defaults to 'css' (downsamples
  // back to CSS pixel dimensions regardless of deviceScaleFactor). The
  // whole point of the project config's deviceScaleFactor: 2 is a real
  // higher-resolution PNG, since these get embedded in the PR
  // description at whatever width GitHub's body happens to be (usually
  // well under 1280px) — 'css' would throw away exactly the extra
  // resolution that downscale needs to stay crisp.
  await expect(page).toHaveScreenshot(pngName, {
    fullPage: true,
    scale: 'device',
    mask: options.mask,
    maskColor: scheme === 'dark' ? '#282a36' : '#f6f8fa',
  });
  const after = await fileMtimeMs(pngPath);
  if (after !== before) {
    await writeSnapshotMetadata(page, testInfo, pngName);
  }
}

/**
 * Snapshots `page` in both light and dark color schemes. Call only after
 * the test has already asserted the state being snapshotted (e.g. the
 * metadata panel is open) — those assertions are what make the page
 * deterministic, not this function.
 */
export async function captureBothThemes(
  page: Page,
  testInfo: TestInfo,
  name: string,
  options: { mask?: Locator[] } = {}
): Promise<void> {
  await captureColorScheme(page, testInfo, name, 'light', options);
  await captureColorScheme(page, testInfo, name, 'dark', options);
  await page.emulateMedia({ colorScheme: 'light' });
}

export async function captureElementBothThemes(
  page: Page,
  element: Locator,
  testInfo: TestInfo,
  name: string
): Promise<void> {
  for (const scheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme: scheme });
    await waitForVisualStability(page);

    const pngName = `${slugifySnapshotName(name)}-${scheme}.png`;
    const pngPath = testInfo.snapshotPath(pngName);
    const before = await fileMtimeMs(pngPath);
    await expect(element).toHaveScreenshot(pngName, { scale: 'device' });
    const after = await fileMtimeMs(pngPath);
    if (after !== before) {
      await writeSnapshotMetadata(page, testInfo, pngName);
    }
  }

  await page.emulateMedia({ colorScheme: 'light' });
}
