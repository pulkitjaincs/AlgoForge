import { test, expect } from '@playwright/test';

test.describe('Auth Flow', () => {
  test('should register, login, and verify dashboard loads', async ({ page }) => {
    // Generate unique user
    const username = `testuser_${Date.now()}`;
    const email = `${username}@example.com`;
    const password = 'Password123!';

    // Register
    await page.goto('/register');
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');

    // Should redirect to dashboard or login
    // Depending on flow, we might need to login now
    await page.goto('/login');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');

    // Verify dashboard loads
    await expect(page).toHaveURL(/\/app\/dashboard/);
    await expect(page.locator('text=Welcome')).toBeVisible();
  });
});
