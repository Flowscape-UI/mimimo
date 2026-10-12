import { test, expect } from '@playwright/test';

for (const prefix of ['', '/ru']) {
  test(`media formats load and switch ${prefix || 'en'}`, async ({ page }) => {
    await page.goto(`${prefix}/guide/media`);
    const demo = page.locator('.media-demo');
    await demo.scrollIntoViewIfNeeded();
    const pet = demo.locator('[data-mimimo=media-demo]');
    await expect(pet).toBeVisible();
    for (const format of ['PNG', 'GIF', 'Video', 'Sprite', 'Frames']) {
      await demo.getByRole('button', { name: format, exact: true }).click();
      const media = pet.locator(format === 'Video' ? 'video' : 'img');
      await expect(media).toBeVisible();
      await expect
        .poll(() =>
          media.evaluate((node) =>
            node instanceof HTMLVideoElement
              ? node.readyState >= 2
              : (node as HTMLImageElement).naturalWidth > 0,
          ),
        )
        .toBe(true);
    }
    await page.goto(`${prefix}/guide/pet-pack`);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.vp-doc')).toContainText('import.meta.url');
    await expect(page.locator('.vp-doc')).toContainText('peerDependencies');
  });
}
