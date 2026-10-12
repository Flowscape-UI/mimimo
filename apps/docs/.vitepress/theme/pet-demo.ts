import { defineComponent, h, onMounted, onBeforeUnmount, ref } from 'vue';
import { useData } from 'vitepress';
import type { Pet } from 'mimimo';
import { mochi } from 'mimimo-pet-mochi';

export const PetDemo = defineComponent({
  props: { topic: { type: String, default: 'create-pet' } },
  setup(props) {
    const { lang } = useData();
    const t = (en: string, ru: string) =>
      lang.value.startsWith('ru') ? ru : en;
    const stage = ref<HTMLElement>();
    const ready = ref(false);
    const message = ref(t('You did it!', 'У тебя получилось!'));
    const output = ref('');
    let pet: Pet | undefined;
    let create: (() => void) | undefined;
    let disposed = false;
    let observer: IntersectionObserver | undefined;
    let lifetime = new AbortController();
    let unsubscribe: (() => void) | undefined;
    let stillFrame = '';
    const report = (text: string) => {
      if (!disposed) output.value = text;
    };
    const snapshot = () =>
      report(
        pet
          ? `state: ${pet.state} · paused: ${pet.paused} · draggable: ${pet.draggable} · x: ${Math.round(pet.position.x)}, y: ${Math.round(pet.position.y)}`
          : 'destroyed',
      );
    onMounted(() => {
      observer = new IntersectionObserver(
        async (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          observer?.disconnect();
          const core = await import('mimimo').catch((error: unknown) => {
            report(String(error));
            return undefined;
          });
          if (!core || disposed) return;
          const { createPet } = core;
          stillFrame = mochi.animations.happy.frames[0];
          create = () => {
            if (!stage.value || disposed) return;
            unsubscribe?.();
            lifetime.abort();
            pet?.destroy();
            lifetime = new AbortController();
            pet = createPet({
              character: mochi,
              id: 'docs-demo',
              container: stage.value,
              anchor: 'center',
              width: 112,
              height: 112,
              draggable: true,
              bubble: { closeButton: true },
              ...(props.topic === 'chat'
                ? {
                    chat: {
                      placeholder: t('Write something', 'Напишите что-нибудь'),
                      onMessage: async (
                        text: string,
                        { signal }: { signal: AbortSignal },
                      ) => {
                        signal.throwIfAborted();
                        return (
                          t('Local demo reply: ', 'Ответ локального демо: ') +
                          text
                        );
                      },
                    },
                  }
                : {}),
            });
            pet.element.classList.add('docs-demo-pet');
            pet.element.addEventListener(
              'keydown',
              (event) => {
                const shifts: Record<string, [number, number]> = {
                  ArrowLeft: [-16, 0],
                  ArrowRight: [16, 0],
                  ArrowUp: [0, -16],
                  ArrowDown: [0, 16],
                };
                const shift = shifts[event.key];
                if (
                  !shift ||
                  !pet?.draggable ||
                  event.target instanceof HTMLInputElement
                )
                  return;
                event.preventDefault();
                pet.setPosition({
                  x: pet.position.x + shift[0],
                  y: pet.position.y + shift[1],
                });
                snapshot();
              },
              { signal: lifetime.signal },
            );
            if (props.topic === 'events') subscribe();
            snapshot();
          };
          create();
          ready.value = true;
        },
        { rootMargin: '200px' },
      );
      if (stage.value) observer.observe(stage.value);
    });
    function subscribe() {
      unsubscribe?.();
      unsubscribe = pet?.on('click', () =>
        report(t('click event received', 'Получено событие click')),
      );
    }
    const actions: Record<
      string,
      [string, string, () => void | Promise<void>][]
    > = {
      'create-pet': [['Create again', 'Создать заново', () => create?.()]],
      'define-pet': [
        [
          'Happy',
          'Радоваться',
          () => {
            pet?.react('happy');
          },
        ],
      ],
      'add-state': [
        [
          'Add wave',
          'Добавить wave',
          () => {
            pet?.addState('wave', { type: 'image', path: stillFrame });
            snapshot();
          },
        ],
        [
          'Play wave',
          'Включить wave',
          () => {
            if (pet?.hasState('wave')) pet.play('wave');
            report(
              pet?.hasState('wave')
                ? 'state: wave'
                : t('Add wave first', 'Сначала добавьте wave'),
            );
          },
        ],
        [
          'List states',
          'Список состояний',
          () => report(pet?.getStates().join(', ') ?? ''),
        ],
        [
          'Remove wave',
          'Удалить wave',
          () => {
            report(`removeState: ${pet?.removeState('wave')}`);
          },
        ],
      ],
      play: [
        ['Sleep', 'Спать', () => pet?.play('sleep')],
        ['Idle', 'Отдыхать', () => pet?.play('idle')],
      ],
      reactions: [
        [
          'React',
          'Порадоваться',
          () => {
            pet?.react('happy');
          },
        ],
        ['Stop reaction', 'Завершить реакцию', () => pet?.stopReaction()],
        [
          'Enable click',
          'Реакция на клик',
          () => {
            pet?.addReaction('click', 'happy');
          },
        ],
        [
          'Remove click',
          'Убрать реакцию',
          () => {
            pet?.removeReaction('click');
          },
        ],
      ],
      say: [
        [
          'Say',
          'Сказать',
          () =>
            pet?.say({
              title: message.value,
              description: t('This is plain text.', 'Это обычный текст.'),
            }),
        ],
        ['Dismiss', 'Закрыть реплику', () => pet?.dismissBubble()],
        [
          'Disable bubble',
          'Выключить облачко',
          () => pet?.setBubbleEnabled(false),
        ],
        [
          'Enable bubble',
          'Включить облачко',
          () => pet?.setBubbleEnabled(true),
        ],
      ],
      position: [
        ['Left', 'Слева', () => pet?.setPosition({ x: 24, y: 130 })],
        ['Center', 'По центру', () => pet?.setAnchor('center')],
        [
          'Bottom right',
          'Справа внизу',
          () => pet?.setAnchor('bottom-right', { x: 24, y: 24 }),
        ],
      ],
      size: [
        ['Small', 'Маленький', () => pet?.setSize(80, 80)],
        ['Large', 'Большой', () => pet?.setSize(150, 150)],
      ],
      draggable: [
        ['Enable drag', 'Можно двигать', () => pet?.setDraggable(true)],
        ['Disable drag', 'Закрепить', () => pet?.setDraggable(false)],
      ],
      preload: [
        [
          'Preload',
          'Загрузить медиа',
          async () => {
            report(t('Loading…', 'Загрузка…'));
            try {
              await pet?.preload(['idle', 'happy'], {
                signal: lifetime.signal,
                timeout: 5000,
              });
              report(t('Ready: idle, happy', 'Готово: idle, happy'));
            } catch (error) {
              if (!lifetime.signal.aborted) report(String(error));
            }
          },
        ],
      ],
      playback: [
        ['Pause', 'Пауза', () => pet?.pause()],
        ['Resume', 'Продолжить', () => pet?.resume()],
      ],
      visibility: [
        ['Hide', 'Скрыть', () => pet?.hide()],
        ['Show', 'Показать', () => pet?.show()],
      ],
      events: [
        ['Subscribe', 'Подписаться', subscribe],
        [
          'Unsubscribe',
          'Отписаться',
          () => {
            unsubscribe?.();
            report(
              t(
                'Listener removed. Click the pet again.',
                'Подписка снята. Нажмите на питомца ещё раз.',
              ),
            );
          },
        ],
      ],
      panels: [
        [
          'Add panel',
          'Добавить панель',
          () => {
            const panel = document.createElement('button');
            panel.textContent = t('Give a high five!', 'Дай пять!');
            panel.addEventListener('click', () => pet?.react('happy'), {
              signal: lifetime.signal,
            });
            pet?.setPanel(panel);
            const close = document.createElement('button');
            close.textContent = t('Dismiss', 'Закрыть');
            close.addEventListener('click', () => pet?.dismissBubble(), {
              signal: lifetime.signal,
            });
            pet?.setBubbleClose(close);
            pet?.say(t('My own controls!', 'Мои собственные кнопки!'));
          },
        ],
        [
          'Remove panel',
          'Убрать панель',
          () => {
            pet?.setPanel(null);
            pet?.setBubbleClose(null);
          },
        ],
      ],
      chat: [
        [
          'Send',
          'Отправить',
          async () => {
            try {
              const reply = await pet?.sendMessage(message.value);
              report(reply ?? '');
            } catch (error) {
              report(String(error));
            }
          },
        ],
        ['Cancel', 'Отменить', () => pet?.cancelMessage()],
      ],
      destroy: [
        [
          'Destroy',
          'Удалить экземпляр',
          () => {
            lifetime.abort();
            unsubscribe?.();
            pet?.destroy();
            pet = undefined;
            snapshot();
          },
        ],
        ['Create again', 'Создать заново', () => create?.()],
      ],
    };
    onBeforeUnmount(() => {
      disposed = true;
      observer?.disconnect();
      lifetime.abort();
      unsubscribe?.();
      pet?.destroy();
    });
    return () =>
      h(
        'section',
        {
          class: 'pet-demo',
          'aria-label': t('Interactive example', 'Интерактивный пример'),
        },
        [
          h('div', { class: 'demo-heading' }, [
            h('strong', t('Try it. It’s alive.', 'Попробуйте. Он живой.')),
            h('span', 'LIVE DEMO'),
          ]),
          h('div', { ref: stage, class: 'demo-stage' }),
          h(
            'p',
            { class: 'demo-hint' },
            t(
              'Drag the pet, or focus it and use arrow keys. Reduced motion follows your system settings.',
              'Перетаскивайте питомца или выберите его клавишей Tab и двигайте стрелками. Уменьшение движения учитывает настройки системы.',
            ),
          ),
          ['say', 'chat'].includes(props.topic)
            ? h('label', { class: 'demo-input' }, [
                t('Your message', 'Ваша реплика'),
                h('input', {
                  value: message.value,
                  maxlength: 160,
                  onInput: (event: Event) => {
                    message.value = (event.target as HTMLInputElement).value;
                  },
                }),
              ])
            : null,
          h(
            'div',
            { class: 'demo-controls' },
            [
              ...(actions[props.topic] ?? actions['create-pet'] ?? []),
              ...(!['create-pet', 'destroy'].includes(props.topic)
                ? [
                    ['Reset demo', 'Сбросить пример', () => create?.()] as [
                      string,
                      string,
                      () => void,
                    ],
                  ]
                : []),
            ].map(([en, ru, action]) =>
              h(
                'button',
                {
                  type: 'button',
                  disabled: !ready.value,
                  onClick: async () => {
                    try {
                      await action();
                      if (
                        !['events', 'preload', 'chat', 'add-state'].includes(
                          props.topic,
                        )
                      )
                        snapshot();
                    } catch (error) {
                      report(String(error));
                    }
                  },
                },
                t(en, ru),
              ),
            ),
          ),
          h(
            'output',
            { class: 'demo-output', 'aria-live': 'polite' },
            output.value || t('Preparing example…', 'Готовим пример…'),
          ),
        ],
      );
  },
});
