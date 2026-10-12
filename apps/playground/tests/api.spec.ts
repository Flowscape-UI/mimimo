import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import type { Pet, createPet } from '@flowscape-ui/mimimo';

declare global {
  interface Window {
    apiPet: Pet;
    makePet: typeof createPet;
    asset: string;
    events: string[];
  }
}
test.beforeEach(async ({ page }) => {
  await page.route('**/api-test', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><body style="margin:0"><div id="bounds" style="position:absolute;left:100px;top:100px;width:500px;height:400px;border:2px solid"></div></body>',
    }),
  );
  const bundle = await readFile(
    new URL(import.meta.resolve('@flowscape-ui/mimimo')),
    'utf8',
  );
  await page.route('**/mimimo-test.js', (route) =>
    route.fulfill({ contentType: 'text/javascript', body: bundle }),
  );
  await page.goto('/api-test');
  await page.evaluate(async () => {
    const url = '/mimimo-test.js';
    const module = (await import(url)) as typeof import('@flowscape-ui/mimimo');
    window.makePet = module.createPet;
    window.asset =
      'data:image/svg+xml,' +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" fill="pink"/></svg>',
      );
    window.events = [];
    window.apiPet = module.createPet({
      states: {
        idle: { path: window.asset },
        sleep: { frames: [window.asset, window.asset], fps: 10 },
        happy: { frames: [window.asset, window.asset], fps: 10, loop: false },
      },
    });
  });
});

test('react takes a state directly, restores the base, and animationend respects subscriber changes', async ({
  page,
}) => {
  await page.clock.install();
  await page.evaluate(() => {
    const pet = window.apiPet;
    pet.on('animationend', ({ state }) => window.events.push(state));
    pet.addReaction('click', 'sleep');
    if (!pet.react('happy')) throw new Error('Direct state not found');
  });
  expect(await page.evaluate(() => window.apiPet.state)).toBe('happy');
  await page.clock.runFor(350);
  expect(await page.evaluate(() => window.apiPet.state)).toBe('idle');
  expect(await page.evaluate(() => window.events)).toEqual(['happy']);
  expect(await page.evaluate(() => window.apiPet.react('missing'))).toBe(false);
  await page.evaluate(() => window.apiPet.react('sleep'));
  await page.clock.runFor(500);
  expect(await page.evaluate(() => window.apiPet.state)).toBe('sleep');
  await page.evaluate(() => window.apiPet.stopReaction());
  expect(await page.evaluate(() => window.apiPet.state)).toBe('idle');
  await page.evaluate(() => {
    window.apiPet.on('animationend', () => window.apiPet.play('sleep'));
    window.apiPet.react('happy');
  });
  await page.clock.runFor(350);
  expect(await page.evaluate(() => window.apiPet.state)).toBe('sleep');
});

test('pause preserves progress, explicit resume is required after hide/show, and states can be deleted', async ({
  page,
}) => {
  await page.clock.install();
  await page.evaluate(() => {
    window.apiPet.play('happy');
    window.apiPet.pause();
    window.apiPet.hide();
    window.apiPet.show();
  });
  await page.clock.runFor(1500);
  expect(
    await page.evaluate(() => [window.apiPet.state, window.apiPet.paused]),
  ).toEqual(['happy', true]);
  await page.evaluate(() => window.apiPet.resume());
  await page.clock.runFor(350);
  expect(await page.evaluate(() => window.apiPet.state)).toBe('idle');
  const result = await page.evaluate(() => {
    const pet = window.apiPet;
    pet.setDefaultState('sleep');
    pet.play('unknown');
    const fallback = pet.state;
    pet.removeState('sleep');
    const afterRemoval = pet.state;
    pet.removeState('idle');
    pet.removeState('happy');
    const empty = pet.state;
    pet.addState('new', { path: window.asset });
    return {
      fallback,
      afterRemoval,
      empty,
      names: pet.getStates(),
      current: pet.state,
      has: pet.hasState('sleep'),
    };
  });
  expect(result).toEqual({
    fallback: 'sleep',
    afterRemoval: 'idle',
    empty: '',
    names: ['new'],
    current: 'new',
    has: false,
  });
});

