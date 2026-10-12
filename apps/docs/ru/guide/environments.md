# Окружения

## Глобальный спутник

Глобальный питомец находится над страницей и использует координаты окна браузера.

::: code-group

```ts [Vanilla]
import { createPet } from 'mimimo';
import { mochi } from 'mimimo-pet-mochi';

// Call after your container mounts.
export function mountCompanion(container: HTMLElement) {
  const lifetime = new AbortController();
  const pet = createPet({
    character: mochi,

    anchor: 'bottom-right',
  });
  pet.addReaction('click', 'happy');
  pet.say('Hello, friend!');
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

      anchor: 'bottom-right',
    });
    pet.addReaction('click', 'happy');
    pet.say('Hello, friend!');
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

    anchor: 'bottom-right',
  });
  pet.addReaction('click', 'happy');
  pet.say('Hello, friend!');
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

В современных браузерах верхний слой позволяет питомцу оставаться интерактивным над обычными элементами, всплывающими панелями и модальными диалогами. Без Popover API используется z-index, который не перекрывает нативные модальные диалоги.

## Локальный спутник

<PetDemo topic="position" />

Передайте контейнер, чтобы ограничить питомца его внутренней областью.

```html
<div id="pet-home" style="height: 360px"></div>
```

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
  pet.addReaction('click', 'happy');
  pet.say('Hello, friend!');
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
    pet.addReaction('click', 'happy');
    pet.say('Hello, friend!');
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
  pet.addReaction('click', 'happy');
  pet.say('Hello, friend!');
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

Питомец следует за контейнером при прокрутке. Перемещение ограничено его границами. Графика и панели обрезаются по видимой области.

Локальный питомец расположен над обычным содержимым контейнера, но не попадает в верхний слой браузера. Он не перекрывает внешнюю навигацию и модальные диалоги. При необходимости Mimimo временно добавляет позиционирование и изоляцию, восстанавливая стили после удаления последнего питомца.

Координаты задаются в немасштабированных CSS-пикселях. Контейнеры с CSS-масштабированием не поддерживаются. Настраивайте оформление через `pet.element`, CSS-переменные и shadow parts.

## Очистка

Вызывайте `pet.destroy()` при размонтировании компонента, до удаления контейнера. Это освобождает медиа, наблюдателей, обработчики и незавершённые операции.
