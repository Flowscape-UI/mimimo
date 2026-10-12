import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const windows = process.platform === 'win32';
const npm = windows ? process.execPath : 'npm';
for (const dir of ['core', 'pet-mochi', 'pet-byte', 'pet-flowy']) {
  const cwd = resolve('packages', dir);
  const pkg = JSON.parse(readFileSync(resolve(cwd, 'package.json'), 'utf8'));
  if (
    process.env.GITHUB_REF_TYPE === 'tag' &&
    process.env.GITHUB_REF_NAME !== `v${pkg.version}`
  )
    throw new Error(`Tag does not match ${pkg.name}@${pkg.version}`);
  const response = await fetch(
    `https://registry.npmjs.org/${pkg.name}/${pkg.version}`,
  );
  if (response.ok) {
    console.log(`Already published: ${pkg.name}@${pkg.version}`);
    continue;
  }
  if (response.status !== 404)
    throw new Error(
      `Registry returned ${response.status}; refusing to assume the version is unpublished.`,
    );
  const tarball = resolve('.artifacts', `${pkg.name}-${pkg.version}.tgz`);
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
