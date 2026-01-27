import { type Page, expect } from '@playwright/test';

export async function ensureLoggedIn(page: Page, email = 'user@example.com', password = '123456', allowSignup = true) {
  await page.goto('/zh/login');

  try {
    await page.waitForURL(/\/(zh|en)(\/)?$/, { timeout: 3000 });
    return;
  } catch {
  }

  await page.getByLabel('邮箱').fill(email);
  await page.getByLabel('密码').fill(password);
  await page.locator('button[type="submit"]').filter({ hasText: '登录' }).click();

  try {
    await Promise.race([
      page.waitForURL(/\/(zh|en)(\/)?$/, { timeout: 15000 }),
      page.waitForSelector('text=登录失败', { timeout: 15000 })
    ]);
  } catch (e) {
    console.log('Timeout waiting for login response');
  }

  if (page.url().match(/\/(zh|en)(\/)?$/)) {
    return;
  }

  const hasError = await page.getByText('登录失败').isVisible().catch(() => false);
  
  if (hasError && allowSignup) {
    console.log('Login failed, attempting registration...');
    await page.getByText('立即注册').click();
    await page.getByLabel('邮箱').fill(email);
    await page.getByLabel('密码').fill(password);
    await page.locator('button[type="submit"]').filter({ hasText: '注册' }).click();

    try {
      await Promise.race([
        page.waitForURL(/\/(zh|en)(\/)?$/, { timeout: 15000 }),
        page.waitForSelector('text=注册失败', { timeout: 15000 }),
        page.waitForSelector('text=去登录', { timeout: 15000 })
      ]);
    } catch {
       console.log('Timeout waiting for registration response');
    }

    if (page.url().match(/\/(zh|en)(\/)?$/)) {
      return;
    }

    if (await page.getByText('去登录').isVisible()) {
      await page.getByText('去登录').click();
      await page.getByLabel('邮箱').fill(email);
      await page.getByLabel('密码').fill(password);
      await page.locator('button[type="submit"]').filter({ hasText: '登录' }).click();
      await page.waitForURL(/\/zh(\/)?$/, { timeout: 20000 });
    }
  }
}
