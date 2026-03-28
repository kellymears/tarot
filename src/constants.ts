import type { Suit } from "./data/cards.js";
import type { Position } from "./data/interpretations/types.js";
import type { Element } from "./engine/types.js";

export const ALLIED: [Element, Element][] = [
  ["fire", "air"],
  ["water", "earth"],
];

export const CARD_HEIGHT = 17;

export const CARD_WIDTH = 28;

export const CHARS_PER_TICK = 25;

export const DEAL_CARD_TICKS = 24;

export const DIVIDER_TICKS = 12;

export const ELEMENT_NAME: Record<Element, string> = {
  air: "Air",
  earth: "Earth",
  fire: "Fire",
  water: "Water",
};

export const ENEMY: [Element, Element][] = [
  ["fire", "water"],
  ["air", "earth"],
];

export const HEADER_TICKS = 30;

export const MAJOR_ELEMENT: Record<string, Element> = {
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

export const NUMBER_MEANING: Record<number, string> = {
  0: "infinite potential and the void",
  1: "new beginnings and initiative",
  2: "duality and partnership",
  3: "creativity and expression",
  4: "stability and foundation",
  5: "change and upheaval",
  6: "harmony and responsibility",
  7: "reflection and inner wisdom",
  8: "power and mastery",
  9: "completion and culmination",
  10: "endings that become beginnings",
};

export const NUMERALS = [
  "0",
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
  "XIII",
  "XIV",
  "XV",
  "XVI",
  "XVII",
  "XVIII",
  "XIX",
  "XX",
  "XXI",
];

export const POSITION_LABELS: Record<Position, string> = {
  future: "Future",
  past: "Past",
  present: "Present",
};

export const POSITIONS: Position[] = ["past", "present", "future"];

export const REVEAL_CARD_TICKS = 21;

export const ROW_A = "◇ · ◇ · ◇ · ◇ · ◇";

export const ROW_B = "· ◇ · ◇ · ◇ · ◇ ·";

export const SUIT_ELEMENT: Record<Suit, Element> = {
  cups: "water",
  pentacles: "earth",
  swords: "air",
  wands: "fire",
};

export const SUIT_THEME: Record<Suit, string> = {
  cups: "emotion, intuition, and relationships",
  pentacles: "material concerns, work, and the physical world",
  swords: "intellect, conflict, and hard truths",
  wands: "passion, creativity, and willpower",
};

export const TICK_MS = 33;
