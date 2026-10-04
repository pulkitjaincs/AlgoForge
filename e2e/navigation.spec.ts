import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should redirect protected routes to login when not authenticated', async ({ page }) => {
    // Clear any existing auth cookies
    await page.context().clearCookies();

    await page.goto('/app/dashboard');
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });

    await page.goto('/app/sheet');
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test('should allow access to public routes without authentication', async ({ page }) => {
    await page.context().clearCookies();

    await page.goto('/');
    await expect(page).toHaveTitle(/AlgoForge/);

    await page.goto('/login');
    await expect(page.locator('h2')).toContainText('Welcome back');

    await page.goto('/register');
    await expect(page.locator('h2')).toContainText('Create an account');
  });
});
