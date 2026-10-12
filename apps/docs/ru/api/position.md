# Позиция и привязка

Выберите координаты для свободного размещения или привязку к углу, чтобы питомец следовал за изменением доступной области. Координаты относятся к активному окружению, а не всегда к документу.

<PetDemo topic="position" />

## Сигнатура

```ts
pet.setPosition(position: PetPosition): void
```

| Параметр или метод           | Поведение                                                               |
| ---------------------------- | ----------------------------------------------------------------------- |
| `setPosition({ x, y })`      | Конечные координаты; вызывает move.                                     |
| `setAnchor(anchor, offset?)` | Отступ задаётся через { x, y }; привязка учитывает изменение окружения. |
| `position`                   | Доступный только для чтения снимок текущих x и y.                       |

## Как это работает

setPosition снимает привязку и ограничивает положение доступной областью. setAnchor завершает перетаскивание и возвращает адаптивное размещение. Доступны top-left, top-right, bottom-left, bottom-right и center. Отступ по умолчанию — 24px для углов и ноль для центра.

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
  pet.setAnchor('bottom-right', { x: 24, y: 24 });
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
    pet.setAnchor('bottom-right', { x: 24, y: 24 });
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
  pet.setAnchor('bottom-right', { x: 24, y: 24 });
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
