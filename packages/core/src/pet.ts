import { definePet, validateState, validateSize } from './definition';
import { createRenderer } from './animation';
import { createReactions } from './reactions';
import { createPanels } from './ui';
import { loadAssets } from './loading';
import {
  attachLayer,
  attachLocalLayer,
  viewport,
  containerArea,
  visibleArea,
} from './environment';
import type {
  Pet,
  PetEvents,
  PetOptions,
  PetState,
  PetMessage,
  PetAnchor,
  PetPosition,
  PreloadOptions,
} from './types';

const styles = `
:host{position:fixed;inset:auto;left:0;top:0;z-index:2147483647;display:block;margin:0;padding:0;border:0;max-width:none;max-height:none;overflow:visible;background:transparent;font:14px/1.45 system-ui,sans-serif;color:var(--mimimo-text,#fff)}
:host([hidden]){display:none}
:host::backdrop{background:transparent;pointer-events:none}
*{box-sizing:border-box}
button,input{font:inherit}
.character{display:block;border:0;padding:0;background:none;cursor:pointer;touch-action:none;border-radius:24px}
.character:focus-visible{outline:3px solid var(--mimimo-accent,#a78bfa);outline-offset:4px}
.media{display:block;width:100%;height:100%;overflow:hidden;pointer-events:none}.media img,.media video{display:block;width:100%;height:100%;object-fit:contain;pointer-events:none;user-select:none}
p{margin:0;white-space:pre-wrap}
form{display:flex;gap:6px;margin-top:10px}
input{min-width:0;width:100%;padding:8px;color:inherit;background:#ffffff10;border:1px solid #ffffff30;border-radius:6px}
.send{background:var(--mimimo-accent,#a78bfa);color:#171021;border:0;border-radius:6px;cursor:pointer}
.close{position:absolute;right:0;top:0;transform:translate(25%,-25%);width:24px;height:24px;border:1px solid #ffffff30;border-radius:50%;background:#24212e;color:white;cursor:pointer}
button:disabled{opacity:.5;cursor:wait}
`;

