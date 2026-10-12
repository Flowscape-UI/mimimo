# mimimo

**Tiny companions. Big personality.** A project by Flowscape.

Framework-independent TypeScript companions for websites. One entry point, your artwork, your state names.

## Workspace

- `packages/core` - `mimimo`: public API and media renderers, without pet assets.
- `packages/pet-mochi` - `mimimo-pet-mochi`: original pink companion.
- `packages/pet-byte` - `mimimo-pet-byte`: original mint robot.
- `apps/playground` - Vite demo, asset lab and browser tests.
- `apps/docs` - VitePress documentation with local search, a presentation homepage, live companions and starter code.

Each pet is a separate package: installing one does not download the others. Package names are provisional and all packages remain private. Nothing has been published.

## Develop

Node.js 24.19+ and pnpm 10.33.2:

```sh
pnpm install
pnpm dev
pnpm dev:playground
pnpm dev:docs
pnpm check
pnpm test:browser
pnpm test:docs
```

Use `pnpm dev:playground` or `pnpm dev:docs` to start one app, or `pnpm dev` for both. The same root scripts can be launched with `bun run dev:playground` and `bun run dev:docs`. Each command builds the required workspace dependencies before starting its app. Keep using pnpm to install and manage workspace dependencies.

Open the documentation homepage with `pnpm dev:docs` at http://127.0.0.1:5192. Pages live in `apps/docs/guide`; the custom theme lives in `apps/docs/.vitepress/theme`. The homepage demo initializes on client mount and disposes on navigation. Its demo runs the actual public API and uses the generated Mint sprite sheet plus the independent Mochi and Byte packs.

The playground is a single development sandbox: select Mochi, Byte, test assets or an empty custom pet; upload or drop files; edit and remove states; configure reactions; test say(), chat and lifecycle controls. The preview shows the current state, the last API call and an event log. Only relevant fields are shown for each media format. Uploaded files stay local and are reset on preset changes or page reload.

The legacy /media.html URL opens the same sandbox with test assets selected. Size, dragging, centering and state changes use the live public API. Switching presets or chat configuration recreates the instance. Example code uses /assets filenames as placeholders for your hosted files; blob URLs are session-local.

Turborepo builds dependencies before the playground. After library changes, run `pnpm build` to refresh its distribution files. Browser tests use installed Microsoft Edge on Windows; elsewhere install Chromium using `pnpm --filter @mimimo/playground exec playwright install chromium`.

## Create and add states

```ts
import { createPet } from 'mimimo';

const pet = createPet({ name: 'My companion', width: 128, height: 128 });

pet.addState('relax', {
  frames: ['/pet/relax-1.webp', '/pet/relax-2.webp'],
  fps: 4,
});

pet.addState('celebrate', {
  type: 'sprite',
  path: '/pet/celebrate.png',
  columns: 4,
  rows: 2,
  frameCount: 8,
  fps: 12,
  speed: 1,
  loop: false,
});

pet.play('celebrate');
pet.say('We did it!');
```

`createPet()` also works without options. The first registered state starts automatically and becomes the fallback. Any non-empty name works, including `idle`, `iddle` or your own name. No reserved state name is required. Re-registering a name replaces it and immediately restarts it if it is playing. `addState` returns the pet for chaining.

Alternatively supply states at creation:

```ts
const pet = createPet({
  initialState: 'rest',
  states: {
    rest: { path: '/pet/rest.png' },
    wave: { frames: ['/pet/wave-1.png', '/pet/wave-2.png'], fps: 8 },
  },
});
```

An explicit `initialState` must exist at creation. Without it, `idle` is preferred if present; otherwise the first initial state is used. Unknown names passed to `play` fall back to the initial state. A non-looping state returns to that fallback after completion; if the fallback itself is non-looping, it holds its final frame.

## Media formats

### Image sequence

```ts
pet.addState('walk', {
  type: 'frames', // Optional when frames is supplied.
  frames: ['/pet/1.png', '/pet/2.png', '/pet/3.png'],
  fps: 12,
  speed: 1.5,
  loop: true,
});
```

`fps` is required for frame sequences and sprite sheets (greater than 0, at most 60). `speed` defaults to 1 and supports 0.25 through 4. Effective frame rate is `fps * speed`. Looping defaults to true.

### Sprite sheet / texture atlas

```ts
pet.addState('run', {
  type: 'sprite',
  path: '/pet/atlas.png',
  columns: 8,
  rows: 4,
  startFrame: 8,
  frameCount: 8,
  fps: 12,
});
```

Mimimo divides the whole image into equal cells. Frames are counted from zero, left to right, then top to bottom. `startFrame` defaults to 0. `frameCount` excludes unused cells and must fit in the grid together with the offset. Transparent pixels remain transparent. Image dimensions should divide evenly into the grid. Packed atlases with unequal rectangles or padding are not supported yet.

### Video

```ts
pet.addState('dance', {
  type: 'video',
  path: '/pet/dance.webm',
  poster: '/pet/dance-still.png',
  speed: 1.25,
  loop: false,
});
```

Video plays muted and inline. Supported codecs and transparency depend on the browser: a transparent source does not guarantee alpha support in every browser. Media failures and blocked playback emit `mediaerror`. For reliable cross-browser transparency, prefer PNG/WebP frame sequences or sprite sheets.

### GIF

```ts
pet.addState('sleep', {
  type: 'gif',
  path: '/pet/sleep.gif',
  poster: '/pet/sleep-still.png',
});
```

GIF timing and repetition come from the file. Native browser GIF rendering does not expose speed, precise pausing or completion events, so these options are intentionally absent from `GifState`. Hiding a GIF unloads it; showing it restarts playback. Reduced motion shows `poster`, or hides the GIF if none is supplied. Use frames, sprites or video when you need controlled timing. Use `type: 'gif'` explicitly, including for blob URLs.

