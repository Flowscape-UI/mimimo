# Components

Mimimo combines a small core with independent character packs. Use the parts your interface needs.

## Companion

`createPet()` creates the character and manages its states, movement and lifecycle. Choose a [local or global environment](/guide/environments).

## Artwork and animation

Use images, GIFs, video, frame sequences or sprite sheets. Register named states with `addState()` and connect them to interactions with `addReaction()`.

## Messages

Use `say()` for a short message or a title with a description. Message content is rendered as text. Show or dismiss the bubble independently of the character.

## Custom panels

`setPanel(element)` mounts your own controls beneath the character. `setBubbleClose(button)` lets you supply a close button with your own handler.

## Character packs

Mochi and Byte are separate workspace packages. Your own artwork can also be passed directly to the core. Packs remain independent of application frameworks and AI providers.

[Explore the API](/guide/api) or [meet Flowy on the homepage](/).

## Learn by doing

- [Create a companion](../api/create-pet)
- [Artwork and animation](../api/add-state)
- [Messages](../api/say)
- [Custom controls](../api/panels)
- [Character definitions](../api/define-pet)
