# PNG, GIF, видео и спрайт-листы

Питомец может быть статичной PNG-картинкой, анимированным GIF, видео, картой кадров (sprite sheet) или последовательностью отдельных изображений. Разные состояния одного питомца могут использовать разные форматы.

## Попробуйте форматы

Нажмите кнопки под питомцем: это настоящий экземпляр Mimimo. PNG и GIF показывают Mochi, спрайт-лист - Flowy, Video - демонстрационный клип. При включённом уменьшении движения анимация останавливается; GIF заменяется постером.

<MediaDemo />

## Как описать состояние

Пути в примерах предполагают файлы в `public/pets/` вашего приложения. Для пакета используйте относительные URL, как в [руководстве по созданию питомца](./pet-pack).

::: code-group

```ts [PNG]
const idle = { type: 'image', path: '/pets/idle.png' } as const;
```

```ts [GIF]
const happy = {
  type: 'gif',
  path: '/pets/happy.gif',
  poster: '/pets/idle.png',
} as const;
```

```ts [Video]
const working = {
  type: 'video',
  path: '/pets/working.webm',
  poster: '/pets/idle.png',
  loop: true,
  speed: 1,
} as const;
```

```ts [Sprite sheet]
const idle = {
  type: 'sprite',
  path: '/pets/idle-sheet.png',
  columns: 4,
  rows: 4,
  startFrame: 0,
  frameCount: 16,
  fps: 8,
  loop: true,
} as const;
```

```ts [Frames]
const idle = {
  type: 'frames',
  frames: ['/pets/idle-1.png', '/pets/idle-2.png'],
  fps: 4,
  loop: true,
} as const;
```

:::

## Особенности форматов

| Формат      | Что нужно знать                                                                                                                                                                  |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PNG / image | Одно изображение без таймлайна. Прозрачный фон удобен для персонажа.                                                                                                             |
| GIF         | Скорость и повторения записаны в файле. `fps`, `speed` и `loop` не применяются. Передайте `poster` для уменьшения движения и паузы.                                              |
| Video       | Без звука, воспроизводится внутри страницы. Используйте поддерживаемый браузером WebM или MP4; прозрачность зависит от кодека и браузера. `loop: false` завершает клип один раз. |
| Sprite      | Равномерная сетка одинаковых кадров. Порядок слева направо, затем следующая строка. `startFrame` начинается с нуля.                                                              |
| Frames      | Массив URL в порядке воспроизведения; можно использовать PNG или SVG, как в Mochi и Byte.                                                                                        |

Для сетки 4 × 4 доступно 16 кадров. `startFrame + frameCount` не должно превышать число ячеек. `fps` допускает значения больше 0 и до 60, `speed` - от 0.25 до 4. Карты атласов с произвольными прямоугольниками и JSON-координатами не поддерживаются: подготовьте равномерную сетку или массив кадров.

GIF не сообщает библиотеке о конце цикла, поэтому для управляемой одноразовой реакции используйте видео, спрайт-лист или Frames с `loop: false`.

## Подключить к питомцу

```ts
import { createPet } from '@flowscape-ui/mimimo';

// Run after the host element mounts.
const pet = createPet({
  states: {
    idle: { type: 'image', path: '/pets/idle.png' },
    happy: {
      type: 'sprite',
      path: '/pets/happy-sheet.png',
      columns: 4,
      rows: 4,
      frameCount: 16,
      fps: 12,
      loop: false,
    },
  },
  initialState: 'idle',
  reactions: { click: 'happy' },
});
// On unmount: pet.destroy();
```

[Vanilla, React, Vue](../api/create-pet) · [addState](../api/add-state) · [preload](../api/preload)
