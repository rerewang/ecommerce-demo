import { test, expect } from '@playwright/test';

test.describe('E2E Checkout Flow (Real User)', () => {
  const email = 'user@example.com';
  const password = '123456';

  test.skip('should allow user to purchase items', async ({ page }) => {
    // 1. Login
    await page.goto('/login');
    await page.getByLabel('邮箱').fill(email);
    await page.getByLabel('密码').fill(password);
    await page.locator('button[type="submit"]').filter({ hasText: '登录' }).click();
    
    // Should be redirected to home
    await expect(page).toHaveURL('/');

    // 2. Add Item to Cart
    const productCard = page.locator('[class*="grid"] > a').first();
    await expect(productCard).toBeVisible({ timeout: 10000 });
    
    await productCard.locator('button').first().click();
    await expect(page.getByText('已添加到购物车')).toBeVisible();

    // 3. Navigate to cart immediately (no page reload)
    await page.locator('a[href="/cart"]').first().click();
    await expect(page).toHaveURL('/cart');
    
    const checkoutLink = page.getByRole('link', { name: /结算/ });
    await expect(checkoutLink).toBeVisible({ timeout: 10000 });
    
    await checkoutLink.click();
    await page.waitForURL('/checkout', { timeout: 10000 });
    
    await page.getByLabel('姓名').fill('Real User');
    await page.getByLabel('地址').fill('123 Real St');
    await page.getByLabel('城市').fill('Beijing');
    await page.getByLabel('邮编').fill('100000');

    // 6. Pay (Simulate)
    // Select Alipay by default
    const submitBtn = page.getByRole('button', { name: /支付 ¥/i });
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // 7. Verify Order Success
    // Should redirect to /orders/[id]
    await expect(page).toHaveURL(/\/orders\/.+/);
    await expect(page.getByText('已支付')).toBeVisible();
    
    // 8. Capture Order ID for debugging if needed
    const url = page.url();
    console.log('Order created:', url.split('/').pop());
  });
});
