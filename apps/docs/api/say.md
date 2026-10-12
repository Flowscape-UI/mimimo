# Messages and bubbles

Show a greeting, a hint or a celebration. A string creates a simple message. An object adds a title and description. Edit the text below, say it, then compare dismissing a message with disabling the whole bubble.

<PetDemo topic="say" />

## Signature

```ts
pet.say(message: string | PetMessage): void
```

| Parameter or method           | Behavior                                          |
| ----------------------------- | ------------------------------------------------- |
| `say(string)`                 | Replaces the message.                             |
| `say({ title, description })` | Title required, description optional.             |
| `dismissBubble()`             | Closes the current message.                       |
| `setBubbleEnabled(boolean)`   | Controls bubble rendering without hiding the pet. |

## How it works

Messages are plain text, never HTML. say replaces the current message and opens the bubble. setBubbleEnabled(false) retains the message; enabling it shows an open message again. dismissBubble closes it until a new say call. None of these methods hides the character.

## Use it in your project

Choose your stack. Each example includes setup and cleanup. For Vanilla, pass a mounted container at least 360px tall and keep the returned cleanup. Method names are identical across frameworks.

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

[All capabilities](../guide/api) · [Environments](../guide/environments)
