import { test, expect } from '@playwright/test';

test.describe('E2E Checkout Flow (Real User)', () => {
  const email = 'user@example.com';
  const password = '123456';

  test('should allow user to purchase items', async ({ page }) => {
    // 1. Login
    await page.goto('/login');
    await page.getByLabel('邮箱').fill(email);
    await page.getByLabel('密码').fill(password);
    await page.getByRole('main').getByRole('button', { name: '登录' }).click();
    
    // Should be redirected to home
    await expect(page).toHaveURL('/');

    // 2. Add Item to Cart
    // Ensure products exist. If DB is empty, this will timeout.
    const productArticle = page.locator('article').first();
    await expect(productArticle).toBeVisible({ timeout: 10000 });
    
    // Click "加入购物车" button
    await productArticle.locator('button').click();
    await expect(page.getByText('已添加到购物车')).toBeVisible();

    // 3. Go to Cart
    await page.goto('/cart');
    await expect(page.getByText('总计')).toBeVisible();
    
    // 4. Go to Checkout
    await page.getByRole('link', { name: /结算/ }).click();
    
    // 5. Fill Checkout Form
    // Debug 307: If redirected to login here, test will fail and we can investigate trace
    await expect(page).toHaveURL('/checkout');
    
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
