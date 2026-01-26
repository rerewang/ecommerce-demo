import { test, expect } from '@playwright/test';

test('user registration should succeed', async ({ page }) => {
  await page.goto('/zh/login');
  
  await page.getByRole('button', { name: '立即注册' }).click();
  
  const testEmail = `user_${Date.now()}@example.com`; 
  await page.fill('input[name="email"]', testEmail);
  await page.fill('input[name="password"]', 'test123456');
  
  // Use specific selector for submit button
  await page.locator('button[type="submit"]', { hasText: '注册' }).click();
  
  await expect(page).toHaveURL(/\/zh/, { timeout: 10000 });
  
  // Verify email in header
  const userEmail = page.getByRole('banner').getByText(testEmail.split('@')[0]);
  await expect(userEmail).toBeVisible();
});
