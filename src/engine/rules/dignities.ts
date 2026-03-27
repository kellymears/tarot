import type { Suit } from "../../data/cards.js";
import type { Element, ElementalDignity, SpreadCard } from "../types.js";

const suitElement: Record<Suit, Element> = {
  cups: "water",
  pentacles: "earth",
  swords: "air",
  wands: "fire",
};

const majorElement: Record<string, Element> = {
  "major-00": "air",
  "major-01": "air",
  "major-02": "water",
  "major-03": "earth",
  "major-04": "fire",
  "major-05": "earth",
  "major-06": "air",
  "major-07": "water",
  "major-08": "fire",
  "major-09": "earth",
  "major-10": "fire",
  "major-11": "air",
  "major-12": "water",
  "major-13": "water",
  "major-14": "fire",
  "major-15": "earth",
  "major-16": "fire",
  "major-17": "air",
  "major-18": "water",
  "major-19": "fire",
  "major-20": "fire",
  "major-21": "earth",
};

const allied: [Element, Element][] = [
  ["fire", "air"],
  ["water", "earth"],
];

const enemy: [Element, Element][] = [
  ["fire", "water"],
  ["air", "earth"],
];

function elementFor(card: SpreadCard): Element | null {
  if (card.card.suit) return suitElement[card.card.suit];
  return majorElement[card.card.id] ?? null;
}

function relationship(a: Element, b: Element): "allied" | "enemy" | "neutral" {
  if (a === b) return "allied";
  for (const [x, y] of allied) {
    if ((a === x && b === y) || (a === y && b === x)) return "allied";
  }
  for (const [x, y] of enemy) {
    if ((a === x && b === y) || (a === y && b === x)) return "enemy";
  }
  return "neutral";
}

const elementName: Record<Element, string> = {
  air: "Air",
  earth: "Earth",
  fire: "Fire",
  water: "Water",
};

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
  const dignities: ElementalDignity[] = [];

  for (let i = 0; i < spread.length - 1; i++) {
    const a = spread[i];
    const b = spread[i + 1];
    const elA = elementFor(a);
    const elB = elementFor(b);

    if (!elA || !elB) continue;

    const rel = relationship(elA, elB);
    dignities.push({
      cards: [a.card.name, b.card.name],
      detail: relationshipDetail[rel](
        a.card.name,
        b.card.name,
        elementName[elA],
        elementName[elB],
      ),
      relationship: rel,
    });
  }

  return dignities;
}