test('size, coordinates, anchors and draggable update the same pet and follow container resize and scroll', async ({
  page,
}) => {
  await page.evaluate(() => {
    window.apiPet.destroy();
    window.apiPet = window.makePet({
      container: document.querySelector<HTMLElement>('#bounds')!,
      width: 64,
      height: 64,
      states: { idle: { path: window.asset } },
      position: { x: 40, y: 60 },
    });
  });
  const host = page.locator('[data-mimimo]');
  await expect
    .poll(async () => {
      const rect = await host.boundingBox();
      return [rect?.x, rect?.y];
    })
    .toEqual([142, 162]);
  await page.evaluate(() => {
    const pet = window.apiPet;
    pet.element.dataset.identity = 'original';
    pet.setSize(80, 90);
    pet.setDraggable(false);
    pet.setPosition({ x: 50, y: 70 });
  });
  await expect(host).toHaveAttribute('data-identity', 'original');
  await expect(host.locator('.character')).toHaveCSS('width', '80px');
  const rect = await host.boundingBox();
  if (!rect) throw new Error('No pet');
  await page.mouse.move(rect.x + 40, rect.y + 40);
  await page.mouse.down();
  await page.mouse.move(rect.x + 90, rect.y + 90);
  await page.mouse.up();
  expect(await page.evaluate(() => window.apiPet.position)).toEqual({
    x: 50,
    y: 70,
  });
  await page.evaluate(() => window.apiPet.setAnchor('center', { x: 0, y: 0 }));
  expect(await page.evaluate(() => window.apiPet.position)).toEqual({
    x: 210,
    y: 155,
  });
  await page.evaluate(() => {
    document.querySelector<HTMLElement>('#bounds')!.style.width = '600px';
  });
  await expect
    .poll(() => page.evaluate(() => window.apiPet.position.x))
    .toBe(260);
  await page.evaluate(() => {
    document.body.style.height = '2000px';
    window.scrollTo(0, 50);
  });
  await expect
    .poll(async () => Math.round((await host.boundingBox())?.y ?? 0))
    .toBe(207);
});

test('preload reports success, errors and cancellation without announcing stale readiness', async ({
  page,
}) => {
  await page.route('**/broken.png', (route) =>
    route.fulfill({ contentType: 'image/png', body: 'invalid' }),
  );
  const result = await page.evaluate(async () => {
    const pet = window.apiPet;
    for (const event of ['loading', 'ready', 'loaderror'] as const)
      pet.on(event, () => window.events.push(event));
    await pet.preload();
    const success = [...window.events];
    window.events = [];
    pet.addState('bad', { path: '/broken.png' });
    let failed = false;
    try {
      await pet.preload(['bad']);
    } catch {
      failed = true;
    }
    const errors = [...window.events];
    window.events = [];
    const abort = new AbortController();
    abort.abort();
    let cancelled = false;
    try {
      await pet.preload(['idle'], { signal: abort.signal });
    } catch (error) {
      cancelled = error instanceof DOMException && error.name === 'AbortError';
    }
    return { success, errors, failed, cancelled };
  });
  expect(result).toEqual({
    success: ['loading', 'ready'],
    errors: ['loading', 'loaderror'],
    failed: true,
    cancelled: true,
  });
  const destroyed = await page.evaluate(async () => {
    window.events = [];
    const pet = window.apiPet;
    pet.on('loading', () => pet.destroy());
    try {
      await pet.preload(['idle']);
      return 'resolved';
    } catch (error) {
      return error instanceof Error ? error.name : 'unknown';
    }
  });
  expect(destroyed).toBe('AbortError');
  expect(await page.evaluate(() => window.events)).toEqual(['loading']);
});

test('a changed state registry invalidates a pending preload', async ({
  page,
}) => {
  await page.route('**/slow.svg', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 120));
    await route.fulfill({
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="2" height="2"/>',
    });
  });
  const result = await page.evaluate(async () => {
    const pet = window.apiPet;
    pet.addState('slow', { path: '/slow.svg' });
    pet.on('ready', () => window.events.push('ready'));
    const pending = pet.preload(['slow']).then(
      () => 'ready',
      (error: unknown) => (error instanceof Error ? error.name : 'error'),
    );
    pet.removeState('slow');
    return await pending;
  });
  expect(result).toBe('AbortError');
  expect(await page.evaluate(() => window.events)).toEqual([]);
});

test('public chat cancels superseded requests and ignores late replies, errors and hide aborts', async ({
  page,
}) => {
  const result = await page.evaluate(async () => {
    window.apiPet.destroy();
    const replies = new Map<string, (reply: string) => void>();
    const pet = (window.apiPet = window.makePet({
      states: {
        idle: { path: window.asset },
        thinking: { path: window.asset },
      },
      chat: {
        onMessage(message) {
          if (message === 'fail') return Promise.reject(new Error('offline'));
          return new Promise((resolve) => replies.set(message, resolve));
        },
      },
    }));
    const first = pet
      .sendMessage('first')
      .catch((error: unknown) =>
        error instanceof Error ? error.name : 'error',
      );
    await Promise.resolve();
    await Promise.resolve();
    const second = pet.sendMessage('second');
    await Promise.resolve();
    await Promise.resolve();
    replies.get('second')?.('new reply');
    const reply = await second;
    replies.get('first')?.('old reply');
    await Promise.resolve();
    const shown =
      pet.element.shadowRoot?.querySelector('[part=title]')?.textContent;
    const firstResult = await first;
    let failed = false;
    try {
      await pet.sendMessage('fail');
    } catch {
      failed = true;
    }
    const hidden = pet
      .sendMessage('hidden')
      .catch((error: unknown) =>
        error instanceof Error ? error.name : 'error',
      );
    await Promise.resolve();
    pet.hide();
    const hiddenResult = await hidden;
    return {
      reply,
      shown,
      firstResult,
      failed,
      hiddenResult,
      state: pet.state,
    };
  });
  expect(result).toEqual({
    reply: 'new reply',
    shown: 'new reply',
    firstResult: 'AbortError',
    failed: true,
    hiddenResult: 'AbortError',
    state: 'idle',
  });
});

