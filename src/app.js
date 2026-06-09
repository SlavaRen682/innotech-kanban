import {
  SCORING_RULES,
  STATUSES,
  STATUS_FLOW,
  addCard,
  archiveCard,
  calculateSummary,
  getCardAgeDays,
  getCardsByStatus,
  getDueDaysLeft,
  getStatus,
  getWipState,
  moveCard,
  moveCardInFlow,
  nowIso,
  rankFocusCards,
  restoreCard,
  scoreCard,
  splitCard,
  toggleBlocked
} from "./kanban-core.js";

const STORAGE_KEY = "kanban-flow-board-state-v1";
const root = document.querySelector("#app");

const state = loadState();

render();
bindGlobalEvents();

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    if (Array.isArray(saved?.cards)) {
      return {
        cards: saved.cards,
        now: saved.now ?? nowIso(),
        selectedId: saved.selectedId ?? saved.cards.find((card) => !card.archivedAt)?.id ?? null,
        focusOnly: Boolean(saved.focusOnly),
        addOpen: false,
        archiveOpen: false,
        focusHelpOpen: false,
        draggedId: null
      };
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }

  return {
    cards: [],
    now: nowIso(),
    selectedId: null,
    focusOnly: false,
    addOpen: false,
    archiveOpen: false,
    focusHelpOpen: false,
    draggedId: null
  };
}

function persist() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      cards: state.cards,
      now: state.now,
      selectedId: state.selectedId,
      focusOnly: state.focusOnly
    })
  );
}

function render() {
  state.now = nowIso();
  const focusCards = rankFocusCards(state.cards, state.now, 3);
  const summary = calculateSummary(state.cards, state.now);
  const selected = getSelectedCard(focusCards);

  root.innerHTML = `
    <header class="commandbar">
      <div class="brand">
        <span class="brand-mark">К</span>
        <div>
          <strong>Лаборатория потока</strong>
          <span>Рабочая канбан-доска с Ассистентом фокуса</span>
        </div>
      </div>
      <div class="toolbar-metrics" aria-label="Метрики доски">
        ${metricMarkup("Риск", `${summary.stale + summary.blocked + summary.overloaded}`, "зависшие + блокеры + WIP")}
        ${metricMarkup("WIP", `${summary.overloaded}`, "перегруз")}
        ${metricMarkup("Срок", `${summary.dueSoon}`, "сегодня/завтра")}
        ${metricMarkup("Готово", `${summary.done}`, "закрыто")}
      </div>
      <div class="toolbar-actions" aria-label="Действия доски">
        ${buttonMarkup("Новая задача", "open-add", "plus")}
        ${buttonMarkup("Архив", "open-archive", "archive", "secondary")}
      </div>
    </header>

    <main class="board-app">
      <section class="focus-dock" aria-label="Сводка и фокус">
        <div class="focus-area">
          <div class="section-heading">
            <div class="focus-title">
              <div class="focus-label-row">
                <p class="eyebrow">Ассистент фокуса</p>
                <button
                  class="help-button"
                  type="button"
                  data-action="toggle-focus-help"
                  aria-label="Как работает Ассистент фокуса"
                  aria-expanded="${state.focusHelpOpen ? "true" : "false"}"
                >?</button>
              </div>
              <h2>Что закрыть первым</h2>
              ${state.focusHelpOpen ? focusHelpMarkup() : ""}
            </div>
            <label class="switch">
              <input type="checkbox" data-action="toggle-focus" ${state.focusOnly ? "checked" : ""} />
              <span></span>
              Режим фокуса
            </label>
          </div>
          <div class="focus-strip">
            ${focusCards.length ? focusCards.map((item, index) => focusCardMarkup(item, index)).join("") : emptyFocusMarkup()}
          </div>
        </div>
      </section>

      ${selected ? detailMarkup(selected) : emptyDetailMarkup()}

      <section class="board-frame">
        <div class="board-scroll" tabindex="0" aria-label="Прокрутка канбан-доски">
          <div class="board" aria-label="Канбан-доска">
            ${STATUSES.map((status) => columnMarkup(status, focusCards)).join("")}
          </div>
        </div>
      </section>
    </main>

    ${state.addOpen ? addTaskModalMarkup() : ""}
    ${state.archiveOpen ? archiveModalMarkup() : ""}
  `;

}

