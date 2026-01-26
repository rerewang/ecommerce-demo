import { test, expect } from '@playwright/test'

test.describe('Global Search', () => {
  test('should search from header and redirect to products page', async ({ page }) => {
    // 1. Visit Home
    await page.goto('/')
    
    // 2. Find search input (desktop)
    // There are two inputs (desktop and mobile), only desktop is visible
    const searchInput = page.getByTestId('global-search-input').filter({ hasText: '' }).first()
    await expect(searchInput).toBeVisible()
    
    // 3. Type and enter
    await searchInput.fill('oil')
    await searchInput.press('Enter')
    
    // 4. Check redirect URL params
    await expect(page).toHaveURL(/.*\/products\?q=oil/)
    
    // 5. Check input value persists
    // On products page, there might be another search input (filter bar), 
    // so we specifically check the global search one
    await expect(page.getByTestId('global-search-input').first()).toHaveValue('oil')
  })

  test('should search from mobile menu', async ({ page }) => {
    // 1. Visit Home & set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // 2. Open mobile menu
    await page.getByLabel('Toggle menu').click()
    
    // 3. Find search input inside menu
    // Now the mobile one should be visible. 
    // Since desktop is hidden via CSS class, filtering by visibility is key.
    // Or better: ensure we get the visible one
    const visibleInput = page.getByTestId('global-search-input').locator('visible=true')
    
    await expect(visibleInput).toBeVisible()
    
    // 4. Type and enter
    await visibleInput.fill('cat')
    await visibleInput.press('Enter')
    
    // 5. Check redirect URL params
    await expect(page).toHaveURL(/.*\/products\?q=cat/)
    
    // 6. Check mobile menu is closed (optional, but good UX)
  })
})
