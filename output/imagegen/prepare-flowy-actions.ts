import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const require = createRequire(
  new URL('../../apps/playground/package.json', import.meta.url),
);
const testRequire = createRequire(require.resolve('@playwright/test'));
const playwrightRequire = createRequire(testRequire.resolve('playwright'));
// Reuse the installed PNG codec for lossless atlas packing, without repainting artwork.
const { PNG } = require(
  join(
    dirname(playwrightRequire.resolve('playwright-core/package.json')),
    'lib/utilsBundle.js',
  ),
);
interface Raster {
  width: number;
  height: number;
  data: Buffer;
}
const cell = 384;
const revision = process.argv[2] ?? 'v1';
if (revision !== 'v1' && revision !== 'v2')
  throw new Error('Expected v1 or v2');
const framePath = (name: string) => new URL(`./${name}`, import.meta.url);
async function load(name: string): Promise<Raster> {
  return PNG.sync.read(await readFile(framePath(name)));
}
async function save(name: string, image: Raster) {
  await writeFile(framePath(name), PNG.sync.write(image));
}
async function json(name: string, value: unknown) {
  await writeFile(framePath(name), JSON.stringify(value, null, 2) + '\n');
}
function blank(width: number, height: number): Raster {
  return { width, height, data: Buffer.alloc(width * height * 4) };
}
function copy(
  source: Raster,
  target: Raster,
  sx: number,
  sy: number,
  width: number,
  height: number,
  dx: number,
  dy: number,
  scale = 1,
) {
  const w = Math.round(width * scale),
    h = Math.round(height * scale);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const tx = dx + x,
        ty = dy + y;
      if (tx < 0 || ty < 0 || tx >= target.width || ty >= target.height)
        continue;
      const from =
        ((sy + Math.min(height - 1, Math.floor(y / scale))) * source.width +
          sx +
          Math.min(width - 1, Math.floor(x / scale))) *
        4;
      source.data.copy(
        target.data,
        (ty * target.width + tx) * 4,
        from,
        from + 4,
      );
    }
}
function bounds(image: Raster) {
  let left = image.width,
    top = image.height,
    right = -1,
    bottom = -1;
  for (let y = 0; y < image.height; y++)
    for (let x = 0; x < image.width; x++) {
      if (image.data[(y * image.width + x) * 4 + 3] > 100) {
        left = Math.min(left, x);
        right = Math.max(right, x);
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
      }
    }
  if (right < 0) throw new Error('Empty sprite');
  return {
    left,
    top,
    right,
    bottom,
    width: right - left + 1,
    height: bottom - top + 1,
  };
}
function split(source: Raster, adaptiveRows = false) {
  const rows = [0];
  for (let r = 1; r < 4; r++) {
    const nominal = Math.round((r * source.height) / 4);
    let cut = nominal,
      best = Infinity;
    if (adaptiveRows)
      for (let y = nominal - 40; y <= nominal + 40; y++) {
        let count = 0;
        for (let x = 0; x < source.width; x++)
          if (source.data[(y * source.width + x) * 4 + 3] > 100) count++;
        const score = count * 1000 + Math.abs(y - nominal);
        if (score < best) {
          best = score;
          cut = y;
        }
      }
    rows.push(cut);
  }
  rows.push(source.height);
  return Array.from({ length: 16 }, (_, i) => {
    const col = i % 4,
      row = Math.floor(i / 4);
    const left = Math.round((col * source.width) / 4),
      right = Math.round(((col + 1) * source.width) / 4);
    const tile = blank(right - left, rows[row + 1] - rows[row]);
    copy(source, tile, left, rows[row], tile.width, tile.height, 0, 0);
    return tile;
  });
}
const idle = await load('flowy-idle-v2.png');
const idleFrames = split(idle);
const idleBounds = bounds(idleFrames[0]);
const baseline = idleBounds.bottom + 64;
const paddedIdle = blank(cell * 4, cell * 4);
for (let i = 0; i < 16; i++)
  copy(
    idleFrames[i],
    paddedIdle,
    0,
    0,
    320,
    320,
    (i % 4) * cell + 32,
    Math.floor(i / 4) * cell + 64,
  );
