import { test, expect } from '@playwright/test';

test.describe('Core Workflow', () => {
  test('should create topic, add question, and mark solved', async ({ page }) => {
    // Note: E2E tests would usually use a fixture or API to setup auth state
    // This is a placeholder structure
    await page.goto('/app/sheet');
    
    // Create Topic
    await page.click('button:has-text("Add Topic")');
    await page.fill('input[placeholder="e.g. Dynamic Programming"]', 'E2E Test Topic');
    await page.click('button:has-text("Create Topic")');

    // Verify topic exists
    await expect(page.locator('text=E2E Test Topic')).toBeVisible();

    // Add Question
    await page.click('button[title="Add Question"]');
    await page.fill('input[name="title"]', 'E2E Test Question');
    await page.click('button:has-text("Add Question")');

    // Verify question exists
    await expect(page.locator('text=E2E Test Question')).toBeVisible();

    // Mark Solved
    await page.click('button[title="Mark as Solved"]');

    // Check dashboard stats
    await page.goto('/app/dashboard');
    await expect(page.locator('text=E2E Test Question')).toBeVisible(); // or some stat
  });
});
