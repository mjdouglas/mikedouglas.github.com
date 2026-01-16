import { test } from '@playwright/test';

test.describe('Layout Screenshots', () => {
  test('desktop layout', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await page.waitForTimeout(1000); // Wait for animations
    await page.screenshot({ path: 'screenshots/desktop.png', fullPage: false });
  });

  test('mobile layout', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForTimeout(1000); // Wait for animations
    await page.screenshot({ path: 'screenshots/mobile.png', fullPage: false });
  });
});
