# Mimimo development

- Work in TypeScript. Core lives in packages/core; each character has its own packages/pet-* workspace. Playground lives in apps/playground.
- Use pnpm. Import workspace siblings through public exports. Keep core independent of pet packs, frameworks and AI vendors.
- Read the installed turbo/docs/README.md and relevant bundled pages before changing Turborepo configuration.
- Preserve SSR-safe imports. Own and clean up listeners, animation frames, capture and asynchronous work.
- Use textContent for messages. Never put API credentials in client code.
- Support keyboard access, reduced motion, hide controls and narrow screens.
- Run pnpm check and relevant browser tests. Report actual results.
- Write comments and maintenance docs in English. Use short hyphens in prose.
- The owner approved public npm releases for @flowscape-ui/mimimo, @flowscape-ui/mimimo-pet-mochi, @flowscape-ui/mimimo-pet-byte and @flowscape-ui/mimimo-pet-flowy, with MIT licensing for code and bundled artwork. Keep the root and apps private. Additional package names or licensing changes require an owner decision.
