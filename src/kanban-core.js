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
    policy: "Закрытые карточки остаются видимыми, чтобы сохранить историю работы."
  }
];

export const SCORING_RULES = {
  serviceLevel: {
    probability: 85,
    expectedDays: {
      S: 2,
      M: 4,
      L: 7
    },
    defaultExpectedDays: 4
  },
  ageRatio: {
    weight: 45,
    cap: 1.4,
    near: 0.75,
    nearBonus: 8,
    overBonus: 22
  },
  priority: {
    low: 5,
    medium: 11,
    high: 20
  },
  status: {
    backlog: -8,
    ready: 8,
    progress: 24,
    review: 28,
    done: -100
  },
  size: {
    S: 8,
    M: 2,
    L: -8
  },
  due: {
    overdue: 34,
    oneDay: 24,
    threeDays: 14,
    later: 0
  },
  stale: 14,
  blocked: 45,
  wipOverLimit: 18,
  tone: {
    warning: 60,
    critical: 95
  }
};

export function nowIso() {
  return new Date().toISOString();
}

export function getStatus(statusId) {
  return STATUSES.find((status) => status.id === statusId);
}

export function getCardAgeDays(card, now = nowIso()) {
  return Math.max(0, Math.floor((new Date(now) - new Date(card.enteredAt)) / DAY_MS));
}

export function getDueDaysLeft(card, now = nowIso()) {
  if (!card.dueDate) return null;
  const due = new Date(`${card.dueDate}T00:00:00.000Z`);
  const current = new Date(now);
  const currentDay = Date.UTC(current.getUTCFullYear(), current.getUTCMonth(), current.getUTCDate());
  return Math.round((due.getTime() - currentDay) / DAY_MS);
}

export function getExpectedCycleDays(card) {
  return SCORING_RULES.serviceLevel.expectedDays[card.size] ?? SCORING_RULES.serviceLevel.defaultExpectedDays;
}

