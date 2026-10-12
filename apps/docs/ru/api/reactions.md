# Реакции на действия

Реакция подходит для короткой эмоции без потери основного режима. react получает имя состояния; addReaction связывает действие пользователя с состоянием. Нажмите «Порадоваться» или включите реакцию на клик и нажмите на самого питомца.

<PetDemo topic="reactions" />

## Сигнатура

```ts
pet.react(name: string): boolean
```

| Параметр или метод           | Поведение                                        |
| ---------------------------- | ------------------------------------------------ |
| `react(name)`                | Временно запускает состояние; возвращает успех.  |
| `stopReaction()`             | Сбрасывает запущенную реакцию.                   |
| `addReaction(action, state)` | Связывает hover, click или drag; возвращает Pet. |
| `removeReaction(action)`     | Удаляет привязку; возвращает Pet.                |

## Как это работает

Приоритет: перетаскивание, запущенная реакция, наведение, базовое состояние. Завершённая незaцикленная реакция возвращает выбранное по приоритету состояние. Для зацикленной используйте stopReaction. react возвращает false для незарегистрированного состояния; пустое имя вызывает ошибку. Состояние для привязки можно зарегистрировать позже.

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
  pet.addReaction('hover', 'thinking');
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
    pet.addReaction('hover', 'thinking');
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
  pet.addReaction('hover', 'thinking');
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
