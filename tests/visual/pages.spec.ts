// SPDX-FileCopyrightText: Copyright 2026 Stacklok, Inc.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, type Page } from '@playwright/test';
import { captureBothThemes } from './fixtures';

/**
 * The documented representative-page matrix for issue #1163. Keep this
 * list small, stable, and reviewable — it IS the "documented matrix" the
 * issue asks for, not a stand-in for one. Add a page here only when it
 * exercises shared layout/theme/nav that nothing else in the list already
 * covers.
 */
const NAV_PAGES: Array<{ section: string; path: string }> = [
  { section: 'Stacklok Platform', path: '/platform' },
  { section: 'ToolHive', path: '/toolhive' },
  { section: 'AI Gateway', path: '/ai-gateway' },
  { section: 'Connector Gateway', path: '/connector-gateway' },
  { section: 'Resources', path: '/toolhive/concepts' },
];

async function gotoSuccessful(page: Page, path: string) {
  const response = await page.goto(path);
  expect(response?.ok()).toBe(true);
}

test('home page', async ({ page }, testInfo) => {
  await gotoSuccessful(page, '/');
  await expect(page.locator('body')).toBeVisible();
  await captureBothThemes(page, testInfo, 'Home page');
});

test('theme preview page', async ({ page }, testInfo) => {
  await gotoSuccessful(page, '/theme-preview');
  // Mermaid diagrams render client-side and asynchronously — wait for
  // both of the page's diagrams to finish before capturing, or the
  // snapshot flakes between "still rendering" and "done".
  await expect(page.locator('.docusaurus-mermaid-container svg')).toHaveCount(
    2
  );
  await captureBothThemes(page, testInfo, 'Theme preview page');
});

for (const { section, path } of NAV_PAGES) {
  test(`nav page - ${section}`, async ({ page }, testInfo) => {
    await gotoSuccessful(page, path);
    await expect(page.locator('body')).toBeVisible();
    await captureBothThemes(page, testInfo, `Nav page - ${section}`);
  });
}

test('MCP guide - context7 metadata expanded', async ({ page }, testInfo) => {
  await gotoSuccessful(page, '/toolhive/guides-mcp/context7');

  const summary = page.getByText("Expand to view the MCP server's metadata");
  await summary.click();

  const codeBlock = page.locator('details[open] pre');
  await expect(codeBlock).toBeVisible();
  // The plugin falls back to this comment when `thv registry info` fails
  // (missing/broken `thv`, registry lookup failure) — assert real
  // metadata rendered instead of that fallback, so a `thv`/registry
  // failure surfaces as a clear assertion, not a mystery pixel diff.
  await expect(codeBlock).not.toContainText('Error fetching data for');
  await expect(codeBlock).toContainText('Name: io.github.stacklok/context7');

  await captureBothThemes(
    page,
    testInfo,
    'MCP guide - context7 metadata expanded',
    { mask: [codeBlock] }
  );
});
