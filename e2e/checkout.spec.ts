import { test, expect, type Page } from '@playwright/test';
import { ensureLoggedIn } from './utils';

test.describe('E2E Checkout Flow (Real User)', () => {
  test('should allow user to purchase items', async ({ page }) => {
    test.setTimeout(60000);
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

    await ensureLoggedIn(page);
    await page.goto('/zh/products');

    const productCard = page.locator('a').filter({ has: page.getByText('加入购物车') }).first();
    await expect(productCard).toBeVisible({ timeout: 10000 });
    
    await productCard.locator('button').filter({ hasText: '加入购物车' }).first().click();
    await expect(page.getByText('已添加到购物车')).toBeVisible();

    await page.locator('a[href="/zh/cart"]').first().click();
    await expect(page).toHaveURL(/\/zh\/cart/);
    
    const checkoutLink = page.getByRole('link', { name: /前往结算/ });
    await expect(checkoutLink).toBeVisible({ timeout: 10000 });
    
    await checkoutLink.click();
    await page.waitForURL(/\/zh\/checkout/, { timeout: 10000 });
    
    await expect(page.getByText('正在验证登录状态...')).not.toBeVisible({ timeout: 5000 });
    await expect(page.getByText('购物车为空')).not.toBeVisible();
    
    const nameField = page.getByLabel('姓名');
    await expect(nameField).toBeVisible({ timeout: 5000 });
    
    await nameField.fill('Real User');
    await page.getByLabel('地址').fill('123 Real St');
    await page.getByLabel('城市').fill('Beijing');
    await page.getByLabel('邮编').fill('100000');

    const submitBtn = page.getByRole('button', { name: /支付 ¥/i });
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    await expect(page).toHaveURL(/\/zh\/orders\/.+/, { timeout: 15000 });
    
    const statusBadge = page.locator('main span.rounded-full').filter({ hasText: /待支付|Paid|Pending/i }).first();
    await expect(statusBadge).toBeVisible();
  });
});
