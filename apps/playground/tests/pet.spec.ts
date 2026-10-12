import { test, expect } from '@playwright/test';
test('renders both independent pets and cleans up on replacement', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('[data-mimimo]')).toHaveCount(1);
  await expect(
    page
      .locator('[data-mimimo]')
      .getByRole('button', { name: 'Mochi', exact: true }),
  ).toBeVisible();
  expect(
    await page
      .locator('[data-mimimo] img')
      .evaluate(
        (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
      ),
  ).toBe(true);
  await page.locator('[data-pet="byte"]').click();
  await expect(page.locator('[data-mimimo="byte"]')).toHaveCount(1);
  await expect(page.locator('[data-mimimo="mochi"]')).toHaveCount(0);
  await page
    .getByRole('button', { name: 'Удалить экземпляр', exact: true })
    .click();
  await expect(page.locator('[data-mimimo]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Показать' }).click();
  await expect(page.locator('[data-mimimo="byte"]')).toBeVisible();
  expect(errors).toEqual([]);
});
test('chat renders untrusted replies as text and supports hide/show', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('#chat').check();
  await page.locator('#custom-panel').uncheck();
  await page.locator('#apply-pet').click();
  await page
    .getByRole('textbox', { name: 'Message to companion' })
    .fill('<img src=x onerror=alert(1)>');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.locator('[data-mimimo] [role="status"]')).toContainText(
    '<img src=x onerror=alert(1)>',
  );
  await expect(page.locator('[data-mimimo] .bubble img')).toHaveCount(0);
  await page.getByRole('button', { name: 'Hide companion' }).click();
  await expect(page.locator('[data-mimimo]')).toBeHidden();
  await page.getByRole('button', { name: 'Показать' }).click();
  await expect(page.locator('[data-mimimo]')).toBeVisible();
});
test('dragging moves the companion without triggering a click', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('#message').fill('Drag test');
  await page.locator('#say-form').dispatchEvent('submit');
  const pet = page
    .locator('[data-mimimo]')
    .getByRole('button', { name: 'Mochi', exact: true });
  const box = await pet.boundingBox();
  if (!box) throw new Error('Missing character');
  await page.mouse.move(box.x + 64, box.y + 64);
  await page.mouse.down();
  await page.mouse.move(box.x - 120, box.y - 90, { steps: 8 });
  await page.mouse.up();
  const moved = await pet.boundingBox();
  expect(moved?.x).toBeLessThan(box.x - 100);
  await expect(page.locator('[data-mimimo] [role="status"]')).toHaveText(
    'Drag test',
  );
});
test('reduced motion freezes frames and keyboard activation works', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const frame = await page.locator('[data-mimimo] img').getAttribute('src');
  await page.waitForTimeout(1100);
  expect(await page.locator('[data-mimimo] img').getAttribute('src')).toBe(
    frame,
  );
  await page
    .locator('[data-mimimo]')
    .getByRole('button', { name: 'Mochi', exact: true })
    .focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#click-count')).toHaveText('1');
});
test('fits a narrow mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 740 });
  await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    375,
  );
  await expect(
    page
      .locator('[data-mimimo]')
      .getByRole('button', { name: 'Mochi', exact: true }),
  ).toBeInViewport();
});
