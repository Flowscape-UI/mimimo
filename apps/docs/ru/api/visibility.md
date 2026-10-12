# Скрытие и показ

Временно скройте питомца без пересоздания. Это удобно, когда посетителю нужен спокойный интерфейс или приложение переходит в режим сосредоточенной работы. show возвращает тот же экземпляр.

<PetDemo topic="visibility" />

## Сигнатура

```ts
pet.hide(): void; pet.show(): void
```

| Параметр или метод | Поведение                                             |
| ------------------ | ----------------------------------------------------- |
| `hide()`           | Временно скрывает графику и панели.                   |
| `show()`           | Снова показывает существующий экземпляр.              |
| `element.hidden`   | Флаг видимости DOM; для изменений используйте методы. |

## Как это работает

hide останавливает жесты, отменяет текущий запрос чата и обновляет воспроизведение. show пересчитывает положение. Эти методы не удаляют экземпляр. При удалении страницы используйте destroy, а для одной реплики — dismissBubble.

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
  pet.hide();
  // Call pet.show() from your own reveal control.
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
    pet.hide();
    // Call pet.show() from your own reveal control.
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
  pet.hide();
  // Call pet.show() from your own reveal control.
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
