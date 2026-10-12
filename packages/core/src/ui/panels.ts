import type { BubbleOptions, PetMessage } from '../types';
import { panelStyles } from './styles';

export function createPanels(
  host: HTMLElement,
  options: boolean | BubbleOptions = true,
) {
  const config = typeof options === 'boolean' ? { enabled: options } : options;
  let enabled = config.enabled ?? true;
  let open = false;
  const style = document.createElement('style');
  style.textContent = panelStyles;
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.part.add('bubble');
  bubble.hidden = true;
  const message = document.createElement('div');
  message.part.add('message');
  message.setAttribute('role', 'status');
  message.setAttribute('aria-live', 'polite');
  message.setAttribute('aria-atomic', 'true');
  const title = document.createElement('div');
  title.part.add('title');
  const description = document.createElement('div');
  description.part.add('description');
  description.hidden = true;
  message.append(title, description);
  const closeSlot = document.createElement('slot');
  closeSlot.name = 'bubble-close';
  const close = document.createElement('button');
  close.type = 'button';
  close.part.add('bubble-close');
  close.textContent = '×';
  close.setAttribute('aria-label', 'Dismiss message');
  closeSlot.append(close);
  closeSlot.hidden = !config.closeButton;
  bubble.append(message, closeSlot);
  const panel = document.createElement('div');
  panel.className = 'panel';
  panel.part.add('panel');
  panel.hidden = true;
  const panelSlot = document.createElement('slot');
  panelSlot.name = 'panel';
  panel.append(panelSlot);
  let customPanel: HTMLElement | null = null;
  let customClose: HTMLElement | null = null;
  let hasChat = false;
  function sync() {
    bubble.hidden = !enabled || !open;
    panel.hidden = !customPanel && !hasChat;
    closeSlot.hidden = !customClose && !config.closeButton;
  }
  function dismiss() {
    if (
      bubble.contains(host.shadowRoot?.activeElement ?? null) ||
      customClose?.contains(document.activeElement)
    ) {
      host.shadowRoot?.querySelector<HTMLButtonElement>('.character')?.focus();
    }
    open = false;
    sync();
  }
  close.addEventListener('click', dismiss);
  function mount(
    content: HTMLElement | null,
    previous: HTMLElement | null,
    slot: string,
  ) {
    if (content === host || content?.contains(host))
      throw new Error('Panel content cannot contain the pet.');
    if (previous && previous !== content && previous.parentNode === host)
      previous.remove();
    if (content) {
      content.slot = slot;
      host.append(content);
    }
    return content;
  }
  return {
    style,
    bubble,
    panel,
    say(value: string | PetMessage) {
      title.textContent = typeof value === 'string' ? value : value.title;
      description.textContent =
        typeof value === 'string' ? '' : (value.description ?? '');
      description.hidden = !description.textContent;
      open = true;
      sync();
    },
    setEnabled(value: boolean) {
      enabled = value;
      sync();
    },
    dismiss,
    setPanel(content: HTMLElement | null) {
      if (content && content === customClose)
        throw new Error(
          'Use separate elements for the panel and close button.',
        );
      customPanel = mount(content, customPanel, 'panel');
      sync();
    },
    setClose(content: HTMLElement | null) {
      if (content && content === customPanel)
        throw new Error(
          'Use separate elements for the panel and close button.',
        );
      customClose = mount(content, customClose, 'bubble-close');
      sync();
    },
    setChat(form: HTMLFormElement) {
      panelSlot.replaceChildren(form);
      hasChat = true;
      sync();
    },
    destroy() {
      close.removeEventListener('click', dismiss);
      customPanel?.remove();
      customClose?.remove();
    },
  };
}
