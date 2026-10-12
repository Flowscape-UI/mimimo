import { test, expect } from '@playwright/test';

test('Scene Flowy greets, works, celebrates and stays visible', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'A little life',
  );
  const pet = page.locator('[data-mimimo=flowy]');
  await expect(pet).toBeVisible();
  await expect
    .poll(() =>
      pet
        .locator('img')
        .evaluate(
          (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
        ),
    )
    .toBe(true);
  await page.getByRole('button', { name: 'Say hello' }).click();
  await expect(pet.locator('[part=title]')).toHaveText(
    'Hey, human. Nice to meet you!',
  );
  await page.getByRole('button', { name: "Let's create" }).click();
  await expect(pet.locator('img')).toHaveAttribute('src', /flowy-working/);
  await expect(pet.locator('img')).toHaveAttribute('src', /flowy-idle/, {
    timeout: 12000,
  });
  await page.getByRole('button', { name: 'Celebrate' }).click();
  await expect(pet.locator('img')).toHaveAttribute('src', /flowy-happy/);
  await expect(
    pet.getByRole('button', { name: 'Hide companion' }),
  ).toBeHidden();
  await expect(
    page.locator('#world').getByRole('button', { name: 'Hide Flowy' }),
  ).toHaveCount(0);
  await page.getByRole('button', { name: 'Inside a component' }).click();
  await expect(page.locator('#starter-code')).toContainText('container,');
  expect(errors).toEqual([]);
});

test('parallax responds to the pointer and reduced motion disables it', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('#world').hover({ position: { x: 35, y: 60 } });
  const layer = page.locator('[data-depth]').first();
  await expect
    .poll(() => layer.evaluate((node: HTMLElement) => node.style.transform))
    .not.toBe('');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(layer).toHaveCSS('transform', 'none');
});

for (const width of [320, 375, 768]) {
  test(`layout fits ${width}px with reduced motion and keyboard controls`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 812 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.locator('[data-mimimo=flowy]')).toBeVisible();
    const hello = page.getByRole('button', { name: 'Say hello' });
    await hello.focus();
    await page.keyboard.press('Enter');
    await expect(
      page.locator('[data-mimimo=flowy] [part=title]'),
    ).toContainText('Hey, human');
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
  });
}

test('navigation disposes Flowy and local search still opens documentation', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('[data-mimimo]')).toHaveCount(2);
  await page.getByRole('link', { name: 'Documentation', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Meet Mimimo',
  );
  await expect(page.locator('[data-mimimo=flowy]')).toHaveCount(0);
  await expect(page.locator('[data-mimimo=flowy-companion]')).toHaveCount(1);
  await page.getByRole('button', { name: /Search/ }).click();
  await page.locator('#localsearch-input').fill('Environments');
  await expect(page.locator('.VPLocalSearchBox')).toContainText(
    'Local companion',
  );
  await page.locator('#localsearch-input').press('Enter');
  await expect(page).toHaveURL(/guide\/environments/);
  await page.locator('.VPNavBarTitle a').click();
  await expect(page.locator('[data-mimimo]')).toHaveCount(2);
});

