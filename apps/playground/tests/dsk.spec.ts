import { test, expect } from '@playwright/test';

const image = {
  name: 'frame.svg',
  mimeType: 'image/svg+xml',
  buffer: Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><rect width="20" height="20" fill="pink"/></svg>',
  ),
};

test('DSK numeric expressions update pet dimensions and editor reset restores defaults', async ({
  page,
}) => {
  await page.goto('/');
  const width = page.getByRole('spinbutton', { name: 'Ширина', exact: true });
  await width.fill('64 * 2');
  await width.press('Tab');
  await expect(width).toHaveValue('128');
  await width.press('ArrowRight');
  await page.locator('#apply-pet').click();
  await expect(
    page
      .locator('[data-mimimo]')
      .getByRole('button', { name: 'Mochi', exact: true }),
  ).toHaveCSS('width', '129px');
  await page.locator('#type').selectOption('sprite');
  await page.locator('#fps input').fill('12');
  await page.locator('#speed input').fill('2');
  await page.locator('#columns input').fill('3');
  await page.locator('#new-state').click();
  await page.locator('#type').selectOption('sprite');
  await expect(page.locator('#fps input')).toHaveValue('8');
  await expect(page.locator('#speed input')).toHaveValue('1');
  await expect(page.locator('#columns input')).toHaveValue('2');
});

test('DSK upload previews, rejects incompatible files, clears, and keeps multi-frame uploads available', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('[data-pet="custom"]').click();
  const picker = page.locator('#files input[type="file"]');
  await picker.setInputFiles({
    name: 'text.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('not an image'),
  });
  await expect(page.locator('#feedback')).toContainText('не подходит');
  await picker.setInputFiles(image);
  await expect(page.locator('#files [part="filename"]')).toHaveText(
    'frame.svg',
  );
  await expect
    .poll(() =>
      page
        .locator('#files img')
        .evaluate((img: HTMLImageElement) => img.naturalWidth),
    )
    .toBe(20);
  await page
    .locator('#files')
    .getByRole('button', { name: 'Remove file' })
    .click();
  await page.getByRole('button', { name: 'Сохранить и запустить' }).click();
  await expect(page.locator('#feedback')).toHaveText('Сначала выберите файл.');
  await page.locator('#type').selectOption('frames');
  await expect(page.locator('#files')).toBeHidden();
  await page
    .locator('#frame-files')
    .setInputFiles([image, { ...image, name: 'frame-2.svg' }]);
  await page.locator('#name').fill('sequence');
  await page.getByRole('button', { name: 'Сохранить и запустить' }).click();
  await expect(page.locator('#state')).toHaveText('sequence');
  await expect(page.locator('#api-code')).toContainText('/assets/frame.svg');
  await expect(page.locator('#api-code')).toContainText('/assets/frame-2.svg');
  await page.locator('#new-state').click();
  await expect(page.locator('#files [part="filename"]')).toHaveText(
    'Выбрать файл',
  );
  await expect(page.locator('#frame-files')).toHaveValue('');
});
