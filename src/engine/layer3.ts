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

function arcLabel(cards: CardReading[]): string {
  const past = cards.find((c) => c.position === "past");
  const present = cards.find((c) => c.position === "present");
  const future = cards.find((c) => c.position === "future");
  if (!past || !present || !future) return "";

  return `The thread from past through present into future traces an arc: what was, what is, and what approaches are not isolated moments but movements in a single unfolding story.`;
}

function buildClosing(
  cards: CardReading[],
  relational: RelationalAnalysis,
): string {
  const future = cards.find((c) => c.position === "future");
  if (!future) return "The cards have spoken. Sit with what they reveal.";

  const allReversed = relational.reversalPattern.count === 3;
  const allUpright = relational.reversalPattern.count === 0;
  const majorHeavy = relational.arcanaWeight.count >= 2;

  if (allReversed) {
    return "This reading asks for patience and introspection before action. The path forward will clarify as internal work is done.";
  }
  if (allUpright && majorHeavy) {
    return "The current runs strong and clear. Trust the momentum — what is unfolding carries a weight and purpose beyond the immediate.";
  }
  if (allUpright) {
    return "The energy flows freely through this reading. Move forward with confidence in the direction these cards illuminate.";
  }
  if (majorHeavy) {
    return "Forces larger than the everyday are at work. What is asked of you now is not small — rise to meet it.";
  }

  return "The cards point a way forward. What you do with their counsel is, as always, yours to decide.";
}

function buildOpening(relational: RelationalAnalysis): string {
  return [
    relational.arcanaWeight.detail,
    relational.reversalPattern.count > 0
      ? relational.reversalPattern.detail
      : undefined,
  ]
    .filter(Boolean)
    .join(" ");
}

function buildSynthesis(
  cards: CardReading[],
  relational: RelationalAnalysis,
): string {
  return [
    arcLabel(cards),
    relational.suitDominance?.detail,
    relational.numericalPattern?.detail,
    dignityLabel(relational),
  ]
    .filter(Boolean)
    .join(" ");
}

function dignityLabel(relational: RelationalAnalysis): string | undefined {
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
}
