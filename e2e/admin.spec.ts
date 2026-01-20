import { test, expect } from '@playwright/test';

test.describe('Admin Flow (Real Admin)', () => {
  const email = 'admin@example.com';
  const password = '123456';

  test('admin can manage orders', async ({ page }) => {
    // 1. Login
    await page.goto('/login');
    await page.getByLabel('邮箱').fill(email);
    await page.getByLabel('密码').fill(password);
    await page.locator('button[type="submit"]').filter({ hasText: '登录' }).click();
    
    await expect(page).toHaveURL('/');

    // 2. Go to Admin Orders
    await page.goto('/admin/orders');
    
    // 3. Verify Access
    await expect(page.getByRole('heading', { name: '订单管理' })).toBeVisible();
    
    // 4. Verify Orders List
    await expect(page.getByText('订单号')).toBeVisible();
    await expect(page.getByText('状态')).toBeVisible();
    
    // Verify at least the empty state or rows
    const rows = page.locator('tbody tr');
    await expect(rows.first()).toBeVisible();
  });

  test('admin can manage products', async ({ page }) => {
    // 1. Login
    await page.goto('/login');
    await page.getByLabel('邮箱').fill(email);
    await page.getByLabel('密码').fill(password);
    await page.locator('button[type="submit"]').filter({ hasText: '登录' }).click();
    await expect(page).toHaveURL('/');

    // 2. Go to Admin Products
    await page.goto('/admin/products');
    
    // 3. Verify Page Title
    await expect(page.getByRole('heading', { name: '商品管理' })).toBeVisible();
    
    // 4. Verify Add Button
    const addBtn = page.getByRole('button', { name: '新增商品' });
    await expect(addBtn).toBeVisible();
    
    // 5. Verify List Content
    // Wait for list to load
    await expect(page.getByText('iPhone 15 Pro')).toBeVisible();
  });
});
