import type { Pet } from '@flowscape-ui/mimimo';

const lines = {
  en: [
    ['A little idea is taking shape.', 'A circle here, a square there...'],
    ['Just one tiny adjustment.', 'Good ideas deserve a little care.'],
    ['Making room for something fun.', 'Every little detail counts.'],
    ['Hmm... what if we try this?', 'A triangle might be just the thing.'],
  ],
  ru: [
    ['Маленькая идея обретает форму.', 'Круг сюда, квадрат туда...'],
    ['Ещё одна маленькая правка.', 'Хорошим идеям нужно немного заботы.'],
    ['Готовлю место для чего-то весёлого.', 'Каждая деталь важна.'],
    ['Хм... а если попробовать так?', 'Кажется, здесь нужен треугольник.'],
  ],
};

export function createFlowyRoutine(pet: Pet, language: () => string) {
  const lifetime = new AbortController();
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let timer: ReturnType<typeof setTimeout> | undefined;
  let finish: ReturnType<typeof setTimeout> | undefined;
  let working = false;
  let dragging = false;
  let line = -1;
  let disposed = false;
  function blocked() {
    return (
      disposed ||
      dragging ||
      pet.paused ||
      pet.element.hidden ||
      document.hidden ||
      motion.matches
    );
  }
  function translate() {
    if (!working) {
      pet.dismissBubble();
      return;
    }
    const phrase = lines[language().startsWith('ru') ? 'ru' : 'en'][line]!;
    pet.say({ title: phrase[0]!, description: phrase[1]! });
  }
  function cancelWork() {
    clearTimeout(finish);
    if (working) {
      working = false;
      pet.stopReaction();
      pet.dismissBubble();
    }
  }
  function schedule() {
    clearTimeout(timer);
    if (blocked()) return;
    timer = setTimeout(
      () => {
        if (blocked()) return;
        // Avoid repeating the previous thought on consecutive breaks.
        line = (line + 1 + Math.floor(Math.random() * 3)) % 4;
        working = true;
        pet.react('working');
        translate();
        finish = setTimeout(() => {
          cancelWork();
          schedule();
        }, 8000);
      },
      25000 + Math.random() * 20000,
    );
  }
  function reset() {
    cancelWork();
    schedule();
  }
  pet.element.addEventListener('pointerdown', reset, {
    signal: lifetime.signal,
  });
  pet.element.addEventListener('keydown', reset, { signal: lifetime.signal });
  const offStart = pet.on('dragstart', () => {
    dragging = true;
    reset();
  });
  const offEnd = pet.on('dragend', () => {
    dragging = false;
    reset();
  });
  document.addEventListener('visibilitychange', reset, {
    signal: lifetime.signal,
  });
  motion.addEventListener('change', reset, { signal: lifetime.signal });
  schedule();
  return {
    reset,
    translate,
    destroy() {
      disposed = true;
      clearTimeout(timer);
      clearTimeout(finish);
      lifetime.abort();
      offStart();
      offEnd();
    },
  };
}
