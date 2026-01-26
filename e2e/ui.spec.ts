import { test, expect } from '@playwright/test';

test('buttons have correct styling and feedback', async ({ page }) => {
  await page.goto('/zh/products');

  const addToCartBtn = page.locator('button', { hasText: '加入购物车' }).first();
  await expect(addToCartBtn).toBeVisible();

  await addToCartBtn.click();

  await expect(page.locator('button', { hasText: '已添加到购物车' }).first()).toBeVisible();
});

test('cart icon navigates to cart page', async ({ page }) => {
  await page.goto('/zh/products');

  const cartLink = page.locator('a[href="/zh/cart"]').first();
  await expect(cartLink).toBeVisible();

  await cartLink.click();

  await expect(page).toHaveURL(/\/zh\/cart/);
});
