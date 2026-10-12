# PNG, GIF, video and sprite sheets

A pet can use a still PNG, an animated GIF, a video, a sprite sheet or a sequence of separate images. Different states of one character can use different formats.

## Try the formats

The buttons control a real Mimimo instance. PNG and GIF show Mochi, Sprite shows Flowy, and Video plays a sample clip. Reduced motion stops playback and replaces the GIF with its poster.

<MediaDemo />

## Describe a state

These paths assume files in your application's `public/pets/` directory. For a reusable package, use relative URLs as shown in [Build a pet pack](./pet-pack).

::: code-group

```ts [PNG]
const idle = { type: 'image', path: '/pets/idle.png' } as const;
```

```ts [GIF]
const happy = {
  type: 'gif',
  path: '/pets/happy.gif',
  poster: '/pets/idle.png',
} as const;
```

```ts [Video]
const working = {
  type: 'video',
  path: '/pets/working.webm',
  poster: '/pets/idle.png',
  loop: true,
  speed: 1,
} as const;
```

```ts [Sprite sheet]
const idle = {
  type: 'sprite',
  path: '/pets/idle-sheet.png',
  columns: 4,
  rows: 4,
  startFrame: 0,
  frameCount: 16,
  fps: 8,
  loop: true,
} as const;
```

```ts [Frames]
const idle = {
  type: 'frames',
  frames: ['/pets/idle-1.png', '/pets/idle-2.png'],
  fps: 4,
  loop: true,
} as const;
```

:::

## Format details

| Format      | Behavior                                                                                                                           |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| PNG / image | A still image without a timeline. Transparent backgrounds work well for characters.                                                |
| GIF         | Timing and repetition belong to the file. `fps`, `speed` and `loop` do not apply. Supply a `poster` for reduced motion and pause.  |
| Video       | Muted inline playback. Use browser-supported WebM or MP4; transparency depends on the codec and browser. `loop: false` plays once. |
| Sprite      | An evenly spaced grid of equal-sized frames, read left to right then down. `startFrame` is zero-based.                             |
| Frames      | An ordered array of image URLs, including PNG or SVG, as used by Mochi and Byte.                                                   |

A 4 × 4 sheet holds 16 frames. `startFrame + frameCount` must fit the grid. `fps` must be greater than 0 and at most 60; `speed` ranges from 0.25 to 4. Arbitrarily packed atlases with JSON rectangles are not supported: export a regular grid or separate frames.

GIF does not expose cycle completion to Mimimo. For a controlled one-shot reaction, use video, sprite sheets or Frames with `loop: false`.

## Connect it to a pet

```ts
import { createPet } from '@flowscape-ui/mimimo';

// Run after the host element mounts.
const pet = createPet({
  states: {
    idle: { type: 'image', path: '/pets/idle.png' },
    happy: {
      type: 'sprite',
      path: '/pets/happy-sheet.png',
      columns: 4,
      rows: 4,
      frameCount: 16,
      fps: 12,
      loop: false,
    },
  },
  initialState: 'idle',
  reactions: { click: 'happy' },
});
// On unmount: pet.destroy();
```

[Vanilla, React, Vue](../api/create-pet) · [addState](../api/add-state) · [preload](../api/preload)
