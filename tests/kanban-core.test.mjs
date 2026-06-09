import test from "node:test";
import assert from "node:assert/strict";
import {
  SCORING_RULES,
  addCard,
  archiveCard,
  calculateSummary,
  getCardAgeDays,
  getWipState,
  moveCard,
  rankFocusCards,
  restoreCard,
  scoreCard,
  splitCard,
  toggleBlocked
} from "../src/kanban-core.js";

const TEST_NOW = "2026-06-09T09:00:00.000Z";

function fixtureCards() {
  return [
    {
      id: "card-research",
      title: "Сводка проблем пользователей",
      description: "Превратить проблемы в понятную фичу.",
      status: "review",
      priority: "high",
      size: "S",
      owner: "Захар",
      enteredAt: "2026-06-05T11:00:00.000Z",
      dueDate: "2026-06-09",
      tags: ["ресерч"],
      blocked: false
    },
    {
      id: "card-drag-shell",
      title: "Кликабельный каркас доски",
      description: "Сделать колонки и сохранение состояния.",
      status: "progress",
      priority: "high",
      size: "M",
      owner: "Захар",
      enteredAt: "2026-06-06T10:30:00.000Z",
      dueDate: "2026-06-11",
      tags: ["ui"],
      blocked: false
    },
    {
      id: "card-aging-assistant",
      title: "Ассистент фокуса",
      description: "Оценивать карточки по возрасту, статусу, WIP и сроку.",
      status: "progress",
      priority: "high",
      size: "M",
      owner: "Захар",
      enteredAt: "2026-06-04T08:15:00.000Z",
      dueDate: "2026-06-10",
      tags: ["поток"],
      blocked: false
    },
    {
      id: "card-policy-explainer",
      title: "Объяснение WIP-лимитов",
      description: "Показать, почему колонка перегружена.",
      status: "review",
      priority: "medium",
      size: "S",
      owner: "Захар",
      enteredAt: "2026-06-03T14:00:00.000Z",
      dueDate: "2026-06-12",
      tags: ["wip"],
      blocked: true
    },
    {
      id: "card-defense-story",
      title: "История для защиты",
      description: "Собрать короткое объяснение.",
      status: "ready",
      priority: "high",
      size: "S",
      owner: "Захар",
      enteredAt: "2026-06-07T16:45:00.000Z",
      dueDate: "2026-06-10",
      tags: ["защита"],
      blocked: false
    },
    {
      id: "card-recurring-reset",
      title: "Повторяющиеся задачи",
      description: "Оставить как развитие после первой версии.",
      status: "backlog",
      priority: "medium",
      size: "M",
      owner: "Захар",
      enteredAt: "2026-05-31T12:00:00.000Z",
      dueDate: "2026-06-18",
      tags: ["потом"],
      blocked: false
    },
    {
      id: "card-visual-polish",
      title: "Визуальная полировка",
      description: "Улучшить панели, кнопки и движение.",
      status: "progress",
      priority: "medium",
      size: "L",
      owner: "Захар",
      enteredAt: "2026-06-08T09:10:00.000Z",
      dueDate: "2026-06-13",
      tags: ["визуал"],
      blocked: false
    },
    {
      id: "card-kanban-basics",
      title: "База канбана проверена",
      description: "Подтвердить WIP-лимиты и видимость узких мест.",
      status: "done",
      priority: "medium",
      size: "S",
      owner: "Захар",
      enteredAt: "2026-06-08T18:20:00.000Z",
      dueDate: "2026-06-09",
      tags: ["готово"],
      blocked: false
    }
  ];
}

test("возраст карточки считается от входа в текущую колонку", () => {
  const card = {
    enteredAt: "2026-06-06T09:00:00.000Z"
  };

  assert.equal(getCardAgeDays(card, TEST_NOW), 3);
});

test("фокус поднимает зависшие, заблокированные и WIP-напряженные карточки", () => {
  const cards = fixtureCards();
  const focus = rankFocusCards(cards, TEST_NOW, 3);

  assert.equal(focus[0].card.id, "card-policy-explainer");
  assert.ok(focus[0].insight.reasons.includes("заблокировано"));
  assert.ok(focus.some((item) => item.card.id === "card-aging-assistant"));
});

test("формула риска использует опубликованные коэффициенты", () => {
  const cards = fixtureCards();
  const card = cards.find((item) => item.id === "card-aging-assistant");
  const insight = scoreCard(card, cards, TEST_NOW);
  const expected =
    insight.ageDays * SCORING_RULES.agePerDay +
    SCORING_RULES.status.progress +
    SCORING_RULES.priority.high +
    SCORING_RULES.size.M +
    SCORING_RULES.due.oneDay +
    SCORING_RULES.stale +
    SCORING_RULES.wipOverLimit;

  assert.equal(insight.score, expected);
});

test("WIP-состояние показывает перегруженные колонки для шапки и метров", () => {
  const cards = fixtureCards();
  const progress = getWipState(cards, "progress");

  assert.equal(progress.count, 3);
  assert.equal(progress.limit, 2);
  assert.equal(progress.isOverLimit, true);
});

test("перемещение карточки сбрасывает enteredAt и снимает блокировку в готово", () => {
  const moved = moveCard(fixtureCards(), "card-policy-explainer", "done", TEST_NOW);
  const card = moved.find((item) => item.id === "card-policy-explainer");

  assert.equal(card.status, "done");
  assert.equal(card.enteredAt, TEST_NOW);
  assert.equal(card.blocked, false);
});

test("разделение зависшей карточки создает маленькую готовую подзадачу", () => {
  const cards = splitCard(fixtureCards(), "card-aging-assistant", TEST_NOW);
  const original = cards.find((item) => item.id === "card-aging-assistant");
  const child = cards.find((item) => item.parentId === "card-aging-assistant");

  assert.ok(original.tags.includes("разделена"));
  assert.equal(child.status, "ready");
  assert.equal(child.size, "S");
  assert.ok(child.title.startsWith("Подзадача:"));
});

test("сводка реагирует на блокировку, архив и добавленные карточки", () => {
  let cards = fixtureCards();
  cards = toggleBlocked(cards, "card-drag-shell", TEST_NOW);
  cards = archiveCard(cards, "card-recurring-reset", TEST_NOW);
  cards = addCard(cards, { title: "Полировка доски", priority: "high", size: "S" }, TEST_NOW);

  const summary = calculateSummary(cards, TEST_NOW);
  assert.equal(summary.blocked, 2);
  assert.equal(summary.total, 8);
  assert.equal(summary.dueSoon >= 2, true);
});

test("восстановление возвращает архивную карточку в исходную колонку", () => {
  const archived = archiveCard(fixtureCards(), "card-drag-shell", TEST_NOW);
  const restored = restoreCard(archived, "card-drag-shell", TEST_NOW);
  const card = restored.find((item) => item.id === "card-drag-shell");

  assert.equal(card.status, "progress");
  assert.equal(card.archivedAt, undefined);
  assert.equal(card.updatedAt, TEST_NOW);
  assert.equal(getWipState(restored, "progress").count, 3);
});

test("новая карточка создается без служебных текстов", () => {
  const cards = addCard([], { title: "Запустить релиз" }, TEST_NOW);
  const [card] = cards;

  assert.equal(card.description, "Без описания.");
  assert.equal(card.owner, "Без исполнителя");
  assert.equal("source" in card, false);
});
