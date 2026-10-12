# Удаление экземпляра

Вызывайте destroy при размонтировании владельца. Метод убирает персонажа и панели, останавливает отрисовку, освобождает жесты и отменяет внутреннюю асинхронную работу. Повторный вызов безопасен.

<PetDemo topic="destroy" />

## Сигнатура

```ts
pet.destroy(): void
```

| Параметр или метод     | Поведение                                            |
| ---------------------- | ---------------------------------------------------- |
| `destroy()`            | Удаляет живой экземпляр; повторные вызовы безопасны. |
| `show() after destroy` | Не пересоздаёт экземпляр.                            |
| `createPet()`          | Создаёт новый независимый экземпляр.                 |

## Как это работает

Удалённый экземпляр нельзя вернуть через show — создайте нового питомца. Внешние таймеры, слушатели и корни фреймворков остаются ответственностью приложения. Примеры сначала отменяют свой контроллер, затем удаляют питомца: в очистке React effect и при размонтировании Vue.

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
  pet.say('I will clean up when this component unmounts.');
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
    pet.say('I will clean up when this component unmounts.');
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
  pet.say('I will clean up when this component unmounts.');
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
