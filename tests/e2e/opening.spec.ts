import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const PUNCTUATION = /[，。,.、；;！!？?]/;
const STOP_IDS = ['hangzhou', 'el-paso', 'miller', 'uva', 'shaoxing', 'chengdu', 'ucla', 'semg', 'sdge', 'next'];

/** Screen x of a station label, which rides on the globe and so reveals its rotation. */
const labelX = (page: Page, id: string): Promise<number> =>
  page.evaluate((station) => {
    const transform = document.querySelector<HTMLElement>(`[data-station=${station}]`)?.style.transform ?? '';
    return Number(/translate\(([-\d.]+)px/.exec(transform)?.[1]);
  }, id);

const globe = (page: Page): Promise<{ cx: number; cy: number }> =>
  page.evaluate(() => {
    const box = document.querySelector('[data-globe-anchor]')!.getBoundingClientRect();
    return { cx: box.left + box.width / 2, cy: box.top + box.height / 2 };
  });

/** Waits until a station has been turned to the middle of the globe and the turn has ended. */
async function docked(page: Page, station: string): Promise<number> {
  const { cx } = await globe(page);
  await expect.poll(async () => Math.abs((await labelX(page, station)) - cx), { timeout: 8000 }).toBeLessThan(1.5);
  return cx;
}

async function departForHangzhou(page: Page): Promise<number> {
  await page.getByRole('link', { name: '从杭州出发' }).click();
  return docked(page, 'HZ');
}

test.beforeEach(async ({ page }) => {
  await page.goto('/?theme=day');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test.describe('the globe', () => {
  test('turns on its own, surface moving left to right', async ({ page }) => {
    const before = await labelX(page, 'HZ');
    await page.waitForTimeout(2000);
    expect(await labelX(page, 'HZ')).toBeGreaterThan(before + 5);
  });

  test('dragging takes over, the grabbed spot stays under the pointer, and the globe waits while held', async ({ page }) => {
    await departForHangzhou(page);
    const DRAG_PX = 140;
    const hangzhou = await page.evaluate(() => {
      const transform = document.querySelector<HTMLElement>('[data-station=HZ]')!.style.transform;
      const [, x, y] = /translate\(([-\d.]+)px, ([-\d.]+)px/.exec(transform)!;
      return { x: Number(x), y: Number(y) };
    });

    // Grab Hangzhou itself and pull it right: it should stay under the pointer.
    await page.mouse.move(hangzhou.x, hangzhou.y);
    await page.mouse.down();
    await page.mouse.move(hangzhou.x + DRAG_PX, hangzhou.y, { steps: 12 });
    const dragged = await labelX(page, 'HZ');
    expect(Math.abs(dragged - (hangzhou.x + DRAG_PX))).toBeLessThan(2);

    await page.waitForTimeout(700);
    expect(await labelX(page, 'HZ')).toBeCloseTo(dragged, 0);
    await page.mouse.up();
  });

  test('after release it glides, stops, then hands back to auto rotation', async ({ page }) => {
    // Drag towards the centre, so Hangzhou stays on the near side throughout
    // and its screen position keeps rising with the rotation.
    const { cx, cy } = await globe(page);
    await page.mouse.move(cx - 100, cy + 120);
    await page.mouse.down();
    await page.mouse.move(cx + 40, cy + 120, { steps: 5 });
    const released = await labelX(page, 'HZ');
    await page.mouse.up();

    await page.waitForTimeout(250);
    const gliding = await labelX(page, 'HZ');
    expect(gliding).toBeGreaterThan(released + 2);

    await page.waitForTimeout(1600);
    const stopped = await labelX(page, 'HZ');
    await page.waitForTimeout(500);
    expect(await labelX(page, 'HZ')).toBeCloseTo(stopped, 0);

    await page.waitForTimeout(4000);
    expect(await labelX(page, 'HZ')).toBeGreaterThan(stopped + 5);
  });

  test('arrow keys turn it when it has focus', async ({ page }) => {
    await departForHangzhou(page);
    const before = await labelX(page, 'HZ');

    await page.locator('canvas').focus();
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(900);
    expect(await labelX(page, 'HZ')).toBeGreaterThan(before + 20);
  });

  test('dragging across the copy does not turn it', async ({ page }) => {
    await departForHangzhou(page);
    const before = await labelX(page, 'HZ');

    const title = await page.locator('#hangzhou h2').boundingBox();
    await page.mouse.move(title!.x + 20, title!.y + 20);
    await page.mouse.down();
    await page.mouse.move(title!.x + 160, title!.y + 20, { steps: 6 });
    await page.mouse.up();
    expect(await labelX(page, 'HZ')).toBeCloseTo(before, 0);
  });

  test('reduced motion turns auto rotation off and docks without a flight', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto('/?theme=day');
    const before = await labelX(page, 'HZ');
    await page.waitForTimeout(1500);
    expect(await labelX(page, 'HZ')).toBeCloseTo(before, 0);

    await page.getByRole('navigation', { name: '站点' }).getByRole('link', { name: 'UVA' }).click();
    const { cx } = await globe(page);
    await expect.poll(async () => Math.abs((await labelX(page, 'VA')) - cx), { timeout: 1500 }).toBeLessThan(1.5);
    await context.close();
  });
});

test.describe('the journey', () => {
  test('the depart link scrolls to Hangzhou, turns the globe there and holds it', async ({ page }) => {
    await departForHangzhou(page);
    await expect(page.locator('.journey')).toHaveAttribute('data-active', 'hangzhou');

    const arrived = await labelX(page, 'HZ');
    await page.waitForTimeout(800);
    expect(await labelX(page, 'HZ')).toBeCloseTo(arrived, 0);
  });

  test('the rail jumps to a stop, docks the globe on it and marks where you are', async ({ page }) => {
    const rail = page.getByRole('navigation', { name: '站点' });
    await rail.getByRole('link', { name: 'UVA' }).click();

    await docked(page, 'VA');
    await expect(page.locator('.journey')).toHaveAttribute('data-active', 'uva');
    await expect(rail.getByRole('link', { name: 'UVA' })).toHaveAttribute('aria-current', 'true');
    await expect(rail.getByRole('link', { name: '杭州' })).not.toHaveAttribute('aria-current', 'true');
    await expect(rail.getByRole('link', { name: '待续' })).toBeVisible();
    await expect(rail).not.toContainText('下一站');
    await expect(page.locator('#uva h2')).toBeInViewport();
  });

  test('every stop becomes current on the way down, with no errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });

    for (const id of STOP_IDS) {
      await page.locator(`#${id}`).evaluate((section) => section.scrollIntoView({ behavior: 'instant', block: 'start' }));
      await expect(page.locator('.journey')).toHaveAttribute('data-active', id);
    }
    expect(errors).toEqual([]);
  });

  test('stop titles carry no punctuation', async ({ page }) => {
    const titles = await page.locator('.station h2').allInnerTexts();
    expect(titles).toHaveLength(STOP_IDS.length);
    for (const title of titles) expect(title, title).not.toMatch(PUNCTUATION);
  });

  test('highlights come in more than one colour', async ({ page }) => {
    const colours = await page
      .locator('.station__lead b')
      .evaluateAll((marks) => [...new Set(marks.map((mark) => getComputedStyle(mark).backgroundImage))]);
    expect(colours.length).toBeGreaterThanOrEqual(3);
    const [first, second] = await page
      .locator('#uva .school__honors b')
      .evaluateAll((marks) => marks.map((mark) => getComputedStyle(mark).backgroundImage));
    expect(first).not.toBe(second);
  });

  test('the motto sits small at the foot of the screen, centred, on every stop', async ({ page }) => {
    const motto = page.getByText('Sapere aude').locator('..');
    await expect(motto).toContainText('谋定后动，造极登峰');
    const box = await motto.boundingBox();
    expect(Math.abs(box!.x + box!.width / 2 - 720)).toBeLessThan(4);
    expect(box!.height).toBeLessThan(22);

    await page.locator('#sdge').evaluate((section) => section.scrollIntoView({ behavior: 'instant' }));
    await expect(motto).toBeInViewport();
  });

  test('on a phone the globe is a band under the header and the rail follows along', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/?theme=day');
    const stage = page.locator('.journey__stage');
    await expect(stage).toHaveCSS('position', 'sticky');

    await page.locator('#sdge').evaluate((section) => section.scrollIntoView({ behavior: 'instant' }));
    await expect(page.locator('.journey')).toHaveAttribute('data-active', 'sdge');
    await expect(stage).toBeInViewport();
    await expect(page.getByRole('navigation', { name: '站点' }).getByRole('link', { name: 'SDG&E' })).toBeInViewport();
  });
});

test.describe('the opening', () => {
  test('the headline carries no punctuation', async ({ page }) => {
    expect(await page.getByRole('heading', { level: 1 }).innerText()).not.toMatch(PUNCTUATION);
  });

  test('both halves of the headline are highlighted, each in its own colour, and the second line steps in', async ({ page }) => {
    const marks = page.locator('.opening h1 mark');
    await expect(marks).toHaveText(['做对了', '做出来']);
    const [first, second] = await marks.evaluateAll((elements) => elements.map((element) => getComputedStyle(element).backgroundImage));
    expect(first).not.toBe(second);

    const firstLine = await page.locator('.opening h1').boundingBox();
    const secondLine = await page.locator('.opening__then').evaluate((element) => {
      const range = document.createRange();
      range.selectNodeContents(element);
      return range.getClientRects()[0].left + parseFloat(getComputedStyle(element).paddingLeft);
    });
    expect(secondLine).toBeGreaterThan(firstLine!.x + 20);
  });

  test('says AI-related work, without narrowing it to one job title', async ({ page }) => {
    const deck = await page.locator('.opening__deck').innerText();
    expect(deck).toContain('AI相关的工作');
    expect(deck).not.toContain('产品经理');
  });

  test('lists recent work in words, without metric figures, each linking to its stop', async ({ page }) => {
    const work = page.getByRole('region', { name: '最近经历' });
    await expect(work.getByRole('listitem')).toHaveCount(3);
    expect(await work.innerText()).not.toMatch(/\d+(\.\d+)?\s*%/);

    await work.getByRole('link', { name: '有据可查的监管问答' }).click();
    await expect(page.locator('.journey')).toHaveAttribute('data-active', 'sdge');
  });

  test('the childhood photo stands on Hangzhou, in colour, and turns with the globe', async ({ page }) => {
    const kid = page.locator('[data-globe-pin=HZ]');
    const photo = kid.getByRole('img');
    await expect(photo).toBeVisible();
    await expect(kid).toHaveCSS('opacity', '1');
    expect(await photo.evaluate((image) => getComputedStyle(image).filter)).toBe('none');

    const pinX = (): Promise<number> =>
      kid.evaluate((element) => Number(/translate\(([-\d.]+)px/.exec((element as HTMLElement).style.transform)?.[1]));
    const before = await pinX();
    expect(Math.abs(before - (await labelX(page, 'HZ')))).toBeLessThan(1);
    await page.waitForTimeout(2000);
    expect(await pinX()).toBeGreaterThan(before + 5);

    expect((await photo.boundingBox())!.height).toBeLessThan(180);
  });

  test('the photo leaves the map once the story moves on from Hangzhou', async ({ page }) => {
    await page.locator('#el-paso').evaluate((section) => section.scrollIntoView({ behavior: 'instant' }));
    await expect(page.locator('.journey')).toHaveAttribute('data-active', 'el-paso');
    await expect(page.locator('[data-globe-pin=HZ]')).toBeHidden();
  });

  test('nothing in the copy sits on top of the photo at first paint', async ({ page }) => {
    const photo = await page.locator('[data-globe-pin=HZ] img').boundingBox();
    for (const selector of ['.opening h1', '.opening__deck', '.opening__work', '.opening__actions']) {
      const box = await page.locator(selector).boundingBox();
      const overlaps =
        photo!.x < box!.x + box!.width && photo!.x + photo!.width > box!.x &&
        photo!.y < box!.y + box!.height && photo!.y + photo!.height > box!.y;
      expect(overlaps, selector).toBe(false);
    }
  });
});

test.describe('day and night', () => {
  test('the switch changes the theme and shows which is on', async ({ page }) => {
    const night = page.getByRole('button', { name: '夜航' });
    await night.click();

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'night');
    await expect(night).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: '白天' })).toHaveAttribute('aria-pressed', 'false');
  });

  test('the theme follows the visitor’s clock when nothing else is set', async ({ browser }) => {
    for (const [hour, theme] of [[10, 'day'], [22, 'night']] as const) {
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.clock.setFixedTime(new Date(2026, 10, 12, hour, 0, 0));
      await page.goto('/');
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await context.close();
    }
  });
});

