# Handoff

## Latest State

Работа идет в `/Users/zakhar/Documents/Kanban` на ветке `codex/kanban-aging-demo`.

Приложение сейчас является production-shaped single-user канбан-доской на русском:

- первый запуск открывает пустую рабочую доску без подготовленных карточек;
- пользователь создает карточки через `Новая задача`;
- состояние сохраняется в `localStorage` под ключом `kanban-flow-board-state-v1`;
- фиксированной даты, кнопки `+1 день`, сброса сценария и seed-данных нет;
- доступны drag/drop, выбор карточки, движение вперед/назад, блокировка, разделение и архив;
- `Архив` доступен в selected-card action grid и в commandbar; архивные карточки можно вернуть кнопкой `Вернуть`;
- форма создания использует radio-backed segment controls для приоритета и размера, поэтому системные dropdown меню не появляются;
- UI остается чистой доской: commandbar, компактный ассистент, selected-card strip и full-width columns.

## Ассистент Фокуса

Ассистент фокуса перешел со статичной формулы `возраст * 7` на SLE-модель:

`Оценка = max(0, min(возраст / SLE, 1.4) * 45 + бонус SLE + стадия + приоритет + размер + срок + зависание + блокер + WIP)`.

Стартовые SLE:

- S = 2 дня;
- M = 4 дня;
- L = 7 дней.

Карточка хранит:

- `enteredAt`: вход в текущую колонку;
- `startedAt`: вход в рабочий поток;
- `finishedAt`: выход из рабочего потока.

Обоснование модели и источники: `docs/research/focus-scoring-model.md`.

Backend, авторизация, база данных и multi-user sync не добавлялись, потому что это отдельное архитектурное решение.

## Verification Status

- `npm run build` проходит: lint + 13 Node tests.
- Playwright MCP smoke прошел:
  - SLE-formula popover открывается рядом с `Ассистент фокуса`;
  - в popover видны `SLE 85%`, S = 2 дн., M = 4 дн., L = 7 дн., бонусы 75%/100% SLE и thresholds;
  - ранжирование: заблокированная review-карточка выше, SLE-рискованная S-карточка выше L-карточки того же возраста;
  - desktop 1440px без horizontal overflow;
  - mobile 390px без horizontal overflow, popover помещается по ширине после прокрутки к ассистенту;
  - browser console: 0 errors, 0 warnings.
- Свежие скрины:
  - `screenshots/kanban-sle-formula-1440.png`;
  - `screenshots/kanban-sle-formula-390.png`.
