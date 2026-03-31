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

const suitClosing: Record<string, string> = {
  cups: "The waters run deep here. Let yourself feel before you act.",
  pentacles:
    "The ground beneath you is solid. Build on it — practical steps will carry you further than grand plans.",
  swords:
    "Clarity is available if you have the courage to look directly at the truth.",
  wands:
    "The fire is lit. Channel it with intention, or it will choose its own direction.",
};

const buildClosing = (
  cards: CardReading[],
  relational: RelationalAnalysis,
): string => {
  const hasFuture = cards.some((c) => c.position === "future");
  const hasOutcome = cards.some((c) => c.position === "outcome");

  if (!hasFuture && !hasOutcome) {
    return "The cards have spoken. Sit with what they reveal — understanding often arrives in its own time.";
  }

  const total = cards.length;
  const reversedCount = relational.reversalPattern.count;
  const allReversed = reversedCount === total;
  const allUpright = reversedCount === 0;
  const majorHeavy = relational.arcanaWeight.count > total / 2;
  const isLargeSpread = total >= 7;

  let base: string;

  if (allReversed) {
    base =
      "Be gentle with yourself. This reading asks for patience and inward attention before outward action. What feels blocked now is not permanent — it is waiting for the right conditions to move.";
  } else if (allUpright && majorHeavy) {
    base =
      "The current runs strong and clear. Trust what is unfolding — it carries a weight and purpose that will reveal itself in time. You are where you need to be.";
  } else if (allUpright) {
    base =
      "The energy flows freely through this reading. Move forward with confidence — the path ahead is open, and these cards light the way.";
  } else if (majorHeavy) {
    base =
      "Forces larger than the everyday are at work. What is asked of you now is not small, but neither is your capacity to meet it.";
  } else {
    base =
      "The cards offer a way forward. What you do with their counsel is, as always, yours to decide. Trust yourself.";
  }

  const addenda: string[] = [];

  if (isLargeSpread) {
    addenda.push(
      "This is a complex reading with many threads. Give yourself time to sit with it — not everything will be clear immediately.",
    );
  }

  if (relational.suitDominance) {
    const suit = relational.suitDominance.suit;
    if (suitClosing[suit]) {
      addenda.push(suitClosing[suit]);
    }
  }

  const futureOrOutcome = cards.find(
    (c) => c.position === "outcome" || c.position === "future",
  );
  if (
    futureOrOutcome &&
    relational.reversalPattern.count > 0 &&
    relational.arcanaWeight.count > 0 &&
    !allReversed
  ) {
    const hasReversedMajorInFuture = cards.some(
      (c) =>
        (c.position === "future" || c.position === "outcome") && c.fallback,
    );
    // We cannot check orientation from CardReading directly, so we
    // approximate: if the reading has both reversals and major arcana
    // present, and the outcome/future position exists, add a gentler note.
    if (hasReversedMajorInFuture) {
      addenda.push(
        "Where the path ahead shows resistance, remember — a reversed card is not a closed door. It is a door that opens inward.",
      );
    }
  }

  if (addenda.length > 0) {
    return base + " " + addenda.join(" ");
  }

  return base;
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
