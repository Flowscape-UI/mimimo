# Register media states

An animation state describes artwork, not a framework component. Register states at creation or add them later. Reusing a name replaces its media; the first state starts automatically when the pet has no current state.

<PetDemo topic="add-state" />

## Signature

```ts
pet.addState(name: string, state: PetState): Pet
```

| Parameter or method     | Behavior                                                                                      |
| ----------------------- | --------------------------------------------------------------------------------------------- |
| `addState(name, state)` | Adds/replaces; returns Pet for chaining.                                                      |
| `hasState(name)`        | Returns boolean.                                                                              |
| `getStates()`           | Returns a new array of registered names.                                                      |
| `removeState(name)`     | Returns whether a state was removed; removing the fallback selects the first remaining state. |

## How it works

Image uses a path. Frames use a non-empty frames array and fps. Sprite sheets need columns, rows, frameCount and fps; startFrame defaults to 0 and the range must fit the grid. Video uses path and optional poster. GIF timing belongs to the file; provide a poster for reduced motion. Frame/sprite fps must be in (0, 60], speed in [0.25, 4].

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
  pet.addState('wave', {
    type: 'image',
    path: mochi.animations.happy.frames[0],
  });
  pet.play('wave');
  console.log(pet.getStates());
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
    pet.addState('wave', {
      type: 'image',
      path: mochi.animations.happy.frames[0],
    });
    pet.play('wave');
    console.log(pet.getStates());
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
  pet.addState('wave', {
    type: 'image',
    path: mochi.animations.happy.frames[0],
  });
  pet.play('wave');
  console.log(pet.getStates());
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

## Media formats

Replace these paths with your own files. Sprite sheet cells must all have the same dimensions.

::: code-group

```ts [Image]
pet.addState('portrait', { type: 'image', path: '/pets/portrait.png' });
```

```ts [Frames]
pet.addState('walk', {
  frames: ['/pets/walk-1.png', '/pets/walk-2.png'],
  fps: 8,
  loop: true,
  speed: 1,
});
```

```ts [Sprite]
pet.addState('celebrate', {
  type: 'sprite',
  path: '/pets/celebrate.png',
  columns: 4,
  rows: 4,
  frameCount: 16,
  startFrame: 0,
  fps: 12,
  loop: false,
});
```

```ts [Video]
pet.addState('dance', {
  type: 'video',
  path: '/pets/dance.webm',
  poster: '/pets/dance-still.png',
  loop: true,
  speed: 1,
});
```

```ts [GIF]
pet.addState('wave', {
  type: 'gif',
  path: '/pets/wave.gif',
  poster: '/pets/wave-still.png',
});
```

:::
