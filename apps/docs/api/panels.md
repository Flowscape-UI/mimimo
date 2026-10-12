# Custom controls

Mount your own toolbar below the character. Mimimo hosts a real DOM element; your application owns its behavior. Use textContent for labels and clean up your own listeners.

<PetDemo topic="panels" />

## Signature

```ts
pet.setPanel(content: HTMLElement | null): void
```

| Parameter or method              | Behavior                                                  |
| -------------------------------- | --------------------------------------------------------- |
| `setPanel(element / null)`       | Replaces/removes the custom lower panel.                  |
| `setBubbleClose(element / null)` | Replaces/restores the bubble close control.               |
| `element`                        | Host element for classes, CSS variables and shadow parts. |

## How it works

setPanel moves the provided element into the pet; it does not clone it. Passing null restores built-in chat if configured. setBubbleClose installs a custom close button but does not attach its click handler. Use a framework-managed wrapper or explicitly dispose any framework root you mount into the panel.

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
  const button = document.createElement('button');
  button.textContent = 'High five!';
  button.addEventListener('click', () => pet.react('happy'), {
    signal: lifetime.signal,
  });
  pet.setPanel(button);
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
    const button = document.createElement('button');
    button.textContent = 'High five!';
    button.addEventListener('click', () => pet.react('happy'), {
      signal: lifetime.signal,
    });
    pet.setPanel(button);
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
  const button = document.createElement('button');
  button.textContent = 'High five!';
  button.addEventListener('click', () => pet.react('happy'), {
    signal: lifetime.signal,
  });
  pet.setPanel(button);
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

## Style the bubble

```ts
pet.element.classList.add('my-companion');
```

```css
.my-companion {
  --mimimo-accent: #ffbe3d;
  --mimimo-bubble-background: #fff5e6;
  --mimimo-bubble-color: #171419;
  --mimimo-bubble-muted: #5f5264;
  --mimimo-bubble-width: 240px;
  --mimimo-bubble-radius: 16px;
}
.my-companion::part(title) {
  font-weight: 800;
}
```