export function getFlowAgeDays(card, now = nowIso()) {
  const startedAt = getFlowStartedAt(card);
  if (!startedAt) return 0;
  const endAt = card.status === "done" && card.finishedAt ? card.finishedAt : now;
  return Math.max(0, Math.floor((new Date(endAt) - new Date(startedAt)) / DAY_MS));
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

export function scoreCard(card, cards, now = nowIso()) {
  const status = getStatus(card.status);
  const columnAgeDays = getCardAgeDays(card, now);
  const flowAgeDays = getFlowAgeDays(card, now);
  const expectedDays = getExpectedCycleDays(card);
  const ageRatio = expectedDays > 0 ? flowAgeDays / expectedDays : 0;
  const dueDays = getDueDaysLeft(card, now);
  const wip = getWipState(cards, card.status);
  const ageScore = Math.round(Math.min(ageRatio, SCORING_RULES.ageRatio.cap) * SCORING_RULES.ageRatio.weight);
  const serviceLevelScore =
    ageRatio >= 1
      ? SCORING_RULES.ageRatio.overBonus
      : ageRatio >= SCORING_RULES.ageRatio.near
        ? SCORING_RULES.ageRatio.nearBonus
        : 0;
  const priorityScore = SCORING_RULES.priority[card.priority] ?? 6;
  const statusScore = SCORING_RULES.status[card.status] ?? 0;
  const sizeScore = SCORING_RULES.size[card.size] ?? 0;
  const dueScore =
    dueDays === null
      ? SCORING_RULES.due.later
      : dueDays < 0
        ? SCORING_RULES.due.overdue
        : dueDays <= 1
          ? SCORING_RULES.due.oneDay
          : dueDays <= 3
            ? SCORING_RULES.due.threeDays
            : SCORING_RULES.due.later;
  const staleScore = columnAgeDays > (status?.staleAfterDays ?? 7) ? SCORING_RULES.stale : 0;
  const blockedScore = card.blocked ? SCORING_RULES.blocked : 0;
  const wipScore = wip.isOverLimit ? SCORING_RULES.wipOverLimit : 0;
  const score = Math.max(
    0,
    ageScore +
      serviceLevelScore +
      priorityScore +
      statusScore +
      sizeScore +
      dueScore +
      staleScore +
      blockedScore +
      wipScore
  );
  const reasons = buildReasons({ card, status, columnAgeDays, flowAgeDays, expectedDays, ageRatio, dueDays, wip });

  return {
    cardId: card.id,
    score,
    ageDays: flowAgeDays,
    columnAgeDays,
    flowAgeDays,
    expectedDays,
    ageRatio,
    dueDays,
    tone:
      score >= SCORING_RULES.tone.critical || card.blocked || ageRatio >= 1
        ? "critical"
        : score >= SCORING_RULES.tone.warning || ageRatio >= SCORING_RULES.ageRatio.near
          ? "warning"
          : "calm",
    recommendedAction: getRecommendedAction(card, { columnAgeDays, ageRatio, status }),
    reasons
  };
}

export function rankFocusCards(cards, now = nowIso(), max = 3) {
  return cards
    .filter((card) => card.status !== "done" && !card.archivedAt)
    .map((card) => ({ card, insight: scoreCard(card, cards, now) }))
    .sort((a, b) => b.insight.score - a.insight.score)
    .slice(0, max);
}

export function calculateSummary(cards, now = nowIso()) {
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

export function moveCard(cards, cardId, nextStatus, now = nowIso()) {
  if (!STATUS_FLOW.includes(nextStatus)) return cards;
  return cards.map((card) => {
    if (card.id !== cardId || card.status === nextStatus) return card;
    const updatedCard = {
      ...card,
      status: nextStatus,
      enteredAt: now,
      blocked: nextStatus === "done" ? false : card.blocked,
      updatedAt: now
    };
    if (!updatedCard.createdAt) updatedCard.createdAt = card.createdAt ?? card.enteredAt ?? now;
    if (nextStatus === "backlog") {
      delete updatedCard.startedAt;
      delete updatedCard.finishedAt;
    } else if (nextStatus === "done") {
      updatedCard.startedAt = card.startedAt ?? card.createdAt ?? card.enteredAt ?? now;
      updatedCard.finishedAt = now;
    } else {
      updatedCard.startedAt = card.startedAt ?? now;
      delete updatedCard.finishedAt;
    }
    return updatedCard;
  });
}

export function moveCardInFlow(cards, cardId, direction, now = nowIso()) {
  const card = cards.find((item) => item.id === cardId);
  if (!card) return cards;
  const currentIndex = STATUS_FLOW.indexOf(card.status);
  const delta = direction === "next" ? 1 : -1;
  const nextStatus = STATUS_FLOW[Math.min(STATUS_FLOW.length - 1, Math.max(0, currentIndex + delta))];
  return moveCard(cards, cardId, nextStatus, now);
}

export function toggleBlocked(cards, cardId, now = nowIso()) {
  return cards.map((card) => {
    if (card.id !== cardId) return card;
    return {
      ...card,
      blocked: !card.blocked,
      updatedAt: now
    };
  });
}

export function archiveCard(cards, cardId, now = nowIso()) {
  return cards.map((card) => {
    if (card.id !== cardId) return card;
    return {
      ...card,
      archivedAt: now,
      updatedAt: now
    };
  });
}

export function restoreCard(cards, cardId, now = nowIso()) {
  return cards.map((card) => {
    if (card.id !== cardId) return card;
    const restoredCard = { ...card };
    delete restoredCard.archivedAt;
    return {
      ...restoredCard,
      updatedAt: now
    };
  });
}

export function splitCard(cards, cardId, now = nowIso()) {
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
    createdAt: now,
    startedAt: now,
    enteredAt: now,
    blocked: false,
    parentId: cardId,
    tags: Array.from(new Set([...original.tags, "разделение"])),
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

export function addCard(cards, input, now = nowIso()) {
  const title = String(input.title ?? "").trim();
  if (!title) return cards;

  const card = {
    id: `card-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    title,
    description: String(input.description ?? "").trim() || "Без описания.",
    status: STATUS_FLOW.includes(input.status) ? input.status : "ready",
    priority: ["low", "medium", "high"].includes(input.priority) ? input.priority : "medium",
    size: ["S", "M", "L"].includes(input.size) ? input.size : "M",
    owner: String(input.owner ?? "").trim() || "Без исполнителя",
    createdAt: now,
    startedAt: input.status === "backlog" ? null : now,
    enteredAt: now,
    dueDate: input.dueDate || null,
    tags: normalizeTags(input.tags),
    blocked: false,
    updatedAt: now
  };

  return cards.concat(card);
}

function buildReasons({ card, status, columnAgeDays, flowAgeDays, expectedDays, ageRatio, dueDays, wip }) {
  const reasons =
    card.status === "backlog"
      ? [`${columnAgeDays} дн. в «${status?.shortTitle ?? card.status}»`]
      : [`${flowAgeDays}/${expectedDays} дн. SLE`, `${columnAgeDays} дн. в «${status?.shortTitle ?? card.status}»`];
  if (ageRatio >= 1) reasons.push("выше SLE");
  if (ageRatio >= SCORING_RULES.ageRatio.near && ageRatio < 1) reasons.push("близко к SLE");
  if (card.blocked) reasons.push("заблокировано");
  if (wip.isOverLimit) reasons.push(`WIP ${wip.count}/${wip.limit}`);
  if (dueDays !== null && dueDays < 0) reasons.push("просрочено");
  if (dueDays !== null && dueDays >= 0 && dueDays <= 1) reasons.push("срок близко");
  if (columnAgeDays > (status?.staleAfterDays ?? 7)) reasons.push("зависла в колонке");
  if (card.priority === "high") reasons.push("высокий приоритет");
  if (card.size === "S") reasons.push("быстро закрыть");
  return reasons.slice(0, 5);
}

function getRecommendedAction(card, { columnAgeDays, ageRatio, status }) {
  if (card.blocked) return "разблокировать или откатить";
  if (card.status === "review") return "закрыть проверку";
  if (card.size === "L" && ageRatio >= SCORING_RULES.ageRatio.near) return "разделить до SLE";
  if (card.status === "progress" && (ageRatio >= 1 || columnAgeDays > (status?.staleAfterDays ?? 3))) return "разделить или закрыть";
  if (card.status === "progress") return "закончить перед новой задачей";
  if (card.status === "ready") return "взять после освобождения WIP";
  return "уточнить объем";
}

function getFlowStartedAt(card) {
  if (card.status === "backlog" && !card.startedAt) return null;
  return card.startedAt ?? card.createdAt ?? card.enteredAt;
}

function normalizeTags(tags) {
  if (Array.isArray(tags)) return tags.map((tag) => String(tag).trim()).filter(Boolean).slice(0, 4);
  return String(tags ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 4);
}
