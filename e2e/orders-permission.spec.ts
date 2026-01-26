import { test, expect } from '@playwright/test'

test.describe('User Orders Permission', () => {
  test('authenticated user can access orders page', async ({ page }) => {
    await page.goto('/zh/login')
    await page.getByLabel('邮箱').fill('user@example.com')
    await page.getByLabel('密码').fill('123456')
    await page.locator('button[type="submit"]').filter({ hasText: '登录' }).click()
    
    await expect(page).toHaveURL(/\/zh/)
    
    await page.goto('/zh/orders')
    await expect(page).toHaveURL(/\/zh\/orders/)
    await expect(page.getByRole('heading', { name: '我的订单' })).toBeVisible()
  })
})

test.describe('Admin Orders Permission', () => {
  test('admin can access admin orders page', async ({ page }) => {
    await page.goto('/zh/login')
    await page.getByLabel('邮箱').fill('admin@example.com')
    await page.getByLabel('密码').fill('123456')
    await page.locator('button[type="submit"]').filter({ hasText: '登录' }).click()
    
    await expect(page).toHaveURL(/\/zh/)
    
    await page.goto('/zh/admin/orders')
    await expect(page).toHaveURL(/\/zh\/admin\/orders/)
    await expect(page.getByRole('heading', { name: '订单管理' })).toBeVisible()
  })
})
