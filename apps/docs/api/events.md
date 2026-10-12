# Listen to events

Connect the companion to your application through typed events. on returns an unsubscribe function. Click the pet, unsubscribe, and click again to see the difference in the event output.

<PetDemo topic="events" />

## Signature

```ts
pet.on(event, listener): () => void
```

| Parameter or method                        | Behavior                                    |
| ------------------------------------------ | ------------------------------------------- |
| `click`                                    | No payload.                                 |
| `statechange / animationend`               | { state }.                                  |
| `move / resize`                            | { x, y } or { width, height }.              |
| `dragstart / dragend`                      | { x, y }; dragend adds cancelled.           |
| `loading / ready / loaderror`              | { states }; loaderror adds error.           |
| `messagestart / messageend / messageerror` | message; end adds reply, error adds error.  |
| `mediaerror`                               | { state, error } for playback media errors. |

## How it works

Keep unsubscribe functions for listeners that should end before the pet is destroyed. Avoid calling play unconditionally inside statechange: that can create a feedback loop. Event payloads are passed directly to the callback, not as DOM CustomEvent objects.

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
  });
  const off = pet.on('click', () => pet.say('Click received!'));
  lifetime.signal.addEventListener('abort', off, { once: true });
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
    const off = pet.on('click', () => pet.say('Click received!'));
    lifetime.signal.addEventListener('abort', off, { once: true });
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
  const off = pet.on('click', () => pet.say('Click received!'));
  lifetime.signal.addEventListener('abort', off, { once: true });
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
