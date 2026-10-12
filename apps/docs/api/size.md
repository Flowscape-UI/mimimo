# Resize a companion

Change the rendered dimensions without recreating the companion or replacing its artwork. Use this for compact widgets and larger onboarding scenes. Try both sizes below.

<PetDemo topic="size" />

## Signature

```ts
pet.setSize(width: number, height: number): void
```

| Parameter or method | Behavior                       |
| ------------------- | ------------------------------ |
| `width`             | Positive width in CSS pixels.  |
| `height`            | Positive height in CSS pixels. |
| `resize event`      | Payload: { width, height }.    |

## How it works

Both values must be finite and greater than zero. They control the character, not a fixed size for its speech bubble. Resizing ends the current drag, recalculates placement and emits resize. Keep the dimensions within your container on narrow screens.

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
  pet.setSize(96, 96);
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
    pet.setSize(96, 96);
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
  pet.setSize(96, 96);
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
