import { test, expect } from '@playwright/test';

test('basic test - landing page loads with correct title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/AlgoForge/);
});
