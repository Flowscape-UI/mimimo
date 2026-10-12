import type { Pet } from '@flowscape-ui/mimimo';

const icons = {
  write:
    '<path d="m4 14 1-4L14 1l4 4-9 9-5 1Z"/><path d="M12 3l4 4M3 6H1v13h13v-3"/>',
  thought: '<path d="M3 3h14v10H8l-5 4V3Z"/><path d="M6 7h8M6 10h5"/>',
  close: '<path d="m5 5 10 10M15 5 5 15"/>',
};
export function mountDemoPanel(pet: Pet, chatEnabled = false): () => void {
  const lifecycle = new AbortController();
  const content = document.createElement('div');
  content.className = 'pet-toolbar';
  const actions = document.createElement('div');
  actions.className = 'pet-toolbar-actions';
  function button(label: string, icon: keyof typeof icons, action: () => void) {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', label);
    button.title = label;
    button.innerHTML =
      '<svg viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
      icons[icon] +
      '</svg>';
    button.addEventListener('click', action, { signal: lifecycle.signal });
    actions.append(button);
    return button;
  }
  const form = document.createElement('form');
  form.hidden = true;
  const input = document.createElement('input');
  input.placeholder = 'Написать питомцу';
  input.setAttribute('aria-label', 'Сообщение в своей панели');
  const send = document.createElement('button');
  send.textContent = '↑';
  send.setAttribute('aria-label', 'Отправить из своей панели');
  form.append(input, send);
  const toggle = button('Написать питомцу', 'write', () => {
    form.hidden = !form.hidden;
    toggle.setAttribute('aria-expanded', String(!form.hidden));
    if (!form.hidden) input.focus();
  });
  toggle.setAttribute('aria-expanded', 'false');
  button('Показать мысль', 'thought', () =>
    pet.say({
      title: 'Проверяю новую анимацию',
      description: 'Все действия задаёт ваш код',
    }),
  );
  button('Скрыть питомца', 'close', () => pet.hide());
  form.addEventListener(
    'submit',
    async (event) => {
      event.preventDefault();
      if (!input.value.trim()) return;
      const message = input.value.trim();
      input.value = '';
      if (chatEnabled) {
        try {
          await pet.sendMessage(message);
        } catch (error) {
          if (
            !lifecycle.signal.aborted &&
            !(error instanceof DOMException && error.name === 'AbortError')
          )
            pet.say('Не удалось отправить сообщение.');
        }
      } else pet.say({ title: 'Вы написали', description: message });
    },
    { signal: lifecycle.signal },
  );
  content.append(actions, form);
  pet.setPanel(content);
  return () => lifecycle.abort();
}
