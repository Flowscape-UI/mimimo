import { test, expect, type Page } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2030-01-01T00:00:00Z') });
  await page.clock.pauseAt(new Date('2030-01-01T00:00:10Z'));
  await page.goto('/media.html');
  await page
    .getByRole('button', { name: 'Применить реакции', exact: true })
    .click();
});
const character = (page: Page) =>
  page.getByRole('button', { name: 'Asset companion', exact: true });
async function center(page: Page) {
  const rect = await character(page).boundingBox();
  if (!rect) throw new Error('Missing companion');
  return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
}

test('hover restores the previous base; replacing and removing reactions applies immediately', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'GIF', exact: true }).click();
  await expect(page.locator('#state')).toHaveText('gif');
  await character(page).hover();
  await expect(page.locator('#state')).toHaveText('curious');
  await page.mouse.move(0, 0);
  await expect(page.locator('#state')).toHaveText('gif');
  await character(page).hover();
  await page.locator('#remove-hover').dispatchEvent('click');
  await expect(page.locator('#state')).toHaveText('gif');
  await page.locator('#reaction-hover').fill('grabbed');
  await page.locator('#reactions-form').dispatchEvent('submit');
  await expect(page.locator('#state')).toHaveText('grabbed');
});

test('click overrides hover and returns to hover after completing', async ({
  page,
}) => {
  await character(page).click();
  await expect(page.locator('#state')).toHaveText('jump');
  await expect(page.locator('#click-count')).toHaveText('1');
  await page.clock.runFor(650);
  await expect(page.locator('#state')).toHaveText('curious');
  await page.mouse.move(0, 0);
  await expect(page.locator('#state')).toHaveText('rest');
});

test('drag starts after the threshold, overrides hover, and suppresses the release click', async ({
  page,
}) => {
  const p = await center(page);
  await page.mouse.move(p.x, p.y);
  await page.mouse.down();
  await page.mouse.move(p.x - 2, p.y);
  await expect(page.locator('#state')).toHaveText('curious');
  await page.mouse.move(p.x - 50, p.y - 30, { steps: 4 });
  await expect(page.locator('#state')).toHaveText('grabbed');
  await page.mouse.up();
  await expect(page.locator('#state')).toHaveText('curious');
  await expect(page.locator('#click-count')).toHaveText('0');
  await page.mouse.move(0, 0);
  await expect(page.locator('#state')).toHaveText('rest');
});

test('focus and keyboard click activate reactions without a pointer', async ({
  page,
}) => {
  await page.mouse.move(0, 0);
  await page.keyboard.press('Tab');
  await character(page).focus();
  await expect(page.locator('#state')).toHaveText('curious');
  await page.keyboard.press('Enter');
  await expect(page.locator('#state')).toHaveText('jump');
  await page.clock.runFor(650);
  await expect(page.locator('#state')).toHaveText('curious');
  await page.keyboard.press('Tab');
  await expect(page.locator('#state')).toHaveText('rest');
});

test('hide cancels an active drag and show does not retain its reaction', async ({
  page,
}) => {
  const p = await center(page);
  await page.mouse.move(p.x, p.y);
  await page.mouse.down();
  await page.mouse.move(p.x - 50, p.y - 20);
  await expect(page.locator('#state')).toHaveText('grabbed');
  await page.locator('#hide').dispatchEvent('click');
  await expect(character(page)).toBeHidden();
  await page.mouse.up();
  await page.mouse.move(0, 0);
  await page.locator('#show').click();
  await expect(page.locator('#state')).toHaveText('rest');
  await expect(page.locator('#click-count')).toHaveText('0');
});

test('missing targets are dormant and clearing reactions restores normal behaviour', async ({
  page,
}) => {
  await page.locator('#reaction-hover').fill('not-yet-added');
  await page.locator('#reactions-form').dispatchEvent('submit');
  await character(page).hover();
  await expect(page.locator('#state')).toHaveText('rest');
  await page.locator('#clear-reactions').dispatchEvent('click');
  await character(page).click();
  await expect(page.locator('#state')).toHaveText('rest');
  await expect(page.locator('#click-count')).toHaveText('1');
});
