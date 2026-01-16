import { test, expect } from '@playwright/test';

test.describe('E2E Checkout Flow', () => {
  // Use a random email to avoid collision
  const email = `test.${Date.now()}@example.com`;
  const password = 'Password123!';

  test('should allow user to purchase items', async ({ page }) => {
    // 1. Sign Up
    await page.goto('/login');
    // Switch to signup mode
    await page.getByRole('button', { name: '立即注册' }).click();
    await page.getByLabel('邮箱').fill(email);
    await page.getByLabel('密码').fill(password);
    await page.getByRole('button', { name: '注册' }).click();

    // Assumption: Email confirmation is disabled for E2E environment
    // So signup redirects to home automatically
    await expect(page).toHaveURL('/');

    // 3. Add Item to Cart
    // Wait for products to load
    await expect(page.locator('article').first()).toBeVisible();
    // Click "加入购物车" button
    await page.locator('article button').first().click();
    // Wait for toast or cart badge update
    await expect(page.getByText('已添加到购物车')).toBeVisible();

    // 4. Go to Cart
    await page.goto('/cart');
    await expect(page.getByText('总计')).toBeVisible();
    
    // 5. Go to Checkout
    await page.getByRole('link', { name: /结算/ }).click();
    
    // 6. Fill Checkout Form
    await expect(page).toHaveURL('/checkout');
    await page.getByLabel('姓名').fill('E2E User');
    await page.getByLabel('地址').fill('123 Test St');
    await page.getByLabel('城市').fill('Test City');
    await page.getByLabel('邮编').fill('10000');

    // 7. Pay (Simulate)
    // Select Alipay by default
    await page.getByRole('button', { name: /支付 ¥/ }).click();

    // 8. Verify Order Success
    // Should redirect to /orders/[id]
    await expect(page).toHaveURL(/\/orders\/.+/);
    await expect(page.getByText('已支付')).toBeVisible();
    await expect(page.getByText('E2E User')).toBeVisible();
  });
});
