const { test, expect } = require('@playwright/test');

test.describe('regression coverage', () => {
  test('counter updates once per second', async ({ page }) => {
    await page.goto('/');

    const secondsLocator = page.locator('#counter1 .seconds .number');
    await expect(secondsLocator).toHaveText(/\d+/);

    const initial = Number(await secondsLocator.innerText());
    await expect.poll(
      async () => Number(await secondsLocator.innerText()) !== initial,
      { timeout: 3000 },
    ).toBe(true);
  });

  test('theme toggle persists across reload', async ({ page }) => {
    await page.goto('/');

    const toggle = page.locator('#toggleTheme');
    await toggle.click();

    await expect(page.locator('body')).toHaveClass(/dark-mode/);
    const storedTheme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(storedTheme).toBe('dark');

    await page.reload();
    const toggleAfterReload = page.locator('#toggleTheme');
    await expect(page.locator('body')).toHaveClass(/dark-mode/);
    await expect(toggleAfterReload.locator('i')).toHaveClass(/fa-sun/);
  });

  test('language toggle persists and updates title', async ({ page }) => {
    await page.goto('/');

    const toggle = page.locator('#toggleLang');
    await toggle.click();

    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page).toHaveTitle('Verifiable CNE breaches - 2024 Election');
    await expect(page.locator('[data-i18n="hero_title"]')).toHaveText(
      'Verifiable CNE breaches - 2024 Election',
    );

    const storedLang = await page.evaluate(() => localStorage.getItem('site_lang'));
    expect(storedLang).toBe('en');

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('[data-i18n="hero_title"]')).toHaveText(
      'Verifiable CNE breaches - 2024 Election',
    );
  });

  test('social metadata is present for previews', async ({ page }) => {
    await page.goto('/');

    const ogImage = await page
      .locator('meta[property="og:image"]')
      .getAttribute('content');
    const ogWidth = await page
      .locator('meta[property="og:image:width"]')
      .getAttribute('content');
    const ogHeight = await page
      .locator('meta[property="og:image:height"]')
      .getAttribute('content');
    const ogType = await page
      .locator('meta[property="og:image:type"]')
      .getAttribute('content');
    const twitterImage = await page
      .locator('meta[name="twitter:image"]')
      .getAttribute('content');

    expect(ogImage).toContain('/assets/img/social-preview.jpg');
    expect(ogWidth).toBe('1024');
    expect(ogHeight).toBe('1024');
    expect(ogType).toBe('image/jpeg');
    expect(twitterImage).toContain('/assets/img/social-preview.jpg');
  });

  test('organization logos load', async ({ page }) => {
    await page.goto('/');

    const logos = page.locator('.international-validation .org-logo');
    await expect(logos).toHaveCount(4);

    const sizes = await logos.evaluateAll((elements) =>
      elements.map((el) => ({ src: el.getAttribute('src'), width: el.naturalWidth })),
    );
    sizes.forEach(({ src, width }) => {
      expect(src).toBeTruthy();
      expect(width).toBeGreaterThan(0);
    });
  });
});
