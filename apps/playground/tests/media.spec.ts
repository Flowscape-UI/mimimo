import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/media.html');
});
test('characterless creation, custom fallback and sprite row-major cropping', async ({
  page,
}) => {
  // Advance exact frame boundaries instead of polling a short real-time interval.
  await page.clock.install({ time: new Date('2030-01-01T00:00:00Z') });
  await page.clock.pauseAt(new Date('2030-01-01T00:00:10Z'));
  await page.goto('/media.html');
  await expect(page.locator('#state')).toHaveText('rest');
  await page.getByRole('button', { name: 'Sprite sheet', exact: true }).click();
  await expect(page.locator('#state')).toHaveText('sheet');
  const image = page.locator('[data-mimimo] img');
  await expect(image).toHaveCSS('transform', 'matrix(1, 0, 0, 1, -128, 0)');
  await expect(image).toHaveCSS('width', '256px');
  await page.clock.runFor(300);
  await expect(image).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, -128)');
  await page.clock.runFor(600);
  await expect(page.locator('#state')).toHaveText('rest');
  await page
    .getByRole('button', { name: 'Проверить fallback', exact: true })
    .click();
  await expect(page.locator('#state')).toHaveText('rest');
});
test('frame sequences complete and return to the custom default', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Frames', exact: true }).click();
  await expect(page.locator('#state')).toHaveText('jump');
  await expect(page.locator('#state')).toHaveText('rest');
});
test('GIF loads and uses a static poster during reduced motion', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'GIF', exact: true }).click();
  const image = page.locator('[data-mimimo] img');
  await expect(image).toHaveAttribute('src', '/sample.gif');
  await expect
    .poll(() =>
      image.evaluate(
        (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
      ),
    )
    .toBe(true);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(image).toHaveAttribute('src', /^data:image\/svg/);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(image).toHaveAttribute('src', '/sample.gif');
});
test('real video decodes, respects speed and pauses on hide and reduced motion', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Video', exact: true }).click();
  const video = page.locator('[data-mimimo] video');
  await expect(video).toBeVisible();
  await expect
    .poll(() => video.evaluate((el: HTMLVideoElement) => el.readyState))
    .toBeGreaterThanOrEqual(2);
  await expect
    .poll(() => video.evaluate((el: HTMLVideoElement) => el.currentTime))
    .toBeGreaterThan(0);
  expect(
    await video.evaluate((el: HTMLVideoElement) => [
      el.muted,
      el.loop,
      el.playbackRate,
    ]),
  ).toEqual([true, true, 1.5]);
  await page.getByRole('button', { name: 'Скрыть', exact: true }).click();
  expect(await video.evaluate((el: HTMLVideoElement) => el.paused)).toBe(true);
  await page.getByRole('button', { name: 'Показать', exact: true }).click();
  await expect
    .poll(() => video.evaluate((el: HTMLVideoElement) => el.paused))
    .toBe(false);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await video.evaluate((el: HTMLVideoElement) => el.paused)).toBe(true);
  await page.getByRole('button', { name: 'Frames', exact: true }).click();
  await expect(video).toHaveCount(0);
  await page
    .getByRole('button', { name: 'Удалить экземпляр', exact: true })
    .click();
  await expect(page.locator('[data-mimimo]')).toHaveCount(0);
});
test('addState replaces custom states and reports invalid media', async ({
  page,
}) => {
  await page.locator('#name').fill('__proto__');
  await page.locator('#type').selectOption('image');
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" fill="red"/></svg>';
  await page.locator('#files input[type="file"]').setInputFiles({
    name: 'red.svg',
    mimeType: 'image/svg+xml',
    buffer: Buffer.from(svg),
  });
  await page.getByRole('button', { name: 'Сохранить и запустить' }).click();
  await expect(page.locator('#state')).toHaveText('__proto__');
  const image = page.locator('[data-mimimo] img');
  await expect
    .poll(() => image.evaluate((el: HTMLImageElement) => el.naturalWidth))
    .toBe(10);
  const first = await image.getAttribute('src');
  await page.locator('#files input[type="file"]').setInputFiles({
    name: 'blue.svg',
    mimeType: 'image/svg+xml',
    buffer: Buffer.from(svg.replace('red', 'blue')),
  });
  await page.getByRole('button', { name: 'Сохранить и запустить' }).click();
  await expect.poll(() => image.getAttribute('src')).not.toBe(first);
  await page.locator('#files input[type="file"]').setInputFiles({
    name: 'broken.png',
    mimeType: 'image/png',
    buffer: Buffer.from('invalid'),
  });
  await page.getByRole('button', { name: 'Сохранить и запустить' }).click();
  await expect(page.locator('#feedback')).toHaveText(
    'Could not load or play the state media.',
  );
});

test('non-looping uploaded video returns to the initial state', async ({
  page,
  request,
}) => {
  const response = await request.get('/sample.webm');
  expect(response.ok()).toBe(true);
  await page.locator('#name').fill('one-shot');
  await page.locator('#type').selectOption('video');
  await page.locator('#speed input').fill('0.5');
  await page.locator('#loop').uncheck();
  await page.locator('#files input[type="file"]').setInputFiles({
    name: 'sample.webm',
    mimeType: 'video/webm',
    buffer: await response.body(),
  });
  await page.getByRole('button', { name: 'Сохранить и запустить' }).click();
  await expect(page.locator('#state')).toHaveText('one-shot');
  await expect(page.locator('#state')).toHaveText('rest');
  await expect(page.locator('[data-mimimo] video')).toHaveCount(0);
});
