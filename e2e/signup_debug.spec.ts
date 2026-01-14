import { test, expect } from '@playwright/test';

test('debug registration flow', async ({ page }) => {
  console.log('--- Starting Registration Debug ---');
  
  // 1. Go to Login
  await page.goto('/login');
  
  // 2. Switch to Register
  await page.click('button:has-text("立即注册")');
  
  // 3. Fill form
  // Using a random email to avoid "User already registered" errors if you tried before
  const testEmail = `admin_${Date.now()}@example.com`; 
  console.log(`Attempting to register: ${testEmail}`);
  
  await page.fill('input[name="email"]', testEmail);
  await page.fill('input[name="password"]', '123456');
  
  // 4. Click Register
  await page.click('button[type="submit"]');
  
  // 5. Wait for result (either Success message or Error message)
  // We wait for either the success text or error text
  try {
    const successMsg = page.locator('.text-green-500');
    const errorMsg = page.locator('.text-red-500');
    
    await expect(successMsg.or(errorMsg)).toBeVisible({ timeout: 5000 });
    
    if (await successMsg.isVisible()) {
      console.log('SUCCESS: ', await successMsg.innerText());
    }
    
    if (await errorMsg.isVisible()) {
      console.log('ERROR: ', await errorMsg.innerText());
    }
  } catch (e) {
    console.log('TIMEOUT: No message appeared after 5 seconds.');
    // Maybe it redirected?
    console.log('Current URL:', page.url());
  }
});
