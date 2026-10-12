import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import type { Pet, createPet } from '@flowscape-ui/mimimo';
declare global {
  interface Window {
    layerPet: Pet;
    createLayerPet: typeof createPet;
  }
}
test.beforeEach(async ({ page }) => {
  const bundle = await readFile(
    new URL(import.meta.resolve('@flowscape-ui/mimimo')),
    'utf8',
  );
  await page.route('**/layer.js', (route) =>
    route.fulfill({ contentType: 'text/javascript', body: bundle }),
  );
  await page.route('**/layer-test', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><body style="margin:0"><div id="container" style="position:absolute;left:100px;top:100px;width:400px;height:300px"></div><button id="outside">Outside</button></body>',
    }),
  );
  await page.goto('/layer-test');
  await page.evaluate(async () => {
    const path = '/layer.js';
    window.createLayerPet = (
      (await import(path)) as typeof import('@flowscape-ui/mimimo')
    ).createPet;
  });
});
test('global pet stays interactive over maximum z-index, new popovers and modal dialogs', async ({
  page,
}) => {
  await page.evaluate(() => {
    window.layerPet = window.createLayerPet({ position: { x: 200, y: 200 } });
    window.layerPet.on('click', () => window.layerPet.say('Clicked'));
    const cover = document.createElement('div');
    cover.style.cssText =
      'position:fixed;inset:0;background:red;z-index:2147483647';
    document.body.append(cover);
  });
  const pet = page.locator('[data-mimimo]');
  await pet.getByRole('button', { name: 'Companion', exact: true }).click();
  await expect(pet.locator('[part="title"]')).toHaveText('Clicked');
  await page.evaluate(() => {
    const pop = document.createElement('div');
    pop.popover = 'manual';
    pop.style.cssText =
      'position:fixed;inset:0;margin:0;width:100vw;height:100vh;background:blue';
    document.body.append(pop);
    pop.showPopover();
  });
  await pet.getByRole('button', { name: 'Companion', exact: true }).click();
  await page.evaluate(() => {
    const dialog = document.createElement('dialog');
    dialog.style.cssText = 'width:90vw;height:90vh';
    document.body.append(dialog);
    dialog.showModal();
  });
  await pet.getByRole('button', { name: 'Companion', exact: true }).click();
  expect(
    await page.evaluate(() => window.layerPet.element.parentElement?.tagName),
  ).toBe('DIALOG');
  await page.evaluate(() => document.querySelector('dialog')?.close());
  await expect
    .poll(() =>
      page.evaluate(() => window.layerPet.element.parentElement?.tagName),
    )
    .toBe('BODY');
  await page.evaluate(() => window.layerPet.hide());
  await expect(pet).toBeHidden();
  await page.evaluate(() => window.layerPet.show());
  await pet.getByRole('button', { name: 'Companion', exact: true }).click();
});
test('local environment clamps movement, clips oversized content and tracks layout changes', async ({
  page,
}) => {
  await page.evaluate(() => {
    const container = document.querySelector<HTMLElement>('#container')!;
    window.layerPet = window.createLayerPet({
      container,
      position: { x: 0, y: 0 },
    });
    const panel = document.createElement('button');
    panel.textContent = 'Large panel';
    panel.style.cssText = 'width:800px;height:500px;background:red';
    window.layerPet.setPanel(panel);
    window.layerPet.setPosition({ x: 9999, y: 9999 });
  });
  expect(await page.evaluate(() => window.layerPet.position.x)).toBe(272);
  // Oversized panel must never intercept pointers beyond its environment.
  expect(
    await page.evaluate(
      () =>
        document.elementFromPoint(450, 450)?.closest('[data-mimimo]') !== null,
    ),
  ).toBe(false);
  expect(
    await page.evaluate(() => window.layerPet.element.style.clipPath),
  ).toContain('inset(');
  await page.evaluate(() => {
    window.layerPet.setPanel(null);
    window.layerPet.setPosition({ x: 50, y: 60 });
    document.querySelector<HTMLElement>('#container')!.style.left = '200px';
  });
  await expect
    .poll(() =>
      page.evaluate(() => window.layerPet.element.getBoundingClientRect().left),
    )
    .toBe(250);
  await page.evaluate(
    () =>
      (document.querySelector<HTMLElement>('#container')!.style.display =
        'none'),
  );
  await expect
    .poll(() => page.evaluate(() => window.layerPet.element.style.clipPath))
    .toBe('inset(100%)');
  await page.evaluate(() => {
    window.layerPet.destroy();
  });
  await expect(page.locator('[data-mimimo]')).toHaveCount(0);
});
test('invalid local configuration does not create a partial instance', async ({
  page,
}) => {
  expect(
    await page.evaluate(() => {
      try {
        window.createLayerPet({ bounds: 'container' });
        return false;
      } catch {
        return true;
      }
    }),
  ).toBe(true);
  await expect(page.locator('[data-mimimo]')).toHaveCount(0);
});

