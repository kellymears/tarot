import type { Element, ElementalDignity, SpreadCard } from "../types.js";

import {
  ALLIED,
  ELEMENT_NAME,
  ENEMY,
  MAJOR_ELEMENT,
  SUIT_ELEMENT,
} from "../../constants.js";

function elementFor(card: SpreadCard): Element | null {
  if (card.card.suit) return SUIT_ELEMENT[card.card.suit];
  return MAJOR_ELEMENT[card.card.id] ?? null;
}

function isPair(a: Element, b: Element) {
  return ([x, y]: [Element, Element]) =>
    (a === x && b === y) || (a === y && b === x);
}

function relationship(a: Element, b: Element): "allied" | "enemy" | "neutral" {
  if (a === b) return "allied";
  if (ALLIED.some(isPair(a, b))) return "allied";
  if (ENEMY.some(isPair(a, b))) return "enemy";
  return "neutral";
}

const relationshipDetail: Record<
  "allied" | "enemy" | "neutral",
  (a: string, b: string, eA: string, eB: string) => string
> = {
  allied: (a, b, eA, eB) =>
    eA === eB
      ? `${a} and ${b} share the element of ${eA}, doubling its influence and creating a powerful resonance between these positions.`
      : `The ${eA} of ${a} and ${eB} of ${b} are allied elements — they strengthen and support each other across your reading.`,
  enemy: (a, b, eA, eB) =>
    `The ${eA} of ${a} and ${eB} of ${b} stand in opposition — a creative tension that demands conscious navigation between these positions.`,
  neutral: (a, b, eA, eB) =>
    `${eA} and ${eB} hold a neutral relation between ${a} and ${b}, suggesting independent but non-conflicting energies.`,
};

export function analyzeDignities(spread: SpreadCard[]): ElementalDignity[] {
  return spread.slice(0, -1).flatMap((a, i) => {
    const b = spread[i + 1];
    const elA = elementFor(a);
    const elB = elementFor(b);

    if (!elA || !elB) return [];

    const rel = relationship(elA, elB);
    return {
      cards: [a.card.name, b.card.name],
      detail: relationshipDetail[rel](
        a.card.name,
        b.card.name,
        ELEMENT_NAME[elA],
        ELEMENT_NAME[elB],
      ),
      relationship: rel,
    };
  });
}
