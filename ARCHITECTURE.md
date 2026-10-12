# Architecture

Core owns the public createPet API, a validated registry of named states, and DOM interaction. It never depends on a built-in character pack or an AI SDK. Importing core is SSR safe.

Each character owns its package and artwork and uses core types as a peer dependency. The playground imports public workspace exports only.

PetState is a discriminated union: frame sequence, equal-grid sprite sheet, video, GIF or static image. The renderer in core/src/animation owns frame timing, image cropping, video playback, suspension and media cleanup. The pet registry owns the fallback and transitions. A missing name resolves to the initial state. Non-looping fallback states hold their final frame.

Native GIF playback has no controllable timeline; its file determines timing and loop count. Reduced motion uses an optional still poster or hides the GIF. Video alpha/codec support belongs to the browser. Media errors are observable through the public mediaerror event.

The renderer owns subscriptions, pointer capture, animation frames and request cancellation. destroy() is idempotent. Caller-owned blob URLs are never revoked by the library. Replies use textContent. Chat callbacks own server connections and history.

Packages compile to ESM and declarations through tsdown. Turborepo orders builds, types and tests. Tests belong to their owning workspace. All packages stay private pending a separate release and licensing decision.

The ui module owns message and lower panel DOM, safe text rendering, named slots and panel styles. createPet owns viewport positioning and the ResizeObserver lifecycle. Custom panel nodes remain caller-owned: Mimimo mounts/detaches them, while callers dispose their handlers, framework roots and speech integrations. Core does not record audio or depend on a speech-to-text provider.

Runtime mutations preserve the host. The reaction controller separates automatic gesture bindings from direct temporary state reactions. The loader prepares immutable registry snapshots and owns abort/timeout cleanup. Async chat uses a latest-request policy; cancellation races the provider so a provider ignoring AbortSignal cannot keep the public request pending. Revision checks keep animation completion and delayed loading from overriding newer state. Container coordinates are translated into a fixed body portal; ResizeObserver and scroll listeners maintain bounds and anchors.
