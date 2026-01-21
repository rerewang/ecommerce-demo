import { test, expect } from '@playwright/test';

test.describe('Product Filtering & Search', () => {
  test('updates URL when searching', async ({ page }) => {
    await page.goto('/products');

    // Find search input
    const searchInput = page.getByPlaceholder('Search products...');
    await expect(searchInput).toBeVisible();

    // Type query
    await searchInput.fill('phone');

    // Wait for debounce (300ms)
    await expect(page).toHaveURL(/q=phone/);
  });

  test('updates URL when filtering by category', async ({ page }) => {
    await page.goto('/products');

    // Find category select
    const categorySelect = page.getByRole('combobox', { name: /category/i });
    await expect(categorySelect).toBeVisible();

    // Select category
    await categorySelect.selectOption('Electronics');

    // URL should update immediately
    await expect(page).toHaveURL(/category=Electronics/);
  });

  test('updates URL when sorting', async ({ page }) => {
    await page.goto('/products');

    // Find sort select
    const sortSelect = page.getByRole('combobox', { name: /sort/i });
    await expect(sortSelect).toBeVisible();

    // Select sort option
    await sortSelect.selectOption('price_asc');

    // URL should update immediately
    await expect(page).toHaveURL(/sort=price_asc/);
  });

  test('preserves existing params when adding new ones', async ({ page }) => {
    await page.goto('/products?category=Electronics');

    // Search
    const searchInput = page.getByPlaceholder('Search products...');
    await searchInput.fill('phone');
    
    // Should have both
    await expect(page).toHaveURL(/category=Electronics/);
    await expect(page).toHaveURL(/q=phone/);
  });

  test('removes params when cleared', async ({ page }) => {
    await page.goto('/products?q=phone');

    const searchInput = page.getByPlaceholder('Search products...');
    await searchInput.fill('');

    await expect(page).not.toHaveURL(/q=phone/);
  });
});
