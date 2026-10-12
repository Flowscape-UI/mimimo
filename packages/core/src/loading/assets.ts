import type { PetState } from '../types';

export function loadAssets(
  states: readonly PetState[],
  signal: AbortSignal,
  timeout: number,
): Promise<void> {
  const assets = new Map<string, 'image' | 'video'>();
  for (const state of states) {
    if ('frames' in state)
      for (const path of state.frames) assets.set(path, 'image');
    else assets.set(state.path, state.type === 'video' ? 'video' : 'image');
    if ('poster' in state && state.poster) assets.set(state.poster, 'image');
  }
  return Promise.all(
    [...assets].map(
      ([path, type]) =>
        new Promise<void>((resolve, reject) => {
          if (signal.aborted) {
            reject(signal.reason);
            return;
          }
          const media =
            type === 'video'
              ? document.createElement('video')
              : document.createElement('img');
          const successEvent = type === 'video' ? 'loadeddata' : 'load';
          let settled = false;
          const timer = window.setTimeout(
            () => finish(new Error('Asset loading timed out: ' + path)),
            timeout,
          );
          const onAbort = () => finish(signal.reason);
          const onLoad = () => finish();
          const onError = () =>
            finish(new Error('Could not load asset: ' + path));
          function finish(error?: unknown) {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            signal.removeEventListener('abort', onAbort);
            media.removeEventListener(successEvent, onLoad);
            media.removeEventListener('error', onError);
            media.removeAttribute('src');
            if (media instanceof HTMLVideoElement) {
              media.pause();
              media.load();
            }
            if (error !== undefined) reject(error);
            else resolve();
          }
          signal.addEventListener('abort', onAbort, { once: true });
          media.addEventListener(successEvent, onLoad, { once: true });
          media.addEventListener('error', onError, { once: true });
          if (media instanceof HTMLVideoElement) {
            media.muted = true;
            media.preload = 'auto';
          }
          media.src = path;
        }),
    ),
  ).then(() => {});
}
