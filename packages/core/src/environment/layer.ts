type Manager = {
  add(host: HTMLElement): void;
  remove(host: HTMLElement): void;
  refresh(): void;
};
const managers = new WeakMap<Document, Manager>();
const localContainers = new WeakMap<
  HTMLElement,
  { count: number; restore: () => void }
>();

/** Keep local pets in the container's stacking context, outside the top layer. */
export function attachLocalLayer(host: HTMLElement, container: HTMLElement) {
  let entry = localContainers.get(container);
  if (!entry) {
    const changes: Array<() => void> = [];
    const computed = getComputedStyle(container);
    function set(property: string, value: string) {
      const previous = container.style.getPropertyValue(property);
      const priority = container.style.getPropertyPriority(property);
      container.style.setProperty(property, value);
      changes.push(() => {
        if (container.style.getPropertyValue(property) === value)
          container.style.setProperty(property, previous, priority);
      });
    }
    if (computed.position === 'static') set('position', 'relative');
    if (computed.isolation !== 'isolate') set('isolation', 'isolate');
    entry = {
      count: 0,
      restore: () => changes.forEach((restore) => restore()),
    };
    localContainers.set(container, entry);
  }
  entry.count++;
  container.append(host);
  return {
    show() {},
    hide() {},
    destroy() {
      if (--entry.count === 0) {
        entry.restore();
        localContainers.delete(container);
      }
    },
  };
}

/** Share one top-layer coordinator across pets; never patch browser prototypes. */
function createManager(document: Document): Manager {
  const pets = new Set<HTMLElement>();
  const lifetime = new AbortController();
  let modal: HTMLDialogElement | null = null;
  let candidate: HTMLDialogElement | null = null;
  let queued = false;
  function currentModal() {
    if (candidate?.isConnected && candidate.matches(':modal'))
      modal = candidate;
    candidate = null;
    if (!modal?.isConnected || !modal.matches(':modal'))
      modal =
        [...document.querySelectorAll<HTMLDialogElement>('dialog:modal')].at(
          -1,
        ) ?? null;
    return modal;
  }
  function refresh() {
    queued = false;
    if (!pets.size) return;
    const parent =
      currentModal() ?? document.fullscreenElement ?? document.body;
    let focused: Element | null = document.activeElement;
    while (focused?.shadowRoot?.activeElement)
      focused = focused.shadowRoot.activeElement;
    const restore =
      focused instanceof HTMLElement &&
      [...pets].some(
        (pet) => pet === document.activeElement || pet.contains(focused),
      );
    for (const host of pets) {
      const native = typeof host.showPopover === 'function';
      if (native && host.matches(':popover-open')) host.hidePopover();
      if (host.parentNode !== parent) parent.append(host);
      if (native && !host.hidden) host.showPopover();
    }
    if (restore && focused instanceof HTMLElement && focused.isConnected)
      focused.focus({ preventScroll: true });
  }
  function schedule() {
    if (queued) return;
    queued = true;
    queueMicrotask(refresh);
  }
  function onToggle(event: Event) {
    const target = event.composedPath()[0];
    if (!(target instanceof HTMLElement) || pets.has(target)) return;
    if (
      [...pets].some(
        (pet) => pet.contains(target) || pet.shadowRoot?.contains(target),
      )
    )
      return;
    if (
      target instanceof HTMLDialogElement &&
      (event as ToggleEvent).newState === 'open'
    )
      candidate = target;
    schedule();
  }
  document.addEventListener('toggle', onToggle, {
    capture: true,
    signal: lifetime.signal,
  });
  document.addEventListener('beforetoggle', onToggle, {
    capture: true,
    signal: lifetime.signal,
  });
  document.addEventListener('fullscreenchange', schedule, {
    signal: lifetime.signal,
  });
  const observer = new MutationObserver((records) => {
    let changed = false;
    for (const record of records) {
      if (
        record.type === 'attributes' &&
        record.target instanceof HTMLDialogElement
      ) {
        if (record.target.open) candidate = record.target;
        changed = true;
      }
      if (record.type === 'childList') {
        if (modal && !modal.isConnected) changed = true;
        for (const node of record.addedNodes) {
          if (
            node instanceof Element &&
            (node.matches('dialog[open]') || node.querySelector('dialog[open]'))
          )
            changed = true;
        }
      }
    }
    if (changed) schedule();
  });
  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['open'],
  });
  return {
    add(host) {
      pets.add(host);
      if (typeof host.showPopover === 'function') host.popover = 'manual';
      refresh();
    },
    remove(host) {
      pets.delete(host);
      if (
        typeof host.hidePopover === 'function' &&
        host.matches(':popover-open')
      )
        host.hidePopover();
      host.removeAttribute('popover');
      if (!pets.size) {
        lifetime.abort();
        observer.disconnect();
        managers.delete(document);
      }
    },
    refresh,
  };
}
export function attachLayer(host: HTMLElement) {
  const document = host.ownerDocument;
  let manager = managers.get(document);
  if (!manager) {
    manager = createManager(document);
    managers.set(document, manager);
  }
  manager.add(host);
  return {
    show: () => manager.refresh(),
    hide() {
      if (
        typeof host.hidePopover === 'function' &&
        host.matches(':popover-open')
      )
        host.hidePopover();
    },
    destroy: () => manager.remove(host),
  };
}
