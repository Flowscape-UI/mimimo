import { test, expect } from '@playwright/test';

const asset = {
  name: 'own.svg',
  mimeType: 'image/svg+xml',
  buffer: Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><circle cx="16" cy="16" r="14" fill="pink"/></svg>',
  ),
};
test('upload, edit without re-upload, rename, and delete a custom state', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.locator('[data-pet="custom"]').click();
  await expect(page.locator('#state')).toHaveText('-');
  await page.locator('#name').fill('my-pet');
  await page.locator('#files input[type="file"]').setInputFiles(asset);
  await page.getByRole('button', { name: 'Сохранить и запустить' }).click();
  await expect(page.locator('#state')).toHaveText('my-pet');
  await expect
    .poll(() =>
      page
        .locator('[data-mimimo] img')
        .evaluate((img: HTMLImageElement) => img.naturalWidth),
    )
    .toBe(32);
  await page
    .getByRole('button', { name: 'Изменить my-pet', exact: true })
    .click();
  await page.locator('#name').fill('renamed');
  await page.getByRole('button', { name: 'Сохранить и запустить' }).click();
  await expect(page.locator('#states [data-state="my-pet"]')).toHaveCount(0);
  await expect(page.locator('#state')).toHaveText('renamed');
  await expect
    .poll(() =>
      page
        .locator('[data-mimimo] img')
        .evaluate((img: HTMLImageElement) => img.naturalWidth),
    )
    .toBe(32);
  await expect(page.locator('#api-code')).toContainText('addState("renamed"');
  await page
    .getByRole('button', { name: 'Удалить состояние renamed', exact: true })
    .click();
  await expect(page.locator('#states .state-row')).toHaveCount(0);
  await expect(page.locator('[data-mimimo]')).toBeHidden();
  expect(errors).toEqual([]);
});
test('format-specific controls and failed validation preserve the existing pet', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('#type').selectOption('gif');
  await expect(page.locator('#fps')).toBeHidden();
  await expect(page.locator('#speed input')).toBeDisabled();
  await expect(page.locator('#columns')).toBeHidden();
  await expect(page.locator('#poster')).toBeVisible();
  await page.locator('#type').selectOption('sprite');
  await expect(page.locator('#columns')).toBeVisible();
  await page.locator('#files input[type="file"]').setInputFiles(asset);
  await page.locator('#count input').fill('99');
  await page.getByRole('button', { name: 'Сохранить и запустить' }).click();
  await expect(page.locator('#feedback')).toContainText('grid');
  await expect(page.locator('#state')).toHaveText('idle');
  await expect(page.locator('#states .state-row')).toHaveCount(4);
});
test('state survives hide/show and option changes, while events and say remain observable', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('#width input').fill('96');
  await page.locator('#height input').fill('96');
  await page.locator('#draggable').uncheck();
  await page.locator('#apply-pet').click();
  const pet = page
    .locator('[data-mimimo]')
    .getByRole('button', { name: 'Mochi', exact: true });
  await expect(pet).toHaveCSS('width', '96px');
  const rect = await pet.boundingBox();
  if (!rect) throw new Error('Missing pet');
  await page.mouse.move(rect.x + 48, rect.y + 48);
  await page.mouse.down();
  await page.mouse.move(rect.x - 50, rect.y - 30);
  await page.mouse.up();
  expect((await pet.boundingBox())?.x).toBe(rect.x);
  await page.locator('#message').fill('<b>Plain text</b>');
  await page.locator('#say-form').dispatchEvent('submit');
  await expect(page.locator('[data-mimimo] [role="status"]')).toHaveText(
    '<b>Plain text</b>',
  );
  await expect(page.locator('[data-mimimo] .bubble b')).toHaveCount(0);
  await expect(page.locator('#events')).toContainText('say');
  await page.locator('#hide').click();
  await expect(pet).toBeHidden();
  await page.locator('#show').click();
  await expect(pet).toBeVisible();
});
