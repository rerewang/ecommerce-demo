import { test, expect, type Page } from '@playwright/test'

async function ensureLoggedIn(page: Page, email: string, password: string, allowSignup = true) {
  await page.goto('/zh/login')
  await page.getByLabel('邮箱').fill(email)
  await page.getByLabel('密码').fill(password)
  await page.locator('button[type="submit"]').filter({ hasText: '登录' }).click()

  const loggedIn = await page.waitForURL(/\/zh(\/)?$/, { timeout: 8000 }).then(() => true).catch(() => false)
  if (loggedIn) return

  const hasError = await page.getByText('登录失败').isVisible().catch(() => false)
  if (hasError && allowSignup) {
    await page.getByText('立即注册').click()
    await page.getByLabel('邮箱').fill(email)
    await page.getByLabel('密码').fill(password)
    await page.locator('button[type="submit"]').filter({ hasText: '注册' }).click()

    const registered = await page.waitForURL(/\/zh(\/)?$/, { timeout: 8000 }).then(() => true).catch(() => false)
    if (registered) return

    await page.getByText('去登录').click()
    await page.getByLabel('邮箱').fill(email)
    await page.getByLabel('密码').fill(password)
    await page.locator('button[type="submit"]').filter({ hasText: '登录' }).click()
    await page.waitForURL(/\/zh(\/)?$/, { timeout: 10000 })
  }
}

test.describe('User Orders Permission', () => {
  test('authenticated user can access orders page', async ({ page }) => {
    await ensureLoggedIn(page, 'user@example.com', '123456')
    
    await page.goto('/zh/orders')
    await expect(page).toHaveURL(/\/zh\/orders/)
    await expect(page.getByRole('heading', { name: '我的订单' })).toBeVisible()
  })
})

test.describe('Admin Orders Permission', () => {
  test('admin can access admin orders page', async ({ page }) => {
    await ensureLoggedIn(page, 'admin@example.com', '123456', false)

    await page.goto('/zh/admin/orders')
    await expect(page).toHaveURL(/\/zh\/admin\/orders/)
    await expect(page.getByRole('heading', { name: '订单管理' })).toBeVisible()
  })
})
