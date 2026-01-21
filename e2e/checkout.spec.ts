import { test, expect } from '@playwright/test';

test.describe('E2E Checkout Flow (Real User)', () => {
  const email = 'user@example.com';
  const password = '123456';

  test('should allow user to purchase items', async ({ page }) => {
    const consoleMessages: { type: string; text: string }[] = [];
    
    page.on('console', msg => {
      const text = msg.text();
      consoleMessages.push({ type: msg.type(), text });
      if (msg.type() === 'error' || text.includes('error') || text.includes('Error') || text.includes('Failed')) {
        console.log(`[Browser ${msg.type()}]:`, text);
      }
    });
    
    let alertMessage = '';
    page.on('dialog', async dialog => {
      alertMessage = dialog.message();
      console.log('Alert:', alertMessage);
      await dialog.accept();
    });

    // 1. Login
    await page.goto('/login');
    await page.getByLabel('邮箱').fill(email);
    await page.getByLabel('密码').fill(password);
    await page.locator('button[type="submit"]').filter({ hasText: '登录' }).click();
    
    // Should be redirected to home
    await expect(page).toHaveURL('/');
    await page.goto('/products');

    // 2. Add Item to Cart
    // Find a product that is in stock
    const productCard = page.locator('a').filter({ has: page.getByText('加入购物车') }).first();
    await expect(productCard).toBeVisible({ timeout: 10000 });
    
    await productCard.locator('button').filter({ hasText: '加入购物车' }).first().click();
    await expect(page.getByText('已添加到购物车')).toBeVisible();

    // 3. Navigate to cart immediately (no page reload)
    await page.locator('a[href="/cart"]').first().click();
    await expect(page).toHaveURL('/cart');
    
    const checkoutLink = page.getByRole('link', { name: /前往结算/ });
    await expect(checkoutLink).toBeVisible({ timeout: 10000 });
    
    await checkoutLink.click();
    await page.waitForURL('/checkout', { timeout: 10000 });
    
    // 4. Fill shipping info
    await expect(page.getByText('正在验证登录状态...')).not.toBeVisible({ timeout: 5000 });
    await expect(page.getByText('购物车为空')).not.toBeVisible();
    
    const nameField = page.getByLabel('姓名');
    await expect(nameField).toBeVisible({ timeout: 5000 });
    
    await nameField.fill('Real User');
    await page.getByLabel('地址').fill('123 Real St');
    await page.getByLabel('城市').fill('Beijing');
    await page.getByLabel('邮编').fill('100000');

    // 5. Pay (Simulate)
    const submitBtn = page.getByRole('button', { name: /支付 ¥/i });
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // 6. Verify Order Success
    await expect(page).toHaveURL(/\/orders\/.+/, { timeout: 15000 });
    
    // 7. Verify Order Details
    const statusBadge = page.locator('span.rounded-full');
    await expect(statusBadge).toBeVisible();
  });
});
