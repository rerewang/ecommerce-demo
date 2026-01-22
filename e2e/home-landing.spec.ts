import { test, expect } from '@playwright/test'

test('Home page renders all sections and links', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByText('Masterpieces of Your Pet')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Create Your Art' })).toBeVisible()

  await expect(page.getByText('How it Works')).toBeVisible()
  await expect(page.getByText('Upload Photo')).toBeVisible()

  await expect(page.getByText('Browse by Style')).toBeVisible()
  await expect(page.getByText('Classic Oil')).toBeVisible()

  await expect(page.getByText('Curated Gallery')).toBeVisible()
})
