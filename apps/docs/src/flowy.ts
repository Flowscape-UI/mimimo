import type { SpriteState } from 'mimimo';
const idle: SpriteState = {
  type: 'sprite',
  path: new URL('./assets/flowy-idle.png', import.meta.url).href,
  columns: 4,
  rows: 4,
  frameCount: 16,
  fps: 4,
  loop: true,
};
export const flowyStates = {
  idle,
  working: {
    ...idle,
    path: new URL('./assets/flowy-working.png', import.meta.url).href,
    columns: 8,
    rows: 4,
    frameCount: 32,
    fps: 4,
    loop: false,
  },
  happy: {
    ...idle,
    path: new URL('./assets/flowy-happy.png', import.meta.url).href,
    columns: 8,
    rows: 3,
    frameCount: 24,
    fps: 12,
    loop: false,
  },
};
