import {
  DEMO_NOW,
  STATUSES,
  STATUS_FLOW,
  addCard,
  addDays,
  archiveCard,
  calculateSummary,
  cloneDemoCards,
  getCardAgeDays,
  getCardsByStatus,
  getDueDaysLeft,
  getStatus,
  getWipState,
  moveCard,
  moveCardInFlow,
  rankFocusCards,
  scoreCard,
  splitCard,
  toggleBlocked
} from "./kanban-core.js";

const STORAGE_KEY = "kanban-aging-demo-state-v2-ru";
const root = document.querySelector("#app");

const state = loadState();

render();
bindGlobalEvents();

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    if (saved?.cards && saved?.now) {
      return {
        cards: saved.cards,
        now: saved.now,
        selectedId: saved.selectedId ?? saved.cards[0]?.id,
        focusOnly: Boolean(saved.focusOnly),
        addOpen: false,
        draggedId: null
      };
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }

  const cards = cloneDemoCards();
  return {
    cards,
    now: DEMO_NOW,
    selectedId: rankFocusCards(cards, DEMO_NOW, 1)[0]?.card.id ?? cards[0]?.id,
    focusOnly: false,
    addOpen: false,
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
  const focusCards = rankFocusCards(state.cards, state.now, 3);
  const summary = calculateSummary(state.cards, state.now);
  const selected = getSelectedCard(focusCards);

  root.innerHTML = `
    <header class="appbar reveal">
      <div class="brand-lockup">
        <strong>Лаборатория потока</strong>
        <span>Мок-доска с Ассистентом фокуса</span>
      </div>
      <div class="topbar-actions" aria-label="Действия доски">
        ${buttonMarkup("+1 день", "age-day", "plus")}
        ${buttonMarkup("Новая задача", "open-add", "plus")}
        ${buttonMarkup("Сбросить демо", "reset", "reset", "secondary")}
      </div>
    </header>

    <main class="board-workbench">
      <aside class="left-rail reveal" aria-label="Панель ассистента">
        <section class="control-panel double-bezel">
          <div class="bezel-core control-grid">
            ${metricMarkup("Риск", `${summary.stale + summary.blocked + summary.overloaded}`, "зависшие + блокеры + WIP")}
            ${metricMarkup("WIP", `${summary.overloaded}`, "перегруз")}
            ${metricMarkup("Срок", `${summary.dueSoon}`, "сегодня/завтра")}
            ${metricMarkup("Готово", `${summary.done}`, "закрыто")}
          </div>
        </section>

        <section class="focus-panel double-bezel">
          <div class="bezel-core">
          <div class="section-heading">
            <div>
              <p class="eyebrow">Что закрыть первым</p>
              <h2>Ассистент фокуса</h2>
            </div>
            <label class="switch">
              <input type="checkbox" data-action="toggle-focus" ${state.focusOnly ? "checked" : ""} />
              <span></span>
              Режим фокуса
            </label>
          </div>
          <div class="focus-strip">
            ${focusCards.map((item, index) => focusCardMarkup(item, index)).join("")}
          </div>
          </div>
        </section>
      </aside>

      <section class="board-stage reveal">
        <div class="board-scroll">
          <div class="board" aria-label="Канбан-доска">
            ${STATUSES.map((status) => columnMarkup(status, focusCards)).join("")}
          </div>
        </div>
      </section>

      <aside class="detail-panel double-bezel reveal" aria-label="Детали карточки">
        <div class="bezel-core">
          ${selected ? detailMarkup(selected) : emptyDetailMarkup()}
        </div>
      </aside>
    </main>

    ${state.addOpen ? addTaskModalMarkup() : ""}
  `;

  hydrateReveals();
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
    <section class="column double-bezel ${overloadClass}" data-status="${status.id}">
      <div class="bezel-core column-core">
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
          ${cards
            .map((card) => cardMarkup(card, focusIds.has(card.id), hiddenClass))
            .join("")}
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

function detailMarkup(card) {
  const insight = scoreCard(card, state.cards, state.now);
  const status = getStatus(card.status);
  const due = getDueDaysLeft(card, state.now);
  const previousDisabled = STATUS_FLOW.indexOf(card.status) === 0 ? "disabled" : "";
  const nextDisabled = STATUS_FLOW.indexOf(card.status) === STATUS_FLOW.length - 1 ? "disabled" : "";

  return `
    <div class="detail-head">
      <p class="eyebrow">Выбранная карточка</p>
      <h2>${escapeHtml(card.title)}</h2>
      <p>${escapeHtml(card.description)}</p>
    </div>
    <div class="detail-grid">
      ${detailStatMarkup("Статус", status?.title ?? card.status)}
      ${detailStatMarkup("Возраст", `${getCardAgeDays(card, state.now)} дн.`)}
      ${detailStatMarkup("Срок", dueLabel(due))}
      ${detailStatMarkup("Оценка", `${Math.round(insight.score)}`)}
    </div>
    <div class="insight-box ${insight.tone}">
      <span>Сигнал ассистента</span>
      <strong>${escapeHtml(insight.recommendedAction)}</strong>
      <p>${insight.reasons.map(escapeHtml).join(" / ")}</p>
    </div>
    <div class="source-note">
      <span>Связь с ресерчем</span>
      <p>${escapeHtml(card.source)}</p>
    </div>
    <div class="action-grid">
      ${actionButtonMarkup("Назад", "move-prev", "left", previousDisabled)}
      ${actionButtonMarkup("Вперед", "move-next", "right", nextDisabled)}
      ${actionButtonMarkup(card.blocked ? "Разблокировать" : "Заблокировать", "toggle-blocked", "block")}
      ${actionButtonMarkup("Разделить", "split", "split")}
      ${actionButtonMarkup("В архив", "archive", "archive")}
    </div>
  `;
}

function emptyDetailMarkup() {
  return `
    <div class="detail-head">
      <p class="eyebrow">Выбранная карточка</p>
      <h2>Карточка не выбрана</h2>
      <p>Добавьте задачу или сбросьте демо-данные.</p>
    </div>
  `;
}

function addTaskModalMarkup() {
  return `
    <div class="modal-layer">
      <button class="modal-backdrop" type="button" data-action="close-add" aria-label="Закрыть форму новой задачи"></button>
      <form class="modal double-bezel" data-add-form>
        <div class="bezel-core modal-core">
          <div class="section-heading">
            <div>
              <p class="eyebrow">Создать карточку</p>
              <h2>Новая задача</h2>
            </div>
            <button class="icon-button" type="button" data-action="close-add" aria-label="Закрыть">×</button>
          </div>
          <label>
            Название
            <input name="title" required placeholder="Пакет для проверки преподавателем" />
          </label>
          <label>
            Описание
            <textarea name="description" rows="3" placeholder="Что должно быть закончено?"></textarea>
          </label>
          <div class="form-row">
            <label>
              Приоритет
              <select name="priority">
                <option value="high">Высокий</option>
                <option value="medium" selected>Средний</option>
                <option value="low">Низкий</option>
              </select>
            </label>
            <label>
              Размер
              <select name="size">
                <option value="S">S</option>
                <option value="M" selected>M</option>
                <option value="L">L</option>
              </select>
            </label>
          </div>
          <div class="form-row">
            <label>
              Срок
              <input name="dueDate" type="date" />
            </label>
            <label>
              Теги
              <input name="tags" placeholder="учеба, демо" />
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
    state.cards = addCard(state.cards, data, state.now);
    state.selectedId = state.cards[state.cards.length - 1]?.id;
    state.addOpen = false;
    persistAndRender();
  });
}

function handleAction(action, target) {
  const cardId = target.dataset.cardId || state.selectedId;

  if (action === "select" && target.dataset.cardId) {
    state.selectedId = target.dataset.cardId;
  }
  if (action === "toggle-focus") {
    state.focusOnly = target.checked;
  }
  if (action === "age-day") {
    state.now = addDays(state.now, 1);
  }
  if (action === "open-add") {
    state.addOpen = true;
  }
  if (action === "close-add") {
    state.addOpen = false;
  }
  if (action === "reset") {
    state.cards = cloneDemoCards();
    state.now = DEMO_NOW;
    state.focusOnly = false;
    state.selectedId = rankFocusCards(state.cards, state.now, 1)[0]?.card.id;
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

  persistAndRender();
}

function persistAndRender() {
  persist();
  render();
}

function hydrateReveals() {
  const items = root.querySelectorAll(".reveal");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08 }
  );
  items.forEach((item, index) => {
    item.style.setProperty("--reveal-delay", `${Math.min(index * 70, 420)}ms`);
    observer.observe(item);
  });
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
