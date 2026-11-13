import { expect, test } from '@playwright/test';

test.describe('the flagship figures', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?theme=day');
  });

  test('all three are drawn straight onto the page and raise no errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    for (const selector of ['[data-semg]', '[data-desk]', '[data-report]']) {
      const figure = page.locator(selector);
      await figure.scrollIntoViewIfNeeded();
      expect(await figure.evaluate((node) => getComputedStyle(node).backgroundColor), selector).toBe('rgba(0, 0, 0, 0)');
      await expect(figure.locator('svg .fig-station').first()).toBeVisible();
    }
    expect(errors).toEqual([]);
  });

  test('the globe steps back while a machine has the floor', async ({ page }) => {
    await page.locator('#chengdu').evaluate((section) => section.scrollIntoView({ behavior: 'instant' }));
    await expect(page.locator('.journey')).toHaveAttribute('data-quiet', 'true');
    await page.locator('#uva').evaluate((section) => section.scrollIntoView({ behavior: 'instant' }));
    await expect(page.locator('.journey')).toHaveAttribute('data-quiet', 'false');
  });

  test('sEMG: the line has seven stations, and clicking a machine on the drawing explains it', async ({ page }) => {
    const figure = page.locator('[data-semg]');
    await expect(figure.locator('.flag__stepper button')).toHaveCount(7);

    await figure.locator('svg .fig-station[data-station="4"]').first().click({ force: true });
    await expect(figure).toHaveAttribute('data-active', '4');
    await expect(figure.locator('[data-step-text]:visible h4')).toHaveText('Transformer 主干');
    await expect(figure.locator('[data-step-text]:visible .flag__spec')).toContainText('Pre-LN');
  });

  test('sEMG: turning the band moves the signal one seat round the table, neighbours and all', async ({ page }) => {
    const figure = page.locator('[data-semg]');
    await figure.locator('[data-step="2"]').click();
    const hot = figure.locator('.fig-seat.is-hot');
    await expect(hot).toHaveCount(1);
    await expect(figure.locator('.fig-seat.is-near')).toHaveCount(2);
    const before = await hot.getAttribute('data-seat');

    await figure.getByRole('button', { name: '往右转一格' }).click();
    await expect(figure).toHaveAttribute('data-over-muscle', '4');
    await expect(hot).toHaveCount(1);
    await expect(figure.locator('.fig-seat.is-near')).toHaveCount(2);
    expect(await hot.getAttribute('data-seat')).not.toBe(before);
    await expect(figure.locator('[data-caption]')).toContainText('4 号电极');

    await figure.getByRole('button', { name: '戴正' }).click();
    expect(await hot.getAttribute('data-seat')).toBe(before);
  });

  test('sEMG: each version shows which machines it has and how many keys it gets wrong', async ({ page }) => {
    const figure = page.locator('[data-semg]');
    await expect(figure.locator('.fig-block')).toHaveCount(26);
    await expect(figure.locator('.fig-block.is-wrong')).toHaveCount(3);
    await expect(figure.locator('svg .is-absent')).toHaveCount(0);

    await figure.locator('[data-version="0"]').click();
    await expect(figure.locator('.fig-block.is-wrong')).toHaveCount(20);
    await expect(figure.locator('svg .fig-station[data-station="4"]').first()).toHaveClass(/is-absent/);
    await expect(figure.locator('svg .fig-station[data-station="1"]').first()).not.toHaveClass(/is-absent/);

    await figure.locator('[data-version="1"]').click();
    await expect(figure.locator('.fig-block.is-wrong')).toHaveCount(5);
    await expect(figure.locator('svg .fig-station[data-station="4"]').first()).not.toHaveClass(/is-absent/);
    await expect(figure.locator('svg .fig-station[data-station="3"]').first()).toHaveClass(/is-absent/);
  });

  test('sEMG: sending a signal in follows it to the decoder', async ({ page }) => {
    const figure = page.locator('[data-semg]');
    await figure.getByRole('button', { name: '送一段信号进去' }).click();
    await expect(figure).toHaveAttribute('data-running', 'true');
    await expect(figure).toHaveAttribute('data-active', '6', { timeout: 14000 });
    await expect(figure).toHaveAttribute('data-running', 'false', { timeout: 4000 });
  });

  test('SDG&E: clicking a machine says what it does and who does it', async ({ page }) => {
    const figure = page.locator('[data-desk]');
    await figure.locator('svg [data-node="store"]').click({ force: true });
    await expect(figure.locator('[data-step-text]:visible h4')).toContainText('同一个库');
    await expect(figure.locator('[data-step-text]:visible .flag__by')).toHaveText('程序');
    await expect(figure.locator('[data-step-text]:visible .flag__spec')).toContainText('pgvector');
  });

  test('SDG&E: picking the model leaves only the steps the model does', async ({ page }) => {
    const figure = page.locator('[data-desk]');
    await figure.getByRole('button', { name: '模型', exact: true }).click();
    await expect(figure.locator('svg [data-node="form"]')).not.toHaveClass(/is-dim/);
    await expect(figure.locator('svg [data-node="gates"]')).toHaveClass(/is-dim/);
    await expect(figure.locator('svg [data-node="compute"]')).toHaveClass(/is-dim/);

    await figure.getByRole('button', { name: '全部' }).click();
    await expect(figure.locator('svg .is-dim')).toHaveCount(0);
  });

  test('SDG&E: a follow-up is completed from the notebook, then answered from the table', async ({ page }) => {
    const figure = page.locator('[data-desk]');
    await figure.locator('[data-question=followup]').click();
    const next = figure.getByRole('button', { name: '下一步' });
    while (await next.isEnabled()) await next.click();
    const steps = figure.locator('[data-log=followup] li');
    await expect(steps.filter({ visible: true })).toHaveCount(7);
    await expect(steps.first()).toContainText('记事本');
    await expect(figure).toHaveAttribute('data-at', 'answer');
  });

  test('SDG&E: a request to delete data is stopped at the gates and never reaches the adding machine', async ({ page }) => {
    const figure = page.locator('[data-desk]');
    await figure.locator('[data-question=tamper]').click();
    const next = figure.getByRole('button', { name: '下一步' });
    while (await next.isEnabled()) await next.click();
    const steps = figure.locator('[data-log=tamper] li');
    await expect(steps.filter({ visible: true })).toHaveCount(5);
    await expect(steps.nth(3)).toContainText('拦下');
    await expect(figure.locator('svg [data-node="compute"]')).not.toHaveClass(/is-visited/);
    await expect(figure).toHaveAttribute('data-at', 'answer');
  });

  test('极蜂: the contents station opens up into its four safeguards, and the score loop is drawn', async ({ page }) => {
    const figure = page.locator('[data-report]');
    await expect(figure.locator('.flag__stepper button')).toHaveCount(6);
    await expect(figure.locator('svg .fig-loop')).toHaveCount(1);

    await figure.locator('[data-step="1"]').click();
    await expect(figure.locator('[data-step-points]:visible li')).toHaveCount(4);
    await expect(figure.locator('[data-step-text]:visible .flag__spec')).toContainText('constrained decoding');
  });

  test('nothing spills sideways on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/?theme=day');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
