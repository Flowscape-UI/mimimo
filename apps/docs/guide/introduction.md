# Meet Mimimo

Mimimo adds animated companions to websites. It is a framework-independent TypeScript library by Flowscape, built for small moments of personality: a friendly guide, a celebration or a quiet companion.

## Your artwork, your personality

Use an image, GIF, video, frame sequence or sprite sheet. Name your states yourself, then connect them to clicks, hovers, dragging or your own application events.

Mochi and Byte are independent pet packs. You only include the characters you need.

## One entry point

<PetDemo topic="create-pet" />

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
  pet.say('Hello, friend!');
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
    pet.say('Hello, friend!');
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
  pet.say('Hello, friend!');
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

```sh
npm install mimimo mimimo-pet-mochi
```

## Fits your application

Choose a [global or local environment](./environments). Customize messages with CSS variables and shadow parts. Mount your own toolbar or chat input. An AI backend is optional and stays under your control.

Explore the [API overview](./api) or try a companion on the [homepage](/).
