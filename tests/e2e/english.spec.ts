import { expect, test, type Page } from '@playwright/test';

const ALLOWED_CJK = ['褚开诚', '中文', '中', '杭'];

async function goTo(page: Page, stop: string): Promise<void> {
  await page.locator(`#${stop}`).evaluate((section) => section.scrollIntoView({ behavior: 'instant', block: 'start' }));
  await expect(page.locator('.journey')).toHaveAttribute('data-active', stop);
}

test.describe('the English page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./en/?theme=day');
  });

  test('is marked as American English and named for the English reader', async ({ page }) => {
    await expect(page.locator('html')).toHaveAttribute('lang', 'en-US');
    await expect(page).toHaveTitle(/Kaicheng Chu/);
    await expect(page.locator('.opening h1')).toHaveText(/Define what right looks like\s*then build it/);
    await expect(page.locator('link[rel=alternate][hreflang=zh-CN]')).toHaveAttribute('href', 'https://ckc-kai.github.io/MyWebsite/');
  });

  test('shows no Chinese beyond the name, the link back and the seal on the sketches', async ({ page }) => {
    const found = await page.evaluate(() => {
      const text = `${document.body.innerText} ${[...document.querySelectorAll('[alt],[aria-label]')].map((node) => node.getAttribute('alt') ?? node.getAttribute('aria-label')).join(' ')}`;
      return [...new Set(text.match(/[　-鿿＀-￯]+/g) ?? [])];
    });
    expect(found.filter((text) => !ALLOWED_CJK.includes(text))).toEqual([]);
  });

  test('writes its handwritten lines in a Latin hand', async ({ page }) => {
    const family = await page.locator('.opening__deck').evaluate((deck) => getComputedStyle(deck).fontFamily);
    expect(family).toMatch(/^Caveat/);
  });

  test('switching language keeps your place', async ({ page }) => {
    await goTo(page, 'semg');
    await page.locator('[data-lang-switch]').click();
    await expect(page).toHaveURL(/\/#semg$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
    await expect(page.locator('#semg h2')).toContainText('靠手腕的肌电信号打字');
    await expect(page.locator('.journey')).toHaveAttribute('data-active', 'semg');

    await page.locator('[data-lang-switch]').click();
    await expect(page).toHaveURL(/\/en\/#semg$/);
    await expect(page.locator('#semg h2')).toContainText('Typing with muscle signals');
  });

  test('the band caption counts its notches in English', async ({ page }) => {
    const figure = page.locator('[data-semg]');
    await figure.locator('[data-step="2"]').click();
    await figure.getByRole('button', { name: 'One notch right' }).click();
    await expect(figure.locator('[data-caption]')).toContainText('moved 1 notch,');
    await figure.getByRole('button', { name: 'One notch right' }).click();
    await expect(figure.locator('[data-caption]')).toContainText('moved 2 notches,');
  });

  test('El Paso hangs its prints on the map in English too', async ({ page }) => {
    await goTo(page, 'el-paso');
    const board = page.locator('[data-prints-for="el-paso"]');
    await expect(board).toHaveAttribute('data-shown', '');
    await expect(board.locator('figcaption')).toHaveText(['Tennis team', 'In El Paso']);
  });

  test('nothing spills sideways on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('./en/?theme=day');
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  });
});

test('the Chinese page links to the English one', async ({ page }) => {
  await page.goto('./?theme=day');
  await expect(page.locator('[data-lang-switch]')).toHaveAttribute('href', '/MyWebsite/en/');
  await expect(page.locator('[data-lang-switch]')).toHaveAttribute('hreflang', 'en-US');
});

for (const screen of [{ width: 1440, height: 778 }, { width: 1280, height: 720 }, { width: 1920, height: 960 }] as const) {
  test.describe(`English, one machine per screen at ${screen.width}×${screen.height}`, () => {
    test.use({ viewport: screen });

    test('each machine stop fits, explanation and all', async ({ page }) => {
      await page.goto('./en/?theme=day');
      for (const stop of ['chengdu', 'semg', 'sdge']) {
        await page.locator(`#${stop}`).evaluate((section) => section.scrollIntoView({ behavior: 'instant', block: 'start' }));
        const fit = await page.locator(`#${stop}`).evaluate(async (section) => {
          const side = section.querySelector<HTMLElement>('.flag__side')!;
          const main = section.querySelector('.flag__main')!;
          let spill = 0;
          for (const button of section.querySelectorAll<HTMLButtonElement>('.flag__stepper button')) {
            button.click();
            await new Promise((resolve) => setTimeout(resolve, 20));
            spill = Math.max(spill, side.scrollHeight - side.clientHeight);
          }
          return {
            mainEnd: Math.max(...[...main.children].map((child) => child.getBoundingClientRect().bottom)),
            sideEnd: side.getBoundingClientRect().bottom,
            spill,
            screen: innerHeight,
          };
        });
        expect(fit.mainEnd, stop).toBeLessThanOrEqual(fit.screen);
        expect(fit.sideEnd, stop).toBeLessThanOrEqual(fit.screen);
        expect(fit.spill, stop).toBeLessThanOrEqual(0);
      }
    });

    test('the opening fits the first screen', async ({ page }) => {
      await page.goto('./en/?theme=day');
      for (const selector of ['.opening__work', '.opening__actions', '.opening__legend']) {
        const box = await page.locator(selector).boundingBox();
        expect(box!.y + box!.height, selector).toBeLessThanOrEqual(screen.height);
      }
    });
  });
}