function getSelectedCard(focusCards) {
  const selected = state.cards.find((card) => card.id === state.selectedId && !card.archivedAt);
  if (selected) return selected;
  const fallback = focusCards[0]?.card ?? state.cards.find((card) => !card.archivedAt);
  state.selectedId = fallback?.id;
  return fallback;
}

function columnMarkup(status, focusCards) {
  const focusIds = new Set(focusCards.map((item) => item.card.id));
  const cards = getCardsByStatus(state.cards, status.id);
  const wip = getWipState(state.cards, status.id);
  const overloadClass = wip.isOverLimit ? "is-over-limit" : "";
  const hiddenClass = state.focusOnly ? "focus-filtered" : "";

  return `
    <section class="column ${overloadClass}" data-status="${status.id}">
      <div class="column-core">
        <div class="column-head">
          <div>
            <h3>${escapeHtml(status.title)}</h3>
            <p>${escapeHtml(status.policy)}</p>
          </div>
          <span class="wip-pill ${overloadClass}">
            ${wip.isLimited ? `${wip.count}/${wip.limit}` : wip.count}
          </span>
        </div>
        <div class="wip-meter" aria-hidden="true">
          <span style="transform: scaleX(${getWipScale(wip)})"></span>
        </div>
        <div class="card-stack" data-dropzone="${status.id}">
          ${cards.length ? cards.map((card) => cardMarkup(card, focusIds.has(card.id), hiddenClass)).join("") : emptyColumnMarkup(status.id)}
        </div>
      </div>
    </section>
  `;
}

function cardMarkup(card, isFocus, hiddenClass) {
  const insight = scoreCard(card, state.cards, state.now);
  const selectedClass = card.id === state.selectedId ? "is-selected" : "";
  const focusClass = isFocus ? "is-focus" : hiddenClass;
  const blockedClass = card.blocked ? "is-blocked" : "";
  const due = getDueDaysLeft(card, state.now);

  return `
    <article
      class="task-card ${selectedClass} ${focusClass} ${blockedClass}"
      draggable="true"
      data-card-id="${card.id}"
      tabindex="0"
      aria-label="${escapeHtml(card.title)}"
    >
      <div class="task-card-top">
        <span class="priority priority-${card.priority}">${escapeHtml(priorityLabel(card.priority))}</span>
        <span class="age-badge ${insight.tone}">${insight.ageDays} дн.</span>
      </div>
      <h4>${escapeHtml(card.title)}</h4>
      <p>${escapeHtml(card.description)}</p>
      <div class="tag-row">
        ${card.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
      </div>
      <div class="task-card-foot">
        <span>${escapeHtml(card.owner)}</span>
        <span>${dueLabel(due)}</span>
      </div>
    </article>
  `;
}

function focusCardMarkup(item, index) {
  const { card, insight } = item;
  return `
    <button class="focus-card ${insight.tone}" data-action="select" data-card-id="${card.id}" style="--delay:${index * 70}ms">
      <span class="focus-rank">0${index + 1}</span>
      <span>
        <strong>${escapeHtml(card.title)}</strong>
        <small>${escapeHtml(insight.recommendedAction)}</small>
      </span>
      <span class="reason-row">${insight.reasons.map((reason) => `<em>${escapeHtml(reason)}</em>`).join("")}</span>
    </button>
  `;
}

function emptyFocusMarkup() {
  return `
    <div class="empty-focus">
      <strong>Нет активных карточек</strong>
      <span>Добавьте задачу, и ассистент начнет выбирать, что закрывать первым.</span>
    </div>
  `;
}

function focusHelpMarkup() {
  return `
    <aside class="focus-help-popover" aria-label="Объяснение Ассистента фокуса">
      <button class="icon-button mini" type="button" data-action="close-focus-help" aria-label="Закрыть объяснение">×</button>
      <strong>Формула риска</strong>
      <p class="formula-line">Оценка = max(0, возраст × ${SCORING_RULES.agePerDay} + статус + приоритет + размер + срок + зависание + блокер + WIP).</p>
      <div class="formula-grid">
        ${formulaGroupMarkup("Статус", statusScoreItems())}
        ${formulaGroupMarkup("Приоритет", [
          ["низкий", SCORING_RULES.priority.low],
          ["средний", SCORING_RULES.priority.medium],
          ["высокий", SCORING_RULES.priority.high]
        ])}
        ${formulaGroupMarkup("Размер", [
          ["S", SCORING_RULES.size.S],
          ["M", SCORING_RULES.size.M],
          ["L", SCORING_RULES.size.L]
        ])}
        ${formulaGroupMarkup("Срок", [
          ["просрочен", SCORING_RULES.due.overdue],
          ["0-1 дн.", SCORING_RULES.due.oneDay],
          ["2-3 дн.", SCORING_RULES.due.threeDays],
          ["позже", SCORING_RULES.due.later]
        ])}
      </div>
      <div class="formula-bonus-row">
        <span>зависла +${SCORING_RULES.stale}</span>
        <span>блокер +${SCORING_RULES.blocked}</span>
        <span>WIP перегружен +${SCORING_RULES.wipOverLimit}</span>
        <span>внимание от ${SCORING_RULES.tone.warning}</span>
        <span>критично от ${SCORING_RULES.tone.critical}</span>
      </div>
    </aside>
  `;
}

