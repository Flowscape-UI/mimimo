# React to interactions

Use a reaction for a short celebration without losing the base mode. react takes a state name; addReaction maps a browser action to a state. Click React, or enable the click mapping and touch the pet itself.

<PetDemo topic="reactions" />

## Signature

```ts
pet.react(name: string): boolean
```

| Parameter or method          | Behavior                                       |
| ---------------------------- | ---------------------------------------------- |
| `react(name)`                | Temporarily triggers a state; returns success. |
| `stopReaction()`             | Clears the triggered reaction.                 |
| `addReaction(action, state)` | Maps hover, click or drag; returns Pet.        |
| `removeReaction(action)`     | Removes the mapping; returns Pet.              |

## How it works

Priority is drag, triggered reaction, hover, then base state. A completed non-looping reaction returns to the resolved state. Looping reactions need stopReaction. react returns false for an unregistered state; an empty name throws. A mapping may reference a state registered later.

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
  pet.addReaction('click', 'happy');
  pet.addReaction('hover', 'thinking');
  pet.react('happy');
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
    pet.addReaction('click', 'happy');
    pet.addReaction('hover', 'thinking');
    pet.react('happy');
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
  pet.addReaction('click', 'happy');
  pet.addReaction('hover', 'thinking');
  pet.react('happy');
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
