import { defineComponent, h, onMounted, onBeforeUnmount } from 'vue';
import { useData, withBase } from 'vitepress';
import markup from '../../src/home.html?raw';
import russianMarkup from '../../src/home.ru.html?raw';
import { mochi } from 'mimimo-pet-mochi';
import { byte } from 'mimimo-pet-byte';
export const Home = defineComponent({
  name: 'MimimoHome',
  setup() {
    const { lang } = useData();
    const russian = lang.value.startsWith('ru');
    const prefix = russian ? '/ru' : '';
    let disposed = false;
    let cleanup: (() => void) | undefined;
    onMounted(async () => {
      const { mountHomepage } = await import('../../src/main');
      if (disposed) return;
      cleanup = mountHomepage(lang.value);
    });
    onBeforeUnmount(() => {
      disposed = true;
      cleanup?.();
    });
    // Static, repository-owned markup. User messages are rendered by Mimimo as text.
    return () =>
      h('div', {
        class: 'mimimo-home',
        lang: russian ? 'ru' : 'en',
        innerHTML: (russian ? russianMarkup : markup)
          .replaceAll('href="/api/', 'href="' + withBase(prefix + '/api/'))
          .replaceAll('{{year}}', String(new Date().getFullYear()))
          .replaceAll('{{mochi}}', mochi.animations.idle.frames[0])
          .replaceAll('{{byte}}', byte.animations.happy.frames[0])
          .replaceAll(
            'href="/components/',
            'href="' + withBase(prefix + '/components/'),
          )
          .replaceAll('href="/guide/', 'href="' + withBase(prefix + '/guide/')),
      });
  },
});
