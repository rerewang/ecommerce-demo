import { test, expect } from '@playwright/test';

test('buttons have correct styling and feedback', async ({ page }) => {
  await page.goto('/');
  
  // Find a primary button
  const addToCartBtn = page.locator('button', { hasText: '加入购物车' }).first();
  await expect(addToCartBtn).toBeVisible();

  // Check CSS background color (Sky Blue)
  await expect(addToCartBtn).toHaveCSS('background-color', 'rgb(135, 206, 235)');
  
  // Test Interaction Feedback
  await addToCartBtn.click();
  
  // Should change text to "已添加到购物车"
  await expect(page.locator('button', { hasText: '已添加到购物车' }).first()).toBeVisible();
  
  // Should turn Green (Success color: #10b981 -> rgb(16, 185, 129))
  await expect(page.locator('button', { hasText: '已添加到购物车' }).first()).toHaveCSS('background-color', 'rgb(16, 185, 129)');
});

test('cart icon navigates to cart page', async ({ page }) => {
  await page.goto('/');
  
  // Click cart icon (it's inside a Link now)
  // We locate it by the SVG or the wrapper button
  const cartLink = page.locator('a[href="/cart"]');
  await expect(cartLink).toBeVisible();
  
  await cartLink.click();
  
  await expect(page).toHaveURL(/\/cart/);
});
