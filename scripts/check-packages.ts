import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const root = process.cwd();
const output = resolve(root, '.artifacts');
mkdirSync(output, { recursive: true });
const windows = process.platform === 'win32';
const npm = windows ? process.execPath : 'npm';
const run = (args: string[], cwd = root) =>
  execFileSync(
    npm,
    windows
      ? [
          resolve(dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js'),
          ...args,
        ]
      : args,
    {
      cwd,
      encoding: 'utf8',
    },
  );
const files: string[] = [];
for (const dir of ['core', 'pet-mochi', 'pet-byte', 'pet-flowy']) {
  const cwd = resolve(root, 'packages', dir);
  const pkg = JSON.parse(readFileSync(resolve(cwd, 'package.json'), 'utf8'));
  assert.notEqual(pkg.private, true);
  assert.equal(pkg.license, 'MIT');
  assert.equal(pkg.publishConfig.access, 'public');
  assert.equal(pkg.repository.directory, `packages/${dir}`);
  const [packed] = JSON.parse(
    run(
      ['pack', '--json', '--ignore-scripts', '--pack-destination', output],
      cwd,
    ),
  );
  const paths = packed.files.map(
    (file: { path: string }) => file.path,
  ) as string[];
  for (const required of [
    'package.json',
    'README.md',
    'LICENSE',
    'dist/index.js',
    'dist/index.d.ts',
  ])
    assert(paths.includes(required), `${pkg.name}: missing ${required}`);
  assert(
    paths.every((path) =>
      /^(dist\/|README\.md$|LICENSE$|package\.json$)/.test(path),
    ),
    `${pkg.name}: unexpected packed file`,
  );
  if (dir === 'pet-flowy')
    for (const state of ['idle', 'working', 'happy'])
      assert(paths.includes(`dist/assets/flowy-${state}.png`));
  files.push(resolve(output, packed.filename));
  console.log(
    `${pkg.name}@${pkg.version}: ${paths.length} files, ${packed.size} bytes packed`,
  );
}
// Install exactly the release tarballs outside workspace package resolution.
const consumer = resolve(output, 'consumer');
mkdirSync(consumer, { recursive: true });
writeFileSync(
  resolve(consumer, 'package.json'),
  JSON.stringify({ private: true, type: 'module' }),
);
run(
  [
    'install',
    '--ignore-scripts',
    '--package-lock=false',
    '--no-audit',
    '--no-fund',
    ...files,
  ],
  consumer,
);
writeFileSync(
  resolve(consumer, 'smoke.mjs'),
  `
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createPet, definePet } from '@flowscape-ui/mimimo';
import { mochi } from '@flowscape-ui/mimimo-pet-mochi';
import { byte } from '@flowscape-ui/mimimo-pet-byte';
import { flowy } from '@flowscape-ui/mimimo-pet-flowy';
for (const pet of [mochi, byte, flowy]) assert.equal(definePet(pet), pet);
assert.throws(() => createPet({ character: flowy }), /client/);
for (const state of Object.values(flowy.animations)) {
  const png = readFileSync(new URL(state.path));
  assert.equal(png.toString('hex', 0, 8), '89504e470d0a1a0a');
  assert.equal(png.readUInt32BE(16) % state.columns, 0);
  assert.equal(png.readUInt32BE(20) % state.rows, 0);
}
console.log('Packed consumer: SSR imports, definitions and all Flowy assets passed.');
`,
);
process.stdout.write(
  execFileSync(process.execPath, ['smoke.mjs'], {
    cwd: consumer,
    encoding: 'utf8',
  }),
);