function statusScoreItems() {
  return STATUSES.map((status) => [status.title, SCORING_RULES.status[status.id] ?? 0]);
}

function formulaGroupMarkup(title, items) {
  return `
    <section class="formula-group">
      <h3>${escapeHtml(title)}</h3>
      <div>
        ${items.map(([label, value]) => `<span><b>${escapeHtml(label)}</b>${formatScore(value)}</span>`).join("")}
      </div>
    </section>
  `;
}

function emptyColumnMarkup(statusId) {
  const label = statusId === "backlog" ? "Пока пусто" : "Нет задач";
  return `<div class="column-empty">${label}</div>`;
}

function detailMarkup(card) {
  const insight = scoreCard(card, state.cards, state.now);
  const status = getStatus(card.status);
  const due = getDueDaysLeft(card, state.now);
  const previousDisabled = STATUS_FLOW.indexOf(card.status) === 0 ? "disabled" : "";
  const nextDisabled = STATUS_FLOW.indexOf(card.status) === STATUS_FLOW.length - 1 ? "disabled" : "";

  return `
    <section class="selected-strip ${insight.tone}" aria-label="Выбранная карточка">
      <div class="selected-main">
        <p class="eyebrow">Выбранная карточка</p>
        <h2>${escapeHtml(card.title)}</h2>
        <p>${escapeHtml(card.description)}</p>
      </div>
      <div class="selected-stats">
        ${detailStatMarkup("Статус", status?.title ?? card.status)}
        ${detailStatMarkup("Возраст", `${getCardAgeDays(card, state.now)} дн.`)}
        ${detailStatMarkup("Срок", dueLabel(due))}
        ${detailStatMarkup("Оценка", `${Math.round(insight.score)}`)}
      </div>
      <div class="selected-action-note">
        <span>Следующий ход</span>
        <strong>${escapeHtml(insight.recommendedAction)}</strong>
        <p>${insight.reasons.map(escapeHtml).join(" / ")}</p>
      </div>
      <div class="action-grid">
        ${actionButtonMarkup("Назад", "move-prev", "left", previousDisabled)}
        ${actionButtonMarkup("Вперед", "move-next", "right", nextDisabled)}
        ${actionButtonMarkup(card.blocked ? "Разблокировать" : "Заблокировать", "toggle-blocked", "block")}
        ${actionButtonMarkup("Разделить", "split", "split")}
        ${actionButtonMarkup("В архив", "archive", "archive")}
        ${actionButtonMarkup("Архив", "open-archive", "archive")}
      </div>
    </section>
  `;
}

function emptyDetailMarkup() {
  return `
    <section class="selected-strip is-empty">
      <div class="empty-detail">
        <p class="eyebrow">Выбранная карточка</p>
        <h2>Карточка не выбрана</h2>
        <p>Добавьте первую задачу, чтобы появились рекомендации и действия.</p>
      </div>
      <div class="action-grid empty-actions">
        ${actionButtonMarkup("Новая задача", "open-add", "plus")}
        ${actionButtonMarkup("Архив", "open-archive", "archive")}
      </div>
    </section>
  `;
}

