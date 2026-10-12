import { test } from 'node:test';
import assert from 'node:assert/strict';
import { definePet, createPet } from '../dist/index.js';

test('can import the package in SSR; creating a pet requires a document', () => {
  assert.throws(() => createPet({ character: sample() }), /client/);
});
function sample() {
  return {
    id: 'test',
    name: 'Test',
    width: 128,
    height: 128,
    animations: { idle: { frames: ['pet.png'], fps: 2 } },
  };
}
test('accepts external artwork without requiring built-in pet packages', () => {
  const character = sample();
  assert.equal(definePet(character), character);
});
test('rejects malformed animation data and dimensions', () => {
  assert.throws(() => definePet({ ...sample(), width: NaN }), /dimensions/);
  assert.throws(
    () =>
      definePet({ ...sample(), animations: { idle: { frames: [], fps: 2 } } }),
    /frame/,
  );
  assert.throws(
    () =>
      definePet({
        ...sample(),
        animations: { idle: { frames: ['pet.png'], fps: 0 } },
      }),
    /fps/,
  );
});

test('validates sprite ranges, frame rates and speed', () => {
  const sprite = {
    type: 'sprite' as const,
    path: 'atlas.png',
    columns: 4,
    rows: 2,
    frameCount: 4,
    startFrame: 4,
    fps: 12,
  };
  const withState = (state: import('../dist/index.js').PetState) =>
    definePet({
      ...sample(),
      animations: { custom: state },
      initialState: 'custom',
    });
  assert.doesNotThrow(() => withState(sprite));
  assert.throws(() => withState({ ...sprite, startFrame: 5 }), /grid/);
  assert.throws(() => withState({ ...sprite, columns: 1.5 }), /grid/);
  assert.throws(() => withState({ ...sprite, speed: NaN }), /speed/);
  assert.throws(() => withState({ ...sprite, speed: 0 }), /speed/);
  assert.throws(() => withState({ ...sprite, fps: 61 }), /fps/);
  assert.throws(() => withState({ type: 'video', path: '', speed: 1 }), /path/);
});
test('accepts every media type and arbitrary initial state names', () => {
  const definition = definePet({
    ...sample(),
    animations: {
      relax: { type: 'image' as const, path: 'rest.png' },
      sleep: { type: 'gif' as const, path: 'sleep.gif' },
      dance: { type: 'video' as const, path: 'dance.webm', speed: 2 },
    },
    initialState: 'relax',
  });
  assert.equal(definition.initialState, 'relax');
  assert.throws(
    () => definePet({ ...definition, initialState: 'missing' }),
    /initialState/,
  );
  assert.throws(() => definePet({ ...sample(), animations: {} }), /state/);
});

test('plain JavaScript callers receive useful errors for missing frame rates and malformed sources', () => {
  const invalid = [
    { frames: ['pet.png'] },
    { type: 'sprite', path: 'atlas.png', columns: 2, rows: 2, frameCount: 4 },
    { frames: [42], fps: 12 },
    { type: 'frames', path: 'pet.png', fps: 12 },
    { type: 'unsupported', path: 'pet.png' },
    { path: 42 },
  ];
  for (const state of invalid) {
    assert.throws(
      () =>
        Reflect.apply(definePet, undefined, [
          { ...sample(), animations: { idle: state } },
        ]),
      /fps|frame|type|path/,
    );
  }
});
