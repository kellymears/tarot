import type { Suit } from "./data/cards.js";
import type { Position } from "./data/interpretations/types.js";
import type { Element } from "./engine/types.js";

// Tick-based phases (header, deal, reveal, divider) count frames at
// `tickMs` intervals. Text phases advance `charsPerTick` per frame.
export const ANIMATION = {
  charsPerTick: 25,
  dealCardTicks: 24,
  dividerTicks: 12,
  headerTicks: 30,
  revealCardTicks: 21,
  sectionPauseChars: 450, // ~600ms breathing room between sections
  tickMs: 33,
} as const;

// Clamped to terminal width at render time so narrow terminals don't overflow.
export const MAX_TEXT_WIDTH = 76;

export const CARD = {
  back: {
    rowA: "✧ · ✧ · ★ · ✧ · ✧",
    rowB: "· ✧ · ✧ · ✧ · ✧ ·",
  },
  height: 17,
  width: 28,
} as const;

export const ORNAMENT = "✧ · ✦ · ✧";

export const MAJOR_SYMBOL = "★";

export const SUIT_SYMBOL: Record<Suit, string> = {
  cups: "☽",
  pentacles: "✦",
  swords: "△",
  wands: "✧",
};

// Allied elements strengthen each other; enemy elements create tension.
export const DIGNITIES = {
  allied: [
    ["fire", "air"],
    ["water", "earth"],
  ] as [Element, Element][],
  enemy: [
    ["fire", "water"],
    ["air", "earth"],
  ] as [Element, Element][],
};

export const ELEMENT_NAME: Record<Element, string> = {
  air: "Air",
  earth: "Earth",
  fire: "Fire",
  water: "Water",
};

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

// Falls back to a generic label for court cards (11+).
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
  above: "Above",
  below: "Below",
  challenge: "Challenge",
  environment: "Environment",
  future: "Future",
  "hopes-fears": "Hopes & Fears",
  obstacle: "Obstacle",
  outcome: "Outcome",
  past: "Past",
  present: "Present",
  self: "Self",
};

export const POSITION_SUBTITLES: Record<Position, string> = {
  above: "what you aspire to",
  below: "the root cause",
  challenge: "what crosses you",
  environment: "external influences",
  future: "what beckons",
  "hopes-fears": "hopes and fears",
  obstacle: "the challenge",
  outcome: "where this leads",
  past: "what shaped you",
  present: "where you stand",
  self: "your inner state",
};

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