function addTaskModalMarkup() {
  return `
    <div class="modal-layer">
      <button class="modal-backdrop" type="button" data-action="close-add" aria-label="Закрыть форму новой задачи"></button>
      <form class="modal" data-add-form>
        <div class="modal-core">
          <div class="section-heading">
            <div>
              <p class="eyebrow">Создать карточку</p>
              <h2>Новая задача</h2>
            </div>
            <button class="icon-button" type="button" data-action="close-add" aria-label="Закрыть">×</button>
          </div>
          <label>
            Название
            <input name="title" required placeholder="Подготовить релиз" />
          </label>
          <label>
            Описание
            <textarea name="description" rows="3" placeholder="Что должно быть закончено?"></textarea>
          </label>
          <label>
            Ответственный
            <input name="owner" placeholder="Имя" />
          </label>
          <div class="form-row">
            <fieldset class="segment-field">
              <legend>Приоритет</legend>
              <div class="segment-control priority-options">
                ${radioOptionMarkup("priority", "high", "Высокий")}
                ${radioOptionMarkup("priority", "medium", "Средний", true)}
                ${radioOptionMarkup("priority", "low", "Низкий")}
              </div>
            </fieldset>
            <fieldset class="segment-field size-field">
              <legend>Размер</legend>
              <div class="segment-control size-options">
                ${radioOptionMarkup("size", "S", "S")}
                ${radioOptionMarkup("size", "M", "M", true)}
                ${radioOptionMarkup("size", "L", "L")}
              </div>
            </fieldset>
          </div>
          <div class="form-row">
            <label>
              Срок
              <input name="dueDate" type="date" />
            </label>
            <label>
              Теги
              <input name="tags" placeholder="важное, клиент" />
            </label>
          </div>
          <button class="button primary" type="submit">
            Добавить карточку
            <span>›</span>
          </button>
        </div>
      </form>
    </div>
  `;
}

function archiveModalMarkup() {
  const archivedCards = state.cards
    .filter((card) => card.archivedAt)
    .sort((a, b) => new Date(b.archivedAt) - new Date(a.archivedAt));

  return `
    <div class="modal-layer">
      <button class="modal-backdrop" type="button" data-action="close-archive" aria-label="Закрыть архив"></button>
      <section class="modal archive-modal" aria-label="Архив задач">
        <div class="modal-core">
          <div class="section-heading">
            <div>
              <p class="eyebrow">Архив</p>
              <h2>Убранные задачи</h2>
            </div>
            <button class="icon-button" type="button" data-action="close-archive" aria-label="Закрыть">×</button>
          </div>
          <div class="archive-list">
            ${archivedCards.length ? archivedCards.map(archiveItemMarkup).join("") : emptyArchiveMarkup()}
          </div>
        </div>
      </section>
    </div>
  `;
}

function archiveItemMarkup(card) {
  const status = getStatus(card.status);
  return `
    <article class="archive-item">
      <div>
        <span class="archive-status">${escapeHtml(status?.title ?? card.status)}</span>
        <h3>${escapeHtml(card.title)}</h3>
        <p>${escapeHtml(card.description)}</p>
        <div class="archive-meta">
          <span>${escapeHtml(card.owner)}</span>
          <span>убрано ${escapeHtml(formatDate(card.archivedAt))}</span>
        </div>
      </div>
      <button class="action-button restore-button" type="button" data-action="restore" data-card-id="${card.id}">
        Вернуть
        <span>›</span>
      </button>
    </article>
  `;
}

function emptyArchiveMarkup() {
  return `
    <div class="empty-archive">
      <strong>Архив пуст</strong>
      <span>Карточки появятся здесь после действия «В архив».</span>
    </div>
  `;
}

function radioOptionMarkup(name, value, label, checked = false) {
  return `
    <label class="segment-option">
      <input type="radio" name="${name}" value="${value}" ${checked ? "checked" : ""} />
      <span>${escapeHtml(label)}</span>
    </label>
  `;
}

