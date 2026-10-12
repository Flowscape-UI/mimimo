import { defineComponent, h, onMounted, onBeforeUnmount, ref } from 'vue';
import { useData, withBase } from 'vitepress';
import { createPet, type Pet } from '@flowscape-ui/mimimo';
import { flowy } from '@flowscape-ui/mimimo-pet-flowy';
import { mochi } from '@flowscape-ui/mimimo-pet-mochi';

export const MediaDemo = defineComponent({
  setup() {
    const { lang } = useData();
    const stage = ref<HTMLElement>();
    const current = ref('PNG');
    let pet: Pet | undefined;
    let observer: IntersectionObserver | undefined;
    const formats = ['PNG', 'GIF', 'Video', 'Sprite', 'Frames'];
    onMounted(() => {
      observer = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting) || !stage.value)
          return;
        observer?.disconnect();
        pet = createPet({
          id: 'media-demo',
          container: stage.value,
          anchor: 'center',
          width: 128,
          height: 128,
          initialState: 'PNG',
          states: {
            PNG: { type: 'image', path: withBase('/media/mochi.png') },
            GIF: {
              type: 'gif',
              path: withBase('/media/mochi.gif'),
              poster: withBase('/media/mochi.png'),
            },
            Video: {
              type: 'video',
              path: withBase('/media/sample.webm'),
              poster: withBase('/media/mochi.png'),
              loop: true,
            },
            Sprite: flowy.animations.idle,
            Frames: mochi.animations.idle,
          },
        });
      });
      if (stage.value) observer.observe(stage.value);
    });
    onBeforeUnmount(() => {
      observer?.disconnect();
      pet?.destroy();
    });
    return () =>
      h('section', { class: 'pet-demo media-demo' }, [
        h('div', {
          ref: stage,
          style: { position: 'relative', height: '240px', overflow: 'hidden' },
        }),
        h(
          'div',
          { class: 'demo-controls' },
          formats.map((format) =>
            h(
              'button',
              {
                type: 'button',
                'aria-pressed': current.value === format,
                onClick: () => {
                  pet?.show();
                  pet?.play(format);
                  current.value = format;
                },
              },
              format,
            ),
          ),
        ),
        h(
          'button',
          { type: 'button', onClick: () => pet?.hide() },
          lang.value.startsWith('ru') ? 'Скрыть питомца' : 'Hide pet',
        ),
        h(
          'p',
          { 'aria-live': 'polite' },
          `${lang.value.startsWith('ru') ? 'Формат' : 'Format'}: ${current.value}`,
        ),
      ]);
  },
});
