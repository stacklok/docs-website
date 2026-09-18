// SPDX-FileCopyrightText: Copyright 2026 Stacklok, Inc.
// SPDX-License-Identifier: Apache-2.0

import { expect, test } from '@playwright/test';
import { captureColorScheme } from './fixtures';

// Light-only: dark mode's rendering is already exercised by the desktop
// matrix in pages.spec.ts, and doubling every mobile scenario for a
// theme these tests aren't specifically about would just grow the matrix
// without covering anything new.

test('home page - mobile', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(page.locator('body')).toBeVisible();
  await captureColorScheme(page, testInfo, 'Home page - mobile', 'light');
});

test('mobile navigation opens without overflow', async ({ page }, testInfo) => {
  await page.goto('/toolhive/guides-cli');

  const toggle = page.getByRole('button', { name: /toggle navigation bar/i });
  await toggle.click();

  const sidebar = page.locator('.navbar-sidebar--show');
  await expect(sidebar).toBeVisible();

  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth
  );
  expect(hasOverflow).toBe(false);

  await captureColorScheme(page, testInfo, 'Mobile navigation open', 'light');
});
