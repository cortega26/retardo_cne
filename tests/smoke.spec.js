const { test, expect } = require('@playwright/test');

test('homepage smoke', async ({ page }) => {
  await page.goto('/');

  const counterDigits = page.locator('#counter1 .number');
  await expect(counterDigits).toHaveCount(4);

  const themeToggle = page.locator('#toggleTheme');
  await themeToggle.click();
  await expect(page.locator('body')).toHaveClass(/dark-mode/);
  await expect(themeToggle).toHaveAttribute('aria-pressed', 'true');

  const langToggle = page.locator('#toggleLang');
  await expect(langToggle.locator('.lang-code')).toHaveText('EN');
  await langToggle.click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('h1')).toHaveText('The CNE published zero actas. Citizens published 25,575. That difference has a name.');

  await expect(page.locator('.existence-stats .story-card')).toHaveCount(3);
});
