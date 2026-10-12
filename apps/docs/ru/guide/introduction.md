# Знакомьтесь: Mimimo

Mimimo добавляет анимированных спутников на сайты. Это библиотека TypeScript от Flowscape, независимая от фреймворков: персонаж может приветствовать пользователя, реагировать на действия и отмечать маленькие победы.

## Ваш персонаж

Используйте изображения, GIF, видео, последовательности кадров или спрайт-листы. Создавайте состояния и связывайте их с кликами, наведением, перетаскиванием или событиями приложения.

Mochi и Byte поставляются отдельными пакетами. Подключайте только нужных персонажей.

## Первый спутник

<PetDemo topic="create-pet" />

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

```sh
npm install @flowscape-ui/mimimo @flowscape-ui/mimimo-pet-mochi
```

Выберите [окружение](./environments), изучите [компоненты](/ru/components/) или откройте [обзор API](./api).
