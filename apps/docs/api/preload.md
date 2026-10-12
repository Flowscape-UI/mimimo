# Prepare media

Prepare an animation before you need to show it. Await preload before starting a carefully timed onboarding or celebration. Omitting names prepares all registered states; use a subset for large packs.

<PetDemo topic="preload" />

## Signature

```ts
pet.preload(names?: readonly string[], options?: PreloadOptions): Promise<void>
```

| Parameter or method           | Behavior                                   |
| ----------------------------- | ------------------------------------------ |
| `names`                       | Optional array of registered names.        |
| `signal`                      | AbortSignal owned by your component.       |
| `timeout`                     | Positive timeout in milliseconds.          |
| `loading / ready / loaderror` | State names; loaderror also carries Error. |

## How it works

Unknown names reject. timeout defaults to 15000ms and must be positive. Cancellation, destruction or a changed state registry can abort the request. Catch failures and keep the page usable. Loading events describe preparation, not download percentages.

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
  void pet
    .preload(['idle', 'happy'], { signal: lifetime.signal, timeout: 5000 })
    .then(() => {
      if (!lifetime.signal.aborted) pet.react('happy');
    })
    .catch((error) => {
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
    });
    void pet
      .preload(['idle', 'happy'], { signal: lifetime.signal, timeout: 5000 })
      .then(() => {
        if (!lifetime.signal.aborted) pet.react('happy');
      })
      .catch((error) => {
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
  });
  void pet
    .preload(['idle', 'happy'], { signal: lifetime.signal, timeout: 5000 })
    .then(() => {
      if (!lifetime.signal.aborted) pet.react('happy');
    })
    .catch((error) => {
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
