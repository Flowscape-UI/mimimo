import { expect, test } from '@playwright/test';
import { apiPages } from '../.vitepress/api-pages';

for (const prefix of ['', '/ru']) {
  test(`API pages render real demos and framework tabs ${prefix || 'en'}`, async ({
    page,
  }) => {
    test.setTimeout(90000);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const entry of apiPages) {
      await page.goto(`${prefix}/api/${entry.slug}`);
      const demo = page.locator('.pet-demo');
      await demo.scrollIntoViewIfNeeded();
      await expect(demo.locator('[data-mimimo=docs-demo]')).toBeVisible();
      await expect(demo.locator('.demo-controls button').first()).toBeEnabled();
      const group = page.locator('.vp-code-group').first();
      await group
        .locator('label')
        .filter({ hasText: /^React$/ })
        .click();
      await expect(group.locator('.blocks > div.active')).toContainText(
        'useEffect',
      );
      await group.locator('label').filter({ hasText: /^Vue$/ }).click();
      await expect(group.locator('.blocks > div.active')).toContainText(
        'onBeforeUnmount',
      );
    }
  });
}

test('demo actions affect actual pet state, media, message and lifecycle', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const demo = page.locator('.pet-demo');
  const pet = demo.locator('[data-mimimo=docs-demo]');
  const action = (name: string) =>
    demo.getByRole('button', { name, exact: true });
  await page.goto('/api/play');
  await action('Sleep').click();
  await expect(demo.locator('output')).toContainText('state: sleep');
  await action('Idle').click();
  await expect(demo.locator('output')).toContainText('state: idle');
  await page.goto('/api/say');
  await demo.getByRole('textbox').fill('<b>Plain text</b>');
  await action('Say').click();
  await expect(pet.locator('[part=title]')).toHaveText('<b>Plain text</b>');
  await expect(pet.locator('[part=title] b')).toHaveCount(0);
  await action('Dismiss').click();
  await expect(pet.locator('[part=bubble]')).toBeHidden();
  await page.goto('/api/add-state');
  await action('Add wave').click();
  await action('Play wave').click();
  await expect(demo.locator('output')).toHaveText('state: wave');
  await action('Remove wave').click();
  await expect(demo.locator('output')).toHaveText('removeState: true');
  await page.goto('/api/visibility');
  await action('Hide').click();
  await expect(pet).toBeHidden();
  await action('Show').click();
  await expect(pet).toBeVisible();
  await page.goto('/api/events');
  await expect(pet).toBeVisible();
  await pet.locator('.character').click();
  await expect(demo.locator('output')).toHaveText('click event received');
  await action('Unsubscribe').click();
  await pet.locator('.character').click();
  await expect(demo.locator('output')).toContainText('Listener removed');
  await page.goto('/api/destroy');
  await action('Destroy').click();
  await expect(pet).toHaveCount(0);
  await action('Create again').click();
  await expect(pet).toBeVisible();
  await expect(page.locator('[data-mimimo=docs-demo]')).toHaveCount(1);
  await page.locator('.VPNavBarTitle a').click();
  await expect(page.locator('[data-mimimo=docs-demo]')).toHaveCount(0);
});

test('Russian mobile demo supports keyboard and local chat without overflow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/ru/api/chat');
  const demo = page.locator('.pet-demo');
  await demo.getByRole('textbox', { name: 'Ваша реплика' }).fill('Привет');
  await demo.getByRole('button', { name: 'Отправить', exact: true }).click();
  await expect(demo.locator('output')).toHaveText(
    'Ответ локального демо: Привет',
  );
  await expect(demo.locator('[part=title]')).toHaveText(
    'Ответ локального демо: Привет',
  );
  const character = demo.locator('.character');
  await character.focus();
  await page.keyboard.press('ArrowLeft');
  await expect(demo.locator('output')).toContainText('x:');
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(375);
});
