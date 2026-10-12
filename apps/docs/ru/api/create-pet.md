# Создание питомца

Создавайте один экземпляр на смонтированный компонент или страницу. Передайте пакет персонажа, локальный контейнер и нужный размер. Возвращаемый Pet позволяет управлять питомцем.

<PetDemo topic="create-pet" />

## Сигнатура

```ts
createPet(options?: PetOptions): Pet
```

| Параметр или метод   | Поведение                                                                                |
| -------------------- | ---------------------------------------------------------------------------------------- |
| `character / states` | Описание персонажа или именованные состояния.                                            |
| `width / height`     | Положительный размер в пикселях; без пакета по умолчанию 128.                            |
| `container / bounds` | Локальный элемент; bounds по умолчанию container при наличии контейнера, иначе viewport. |
| `initialState`       | Имя зарегистрированного состояния; иначе настройка пакета, idle или первое состояние.    |
| `bubble`             | Boolean или { enabled, closeButton }; облачко включено по умолчанию.                     |

## Как это работает

Без container питомец живёт в окне браузера. С container он ограничен этим элементом и его контекстом наложения. Задайте контейнеру высоту. Импорт безопасен при SSR, но createPet нужно вызывать только в браузере.

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

[Все возможности](../guide/api) · [Окружения](../guide/environments)
