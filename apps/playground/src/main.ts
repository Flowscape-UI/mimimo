import { type DskInput, type DskInputUpload } from '@flowscape-ui/dsk';
import '@flowscape-ui/dsk';
import '@flowscape-ui/dsk/styles.css';
import {
  createPet,
  definePet,
  type Pet,
  type PetState,
  type PetAction,
  type PetAnchor,
} from 'mimimo';
import { mochi } from 'mimimo-pet-mochi';
import { byte } from 'mimimo-pet-byte';
import { flowy } from 'mimimo-pet-flowy';
import { testStates } from './assets';
import { view } from './view';
import { mountDemoPanel } from './panels';
import './style.css';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('Missing playground root');
app.innerHTML = view;
function element<T extends HTMLElement>(id: string): T {
  const value = document.getElementById(id);
  if (!value) throw new Error('Missing control: ' + id);
  return value as T;
}
const input = (id: string) => element<HTMLInputElement>(id);
const numeric = (id: string) => element<DskInput>(id);
const upload = (id: string) => element<DskInputUpload>(id);
const stage = element<HTMLDivElement>('stage');
const feedback = element<HTMLParagraphElement>('feedback');
const stateOutput = element<HTMLOutputElement>('state');
const lifecycle = element<HTMLSpanElement>('lifecycle');
const actions: PetAction[] = ['hover', 'click', 'drag'];
interface Entry {
  state: PetState;
  urls: string[];
  files: string[];
}
const states = new Map<string, Entry>();
let pet: Pet;
let disposePanel: (() => void) | undefined;
let closeEvents: AbortController | undefined;
let profile = location.pathname === '/media.html' ? 'assets' : 'mochi';
let reactions: Partial<Record<PetAction, string>> = {};
let removed = false;
let editing: string | undefined;
let pending: File[] = [];
let clicks = 0;
let lastMove = 0;
let size = { width: 128, height: 128 };
let dragEnabled = true;
let chatEnabled = false;
let globalEnvironment = false;
const disposers = new AbortController();
const signal = disposers.signal;

