# Добавление состояний

Состояние описывает графику, а не компонент фреймворка. Зарегистрируйте состояния при создании или добавляйте позже. Повторное имя заменяет графику; первое состояние запускается автоматически, если питомец ещё ничего не показывает.

<PetDemo topic="add-state" />

## Сигнатура

```ts
pet.addState(name: string, state: PetState): Pet
```

| Параметр или метод      | Поведение                                                                                      |
| ----------------------- | ---------------------------------------------------------------------------------------------- |
| `addState(name, state)` | Добавляет/заменяет; возвращает Pet для цепочек вызовов.                                        |
| `hasState(name)`        | Возвращает boolean.                                                                            |
| `getStates()`           | Возвращает новый массив имён состояний.                                                        |
| `removeState(name)`     | Возвращает результат удаления; при удалении резервного выбирается первое оставшееся состояние. |

## Как это работает

Изображению нужен path. Последовательности кадров — непустой массив frames и fps. Спрайт-листу — columns, rows, frameCount и fps; startFrame по умолчанию 0, диапазон должен помещаться в сетку. Видео использует path и необязательный poster. Скорость GIF задаётся файлом; добавьте poster для уменьшенного движения. fps кадров и спрайтов — (0, 60], speed — [0.25, 4].

## Пример для вашего проекта

Выберите вкладку своего стека. Это полный пример с созданием и очисткой экземпляра. В Vanilla передайте смонтированный контейнер высотой хотя бы 360px и сохраните функцию очистки. Имена методов одинаковы во всех фреймворках.

::: code-group

```ts [Vanilla]
import { createPet } from '@flowscape-ui/mimimo';
import { mochi } from '@flowscape-ui/mimimo-pet-mochi';

// Call after your container mounts.
export function mountCompanion(container: HTMLElement) {
  const lifetime = new AbortController();
  const pet = createPet({
    character: mochi,
    container,
    anchor: 'center',
  });
  pet.addState('wave', {
    type: 'image',
    path: mochi.animations.happy.frames[0],
  });
  pet.play('wave');
  console.log(pet.getStates());
  return () => {
    lifetime.abort();
    pet.destroy();
  };
}
// Keep the returned cleanup and call it when the view is removed.
```

```tsx [React]
'use client';
import { useEffect, useRef } from 'react';
import { createPet } from '@flowscape-ui/mimimo';
import { mochi } from '@flowscape-ui/mimimo-pet-mochi';

export default function Companion() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = host.current;
    if (!container) return;
    const lifetime = new AbortController();
    const pet = createPet({
      character: mochi,
      container,
      anchor: 'center',
    });
    pet.addState('wave', {
      type: 'image',
      path: mochi.animations.happy.frames[0],
    });
    pet.play('wave');
    console.log(pet.getStates());
    return () => {
      lifetime.abort();
      pet.destroy();
    };
  }, []);
  return <div ref={host} style={{ height: 360, position: 'relative' }} />;
}
```

```vue [Vue]
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { createPet } from '@flowscape-ui/mimimo';
import { mochi } from '@flowscape-ui/mimimo-pet-mochi';
const host = ref<HTMLElement | null>(null);
let cleanup: (() => void) | undefined;
onMounted(() => {
  const container = host.value;
  if (!container) return;
  const lifetime = new AbortController();
  const pet = createPet({
    character: mochi,
    container,
    anchor: 'center',
  });
  pet.addState('wave', {
    type: 'image',
    path: mochi.animations.happy.frames[0],
  });
  pet.play('wave');
  console.log(pet.getStates());
  cleanup = () => {
    lifetime.abort();
    pet.destroy();
  };
});
onBeforeUnmount(() => cleanup?.());
</script>

<template>
  <div ref="host" style="height: 360px; position: relative" />
</template>
```

:::

[Все возможности](../guide/api) · [Окружения](../guide/environments)

## Форматы медиа

Замените пути ниже адресами своих файлов. Для спрайтов все ячейки должны иметь одинаковый размер.

::: code-group

```ts [Image]
pet.addState('portrait', { type: 'image', path: '/pets/portrait.png' });
```

```ts [Frames]
pet.addState('walk', {
  frames: ['/pets/walk-1.png', '/pets/walk-2.png'],
  fps: 8,
  loop: true,
  speed: 1,
});
```

```ts [Sprite]
pet.addState('celebrate', {
  type: 'sprite',
  path: '/pets/celebrate.png',
  columns: 4,
  rows: 4,
  frameCount: 16,
  startFrame: 0,
  fps: 12,
  loop: false,
});
```

```ts [Video]
pet.addState('dance', {
  type: 'video',
  path: '/pets/dance.webm',
  poster: '/pets/dance-still.png',
  loop: true,
  speed: 1,
});
```

```ts [GIF]
pet.addState('wave', {
  type: 'gif',
  path: '/pets/wave.gif',
  poster: '/pets/wave-still.png',
});
```

:::
