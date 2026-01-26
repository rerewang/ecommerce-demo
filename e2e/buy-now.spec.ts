import { test, expect } from '@playwright/test';

test.describe('E2E Direct Buy Flow', () => {
  const email = 'user@example.com';
  const password = '123456';

  test('should allow user to buy now directly', async ({ page }) => {
    test.setTimeout(60000);
    // 1. Login
    await page.goto('/zh/login');
    await page.getByLabel('邮箱').fill(email);
    await page.getByLabel('密码').fill(password);
    await page.locator('button[type="submit"]').filter({ hasText: '登录' }).click();
    await expect(page).toHaveURL(/\/zh/, { timeout: 10000 });

    // 2. Navigate to products
    await page.goto('/zh/products');
    
    // 3. Go to PDP
    // Find a product that is in stock (has "加入购物车" button in the card)
    const inStockProduct = page.locator('a').filter({ has: page.getByText('加入购物车') }).first();
    await inStockProduct.click();
    
    // 4. Select variant if exists (Mock product 1 has variants)
    // Wait for page to load
    await expect(page.getByText('商品参数')).toBeVisible({ timeout: 10000 }).catch(() => {});

    const colorBtn = page.getByRole('button', { name: 'Natural Titanium' })
    if (await colorBtn.isVisible()) {
      await colorBtn.click()
    }

    // 5. Click Buy Now
    await page.getByText('立即购买').click()
    
    // 6. Expect Checkout with direct source
    await expect(page).toHaveURL(/\/zh\/checkout\?source=direct/)
    
    // 7. Verify Form appears (not empty cart)
    const nameField = page.getByLabel('姓名');
    await expect(nameField).toBeVisible();
    
    // 8. Fill and Pay
    await nameField.fill('Direct User');
    await page.getByLabel('地址').fill('Direct St');
    await page.getByLabel('城市').fill('Direct City');
    await page.getByLabel('邮编').fill('100000');
    
    const submitBtn = page.getByRole('button', { name: /支付 ¥/i });
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();
    
    // 9. Expect Redirect to Order
    await expect(page).toHaveURL(/\/zh\/orders\/.+/, { timeout: 15000 });
  })
})
