# Handoff

## Latest State

Работа идет в `/Users/zakhar/Documents/Kanban` на ветке `codex/kanban-aging-demo`.

Приложение — статическая кликабельная канбан-демка с Ассистентом фокуса:

- чистый рабочий board UI без hero/research/side-rail/detail-panel секций;
- commandbar, компактный ассистент, строка выбранной карточки и канбан-доска на всю ширину;
- подготовленные учебные карточки на русском;
- drag/drop между колонками;
- панель деталей выбранной карточки;
- действия: назад/вперед, заблокировать/разблокировать, разделить, архивировать;
- модалка добавления карточки;
- режим фокуса;
- симуляция `+1 день`;
- localStorage persistence и сброс демо.

## Verification Status

- `npm run build` после русификации проходит: lint + 6 Node tests.
- Browser smoke прошел: `+1 день`, `Режим фокуса`, `Разделить`, добавление карточки и русские тексты работают.
- Mobile smoke на 390px прошел: горизонтального overflow нет.
- После pure-board переделки `npm run build` проходит.
- Browser smoke pure-board layout прошел: hero `h1` и visual research panel отсутствуют, рабочие области доски есть, клики и добавление карточки работают.
- Mobile pure-board smoke на 390px прошел без horizontal overflow.
- После критики layout пересобран с нуля. Playwright self-review: 2048px без horizontal overflow, 5 колонок видимы, старых layout-секций нет, клики `+1 день`/focus/split/add работают. Mobile: board начинается около 195px, `docW=390`.
