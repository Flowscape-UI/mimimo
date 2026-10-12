import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createReactions } from '../src/reactions/controller.ts';

test('manual reactions use states directly and respect gesture priority', () => {
  const names = new Set(['idle', 'sleep', 'happy', 'dragging']);
  const reactions = createReactions(
    { hover: 'happy', drag: 'dragging' },
    (name) => names.has(name),
    () => 'idle',
  );
  reactions.hover(true);
  assert.equal(reactions.resolve().state, 'happy');
  assert.equal(reactions.triggerState('sleep'), true);
  assert.equal(reactions.resolve().state, 'sleep');
  reactions.drag(true);
  assert.equal(reactions.resolve().state, 'dragging');
  reactions.drag(false);
  assert.equal(reactions.resolve().state, 'sleep');
  reactions.complete();
  assert.equal(reactions.resolve().state, 'happy');
  reactions.hover(false);
  assert.equal(reactions.resolve().state, 'idle');
  assert.equal(reactions.triggerState('unknown'), false);
  assert.throws(() => reactions.triggerState(' '), /name/);
});
test('removing or replacing bindings does not simulate a new click', () => {
  const r = createReactions(
    { click: 'happy' },
    () => true,
    () => 'idle',
  );
  r.click();
  assert.equal(r.resolve().state, 'happy');
  r.add('click', 'sleep');
  assert.equal(r.resolve().state, 'idle');
  r.click();
  assert.equal(r.resolve().state, 'sleep');
  r.remove('click');
  assert.equal(r.resolve().state, 'idle');
});
