import type { Suit } from "./data/cards.js";
import type { Position } from "./data/interpretations/types.js";
import type { Element } from "./engine/types.js";

// Timing for the deal/reveal/typewriter sequence.
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

// Fixed dimensions (rows × columns) for card components.
// `back` holds the two alternating rows of the face-down pattern.
export const CARD = {
  back: {
    rowA: "✧ · ✧ · ★ · ✧ · ✧",
    rowB: "· ✧ · ✧ · ✧ · ✧ ·",
  },
  height: 17,
  width: 28,
} as const;

// Decorative ornament used in headers and dividers.
export const ORNAMENT = "✧ · ✦ · ✧";

// Symbol displayed on major arcana card faces.
export const MAJOR_SYMBOL = "★";

// Suit-specific border/text colors for visual distinction.
export const SUIT_COLOR: Record<Suit, string> = {
  cups: "blue",
  pentacles: "green",
  swords: "cyan",
  wands: "yellow",
};

// Unicode glyphs representing each suit on card faces.
export const SUIT_SYMBOL: Record<Suit, string> = {
  cups: "☽",
  pentacles: "✦",
  swords: "△",
  wands: "✧",
};

// Allied elements strengthen each other; enemy elements create tension.
// Used by the dignity analysis to describe relationships between cards.
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

// Display names for the four classical elements.
export const ELEMENT_NAME: Record<Element, string> = {
  air: "Air",
  earth: "Earth",
  fire: "Fire",
  water: "Water",
};

// Maps each major arcana card (by ID) to its associated element.
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

// Numerological meaning for card numbers 0–10.
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

// Roman numeral labels for major arcana numbers (0–XXI).
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

// Human-readable labels for the three spread positions.
export const POSITION_LABELS: Record<Position, string> = {
  future: "Future",
  past: "Past",
  present: "Present",
};

// Evocative subtitles for each spread position.
export const POSITION_SUBTITLES: Record<Position, string> = {
  future: "what beckons",
  past: "what shaped you",
  present: "where you stand",
};

// Ordered spread positions — determines draw and display order.
export const POSITIONS: Position[] = ["past", "present", "future"];

// Maps each minor arcana suit to its classical element.
export const SUIT_ELEMENT: Record<Suit, Element> = {
  cups: "water",
  pentacles: "earth",
  swords: "air",
  wands: "fire",
};

// Thematic description for each suit, used in narrative passages.
export const SUIT_THEME: Record<Suit, string> = {
  cups: "emotion, intuition, and relationships",
  pentacles: "material concerns, work, and the physical world",
  swords: "intellect, conflict, and hard truths",
  wands: "passion, creativity, and willpower",
};
