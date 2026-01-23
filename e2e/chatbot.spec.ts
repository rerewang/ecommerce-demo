import { test, expect } from '@playwright/test'

test.describe('Chatbot', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('/api/chat', async route => {
      const headers = { 'Content-Type': 'text/plain; charset=utf-8' }
      
      await route.fulfill({
        status: 200,
        headers,
        body: 'Hello world from AI'
      })
    })

    await page.goto('/')
  })

  test('can open chat widget and send message', async ({ page }) => {
    const toggleBtn = page.getByRole('button').filter({ has: page.locator('.lucide-message-circle') })
    await expect(toggleBtn).toBeVisible()
    await expect(page.getByText('PetPixel Art Curator')).not.toBeVisible()

    await toggleBtn.click()
    await expect(page.getByText('PetPixel Art Curator')).toBeVisible()
    await expect(page.getByText('Premium AI Assistant')).toBeVisible()

    const input = page.getByPlaceholder('Ask about art styles...')
    await input.fill('Show me oil paintings')
    
    const sendBtn = page.locator('form button').filter({ has: page.locator('.lucide-send') })
    await sendBtn.click()

    await expect(page.locator('.whitespace-pre-wrap').getByText('Show me oil paintings')).toBeVisible()
  })

  test('shows suggested questions when empty', async ({ page }) => {
    await page.getByRole('button').filter({ has: page.locator('.lucide-message-circle') }).click()

    await expect(page.getByText('Find oil paintings under $200')).toBeVisible()
    
    await page.getByText('Find oil paintings under $200').click()
    
    const input = page.getByPlaceholder('Ask about art styles...')
    await expect(input).toHaveValue('Find oil paintings under $200')
  })

  test('can clear conversation', async ({ page }) => {
    await page.getByRole('button').filter({ has: page.locator('.lucide-message-circle') }).click()

    const input = page.getByPlaceholder('Ask about art styles...')
    await input.fill('Hello')
    const sendBtn = page.locator('form button').filter({ has: page.locator('.lucide-send') })
    await sendBtn.click()
    
    await expect(page.locator('.whitespace-pre-wrap').getByText('Hello')).toBeVisible()

    page.on('dialog', dialog => dialog.accept())

    const clearBtn = page.getByTitle('Clear chat')
    await clearBtn.click()

    await expect(page.getByText('Welcome! I can help you')).toBeVisible()
    await expect(page.locator('.whitespace-pre-wrap').getByText('Hello')).not.toBeVisible()
  })
})
