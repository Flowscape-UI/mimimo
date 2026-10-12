# Position and anchors

Choose exact coordinates for a free-moving pet or an anchor for a pet that follows a corner when the available area changes. Coordinates are relative to the active environment, not always the document.

<PetDemo topic="position" />

## Signature

```ts
pet.setPosition(position: PetPosition): void
```

| Parameter or method          | Behavior                                          |
| ---------------------------- | ------------------------------------------------- |
| `setPosition({ x, y })`      | Finite coordinates; emits move.                   |
| `setAnchor(anchor, offset?)` | Offset uses { x, y }; follows environment resize. |
| `position`                   | Read-only snapshot of the current x and y.        |

## How it works

setPosition clears the anchor and clamps placement to the available area. setAnchor ends dragging and restores responsive positioning. Supported anchors are top-left, top-right, bottom-left, bottom-right and center. Default offset is 24px for corners and zero for center.

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
  pet.setAnchor('bottom-right', { x: 24, y: 24 });
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
    pet.setAnchor('bottom-right', { x: 24, y: 24 });
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
  pet.setAnchor('bottom-right', { x: 24, y: 24 });
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
