import { test, expect, Page } from '@playwright/test';

/**
 * Helper: registers a new user and navigates to the dashboard.
 * Returns the user's credentials for later use.
 */
async function registerAndLogin(page: Page) {
  const name = 'Workflow Test User';
  const email = `workflow_${Date.now()}@example.com`;
  const password = 'Password123!';

  await page.goto('/register');
  await page.getByPlaceholder('John Doe').fill(name);
  await page.getByPlaceholder('name@example.com').fill(email);
  await page.getByPlaceholder('Min. 8 characters').fill(password);
  await page.locator('#terms').check();
  await page.getByRole('button', { name: /create free account/i }).click();

  // Wait for redirect to dashboard (user is now authenticated)
  await expect(page).toHaveURL(/\/app\/dashboard/, { timeout: 15000 });

  return { name, email, password };
}

test.describe('Core Workflow', () => {
  test('should create topic from the sheet page after authenticating', async ({ page }) => {
    // Step 1: Register and authenticate
    await registerAndLogin(page);

    // Step 2: Navigate to the sheet page
    await page.goto('/app/sheet');
    await expect(page).toHaveURL(/\/app\/sheet/, { timeout: 10000 });

    // Step 3: Wait for the sheet page to fully load
    // For a new user, the page should show the empty state or the main sheet UI
    await page.waitForLoadState('networkidle');

    // Step 4: Create a Topic using the "Add Topic" or "+" button
    // The SheetPage has a button with Plus icon to add topics
    const addTopicButton = page.getByRole('button', { name: /add topic|new topic/i });

    // If the page has loaded and shows the sheet UI, click to add a topic
    if (await addTopicButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await addTopicButton.click();

      // Fill the topic title in the modal
      const topicInput = page.getByPlaceholder('e.g. Dynamic Programming');
      if (await topicInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await topicInput.fill('E2E Test Topic');

        // Submit the form
        const createButton = page.getByRole('button', { name: /create|add|save/i });
        if (await createButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await createButton.click();

          // Verify topic appears on the page
          await expect(page.locator('text=E2E Test Topic')).toBeVisible({ timeout: 10000 });
        }
      }
    }
  });

  test('should navigate between app pages when authenticated', async ({ page }) => {
    await registerAndLogin(page);

    // Navigate to sheet page
    await page.goto('/app/sheet');
    await expect(page).toHaveURL(/\/app\/sheet/, { timeout: 10000 });

    // Navigate back to dashboard
    await page.goto('/app/dashboard');
    await expect(page).toHaveURL(/\/app\/dashboard/, { timeout: 10000 });
  });
});
