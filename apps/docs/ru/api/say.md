# Реплики и облачка

Покажите приветствие, подсказку или поздравление. Строка создаёт простую реплику, объект — заголовок с описанием. Измените текст ниже, покажите его и сравните закрытие реплики с отключением всего облачка.

<PetDemo topic="say" />

## Сигнатура

```ts
pet.say(message: string | PetMessage): void
```

| Параметр или метод            | Поведение                                     |
| ----------------------------- | --------------------------------------------- |
| `say(string)`                 | Заменяет сообщение.                           |
| `say({ title, description })` | Заголовок обязателен, описание необязательно. |
| `dismissBubble()`             | Закрывает текущую реплику.                    |
| `setBubbleEnabled(boolean)`   | Управляет облачком, не скрывая питомца.       |

## Как это работает

Сообщения выводятся как текст, никогда как HTML. say заменяет текущую реплику и открывает облачко. setBubbleEnabled(false) сохраняет реплику; включение снова показывает открытое сообщение. dismissBubble закрывает его до нового say. Эти методы не скрывают персонажа.

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
  pet.say({ title: 'Nice work!', description: 'Your changes are saved.' });
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
    pet.say({ title: 'Nice work!', description: 'Your changes are saved.' });
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
  pet.say({ title: 'Nice work!', description: 'Your changes are saved.' });
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
