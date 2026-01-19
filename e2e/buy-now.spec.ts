import { test, expect } from '@playwright/test';

test.describe('E2E Direct Buy Flow', () => {
  const email = 'user@example.com';
  const password = '123456';

  test('should allow user to buy now directly', async ({ page }) => {
    // 1. Login
    await page.goto('/login');
    await page.getByLabel('邮箱').fill(email);
    await page.getByLabel('密码').fill(password);
    await page.locator('button[type="submit"]').filter({ hasText: '登录' }).click();
    await expect(page).toHaveURL('/');

    // 2. Go to PDP
    // We need a valid product. Assuming first product in list.
    await page.locator('a[href^="/products/"]').first().click();
    
    // 3. Select variant if exists (Mock product 1 has variants)
    // Wait for page to load
    await expect(page.getByText('商品参数')).toBeVisible({ timeout: 10000 }).catch(() => {});

    const colorBtn = page.getByRole('button', { name: 'Natural Titanium' })
    if (await colorBtn.isVisible()) {
      await colorBtn.click()
    }

    // 4. Click Buy Now
    await page.getByText('立即购买').click()
    
    // 5. Expect Checkout with direct source
    await expect(page).toHaveURL(/checkout\?source=direct/)
    
    // 6. Verify Form appears (not empty cart)
    const nameField = page.getByLabel('姓名');
    await expect(nameField).toBeVisible();
    
    // 7. Fill and Pay
    await nameField.fill('Direct User');
    await page.getByLabel('地址').fill('Direct St');
    await page.getByLabel('城市').fill('Direct City');
    await page.getByLabel('邮编').fill('100000');
    
    const submitBtn = page.getByRole('button', { name: /支付 ¥/i });
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();
    
    // 8. Expect Redirect to Order
    await expect(page).toHaveURL(/\/orders\/.+/, { timeout: 15000 });
  })
})