export function createPet(options: PetOptions = {}): Pet {
  if (typeof document === 'undefined')
    throw new Error('Call createPet on the client after mounting.');
  const preset = options.character ? definePet(options.character) : undefined;
  const character = {
    id: options.id ?? preset?.id ?? 'custom',
    name: options.name ?? preset?.name ?? 'Companion',
    width: options.width ?? preset?.width ?? 128,
    height: options.height ?? preset?.height ?? 128,
  };
  validateSize(character.width, character.height);
  const states = new Map<string, PetState>();
  for (const [name, state] of Object.entries({
    ...preset?.animations,
    ...options.states,
  })) {
    if (!name.trim()) throw new Error('A state needs a name.');
    validateState(state);
    states.set(
      name,
      'frames' in state
        ? { ...state, frames: [...state.frames] }
        : { ...state },
    );
  }
  let fallback =
    options.initialState ??
    preset?.initialState ??
    (states.has('idle') ? 'idle' : (states.keys().next().value ?? ''));
  if (fallback && !states.has(fallback))
    throw new Error('initialState must name a registered state.');
  const reactions = createReactions(
    options.reactions ?? {},
    (name) => states.has(name),
    () => fallback,
  );
  const container = options.container ?? document.body;
  const bounded =
    (options.bounds ?? (options.container ? 'container' : 'viewport')) ===
    'container';
  if (options.bounds === 'container' && !options.container)
    throw new Error('Container bounds require a container.');
  if (options.bounds && !['viewport', 'container'].includes(options.bounds))
    throw new Error('Unknown bounds mode.');
  let environmentVisible = true;
  let draggable = options.draggable ?? true;
  let paused = false;
  let revision = 0;
  let registryRevision = 0;
  const loads = new Set<AbortController>();
  let anchor: PetAnchor | undefined =
    options.anchor ?? (options.position ? undefined : 'bottom-right');
  let offset = {
    ...(options.offset ??
      (anchor === 'center' ? { x: 0, y: 0 } : { x: 24, y: 24 })),
  };
  function validatePosition(value: PetPosition) {
    if (!Number.isFinite(value.x) || !Number.isFinite(value.y))
      throw new Error('Position must contain finite coordinates.');
  }
  function validateAnchor(value: PetAnchor) {
    if (
      ![
        'top-left',
        'top-right',
        'bottom-left',
        'bottom-right',
        'center',
      ].includes(value)
    )
      throw new Error('Unknown anchor.');
  }
  if (options.position) validatePosition(options.position);
  validatePosition(offset);
  if (anchor) validateAnchor(anchor);
  const host = document.createElement('div');
  host.setAttribute('data-mimimo', character.id);
  // Local pets share the document's native scroll and overscroll movement.
  // Global pets remain fixed to the viewport.
  if (bounded) host.style.position = 'absolute';
  const shadow = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = styles;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'character';
  button.setAttribute('aria-label', character.name);
  button.style.width = character.width + 'px';
  button.style.height = character.height + 'px';
  const media = document.createElement('span');
  media.className = 'media';
  button.append(media);
  const renderer = createRenderer(media);
  const ui = createPanels(host, options.bubble);
  const bubble = ui.bubble;
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'close';
  close.textContent = '×';
  close.setAttribute('aria-label', 'Hide companion');
  button.part.add('character');
  close.part.add('close');
  shadow.append(style, ui.style, bubble, button, close, ui.panel);
  if (options.panel) ui.setPanel(options.panel);
  const layer = bounded ? attachLocalLayer(host, container) : attachLayer(host);

  const listeners = new Map<keyof PetEvents, Set<(detail: never) => void>>();
  function emit<K extends keyof PetEvents>(event: K, detail: PetEvents[K]) {
    for (const listener of listeners.get(event) ?? [])
      listener(detail as never);
  }
  const lifecycle = new AbortController();
  let request: AbortController | undefined;
  let destroyed = false;
  let current = '';
  let x = options.position?.x ?? window.innerWidth - character.width - 24;
  let y = options.position?.y ?? window.innerHeight - character.height - 24;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  function boundary() {
    return bounded &&
      container !== document.body &&
      container !== document.documentElement
      ? containerArea(container)
      : viewport();
  }
  let geometryKey = '';
  function position() {
    if (destroyed) return;
    const area = boundary();
    const visible = bounded ? visibleArea(container, area) : area;
    geometryKey = JSON.stringify([area, visible]);
    if (anchor) {
      x =
        anchor === 'center'
          ? (area.width - character.width) / 2 + offset.x
          : anchor.endsWith('right')
            ? area.width - character.width - offset.x
            : offset.x;
      y =
        anchor === 'center'
          ? (area.height - character.height) / 2 + offset.y
          : anchor.startsWith('bottom')
            ? area.height - character.height - offset.y
            : offset.y;
    }
    const leftEdge = 0;
    const topEdge = 0;
    const rightEdge = area.width;
    const bottomEdge = area.height;
    const availableWidth = Math.max(
      0,
      Math.min(rightEdge - leftEdge, window.innerWidth),
    );
    for (const panel of [bubble, ui.panel])
      panel.style.maxWidth = Math.max(0, availableWidth - 24) + 'px';
    const bubbleHeight = bubble.hidden
      ? 0
      : bubble.getBoundingClientRect().height + 16;
    const panelHeight = ui.panel.hidden
      ? 0
      : ui.panel.getBoundingClientRect().height + 8;
    const maxX = Math.max(leftEdge, rightEdge - character.width);
    const maxY = Math.max(
      topEdge,
      bottomEdge - character.height - panelHeight - 12,
    );
    x = Math.max(leftEdge, Math.min(x, maxX));
    y = Math.max(
      Math.min(topEdge + bubbleHeight + 12, maxY),
      Math.min(y, maxY),
    );
    const screenX = area.left + x,
      screenY = area.top + y;
    const hostX = bounded ? x + container.scrollLeft : screenX;
    const hostY = bounded ? y + container.scrollTop : screenY;
    host.style.transform = `translate(${hostX}px,${hostY}px)`;
    host.style.clipPath = bounded
      ? visible.width && visible.height
        ? `inset(${visible.top - screenY}px ${screenX + character.width - visible.left - visible.width}px ${screenY + character.height - visible.top - visible.height}px ${visible.left - screenX}px)`
        : 'inset(100%)'
      : 'none';
    const nextVisible = visible.width > 0 && visible.height > 0;
    if (nextVisible !== environmentVisible) {
      environmentVisible = nextVisible;
      syncPlayback();
    }
    for (const panel of [bubble, ui.panel]) {
      const width = panel.getBoundingClientRect().width;
      const left = Math.max(
        leftEdge + 12,
        Math.min(x + (character.width - width) / 2, rightEdge - width - 12),
      );
      panel.style.left = left - x + 'px';
    }
  }
  const panelObserver = new ResizeObserver(position);
  panelObserver.observe(bubble);
  panelObserver.observe(ui.panel);
  if (bounded) panelObserver.observe(container);
  let geometryFrame = 0;
  function trackGeometry() {
    if (destroyed) return;
    if (!host.hidden && !document.hidden) {
      const area = boundary();
      if (JSON.stringify([area, visibleArea(container, area)]) !== geometryKey)
        position();
    }
    geometryFrame = requestAnimationFrame(trackGeometry);
  }
  if (bounded) geometryFrame = requestAnimationFrame(trackGeometry);
  function syncPlayback() {
    renderer.setPaused(
      paused ||
        destroyed ||
        !environmentVisible ||
        Boolean(host.hidden) ||
        document.hidden,
      motion.matches,
    );
  }
  function renderState(force = false) {
    if (destroyed) return;
    const name = reactions.resolve().state;
    const animation = states.get(name);
    if (!animation) {
      if (current) {
        current = '';
        revision++;
        renderer.destroy();
        emit('statechange', { state: '' });
      }
      return;
    }
    if (!force && current === name) return;
    const token = ++revision;
    current = name;
    syncPlayback();
    renderer.play(
      animation,
      () => {
        emit('animationend', { state: name });
        if (destroyed || token !== revision) return;
        reactions.complete();
        renderState();
      },
      (error) => emit('mediaerror', { state: name, error }),
    );
    emit('statechange', { state: name });
  }
  function play(state: string) {
    if (destroyed) return;
    reactions.play(state);
    renderState(true);
  }
  function say(message: string | PetMessage) {
    if (destroyed) return;
    ui.say(message);
    position();
  }
  let drag:
    | {
        id: number;
        x: number;
        y: number;
        originX: number;
        originY: number;
        started: boolean;
      }
    | undefined;
  let dragged = false;
  let pointerHovered = false;
  let keyboardHovered = false;
  function updateHover() {
    reactions.hover(pointerHovered || keyboardHovered);
    renderState();
  }
  button.addEventListener(
    'pointerenter',
    (event) => {
      if (event.pointerType === 'touch') return;
      pointerHovered = true;
      updateHover();
    },
    { signal: lifecycle.signal },
  );
  button.addEventListener(
    'pointerleave',
    (event) => {
      if (event.pointerType === 'touch') return;
      pointerHovered = false;
      updateHover();
    },
    { signal: lifecycle.signal },
  );
  button.addEventListener(
    'focus',
    () => {
      keyboardHovered = button.matches(':focus-visible');
      updateHover();
    },
    { signal: lifecycle.signal },
  );
  button.addEventListener(
    'blur',
    () => {
      keyboardHovered = false;
      updateHover();
    },
    { signal: lifecycle.signal },
  );
  button.addEventListener(
    'pointerdown',
    (event) => {
      if (event.button !== 0 || !event.isPrimary || drag) return;
      dragged = false;
      if (!draggable) return;
      drag = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        originX: x,
        originY: y,
        started: false,
      };
      button.setPointerCapture(event.pointerId);
    },
    { signal: lifecycle.signal },
  );
  button.addEventListener(
    'pointermove',
    (event) => {
      if (!drag || event.pointerId !== drag.id) return;
      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;
      if (!drag.started) {
        if (Math.hypot(dx, dy) <= 4) return;
        drag.started = true;
        anchor = undefined;
        dragged = true;
        reactions.drag(true);
        renderState();
        emit('dragstart', { x, y });
        // Event subscribers may hide or destroy the pet.
        if (!drag || destroyed) return;
      }
      x = drag.originX + dx;
      y = drag.originY + dy;
      position();
      emit('move', { x, y });
    },
    { signal: lifecycle.signal },
  );
  function endDrag(event?: PointerEvent) {
    const active = drag;
    if (!active || (event && event.pointerId !== active.id)) return;
    drag = undefined;
    if (button.hasPointerCapture(active.id))
      button.releasePointerCapture(active.id);
    const cancelled = !event || event.type !== 'pointerup';
    if (cancelled || event?.pointerType === 'touch') pointerHovered = false;
    else if (event) {
      const rect = button.getBoundingClientRect();
      pointerHovered =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;
    }
    reactions.drag(false);
    reactions.hover(pointerHovered || keyboardHovered);
    renderState();
    if (active.started) emit('dragend', { x, y, cancelled });
  }
  button.addEventListener('pointerup', endDrag, { signal: lifecycle.signal });
  button.addEventListener('pointercancel', endDrag, {
    signal: lifecycle.signal,
  });
  button.addEventListener('lostpointercapture', endDrag, {
    signal: lifecycle.signal,
  });
  button.addEventListener(
    'click',
    (event) => {
      if (dragged && event.detail !== 0) {
        dragged = false;
        return;
      }
      if (reactions.click()) renderState(true);
      emit('click', undefined);
    },
    { signal: lifecycle.signal },
  );
  function resetGestures() {
    endDrag();
    pointerHovered = false;
    keyboardHovered = false;
    reactions.reset();
    renderState();
  }
  window.addEventListener('blur', resetGestures, { signal: lifecycle.signal });

  let send: HTMLButtonElement | undefined;
  const chat = options.chat;
  let restoreMessage: (() => void) | undefined;
  function cancelMessage() {
    request?.abort(new DOMException('Message cancelled.', 'AbortError'));
    request = undefined;
    const restore = restoreMessage;
    restoreMessage = undefined;
    restore?.();
    if (send) send.disabled = false;
  }
  async function sendMessage(value: string): Promise<string> {
    if (destroyed) throw new Error('The pet has been destroyed.');
    if (!chat)
      throw new Error('Configure chat.onMessage before sending messages.');
    const message = value.trim();
    if (!message) throw new Error('A message cannot be empty.');
    cancelMessage();
    const active = new AbortController();
    request = active;
    if (send) send.disabled = true;
    const previous = current || fallback;
    if (states.has('thinking')) play('thinking');
    const thinkingRevision = revision;
    restoreMessage = () => {
      if (!destroyed && revision === thinkingRevision) play(previous);
    };
    emit('messagestart', { message });
    let abortListener: (() => void) | undefined;
    try {
      active.signal.throwIfAborted();
      const aborted = new Promise<never>((_, reject) => {
        abortListener = () => reject(active.signal.reason);
        active.signal.addEventListener('abort', abortListener, { once: true });
      });
      const reply = await Promise.race([
        Promise.resolve().then(() => {
          active.signal.throwIfAborted();
          return chat.onMessage(message, { signal: active.signal });
        }),
        aborted,
      ]);
      active.signal.throwIfAborted();
      if (destroyed || request !== active)
        throw new DOMException('Message superseded.', 'AbortError');
      say(reply);
      emit('messageend', { message, reply });
      return reply;
    } catch (cause) {
      const error = cause instanceof Error ? cause : new Error(String(cause));
      if (!destroyed && !active.signal.aborted && request === active) {
        say(chat.errorMessage ?? 'Could not reply. Please try again.');
        emit('messageerror', { message, error });
      }
      throw error;
    } finally {
      if (abortListener)
        active.signal.removeEventListener('abort', abortListener);
      if (request === active) {
        request = undefined;
        if (send) send.disabled = false;
        const restore = restoreMessage;
        restoreMessage = undefined;
        restore?.();
      }
    }
  }
  async function preload(
    names: readonly string[] = [...states.keys()],
    config: PreloadOptions = {},
  ): Promise<void> {
    if (destroyed) throw new Error('The pet has been destroyed.');
    const selected = [...new Set(names)];
    const snapshot = selected.map((name) => {
      const state = states.get(name);
      if (!state) throw new Error('Unknown state: ' + name);
      return state;
    });
    const timeout = config.timeout ?? 15000;
    if (!Number.isFinite(timeout) || timeout <= 0)
      throw new Error('Preload timeout must be positive.');
    config.signal?.throwIfAborted();
    const active = new AbortController();
    const abort = () => active.abort(config.signal?.reason);
    config.signal?.addEventListener('abort', abort, { once: true });
    loads.add(active);
    const token = registryRevision;
    try {
      emit('loading', { states: selected });
      await loadAssets(snapshot, active.signal, timeout);
      active.signal.throwIfAborted();
      if (token !== registryRevision)
        throw new DOMException(
          'State registry changed during preload.',
          'AbortError',
        );
      emit('ready', { states: selected });
    } catch (cause) {
      const error = cause instanceof Error ? cause : new Error(String(cause));
      const cancelled = active.signal.aborted || error.name === 'AbortError';
      active.abort(error);
      if (!destroyed && !cancelled)
        emit('loaderror', { states: selected, error });
      throw error;
    } finally {
      config.signal?.removeEventListener('abort', abort);
      loads.delete(active);
    }
  }
  if (chat) {
    const form = document.createElement('form');
    const input = document.createElement('input');
    input.placeholder = chat.placeholder ?? 'Say something…';
    input.setAttribute('aria-label', 'Message to companion');
    input.maxLength = 2000;
    send = document.createElement('button');
    send.className = 'send';
    send.type = 'submit';
    send.textContent = '↑';
    send.setAttribute('aria-label', 'Send message');
    form.append(input, send);
    form.part.add('chat');
    input.part.add('chat-input');
    send.part.add('chat-send');
    ui.setChat(form);
    form.addEventListener(
      'submit',
      (event) => {
        event.preventDefault();
        const message = input.value.trim();
        if (!message || request) return;
        input.value = '';
        void sendMessage(message).catch(() => {});
      },
      { signal: lifecycle.signal },
    );
  }
  function hide() {
    if (destroyed) return;
    host.hidden = true;
    layer.hide();
    resetGestures();
    cancelMessage();
    syncPlayback();
  }
  close.addEventListener('click', hide, { signal: lifecycle.signal });
  window.addEventListener('resize', position, { signal: lifecycle.signal });
  if (bounded)
    document.addEventListener('scroll', position, {
      capture: true,
      signal: lifecycle.signal,
    });
  document.addEventListener(
    'visibilitychange',
    () => {
      if (document.hidden) resetGestures();
      syncPlayback();
    },
    {
      signal: lifecycle.signal,
    },
  );
  motion.addEventListener('change', syncPlayback, { signal: lifecycle.signal });
  position();
  play(fallback);

  const api: Pet = {
    element: host,
    get state() {
      return current;
    },
    get position() {
      return { x, y };
    },
    get paused() {
      return paused;
    },
    get draggable() {
      return draggable;
    },
    setPosition(value) {
      if (destroyed) return;
      validatePosition(value);
      endDrag();
      anchor = undefined;
      x = value.x;
      y = value.y;
      position();
      emit('move', { x, y });
    },
    setSize(width, height) {
      if (destroyed) return;
      validateSize(width, height);
      endDrag();
      character.width = width;
      character.height = height;
      button.style.width = width + 'px';
      button.style.height = height + 'px';
      position();
      emit('resize', { width, height });
    },
    setDraggable(enabled) {
      if (destroyed) return;
      if (!enabled) endDrag();
      draggable = enabled;
    },
    setAnchor(
      value,
      nextOffset = value === 'center' ? { x: 0, y: 0 } : { x: 24, y: 24 },
    ) {
      if (destroyed) return;
      validateAnchor(value);
      validatePosition(nextOffset);
      endDrag();
      anchor = value;
      offset = { ...nextOffset };
      position();
      emit('move', { x, y });
    },
    hasState(name) {
      return states.has(name);
    },
    getStates() {
      return [...states.keys()];
    },
    removeState(name) {
      if (destroyed || !states.delete(name)) return false;
      registryRevision++;
      if (fallback === name) fallback = states.keys().next().value ?? '';
      renderState();
      return true;
    },
    setDefaultState(name) {
      if (destroyed) return;
      if (!states.has(name)) throw new Error('Unknown state: ' + name);
      fallback = name;
    },
    preload,
    pause() {
      if (!destroyed) {
        paused = true;
        syncPlayback();
      }
    },
    resume() {
      if (!destroyed) {
        paused = false;
        syncPlayback();
      }
    },
    sendMessage,
    cancelMessage,
    react(name) {
      if (destroyed || !reactions.triggerState(name)) return false;
      renderState(true);
      return true;
    },
    stopReaction() {
      if (destroyed) return;
      reactions.stop();
      renderState();
    },
    addState(name, state) {
      if (destroyed) return api;
      if (!name.trim()) throw new Error('A state needs a name.');
      validateState(state);
      states.set(
        name,
        'frames' in state
          ? { ...state, frames: [...state.frames] }
          : { ...state },
      );
      registryRevision++;
      if (!fallback) fallback = name;
      if (!current) reactions.play(fallback);
      renderState(current === name);
      return api;
    },
    addReaction(action, state) {
      if (destroyed) return api;
      reactions.add(action, state);
      renderState();
      return api;
    },
    removeReaction(action) {
      if (destroyed) return api;
      reactions.remove(action);
      renderState();
      return api;
    },
    play,
    say,
    setBubbleEnabled(enabled) {
      if (destroyed) return;
      ui.setEnabled(enabled);
      position();
    },
    dismissBubble() {
      if (destroyed) return;
      ui.dismiss();
      position();
    },
    setPanel(content) {
      if (destroyed) return;
      ui.setPanel(content);
      position();
    },
    setBubbleClose(content) {
      if (destroyed) return;
      ui.setClose(content);
      position();
    },
    hide,
    show() {
      if (!destroyed) {
        host.hidden = false;
        layer.show();
        position();
        syncPlayback();
      }
    },
    on(event, listener) {
      if (destroyed) return () => {};
      const bucket = listeners.get(event) ?? new Set();
      listeners.set(event, bucket);
      const callback = listener as (detail: never) => void;
      bucket.add(callback);
      return () => {
        bucket.delete(callback);
      };
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      endDrag();
      lifecycle.abort();
      cancelMessage();
      for (const load of loads)
        load.abort(new DOMException('Pet destroyed.', 'AbortError'));
      loads.clear();
      renderer.destroy();
      panelObserver.disconnect();
      cancelAnimationFrame(geometryFrame);
      layer.destroy();
      ui.destroy();
      listeners.clear();
      states.clear();
      host.remove();
    },
  };
  return api;
}
