import { test, expect } from '@playwright/test';

test('disabled thoughts retain safe structured messages; dismissal does not hide the pet', async ({
  page,
}) => {
  await page.goto('/');
  const bubble = page.locator('[data-mimimo] [part="bubble"]');
  await page.locator('#bubble-enabled').uncheck();
  await page.locator('#message').fill('<b>Thought</b>');
  await page.locator('#description').fill('Working on your task');
  await page.locator('#say-form').dispatchEvent('submit');
  await expect(bubble).toBeHidden();
  await page.locator('#bubble-enabled').check();
  await expect(bubble).toBeVisible();
  await expect(bubble.locator('[part="title"]')).toHaveText('<b>Thought</b>');
  await expect(bubble.locator('b')).toHaveCount(0);
  await expect(bubble.locator('[part="description"]')).toHaveText(
    'Working on your task',
  );
  await page.locator('#dismiss-bubble').click();
  await expect(bubble).toBeHidden();
  await expect(page.locator('[data-mimimo] .character')).toBeVisible();
  await page.locator('#bubble-enabled').uncheck();
  await page.locator('#bubble-enabled').check();
  await expect(bubble).toBeHidden();
  await page.locator('#say-form').dispatchEvent('submit');
  await expect(bubble).toBeVisible();
});

test('caller-owned close button and lower panel remain interactive and replaceable', async ({
  page,
}) => {
  await page.goto('/');
  const host = page.locator('[data-mimimo]');
  await page.locator('#custom-close').check();
  await host
    .getByRole('button', { name: 'Закрыть мысль', exact: true })
    .focus();
  await page.keyboard.press('Enter');
  await expect(host.locator('[part="bubble"]')).toBeHidden();
  await expect(host.locator('.character')).toBeFocused();
  await host
    .getByRole('button', { name: 'Написать питомцу', exact: true })
    .click();
  await host
    .getByRole('textbox', { name: 'Сообщение в своей панели' })
    .fill('My own composer');
  await host.getByRole('button', { name: 'Отправить из своей панели' }).click();
  await expect(host.locator('[part="description"]')).toHaveText(
    'My own composer',
  );
  await expect(page.locator('#click-count')).toHaveText('0');
  await page.locator('#custom-panel').uncheck();
  await expect(host.locator('[part="panel"]')).toBeHidden();
  await expect(host.locator('.pet-toolbar')).toHaveCount(0);
  await page.locator('#custom-panel').check();
  await expect(host.locator('.pet-toolbar')).toHaveCount(1);
  await page.locator('#custom-style').check();
  await expect(host.locator('[part="title"]')).toHaveCSS(
    'color',
    'rgb(192, 247, 220)',
  );
  await expect(host.locator('[part="bubble"]')).toHaveCSS(
    'border-radius',
    '12px',
  );
  await page.locator('#destroy').click();
  await expect(host).toHaveCount(0);
  await page.locator('#show').click();
  await expect(page.locator('[data-mimimo] .pet-toolbar')).toHaveCount(1);
});

test('panels stay inside a narrow viewport at both drag limits and respect reduced motion', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const host = page.locator('[data-mimimo]');
  const character = host.locator('.character');
  const bubble = host.locator('[part="bubble"]');
  await expect(bubble).toHaveCSS('animation-name', 'none');
  for (const target of [
    { x: 2, y: 2 },
    { x: 388, y: 842 },
  ]) {
    const rect = await character.boundingBox();
    if (!rect) throw new Error('Missing pet');
    await page.mouse.move(rect.x + 64, rect.y + 64);
    await page.mouse.down();
    await page.mouse.move(target.x, target.y, { steps: 6 });
    await page.mouse.up();
    for (const panel of [bubble, host.locator('[part="panel"]')]) {
      const box = await panel.boundingBox();
      if (!box) throw new Error('Missing panel');
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(390);
      expect(box.y + box.height).toBeLessThanOrEqual(844);
    }
  }
});
