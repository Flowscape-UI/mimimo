import { homeText } from './home-copy';
import type { Pet } from 'mimimo';

export function startHeroIntro(root: HTMLElement, pet: Pet, language = 'en') {
  const t = homeText(language);
  const hero = root.querySelector<HTMLElement>('.hero')!;
  const heading = hero.querySelector<HTMLElement>('h1')!;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (motion.matches) return () => {};
  const lifetime = new AbortController();
  const letters: HTMLElement[] = [];
  const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) =>
      node.parentElement?.closest('svg')
        ? NodeFilter.FILTER_REJECT
        : NodeFilter.FILTER_ACCEPT,
  });
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  heading.setAttribute(
    'aria-label',
    heading.textContent?.replace(/\s+/g, ' ').trim() ?? '',
  );
  for (const node of nodes) {
    const fragment = document.createDocumentFragment();
    for (const character of node.data) {
      if (/\s/.test(character)) {
        fragment.append(document.createTextNode(character));
        continue;
      }
      const letter = document.createElement('span');
      letter.className = 'intro-letter';
      letter.setAttribute('aria-hidden', 'true');
      letter.textContent = character;
      fragment.append(letter);
      letters.push(letter);
    }
    node.replaceWith(fragment);
  }
  let timer: ReturnType<typeof setTimeout> | undefined;
  let finished = false;
  let index = 0;
  root.classList.add('hero-entering');
  pet.react('working');
  pet.say({
    title: t('A little idea is taking shape...'),
    description: t('Let me put a little joy on this page.'),
  });
  function finish() {
    if (finished) return;
    finished = true;
    clearTimeout(timer);
    letters.forEach((letter) => letter.classList.add('is-typed'));
    root.classList.remove('hero-entering');
    root.classList.add('hero-entered');
    pet.stopReaction();
    pet.say({
      title: t("Hey, I'm Flowy!"),
      description: t('Got a little room for a new friend?'),
    });
  }
  function type() {
    letters[index - 1]?.classList.remove('typing-cursor');
    const letter = letters[index++];
    if (!letter) {
      finish();
      return;
    }
    letter.classList.add('is-typed', 'typing-cursor');
    timer = setTimeout(type, letter.textContent === '.' ? 240 : 65);
  }
  // Start typing only once the working artwork is decoded, including cold loads.
  void pet
    .preload(['working'], { signal: lifetime.signal })
    .then(() => {
      if (!finished) timer = setTimeout(type, 220);
    })
    .catch(() => {
      if (!lifetime.signal.aborted) finish();
    });
  // Let the visitor interact immediately without a delayed intro overwriting it.
  hero.addEventListener('pointerdown', finish, {
    capture: true,
    signal: lifetime.signal,
  });
  hero.addEventListener('focusin', finish, { signal: lifetime.signal });
  motion.addEventListener('change', finish, { signal: lifetime.signal });
  return () => {
    clearTimeout(timer);
    lifetime.abort();
  };
}
