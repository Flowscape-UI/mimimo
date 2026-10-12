type Action = 'idle' | 'working' | 'happy';
const animations = {
  idle: { path: 'flowy-idle-v2-padded.png', columns: 4, frames: 16, fps: 4 },
  working: { path: 'flowy-working-v1.png', columns: 8, frames: 32, fps: 4 },
  happy: { path: 'flowy-happy-v2.png', columns: 8, frames: 24, fps: 12 },
};
const canvas = document.querySelector<HTMLCanvasElement>('canvas')!;
const context = canvas.getContext('2d')!;
context.imageSmoothingEnabled = false;
const label = document.querySelector<HTMLOutputElement>('output')!;
const pause = document.querySelector<HTMLInputElement>('#pause')!;
const hide = document.querySelector<HTMLInputElement>('#hide')!;
const controls = [
  ...document.querySelectorAll<HTMLButtonElement>('button[data-action]'),
];
const lifetime = new AbortController();
const signal = lifetime.signal;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const images = {} as Record<Action, HTMLImageElement>;
let state: Action = 'happy';
let elapsed = 0;
let previous: number | undefined;
let raf = 0;
let ready = false;

function draw(frame: number) {
  const data = animations[state];
  context.clearRect(0, 0, 384, 384);
  context.drawImage(
    images[state],
    (frame % data.columns) * 384,
    Math.floor(frame / data.columns) * 384,
    384,
    384,
    0,
    0,
    384,
    384,
  );
  canvas.dataset.state = state;
  canvas.dataset.frame = String(frame);
}
function tick(time: number) {
  if (previous !== undefined) elapsed += time - previous;
  previous = time;
  let data = animations[state];
  let index = Math.floor((elapsed * data.fps) / 1000);
  if (state !== 'idle' && index >= data.frames) {
    state = 'idle';
    elapsed = 0;
    index = 0;
    data = animations.idle;
    label.textContent = 'Idle';
  }
  draw(index % data.frames);
  raf = requestAnimationFrame(tick);
}
function updatePlayback() {
  cancelAnimationFrame(raf);
  previous = undefined;
  canvas.hidden = hide.checked;
  if (!ready || signal.aborted) return;
  if (reduced.matches) draw(0);
  else if (!pause.checked && !hide.checked && !document.hidden)
    raf = requestAnimationFrame(tick);
}
for (const button of controls)
  button.addEventListener(
    'click',
    () => {
      state = button.dataset.action as Action;
      elapsed = 0;
      label.textContent =
        state === 'happy'
          ? 'Радостный прыжок'
          : state === 'working'
            ? 'Работает во Flowscape'
            : 'Idle';
      draw(0);
      updatePlayback();
    },
    { signal },
  );
pause.addEventListener('change', updatePlayback, { signal });
hide.addEventListener('change', updatePlayback, { signal });
document.addEventListener('visibilitychange', updatePlayback, { signal });
reduced.addEventListener('change', updatePlayback, { signal });
window.addEventListener(
  'pagehide',
  () => {
    cancelAnimationFrame(raf);
    lifetime.abort();
    for (const img of Object.values(images)) img.removeAttribute('src');
  },
  { once: true },
);
void Promise.all(
  (Object.keys(animations) as Action[]).map(async (name) => {
    const img = new Image();
    images[name] = img;
    img.src = animations[name].path;
    await img.decode();
  }),
)
  .then(() => {
    if (signal.aborted) return;
    ready = true;
    for (const button of controls) button.disabled = false;
    label.textContent = 'Радостный прыжок';
    draw(0);
    updatePlayback();
  })
  .catch(() => {
    if (!signal.aborted)
      label.textContent = 'Не удалось загрузить спрайт-листы';
  });
