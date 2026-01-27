import { test, expect } from '@playwright/test';
import { ensureLoggedIn } from './utils';

test.describe('Admin Flow (Real Admin)', () => {
  const email = 'admin@example.com';
  const password = '123456';

  test('admin can manage orders', async ({ page }) => {
    test.setTimeout(60000);
    await ensureLoggedIn(page, email, password, false);
    
    await page.goto('/zh/admin/orders');
    
    await expect(page.getByRole('heading', { name: '订单管理' })).toBeVisible({ timeout: 10000 });
    
    await expect(page.getByText('订单号')).toBeVisible();
    await expect(page.getByText('状态')).toBeVisible();
    
    const rows = page.locator('tbody tr');
    await expect(rows.first()).toBeVisible();
  });

  test('admin can manage products', async ({ page }) => {
    test.setTimeout(60000);
    await ensureLoggedIn(page, email, password, false);

    await page.goto('/zh/admin/products');
    
    await expect(page.getByRole('heading', { name: '商品管理' })).toBeVisible({ timeout: 10000 });
    
    const addBtn = page.getByRole('button', { name: '新增商品' });
    await expect(addBtn).toBeVisible();
    
    await expect(page.getByText('iPhone 15 Pro')).toBeVisible();
  });
});
