# Активный контекст

## Текущая задача

Сделать кликабельную канбан-доску для учебы с исследованной уникальной фишкой. Проект должен быть на русском языке.

## Ветка

`codex/kanban-aging-demo`

## Состояние реализации

Статические файлы приложения:

- `index.html`
- `src/kanban-core.js`
- `src/app.js`
- `src/styles.css`
- `tests/kanban-core.test.mjs`

Уникальная фишка: Ассистент фокуса ранжирует карточки по зависанию, блокировке, WIP-перегрузу, приоритету, риску срока и размеру.

Видимый UI, демо-данные и документация переведены на русский. localStorage key обновлен до `kanban-aging-demo-state-v2-ru`, чтобы не подтягивать старые английские демо-данные.

По замечанию пользователя интерфейс сначала был переделан из “наполовину лендинг, наполовину доска” в board workspace, затем после Playwright self-review shell пересобран заново: commandbar, компактный ассистент, строка выбранной карточки и канбан-доска на всю ширину. Старые side rail/detail panel/hero/research элементы удалены из приложения.

## Проверено

- `npm run build` после русификации проходит: lint + 6 Node tests.
- Browser smoke на `http://localhost:5173`: `+1 день`, `Режим фокуса`, `Разделить`, добавление карточки и русские тексты работают.
- Mobile viewport 390px: `scrollWidth` равен `clientWidth`, горизонтального overflow нет.
- После переделки в чистую доску `npm run build` проходит.
- Pure-board browser smoke прошел: `h1=false`, `research-panel=false`, есть workbench/left rail/board/detail, `+1 день`, `Режим фокуса`, `Разделить`, добавление карточки работают.
- Mobile pure-board smoke на 390px прошел: `scrollWidth` равен `clientWidth`.
- После пересборки shell с нуля Playwright self-review прошел: на 2048px `docW=clientW`, старых `h1/research/sideRail/detailPanel=false`, 5 колонок видимы, board y около 411px; интерактивный smoke прошел.
- Mobile self-review после пересборки: `docW=390`, board y около 195px, 5 колонок, старых лендинговых секций нет.

## Следующие шаги

- Локальный сервер запущен на `http://localhost:5173`.
