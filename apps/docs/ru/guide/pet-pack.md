# Свой пакет питомца

Питомцы Mochi, Byte и Flowy - отдельные пакеты с описанием персонажа и его графикой. Пакет не создаёт DOM и не запускает анимацию при импорте: экземпляр создаёт приложение через `createPet`.

## 1. Подготовьте графику

Выберите [PNG, GIF, видео, спрайт-лист или отдельные кадры](./media). Сохраняйте одинаковый размер холста и точку опоры во всех состояниях, чтобы персонаж не прыгал при переключении. Для примера нужны статичный `idle.png` и равномерный `happy.png` из 16 кадров в сетке 4 × 4.

## 2. Структура пакета

Исходная графика хранится в `assets`, собранная - рядом с JavaScript в `dist/assets`:

```text
my-pet/
  src/index.ts
  assets/idle.png
  assets/happy.png
  dist/index.js
  dist/index.d.ts
  dist/assets/idle.png
  dist/assets/happy.png
  package.json
  README.md
  LICENSE
```

## 3. Экспортируйте описание

Как и Flowy, пакет использует только TypeScript-типы из ядра. `new URL(..., import.meta.url)` привязывает файл к модулю, а не к корню сайта. Ниже пути рассчитаны на собранный `dist/index.js`.

```ts
// src/index.ts
import type { PetDefinition } from '@flowscape-ui/mimimo';

export const myPet = {
  id: 'my-pet',
  name: 'My pet',
  width: 128,
  height: 128,
  initialState: 'idle',
  animations: {
    idle: {
      type: 'image',
      path: new URL('./assets/idle.png', import.meta.url).href,
    },
    happy: {
      type: 'sprite',
      path: new URL('./assets/happy.png', import.meta.url).href,
      columns: 4,
      rows: 4,
      frameCount: 16,
      fps: 12,
      loop: false,
    },
  },
} as const satisfies PetDefinition;
```

## 4. Соберите пакет вместе с ассетами

Замените `@your-scope/my-pet` своим именем. Пример остаётся приватным, пока вы не выберете лицензию для кода и изображений и не решите публиковать его. Для сборки нужны TypeScript и tsdown:

```json
{
  "name": "@your-scope/my-pet",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "sideEffects": false,
  "files": ["dist", "README.md", "LICENSE"],
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" },
    "./assets/*": "./dist/assets/*"
  },
  "peerDependencies": { "@flowscape-ui/mimimo": "^0.1.0" },
  "scripts": { "build": "tsdown" }
}
```

```sh
pnpm add -D typescript tsdown @flowscape-ui/mimimo
```

```ts
// tsdown.config.ts
import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  platform: 'browser',
  target: 'es2022',
  dts: true,
  clean: true,
  copy: [{ from: 'assets', to: 'dist' }],
});
```

Запустите `pnpm build`, затем `pnpm pack`. Проверьте, что архив содержит `dist/index.js`, типы и оба PNG в `dist/assets`. Установите `.tgz` в тестовое приложение и проверьте Network: картинки должны загружаться без 404. При прямой раздаче модулей сохраняйте соседнюю папку `assets`.

## 5. Используйте персонажа

`definePet` проверяет описание во время выполнения. Для React создавайте экземпляр в `useEffect`, для Vue - в `onMounted`, и вызывайте `destroy` при размонтировании. [Полные примеры с вкладками](../api/create-pet).

```ts
import { createPet, definePet } from '@flowscape-ui/mimimo';
import { myPet } from '@your-scope/my-pet';

// Call after the component mounts.
const pet = createPet({
  character: definePet(myPet),
  draggable: true,
  reactions: { click: 'happy' },
});
pet.say('Hello!');
// On unmount: pet.destroy();
```

## Как устроены наши пакеты

- [Mochi](https://github.com/Flowscape-UI/mimimo/tree/main/packages/pet-mochi) и [Byte](https://github.com/Flowscape-UI/mimimo/tree/main/packages/pet-byte) генерируют SVG-кадры и экспортируют `frames` с `fps`. Отдельные изображения не нужны.
- [Flowy](https://github.com/Flowscape-UI/mimimo/tree/main/packages/pet-flowy) поставляет три PNG-спрайт-листа, состояния `idle`, `working`, `happy` и копирует изображения при сборке. Это образец пакета с внешними ассетами.

Ядро не должно импортировать пакет питомца. Приложение выбирает персонажа, сообщения и реакции; пакет отвечает только за описание и графику.
