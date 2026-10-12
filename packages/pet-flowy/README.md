# @flowscape-ui/mimimo-pet-flowy

[Documentation](https://flowscape-ui.github.io/mimimo/) · [Документация](https://flowscape-ui.github.io/mimimo/ru/)

[![npm](https://img.shields.io/npm/v/@flowscape-ui/mimimo-pet-flowy?color=ffbe3d&logo=npm&label=npm%20version)](https://www.npmjs.com/package/@flowscape-ui/mimimo-pet-flowy) [![MIT](https://img.shields.io/badge/license-MIT-f477c5)](https://github.com/Flowscape-UI/mimimo/blob/main/LICENSE)

**Flowy** - A blue pixel artist who brings your ideas to life. An independent artwork pack for [Mimimo](https://www.npmjs.com/package/@flowscape-ui/mimimo), by Flowscape Team.

![Flowy preview](https://raw.githubusercontent.com/Flowscape-UI/mimimo/main/docs/media/flowy-idle.gif)

## Install

```sh
npm install @flowscape-ui/mimimo @flowscape-ui/mimimo-pet-flowy
```

## Use

```ts
import { createPet } from '@flowscape-ui/mimimo';
import { flowy } from '@flowscape-ui/mimimo-pet-flowy';

// Call after your page or component mounts.
const pet = createPet({ character: flowy, draggable: true });
pet.addReaction('click', 'happy');
pet.say('Hello, friend!');

// On unmount:
// pet.destroy();
```

Use React `useEffect` or Vue `onMounted` for creation and clean up the instance when the component unmounts. The definition import is SSR-safe and does not create a pet by itself.

## States

| State     | Behavior                  |
| --------- | ------------------------- |
| `idle`    | Looping rest animation    |
| `happy`   | One-shot celebration      |
| `working` | One-shot drawing sequence |

![Flowy drawing shapes](https://raw.githubusercontent.com/Flowscape-UI/mimimo/main/docs/media/flowy-working.gif)

![Flowy celebrating](https://raw.githubusercontent.com/Flowscape-UI/mimimo/main/docs/media/flowy-happy.gif)

The three transparent PNG sprite sheets ship in `dist/assets`. The exported definition resolves them relative to the module using `import.meta.url`. Vite and similar bundlers copy them into your application build. If you redistribute the JavaScript directly, keep its adjacent `assets` directory. Asset exports are also available as `@flowscape-ui/mimimo-pet-flowy/assets/flowy-idle.png`, `flowy-working.png` and `flowy-happy.png`.

Idle uses 16 frames at 4 fps; working uses 32 frames at 4 fps; happy uses 24 frames at 12 fps. Render at integer scales where possible for crisp pixels.

## Customize

```ts
pet.setSize(160, 160);
pet.setAnchor('bottom-right', { x: 24, y: 24 });
pet.react('happy');
pet.stopReaction();
```

The exported definition contains `id`, `name`, `width`, `height` and `animations`. Pass additional `states` to `createPet` to extend or override it. Core owns playback, positioning, interactions and reduced-motion behavior; this package only provides the character.

## Links

- [Repository](https://github.com/Flowscape-UI/mimimo)
- [API documentation](https://github.com/Flowscape-UI/mimimo/tree/main/apps/docs/api)
- [Report a problem](https://github.com/Flowscape-UI/mimimo/issues)

## License

MIT, including the bundled artwork. Copyright 2026 Flowscape Team. See [LICENSE](https://github.com/Flowscape-UI/mimimo/blob/main/packages/pet-flowy/LICENSE).

## Create your own pet

Use PNG, GIF, video, a regular sprite sheet or separate frames. See the [media format guide](https://flowscape-ui.github.io/mimimo/guide/media) and the [pet package tutorial](https://flowscape-ui.github.io/mimimo/guide/pet-pack), based on the included Mochi, Byte and Flowy packs.