function bindGlobalEvents() {
  root.addEventListener("click", (event) => {
    const actionTarget = event.target.closest("[data-action]");
    const cardTarget = event.target.closest("[data-card-id]");

    if (actionTarget) {
      handleAction(actionTarget.dataset.action, actionTarget);
      event.stopPropagation();
      return;
    }

    if (cardTarget) {
      state.selectedId = cardTarget.dataset.cardId;
      persistAndRender();
    }
  });

  root.addEventListener("keydown", (event) => {
    const cardTarget = event.target.closest("[data-card-id]");
    if (cardTarget && (event.key === "Enter" || event.key === " ")) {
      state.selectedId = cardTarget.dataset.cardId;
      persistAndRender();
    }
  });

  root.addEventListener("dragstart", (event) => {
    const card = event.target.closest("[data-card-id]");
    if (!card) return;
    state.draggedId = card.dataset.cardId;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", state.draggedId);
  });

  root.addEventListener("dragover", (event) => {
    const dropzone = event.target.closest("[data-dropzone]");
    if (!dropzone) return;
    event.preventDefault();
    dropzone.classList.add("is-drag-over");
  });

  root.addEventListener("dragleave", (event) => {
    const dropzone = event.target.closest("[data-dropzone]");
    if (dropzone) dropzone.classList.remove("is-drag-over");
  });

  root.addEventListener("drop", (event) => {
    const dropzone = event.target.closest("[data-dropzone]");
    if (!dropzone) return;
    event.preventDefault();
    dropzone.classList.remove("is-drag-over");
    const cardId = state.draggedId || event.dataTransfer.getData("text/plain");
    if (!cardId) return;
    state.now = nowIso();
    state.cards = moveCard(state.cards, cardId, dropzone.dataset.dropzone, state.now);
    state.selectedId = cardId;
    state.draggedId = null;
    persistAndRender();
  });

  root.addEventListener("submit", (event) => {
    const form = event.target.closest("[data-add-form]");
    if (!form) return;
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    state.now = nowIso();
    state.cards = addCard(state.cards, data, state.now);
    state.selectedId = state.cards[state.cards.length - 1]?.id;
    state.addOpen = false;
    persistAndRender();
  });
}

function handleAction(action, target) {
  const cardId = target.dataset.cardId || state.selectedId;
  state.now = nowIso();

  if (action === "select" && target.dataset.cardId) {
    state.selectedId = target.dataset.cardId;
  }
  if (action === "toggle-focus") {
    state.focusOnly = target.checked;
  }
  if (action === "toggle-focus-help") {
    state.focusHelpOpen = !state.focusHelpOpen;
  }
  if (action === "close-focus-help") {
    state.focusHelpOpen = false;
  }
  if (action === "open-add") {
    state.addOpen = true;
    state.focusHelpOpen = false;
  }
  if (action === "close-add") {
    state.addOpen = false;
  }
  if (action === "open-archive") {
    state.archiveOpen = true;
    state.focusHelpOpen = false;
  }
  if (action === "close-archive") {
    state.archiveOpen = false;
  }
  if (action === "move-prev") {
    state.cards = moveCardInFlow(state.cards, cardId, "prev", state.now);
  }
  if (action === "move-next") {
    state.cards = moveCardInFlow(state.cards, cardId, "next", state.now);
  }
  if (action === "toggle-blocked") {
    state.cards = toggleBlocked(state.cards, cardId, state.now);
  }
  if (action === "split") {
    state.cards = splitCard(state.cards, cardId, state.now);
  }
  if (action === "archive") {
    state.cards = archiveCard(state.cards, cardId, state.now);
    state.selectedId = rankFocusCards(state.cards, state.now, 1)[0]?.card.id;
  }
  if (action === "restore" && target.dataset.cardId) {
    state.cards = restoreCard(state.cards, target.dataset.cardId, state.now);
    state.selectedId = target.dataset.cardId;
    state.archiveOpen = state.cards.some((card) => card.archivedAt);
  }

  persistAndRender();
}

function persistAndRender() {
  persist();
  render();
}

function metricMarkup(label, value, caption) {
  return `
    <div class="metric">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
      <small>${escapeHtml(caption)}</small>
    </div>
  `;
}

function detailStatMarkup(label, value) {
  return `
    <div class="detail-stat">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>
  `;
}

function buttonMarkup(label, action, icon, variant = "primary") {
  return `
    <button class="button ${variant}" type="button" data-action="${action}">
      ${escapeHtml(label)}
      <span data-icon="${icon}">›</span>
    </button>
  `;
}

function actionButtonMarkup(label, action, icon, disabled = "") {
  return `
    <button class="action-button" type="button" data-action="${action}" ${disabled}>
      ${escapeHtml(label)}
      <span data-icon="${icon}">›</span>
    </button>
  `;
}

function getWipScale(wip) {
  if (!wip.isLimited) return Math.min(1, wip.count / 6);
  return Math.min(1, wip.count / wip.limit);
}

function dueLabel(days) {
  if (days === null) return "без срока";
  if (days < 0) return `просрочено на ${Math.abs(days)} дн.`;
  if (days === 0) return "сегодня";
  if (days === 1) return "завтра";
  return `осталось ${days} дн.`;
}

function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(value));
}

function formatScore(value) {
  if (value > 0) return `+${value}`;
  return String(value);
}

function priorityLabel(priority) {
  return {
    high: "высокий",
    medium: "средний",
    low: "низкий"
  }[priority] ?? priority;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
