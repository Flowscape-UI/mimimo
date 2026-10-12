# Your own character

Define reusable artwork separately from the live instance. A definition contains an id, display name, dimensions and named animations. You can share it between many pets without making core depend on your character pack.

<PetDemo topic="define-pet" />

## Signature

```ts
definePet(definition: PetDefinition): PetDefinition
```

| Parameter or method | Behavior                               |
| ------------------- | -------------------------------------- |
| `id / name`         | Non-empty strings.                     |
| `width / height`    | Finite positive numbers.               |
| `animations`        | At least one named PetState.           |
| `initialState`      | Optional starting state in animations. |

## How it works

definePet validates the definition and returns the same object with its inferred TypeScript type. It does not create DOM or fetch media. An empty animation registry, invalid dimensions or an unknown initialState throws. The demo uses the Mochi definition.

## Use it in your project

Choose your stack. Each example includes setup and cleanup. For Vanilla, pass a mounted container at least 360px tall and keep the returned cleanup. Method names are identical across frameworks.

::: code-group

```ts [Vanilla]
import { createPet, definePet } from 'mimimo';
import { mochi } from 'mimimo-pet-mochi';

// Call after your container mounts.
export function mountCompanion(container: HTMLElement) {
  const myCharacter = definePet({
    ...mochi,
    id: 'my-companion',
    name: 'My companion',
    width: 112,
    height: 112,
    initialState: 'idle',
  });
  const lifetime = new AbortController();
  const pet = createPet({
    character: myCharacter,
    container,
    anchor: 'center',
  });
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
import { createPet, definePet } from 'mimimo';
import { mochi } from 'mimimo-pet-mochi';

export default function Companion() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = host.current;
    if (!container) return;
    const myCharacter = definePet({
      ...mochi,
      id: 'my-companion',
      name: 'My companion',
      width: 112,
      height: 112,
      initialState: 'idle',
    });
    const lifetime = new AbortController();
    const pet = createPet({
      character: myCharacter,
      container,
      anchor: 'center',
    });
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
import { createPet, definePet } from 'mimimo';
import { mochi } from 'mimimo-pet-mochi';
const host = ref<HTMLElement | null>(null);
let cleanup: (() => void) | undefined;
onMounted(() => {
  const container = host.value;
  if (!container) return;
  const myCharacter = definePet({
    ...mochi,
    id: 'my-companion',
    name: 'My companion',
    width: 112,
    height: 112,
    initialState: 'idle',
  });
  const lifetime = new AbortController();
  const pet = createPet({
    character: myCharacter,
    container,
    anchor: 'center',
  });
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