function report(message: string, error = false) {
  feedback.textContent = message;
  feedback.dataset.error = String(error);
}
function log(name: string, detail?: unknown) {
  const row = document.createElement('li');
  const time = document.createElement('time');
  time.textContent = new Date().toLocaleTimeString('ru-RU');
  row.append(
    time,
    name + (detail === undefined ? '' : ' ' + JSON.stringify(detail)),
  );
  const list = element<HTMLOListElement>('events');
  list.prepend(row);
  while (list.children.length > 60) list.lastElementChild?.remove();
}
function showCode(code: string) {
  element<HTMLElement>('api-code').textContent = code;
}
function fileUrl(value: string, entry: Entry): string {
  const index = entry.urls.indexOf(value);
  if (index >= 0) return '/assets/' + (entry.files[index] ?? 'poster.png');
  if (value.startsWith('data:')) return '/assets/frame.svg';
  return value;
}
function describe(entry: Entry): PetState {
  const state = entry.state;
  if ('frames' in state)
    return {
      ...state,
      frames: state.frames.map((path) => fileUrl(path, entry)),
    };
  return {
    ...state,
    path: fileUrl(state.path, entry),
    ...('poster' in state && state.poster
      ? { poster: fileUrl(state.poster, entry) }
      : {}),
  };
}
function releaseUnused(urls: readonly string[]) {
  const used = new Set([...states.values()].flatMap((entry) => entry.urls));
  for (const url of urls) if (!used.has(url)) URL.revokeObjectURL(url);
}
function initialPosition() {
  const rect = globalEnvironment
    ? { width: window.innerWidth, height: window.innerHeight }
    : stage.getBoundingClientRect();
  return {
    x: (rect.width - size.width) / 2,
    y: (rect.height - size.height) / 2,
  };
}
function syncStateList() {
  const list = element<HTMLDivElement>('states');
  const suggestions = element<HTMLDataListElement>('state-names');
  const defaults = element<HTMLSelectElement>('default-state');
  const selectedDefault = defaults.value;
  defaults.replaceChildren();
  list.replaceChildren();
  suggestions.replaceChildren();
  for (const [name, entry] of states) {
    const row = document.createElement('div');
    row.className = 'state-row';
    const play = document.createElement('button');
    play.className = 'state-play';
    play.dataset.state = name;
    play.setAttribute('aria-pressed', String(pet?.state === name && !removed));
    play.append(document.createTextNode(name));
    const type = document.createElement('small');
    type.textContent =
      entry.state.type ?? ('frames' in entry.state ? 'frames' : 'image');
    play.append(type);
    play.addEventListener('click', () => playState(name));
    const edit = document.createElement('button');
    edit.textContent = 'Изменить';
    edit.setAttribute('aria-label', 'Изменить ' + name);
    edit.addEventListener('click', () => editState(name));
    const remove = document.createElement('button');
    remove.textContent = '×';
    remove.setAttribute('aria-label', 'Удалить состояние ' + name);
    remove.addEventListener('click', () => {
      states.delete(name);
      if (editing === name) resetEditor();
      pet.removeState(name);
      syncStateList();
      updateCurrent();
      if (!states.size) {
        pet.hide();
        lifecycle.textContent = 'нет ассетов';
      }
      releaseUnused(entry.urls);
      log('state removed', name);
    });
    row.append(play, edit, remove);
    list.append(row);
    const option = document.createElement('option');
    option.value = name;
    suggestions.append(option);
    defaults.append(option.cloneNode(true));
  }
  if (states.has(selectedDefault)) defaults.value = selectedDefault;
  element('empty').hidden = states.size !== 0;
}
function updateCurrent() {
  stateOutput.value = removed ? '-' : pet.state || '-';
  for (const button of document.querySelectorAll<HTMLButtonElement>(
    '.state-play',
  ))
    button.setAttribute(
      'aria-pressed',
      String(!removed && button.dataset.state === pet.state),
    );
}
function recreate() {
  disposePanel?.();
  closeEvents?.abort();
  pet?.destroy();
  removed = false;
  clicks = 0;
  element<HTMLOutputElement>('click-count').value = '0';
  pet = createPet({
    id: profile,
    name:
      profile === 'mochi'
        ? 'Mochi'
        : profile === 'byte'
          ? 'Byte'
          : profile === 'flowy'
            ? 'Flowy'
            : 'Asset companion',
    ...size,
    states: Object.fromEntries(
      [...states].map(([name, entry]) => [name, entry.state]),
    ),
    bubble: input('bubble-enabled').checked,
    draggable: dragEnabled,
    reactions,
    ...(globalEnvironment ? {} : { container: stage }),
    position: initialPosition(),
    ...(chatEnabled
      ? {
          chat: {
            async onMessage(
              message: string,
              { signal: requestSignal }: { signal: AbortSignal },
            ) {
              await new Promise<void>((resolve, reject) => {
                const abort = () => {
                  clearTimeout(timer);
                  reject(new Error('Cancelled'));
                };
                const timer = window.setTimeout(() => {
                  requestSignal.removeEventListener('abort', abort);
                  resolve();
                }, 350);
                requestSignal.addEventListener('abort', abort, { once: true });
              });
              return 'Локальный ответ: ' + message;
            },
          },
        }
      : {}),
  });
  pet.on('statechange', ({ state }) => {
    updateCurrent();
    log('statechange', state);
  });
  pet.on('mediaerror', ({ state, error }) => {
    report(error.message, true);
    log('mediaerror', { state, message: error.message });
  });
  pet.on('click', () => {
    element<HTMLOutputElement>('click-count').value = String(++clicks);
    log('click');
  });
  pet.on('move', (value) => {
    if (performance.now() - lastMove > 100) {
      log('move', value);
      lastMove = performance.now();
    }
  });
  pet.on('dragstart', (value) => log('dragstart', value));
  pet.on('dragend', (value) => log('dragend', value));
  for (const event of [
    'animationend',
    'loading',
    'ready',
    'loaderror',
    'resize',
    'messagestart',
    'messageend',
    'messageerror',
  ] as const)
    pet.on(event, (value) => log(event, value));
  lifecycle.textContent = '';
  if (!states.size) {
    pet.hide();
    lifecycle.textContent = 'нет ассетов';
  }
  syncPanels();
  pet.say({
    title: 'Готов к экспериментам',
    description: 'Добавьте состояние или проверьте реакции',
  });
  syncStateList();
  updateCurrent();
  log('createPet', { profile, ...size, draggable: dragEnabled });
}
function syncPanels() {
  disposePanel?.();
  disposePanel = undefined;
  closeEvents?.abort();
  closeEvents = new AbortController();
  pet.setBubbleEnabled(input('bubble-enabled').checked);
  pet.element.classList.toggle(
    'custom-pet-style',
    input('custom-style').checked,
  );
  if (input('custom-panel').checked)
    disposePanel = mountDemoPanel(pet, chatEnabled);
  else pet.setPanel(null);
  if (input('custom-close').checked) {
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'pet-message-close';
    close.textContent = '×';
    close.setAttribute('aria-label', 'Закрыть мысль');
    close.addEventListener('click', () => pet.dismissBubble(), {
      signal: closeEvents.signal,
    });
    pet.setBubbleClose(close);
  } else pet.setBubbleClose(null);
}
function playState(name: string) {
  if (removed) recreate();
  pet.show();
  pet.play(name);
  lifecycle.textContent = '';
  showCode('pet.play(' + JSON.stringify(name) + ');');
}
function resetEditor() {
  editing = undefined;
  pending = [];
  element<HTMLFormElement>('asset-form').reset();
  // Uploads are not form-associated. Reset their selection explicitly.
  upload('poster').clear();
  for (const [id, value] of Object.entries({
    fps: 8,
    speed: 1,
    columns: 2,
    rows: 2,
    count: 4,
    start: 0,
  }))
    numeric(id).value = value;
  upload('files').clear();
  input('frame-files').value = '';
  element('editor-heading').textContent = 'Добавить состояние';
  element('file-summary').textContent =
    'Выберите файл или перетащите его в область просмотра.';
  formatFields();
}
function selectProfile(next: string) {
  pet?.destroy();
  for (const entry of states.values())
    entry.urls.forEach((url) => URL.revokeObjectURL(url));
  states.clear();
  profile = next;
  const initial =
    next === 'mochi'
      ? mochi.animations
      : next === 'byte'
        ? byte.animations
        : next === 'flowy'
          ? flowy.animations
          : next === 'assets'
            ? testStates()
            : {};
  for (const [name, state] of Object.entries(initial))
    states.set(name, { state, urls: [], files: [] });
  reactions = {};
  for (const action of actions)
    input('reaction-' + action).value =
      next === 'assets'
        ? { hover: 'curious', click: 'jump', drag: 'grabbed' }[action]
        : next === 'custom'
          ? ''
          : next === 'flowy'
            ? { hover: 'working', click: 'happy', drag: 'happy' }[action]
            : { hover: 'thinking', click: 'happy', drag: 'sleep' }[action];
  for (const button of document.querySelectorAll<HTMLButtonElement>(
    '[data-pet]',
  ))
    button.setAttribute('aria-pressed', String(button.dataset.pet === next));
  element('samples').hidden = next !== 'assets';
  resetEditor();
  report('');
  recreate();
  showCode(
    next === 'custom'
      ? 'const pet = createPet();'
      : 'const pet = createPet({ character: ' +
          (next === 'assets' ? 'myPet' : next) +
          ' });',
  );
}
function formatFields() {
  const type = element<HTMLSelectElement>('type').value;
  const timeline = type === 'frames' || type === 'sprite';
  const allowed = new Set([
    ...(timeline ? ['fps', 'speed', 'loop'] : []),
    ...(type === 'sprite' ? ['sprite'] : []),
    ...(type === 'video' ? ['speed', 'loop', 'poster'] : []),
    ...(type === 'gif' ? ['poster'] : []),
  ]);
  for (const field of document.querySelectorAll<HTMLElement>('[data-field]')) {
    field.hidden = !allowed.has(field.dataset.field ?? '');
    for (const control of field.querySelectorAll<
      HTMLInputElement | DskInput | DskInputUpload
    >('input, dsk-input, dsk-input-upload'))
      control.disabled = field.hidden;
  }
  upload('files').hidden = type === 'frames';
  upload('files').disabled = type === 'frames';
  input('frame-files').hidden = type !== 'frames';
  input('frame-files').disabled = type !== 'frames';
  upload('files').accept =
    type === 'video' ? 'video/*' : type === 'gif' ? 'image/gif' : 'image/*';
  element('format-hint').textContent =
    type === 'gif'
      ? 'Скорость и повторение GIF задаются самим файлом. Статичный кадр используется при reduced motion.'
      : type === 'sprite'
        ? 'Равномерная сетка без отступов. Кадры идут слева направо, затем сверху вниз.'
        : type === 'frames'
          ? 'Кадры воспроизводятся в порядке выбранных файлов. Скорость 1 = обычная.'
          : type === 'video'
            ? 'Без звука. Поддержка кодека и прозрачности зависит от браузера.'
            : 'Статичное изображение с прозрачным фоном поддерживается.';
}
function editState(name: string) {
  const entry = states.get(name);
  if (!entry) return;
  resetEditor();
  editing = name;
  input('name').value = name;
  const state = entry.state;
  element<HTMLSelectElement>('type').value =
    state.type ?? ('frames' in state ? 'frames' : 'image');
  if ('fps' in state) numeric('fps').value = String(state.fps);
  if ('speed' in state) numeric('speed').value = String(state.speed ?? 1);
  if ('loop' in state) input('loop').checked = state.loop ?? true;
  if (state.type === 'sprite') {
    numeric('columns').value = String(state.columns);
    numeric('rows').value = String(state.rows);
    numeric('count').value = String(state.frameCount);
    numeric('start').value = String(state.startFrame ?? 0);
  }
  formatFields();
  element('editor-heading').textContent = 'Изменить: ' + name;
  element('file-summary').textContent =
    'Текущие файлы: ' +
    (entry.files.join(', ') || 'встроенный ассет') +
    '. Выберите новые только для замены.';
  element('editor-heading').scrollIntoView({ block: 'nearest' });
}
function chooseFiles(files: File[], detect: boolean) {
  pending = files;
  if (detect && files[0]) {
    element<HTMLSelectElement>('type').value =
      files.length > 1
        ? 'frames'
        : files[0].type.startsWith('video/')
          ? 'video'
          : /\.gif$/i.test(files[0].name)
            ? 'gif'
            : 'image';
    if (!editing && ['', 'my-animation'].includes(input('name').value))
      input('name').value = files[0].name.replace(/\.[^.]+$/, '');
    formatFields();
  }
  element('file-summary').textContent =
    files.map((file) => file.name).join(' → ') || 'Файл не выбран.';
}
function saveState(event: Event) {
  event.preventDefault();
  const name = input('name').value.trim();
  const type = element<HTMLSelectElement>('type').value;
  const old = editing ? states.get(editing) : undefined;
  const created: string[] = [];
  try {
    if (!name) throw new Error('Укажите имя состояния.');
    if (type !== 'frames' && pending.length > 1)
      throw new Error('Для этого формата выберите один файл.');
    const paths = pending.length
      ? pending.map((file) => {
          const url = URL.createObjectURL(file);
          created.push(url);
          return url;
        })
      : old
        ? 'frames' in old.state
          ? [...old.state.frames]
          : [old.state.path]
        : [];
    const path = paths[0];
    if (!path) throw new Error('Сначала выберите файл.');
    const posterFile = upload('poster').disabled
      ? undefined
      : upload('poster').file;
    const poster = posterFile
      ? URL.createObjectURL(posterFile)
      : old && 'poster' in old.state
        ? old.state.poster
        : undefined;
    if (posterFile && poster) created.push(poster);
    const fps = Number(numeric('fps').value);
    const speed = Number(numeric('speed').value);
    const loop = input('loop').checked;
    let state: PetState;
    if (type === 'frames') state = { frames: paths, fps, speed, loop };
    else if (type === 'sprite')
      state = {
        type,
        path,
        fps,
        speed,
        loop,
        columns: Number(numeric('columns').value),
        rows: Number(numeric('rows').value),
        frameCount: Number(numeric('count').value),
        startFrame: Number(numeric('start').value),
      };
    else if (type === 'video')
      state = { type, path, speed, loop, ...(poster ? { poster } : {}) };
    else if (type === 'gif')
      state = { type, path, ...(poster ? { poster } : {}) };
    else state = { type: 'image', path };
    definePet({
      id: 'validation',
      name: 'Validation',
      ...size,
      animations: { [name]: state },
    });
    const entry: Entry = {
      state,
      urls: [
        ...new Set(
          [...paths, ...(poster ? [poster] : [])].filter(
            (url) => created.includes(url) || old?.urls.includes(url),
          ),
        ),
      ],
      files: pending.length
        ? [
            ...pending.map((file) => file.name),
            ...(posterFile ? [posterFile.name] : []),
          ]
        : [...(old?.files ?? [])],
    };
    const replaced = states.get(name);
    // Update the registry without replacing the live pet.
    if (editing && editing !== name) states.delete(editing);
    states.set(name, entry);
    if (removed) recreate();
    else {
      pet.addState(name, state);
      if (editing && editing !== name) pet.removeState(editing);
    }
    pet.show();
    pet.play(name);
    lifecycle.textContent = '';
    releaseUnused([...(old?.urls ?? []), ...(replaced?.urls ?? [])]);
    syncStateList();
    showCode(
      'pet.addState(' +
        JSON.stringify(name) +
        ', ' +
        JSON.stringify(describe(entry), null, 2) +
        ');\npet.play(' +
        JSON.stringify(name) +
        ');\n// /assets paths stand for your hosted files.',
    );
    report('Состояние сохранено: ' + name);
    editing = name;
    pending = [];
    upload('files').clear();
    input('frame-files').value = '';
    upload('poster').clear();
    element('file-summary').textContent =
      'Файлы сохранены. Можно менять параметры без повторной загрузки.';
    element('editor-heading').textContent = 'Изменить: ' + name;
  } catch (error) {
    created.forEach((url) => URL.revokeObjectURL(url));
    report(
      error instanceof Error ? error.message : 'Не удалось добавить состояние.',
      true,
    );
  }
}
for (const button of document.querySelectorAll<HTMLButtonElement>('[data-pet]'))
  button.addEventListener(
    'click',
    () => selectProfile(button.dataset.pet ?? 'custom'),
    { signal },
  );
