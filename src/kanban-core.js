const DAY_MS = 24 * 60 * 60 * 1000;

export const STATUS_FLOW = ["backlog", "ready", "progress", "review", "done"];

export const STATUSES = [
  {
    id: "backlog",
    title: "Бэклог",
    shortTitle: "Бэклог",
    wipLimit: null,
    staleAfterDays: 14,
    policy: "Сырые идеи лежат здесь, пока у них не появится понятный результат."
  },
  {
    id: "ready",
    title: "Готово к работе",
    shortTitle: "Готово",
    wipLimit: 5,
    staleAfterDays: 7,
    policy: "Здесь только задачи с понятным объемом и критерием завершения."
  },
  {
    id: "progress",
    title: "В работе",
    shortTitle: "В работе",
    wipLimit: 2,
    staleAfterDays: 3,
    policy: "Личный WIP-лимит: сначала закрыть текущее, потом брать новое."
  },
  {
    id: "review",
    title: "Проверка",
    shortTitle: "Проверка",
    wipLimit: 2,
    staleAfterDays: 2,
    policy: "Проверка должна быстро разгружаться; старые карточки тормозят поток."
  },
  {
    id: "done",
    title: "Готово",
    shortTitle: "Готово",
    wipLimit: null,
    staleAfterDays: 30,
    policy: "Закрытые карточки остаются видимыми, чтобы показать историю демо."
  }
];

export const DEMO_NOW = "2026-06-09T09:00:00.000Z";

export const demoCards = [
  {
    id: "card-reddit-research",
    title: "Сводка болей из Reddit",
    description: "Превратить найденные проблемы пользователей в защищаемую уникальную фишку.",
    status: "review",
    priority: "high",
    size: "S",
    owner: "Захар",
    enteredAt: "2026-06-05T11:00:00.000Z",
    dueDate: "2026-06-09",
    tags: ["ресерч", "защита"],
    blocked: false,
    source: "Пользователи просят видеть время в статусе, WIP-перегруз и зависшие задачи."
  },
  {
    id: "card-drag-shell",
    title: "Кликабельный каркас доски",
    description: "Сделать колонки, drag/drop, выбор карточки и сохранение состояния.",
    status: "progress",
    priority: "high",
    size: "M",
    owner: "Захар",
    enteredAt: "2026-06-06T10:30:00.000Z",
    dueDate: "2026-06-11",
    tags: ["ui", "клики"],
    blocked: false,
    source: "Демку для учебы нужно реально покликать, а не просто показать скриншот."
  },
  {
    id: "card-aging-assistant",
    title: "Ассистент фокуса",
    description: "Оценивать карточки по возрасту, статусу, WIP, приоритету и риску дедлайна.",
    status: "progress",
    priority: "high",
    size: "M",
    owner: "Захар",
    enteredAt: "2026-06-04T08:15:00.000Z",
    dueDate: "2026-06-10",
    tags: ["фишка", "поток"],
    blocked: false,
    source: "Время в статусе лучше показывает зависание, чем искусственные дедлайны."
  },
  {
    id: "card-policy-explainer",
    title: "Объяснение WIP-лимитов",
    description: "Показать, почему колонка перегружена и какую карточку двигать первой.",
    status: "review",
    priority: "medium",
    size: "S",
    owner: "Захар",
    enteredAt: "2026-06-03T14:00:00.000Z",
    dueDate: "2026-06-12",
    tags: ["wip", "ясность"],
    blocked: true,
    source: "Канбан-инструменты часто показывают WIP-лимит, но не объясняют следующий ход."
  },
  {
    id: "card-defense-story",
    title: "История для защиты",
    description: "Собрать короткое объяснение: проблема, флоу, алгоритм и шаги демо.",
    status: "ready",
    priority: "high",
    size: "S",
    owner: "Захар",
    enteredAt: "2026-06-07T16:45:00.000Z",
    dueDate: "2026-06-10",
    tags: ["учеба", "защита"],
    blocked: false,
    source: "Уникальной фишке нужна понятная учебная аргументация."
  },
  {
    id: "card-recurring-reset",
    title: "Идея повторяющихся задач",
    description: "Оставить автосброс и повторяемые карточки как развитие после MVP.",
    status: "backlog",
    priority: "medium",
    size: "M",
    owner: "Захар",
    enteredAt: "2026-05-31T12:00:00.000Z",
    dueDate: "2026-06-18",
    tags: ["потом", "автоматизация"],
    blocked: false,
    source: "Повторяющиеся задачи всплыли в ресерче, но коучинг по зависаниям сильнее."
  },
  {
    id: "card-visual-polish",
    title: "Визуальная полировка",
    description: "Применить премиальные вложенные панели, тактильные кнопки и аккуратное движение.",
    status: "progress",
    priority: "medium",
    size: "L",
    owner: "Захар",
    enteredAt: "2026-06-08T09:10:00.000Z",
    dueDate: "2026-06-13",
    tags: ["визуал", "skill"],
    blocked: false,
    source: "Приложенный skill требует дорогой UI, а не стандартный клон Trello."
  },
  {
    id: "card-kanban-basics",
    title: "База канбана проверена",
    description: "Подтвердить карточки, колонки, WIP-лимиты и видимость узких мест.",
    status: "done",
    priority: "medium",
    size: "S",
    owner: "Захар",
    enteredAt: "2026-06-08T18:20:00.000Z",
    dueDate: "2026-06-09",
    tags: ["ресерч", "готово"],
    blocked: false,
    source: "Доска построена вокруг реальных идей канбан-потока."
  }
];

