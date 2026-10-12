# Предзагрузка медиа

Подготовьте анимацию до её показа. Дождитесь preload перед синхронизированным приветствием или поздравлением. Без names загружаются все зарегистрированные состояния; для больших пакетов выбирайте только нужные.

<PetDemo topic="preload" />

## Сигнатура

```ts
pet.preload(names?: readonly string[], options?: PreloadOptions): Promise<void>
```

| Параметр или метод            | Поведение                                        |
| ----------------------------- | ------------------------------------------------ |
| `names`                       | Необязательный массив зарегистрированных имён.   |
| `signal`                      | AbortSignal, которым управляет ваш компонент.    |
| `timeout`                     | Положительный таймаут в миллисекундах.           |
| `loading / ready / loaderror` | Имена состояний; loaderror также содержит Error. |

## Как это работает

Неизвестные имена вызывают отклонение Promise. timeout по умолчанию 15000 мс и должен быть положительным. Отмена, удаление питомца или изменение набора состояний могут прервать запрос. Обрабатывайте ошибки, сохраняя работоспособность страницы. События загрузки не сообщают процент скачивания.

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
  void pet
    .preload(['idle', 'happy'], { signal: lifetime.signal, timeout: 5000 })
    .then(() => {
      if (!lifetime.signal.aborted) pet.react('happy');
    })
    .catch((error) => {
      if (!lifetime.signal.aborted) console.error(error);
    });
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
    void pet
      .preload(['idle', 'happy'], { signal: lifetime.signal, timeout: 5000 })
      .then(() => {
        if (!lifetime.signal.aborted) pet.react('happy');
      })
      .catch((error) => {
        if (!lifetime.signal.aborted) console.error(error);
      });
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
  void pet
    .preload(['idle', 'happy'], { signal: lifetime.signal, timeout: 5000 })
    .then(() => {
      if (!lifetime.signal.aborted) pet.react('happy');
    })
    .catch((error) => {
      if (!lifetime.signal.aborted) console.error(error);
    });
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
