import type { PetState } from '@flowscape-ui/mimimo';
import { mochi } from '@flowscape-ui/mimimo-pet-mochi';

export function testStates(): Record<string, PetState> {
  const sheet =
    'data:image/svg+xml,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">' +
        mochi.animations.happy.frames
          .map(
            (url, i) =>
              `<svg x="${(i % 2) * 128}" y="${Math.floor(i / 2) * 128}" width="128" height="128" viewBox="0 0 128 128">${decodeURIComponent(url.split(',')[1] ?? '').replace(/^<svg[^>]*>|<\/svg>$/g, '')}</svg>`,
          )
          .join('') +
        '</svg>',
    );
  return {
    rest: { frames: mochi.animations.idle.frames, fps: 2 },
    curious: { ...mochi.animations.thinking },
    grabbed: { path: mochi.animations.happy.frames[1] },
    jump: { ...mochi.animations.happy, fps: 8, speed: 1, loop: false },
    sheet: {
      type: 'sprite',
      path: sheet,
      columns: 2,
      rows: 2,
      startFrame: 1,
      frameCount: 3,
      fps: 4,
      loop: false,
    },
    gif: {
      type: 'gif',
      path: '/sample.gif',
      poster: mochi.animations.idle.frames[0],
    },
    clip: { type: 'video', path: '/sample.webm', speed: 1.5, loop: true },
  };
}
