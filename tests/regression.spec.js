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
    await expect(page).toHaveTitle(/CNE Actas Observatory/);
    await expect(page.locator('h1')).toHaveText('An announced result. The data to verify it, missing.');

    const storedLang = await page.evaluate(() => localStorage.getItem('site_lang'));
    expect(storedLang).toBe('en');

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('h1')).toHaveText('An announced result. The data to verify it, missing.');
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

    expect(ogImage).toContain('https://tooltician.com/retardo_cne/assets/img/social-preview-1200x630.png');
    expect(ogWidth).toBe('1200');
    expect(ogHeight).toBe('630');
    expect(ogType).toBe('image/png');
    expect(twitterImage).toContain('https://tooltician.com/retardo_cne/assets/img/social-preview-1200x630.png');
  });

  test('existence stats cards render', async ({ page }) => {
    await page.goto('/');

    const cards = page.locator('.existence-stats .story-card');
    await expect(cards).toHaveCount(3);

    await cards.first().scrollIntoViewIfNeeded();
    // Verify stat values are visible
    await expect(cards.nth(0).locator('.existence-stat-value')).toHaveText('85,18%');
    await expect(cards.nth(1).locator('.existence-stat-value')).toHaveText('25.575');
    await expect(cards.nth(2).locator('.existence-stat-value')).toHaveText('30.026');
  });

  test('expert analyses preserve their distinct datasets and primary-source links', async ({ page }) => {
    await page.goto('/');

    const analysis = page.locator('#analisis-tecnico');
    await analysis.scrollIntoViewIfNeeded();
    await expect(analysis).toContainText('no evalúan el mismo objeto');
    await expect(analysis).toContainText('Primer boletín nacional anunciado por el CNE');
    await expect(analysis).toContainText('Actas publicadas por la campaña opositora');
    await expect(analysis).toContainText('no validan el boletín nacional del CNE');

    for (const href of [
      'https://terrytao.wordpress.com/2024/08/02/what-are-the-odds-ii-the-venezuelan-presidential-election/',
      'https://statmodeling.stat.columbia.edu/2024/07/31/suspicious-data-pattern-in-recent-venezuelan-election/',
      'https://dorothykronick.com/28J.pdf',
      'https://websites.umich.edu/~wmebane/Venezuela2024.pdf',
    ]) {
      await expect(analysis.locator(`a[href="${href}"]`)).toHaveCount(1);
    }
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

test('evidence-first narrative preserves sources, caveats and navigation in both languages', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('Un resultado anunciado. Los datos para comprobarlo, ausentes.');
  await expect(page.locator('.evidence-hero__reading a')).toHaveCount(3);
  await expect(page.locator('.evidence-hero__proof')).toContainText('Sin desglose por mesa');
  await expect(page.locator('.evidence-hero__proof')).toContainText('no significa que no existan actas físicas');
  await expect(page.locator('.evidence-hero__proof a[href*="cartercenter.org"]')).toHaveCount(1);
  await expect(page.locator('.evidence-conclusion__record')).toHaveCount(2);
  await expect(page.locator('#internacional .observer-section__finding')).toHaveCount(3);
  await expect(page.locator('#internacional')).toContainText('las motivaciones no pueden deducirse');
  await page.locator('.evidence-hero__reading a[href="#actas"]').click();
  await expect(page).toHaveURL(/#actas$/);

  await page.goto('/en/');
  await expect(page.locator('h1')).toHaveText('An announced result. The data to verify it, missing.');
  await expect(page.locator('.evidence-hero__proof')).toContainText('No station-level breakdown');
  await expect(page.locator('.evidence-conclusion__record')).toHaveCount(2);
});

test('evidence hero remains readable without horizontal overflow on a narrow viewport', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto('/');
  await expect(page.locator('.evidence-hero__comparison')).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('Carter arithmetic bound is sourced, conditional and bilingual', async ({ page }) => {
  await page.goto('/');
  const bound = page.locator('#analisis-tecnico .bound-case');
  await expect(bound).toContainText('3.915.001');
  await expect(bound).toContainText('3.576.544');
  await expect(bound).toContainText('338.457');
  await expect(bound).toContainText('Condición de la demostración');
  await expect(bound).toContainText('24.533 actas en el texto y 24.532 en la Tabla 1');
  await expect(bound.locator('a[href*="venezuela-final-report-2025-spanish.pdf"]')).toHaveCount(1);

  await page.goto('/en/');
  const boundEn = page.locator('#analisis-tecnico .bound-case');
  await expect(boundEn).toContainText('3,915,001');
  await expect(boundEn).toContainText('3,576,544');
  await expect(boundEn).toContainText('338,457');
  await expect(boundEn).toContainText('Condition of the demonstration');
});


test('provenance explains why a witness copy is still an official tally sheet', async ({ page }) => {
  await page.goto('/');
  const exhibit = page.locator('#procedencia');
  await expect(exhibit.locator('h2')).toContainText('No son «actas de la oposición».');
  await expect(exhibit).toContainText('Son actas de escrutinio.');
  await expect(exhibit).toContainText('50');
  await expect(exhibit).toContainText('18');
  await expect(exhibit).toContainText('40');
  await expect(exhibit).toContainText('23 videos sin acta identificable');
  await expect(exhibit).toContainText('No son 50 confirmaciones exactas');
  await expect(exhibit.locator('a[href*="venezuela-final-report-2025.pdf"]')).toHaveCount(4);
  await expect(exhibit.locator('a[href*="cazadores.info"]')).toHaveCount(1);
  await expect(page.locator('.section-rail a[href="#procedencia"]')).toHaveCount(1);

  await page.goto('/en/');
  await expect(page.locator('#procedencia')).toContainText('They are election tally sheets.');
  await expect(page.locator('#procedencia')).toContainText('not 50 exact confirmations');
  await expect(page.locator('.section-rail a[href="#procedencia"]')).toHaveCount(1);
});

test('document-provenance exhibit avoids narrow screen overflow in both themes', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto('/');
  await expect(page.locator('#procedencia .pv-diagram')).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.evaluate(() => localStorage.setItem('theme', 'dark'));
  await page.reload();
  await expect(page.locator('body')).toHaveClass(/dark-mode/);
  await expect(page.locator('#procedencia h2')).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});


test('editorial navbar is uncluttered, keyboard-accessible and functionally linked', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const nav = page.locator('.site-navbar');
  await expect(nav.locator('.site-navbar__identity')).toContainText('Retardo CNE');
  await expect(nav.locator('.site-navbar__links .nav-link-primary')).toHaveCount(3);
  await expect(nav.locator('.site-navbar__source')).toHaveAttribute('href', 'https://resultadosconvzla.com/');
  await expect(nav.locator('#toggleTheme')).toBeVisible();
  await expect(nav.locator('#toggleLang')).toBeVisible();

  const evidence = nav.locator('#evidenceDropdown');
  await evidence.click();
  await expect(evidence).toHaveAttribute('aria-expanded', 'true');
  await expect(nav.locator('#evidenceMenu')).toBeVisible();
  await expect(nav.locator('#evidenceMenu a[href="#procedencia"]')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(evidence).toHaveAttribute('aria-expanded', 'false');
  await expect(nav.locator('#evidenceMenu')).toBeHidden();
  await expect(evidence).toBeFocused();
});

test('graphite dark mode uses neutral surfaces and readable text in key components', async ({ page }) => {
  await page.goto('/');
  await page.locator('#toggleTheme').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('.site-navbar')).toHaveCSS('background-color', 'rgb(26, 37, 43)');
  await expect(page.locator('#procedencia')).toHaveCSS('background-color', 'rgb(26, 37, 43)');
  await expect(page.locator('#procedencia .pv-videos')).toHaveCSS('background-color', 'rgb(34, 47, 54)');

  const contrast = await page.locator('.site-navbar').evaluate((el) => {
    const rgb = (value) => {
      const channels = value.match(/[\d.]+/g).slice(0, 3).map(Number);
      return channels.map((c) => {
        const s = c / 255;
        return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      }).reduce((acc, c, i) => acc + c * [0.2126, 0.7152, 0.0722][i], 0);
    };
    const bg = rgb(getComputedStyle(el).backgroundColor);
    const primary = rgb(getComputedStyle(el.querySelector('.site-navbar__primary')).color);
    const label = rgb(getComputedStyle(el.querySelector('.site-navbar__wordmark small')).color);
    const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    return { primary: ratio(bg, primary), label: ratio(bg, label) };
  });
  expect(contrast.primary).toBeGreaterThanOrEqual(4.5);
  expect(contrast.label).toBeGreaterThanOrEqual(4.5);

  await page.locator('#evidenceDropdown').click();
  await expect(page.locator('#evidenceMenu')).toHaveCSS('background-color', 'rgb(26, 37, 43)');
});

test('mobile editorial navbar keeps accessible theme and language outside the drawer', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto('/');
  const panel = page.locator('#navbarNav');
  await expect(panel).toBeHidden();
  await expect(page.locator('.site-navbar #toggleTheme')).toBeVisible();
  await expect(page.locator('.site-navbar #toggleLang')).toBeVisible();
  await page.locator('#toggleTheme').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.locator('.site-navbar__toggler').click();
  await expect(panel).toBeVisible();
  await expect(page.locator('#evidenceDropdown')).toBeVisible();
  await page.locator('#evidenceDropdown').click();
  await expect(page.locator('#evidenceMenu')).toBeVisible();
  await page.locator('#evidenceMenu a[href="#procedencia"]').click();
  await expect(page).toHaveURL(/#procedencia$/);
  await expect(panel).toBeHidden();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await expect(page.locator('#procedencia')).toHaveCSS('background-color', 'rgb(26, 37, 43)');

  await page.locator('#toggleLang').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('.site-navbar__identity')).toContainText('Retardo CNE');
  await expect(page.locator('.site-navbar__source')).toHaveAttribute('href', 'https://resultadosconvzla.com/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});
