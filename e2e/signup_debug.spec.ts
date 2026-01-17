import { test, expect } from '@playwright/test';

test('user registration should succeed', async ({ page }) => {
  await page.goto('/login');
  
  await page.getByRole('button', { name: '立即注册' }).click();
  
  const testEmail = `user_${Date.now()}@example.com`; 
  await page.fill('input[name="email"]', testEmail);
  await page.fill('input[name="password"]', 'test123456');
  
  await page.getByRole('button', { name: '注册' }).click();
  
  await expect(page).toHaveURL('/', { timeout: 5000 });
  
  const userEmail = page.getByText(testEmail);
  await expect(userEmail).toBeVisible();
});
