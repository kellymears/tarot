import type {
  CardReading,
  Narrative,
  RelationalAnalysis,
  SpreadCard,
} from "./types.js";

export function assembleNarrative(
  cards: CardReading[],
  relational: RelationalAnalysis,
  spread: SpreadCard[],
): Narrative {
  return {
    closing: buildClosing(cards, relational, spread),
    opening: buildOpening(relational, spread),
    synthesis: buildSynthesis(cards, relational, spread),
  };
}

const arcLabel = (cards: CardReading[], spread: SpreadCard[]): string => {
  const past = spread.find((s) => s.position === "past");
  const present = spread.find((s) => s.position === "present");
  const future = spread.find((s) => s.position === "future");

  if (!past || !present || !future) return "";

  return `From ${past.card.name} through ${present.card.name} to ${future.card.name}, the arc of this reading traces a movement from what shaped you into what is unfolding and onward to what approaches.`;
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
  spread: SpreadCard[],
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
    const futureCard = spread.find(
      (s) => s.position === "outcome" || s.position === "future",
    );
    base = futureCard
      ? `The cards offer a way forward, with ${futureCard.card.name} lighting the path ahead. What you do with their counsel is, as always, yours to decide. Trust yourself.`
      : "The cards offer a way forward. What you do with their counsel is, as always, yours to decide. Trust yourself.";
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

const namedMajorDetail = (spread: SpreadCard[]): string | undefined => {
  const majors = spread.filter((s) => s.card.arcana === "major");
  if (majors.length === 1) {
    return `${majors[0].card.name} anchors this spread, marking where larger forces intersect with the practical.`;
  }
  if (majors.length === 2) {
    return `${majors[0].card.name} and ${majors[1].card.name} anchor this spread, marking where larger forces assert themselves.`;
  }
  return undefined;
};

const buildOpening = (
  relational: RelationalAnalysis,
  spread: SpreadCard[],
): string =>
  [
    relational.arcanaWeight.detail,
    namedMajorDetail(spread),
    relational.reversalPattern.count > 0
      ? relational.reversalPattern.detail
      : undefined,
    relational.elementalBalance?.detail,
  ]
    .filter(Boolean)
    .join(" ");

const buildSynthesis = (
  cards: CardReading[],
  relational: RelationalAnalysis,
  spread: SpreadCard[],
): string =>
  [
    arcLabel(cards, spread),
    relational.suitDominance?.detail,
    relational.numericalPattern?.detail,
    dignityLabel(relational),
    relational.courtCards?.detail,
  ]
    .filter(Boolean)
    .join(" ");

const dignityLabel = (relational: RelationalAnalysis): string | undefined => {
  const enemies = relational.dignities.filter(
    (d) => d.relationship === "enemy",
  );
  const allies = relational.dignities.filter(
    (d) => d.relationship === "allied",
  );

  if (enemies.length > 0 && allies.length > 0) {
    const enemy = enemies[0];
    const ally = allies[0];
    return `Tension between ${enemy.cards[0]} and ${enemy.cards[1]} is counterbalanced by the harmony of ${ally.cards[0]} and ${ally.cards[1]} — the reading holds both conflict and support.`;
  }
  if (enemies.length > 0) {
    const enemy = enemies[0];
    return `The friction between ${enemy.cards[0]} and ${enemy.cards[1]} asks you to reconcile competing energies rather than choose between them.`;
  }
  if (allies.length > 0) {
    const ally = allies[0];
    return `The harmony between ${ally.cards[0]} and ${ally.cards[1]} suggests a natural flow — these energies support rather than hinder each other.`;
  }
  return undefined;
};
