import type { Element, ElementalDignity, SpreadCard } from "../types.js";

import {
  DIGNITIES,
  ELEMENT_NAME,
  MAJOR_ELEMENT,
  SUIT_ELEMENT,
} from "../../constants.js";

const elementFor = (card: SpreadCard): Element | null => {
  if (card.card.suit) return SUIT_ELEMENT[card.card.suit];
  return MAJOR_ELEMENT[card.card.id] ?? null;
};

const isPair =
  (a: Element, b: Element) =>
  ([x, y]: [Element, Element]) =>
    (a === x && b === y) || (a === y && b === x);

const relationship = (
  a: Element,
  b: Element,
): "allied" | "enemy" | "neutral" => {
  if (a === b) return "allied";
  if (DIGNITIES.allied.some(isPair(a, b))) return "allied";
  if (DIGNITIES.enemy.some(isPair(a, b))) return "enemy";
  return "neutral";
};

const alliedDetail = (
  a: string,
  b: string,
  elA: Element,
  elB: Element,
): string => {
  if (elA === elB) {
    return `${a} and ${b} share the element of ${ELEMENT_NAME[elA]}, doubling its influence and creating a powerful resonance between these positions.`;
  }

  const pair = [elA, elB].sort().join("+");
  switch (pair) {
    case "air+fire":
      return `The ${ELEMENT_NAME[elA]} of ${a} and ${ELEMENT_NAME[elB]} of ${b} are allied \u2014 thought and action align, and ideas find immediate expression.`;
    case "earth+water":
      return `The ${ELEMENT_NAME[elA]} of ${a} and ${ELEMENT_NAME[elB]} of ${b} are allied \u2014 emotion and practicality work together, and feelings find tangible form.`;
    default:
      return `The ${ELEMENT_NAME[elA]} of ${a} and ${ELEMENT_NAME[elB]} of ${b} are allied elements \u2014 they strengthen and support each other across your reading.`;
  }
};

const enemyDetail = (
  a: string,
  b: string,
  elA: Element,
  elB: Element,
): string => {
  const pair = [elA, elB].sort().join("+");
  switch (pair) {
    case "air+earth":
      return `The ${ELEMENT_NAME[elA]} of ${a} and ${ELEMENT_NAME[elB]} of ${b} stand in opposition \u2014 abstraction and reality collide, and ideas struggle to take root.`;
    case "fire+water":
      return `The ${ELEMENT_NAME[elA]} of ${a} and ${ELEMENT_NAME[elB]} of ${b} stand in opposition \u2014 passion and emotion clash, and desire wars with deeper feeling.`;
    default:
      return `The ${ELEMENT_NAME[elA]} of ${a} and ${ELEMENT_NAME[elB]} of ${b} stand in opposition \u2014 a creative tension that demands conscious navigation between these positions.`;
  }
};

const relationshipDetail: Record<
  "allied" | "enemy" | "neutral",
  (a: string, b: string, elA: Element, elB: Element) => string
> = {
  allied: alliedDetail,
  enemy: enemyDetail,
  neutral: (a, b, elA, elB) => {
    const pair = [elA, elB].sort().join("+");
    switch (pair) {
      case "air+water":
        return `${a} (${ELEMENT_NAME[elA]}) and ${b} (${ELEMENT_NAME[elB]}) neither strengthen nor oppose each other \u2014 thought and feeling coexist without merging.`;
      case "earth+fire":
        return `${a} (${ELEMENT_NAME[elA]}) and ${b} (${ELEMENT_NAME[elB]}) neither strengthen nor oppose each other \u2014 the builder and the spark operate on parallel tracks.`;
      default:
        return `${ELEMENT_NAME[elA]} and ${ELEMENT_NAME[elB]} hold a neutral relation between ${a} and ${b}, suggesting independent but non-conflicting energies.`;
    }
  },
};

export function analyzeDignities(spread: SpreadCard[]): ElementalDignity[] {
  const raw = spread.slice(0, -1).flatMap((a, i) => {
    const b = spread[i + 1];
    const elA = elementFor(a);
    const elB = elementFor(b);

    if (!elA || !elB) return [];

    const rel = relationship(elA, elB);
    return {
      cards: [a.card.name, b.card.name] as [string, string],
      detail: relationshipDetail[rel](a.card.name, b.card.name, elA, elB),
      relationship: rel,
    };
  });

  // Prioritize: enemies first, then allies, then neutrals.
  // Drop neutrals entirely for spreads with 5+ cards (they add noise).
  // Cap at 4 entries to keep the Connections box focused.
  const enemies = raw.filter((d) => d.relationship === "enemy");
  const allies = raw.filter((d) => d.relationship === "allied");
  const neutrals =
    spread.length < 5 ? raw.filter((d) => d.relationship === "neutral") : [];

  return [...enemies, ...allies, ...neutrals].slice(0, 4);
}
