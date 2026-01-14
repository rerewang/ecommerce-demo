import { test, expect } from '@playwright/test';

// Skip this test in CI/Check phase until we have a seeded admin user
// This serves as our "Spec" for manual verification or advanced CI setup
test.skip('RBAC: customer cannot access admin', async ({ page }) => {
  // 1. Go to Login
  await page.goto('/login');
  
  // 2. Login as customer (Assuming we have a test customer)
  await page.fill('input[name="email"]', 'customer@test.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  // 3. Try to go to admin
  await page.goto('/admin');
  
  // 4. Expect redirect to home or 403
  await expect(page).not.toHaveURL(/\/admin/);
});
