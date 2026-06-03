const { test, expect } = require('@playwright/test');

test.describe('regression coverage', () => {
  test('counter displays elapsed time', async ({ page }) => {
    await page.goto('/');

    const secondsLocator = page.locator('#counter1 [data-unit="3"] .number');
    await expect(secondsLocator).toHaveText(/\d+/);

    const initial = Number(await secondsLocator.textContent());
    expect(initial).toBeGreaterThan(0);
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
    await expect(page).toHaveURL(/\/retardo_cne\/en\/$/);
    await expect(page).toHaveTitle(/Verifiable Breaches by the CNE/);
    await expect(page.locator('h1')).toHaveText('Verifiable Breaches by the CNE');

    const storedLang = await page.evaluate(() => localStorage.getItem('site_lang'));
    expect(storedLang).toBe('en');

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('h1')).toHaveText('Verifiable Breaches by the CNE');
  });

  test('copy link control is available in share section', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/');

    const copyButton = page.locator('#copyLinkBtn');
    await copyButton.scrollIntoViewIfNeeded();
    await expect(copyButton).toContainText('Copiar enlace');
    await copyButton.click();

    await expect(copyButton).toContainText('✓ ¡Copiado!');
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain(
      '127.0.0.1:4327',
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

    expect(ogImage).toContain('https://tooltician.com/retardo_cne/assets/img/social-preview.jpg');
    expect(ogWidth).toBe('1024');
    expect(ogHeight).toBe('1024');
    expect(ogType).toBe('image/jpeg');
    expect(twitterImage).toContain('https://tooltician.com/retardo_cne/assets/img/social-preview.jpg');
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
      'verificationDropdown',
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
    await expect
      .poll(() =>
        page.locator('#cronologia').evaluate((el) => Math.round(el.getBoundingClientRect().top)),
      )
      .toBeLessThan(180);

    await page.locator('.navbar-toggler').click();
    await page.locator('#contextDropdown').click();
    await page.locator('#contextDropdown + .dropdown-menu a[href="#sistema"]').click();
    await expect(page).toHaveURL(/#sistema$/);
    await expect(navPanel).not.toHaveClass(/show/);
    await expect
      .poll(() =>
        page.locator('#sistema').evaluate((el) => Math.round(el.getBoundingClientRect().top)),
      )
      .toBeLessThan(180);
  });

  test('top-level navbar links navigate directly to their sections', async ({ page }) => {
    await page.goto('/');

    const expectations = [
      ['.nav-link-primary[href="#cronologia"]', '#cronologia'],
      ['.nav-link-primary[href="#sistema"]', '#sistema'],
      ['.nav-link-primary[href="#verificacion"]', '#verificacion'],
    ];

    for (const [selector, target] of expectations) {
      await page.locator(selector).click();
      await expect(page).toHaveURL(new RegExp(`${target}$`));
      await expect
        .poll(() =>
          page.locator(target).evaluate((el) => Math.round(el.getBoundingClientRect().top)),
        )
        .toBeLessThan(180);
    }
  });
});
