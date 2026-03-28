import type { Suit } from "../../data/cards.js";
import type {
  ArcanaWeight,
  ReversalPattern,
  SpreadCard,
  SuitDominance,
} from "../types.js";

import { SUIT_THEME } from "../../constants.js";

export function analyzeArcanaWeight(spread: SpreadCard[]): ArcanaWeight {
  const count = spread.filter((s) => s.card.arcana === "major").length;

  if (count === 3) {
    return {
      count,
      detail:
        "All three cards are Major Arcana — the forces at work in your life right now are larger than the everyday. This reading speaks to fate, deep transformation, and turning points.",
    };
  }
  if (count === 2) {
    return {
      count,
      detail:
        "Two Major Arcana cards carry this reading, lending it weight and significance. The currents shaping your situation run deeper than surface events suggest.",
    };
  }
  if (count === 1) {
    return {
      count,
      detail:
        "One Major Arcana card anchors this spread among everyday concerns, marking a single point where larger forces intersect with the practical.",
    };
  }
  return {
    count,
    detail:
      "All three cards are Minor Arcana — this reading concerns the practical, day-to-day fabric of your life. The answers you seek are found in the details, not in grand cosmic shifts.",
  };
}

export function analyzeReversalPattern(spread: SpreadCard[]): ReversalPattern {
  const count = spread.filter((s) => s.orientation === "reversed").length;

  if (count === 3) {
    return {
      count,
      detail:
        "All three cards appear reversed — significant blockages or internalized energy pervade this reading. What needs expression is being held back or redirected inward.",
    };
  }
  if (count === 2) {
    return {
      count,
      detail:
        "Two reversed cards suggest a prevailing sense of resistance or redirection. The upright card marks where energy flows most freely.",
    };
  }
  if (count === 1) {
    return {
      count,
      detail:
        "A single reversal introduces a point of friction or inward focus within an otherwise flowing spread.",
    };
  }
  return {
    count,
    detail:
      "All cards appear upright — the energy in this spread flows freely and outwardly. There are no significant blockages to navigate.",
  };
}

export function analyzeSuitDominance(
  spread: SpreadCard[],
): null | SuitDominance {
  const suits = spread
    .map((s) => s.card.suit)
    .filter((s): s is Suit => s !== null);

  const counts = new Map<Suit, number>();
  for (const suit of suits) {
    counts.set(suit, (counts.get(suit) ?? 0) + 1);
  }

  for (const [suit, count] of counts) {
    if (count >= 2) {
      return {
        count,
        detail:
          count === 3
            ? `All three cards belong to the suit of ${suit[0].toUpperCase() + suit.slice(1)}, saturating this reading with the energy of ${SUIT_THEME[suit]}.`
            : `The suit of ${suit[0].toUpperCase() + suit.slice(1)} dominates this spread, centering the reading around ${SUIT_THEME[suit]}.`,
        suit,
      };
    }
  }

  return null;
}
