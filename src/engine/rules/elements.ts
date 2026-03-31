import type { Element, ElementalBalance, SpreadCard } from "../types.js";

import { ELEMENT_NAME, MAJOR_ELEMENT, SUIT_ELEMENT } from "../../constants.js";

const ALL_ELEMENTS: Element[] = ["air", "earth", "fire", "water"];

const DOMINANT_MEANING: Record<Element, string> = {
  air: "thought, analysis, and mental activity fill this spread",
  earth:
    "practical concerns, material matters, and embodied experience anchor this reading",
  fire: "action, ambition, and creative force drive this reading",
  water: "emotion, intuition, and the undercurrents of feeling pervade",
};

const MISSING_MEANING: Record<Element, string> = {
  air: "intellectual clarity and detachment",
  earth: "practical grounding and material stability",
  fire: "the spark of initiative and passion",
  water: "emotional depth and intuitive knowing",
};

const elementFor = (card: SpreadCard): Element | null => {
  if (card.card.suit) return SUIT_ELEMENT[card.card.suit];
  return MAJOR_ELEMENT[card.card.id] ?? null;
};

export function analyzeElementalBalance(
  spread: SpreadCard[],
): ElementalBalance | null {
  if (spread.length < 3) return null;

  const counts: Record<Element, number> = {
    air: 0,
    earth: 0,
    fire: 0,
    water: 0,
  };

  for (const s of spread) {
    const el = elementFor(s);
    if (el) counts[el]++;
  }

  const present = ALL_ELEMENTS.filter((e) => counts[e] > 0);
  const missing = ALL_ELEMENTS.filter((e) => counts[e] === 0);

  const threshold = Math.max(2, Math.ceil(spread.length / 3));
  const dominant = ALL_ELEMENTS.filter((e) => counts[e] >= threshold);

  // All four elements present and none dominate — balanced, nothing to report
  if (missing.length === 0 && dominant.length === 0) return null;

  const detail = buildDetail(present, missing, dominant);
  if (!detail) return null;

  return { detail, dominant, missing };
}

function buildDetail(
  present: Element[],
  missing: Element[],
  dominant: Element[],
): null | string {
  // All same element (only one element present)
  if (present.length === 1) {
    const el = present[0];
    return `This spread is saturated with ${ELEMENT_NAME[el]} \u2014 ${DOMINANT_MEANING[el]}. The absence of opposing elements suggests a singular, intense focus.`;
  }

  // One element missing
  if (missing.length === 1) {
    const el = missing[0];
    return `Notably absent from this reading is ${ELEMENT_NAME[el]} \u2014 ${MISSING_MEANING[el]}. Consider whether this blind spot needs attention.`;
  }

  // Two elements dominate
  if (dominant.length === 2) {
    const [a, b] = dominant;
    return `${ELEMENT_NAME[a]} and ${ELEMENT_NAME[b]} dominate this spread \u2014 ${DOMINANT_MEANING[a]} while ${DOMINANT_MEANING[b]}. The quieter elements may hold what you\u2019re overlooking.`;
  }

  // Single dominant element (with multiple missing)
  if (dominant.length === 1 && missing.length >= 2) {
    const el = dominant[0];
    return `${ELEMENT_NAME[el]} dominates this spread \u2014 ${DOMINANT_MEANING[el]}. With ${missing.map((m) => ELEMENT_NAME[m]).join(" and ")} absent, the reading carries a narrow but powerful focus.`;
  }

  // Multiple missing elements (no single dominant)
  if (missing.length >= 2) {
    return `${missing.map((m) => ELEMENT_NAME[m]).join(" and ")} are absent from this reading, leaving gaps in ${missing.map((m) => MISSING_MEANING[m]).join(" and ")}. Notice what the remaining elements emphasize by what they leave out.`;
  }

  return null;
}
