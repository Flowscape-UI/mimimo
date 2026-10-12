# Свои элементы управления

Разместите собственную панель под персонажем. Mimimo принимает настоящий DOM-элемент, а приложение отвечает за его поведение. Используйте textContent для подписей и очищайте свои слушатели.

<PetDemo topic="panels" />

## Сигнатура

```ts
pet.setPanel(content: HTMLElement | null): void
```

| Параметр или метод               | Поведение                                                    |
| -------------------------------- | ------------------------------------------------------------ |
| `setPanel(element / null)`       | Заменяет/удаляет нижнюю панель.                              |
| `setBubbleClose(element / null)` | Заменяет/восстанавливает кнопку закрытия облачка.            |
| `element`                        | Корневой элемент для классов, CSS-переменных и shadow parts. |

## Как это работает

setPanel перемещает переданный элемент внутрь питомца, не копируя его. null возвращает встроенный чат, если он настроен. setBubbleClose добавляет кнопку закрытия, но не её обработчик. Для компонентов фреймворка управляйте обёрткой и явно освобождайте смонтированный корень.

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
  const button = document.createElement('button');
  button.textContent = 'High five!';
  button.addEventListener('click', () => pet.react('happy'), {
    signal: lifetime.signal,
  });
  pet.setPanel(button);
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
    const button = document.createElement('button');
    button.textContent = 'High five!';
    button.addEventListener('click', () => pet.react('happy'), {
      signal: lifetime.signal,
    });
    pet.setPanel(button);
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
  const button = document.createElement('button');
  button.textContent = 'High five!';
  button.addEventListener('click', () => pet.react('happy'), {
    signal: lifetime.signal,
  });
  pet.setPanel(button);
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

## Оформление облачка

```ts
pet.element.classList.add('my-companion');
```

```css
.my-companion {
  --mimimo-accent: #ffbe3d;
  --mimimo-bubble-background: #fff5e6;
  --mimimo-bubble-color: #171419;
  --mimimo-bubble-muted: #5f5264;
  --mimimo-bubble-width: 240px;
  --mimimo-bubble-radius: 16px;
}
.my-companion::part(title) {
  font-weight: 800;
}
```