element('apply-pet').addEventListener(
  'click',
  () => {
    const next = {
      width: Number(numeric('width').value),
      height: Number(numeric('height').value),
    };
    if (
      ![next.width, next.height].every(
        (n) => Number.isFinite(n) && n >= 16 && n <= 512,
      )
    ) {
      report('Размер должен быть от 16 до 512 px.', true);
      return;
    }
    size = next;
    dragEnabled = input('draggable').checked;
    const nextChat = input('chat').checked;
    if (removed || nextChat !== chatEnabled) {
      chatEnabled = nextChat;
      recreate();
    } else {
      pet.setSize(size.width, size.height);
      pet.setDraggable(dragEnabled);
    }
    showCode(
      'pet.setSize(' +
        size.width +
        ', ' +
        size.height +
        ');\npet.setDraggable(' +
        dragEnabled +
        ');',
    );
  },
  { signal },
);
element('new-state').addEventListener('click', resetEditor, { signal });
element('asset-form').addEventListener('submit', saveState, { signal });
element('type').addEventListener(
  'change',
  () => {
    pending = [];
    upload('files').clear();
    input('frame-files').value = '';
    element('file-summary').textContent =
      'Выберите файл для выбранного формата.';
    formatFields();
  },
  { signal },
);
upload('files').addEventListener(
  'change',
  () =>
    chooseFiles(
      [...upload('files').files],
      !editing && element<HTMLSelectElement>('type').value === 'image',
    ),
  { signal },
);
input('frame-files').addEventListener(
  'change',
  () => chooseFiles(Array.from(input('frame-files').files ?? []), false),
  { signal },
);
for (const id of ['files', 'poster'])
  upload(id).addEventListener(
    'dsk-upload-reject',
    () => report('Этот файл не подходит для выбранного формата.', true),
    { signal },
  );
