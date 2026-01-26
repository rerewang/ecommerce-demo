import { test, expect } from '@playwright/test';

test('RBAC: customer cannot access admin', async ({ page }) => {
  const email = 'user@example.com';
  const password = '123456';

  // 1. Go to Login
  await page.goto('/login');
  
  // 2. Login as customer
  await page.getByLabel('邮箱').fill(email);
  await page.getByLabel('密码').fill(password);
  await page.locator('button[type="submit"]').filter({ hasText: '登录' }).click();
  
  // Wait for login to complete (redirect to home)
  await expect(page).toHaveURL('/', { timeout: 10000 });

  // 3. Try to go to admin
  await page.goto('/admin');
  
  // 4. Expect redirect to home (since user is not admin)
  // The middleware redirects non-admins to '/'
  await expect(page).toHaveURL('/'); 
});
