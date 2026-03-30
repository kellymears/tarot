import type { CardReading, Narrative, RelationalAnalysis } from "./types.js";

export function assembleNarrative(
  cards: CardReading[],
  relational: RelationalAnalysis,
): Narrative {
  return {
    closing: buildClosing(cards, relational),
    opening: buildOpening(relational),
    synthesis: buildSynthesis(cards, relational),
  };
}

const arcLabel = (cards: CardReading[]): string => {
  const hasAllPositions =
    cards.some((c) => c.position === "past") &&
    cards.some((c) => c.position === "present") &&
    cards.some((c) => c.position === "future");

  if (!hasAllPositions) return "";

  return "The thread from past through present into future traces an arc: what was, what is, and what approaches are not isolated moments but movements in a single unfolding story.";
};

const buildClosing = (
  cards: CardReading[],
  relational: RelationalAnalysis,
): string => {
  const hasFuture = cards.some((c) => c.position === "future");
  if (!hasFuture)
    return "The cards have spoken. Sit with what they reveal — understanding often arrives in its own time.";

  const allReversed = relational.reversalPattern.count === 3;
  const allUpright = relational.reversalPattern.count === 0;
  const majorHeavy = relational.arcanaWeight.count >= 2;

  if (allReversed) {
    return "Be gentle with yourself. This reading asks for patience and inward attention before outward action. What feels blocked now is not permanent — it is waiting for the right conditions to move.";
  }
  if (allUpright && majorHeavy) {
    return "The current runs strong and clear. Trust what is unfolding — it carries a weight and purpose that will reveal itself in time. You are where you need to be.";
  }
  if (allUpright) {
    return "The energy flows freely through this reading. Move forward with confidence — the path ahead is open, and these cards light the way.";
  }
  if (majorHeavy) {
    return "Forces larger than the everyday are at work. What is asked of you now is not small, but neither is your capacity to meet it.";
  }

  return "The cards offer a way forward. What you do with their counsel is, as always, yours to decide. Trust yourself.";
};

const buildOpening = (relational: RelationalAnalysis): string =>
  [
    relational.arcanaWeight.detail,
    relational.reversalPattern.count > 0
      ? relational.reversalPattern.detail
      : undefined,
  ]
    .filter(Boolean)
    .join(" ");

const buildSynthesis = (
  cards: CardReading[],
  relational: RelationalAnalysis,
): string =>
  [
    arcLabel(cards),
    relational.suitDominance?.detail,
    relational.numericalPattern?.detail,
    dignityLabel(relational),
  ]
    .filter(Boolean)
    .join(" ");

const dignityLabel = (relational: RelationalAnalysis): string | undefined => {
  const hasEnemy = relational.dignities.some((d) => d.relationship === "enemy");
  const hasAllied = relational.dignities.some(
    (d) => d.relationship === "allied",
  );

  if (hasEnemy && hasAllied)
    return "The elemental tensions and alliances in this spread suggest a journey that is neither entirely smooth nor entirely obstructed — balance is the work.";
  if (hasEnemy)
    return "Elemental friction runs through this reading, asking you to reconcile competing energies rather than choose between them.";
  if (hasAllied)
    return "The elemental harmony across your cards suggests a natural flow — the energies support rather than hinder each other.";
  return undefined;
};
