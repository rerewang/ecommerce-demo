import { test, expect, type Page } from '@playwright/test'
import { ensureLoggedIn } from './utils'

test.describe('User Orders Permission', () => {
  test('authenticated user can access orders page', async ({ page }) => {
    test.setTimeout(60000);
    await ensureLoggedIn(page, 'user@example.com', '123456')
    
    await page.goto('/zh/orders')
    await expect(page).toHaveURL(/\/zh\/orders/)
    await expect(page.getByRole('heading', { name: '我的订单' })).toBeVisible()
  })
})

test.describe('Admin Orders Permission', () => {
  test('admin can access admin orders page', async ({ page }) => {
    test.setTimeout(60000);
    await ensureLoggedIn(page, 'admin@example.com', '123456', false)

    await page.goto('/zh/admin/orders')
    await expect(page).toHaveURL(/\/zh\/admin\/orders/)
    await expect(page.getByRole('heading', { name: '订单管理' })).toBeVisible()
  })
})
