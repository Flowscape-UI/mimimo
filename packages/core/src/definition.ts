import type { PetDefinition, PetState } from './types';
export function validateSize(width: number, height: number): void {
  if (![width, height].every((size) => Number.isFinite(size) && size > 0))
    throw new Error('Pet dimensions must be finite and positive.');
}
export function validateState(state: PetState): void {
  if (
    state.type &&
    !['frames', 'sprite', 'video', 'gif', 'image'].includes(state.type)
  )
    throw new Error('Unknown media type.');
  if (state.type === 'frames' && !('frames' in state))
    throw new Error('A frame animation needs a frames array.');
  if ('frames' in state) {
    if (
      !Array.isArray(state.frames) ||
      !state.frames.length ||
      state.frames.some((frame) => typeof frame !== 'string' || !frame.trim())
    )
      throw new Error('An animation needs non-empty frame URLs.');
  } else if (typeof state.path !== 'string' || !state.path.trim())
    throw new Error('A state needs a non-empty path.');
  if (
    ('frames' in state || state.type === 'sprite') &&
    (!Number.isFinite(state.fps) || state.fps <= 0 || state.fps > 60)
  )
    throw new Error('Animation fps must be greater than 0 and at most 60.');
  if (
    'speed' in state &&
    state.speed !== undefined &&
    (!Number.isFinite(state.speed) || state.speed < 0.25 || state.speed > 4)
  )
    throw new Error('Animation speed must be between 0.25 and 4.');
  if (state.type === 'sprite') {
    const start = state.startFrame ?? 0;
    if (
      ![state.columns, state.rows, state.frameCount].every(
        (n) => Number.isSafeInteger(n) && n > 0,
      ) ||
      !Number.isSafeInteger(start) ||
      start < 0 ||
      start + state.frameCount > state.columns * state.rows
    )
      throw new Error(
        'Sprite frames must fit inside a positive, integer grid.',
      );
  }
}
export function definePet<T extends PetDefinition>(definition: T): T {
  if (!definition.id.trim() || !definition.name.trim())
    throw new Error('A pet needs an id and name.');
  validateSize(definition.width, definition.height);
  const entries = Object.entries(definition.animations);
  if (!entries.length)
    throw new Error('A pet definition needs at least one state.');
  for (const [name, state] of entries) {
    if (!name.trim()) throw new Error('A state needs a name.');
    validateState(state);
  }
  if (
    definition.initialState !== undefined &&
    !Object.hasOwn(definition.animations, definition.initialState)
  )
    throw new Error('initialState must name a registered state.');
  return definition;
}