test('DSK-style header links, keyboard search and language navigation work', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Main Navigation' });
  await expect(
    nav.getByRole('link', { name: 'Documentation', exact: true }),
  ).toHaveAttribute('href', '/guide/introduction');
  await expect(
    nav.getByRole('link', { name: 'GitHub', exact: true }),
  ).toHaveAttribute('href', 'https://github.com/Flowscape-UI/mimimo');
  await expect(page.locator('.VPNavBarTitle .logo')).toHaveCSS(
    'filter',
    'none',
  );
  await page.keyboard.press('Control+k');
  await expect(page.locator('#localsearch-input')).toBeVisible();
  await page.keyboard.press('Escape');
  await nav.getByRole('link', { name: 'Components', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Components',
  );
  await page.getByRole('button', { name: 'Change language' }).click();
  await page.getByRole('link', { name: 'Русский', exact: true }).click();
  await expect(page).toHaveURL(/\/ru\/components\//);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Компоненты',
  );
  await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
  await page.getByRole('link', { name: 'Документация', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Знакомьтесь: Mimimo',
  );
});

test('page companion drags, reacts and persists across navigation', async ({
  page,
}) => {
  await page.goto('/');
  const companion = page.locator('[data-mimimo=flowy-companion]');
  const scene = page.locator('[data-mimimo=flowy]');
  await expect(companion).toBeVisible();
  await expect(companion.locator('[part=title]')).toHaveText("Hi, I'm Flowy!");
  await expect(page.locator('.site-flowy-controls, #motion')).toHaveCount(0);
  const character = companion.getByRole('button', {
    name: 'Flowy companion',
    exact: true,
  });
  const before = await character.boundingBox();
  if (!before) throw new Error('Missing companion');
  await page.mouse.move(before.x + 70, before.y + 70);
  await page.mouse.down();
  await page.mouse.move(before.x - 110, before.y - 60, { steps: 8 });
  await page.mouse.up();
  const after = await character.boundingBox();
  expect(after!.x).toBeLessThan(before.x - 100);
  await character.click();
  await expect(companion.locator('[part=title]')).toHaveText('Hey, friend!');
  await expect(scene.locator('[part=title]')).toHaveText("Hey, I'm Flowy!");
  await character.focus();
  const x = (await character.boundingBox())!.x;
  await page.keyboard.press('ArrowLeft');
  expect((await character.boundingBox())!.x).toBe(x - 16);
  await expect(
    companion.getByRole('button', { name: 'Hide companion', exact: true }),
  ).toBeHidden();
  await page.getByRole('link', { name: 'Documentation', exact: true }).click();
  await expect(companion).toBeVisible();
  await expect(scene).toHaveCount(0);
});

test('Flowy takes localized work breaks and respects reduced motion', async ({
  page,
}) => {
  await page.clock.install();
  await page.addInitScript(() => {
    Math.random = () => 0;
  });
  await page.goto('/ru/guide/introduction');
  const pet = page.locator('[data-mimimo=flowy-companion]');
  await expect(pet.locator('img')).toBeVisible();
  await expect(pet.locator('[part=title]')).toHaveText('Привет, я Flowy!');
  await page.clock.fastForward(26000);
  await expect(pet.locator('img')).toHaveAttribute('src', /flowy-working/);
  await expect(pet.locator('[part=title]')).toHaveText(
    'Маленькая идея обретает форму.',
  );
  await page.clock.fastForward(9000);
  await expect(pet.locator('img')).toHaveAttribute('src', /flowy-idle/);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.fastForward(60000);
  await expect(pet.locator('img')).toHaveAttribute('src', /flowy-idle/);
});

test('hero types its headline while scene Flowy works, without changing layout', async ({
  page,
}) => {
  await page.clock.install();
  await page.goto('/');
  const home = page.locator('.mimimo-home');
  const heading = page.locator('#hero-title');
  await expect(home).toHaveClass(/hero-entering/);
  const before = await heading.boundingBox();
  await expect(page.locator('[data-mimimo=flowy] img')).toHaveAttribute(
    'src',
    /flowy-working/,
  );
  await page.clock.runFor(3500);
  await expect(home).toHaveClass(/hero-entered/);
  await expect(page.locator('.intro-letter:not(.is-typed)')).toHaveCount(0);
  const after = await heading.boundingBox();
  expect(after?.height).toBe(before?.height);
  await expect(page.locator('[data-mimimo=flowy] img')).toHaveAttribute(
    'src',
    /flowy-idle/,
  );
});

test('gallery loads its background near the viewport and reveals cards in sequence', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 300 });
  const backgrounds: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('cast-worlds-v1'))
      backgrounds.push(request.url());
  });
  await page.goto('/');
  const gallery = page.locator('.cast-gallery');
  await expect(gallery).toHaveClass(/cast-reveal/);
  expect(backgrounds).toHaveLength(0);
  await gallery.evaluate((node) => {
    window.scrollTo(
      0,
      node.getBoundingClientRect().top +
        window.scrollY -
        window.innerHeight +
        60,
    );
  });
  await expect.poll(() => backgrounds.length).toBe(1);
  await expect(gallery).not.toHaveClass(/is-revealed/);
  await expect(page.locator('.cast-panel').first()).toHaveCSS('opacity', '0');
  await gallery.scrollIntoViewIfNeeded();
  await expect(gallery).toHaveClass(/is-revealed/);
  await expect.poll(() => backgrounds.length).toBe(1);
  const cards = page.locator('.cast-panel');
  await expect(cards.nth(1)).toHaveCSS('transition-delay', '0.22s');
  await expect(cards.nth(2)).toHaveCSS('transition-delay', '0.44s');
  await expect(cards.first()).toHaveCSS('opacity', '1');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.closing')).toHaveCSS('opacity', '1');
});

for (const width of [375, 1440]) {
  test(`Russian homepage is localized and fits ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/ru/');
    await expect(page.locator('#hero-title')).toContainText('Немного жизни.');
    await expect(page.locator('.site-footer')).toContainText(
      'Проект команды Flowscape',
    );
    await expect(page.locator('.footer-column a').first()).toHaveAttribute(
      'href',
      '/ru/guide/introduction',
    );
    await expect(page.locator('[data-mimimo=flowy] [part=title]')).toHaveText(
      'Привет, я Flowy!',
    );
    await page.locator('#work').click();
    await expect(page.locator('[data-mimimo=flowy] [part=title]')).toHaveText(
      'Круг, квадрат… идея!',
    );
    await expect(page.locator('#starter-code')).toContainText(
      "pet.say('Рад знакомству!')",
    );
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
    await page.locator('.footer-column a[href*="#спутник"]').click();
    await expect(page.locator('h2#спутник')).toBeVisible();
  });
}
