# Пауза и продолжение

Поставьте воспроизведение на паузу, не убирая персонажа. resume возвращает управление обычным правилам воспроизведения. Статичное изображение не изменится; разницу видно на анимированном Mochi.

<PetDemo topic="playback" />

## Сигнатура

```ts
pet.pause(): void; pet.resume(): void
```

| Параметр или метод | Поведение                               |
| ------------------ | --------------------------------------- |
| `pause()`          | Включает ручную паузу.                  |
| `resume()`         | Снимает ручную паузу.                   |
| `paused`           | Boolean ручной паузы только для чтения. |

## Как это работает

resume не отменяет уменьшение движения, скрытие питомца или неактивность вкладки. paused отражает явную ручную паузу, а не все причины остановки. Время GIF задаётся файлом; для уменьшенного движения используйте статичный poster.

## Пример для вашего проекта

Выберите вкладку своего стека. Это полный пример с созданием и очисткой экземпляра. В Vanilla передайте смонтированный контейнер высотой хотя бы 360px и сохраните функцию очистки. Имена методов одинаковы во всех фреймворках.

::: code-group

```ts [Vanilla]
import { createPet } from 'mimimo';
import { mochi } from 'mimimo-pet-mochi';

// Call after your container mounts.
export function mountCompanion(container: HTMLElement) {
  const lifetime = new AbortController();
  const pet = createPet({
    character: mochi,
    container,
    anchor: 'center',
  });
  pet.pause();
  // Call pet.resume() when your interface is ready.
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
import { createPet } from 'mimimo';
import { mochi } from 'mimimo-pet-mochi';

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
    pet.pause();
    // Call pet.resume() when your interface is ready.
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
import { createPet } from 'mimimo';
import { mochi } from 'mimimo-pet-mochi';
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
  pet.pause();
  // Call pet.resume() when your interface is ready.
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
