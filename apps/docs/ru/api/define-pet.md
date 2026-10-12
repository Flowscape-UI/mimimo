# Свой персонаж

Храните описание графики отдельно от живого экземпляра. В нём находятся id, имя, размеры и именованные анимации. Одно описание можно использовать для нескольких питомцев, не связывая ядро с пакетом персонажа.

<PetDemo topic="define-pet" />

## Сигнатура

```ts
definePet(definition: PetDefinition): PetDefinition
```

| Параметр или метод | Поведение                                         |
| ------------------ | ------------------------------------------------- |
| `id / name`        | Непустые строки.                                  |
| `width / height`   | Конечные положительные числа.                     |
| `animations`       | Хотя бы одно именованное PetState.                |
| `initialState`     | Необязательное начальное состояние из animations. |

## Как это работает

definePet проверяет описание и возвращает тот же объект с сохранением выведенного TypeScript-типа. Он не создаёт DOM и не загружает медиа. Пустой набор анимаций, неверные размеры или неизвестный initialState вызывают ошибку. В демо используется описание Mochi.

## Пример для вашего проекта

Выберите вкладку своего стека. Это полный пример с созданием и очисткой экземпляра. В Vanilla передайте смонтированный контейнер высотой хотя бы 360px и сохраните функцию очистки. Имена методов одинаковы во всех фреймворках.

::: code-group

```ts [Vanilla]
import { createPet, definePet } from 'mimimo';
import { mochi } from 'mimimo-pet-mochi';

// Call after your container mounts.
export function mountCompanion(container: HTMLElement) {
  const myCharacter = definePet({
    ...mochi,
    id: 'my-companion',
    name: 'My companion',
    width: 112,
    height: 112,
    initialState: 'idle',
  });
  const lifetime = new AbortController();
  const pet = createPet({
    character: myCharacter,
    container,
    anchor: 'center',
  });
  pet.react('happy');
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
import { createPet, definePet } from 'mimimo';
import { mochi } from 'mimimo-pet-mochi';

export default function Companion() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = host.current;
    if (!container) return;
    const myCharacter = definePet({
      ...mochi,
      id: 'my-companion',
      name: 'My companion',
      width: 112,
      height: 112,
      initialState: 'idle',
    });
    const lifetime = new AbortController();
    const pet = createPet({
      character: myCharacter,
      container,
      anchor: 'center',
    });
    pet.react('happy');
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
import { createPet, definePet } from 'mimimo';
import { mochi } from 'mimimo-pet-mochi';
const host = ref<HTMLElement | null>(null);
let cleanup: (() => void) | undefined;
onMounted(() => {
  const container = host.value;
  if (!container) return;
  const myCharacter = definePet({
    ...mochi,
    id: 'my-companion',
    name: 'My companion',
    width: 112,
    height: 112,
    initialState: 'idle',
  });
  const lifetime = new AbortController();
  const pet = createPet({
    character: myCharacter,
    container,
    anchor: 'center',
  });
  pet.react('happy');
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
