# Подписка на события

Свяжите питомца с приложением через типизированные события. on возвращает функцию отписки. Нажмите на питомца, отпишитесь и нажмите снова, чтобы увидеть разницу в журнале.

<PetDemo topic="events" />

## Сигнатура

```ts
pet.on(event, listener): () => void
```

| Параметр или метод                         | Поведение                                            |
| ------------------------------------------ | ---------------------------------------------------- |
| `click`                                    | Без данных.                                          |
| `statechange / animationend`               | { state }.                                           |
| `move / resize`                            | { x, y } или { width, height }.                      |
| `dragstart / dragend`                      | { x, y }; у dragend есть cancelled.                  |
| `loading / ready / loaderror`              | { states }; у loaderror есть error.                  |
| `messagestart / messageend / messageerror` | message; завершение добавляет reply, ошибка — error. |
| `mediaerror`                               | { state, error } при ошибке воспроизведения.         |

## Как это работает

Сохраняйте функции отписки для слушателей, которые нужны меньше времени, чем сам питомец. Не вызывайте play безусловно внутри statechange: это может создать цикл. Данные передаются непосредственно в callback, а не в DOM CustomEvent.

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
  const off = pet.on('click', () => pet.say('Click received!'));
  lifetime.signal.addEventListener('abort', off, { once: true });
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
    const off = pet.on('click', () => pet.say('Click received!'));
    lifetime.signal.addEventListener('abort', off, { once: true });
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
  const off = pet.on('click', () => pet.say('Click received!'));
  lifetime.signal.addEventListener('abort', off, { once: true });
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
