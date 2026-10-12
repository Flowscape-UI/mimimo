import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

const require = createRequire(
  new URL('../../apps/playground/package.json', import.meta.url),
);
const { chromium } = require('@playwright/test');
const version = process.argv[2] ?? 'v1';
if (!/^v\d+$/.test(version))
  throw new Error('Expected a version such as v1 or v2.');
const basename = `flowy-idle-${version}`;
const source = await readFile(
  new URL(`./${basename}.source.png`, import.meta.url),
);
const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  const page = await browser.newPage();
  const result = await page.evaluate(async (base64: string) => {
    const image = new Image();
    image.src = `data:image/png;base64,${base64}`;
    await image.decode();
    const atlas = document.createElement('canvas');
    atlas.width = atlas.height = 1280;
    const ctx = atlas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    const cells = [];
    for (let i = 0; i < 16; i++) {
      const col = i % 4;
      const row = Math.floor(i / 4);
      const sx = Math.round((col * image.width) / 4);
      const sy = Math.round((row * image.height) / 4);
      const width = Math.round(((col + 1) * image.width) / 4) - sx;
      const height = Math.round(((row + 1) * image.height) / 4) - sy;
      const tile = document.createElement('canvas');
      tile.width = width;
      tile.height = height;
      const tc = tile.getContext('2d')!;
      tc.drawImage(image, sx, sy, width, height, 0, 0, width, height);
      const pixels = tc.getImageData(0, 0, width, height).data;
      let minX = width,
        maxX = -1,
        minY = height,
        maxY = -1;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (pixels[(y * width + x) * 4 + 3] > 100) {
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
          }
        }
      }
      // Repack generated cells without repainting or rescaling the artwork.
      // Align the feet while preserving breathing differences in head height.
      const dx = Math.round(160 - (minX + maxX) / 2);
      const dy = 295 - maxY;
      ctx.save();
      ctx.beginPath();
      ctx.rect(col * 320, row * 320, 320, 320);
      ctx.clip();
      ctx.drawImage(tile, col * 320 + dx, row * 320 + dy);
      ctx.restore();
      cells.push({
        frame: i,
        left: minX + dx,
        top: minY + dy,
        right: maxX + dx,
        baseline: maxY + dy,
      });
    }
    return {
      png: atlas.toDataURL('image/png').split(',')[1],
      sourceWidth: image.width,
      sourceHeight: image.height,
      cells,
    };
  }, source.toString('base64'));
  await writeFile(
    new URL(`./${basename}.png`, import.meta.url),
    Buffer.from(result.png, 'base64'),
  );
  const { png: _png, ...report } = result;
  void _png;
  await writeFile(
    new URL(`./${basename}.validation.json`, import.meta.url),
    JSON.stringify(report, null, 2) + '\n',
  );
  console.log(JSON.stringify(report));
} finally {
  await browser.close();
}
