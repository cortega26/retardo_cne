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
    await expect(toggleAfterReload.locator('.icon-sun')).toBeVisible();
  });

  test('language toggle persists and updates title', async ({ page }) => {
    await page.goto('/');

    const toggle = page.locator('#toggleLang');
    await toggle.click();

    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page).toHaveTitle('Verifiable CNE breaches — 2024 Election');
    await expect(page.locator('[data-i18n="hero_title"]')).toHaveText(
      'Verifiable CNE breaches — 2024 Election',
    );

    const storedLang = await page.evaluate(() => localStorage.getItem('site_lang'));
    expect(storedLang).toBe('en');

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('[data-i18n="hero_title"]')).toHaveText(
      'Verifiable CNE breaches — 2024 Election',
    );
  });

  test('copy link control is available in share section', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/');

    const copyButton = page.locator('#copyLinkBtn');
    await copyButton.scrollIntoViewIfNeeded();
    await expect(copyButton).toContainText('Copiar enlace');
    await copyButton.click();

    await expect(copyButton).toContainText('Enlace copiado');
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain(
      'http://127.0.0.1:4173/',
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

    await logos.first().scrollIntoViewIfNeeded();
    await expect.poll(async () => {
      return await logos.evaluateAll(
        (elements) => elements.filter((el) => el.complete && el.naturalWidth > 0).length,
      );
    }).toBe(4);

    const sizes = await logos.evaluateAll((elements) =>
      elements.map((el) => ({ src: el.getAttribute('src'), width: el.naturalWidth })),
    );
    sizes.forEach(({ src, width }) => {
      expect(src).toBeTruthy();
      expect(width).toBeGreaterThan(0);
    });
  });

  test('desktop navbar dropdowns open within the viewport', async ({ page }) => {
    await page.goto('/');

    for (const id of [
      'evidenceDropdown',
      'contextDropdown',
      'internacionalDropdown',
      'verificacionDropdown',
    ]) {
      const toggle = page.locator(`#${id}`);
      await toggle.click();

      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      const menu = toggle.locator('+ .dropdown-menu');
      await expect(menu).toBeVisible();

      const menuBox = await menu.boundingBox();
      const viewport = page.viewportSize();
      expect(menuBox).toBeTruthy();
      expect(viewport).toBeTruthy();
      expect(menuBox.y).toBeGreaterThanOrEqual(0);
      expect(menuBox.height).toBeLessThanOrEqual(viewport.height);

      await page.keyboard.press('Escape');
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    }
  });

  test('mobile navbar can open a dropdown and navigate to an in-page section', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    await page.locator('.navbar-toggler').click();
    await expect(page.locator('#navbarNav')).toHaveClass(/show/);

    const evidenceToggle = page.locator('#evidenceDropdown');
    await evidenceToggle.click();
    await expect(evidenceToggle).toHaveAttribute('aria-expanded', 'true');

    const evidenceMenu = evidenceToggle.locator('+ .dropdown-menu');
    await expect(evidenceMenu).toBeVisible();

    const navPanel = page.locator('#navbarNav');
    const navBox = await navPanel.boundingBox();
    const viewport = page.viewportSize();
    expect(navBox).toBeTruthy();
    expect(viewport).toBeTruthy();
    expect(navBox.height).toBeLessThanOrEqual(viewport.height);

    await evidenceMenu.locator('a[href="#cronologia"]').click();
    await expect(page).toHaveURL(/#cronologia$/);
    await expect(navPanel).not.toHaveClass(/show/);
  });
});