await save('flowy-idle-v2-padded.png', paddedIdle);
const rest = blank(cell, cell);
copy(idleFrames[0], rest, 0, 0, 320, 320, 32, 64);
const configs: Record<
  string,
  {
    type: 'sprite';
    path: string;
    columns: number;
    rows: number;
    frameCount: number;
    fps: number;
    loop: boolean;
  }
> = {
  idle: {
    type: 'sprite',
    path: './flowy-idle-v2-padded.png',
    columns: 4,
    rows: 4,
    frameCount: 16,
    fps: 4,
    loop: true,
  },
};
for (const name of ['working', 'happy'] as const) {
  const version = name === 'happy' ? revision : 'v1';
  const source = await load(`flowy-${name}-${version}.source.png`);
  const tiles = split(source, name === 'happy');
  const holds =
    name === 'working'
      ? [1, 1, 2, 2, 2, 2, 2, 3, 3, 2, 2, 2, 2, 2, 1, 3]
      : revision === 'v2'
        ? [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 5]
        : [2, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2, 5];
  const timeline = holds.flatMap((n, i) => Array<number>(n).fill(i));
  const columns = 8,
    rows = Math.ceil(timeline.length / columns);
  const atlas = blank(columns * cell, rows * cell);
  const scale =
    name === 'happy' && revision === 'v1'
      ? idleBounds.height / bounds(tiles[0]).height
      : 1;
  const rise =
    revision === 'v2'
      ? [0, 0, 0, 8, 30, 52, 67, 76, 72, 58, 36, 12, 0, 0, 0, 0]
      : [0, 0, 0, 12, 28, 48, 60, 68, 68, 52, 32, 12, 0, 0, 0, 0];
  const report = [];
  for (let frame = 0; frame < timeline.length; frame++) {
    const k = timeline[frame],
      ox = (frame % columns) * cell,
      oy = Math.floor(frame / columns) * cell;
    if (k === 0 || k === 15) {
      copy(rest, atlas, 0, 0, cell, cell, ox, oy);
      continue;
    }
    const b = bounds(tiles[k]);
    const w = Math.round(b.width * scale),
      h = Math.round(b.height * scale);
    const x = Math.round((cell - w) / 2),
      bottom = baseline - (name === 'happy' ? rise[k] : 0),
      y = bottom - h + 1;
    if (y < 0 || x < 0 || y + h > cell || x + w > cell)
      throw new Error(`Clipped ${name} frame ${frame}`);
    copy(
      tiles[k],
      atlas,
      b.left,
      b.top,
      b.width,
      b.height,
      ox + x,
      oy + y,
      scale,
    );
    report.push({ frame, keyframe: k, top: y, baseline: bottom });
  }
  const last = blank(cell, cell);
  copy(
    atlas,
    last,
    ((timeline.length - 1) % columns) * cell,
    Math.floor((timeline.length - 1) / columns) * cell,
    cell,
    cell,
    0,
    0,
  );
  if (!last.data.equals(rest.data)) throw new Error('Idle endpoint mismatch');
  await save(`flowy-${name}-${version}.png`, atlas);
  const fps = name === 'working' ? 4 : revision === 'v2' ? 12 : 8;
  configs[name] = {
    type: 'sprite',
    path: `./flowy-${name}-${version}.png`,
    columns,
    rows,
    frameCount: timeline.length,
    fps,
    loop: false,
  };
  await json(`flowy-${name}-${version}.json`, configs[name]);
  await json(`flowy-${name}-${version}.validation.json`, {
    cell,
    scale,
    durationSeconds: timeline.length / fps,
    exactIdleReturn: true,
    timeline,
    frames: report,
  });
  console.log(
    `${name}: ${timeline.length} frames, ${timeline.length / fps}s, exact idle return`,
  );
}
await json(`flowy-actions-${revision}.json`, {
  id: 'flowy',
  name: 'Flowy',
  width: 192,
  height: 192,
  initialState: 'idle',
  animations: configs,
});
const ts = require('typescript');
const previewSource = await readFile(
  framePath('flowy-actions.preview.ts'),
  'utf8',
);
const preview = ts.transpileModule(previewSource, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.None,
  },
});
await mkdir(framePath('dist'), { recursive: true });
await writeFile(framePath('dist/flowy-actions.preview.js'), preview.outputText);
