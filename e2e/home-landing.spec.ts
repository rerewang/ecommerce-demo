import { test, expect } from '@playwright/test'

test('Home page renders all sections and links', async ({ page }) => {
  await page.goto('/')

  // Use regex for titles that contain spans/formatting
  await expect(page.getByRole('heading', { name: /Masterpieces of/ })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Create Your Art' })).toBeVisible()

  await expect(page.getByRole('heading', { name: /How it Works/ })).toBeVisible()
  await expect(page.getByText('Upload Photo')).toBeVisible()

  await expect(page.getByRole('heading', { name: /Browse by Style/ })).toBeVisible()
  await expect(page.getByText('Classic Oil')).toBeVisible()

  await expect(page.getByRole('heading', { name: /Curated Gallery/ })).toBeVisible()
})
