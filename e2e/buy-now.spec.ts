import { test, expect, type Page } from '@playwright/test';
import { ensureLoggedIn } from './utils';

test.describe('E2E Direct Buy Flow', () => {
  test('should allow user to buy now directly', async ({ page }) => {
    test.setTimeout(60000);
    await ensureLoggedIn(page);

    await page.goto('/zh/products');
    
    const inStockProduct = page.locator('a').filter({ has: page.getByText('加入购物车') }).first();
    await inStockProduct.click();
    
    await expect(page.getByText('商品参数')).toBeVisible({ timeout: 10000 }).catch(() => {});

    const colorBtn = page.getByRole('button', { name: 'Natural Titanium' })
    if (await colorBtn.isVisible()) {
      await colorBtn.click()
    }

    await page.getByText('立即购买').click()
    
    await expect(page).toHaveURL(/\/zh\/checkout\?source=direct/)
    
    const nameField = page.getByLabel('姓名');
    await expect(nameField).toBeVisible();
    
    await nameField.fill('Direct User');
    await page.getByLabel('地址').fill('Direct St');
    await page.getByLabel('城市').fill('Direct City');
    await page.getByLabel('邮编').fill('100000');
    
    const submitBtn = page.getByRole('button', { name: /支付 ¥/i });
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();
    
    await expect(page).toHaveURL(/\/zh\/orders\/.+/, { timeout: 15000 });
  })
})
