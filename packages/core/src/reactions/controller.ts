import type { PetAction, PetReactions } from '../types';

/** DOM gestures and manual reactions share the same registry and priority rules. */
export function createReactions(
  initial: PetReactions,
  hasState: (name: string) => boolean,
  getFallback: () => string,
) {
  const reactions = new Map<string, string>();
  let base = getFallback();
  let hovered = false;
  let dragging = false;
  let triggered: { action: string; state: string } | undefined;
  function validate(action: string, name?: string) {
    if (!action.trim()) throw new Error('A reaction needs a name.');
    if (name !== undefined && !name.trim())
      throw new Error('A reaction needs a state name.');
  }
  function add(action: PetAction, state: string) {
    if (!['hover', 'click', 'drag'].includes(action))
      throw new Error('Unknown reaction action: ' + action);
    validate(action, state);
    reactions.set(action, state);
    if (triggered?.action === action) triggered = undefined;
  }
  function remove(action: string) {
    validate(action);
    reactions.delete(action);
    if (triggered?.action === action) triggered = undefined;
  }
  for (const [action, name] of Object.entries(initial))
    add(action as PetAction, name);
  function target(action: string) {
    const name = reactions.get(action);
    return name !== undefined && hasState(name) ? name : undefined;
  }
  function trigger(action: string) {
    validate(action);
    const name = target(action);
    if (!name) return false;
    triggered = { action, state: name };
    return true;
  }
  function resolve(): {
    state: string;
    source: 'base' | 'drag' | 'trigger' | 'hover';
  } {
    const dragState = dragging ? target('drag') : undefined;
    if (dragState) return { state: dragState, source: 'drag' };
    if (triggered && hasState(triggered.state))
      return { state: triggered.state, source: 'trigger' };
    const hoverState = hovered ? target('hover') : undefined;
    if (hoverState) return { state: hoverState, source: 'hover' };
    return { state: hasState(base) ? base : getFallback(), source: 'base' };
  }
  return {
    add,
    remove,
    resolve,
    trigger,
    triggerState(state: string) {
      if (!state.trim()) throw new Error('A reaction needs a state name.');
      if (!hasState(state)) return false;
      triggered = { action: '', state };
      return true;
    },
    stop() {
      triggered = undefined;
    },
    hover(value: boolean) {
      hovered = value;
    },
    drag(value: boolean) {
      dragging = value;
    },
    click() {
      return trigger('click');
    },
    play(name: string) {
      base = hasState(name) ? name : getFallback();
      triggered = undefined;
    },
    complete() {
      const selection = resolve();
      if (selection.source === 'trigger') triggered = undefined;
      else if (selection.source === 'base') base = getFallback();
    },
    reset() {
      hovered = false;
      dragging = false;
      triggered = undefined;
    },
  };
}
