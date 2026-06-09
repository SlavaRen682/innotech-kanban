# Прогресс

## 2026-06-09

- Инициализирован project memory bank.
- Создана ветка `codex/kanban-aging-demo`.
- Реализована статическая кликабельная канбан-демка с Ассистентом фокуса.
- Добавлены тесты чистой core-логики: возраст, ранжирование, WIP, перемещение, разделение и summary.
- Добавлены README, research notes, technical architecture и demo-flow docs.
- После замечания пользователя весь видимый продуктовый слой переведен на русский, включая демо-карточки, UI-строки и docs.
- После замечания “наполовину лендос” интерфейс переделан в чистую доску: appbar + left assistant rail + board + right detail panel.
- После Playwright self-review старый shell признан неудачным и пересобран с нуля: commandbar + compact assistant + selected-card strip + full-width board.
- После замечания про `+1 день` и моки приложение переведено в production-shaped single-user режим: пустой first-run, ручное добавление карточек, текущее время, новый storage key, без seed-данных, сброса сценария и внешнего font import.
- После скрина с нативным dropdown в форме создания карточки приоритет и размер заменены на кастомные segment controls; Playwright подтвердил отсутствие `<select>`, сохранение `priority/size` и отсутствие overflow.
