import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

if (
  process.env.GITHUB_ACTIONS !== 'true' ||
  process.env.GITHUB_REF_TYPE !== 'tag'
)
  throw new Error('Publish only from GitHub Actions on a version tag.');
const packages = ['core', 'pet-mochi', 'pet-byte', 'pet-flowy'].map((dir) =>
  JSON.parse(readFileSync(resolve('packages', dir, 'package.json'), 'utf8')),
);
// Validate every package before the first registry mutation.
for (const pkg of packages)
  if (process.env.GITHUB_REF_NAME !== `v${pkg.version}`)
    throw new Error(`Tag does not match ${pkg.name}@${pkg.version}`);
const windows = process.platform === 'win32';
const npm = windows ? process.execPath : 'npm';
for (const pkg of packages) {
  const response = await fetch(
    `https://registry.npmjs.org/${encodeURIComponent(pkg.name)}/${pkg.version}`,
  );
  if (response.ok) {
    console.log(`Already published: ${pkg.name}@${pkg.version}`);
    continue;
  }
  if (response.status !== 404)
    throw new Error(
      `Registry returned ${response.status}; refusing to assume the version is unpublished.`,
    );
  const tarball = resolve(
    '.artifacts',
    `${pkg.name.replace(/^@/, '').replace('/', '-')}-${pkg.version}.tgz`,
  );
  const args = ['publish', tarball, '--access', 'public'];
  execFileSync(
    npm,
    windows
      ? [
          resolve(dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js'),
          ...args,
        ]
      : args,
    {
      stdio: 'inherit',
    },
  );
}