for (const width of [320, 375, 768, 1024, 1440, 1920]) {
  test(`no horizontal overflow and a two-line headline at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/?theme=day');

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);

    const lines = await page.getByRole('heading', { level: 1 }).evaluate((heading) => {
      const lineHeight = parseFloat(getComputedStyle(heading).lineHeight);
      return Math.round(heading.getBoundingClientRect().height / lineHeight);
    });
    expect(lines).toBe(2);
  });
}

test.describe('the stops', () => {
  const goTo = async (page: Page, id: string): Promise<void> => {
    await page.locator(`#${id}`).evaluate((section) => section.scrollIntoView({ behavior: 'instant', block: 'start' }));
    await expect(page.locator('.journey')).toHaveAttribute('data-active', id);
  };

  test('El Paso spells out the league and shows both photographs', async ({ page }) => {
    await goTo(page, 'el-paso');
    const stop = page.locator('#el-paso');
    await expect(stop).toContainText('University Interscholastic League');
    await expect(stop).not.toContainText('三个第一次');
    await expect(stop.getByRole('img')).toHaveCount(2);
  });

  test('UVA highlights the two honours and lists the courses', async ({ page }) => {
    await goTo(page, 'uva');
    await expect(page.locator('#uva .school__honors b')).toHaveText(['Dean’s List', 'Highest Distinction']);
    await expect(page.locator('#uva .school__courses')).toContainText('计算机视觉');
    await expect(page.locator('#uva .paper')).toContainText('Project-Based Learning: Chimera or Hestia');
    await expect(page.locator('#uva .paper')).toContainText('571 名本科生');
    await expect(page.locator('#uva .paper')).not.toContainText('草稿');
    await expect(page.locator('#uva .passages h3')).toHaveText([
      'E-Commerce Customer Analytics',
      'Real-time Emotion Recognition',
      'Charlottesville Travel Planner',
    ]);
    await expect(page.locator('#uva')).not.toContainText('课上做的三样东西');
  });

  test('at night a paper is a dark sheet, not a lit page', async ({ page }) => {
    await page.goto('/?theme=night');
    const [red, green, blue] = await page.locator('#miller .paper').evaluate((sheet) => {
      const match = /rgb\((\d+), (\d+), (\d+)/.exec(getComputedStyle(sheet).backgroundColor);
      return match ? match.slice(1).map(Number) : [255, 255, 255];
    });
    expect(Math.max(red, green, blue)).toBeLessThan(80);
  });

  test('no stop quotes a GPA', async ({ page }) => {
    await expect(page.locator('.journey')).not.toContainText('GPA');
  });

  test('Miller shows the paper under its real title, with its two findings plotted', async ({ page }) => {
    await goTo(page, 'miller');
    await expect(page.locator('#miller')).not.toContainText('第一次');
    // The paper lies under the copy, in the left column, clear of the place on the globe.
    const sheet = await page.locator('#miller .paper').boundingBox();
    const { cx } = await globe(page);
    expect(sheet!.x + sheet!.width).toBeLessThan(cx - 40);
    const paper = page.locator('#miller .paper');
    await expect(paper).toContainText('Negative effect of breakfast skipping');
    await expect(paper).toContainText('Findings among adolescents of the United States');
    await expect(paper.locator('.paper__point')).toHaveCount(2);
    await expect(paper).toContainText('1.35');
    await expect(paper).toContainText('1.44');
  });

  test('UCLA shows the award and the courses', async ({ page }) => {
    await goTo(page, 'ucla');
    await expect(page.locator('#ucla .school__honors b')).toHaveText('院系奖学金');
    await expect(page.locator('#ucla .school__courses')).toContainText('深度学习');
  });

  test('the three jobs carry their titles', async ({ page }) => {
    await expect(page.locator('#chengdu .station__when')).toContainText('AI Data 工程师实习');
    await expect(page.locator('#sdge .station__when')).toContainText('AI Engineer 实习');
    await expect(page.locator('#chengdu .station__result')).toContainText('54%');
    await expect(page.locator('#chengdu .station__result')).toContainText('72%');
  });

  test('the last stop ends with a small contact block of drawn marks', async ({ page }) => {
    await goTo(page, 'next');
    const contact = page.getByRole('complementary', { name: '找我' });
    await expect(contact.getByRole('listitem')).toHaveCount(4);
    await expect(contact.getByRole('link', { name: /163/ })).toHaveAttribute('href', 'mailto:chu_kaicheng915@163.com');
    await expect(contact.getByRole('link', { name: /Gmail/ })).toHaveAttribute('href', 'mailto:chukaicheng1@gmail.com');
    await expect(contact.getByRole('link', { name: /LinkedIn/ })).toHaveAttribute('href', /linkedin\.com/);
    await expect(contact.getByRole('link', { name: /Instagram/ })).toHaveAttribute('href', 'https://www.instagram.com/ckaic_kkkkk/');
  });

  test('the last stop has the four pastimes', async ({ page }) => {
    await goTo(page, 'next');
    for (const pastime of ['网球', '健身', '阅读', '拍摄']) {
      await expect(page.locator('#next .station__hobbies')).toContainText(pastime);
    }
  });
});
