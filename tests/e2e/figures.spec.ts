import { expect, test } from '@playwright/test';

test.describe('the flagship figures', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./?theme=day');
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

  test('each drawing and the explanation of its chosen station are on screen together', async ({ page }) => {
    for (const [stop, selector] of [['chengdu', '[data-report]'], ['semg', '[data-semg]'], ['sdge', '[data-desk]']] as const) {
      await page.locator(`#${stop}`).evaluate((section) => section.scrollIntoView({ behavior: 'instant', block: 'start' }));
      const figure = page.locator(selector);
      await expect(figure.locator('.flag__drawing svg'), stop).toBeInViewport({ ratio: 0.95 });
      await expect(figure.locator('[data-step-text]:visible h4'), stop).toBeInViewport();
      await expect(figure.locator('.flag__stepper').first(), stop).toBeInViewport();
    }
  });

  test('SDG&E states its before and after in figures, with the reading note under the drawing', async ({ page }) => {
    await expect(page.locator('#sdge .station__result')).toContainText('11.7%');
    await expect(page.locator('#sdge .station__result')).toContainText('75.0%');
    const figure = page.locator('[data-desk]');
    const drawing = await figure.locator('.flag__drawing').boundingBox();
    const hint = await figure.locator('.flag__hint').boundingBox();
    expect(hint!.y).toBeGreaterThan(drawing!.y + drawing!.height - 1);
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
    await page.goto('./?theme=day');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

/** Laptop and desktop screens as a browser actually leaves them: a 13-inch MacBook, a 1366×768 laptop, a 1080p monitor. */
const SCREENS = [
  { width: 1440, height: 778 },
  { width: 1280, height: 720 },
  { width: 1920, height: 960 },
] as const;

for (const screen of SCREENS) {
  test.describe(`one machine, one screen at ${screen.width}×${screen.height}`, () => {
    test.use({ viewport: screen });

    test('each machine stop shows its heading, drawing, stations and explanation without scrolling', async ({ page }) => {
      await page.goto('./?theme=day');
      for (const stop of ['chengdu', 'semg', 'sdge']) {
        await page.locator(`#${stop}`).evaluate((section) => section.scrollIntoView({ behavior: 'instant', block: 'start' }));
        const fit = await page.locator(`#${stop}`).evaluate((section) => {
          const bottom = (selector: string) => section.querySelector(selector)!.getBoundingClientRect().bottom;
          const side = section.querySelector<HTMLElement>('.flag__side')!;
          const main = section.querySelector('.flag__main')!;
          const lastInMain = Math.max(...[...main.children].map((child) => child.getBoundingClientRect().bottom));
          return {
            heading: section.querySelector('.station__copy')!.getBoundingClientRect().top,
            mainEnd: lastInMain,
            sideEnd: bottom('.flag__side'),
            sideSpill: side.scrollHeight - side.clientHeight,
            drawingHeight: section.querySelector('.flag__drawing svg')!.getBoundingClientRect().height,
            screen: innerHeight,
          };
        });
        expect(fit.heading, stop).toBeGreaterThanOrEqual(0);
        expect(fit.mainEnd, stop).toBeLessThanOrEqual(fit.screen);
        expect(fit.sideEnd, stop).toBeLessThanOrEqual(fit.screen);
        expect(fit.sideSpill, stop).toBeLessThanOrEqual(0);
        expect(fit.drawingHeight, stop).toBeGreaterThan(140);
      }
    });

    test('the opening, down to its legend and the way in, fits the first screen', async ({ page }) => {
      await page.goto('./?theme=day');
      for (const selector of ['.opening__work', '.opening__actions', '.opening__legend']) {
        const box = await page.locator(selector).boundingBox();
        expect(box!.y + box!.height, selector).toBeLessThanOrEqual(screen.height);
      }
    });
  });
}

test.describe('captions under the drawings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./?theme=day');
  });

  test('the data source and the schedule sit straight under their drawings, small', async ({ page }) => {
    for (const [selector, text] of [['[data-semg]', 'emg2qwerty'], ['[data-report]', 'crontab']] as const) {
      const figure = page.locator(selector);
      const drawing = await figure.locator('.flag__drawing').boundingBox();
      const caption = figure.locator('.flag__figcaption');
      await expect(caption).toContainText(text);
      const box = await caption.boundingBox();
      expect(box!.y - (drawing!.y + drawing!.height), selector).toBeLessThan(24);
      expect(await caption.evaluate((node) => parseFloat(getComputedStyle(node).fontSize))).toBeLessThanOrEqual(13);
    }
  });

  test('SDG&E no longer carries the note about example data', async ({ page }) => {
    await expect(page.locator('[data-desk]')).not.toContainText('示例问题和其中的编号只是示意');
  });
});
