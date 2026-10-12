import type { PetState } from '../types';

export function createRenderer(container: HTMLElement) {
  let cleanup = () => {};
  let updatePlayback = () => {};
  let displayed: HTMLImageElement | HTMLVideoElement | undefined;
  let releaseDisplayed = () => {};
  let paused = false;
  let reduced = false;

  function play(
    state: PetState,
    onComplete: () => void,
    onError: (error: Error) => void,
  ) {
    cleanup();
    const abort = new AbortController();
    let raf = 0;
    let elapsed = 0;
    let previous: number | undefined;
    let ended = false;
    let alive = true;
    let media: HTMLImageElement | HTMLVideoElement;
    let ready = false;
    const reuseSprite =
      state.type === 'sprite' &&
      displayed instanceof HTMLImageElement &&
      displayed.style.objectFit === 'fill' &&
      displayed.getAttribute('src') === state.path &&
      displayed.complete &&
      displayed.naturalWidth > 0;

    let release = () => {};
    function commit() {
      if (!alive || ready) return;
      ready = true;
      const releasePrevious = releaseDisplayed;
      // Keep the decoded atlas and its composited layer for same-sheet states.
      const replacing = displayed !== media;
      if (replacing) container.replaceChildren(media);
      displayed = media;
      releaseDisplayed = release;
      if (replacing) releasePrevious();
      updatePlayback();
    }
    const signal = abort.signal;
    const fail = () => {
      if (alive) onError(new Error('Could not load or play the state media.'));
    };

    if (state.type === 'video') {
      const video = document.createElement('video');
      media = video;
      video.muted = true;
      video.playsInline = true;
      video.preload = 'auto';
      video.addEventListener('loadeddata', commit, { signal });
      video.loop = state.loop ?? true;
      video.defaultPlaybackRate = state.speed ?? 1;
      video.playbackRate = state.speed ?? 1;
      video.addEventListener(
        'loadedmetadata',
        () => {
          video.playbackRate = state.speed ?? 1;
        },
        { signal },
      );
      if (state.poster) video.poster = state.poster;
      video.src = state.path;
      let attempt = 0;
      updatePlayback = () => {
        const token = ++attempt;
        if (paused || reduced) video.pause();
        else if (!ended) {
          void video.play().catch(() => {
            if (alive && token === attempt && !paused && !reduced) fail();
          });
        }
      };
      video.addEventListener(
        'ended',
        () => {
          if (!alive || ended) return;
          ended = true;
          onComplete();
        },
        { signal },
      );
      release = () => {
        video.pause();
        video.removeAttribute('src');
        video.load();
      };
      cleanup = () => {
        alive = false;
        attempt++;
        abort.abort();
        video.pause();
        if (displayed !== video) release();
      };
    } else {
      const image =
        reuseSprite && displayed instanceof HTMLImageElement
          ? displayed
          : document.createElement('img');
      media = image;
      image.alt = '';
      image.draggable = false;
      image.addEventListener(
        'load',
        () => {
          // Decode off-screen, then swap atomically without an empty paint.
          void image
            .decode()
            .then(commit)
            .catch(() => {
              if (alive && !ready) fail();
            });
        },
        { signal },
      );
      let lastFrame = -1;
      const timeline =
        'frames' in state || state.type === 'sprite' ? state : undefined;
      const count = timeline
        ? 'frames' in timeline
          ? timeline.frames.length
          : timeline.frameCount
        : 1;
      function render(index: number) {
        if (lastFrame === index) return;
        lastFrame = index;
        if ('frames' in state) image.src = state.frames[index] ?? '';
        else if (state.type === 'sprite') {
          if (!image.hasAttribute('src')) image.src = state.path;
          const cell = (state.startFrame ?? 0) + index;
          image.style.width = state.columns * 100 + '%';
          image.style.height = state.rows * 100 + '%';
          image.style.maxWidth = 'none';
          image.style.objectFit = 'fill';
          image.style.transform = `translate(${(-(cell % state.columns) * 100) / state.columns}%, ${(-Math.floor(cell / state.columns) * 100) / state.rows}%)`;
        } else image.src = state.path;
      }
      function tick(time: number) {
        if (!alive || !ready || paused || reduced || !timeline || ended) return;
        if (previous !== undefined) elapsed += time - previous;
        previous = time;
        const index = Math.floor(
          (elapsed * timeline.fps * (timeline.speed ?? 1)) / 1000,
        );
        if (timeline.loop === false && index >= count) {
          ended = true;
          render(count - 1);
          onComplete();
          return;
        }
        render(index % count);
        raf = requestAnimationFrame(tick);
      }
      updatePlayback = () => {
        cancelAnimationFrame(raf);
        previous = undefined;
        if (state.type === 'gif') {
          // Native GIF decoding cannot be paused or retimed. Unload it while suspended.
          if (paused || reduced) {
            if (!state.poster) commit();
            if (state.poster) image.src = state.poster;
            else image.removeAttribute('src');
            image.style.visibility = state.poster ? 'visible' : 'hidden';
          } else {
            image.style.visibility = 'visible';
            image.src = state.path;
          }
        } else if (ready && !paused && !reduced && timeline && !ended)
          raf = requestAnimationFrame(tick);
      };
      if (state.type !== 'gif') render(0);
      release = () => image.removeAttribute('src');
      cleanup = () => {
        alive = false;
        abort.abort();
        cancelAnimationFrame(raf);
        if (displayed !== image) release();
      };
    }
    media.addEventListener('error', fail, { signal });
    if (reuseSprite) commit();
    else updatePlayback();
  }
  return {
    play,
    setPaused(value: boolean, reducedMotion: boolean) {
      paused = value;
      reduced = reducedMotion;
      updatePlayback();
    },
    destroy() {
      cleanup();
      updatePlayback = () => {};
      releaseDisplayed();
      releaseDisplayed = () => {};
      displayed = undefined;
      container.replaceChildren();
    },
  };
}
