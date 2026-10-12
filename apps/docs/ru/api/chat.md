# Отправка сообщения

Подключите обработчик ответа через chat.onMessage при создании питомца. sendMessage вызывает его и показывает возвращённый текст. В примере работает локальное эхо без AI и сетевых запросов.

<PetDemo topic="chat" />

## Сигнатура

```ts
pet.sendMessage(message: string): Promise<string>
```

| Параметр или метод                    | Поведение                                                 |
| ------------------------------------- | --------------------------------------------------------- |
| `chat.onMessage(message, { signal })` | Обязательный асинхронный обработчик, возвращающий строку. |
| `sendMessage(message)`                | Возвращает ответ или отклоняется при ошибке/отмене.       |
| `cancelMessage()`                     | Отменяет текущий запрос.                                  |
| `chat.placeholder / errorMessage`     | Настройки подсказки ввода и текста ошибки.                |

## Как это работает

Пробелы по краям удаляются, пустая реплика отклоняется. Новая реплика отменяет предыдущий запрос. Передавайте signal в fetch; отмена также происходит при hide и destroy. Если есть thinking, оно используется во время ожидания. Ошибки вызывают messageerror и показывают chat.errorMessage; отмена отклоняет Promise без этой реплики. Ключи провайдеров храните на сервере.

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
    chat: {
      onMessage: async (message, { signal }) => {
        signal.throwIfAborted();
        return 'Local reply: ' + message;
      },
    },
  });
  void pet.sendMessage('Hello!').catch((error) => {
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
      chat: {
        onMessage: async (message, { signal }) => {
          signal.throwIfAborted();
          return 'Local reply: ' + message;
        },
      },
    });
    void pet.sendMessage('Hello!').catch((error) => {
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
    chat: {
      onMessage: async (message, { signal }) => {
        signal.throwIfAborted();
        return 'Local reply: ' + message;
      },
    },
  });
  void pet.sendMessage('Hello!').catch((error) => {
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
