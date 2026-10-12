# Build your own pet pack

Mochi, Byte and Flowy are separate packages containing character definitions and artwork. Importing a pack creates no DOM and starts no animation. The application creates a live instance with `createPet`.

## 1. Prepare artwork

Choose [PNG, GIF, video, sprite sheets or separate frames](./media). Keep canvas dimensions and the character's pivot consistent across states to prevent jumps. This example needs a still `idle.png` and a `happy.png` sheet with 16 equal frames in a 4 × 4 grid.

## 2. Package structure

Source artwork lives in `assets`; the build puts it beside the JavaScript in `dist/assets`:

```text
my-pet/
  src/index.ts
  assets/idle.png
  assets/happy.png
  dist/index.js
  dist/index.d.ts
  dist/assets/idle.png
  dist/assets/happy.png
  package.json
  README.md
  LICENSE
```

## 3. Export the definition

Like Flowy, the pack imports only types from core. `new URL(..., import.meta.url)` resolves files relative to the module instead of the website root. These paths target the built `dist/index.js`.

```ts
// src/index.ts
import type { PetDefinition } from '@flowscape-ui/mimimo';

export const myPet = {
  id: 'my-pet',
  name: 'My pet',
  width: 128,
  height: 128,
  initialState: 'idle',
  animations: {
    idle: {
      type: 'image',
      path: new URL('./assets/idle.png', import.meta.url).href,
    },
    happy: {
      type: 'sprite',
      path: new URL('./assets/happy.png', import.meta.url).href,
      columns: 4,
      rows: 4,
      frameCount: 16,
      fps: 12,
      loop: false,
    },
  },
} as const satisfies PetDefinition;
```

## 4. Build the package and its assets

Replace `@your-scope/my-pet` with your own name. The example stays private until you choose licenses for code and artwork and decide to publish. Build with TypeScript and tsdown:

```json
{
  "name": "@your-scope/my-pet",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "sideEffects": false,
  "files": ["dist", "README.md", "LICENSE"],
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" },
    "./assets/*": "./dist/assets/*"
  },
  "peerDependencies": { "@flowscape-ui/mimimo": "^0.1.0" },
  "scripts": { "build": "tsdown" }
}
```

```sh
pnpm add -D typescript tsdown @flowscape-ui/mimimo
```

```ts
// tsdown.config.ts
import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  platform: 'browser',
  target: 'es2022',
  dts: true,
  clean: true,
  copy: [{ from: 'assets', to: 'dist' }],
});
```

Run `pnpm build`, then `pnpm pack`. Check that the tarball includes `dist/index.js`, declarations and both PNGs in `dist/assets`. Install the `.tgz` in a test application and check Network for missing assets. When serving modules directly, preserve the adjacent `assets` directory.

## 5. Use the character

`definePet` validates the definition at runtime. In React create the instance in `useEffect`; in Vue use `onMounted`. Call `destroy` on unmount. See [complete framework examples](../api/create-pet).

```ts
import { createPet, definePet } from '@flowscape-ui/mimimo';
import { myPet } from '@your-scope/my-pet';

// Call after the component mounts.
const pet = createPet({
  character: definePet(myPet),
  draggable: true,
  reactions: { click: 'happy' },
});
pet.say('Hello!');
// On unmount: pet.destroy();
```

## How our packs work

- [Mochi](https://github.com/Flowscape-UI/mimimo/tree/main/packages/pet-mochi) and [Byte](https://github.com/Flowscape-UI/mimimo/tree/main/packages/pet-byte) generate SVG frames and export `frames` with `fps`. No separate image files are needed.
- [Flowy](https://github.com/Flowscape-UI/mimimo/tree/main/packages/pet-flowy) ships three PNG sheets, `idle`, `working` and `happy` states, and copies artwork during its build. Use it as the example for external assets.

Core must not import your pet pack. The application chooses the character, messages and reactions; the pack owns only its definition and artwork.
