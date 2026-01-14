import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('page loads without JavaScript errors', async ({ page }) => {
    const errors = [];

    // Capture any JS errors
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    // Capture console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');

    // Wait for canvas to appear (Three.js has initialized)
    await expect(page.locator('canvas')).toBeVisible({ timeout: 10000 });

    // Assert no JS errors occurred
    expect(errors).toEqual([]);
  });
});
