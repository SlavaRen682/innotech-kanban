# План реализации демо канбан-доски

> **Для agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Цель:** сделать кликабельную канбан-демку с Ассистентом фокуса.

**Архитектура:** статическое браузерное приложение с чистой доменной логикой отдельно от DOM-рендеринга. Состояние сохраняется в localStorage и сбрасывается к подготовленным демо-данным.

**Стек:** HTML, CSS, browser JavaScript modules, встроенный Node test runner.

---

### Task 1: Доменная логика доски

**Files:**
- Create: `src/kanban-core.js`
- Create: `tests/kanban-core.test.mjs`

- [x] Определить статусы, демо-карточки, date helpers, WIP-состояние, скоринг, ранжирование, перемещение, блокировку, разделение, архив, добавление и сводку.
- [x] Проверить возраст карточки, фокус-ранжирование, WIP-перегруз, перемещение, разделение и сводку через `node --test`.

### Task 2: Кликабельное браузерное приложение

**Files:**
- Create: `index.html`
- Create: `src/app.js`

- [x] Отрендерить commandbar, компактный блок ассистента, строку выбранной карточки, канбан-колонки на всю ширину и модалку новой карточки.
- [x] Подключить клики, keyboard selection, drag/drop, localStorage, сброс, режим фокуса и симуляцию времени.

### Task 3: Премиальная UI-система

**Files:**
- Create: `src/styles.css`

- [x] Применить double-bezel контейнеры, тактильные кнопки, адаптивную канбан-раскладку, WIP-метры, статусы старения и кастомные cubic-bezier transitions.

### Task 4: Документация и проверка

**Files:**
- Create: `README.md`
- Create: `docs/research/kanban-pain-points.md`
- Create: `docs/technical/architecture.md`
- Create: `docs/user/demo-flow.md`

- [x] Описать запуск, проверку, архитектуру, research rationale и сценарий показа.
- [x] Запустить `npm run build`.
- [x] Провести smoke-test в браузере после перевода интерфейса на русский.
