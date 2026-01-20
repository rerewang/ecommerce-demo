import { test, expect } from '@playwright/test';

test('protected routes redirect to login', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/login/);
});

test('login page renders correctly', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByLabel('邮箱')).toBeVisible();
  await expect(page.getByLabel('密码')).toBeVisible();
  // Use specific selector for the form submit button to avoid conflict with Header login button
  await expect(page.locator('button[type="submit"]', { hasText: /登录/i })).toBeVisible();
});