export function cloneDemoCards() {
  return demoCards.map((card) => ({ ...card, tags: [...card.tags] }));
}

export function addDays(isoDate, days) {
  const date = new Date(isoDate);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

export function getStatus(statusId) {
  return STATUSES.find((status) => status.id === statusId);
}

export function getCardAgeDays(card, now = DEMO_NOW) {
  return Math.max(0, Math.floor((new Date(now) - new Date(card.enteredAt)) / DAY_MS));
}

export function getDueDaysLeft(card, now = DEMO_NOW) {
  if (!card.dueDate) return null;
  const due = new Date(`${card.dueDate}T00:00:00.000Z`);
  const current = new Date(now);
  const currentDay = Date.UTC(current.getUTCFullYear(), current.getUTCMonth(), current.getUTCDate());
  return Math.round((due.getTime() - currentDay) / DAY_MS);
}

export function getCardsByStatus(cards, statusId) {
  return cards.filter((card) => card.status === statusId && !card.archivedAt);
}

export function getWipState(cards, statusId) {
  const status = getStatus(statusId);
  const count = getCardsByStatus(cards, statusId).length;
  const limit = status?.wipLimit ?? null;
  return {
    count,
    limit,
    isLimited: typeof limit === "number",
    isOverLimit: typeof limit === "number" && count > limit,
    spare: typeof limit === "number" ? limit - count : null
  };
}

export function scoreCard(card, cards, now = DEMO_NOW) {
  const status = getStatus(card.status);
  const ageDays = getCardAgeDays(card, now);
  const dueDays = getDueDaysLeft(card, now);
  const wip = getWipState(cards, card.status);
  const priorityScore = { low: 4, medium: 10, high: 18 }[card.priority] ?? 6;
  const statusScore = { backlog: 2, ready: 8, progress: 18, review: 16, done: -50 }[card.status] ?? 0;
  const sizeScore = { S: 8, M: 4, L: -3 }[card.size] ?? 0;
  const dueScore = dueDays === null ? 0 : dueDays < 0 ? 26 : dueDays <= 1 ? 22 : dueDays <= 3 ? 12 : 0;
  const staleScore = ageDays > (status?.staleAfterDays ?? 7) ? 18 : 0;
  const blockedScore = card.blocked ? 40 : 0;
  const wipScore = wip.isOverLimit ? 15 : 0;
  const score = Math.max(0, ageDays * 7 + priorityScore + statusScore + sizeScore + dueScore + staleScore + blockedScore + wipScore);
  const reasons = buildReasons({ card, status, ageDays, dueDays, wip });

  return {
    cardId: card.id,
    score,
    ageDays,
    dueDays,
    tone: score >= 78 || card.blocked ? "critical" : score >= 48 ? "warning" : "calm",
    recommendedAction: getRecommendedAction(card, ageDays, status),
    reasons
  };
}

export function rankFocusCards(cards, now = DEMO_NOW, max = 3) {
  return cards
    .filter((card) => card.status !== "done" && !card.archivedAt)
    .map((card) => ({ card, insight: scoreCard(card, cards, now) }))
    .sort((a, b) => b.insight.score - a.insight.score)
    .slice(0, max);
}

export function calculateSummary(cards, now = DEMO_NOW) {
  const visibleCards = cards.filter((card) => !card.archivedAt);
  const staleCards = visibleCards.filter((card) => {
    const status = getStatus(card.status);
    return card.status !== "done" && getCardAgeDays(card, now) > (status?.staleAfterDays ?? 7);
  });
  const blockedCards = visibleCards.filter((card) => card.blocked && card.status !== "done");
  const overloadedColumns = STATUSES.filter((status) => getWipState(cards, status.id).isOverLimit);
  const dueSoonCards = visibleCards.filter((card) => {
    const dueDays = getDueDaysLeft(card, now);
    return card.status !== "done" && dueDays !== null && dueDays <= 1;
  });

  return {
    total: visibleCards.length,
    stale: staleCards.length,
    blocked: blockedCards.length,
    overloaded: overloadedColumns.length,
    dueSoon: dueSoonCards.length,
    done: getCardsByStatus(cards, "done").length
  };
}

export function moveCard(cards, cardId, nextStatus, now = DEMO_NOW) {
  if (!STATUS_FLOW.includes(nextStatus)) return cards;
  return cards.map((card) => {
    if (card.id !== cardId || card.status === nextStatus) return card;
    return {
      ...card,
      status: nextStatus,
      enteredAt: now,
      blocked: nextStatus === "done" ? false : card.blocked,
      updatedAt: now
    };
  });
}

export function moveCardInFlow(cards, cardId, direction, now = DEMO_NOW) {
  const card = cards.find((item) => item.id === cardId);
  if (!card) return cards;
  const currentIndex = STATUS_FLOW.indexOf(card.status);
  const delta = direction === "next" ? 1 : -1;
  const nextStatus = STATUS_FLOW[Math.min(STATUS_FLOW.length - 1, Math.max(0, currentIndex + delta))];
  return moveCard(cards, cardId, nextStatus, now);
}

export function toggleBlocked(cards, cardId, now = DEMO_NOW) {
  return cards.map((card) => {
    if (card.id !== cardId) return card;
    return {
      ...card,
      blocked: !card.blocked,
      updatedAt: now
    };
  });
}

export function archiveCard(cards, cardId, now = DEMO_NOW) {
  return cards.map((card) => {
    if (card.id !== cardId) return card;
    return {
      ...card,
      archivedAt: now,
      updatedAt: now
    };
  });
}

export function splitCard(cards, cardId, now = DEMO_NOW) {
  const original = cards.find((card) => card.id === cardId);
  if (!original) return cards;

  const child = {
    ...original,
    id: `${cardId}-split-${Date.now().toString(36)}`,
    title: `Подзадача: ${original.title}`,
    description: "Меньшая подзадача, созданная из карточки, которая слишком долго стояла на месте.",
    status: "ready",
    priority: original.priority,
    size: "S",
    enteredAt: now,
    blocked: false,
    parentId: cardId,
    tags: Array.from(new Set([...original.tags, "разделение"])),
    source: "Разделено из зависшей карточки, чтобы поток снова двигался.",
    updatedAt: now
  };

  return cards
    .map((card) => {
      if (card.id !== cardId) return card;
      return {
        ...card,
        description: `${card.description} Разделено один раз, чтобы уменьшить объем.`,
        tags: Array.from(new Set([...card.tags, "разделена"])),
        updatedAt: now
      };
    })
    .concat(child);
}

export function addCard(cards, input, now = DEMO_NOW) {
  const title = String(input.title ?? "").trim();
  if (!title) return cards;

  const card = {
    id: `card-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    title,
    description: String(input.description ?? "Новая задача, добавленная во время демо.").trim(),
    status: STATUS_FLOW.includes(input.status) ? input.status : "ready",
    priority: ["low", "medium", "high"].includes(input.priority) ? input.priority : "medium",
    size: ["S", "M", "L"].includes(input.size) ? input.size : "M",
    owner: String(input.owner ?? "Захар").trim() || "Захар",
    enteredAt: now,
    dueDate: input.dueDate || null,
    tags: normalizeTags(input.tags),
    blocked: false,
    source: "Создано вручную в кликабельной демке."
  };

  return cards.concat(card);
}

function buildReasons({ card, status, ageDays, dueDays, wip }) {
  const reasons = [`${ageDays} дн. в «${status?.shortTitle ?? card.status}»`];
  if (card.blocked) reasons.push("заблокировано");
  if (wip.isOverLimit) reasons.push(`WIP ${wip.count}/${wip.limit}`);
  if (dueDays !== null && dueDays < 0) reasons.push("просрочено");
  if (dueDays !== null && dueDays >= 0 && dueDays <= 1) reasons.push("срок близко");
  if (ageDays > (status?.staleAfterDays ?? 7)) reasons.push("зависла");
  if (card.priority === "high") reasons.push("высокий приоритет");
  if (card.size === "S") reasons.push("быстро закрыть");
  return reasons.slice(0, 5);
}

function getRecommendedAction(card, ageDays, status) {
  if (card.blocked) return "разблокировать или откатить";
  if (card.status === "review") return "закрыть проверку";
  if (card.status === "progress" && ageDays > (status?.staleAfterDays ?? 3)) return "разделить или закрыть";
  if (card.status === "progress") return "закончить перед новой задачей";
  if (card.status === "ready") return "взять после освобождения WIP";
  return "уточнить объем";
}

function normalizeTags(tags) {
  if (Array.isArray(tags)) return tags.map((tag) => String(tag).trim()).filter(Boolean).slice(0, 4);
  return String(tags ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 4);
}
