import { test, expect } from '@playwright/test';

test.describe('Admin Flow (Real Admin)', () => {
  const email = 'admin@example.com';
  const password = '123456';

  test('admin can manage orders', async ({ page }) => {
    // 1. Login
    await page.goto('/login');
    await page.getByLabel('邮箱').fill(email);
    await page.getByLabel('密码').fill(password);
    await page.getByRole('main').getByRole('button', { name: '登录' }).click();
    
    await expect(page).toHaveURL('/');

    // 2. Go to Admin Orders
    await page.goto('/admin/orders');
    
    // 3. Verify Access
    await expect(page.getByText('订单管理')).toBeVisible();
    
    // 4. Verify Orders List
    await expect(page.getByText('订单号')).toBeVisible();
    await expect(page.getByText('状态')).toBeVisible();
    
    // Verify at least the empty state or rows
    const rows = page.locator('tbody tr');
    await expect(rows.first()).toBeVisible();
  });
});