stage.addEventListener(
  'dragover',
  (event) => {
    event.preventDefault();
    stage.classList.add('dragover');
  },
  { signal },
);
stage.addEventListener('dragleave', () => stage.classList.remove('dragover'), {
  signal,
});
stage.addEventListener(
  'drop',
  (event) => {
    event.preventDefault();
    stage.classList.remove('dragover');
    resetEditor();
    const files = Array.from(event.dataTransfer?.files ?? []);
    chooseFiles(files, true);
    if (files.length === 1) upload('files').file = files[0] ?? null;
    element('editor-heading').scrollIntoView({ block: 'nearest' });
    report('Проверьте формат и нажмите «Сохранить и запустить».');
  },
  { signal },
);
element('show').addEventListener(
  'click',
  () => {
    if (removed) recreate();
    pet.show();
    lifecycle.textContent = '';
    showCode('pet.show();');
    log('show');
  },
  { signal },
);
element('hide').addEventListener(
  'click',
  () => {
    pet.hide();
    lifecycle.textContent = 'скрыт';
    showCode('pet.hide();');
    log('hide');
  },
  { signal },
);
element('destroy').addEventListener(
  'click',
  () => {
    pet.destroy();
    removed = true;
    lifecycle.textContent = 'удалён';
    updateCurrent();
    showCode('pet.destroy();');
    log('destroy');
  },
  { signal },
);
element('center').addEventListener(
  'click',
  () => {
    pet.setAnchor('center', { x: 0, y: 0 });
    showCode("pet.setAnchor('center', { x: 0, y: 0 });");
  },
  { signal },
);
for (const [id, name] of Object.entries({
  frames: 'jump',
  sprite: 'sheet',
  gif: 'gif',
  video: 'clip',
  unknown: 'not-registered',
}))
  document
    .getElementById(id)
    ?.addEventListener('click', () => playState(name), { signal });
