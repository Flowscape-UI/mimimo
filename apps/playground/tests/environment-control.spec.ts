import { test, expect } from '@playwright/test';
test('sandbox switches environments without losing registered states', async ({
  page,
}) => {
  await page.goto('/');
  const pet = page.locator('[data-mimimo]');
  const states = await page.locator('.state-play').allTextContents();
  await page.locator('#environment').selectOption('global');
  await expect(pet).toHaveCSS('clip-path', 'none');
  expect(await page.locator('.state-play').allTextContents()).toEqual(states);
  await page.locator('#environment').selectOption('local');
  await expect(pet).not.toHaveCSS('clip-path', 'none');
  await expect(pet).toHaveCount(1);
});