### Static image

```ts
pet.addState('portrait', { path: '/pet/portrait.svg' });
```

The optional type is `image`. Image states are intended for still images.

## Ready-made pets

```ts
import { createPet } from 'mimimo';
import { mochi } from 'mimimo-pet-mochi';

const pet = createPet({ character: mochi });
pet.addState('my-state', { path: '/extra.png' });
pet.play('happy');
```

Mochi and Byte provide idle, happy, thinking and sleep. Pet packs use the same `PetState` format. `definePet` remains an optional validation helper for reusable packs; you do not need it for `createPet().addState(...)`. A definition contains id, name, width, height, animations and optional initialState. States passed directly to createPet override preset states with the same name.

## Reactions

Map actions on the companion to any of your registered state names:

```ts
const pet = createPet({ character: mochi });

pet.addReaction('hover', 'thinking');
pet.addReaction('click', 'happy');
pet.addReaction('drag', 'sleep');

// Replace or remove individual reactions:
pet.addReaction('hover', 'my-custom-state');
pet.removeReaction('hover');
```

Or configure them at creation:

```ts
const pet = createPet({
  character: mochi,
  reactions: {
    hover: 'thinking',
    click: 'happy',
    drag: 'sleep',
  },
});
```

- Reactions apply to the character button, not its chat or close button.
- Hover also responds to visible keyboard focus. Touch does not synthesize a hover reaction.
- Drag begins after more than 4 pixels of movement, and only when dragging is enabled. Releasing a drag does not trigger the click reaction.
- Priority is drag, then manual/click reaction, then hover, then the base state. Ending hover or drag restores the applicable lower-priority state from its beginning.
- Hover/drag states with loop: false hold their final frame while the gesture remains active.
- A completed non-looping click reaction returns to hover if active, otherwise the base state. A looping, GIF or static click reaction persists until play(), replacing/removing the click reaction, or hiding the pet.
- play() changes the base state and clears the active manual/click reaction. Active drag/hover reactions still take priority until those gestures end.
- State names can be registered after their reactions. A missing target is dormant, not an error. Adding that state activates an ongoing hover/drag reaction.
- addReaction() returns the pet for chaining and replaces the previous reaction for that action. removeReaction() removes it immediately.
- Hiding, losing window focus or changing to an inactive tab clears temporary reactions and cancels dragging. destroy() removes all input listeners.

Call `pet.react('sleep')` to temporarily play a state directly, without registering an action mapping. Use `pet.stopReaction()` to end a looping reaction. Try these controls in the playground.

## Events and lifecycle

```ts
const off = pet.on('click', () => pet.say('Hello!'));
pet.on('move', ({ x, y }) => console.log(x, y));
pet.on('dragstart', ({ x, y }) => console.log('Drag started', x, y));
pet.on('dragend', ({ cancelled }) => console.log('Drag ended', cancelled));
pet.on('statechange', ({ state }) => console.log(state));
pet.on('mediaerror', ({ state, error }) => console.error(state, error));

pet.hide();
pet.show();
off();
pet.destroy();
```

`state` is the current state name (empty before adding one). `element` is the host DOM element. `destroy()` is idempotent and cleans up listeners, media, animation frames, pointer capture and pending chat.

Imports are SSR safe. Call createPet on the client after mounting. Options include character, states, initialState, id, name, width, height, container, draggable, position and chat. Default size is 128 x 128. Positions use viewport coordinates by default and container-local coordinates when a container is provided. Set bounds to viewport to override this. Global pets use the browser top layer; local pets use the same layer with explicit container clipping. Destroy a local pet before removing its container.

Frames and video pause while hidden or when the tab is inactive, and respect reduced motion. The library handles state definitions as immutable snapshots. External URLs use normal browser loading and caching. Revoke your own blob URLs after they are no longer used; Mimimo does not own caller-provided URLs.

## Optional chat

```ts
const pet = createPet({
  character: mochi,
  chat: {
    async onMessage(message, { signal }) {
      const response = await fetch('/api/companion', {
        method: 'POST',
        signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      if (!response.ok) throw new Error('Request failed');
      const data: { reply: string } = await response.json();
      return data.reply;
    },
  },
});
```

Keep API keys on your server. Mimimo renders replies as text, prevents duplicate submissions, cancels on hide/destroy and ignores late replies. Chat uses a state named thinking if available and restores the previous state afterward unless another state was selected. The playground uses a local demo reply, not AI.

## Styling

Set `--mimimo-accent`, `--mimimo-background` and `--mimimo-text` on the pet host to style its interface. Artwork belongs to your state assets.

The playground uses the published `@flowscape-ui/dsk` numeric and single-file upload controls, styled for its dark development UI. Text fields and multi-file frame selection use native inputs. DSK is a playground dependency only; it is not included in the Mimimo core or pet packages.

### Pet panels

Message bubbles support `say({ title, description })`, `setBubbleEnabled()` and `dismissBubble()`. Mount a custom toolbar or composer with `setPanel(element)` and your own dismiss control with `setBubbleClose(button)`. CSS variables and shadow parts expose the presentation. See [the panel API and styling examples](packages/core/README.md#message-and-action-panels).

### Runtime API

Change a live instance with `setSize()`, `setPosition()`, `setAnchor()` and `setDraggable()`. Manage states with `getStates()`, `hasState()`, `removeState()` and `setDefaultState()`. Use `preload()`, `pause()`, `resume()` and the `animationend` event to coordinate playback. Custom composers can call `sendMessage()` and `cancelMessage()`. See [runtime control, loading and chat](packages/core/README.md#runtime-control-and-direct-reactions) for contracts and examples.
