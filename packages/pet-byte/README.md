# mimimo-pet-byte

[![npm](https://img.shields.io/npm/v/mimimo-pet-byte?color=ffbe3d)](https://www.npmjs.com/package/mimimo-pet-byte) [![MIT](https://img.shields.io/badge/license-MIT-f477c5)](https://github.com/Flowscape-UI/mimimo/blob/main/LICENSE)

**Byte** - A curious mint robot for your interface. An independent artwork pack for [Mimimo](https://www.npmjs.com/package/mimimo), by Flowscape Team.

![Byte preview](https://raw.githubusercontent.com/Flowscape-UI/mimimo/main/docs/media/byte.gif)

## Install

```sh
npm install mimimo mimimo-pet-byte
```

## Use

```ts
import { createPet } from 'mimimo';
import { byte } from 'mimimo-pet-byte';

// Call after your page or component mounts.
const pet = createPet({ character: byte, draggable: true });
pet.addReaction('click', 'happy');
pet.say('Hello, friend!');

// On unmount:
// pet.destroy();
```

Use React `useEffect` or Vue `onMounted` for creation and clean up the instance when the component unmounts. The definition import is SSR-safe and does not create a pet by itself.

## States

| State      | Behavior                  |
| ---------- | ------------------------- |
| `idle`     | Looping rest animation    |
| `happy`    | One-shot celebration      |
| `thinking` | Looping thought animation |
| `sleep`    | Looping sleep animation   |

Artwork is embedded as SVG data URLs. No separate asset directory, CDN or network fetch is required.

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

MIT, including the bundled artwork. Copyright 2026 Flowscape Team. See [LICENSE](https://github.com/Flowscape-UI/mimimo/blob/main/packages/pet-byte/LICENSE).
