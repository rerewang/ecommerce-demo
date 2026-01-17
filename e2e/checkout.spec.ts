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

    // 2. Add Item to Cart
    const productCard = page.locator('[class*="grid"] > a').first();
    await expect(productCard).toBeVisible({ timeout: 10000 });
    
    await productCard.locator('button').first().click();
    await expect(page.getByText('已添加到购物车')).toBeVisible();

    // 3. Navigate to cart immediately (no page reload)
    await page.locator('a[href="/cart"]').first().click();
    await expect(page).toHaveURL('/cart');
    
    const checkoutLink = page.getByRole('link', { name: /前往结算/ });
    await expect(checkoutLink).toBeVisible({ timeout: 10000 });
    
    await checkoutLink.click();
    await page.waitForURL('/checkout', { timeout: 10000 });
    
    // Debug: Take screenshot to see what's on the page
    await page.screenshot({ path: 'test-results/checkout-before-fill.png', fullPage: true });
    
    // Debug: Log page content
    const pageContent = await page.textContent('body');
    console.log('Page content:', pageContent);
    
    // Wait for auth check and form to be ready
    // The form should appear after "正在验证登录状态..." disappears
    await expect(page.getByText('正在验证登录状态...')).not.toBeVisible({ timeout: 5000 });
    
    // Ensure the form is rendered (not showing empty cart message)
    await expect(page.getByText('购物车为空')).not.toBeVisible();
    
    // Wait for the name field to be ready
    const nameField = page.getByLabel('姓名');
    await expect(nameField).toBeVisible({ timeout: 5000 });
    
    await nameField.fill('Real User');
    await page.getByLabel('地址').fill('123 Real St');
    await page.getByLabel('城市').fill('Beijing');
    await page.getByLabel('邮编').fill('100000');

    // 6. Pay (Simulate)
    // Select Alipay by default
    const submitBtn = page.getByRole('button', { name: /支付 ¥/i });
    await expect(submitBtn).toBeVisible();
    
    await submitBtn.click();

    console.log('Waiting for redirect to orders page...');
    
    // 7. Verify Order Success
    // Should redirect to /orders/[id] (with longer timeout for payment simulation)
    try {
      await expect(page).toHaveURL(/\/orders\/.+/, { timeout: 15000 });
    } catch (e) {
      console.log('===== Console Messages =====');
      consoleMessages.forEach(msg => {
        if (msg.type === 'error' || msg.text.includes('error') || msg.text.includes('Error') || msg.text.includes('Failed')) {
          console.log(`[${msg.type}]: ${msg.text}`);
        }
      });
      console.log('Alert message:', alertMessage);
      throw e;
    }
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'test-results/order-page.png', fullPage: true });
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    await expect(page.getByText('已支付')).toBeVisible({ timeout: 10000 });
    
    // 8. Capture Order ID for debugging if needed
    const url = page.url();
    console.log('Order created:', url.split('/').pop());
  });
});
