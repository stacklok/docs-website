// SPDX-FileCopyrightText: Copyright 2026 Stacklok, Inc.
// SPDX-License-Identifier: Apache-2.0

import { expect, test } from '@playwright/test';
import { captureBothThemes, captureElementBothThemes } from './fixtures';

test('home page - mobile', async ({ page }, testInfo) => {
  const response = await page.goto('/');
  expect(response?.ok()).toBe(true);
  await page.waitForLoadState('networkidle');
  await expect(page.locator('body')).toBeVisible();
  await captureBothThemes(page, testInfo, 'Home page - mobile');
});

test('mobile navigation opens without overflow', async ({ page }, testInfo) => {
  const response = await page.goto('/theme-preview');
  expect(response?.ok()).toBe(true);
  await page.waitForLoadState('networkidle');

  const toggle = page.getByRole('button', { name: /toggle navigation bar/i });
  await toggle.click();

  const sidebar = page.locator('.navbar-sidebar--show');
  await expect(sidebar).toBeVisible();

  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth
  );
  expect(hasOverflow).toBe(false);

  await captureElementBothThemes(
    page,
    page.locator('.navbar-sidebar'),
    testInfo,
    'Mobile navigation open'
  );
});

// Keep a functional check against real product navigation as well as the
// fixed menu used for pixel comparisons.
test('product mobile navigation opens without overflow', async ({ page }) => {
  const response = await page.goto('/toolhive/guides-cli');
  expect(response?.ok()).toBe(true);
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: /toggle navigation bar/i }).click();
  await expect(page.locator('.navbar-sidebar--show')).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    )
  ).toBe(false);
});
