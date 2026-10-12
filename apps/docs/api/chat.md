# Send a message

Connect a reply handler through chat.onMessage when creating the pet. sendMessage calls that handler and shows the returned text. The preview is a local echo, with no AI or network request.

<PetDemo topic="chat" />

## Signature

```ts
pet.sendMessage(message: string): Promise<string>
```

| Parameter or method                   | Behavior                                              |
| ------------------------------------- | ----------------------------------------------------- |
| `chat.onMessage(message, { signal })` | Required async handler returning a string.            |
| `sendMessage(message)`                | Returns the reply or rejects on failure/cancellation. |
| `cancelMessage()`                     | Aborts the active request.                            |
| `chat.placeholder / errorMessage`     | Customize input and failure copy.                     |

## How it works

Whitespace is trimmed and empty messages reject. A new message cancels the previous request. Forward the provided signal to fetch; cancellation also happens on hide or destroy. If thinking exists it is used while waiting. Real errors emit messageerror and show chat.errorMessage; cancelled requests reject without that error message. Keep provider credentials on your server.

## Use it in your project

Choose your stack. Each example includes setup and cleanup. For Vanilla, pass a mounted container at least 360px tall and keep the returned cleanup. Method names are identical across frameworks.

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

[All capabilities](../guide/api) · [Environments](../guide/environments)
