import { homeText } from './home-copy';
import { createPet } from 'mimimo';
import { flowyStates } from './flowy';
import { startHeroIntro } from './hero-intro';
import { mountScrollReveal } from './scroll-reveal';

export function mountHomepage(language = 'en') {
  const t = homeText(language);
  const root = document.querySelector<HTMLElement>('.mimimo-home');
  if (!root) throw new Error('Missing homepage');
  function element<T extends HTMLElement>(selector: string): T {
    const node = root?.querySelector<T>(selector);
    if (!node) throw new Error('Missing element: ' + selector);
    return node;
  }
  const lifetime = new AbortController();
  const { signal } = lifetime;
  const world = element('#world');
  const status = element('#pet-status');
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  let pointerX = 0;
  let pointerY = 0;
  let scrollY = 0;
  const layers = [...root.querySelectorAll<HTMLElement>('[data-depth]')];
  const pet = createPet({
    id: 'flowy',
    name: 'Flowy',
    container: element('#pet-stage'),
    width: 260,
    height: 260,
    anchor: 'center',
    offset: { x: 0, y: world.clientHeight / 2 - 270 },
    draggable: false,
    bubble: { closeButton: true },
    states: flowyStates,
  });
  pet.element.classList.add('homepage-pet');
  // Keep the sprite's ground line on the podium at every scene height.
  const resize = new ResizeObserver(() => {
    pet.setAnchor('center', { x: 0, y: world.clientHeight / 2 - 270 });
  });
  resize.observe(world);
  pet.say({
    title: t("Hey, I'm Flowy!"),
    description: t('Got a little room for a new friend?'),
  });
  void pet.preload(undefined, { signal }).catch(() => {
    if (!signal.aborted)
      status.textContent = t(
        'Flowy could not load. Please refresh to try again.',
      );
  });
  function motionDisabled() {
    return media.matches;
  }
  function paint() {
    frame = 0;
    for (const layer of layers) {
      const depth = Number(layer.dataset.depth);
      layer.style.transform = motionDisabled()
        ? ''
        : `translate3d(${pointerX * depth}px, ${(pointerY + scrollY) * depth}px, 0)`;
    }
  }
  function schedule() {
    if (!frame) frame = requestAnimationFrame(paint);
  }
  function syncMotion() {
    const paused = motionDisabled();
    root?.classList.toggle('motion-paused', paused);
    if (paused) pet.pause();
    else pet.resume();
    schedule();
  }
  media.addEventListener('change', syncMotion, { signal });
  world.addEventListener(
    'pointermove',
    (event) => {
      if (motionDisabled() || event.pointerType === 'touch') return;
      const rect = world.getBoundingClientRect();
      pointerX =
        ((event.clientX - rect.left - rect.width / 2) / rect.width) * 16;
      pointerY =
        ((event.clientY - rect.top - rect.height / 2) / rect.height) * 12;
      schedule();
    },
    { signal },
  );
  world.addEventListener(
    'pointerleave',
    () => {
      pointerX = 0;
      pointerY = 0;
      schedule();
    },
    { signal },
  );
  window.addEventListener(
    'scroll',
    () => {
      if (motionDisabled()) return;
      scrollY = Math.max(
        -16,
        Math.min(16, -world.getBoundingClientRect().top / 30),
      );
      schedule();
    },
    { signal, passive: true },
  );
  function react(state: string, title: string, description: string) {
    pet.react(state);
    pet.say({ title, description });
    status.textContent =
      state === 'working'
        ? t('A little idea is taking shape.')
        : state === 'happy'
          ? t('Small wins deserve a happy dance.')
          : t('A little hello from Flowy.');
    syncMotion();
  }
  function hello() {
    react(
      'idle',
      t('Hey, human. Nice to meet you!'),
      t('Pick a little adventure below.'),
    );
  }
  element('#hello').addEventListener('click', hello, { signal });
  element('#meet').addEventListener(
    'click',
    () => {
      hello();
      world.scrollIntoView({
        behavior: motionDisabled() ? 'instant' : 'smooth',
        block: 'center',
      });
      element<HTMLButtonElement>('#hello').focus({ preventScroll: true });
    },
    { signal },
  );
  element('#work').addEventListener(
    'click',
    () =>
      react(
        'working',
        t('A circle, a square... an idea!'),
        t('Let me make something for you.'),
      ),
    { signal },
  );
  element('#celebrate').addEventListener(
    'click',
    () =>
      react(
        'happy',
        t('Look at you go!'),
        t('That deserves a little celebration.'),
      ),
    { signal },
  );
  const offClick = pet.on('click', hello);
  function example(local: boolean) {
    element('#starter-code').textContent =
      "import { createPet } from 'mimimo';\nimport { mochi } from 'mimimo-pet-mochi';\n\n// Run after the page mounts.\n" +
      (local
        ? "const container = document.querySelector<HTMLElement>('#pet-home');\nif (!container) throw new Error('Missing pet home');\n\n"
        : '') +
      'const pet = createPet({\n  character: mochi,' +
      (local ? '\n  container,' : '') +
      "\n});\n\npet.addReaction('click', 'happy');\npet.say('" +
      t('Nice to meet you!') +
      "');\n\n// On unmount: pet.destroy();";
  }
  for (const button of root.querySelectorAll<HTMLButtonElement>(
    '[data-example]',
  )) {
    button.addEventListener(
      'click',
      () => {
        example(button.dataset.example === 'local');
        for (const option of root.querySelectorAll('[data-example]'))
          option.setAttribute('aria-pressed', String(option === button));
      },
      { signal },
    );
  }
  let copyTimer: ReturnType<typeof setTimeout> | undefined;
  element('#copy-code').addEventListener(
    'click',
    async () => {
      const button = element('#copy-code');
      try {
        await navigator.clipboard.writeText(
          element('#starter-code').textContent ?? '',
        );
        if (signal.aborted) return;
        button.textContent = t('Copied!');
      } catch {
        if (signal.aborted) return;
        button.textContent = t('Select code to copy');
      }
      clearTimeout(copyTimer);
      copyTimer = setTimeout(() => {
        button.textContent = t('Copy code');
      }, 1800);
    },
    { signal },
  );
  example(false);
  syncMotion();
  const disposeIntro = startHeroIntro(root, pet, language);
  const disposeReveal = mountScrollReveal(root);
  return () => {
    disposeReveal();
    disposeIntro();
    lifetime.abort();
    resize.disconnect();
    offClick();
    cancelAnimationFrame(frame);
    clearTimeout(copyTimer);
    pet.destroy();
  };
}
