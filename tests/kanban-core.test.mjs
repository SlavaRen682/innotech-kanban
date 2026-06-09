import test from "node:test";
import assert from "node:assert/strict";
import {
  DEMO_NOW,
  addCard,
  archiveCard,
  calculateSummary,
  cloneDemoCards,
  getCardAgeDays,
  getWipState,
  moveCard,
  rankFocusCards,
  splitCard,
  toggleBlocked
} from "../src/kanban-core.js";

test("возраст карточки считается от входа в текущую колонку", () => {
  const card = {
    enteredAt: "2026-06-06T09:00:00.000Z"
  };

  assert.equal(getCardAgeDays(card, DEMO_NOW), 3);
});

test("фокус поднимает зависшие, заблокированные и WIP-напряженные карточки", () => {
  const cards = cloneDemoCards();
  const focus = rankFocusCards(cards, DEMO_NOW, 3);

  assert.equal(focus[0].card.id, "card-policy-explainer");
  assert.ok(focus[0].insight.reasons.includes("заблокировано"));
  assert.ok(focus.some((item) => item.card.id === "card-aging-assistant"));
});

test("WIP-состояние показывает перегруженные колонки для шапки и метров", () => {
  const cards = cloneDemoCards();
  const progress = getWipState(cards, "progress");

  assert.equal(progress.count, 3);
  assert.equal(progress.limit, 2);
  assert.equal(progress.isOverLimit, true);
});

test("перемещение карточки сбрасывает enteredAt и снимает блокировку в готово", () => {
  const moved = moveCard(cloneDemoCards(), "card-policy-explainer", "done", DEMO_NOW);
  const card = moved.find((item) => item.id === "card-policy-explainer");

  assert.equal(card.status, "done");
  assert.equal(card.enteredAt, DEMO_NOW);
  assert.equal(card.blocked, false);
});

test("разделение зависшей карточки создает маленькую готовую подзадачу", () => {
  const cards = splitCard(cloneDemoCards(), "card-aging-assistant", DEMO_NOW);
  const original = cards.find((item) => item.id === "card-aging-assistant");
  const child = cards.find((item) => item.parentId === "card-aging-assistant");

  assert.ok(original.tags.includes("разделена"));
  assert.equal(child.status, "ready");
  assert.equal(child.size, "S");
  assert.ok(child.title.startsWith("Подзадача:"));
});

test("сводка реагирует на блокировку, архив и добавленные карточки", () => {
  let cards = cloneDemoCards();
  cards = toggleBlocked(cards, "card-drag-shell", DEMO_NOW);
  cards = archiveCard(cards, "card-recurring-reset", DEMO_NOW);
  cards = addCard(cards, { title: "Полировка демо для преподавателя", priority: "high", size: "S" }, DEMO_NOW);

  const summary = calculateSummary(cards, DEMO_NOW);
  assert.equal(summary.blocked, 2);
  assert.equal(summary.total, 8);
  assert.equal(summary.dueSoon >= 2, true);
});
