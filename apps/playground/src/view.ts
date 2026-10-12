export const view = `
<header class="topbar"><strong>mimimo <span>playground</span></strong><span class="muted">Локальная песочница · файлы не отправляются на сервер</span></header>
<div class="layout">
<aside class="controls" aria-label="Настройки">
<section><h2>Питомец</h2><div class="row presets">
<button data-pet="mochi">Mochi</button><button data-pet="byte">Byte</button><button data-pet="assets">Тестовые ассеты</button><button data-pet="custom">Свой</button>
</div><div class="two"><label>Ширина<dsk-input id="width" value="128" min="16" max="512" aria-label="Ширина" tag="px"></dsk-input></label><label>Высота<dsk-input id="height" value="128" min="16" max="512" aria-label="Высота" tag="px"></dsk-input></label></div>
<div class="row"><label class="check"><input id="draggable" type="checkbox" checked> Перетаскивание</label><label class="check"><input id="chat" type="checkbox"> Тестовый чат</label></div>
<button id="apply-pet">Применить размер и опции</button><p class="hint">Размер и перетаскивание меняются без пересоздания. Переключение тестового чата пересоздаёт экземпляр.</p></section>

<section><div class="section-heading"><h2>Состояния</h2><button id="new-state">+ Добавить</button></div><div id="states" class="state-list"></div>
<p id="empty" class="hint" hidden>Пока нет состояний. Добавьте файл ниже.</p>
<div class="row"><select id="default-state" aria-label="Состояние по умолчанию"></select><button id="set-default">По умолчанию</button><button id="preload">Загрузить ассеты</button></div><button id="unknown" title="play с неизвестным состоянием">Проверить fallback</button><div id="samples" class="row" hidden><button id="frames">Frames</button><button id="sprite">Sprite sheet</button><button id="gif">GIF</button><button id="video">Video</button></div></section>

<section><h2 id="editor-heading">Добавить состояние</h2>
<form id="asset-form">
<label>Название<input id="name" value="my-animation" required></label>
<label>Формат<select id="type"><option value="image">Изображение</option><option value="frames">Последовательность кадров</option><option value="sprite">Спрайт-лист</option><option value="gif">GIF</option><option value="video">Видео</option></select></label>
<label>Файлы<dsk-input-upload id="files" accept="image/*" aria-label="Файл состояния" placeholder="Выбрать файл"></dsk-input-upload><input id="frame-files" type="file" accept="image/*" multiple aria-label="Кадры анимации" hidden disabled></label><p id="file-summary" class="hint">Выберите файл. Можно перетащить его в область просмотра.</p>
<div class="two">
<label data-field="fps">FPS<dsk-input id="fps" min=".1" max="60" step=".1" value="8" aria-label="FPS"></dsk-input></label>
<label data-field="speed">Скорость<dsk-input id="speed" min=".25" max="4" step=".25" value="1" aria-label="Скорость"></dsk-input></label>
<label data-field="sprite">Столбцы<dsk-input id="columns" min="1" value="2" aria-label="Столбцы"></dsk-input></label>
<label data-field="sprite">Строки<dsk-input id="rows" min="1" value="2" aria-label="Строки"></dsk-input></label>
<label data-field="sprite">Число кадров<dsk-input id="count" min="1" value="4" aria-label="Число кадров"></dsk-input></label>
<label data-field="sprite">Первый кадр (с 0)<dsk-input id="start" min="0" value="0" aria-label="Первый кадр"></dsk-input></label>
</div>
<label data-field="loop" class="check"><input id="loop" type="checkbox" checked> Повторять</label>
<label data-field="poster">Статичный кадр (необязательно)<dsk-input-upload id="poster" accept="image/*" aria-label="Статичный кадр" placeholder="Выбрать изображение"></dsk-input-upload></label>
<p id="format-hint" class="hint"></p>
<button class="primary" type="submit">Сохранить и запустить</button>
</form><p id="feedback" role="status" class="feedback"></p></section>

<section><h2>Позиция и воспроизведение</h2>
<label>Среда<select id="environment"><option value="local">Локальная - внутри превью</option><option value="global">Глобальная - поверх страницы</option></select></label><p class="hint">Смена среды пересоздаёт питомца, сохраняя загруженные состояния.</p>
<div class="two"><label>X<dsk-input id="position-x" value="0" aria-label="Позиция X"></dsk-input></label><label>Y<dsk-input id="position-y" value="0" aria-label="Позиция Y"></dsk-input></label></div>
<button id="set-position">Применить позицию</button>
<div class="row"><select id="anchor" aria-label="Привязка"><option value="center">Центр</option><option value="top-left">Слева сверху</option><option value="top-right">Справа сверху</option><option value="bottom-left">Слева снизу</option><option value="bottom-right">Справа снизу</option></select><button id="set-anchor">Привязать</button></div>
<div class="row"><button id="pause">Пауза</button><button id="resume">Продолжить</button></div>
<p class="hint">Координаты относительно preview. Панели учитываются при ограничении перемещения.</p></section>
<section><h2>Реакции</h2>
<label>Вызвать состояние напрямую<input id="manual-state" value="sleep" list="state-names"></label><div class="row"><button id="react-state">Вызвать react()</button><button id="stop-reaction">Завершить реакцию</button></div><p class="hint">Укажите имя состояния или оставьте поле пустым. Приоритет: drag → click → hover.</p>
<form id="reactions-form"><label>Наведение · hover<input id="reaction-hover" list="state-names" value="thinking"></label><label>Клик · click<input id="reaction-click" list="state-names" value="happy"></label><label>Перетаскивание · drag<input id="reaction-drag" list="state-names" value="sleep"></label><datalist id="state-names"></datalist><div class="row"><button>Применить реакции</button><button type="button" id="clear-reactions">Очистить</button><button type="button" id="remove-hover">Убрать hover</button></div></form></section>
<section><h2>Панели питомца</h2>
<label class="check"><input id="bubble-enabled" type="checkbox" checked> Показывать мысли</label>
<label class="check"><input id="custom-panel" type="checkbox" checked> Своя нижняя панель</label>
<label class="check"><input id="custom-close" type="checkbox"> Своя кнопка закрытия мысли</label>
<label class="check"><input id="custom-style" type="checkbox"> Пример другого оформления</label>
<p class="hint">Нижняя панель - обычные DOM-элементы. Тестовый чат доступен и из своей панели. Выключите её, чтобы проверить встроенную форму.</p></section>
<section><h2>Реплика · say()</h2><form id="say-form" class="row"><input id="message" aria-label="Текст реплики" placeholder="Привет!" value="Привет!"><button>Сказать</button></form><label>Подпись мысли<input id="description" placeholder="Необязательно"></label><button id="dismiss-bubble">Закрыть мысль</button><div class="row"><button id="send-chat">Отправить в чат</button><button id="cancel-chat">Отменить запрос</button></div><p class="hint">Чат использует локальный ответ для тестирования, без нейросети.</p></section>
</aside>

<main class="workspace">
<div class="toolbar"><div>Состояние: <output id="state">-</output> <span id="lifecycle" class="muted"></span></div><div class="row"><button id="show">Показать</button><button id="hide">Скрыть</button><button id="center">В центр</button><button id="destroy">Удалить экземпляр</button></div></div>
<div id="stage" class="stage"><p id="stage-hint">Перетаскивайте питомца и проверяйте реакции.<br>Бросьте сюда свой GIF, видео или изображения.</p><span class="stage-caption">PREVIEW</span></div>
<details id="inspector" class="inspector" open><summary>API и события <span class="muted">кликов: <output id="click-count">0</output></span></summary>
<div class="inspector-content"><section><div class="section-heading"><h2>Последний вызов</h2><button id="copy-code">Копировать</button></div><pre><code id="api-code">createPet()</code></pre></section><section><div class="section-heading"><h2>События</h2><button id="clear-log">Очистить журнал</button></div><ol id="events"></ol></section></div></details>
</main></div>`;
