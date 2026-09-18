// SPDX-FileCopyrightText: Copyright 2026 Stacklok, Inc.
// SPDX-License-Identifier: Apache-2.0

import { expect, test } from '@playwright/test';
import { captureBothThemes } from './fixtures';

test('home page - mobile', async ({ page }, testInfo) => {
  const response = await page.goto('/');
  expect(response?.ok()).toBe(true);
  await expect(page.locator('body')).toBeVisible();
  await captureBothThemes(page, testInfo, 'Home page - mobile');
});

test('mobile navigation opens without overflow', async ({ page }, testInfo) => {
  const response = await page.goto('/toolhive/guides-cli');
  expect(response?.ok()).toBe(true);

  const toggle = page.getByRole('button', { name: /toggle navigation bar/i });
  await toggle.click();

  const sidebar = page.locator('.navbar-sidebar--show');
  await expect(sidebar).toBeVisible();

  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth
  );
  expect(hasOverflow).toBe(false);

  await captureBothThemes(page, testInfo, 'Mobile navigation open');
});
