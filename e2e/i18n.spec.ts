import { test, expect } from '@playwright/test';

test.describe('i18n Routing', () => {
  test('should redirect root to default locale', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/en/);
  });

  test('should access en locale', async ({ page }) => {
    const response = await page.goto('/en');
    expect(response?.ok()).toBeTruthy();
  });

  test('should access zh locale', async ({ page }) => {
    const response = await page.goto('/zh');
    expect(response?.ok()).toBeTruthy();
  });
});
