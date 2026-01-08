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
  await langToggle.click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('[data-i18n="hero_title"]')).toHaveText(
    'Legal Compliance Observatory',
  );

  const highlight = page.locator('.highlight-text');
  await highlight.scrollIntoViewIfNeeded();
  await expect(highlight).toHaveClass(/active/);
});
