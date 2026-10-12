import { defineComponent, onMounted, onBeforeUnmount, watch } from 'vue';
import { useData } from 'vitepress';
import type { Pet } from 'mimimo';
import { createFlowyRoutine } from '../../src/flowy-routine';

export const SiteFlowy = defineComponent({
  name: 'SiteFlowy',
  setup() {
    const { lang } = useData();
    const text = (en: string, ru: string) =>
      lang.value.startsWith('ru') ? ru : en;
    let pet: Pet | undefined;
    let routine: ReturnType<typeof createFlowyRoutine> | undefined;
    const lifetime = new AbortController();
    onMounted(async () => {
      const [{ createPet }, { flowyStates }] = await Promise.all([
        import('mimimo'),
        import('../../src/flowy'),
      ]);
      if (lifetime.signal.aborted) return;
      pet = createPet({
        id: 'flowy-companion',
        name: 'Flowy companion',
        states: flowyStates,
        width: 140,
        height: 140,
        anchor: 'bottom-right',
        offset: { x: 20, y: 20 },
        draggable: true,
        bubble: { closeButton: true },
        reactions: { click: 'happy' },
      });
      pet.element.classList.add('site-flowy');
      pet.say({ title: text("Hi, I'm Flowy!", 'Привет, я Flowy!') });
      routine = createFlowyRoutine(pet, () => lang.value);
      pet.on('click', () =>
        pet?.say({
          title: text('Hey, friend!', 'Привет, друг!'),
          description: text(
            'Drag me along. I like exploring.',
            'Перетащи меня с собой. Я люблю исследовать!',
          ),
        }),
      );
      const character =
        pet.element.shadowRoot?.querySelector<HTMLElement>('[part=character]');
      character?.setAttribute(
        'title',
        'Drag Flowy, or use arrow keys while focused',
      );
      character?.addEventListener(
        'keydown',
        (event) => {
          const direction = {
            ArrowLeft: [-1, 0],
            ArrowRight: [1, 0],
            ArrowUp: [0, -1],
            ArrowDown: [0, 1],
          }[event.key];
          if (!direction || !pet) return;
          event.preventDefault();
          const step = event.shiftKey ? 40 : 16;
          pet.setPosition({
            x: pet.position.x + direction[0]! * step,
            y: pet.position.y + direction[1]! * step,
          });
        },
        { signal: lifetime.signal },
      );
      void pet.preload(undefined, { signal: lifetime.signal }).catch(() => {});
    });
    watch(lang, () => {
      routine?.translate();
    });
    onBeforeUnmount(() => {
      lifetime.abort();
      routine?.destroy();
      pet?.destroy();
    });
    return () => null;
  },
});