element('reactions-form').addEventListener(
  'submit',
  (event) => {
    event.preventDefault();
    reactions = {};
    for (const action of actions) {
      const name = input('reaction-' + action).value.trim();
      if (name) {
        reactions[action] = name;
        pet.addReaction(action, name);
      } else pet.removeReaction(action);
    }
    showCode(
      actions
        .map((action) =>
          reactions[action]
            ? 'pet.addReaction(' +
              JSON.stringify(action) +
              ', ' +
              JSON.stringify(reactions[action]) +
              ');'
            : 'pet.removeReaction(' + JSON.stringify(action) + ');',
        )
        .join('\n'),
    );
    log('reactions', reactions);
  },
  { signal },
);
element('clear-reactions').addEventListener(
  'click',
  () => {
    reactions = {};
    for (const action of actions) {
      pet.removeReaction(action);
      input('reaction-' + action).value = '';
    }
    showCode(
      actions
        .map((action) => 'pet.removeReaction(' + JSON.stringify(action) + ');')
        .join('\n'),
    );
    log('reactions cleared');
  },
  { signal },
);
element('remove-hover').addEventListener(
  'click',
  () => {
    delete reactions.hover;
    pet.removeReaction('hover');
    input('reaction-hover').value = '';
    showCode("pet.removeReaction('hover');");
  },
  { signal },
);
element('say-form').addEventListener(
  'submit',
  (event) => {
    event.preventDefault();
    const message = input('description').value
      ? {
          title: input('message').value,
          description: input('description').value,
        }
      : input('message').value;
    pet.say(message);
    showCode('pet.say(' + JSON.stringify(message, null, 2) + ');');
    log('say', input('message').value);
  },
  { signal },
);
element('clear-log').addEventListener(
  'click',
  () => element('events').replaceChildren(),
  { signal },
);
element('copy-code').addEventListener(
  'click',
  async () => {
    try {
      await navigator.clipboard.writeText(
        element('api-code').textContent ?? '',
      );
      report('Код скопирован.');
    } catch {
      report('Не удалось скопировать. Выделите код вручную.', true);
    }
  },
  { signal },
);

