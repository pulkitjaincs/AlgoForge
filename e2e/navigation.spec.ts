import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should redirect protected routes when not authenticated', async ({ page }) => {
    await page.goto('/app/dashboard');
    await expect(page).toHaveURL(/\/login/);
    
    await page.goto('/app/sheet');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should navigate correctly when authenticated', async ({ page }) => {
    // Placeholder: Need to mock auth or login first
    // await page.click('text=Contests');
    // await expect(page).toHaveURL(/\/app\/contests/);
  });
});
