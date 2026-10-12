# Pause and resume

Pause playback without removing the character. Resume returns control to the normal playback rules. A static image will look the same; use the animated Mochi preview to see the difference.

<PetDemo topic="playback" />

## Signature

```ts
pet.pause(): void; pet.resume(): void
```

| Parameter or method | Behavior                        |
| ------------------- | ------------------------------- |
| `pause()`           | Sets the manual pause flag.     |
| `resume()`          | Clears the manual pause flag.   |
| `paused`            | Read-only manual pause boolean. |

## How it works

resume does not override reduced-motion preferences, a hidden pet or a hidden browser tab. paused reports the explicit manual pause, not every reason playback may currently be stopped. GIF timing comes from the file, so prefer a still poster when motion must be reduced.

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
  pet.pause();
  // Call pet.resume() when your interface is ready.
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
    pet.pause();
    // Call pet.resume() when your interface is ready.
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
  pet.pause();
  // Call pet.resume() when your interface is ready.
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
