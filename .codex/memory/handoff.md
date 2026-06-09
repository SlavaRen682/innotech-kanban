# Handoff

## Latest State

Работа идет в `/Users/zakhar/Documents/Kanban` на ветке `codex/kanban-aging-demo`.

Приложение сейчас является production-shaped single-user канбан-доской на русском:

- первый запуск открывает пустую рабочую доску без подготовленных карточек;
- пользователь создает карточки через `Новая задача`;
- состояние сохраняется в `localStorage` под ключом `kanban-flow-board-state-v1`;
- фиксированной даты, кнопки `+1 день`, сброса сценария и seed-данных больше нет;
- Ассистент фокуса ранжирует реальные пользовательские карточки по возрасту в статусе, блокировке, WIP-перегрузу, приоритету, сроку и размеру;
- доступны drag/drop, выбор карточки, движение вперед/назад, блокировка, разделение и архив;
- `Архив` доступен в свободном слоте selected-card action grid и в commandbar; архивные карточки можно вернуть кнопкой `Вернуть`, они появляются в прежней колонке;
- форма создания использует radio-backed segment controls для приоритета и размера, поэтому системные dropdown меню не появляются;
- `?` рядом с `Ассистент фокуса` открывает popover с объяснением формулы ранжирования: возраст, блокер, WIP, срок, приоритет, размер;
- UI остается чистой доской: commandbar, компактный ассистент, selected-card strip и full-width columns.

Backend, авторизация, база данных и multi-user sync не добавлялись, потому что это отдельное архитектурное решение.

## Verification Status

- `npm run build` проходит: lint + 7 Node tests.
- `rg` по старым demo/mock controls чистый: нет `мок`, `демо`, `+1 день`, `Сбросить демо`, `cloneDemo`, `DEMO`.
- Playwright MCP smoke прошел:
  - clean first-run: 0 карточек, 5 колонок;
  - добавление карточки через форму работает;
  - `Вперед` переводит созданную карточку в `В работе`;
  - состояние сохраняется в `kanban-flow-board-state-v1`;
  - mobile 390px: `scrollWidth === clientWidth`;
  - console после удаления внешнего font import: 0 errors, 0 warnings.
- Свежий скрин: `screenshots/kanban-prod-1440.png` (папка ignored).
- После фикса формы свежий скрин: `screenshots/kanban-form-segments-1440.png` (папка ignored). Playwright подтвердил отсутствие `.modal select`, корректное сохранение `priority`/`size`, desktop/mobile без overflow и чистую консоль.
- После добавления архива свежий скрин: `screenshots/kanban-archive-open-1440.png` (папка ignored). Playwright подтвердил archive/restore flow, desktop/mobile без overflow и чистую консоль.
- После добавления объяснения ассистента свежий скрин: `screenshots/kanban-focus-help-1440.png` (папка ignored). Playwright подтвердил help popover, desktop/mobile без overflow и чистую консоль.
