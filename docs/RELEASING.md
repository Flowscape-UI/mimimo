# Releasing Mimimo

The owner approved public npm releases and MIT licensing for core and all included artwork. The root and apps remain private.

## Validation

Use Node 24.11+ and pnpm 10.33.2. Run `pnpm check`, both browser suites and `pnpm check:packages`. The last command inspects npm tarball contents, installs the four tarballs into an isolated consumer and verifies SSR imports and Flowy asset paths. Tarballs are written to `.artifacts` and never committed.

CI repeats these checks on pull requests, main and release runs. Release downloads the exact tarballs produced by its verification job rather than rebuilding different artifacts.

## First publication

The first publication needs an authenticated maintainer because an npm package must exist before a trusted publisher can be configured. Run `node scripts/publish.ts` after verification. It publishes core first, then the three pet packs. Existing versions are skipped; registry errors other than 404 stop the release.

After all four packages exist, configure each with npm CLI 11.15+ and an account with 2FA:

```sh
npm trust github @flowscape-ui/mimimo --repo Flowscape-UI/mimimo --file release.yml --allow-publish --yes
npm trust github @flowscape-ui/mimimo-pet-mochi --repo Flowscape-UI/mimimo --file release.yml --allow-publish --yes
npm trust github @flowscape-ui/mimimo-pet-byte --repo Flowscape-UI/mimimo --file release.yml --allow-publish --yes
npm trust github @flowscape-ui/mimimo-pet-flowy --repo Flowscape-UI/mimimo --file release.yml --allow-publish --yes
```

These commands may require interactive authentication. Never commit npm credentials. The release workflow uses GitHub OIDC with `id-token: write`, not a long-lived npm secret. The trust must match this repository and `release.yml` exactly. See [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/).

## Later releases

1. Update all four package versions together and update pet peer ranges when required.
2. Refresh the lockfile, write a changelog entry and run validation.
3. Commit the changes, push main, then push `vX.Y.Z` matching all package versions.
4. Watch the Release workflow. Confirm the version, integrity and assets on npm.

Manual dispatch on main can resume a partial release. npm versions are immutable; if a published artifact is wrong, fix it and release a new version instead of attempting to replace it.
