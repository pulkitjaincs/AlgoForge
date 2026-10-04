import { test, expect } from '@playwright/test';

test.describe('Auth Flow', () => {
  test('should register, login, and verify dashboard loads', async ({ page }) => {
    // Generate unique user
    const name = 'Test User';
    const email = `testuser_${Date.now()}@example.com`;
    const password = 'Password123!';

    // Register
    await page.goto('/register');
    await expect(page.locator('h2')).toContainText('Create an account');

    // Fill registration form — inputs are identified by placeholder since no name attributes exist
    await page.getByPlaceholder('John Doe').fill(name);
    await page.getByPlaceholder('name@example.com').fill(email);
    await page.getByPlaceholder('Min. 8 characters').fill(password);

    // Check the required terms checkbox
    await page.locator('#terms').check();

    // Submit registration
    await page.getByRole('button', { name: /create free account/i }).click();

    // Registration should auto-login and redirect to /app (which redirects to /app/dashboard)
    await expect(page).toHaveURL(/\/app\/dashboard/, { timeout: 15000 });

    // For a brand new user with no data, the empty state shows "Welcome to AlgoForge!"
    await expect(page.locator('text=Welcome to AlgoForge!')).toBeVisible({ timeout: 10000 });
  });

  test('should login with existing credentials after registering', async ({ page }) => {
    const name = 'Login Test User';
    const email = `logintest_${Date.now()}@example.com`;
    const password = 'Password123!';

    // First register a user
    await page.goto('/register');
    await page.getByPlaceholder('John Doe').fill(name);
    await page.getByPlaceholder('name@example.com').fill(email);
    await page.getByPlaceholder('Min. 8 characters').fill(password);
    await page.locator('#terms').check();
    await page.getByRole('button', { name: /create free account/i }).click();
    await expect(page).toHaveURL(/\/app\/dashboard/, { timeout: 15000 });

    // Logout (clear cookies)
    await page.context().clearCookies();

    // Now login
    await page.goto('/login');
    await expect(page.locator('h2')).toContainText('Welcome back');

    // Login form uses placeholder-based selectors
    await page.getByPlaceholder('name@example.com').fill(email);
    await page.getByPlaceholder('••••••••').fill(password);
    await page.getByRole('button', { name: /sign in to account/i }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/app\/dashboard/, { timeout: 15000 });
  });
});