test('local pets follow document scrolling in both directions before scroll handlers run', async ({
  page,
}) => {
  await page.evaluate(() => {
    document.body.style.height = '3000px';
    const container = document.querySelector<HTMLElement>('#container')!;
    container.style.top = '500px';
    window.layerPet = window.createLayerPet({
      container,
      position: { x: 60, y: 100 },
    });
  });
  // Read in the same task as scrolling: a fixed portal updated by a scroll
  // handler lags behind here, and also detaches during native overscroll.
  for (const top of [200, 650, 1000, 650, 200, 0]) {
    const offset = await page.evaluate((top) => {
      window.scrollTo({ top, behavior: 'instant' });
      const container = document.querySelector<HTMLElement>('#container')!;
      return (
        window.layerPet.element.getBoundingClientRect().top -
        container.getBoundingClientRect().top
      );
    }, top);
    expect(offset).toBe(100);
    await page.evaluate(
      () =>
        new Promise<void>((resolve) => requestAnimationFrame(() => resolve())),
    );
  }
  await expect(page.locator('[data-mimimo]')).toHaveCSS('position', 'absolute');
});

test('local pets stay above container content but below outside navigation and dialogs', async ({
  page,
}) => {
  await page.evaluate(() => {
    const container = document.querySelector<HTMLElement>('#container')!;
    const cover = document.createElement('div');
    cover.style.cssText =
      'position:absolute;inset:0;z-index:999;background:red';
    container.append(cover);
    window.layerPet = window.createLayerPet({
      container,
      position: { x: 60, y: 100 },
    });
    window.layerPet.say('Local message');
  });
  const pet = page.locator('[data-mimimo]');
  await pet.getByRole('button', { name: 'Companion', exact: true }).click();
  expect(await pet.evaluate((host) => host.parentElement?.id)).toBe(
    'container',
  );
  expect(await pet.evaluate((host) => host.hasAttribute('popover'))).toBe(
    false,
  );
  await page.evaluate(() => {
    const nav = document.createElement('button');
    nav.id = 'overlapping-nav';
    nav.textContent = 'Navigation';
    nav.style.cssText =
      'position:fixed;left:100px;top:100px;width:400px;height:300px;z-index:10';
    document.body.append(nav);
  });
  expect(
    await page.evaluate(() => document.elementFromPoint(200, 250)?.id),
  ).toBe('overlapping-nav');
  await page.locator('#overlapping-nav').click();
  await page.evaluate(() => {
    const dialog = document.createElement('dialog');
    document.body.append(dialog);
    dialog.showModal();
    window.layerPet.hide();
    window.layerPet.show();
  });
  expect(await pet.evaluate((host) => host.parentElement?.id)).toBe(
    'container',
  );
  expect(await pet.evaluate((host) => host.matches(':popover-open'))).toBe(
    false,
  );
});

test('local layer restores temporary container styles after the last pet is destroyed', async ({
  page,
}) => {
  const result = await page.evaluate(() => {
    const container = document.querySelector<HTMLElement>('#container')!;
    container.style.position = 'static';
    const first = window.createLayerPet({ container });
    const second = window.createLayerPet({ container });
    const mounted = [container.style.position, container.style.isolation];
    first.destroy();
    const shared = [container.style.position, container.style.isolation];
    second.destroy();
    return {
      mounted,
      shared,
      restored: [container.style.position, container.style.isolation],
    };
  });
  expect(result).toEqual({
    mounted: ['relative', 'isolate'],
    shared: ['relative', 'isolate'],
    restored: ['static', ''],
  });
});
