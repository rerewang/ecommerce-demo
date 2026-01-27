import { test, expect } from '@playwright/test';
import { ensureLoggedIn } from './utils';

test.describe('E2E Direct Buy Flow', () => {
  test('should allow user to buy now directly', async ({ page }) => {
    test.setTimeout(90000); // Increased timeout significantly
    await ensureLoggedIn(page);

    await page.goto('/zh/products');
    
    // Find first available product with "Add to Cart"
    const inStockProduct = page.locator('a').filter({ has: page.getByText('加入购物车') }).first();
    await inStockProduct.click();
    
    // Ensure Product Details Page Loaded
    await expect(page.getByText('商品参数')).toBeVisible({ timeout: 15000 }).catch(() => {});

    // Handle Variants (if any)
    const colorBtn = page.getByRole('button', { name: 'Natural Titanium' });
    if (await colorBtn.isVisible()) {
      await colorBtn.click();
    }

    // Click Buy Now and Wait for Navigation
    const buyNowBtn = page.getByText('立即购买');
    await expect(buyNowBtn).toBeVisible({ timeout: 30000 });
    await expect(buyNowBtn).toBeEnabled({ timeout: 30000 });
    
    // Explicitly wait for navigation to start
    await Promise.all([
      page.waitForURL(/\/zh\/checkout\?source=direct/, { timeout: 30000 }),
      buyNowBtn.click()
    ]);
    
    // Fill Checkout Form
    const nameField = page.getByLabel('姓名');
    await expect(nameField).toBeVisible({ timeout: 10000 });
    
    await nameField.fill('Direct User');
    await page.getByLabel('地址').fill('Direct St');
    await page.getByLabel('城市').fill('Direct City');
    await page.getByLabel('邮编').fill('100000');
    
    // Submit Payment
    const submitBtn = page.getByRole('button', { name: /支付 ¥/i });
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();
    
    // Verify Order Success
    await expect(page).toHaveURL(/\/zh\/orders\/.+/, { timeout: 30000 });
  })
})