test('preload prepares real video and cancels an in-flight image on timeout', async ({
  page,
}) => {
  await page.evaluate(async () => {
    window.apiPet.addState('clip', { type: 'video', path: '/sample.webm' });
    await window.apiPet.preload(['clip']);
  });
  let finishRoute: () => void = () => {};
  const served = new Promise<void>((resolve) => {
    finishRoute = resolve;
  });
  await page.route('**/timeout.svg', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    await route.fulfill({
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="2" height="2"/>',
    });
    finishRoute();
  });
  const result = await page.evaluate(async () => {
    const pet = window.apiPet;
    pet.addState('slow', { path: '/timeout.svg' });
    pet.on('ready', () => window.events.push('ready'));
    pet.on('loaderror', () => window.events.push('loaderror'));
    try {
      await pet.preload(['slow'], { timeout: 50 });
      return 'resolved';
    } catch (error) {
      return error instanceof Error ? error.message : 'error';
    }
  });
  expect(result).toContain('timed out');
  await served;
  expect(await page.evaluate(() => window.events)).toEqual(['loaderror']);
});
test('playground uses the same instance for resize and exposes direct reactions and public chat', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('[data-mimimo]').evaluate((el) => {
    el.setAttribute('data-identity', 'same');
  });
  await page.locator('#width input').fill('96');
  await page.locator('#apply-pet').click();
  await expect(page.locator('[data-mimimo]')).toHaveAttribute(
    'data-identity',
    'same',
  );
  await page.locator('#react-state').click();
  await expect(page.locator('#state')).toHaveText('sleep');
  await page.locator('#stop-reaction').click();
  await expect(page.locator('#state')).toHaveText('idle');
  await page.locator('#chat').check();
  await page.locator('#apply-pet').click();
  const pet = page.locator('[data-mimimo]');
  await pet
    .getByRole('button', { name: 'Написать питомцу', exact: true })
    .click();
  await pet
    .getByRole('textbox', { name: 'Сообщение в своей панели' })
    .fill('Public API');
  await pet.getByRole('button', { name: 'Отправить из своей панели' }).click();
  await expect(pet.locator('[part="title"]')).toHaveText(
    'Локальный ответ: Public API',
  );
});

test('state switches retain the decoded frame until replacement is ready and ignore stale loads', async ({
  page,
}) => {
  const image = page.locator('[data-mimimo] img');
  await expect
    .poll(() =>
      image.evaluate(
        (el: HTMLImageElement) => el.complete && el.naturalWidth > 0,
      ),
    )
    .toBe(true);
  const previous = await image.getAttribute('src');
  let release = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/delayed-state.svg', async (route) => {
    await gate;
    await route.fulfill({
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" fill="blue"/></svg>',
    });
  });
  const requested = page.waitForRequest('**/delayed-state.svg');
  await page.evaluate(() => {
    window.apiPet.addState('delayed', { path: '/delayed-state.svg' });
    window.apiPet.play('delayed');
  });
  await requested;
  await expect(image).toHaveAttribute('src', previous!);
  expect(
    await image.evaluate(
      (el: HTMLImageElement) => el.complete && el.naturalWidth > 0,
    ),
  ).toBe(true);
  release();
  await expect(image).toHaveAttribute('src', '/delayed-state.svg');
  expect(
    await image.evaluate(
      (el: HTMLImageElement) => el.complete && el.naturalWidth > 0,
    ),
  ).toBe(true);
  await page.route('**/failed-state.png', (route) =>
    route.fulfill({ status: 404, body: 'missing' }),
  );
  await page.evaluate(() => {
    window.apiPet.on('mediaerror', () => window.events.push('failed'));
    window.apiPet.addState('failed', { path: '/failed-state.png' });
    window.apiPet.play('failed');
  });
  await expect
    .poll(() => page.evaluate(() => window.events))
    .toContain('failed');
  await expect(image).toHaveAttribute('src', '/delayed-state.svg');
  await page.evaluate(() => {
    window.apiPet.play('idle');
    window.apiPet.play('delayed');
    window.apiPet.play('idle');
  });
  await expect(image).toHaveAttribute('src', previous!);
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
  await expect(image).toHaveAttribute('src', previous!);
});