element('react-state').addEventListener(
  'click',
  () => {
    const name = input('manual-state').value;
    report(pet.react(name) ? 'Реакция: ' + name : 'Такого состояния нет.');
    showCode('pet.react(' + JSON.stringify(name) + ');');
  },
  { signal },
);
element('stop-reaction').addEventListener(
  'click',
  () => {
    pet.stopReaction();
    showCode('pet.stopReaction();');
  },
  { signal },
);
element('pause').addEventListener(
  'click',
  () => {
    pet.pause();
    showCode('pet.pause();');
  },
  { signal },
);
element('resume').addEventListener(
  'click',
  () => {
    pet.resume();
    showCode('pet.resume();');
  },
  { signal },
);
element('set-default').addEventListener(
  'click',
  () => {
    const name = element<HTMLSelectElement>('default-state').value;
    if (!name) return;
    pet.setDefaultState(name);
    showCode('pet.setDefaultState(' + JSON.stringify(name) + ');');
  },
  { signal },
);
element('environment').addEventListener(
  'change',
  () => {
    globalEnvironment =
      element<HTMLSelectElement>('environment').value === 'global';
    recreate();
    showCode(
      globalEnvironment
        ? 'createPet({ states });'
        : 'createPet({ states, container: stage });',
    );
    log('environment', globalEnvironment ? 'global' : 'local');
  },
  { signal },
);
element('set-position').addEventListener(
  'click',
  () => {
    const value = {
      x: numeric('position-x').valueAsNumber,
      y: numeric('position-y').valueAsNumber,
    };
    pet.setPosition(value);
    showCode('pet.setPosition(' + JSON.stringify(value) + ');');
  },
  { signal },
);
element('set-anchor').addEventListener(
  'click',
  () => {
    const anchor = element<HTMLSelectElement>('anchor').value as PetAnchor;
    pet.setAnchor(anchor, { x: 0, y: 0 });
    showCode('pet.setAnchor(' + JSON.stringify(anchor) + ', { x: 0, y: 0 });');
  },
  { signal },
);
element('preload').addEventListener(
  'click',
  async () => {
    const instance = pet;
    report('Загрузка ассетов…');
    showCode('await pet.preload();');
    try {
      await instance.preload();
      if (pet === instance) report('Все ассеты готовы.');
    } catch (error) {
      if (pet === instance)
        report(
          error instanceof Error ? error.message : 'Ошибка загрузки',
          true,
        );
    }
  },
  { signal },
);
element('send-chat').addEventListener(
  'click',
  async () => {
    showCode(
      'await pet.sendMessage(' + JSON.stringify(input('message').value) + ');',
    );
    try {
      await pet.sendMessage(input('message').value);
    } catch (error) {
      report(error instanceof Error ? error.message : 'Ошибка чата', true);
    }
  },
  { signal },
);
element('cancel-chat').addEventListener(
  'click',
  () => {
    pet.cancelMessage();
    showCode('pet.cancelMessage();');
  },
  { signal },
);
for (const id of [
  'bubble-enabled',
  'custom-panel',
  'custom-close',
  'custom-style',
])
  input(id).addEventListener('change', syncPanels, { signal });
element('dismiss-bubble').addEventListener(
  'click',
  () => {
    pet.dismissBubble();
    showCode('pet.dismissBubble();');
  },
  { signal },
);
if (window.innerWidth <= 760)
  element<HTMLDetailsElement>('inspector').open = false;
selectProfile(profile);
function dispose() {
  disposePanel?.();
  closeEvents?.abort();
  pet.destroy();
  disposers.abort();
  for (const entry of states.values())
    entry.urls.forEach((url) => URL.revokeObjectURL(url));
}
window.addEventListener('pagehide', dispose, { once: true });
if (import.meta.hot) import.meta.hot.dispose(dispose);
