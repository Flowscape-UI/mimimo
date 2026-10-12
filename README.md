# Mimimo

[Documentation](https://flowscape-ui.github.io/mimimo/) · [Документация](https://flowscape-ui.github.io/mimimo/ru/)

![Mimimo - Little companions. Big personality.](https://raw.githubusercontent.com/Flowscape-UI/mimimo/main/docs/media/banner.png)

[![CI](https://github.com/Flowscape-UI/mimimo/actions/workflows/ci.yml/badge.svg)](https://github.com/Flowscape-UI/mimimo/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@flowscape-ui/mimimo?color=ffbe3d&logo=npm&label=npm%20version)](https://www.npmjs.com/package/@flowscape-ui/mimimo)
[![MIT](https://img.shields.io/badge/license-MIT-f477c5)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-first-35dff2)](packages/core)

**Little companions. Big personality.** Bring a friendly character to your website, app or creative tool. Built by **Flowscape Team**.

Mimimo is a framework-independent TypeScript library. Core handles placement, animation, interactions and messages; separate pet packs bring the artwork. Use Vanilla, React, Vue or your own framework without bundling pets you do not need.

## Meet the companions

| Mochi                                                                                                 | Byte                                                                                                | Flowy                                                                                                     |
| ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| ![Mochi celebrating](https://raw.githubusercontent.com/Flowscape-UI/mimimo/main/docs/media/mochi.gif) | ![Byte celebrating](https://raw.githubusercontent.com/Flowscape-UI/mimimo/main/docs/media/byte.gif) | ![Flowy drawing](https://raw.githubusercontent.com/Flowscape-UI/mimimo/main/docs/media/flowy-working.gif) |
| [A soft pink friend](packages/pet-mochi)                                                              | [A curious mint robot](packages/pet-byte)                                                           | [A pixel artist](packages/pet-flowy)                                                                      |

## Start small

```sh
npm install @flowscape-ui/mimimo @flowscape-ui/mimimo-pet-flowy
```

```ts
import { createPet } from '@flowscape-ui/mimimo';
import { flowy } from '@flowscape-ui/mimimo-pet-flowy';

// Run after your page or component mounts.
const pet = createPet({
  character: flowy,
  anchor: 'bottom-right',
  draggable: true,
});

pet.addReaction('click', 'happy');
pet.say({ title: "Hi, I'm Flowy!", description: 'Let’s make something.' });

// When the owning view unmounts:
// pet.destroy();
```

Imports are SSR-safe. Creating a pet requires a browser DOM. Flowy assets are included in its package and resolved by modern bundlers such as Vite; no CDN is required.

## What you can build

- **A page companion or a local widget.** Place pets across the viewport or inside a container with clipping and local stacking.
- **Reactions with personality.** Connect clicks, hover, dragging or application events to named animations.
- **Your own artwork.** Images, GIFs, video, frame sequences and uniform sprite sheets.
- **Helpful messages.** Plain-text bubbles, custom panels and optional asynchronous chat handlers.
- **A considerate interface.** Reduced-motion support, focusable controls and explicit hide, pause and cleanup methods. Add keyboard movement with your own controls when enabling dragging.

## Documentation

Run `pnpm dev:docs` to open the full interactive documentation at `http://127.0.0.1:5192`.

- [Getting started](apps/docs/guide/introduction.md) / [Русская документация](apps/docs/ru/guide/introduction.md)
- [API guide](apps/docs/guide/api.md) - 16 topics with live demos and Vanilla / React / Vue code tabs
- [Core reference](packages/core/README.md)
- [Local and global environments](apps/docs/guide/environments.md)
- [Release process](docs/RELEASING.md)

GitHub renders the prose and code. Run the documentation app to use its interactive examples.

## Packages

| Package                                                | Purpose                                            |
| ------------------------------------------------------ | -------------------------------------------------- |
| [`@flowscape-ui/mimimo`](packages/core)                | Framework-independent core, no bundled pet artwork |
| [`@flowscape-ui/mimimo-pet-mochi`](packages/pet-mochi) | Mochi: idle, happy, thinking, sleep                |
| [`@flowscape-ui/mimimo-pet-byte`](packages/pet-byte)   | Byte: idle, happy, thinking, sleep                 |
| [`@flowscape-ui/mimimo-pet-flowy`](packages/pet-flowy) | Flowy: idle, working, happy                        |

Packages are ESM with TypeScript declarations. Pet packs have a peer dependency on Mimimo. The workspace root, playground and documentation apps are private and are never published.

## Develop

Use **Node.js 24.11+** and **pnpm 10.33.2**.

```sh
pnpm install --frozen-lockfile
pnpm dev:playground
pnpm dev:docs
pnpm check
pnpm test:browser
pnpm test:docs
pnpm check:packages
```

`pnpm dev` starts both apps. `bun run dev:docs` and `bun run dev:playground` can invoke the same scripts; use pnpm for dependency management. Run `pnpm build` after changing library code to refresh workspace exports.

Browser tests use Microsoft Edge on Windows and Chromium on Linux. On Linux, install it with `pnpm --filter @mimimo/docs exec playwright install --with-deps chromium`.

The playground includes Mochi, Byte, Flowy, uploadable artwork, state editing and an event log. Files you upload remain local to the browser. Core stays independent of pet packs, frameworks and AI vendors.

## Contributing

[Open an issue](https://github.com/Flowscape-UI/mimimo/issues) with a reproduction or an idea. Keep new pet artwork in its own workspace. Run the checks and browser tests before proposing a change. Never place API keys in browser code; keep chat providers behind your server.

## License

[MIT](LICENSE) - code and included Mochi, Byte and Flowy artwork. Copyright 2026 Flowscape Team.
