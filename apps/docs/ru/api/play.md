# Запуск состояния

Используйте play для основного режима: отдыха, сна или размышления. В отличие от временной реакции он меняет базовое состояние. Переключайте сон и отдых в демо и следите за текущим состоянием.

<PetDemo topic="play" />

## Сигнатура

```ts
pet.play(state: string): void
```

| Параметр или метод      | Поведение                                                    |
| ----------------------- | ------------------------------------------------------------ |
| `play(name)`            | Меняет базовое состояние и перезапускает воспроизведение.    |
| `setDefaultState(name)` | Задаёт резервное состояние; неизвестное имя вызывает ошибку. |
| `state`                 | Доступное только для чтения имя отображаемого состояния.     |

## Как это работает

play сбрасывает запущенную реакцию. Реакция перетаскивания или наведения всё ещё может иметь приоритет. Неизвестное имя приводит к резервному состоянию. Незациленная базовая анимация после завершения возвращается к резервной. setDefaultState меняет резервное состояние, но не запускает его немедленно.

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
  pet.setDefaultState('idle');
  pet.play('sleep');
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
    pet.setDefaultState('idle');
    pet.play('sleep');
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
  pet.setDefaultState('idle');
  pet.play('sleep');
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
