# Dragging

Let visitors pick up the character or pin it inside a scene. Switching draggable does not change its state or visibility. Drag the preview, disable dragging and try again.

<PetDemo topic="draggable" />

## Signature

```ts
pet.setDraggable(enabled: boolean): void
```

| Parameter or method     | Behavior                                      |
| ----------------------- | --------------------------------------------- |
| `setDraggable(boolean)` | Enables or disables pointer dragging.         |
| `draggable`             | Read-only current setting.                    |
| `dragstart / dragend`   | Coordinates; dragend also includes cancelled. |

## How it works

Disabling dragging ends an active drag. Pointer capture and listeners are owned by the pet and cleaned up on destroy. Arrow-key movement in this demo is application code using setPosition; add an equivalent keyboard control in your own interface.

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
  pet.setDraggable(true);
  pet.addReaction('drag', 'happy');
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
    pet.setDraggable(true);
    pet.addReaction('drag', 'happy');
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
  pet.setDraggable(true);
  pet.addReaction('drag', 'happy');
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
