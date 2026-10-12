# Перетаскивание

Разрешите посетителю двигать питомца или закрепите его в сцене. Изменение draggable не меняет состояние и видимость. Перетащите питомца, выключите перетаскивание и попробуйте снова.

<PetDemo topic="draggable" />

## Сигнатура

```ts
pet.setDraggable(enabled: boolean): void
```

| Параметр или метод      | Поведение                                          |
| ----------------------- | -------------------------------------------------- |
| `setDraggable(boolean)` | Разрешает или запрещает перетаскивание указателем. |
| `draggable`             | Текущее значение только для чтения.                |
| `dragstart / dragend`   | Координаты; dragend также содержит cancelled.      |

## Как это работает

Отключение завершает активное перетаскивание. Питомец управляет захватом указателя и слушателями и очищает их при destroy. Движение стрелками в демо добавлено кодом приложения через setPosition; добавьте аналогичное управление в своём интерфейсе.

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
  pet.setDraggable(true);
  pet.addReaction('drag', 'happy');
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
    pet.setDraggable(true);
    pet.addReaction('drag', 'happy');
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
  pet.setDraggable(true);
  pet.addReaction('drag', 'happy');
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
