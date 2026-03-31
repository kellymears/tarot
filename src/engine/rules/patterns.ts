import type { Suit } from "../../data/cards.js";
import type {
  ArcanaWeight,
  CourtCardPresence,
  ReversalPattern,
  SpreadCard,
  SuitDominance,
} from "../types.js";

import { SUIT_THEME } from "../../constants.js";

const plural = (n: number, word: string): string =>
  n === 1 ? `1 ${word}` : `${n} ${word}s`;

export function analyzeArcanaWeight(spread: SpreadCard[]): ArcanaWeight {
  const count = spread.filter((s) => s.card.arcana === "major").length;
  const total = spread.length;

  if (count === total) {
    return {
      count,
      detail:
        "Every card in this spread is Major Arcana — the forces at work are larger than the everyday. This reading speaks to fate, deep transformation, and turning points.",
    };
  }
  if (count > total / 2) {
    return {
      count,
      detail: `${count} of ${total} cards are Major Arcana, lending this reading unusual weight. The currents shaping your situation run deeper than surface events suggest.`,
    };
  }
  if (count > 0) {
    return {
      count,
      detail: `${plural(count, "Major Arcana card")} ${count === 1 ? "anchors" : "anchor"} this spread among everyday concerns, marking ${count === 1 ? "a single point" : "points"} where larger forces intersect with the practical.`,
    };
  }
  return {
    count,
    detail:
      "All cards are Minor Arcana — this reading concerns the practical, day-to-day fabric of your life. The answers you seek are found in the details, not in grand cosmic shifts.",
  };
}

export function analyzeReversalPattern(spread: SpreadCard[]): ReversalPattern {
  const count = spread.filter((s) => s.orientation === "reversed").length;
  const total = spread.length;

  if (count === total) {
    return {
      count,
      detail:
        "Every card appears reversed — significant blockages pervade this reading. What needs expression is being held back or redirected inward.",
    };
  }
  if (count > total / 2) {
    return {
      count,
      detail: `${count} of ${total} cards are reversed, suggesting a prevailing sense of resistance. The upright ${total - count === 1 ? "card marks" : "cards mark"} where energy flows most freely.`,
    };
  }
  if (count > 0) {
    return {
      count,
      detail: `${plural(count, "reversal")} ${count === 1 ? "introduces a point" : "introduce points"} of friction within an otherwise flowing spread.`,
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

  const threshold = Math.max(2, Math.ceil(spread.length / 3));

  for (const [suit, count] of counts) {
    if (count >= threshold) {
      const suitName = suit[0].toUpperCase() + suit.slice(1);
      return {
        count,
        detail:
          count === suits.length && suits.length > 1
            ? `Every minor card in this spread belongs to the suit of ${suitName}, saturating this reading with the energy of ${SUIT_THEME[suit]}.`
            : `The suit of ${suitName} dominates this spread, centering the reading around ${SUIT_THEME[suit]}.`,
        suit,
      };
    }
  }

  return null;
}

const RANK_NAME: Record<number, string> = {
  11: "Pages",
  12: "Knights",
  13: "Queens",
  14: "Kings",
};

const RANK_MEANING: Record<number, string> = {
  11: "youthful energy, messages, or new students of a discipline",
  12: "action, movement, and the pursuit of goals",
  13: "mature receptive authority, emotional intelligence, and mastery",
  14: "mature active authority, leadership, and outward mastery",
};

const RANK_SINGULAR: Record<number, string> = {
  11: "Pages",
  12: "Knights",
  13: "Queens",
  14: "Kings",
};

export function analyzeCourtCards(
  spread: SpreadCard[],
): CourtCardPresence | null {
  const courts = spread.filter(
    (s) => s.card.arcana === "minor" && s.card.number >= 11,
  );

  if (courts.length < 2) return null;

  const rankCounts = new Map<number, number>();
  for (const c of courts) {
    rankCounts.set(c.card.number, (rankCounts.get(c.card.number) ?? 0) + 1);
  }

  // 3+ court cards — thick with personality
  if (courts.length >= 3) {
    // Check for dominant rank within the 3+
    const dominantRank = [...rankCounts.entries()].find(
      ([, count]) => count >= 2,
    );

    if (dominantRank) {
      const [rank, count] = dominantRank;
      return {
        count: courts.length,
        detail: `The court is full. ${count === 2 ? "Two" : "Three"} ${RANK_NAME[rank]} appear among ${courts.length} court cards \u2014 ${RANK_MEANING[rank]}. This reading is thick with personality and interpersonal energy. The cards speak less to abstract forces and more to specific people and their influence on your path.`,
      };
    }

    return {
      count: courts.length,
      detail:
        "The court is full. This reading is thick with personality and interpersonal energy. The cards speak less to abstract forces and more to specific people and their influence on your path.",
    };
  }

  // Exactly 2 court cards
  const duplicateRank = [...rankCounts.entries()].find(
    ([, count]) => count >= 2,
  );

  if (duplicateRank) {
    const [rank] = duplicateRank;
    const name = RANK_SINGULAR[rank];
    return {
      count: courts.length,
      detail: `Two ${name} appear in this reading \u2014 ${RANK_MEANING[rank]}. Pay attention to the energies of ${name.toLowerCase()} asserting themselves from multiple directions in your situation.`,
    };
  }

  return {
    count: courts.length,
    detail:
      "Several court cards populate this spread, suggesting a situation shaped by multiple personalities or social dynamics. This is not a solitary journey \u2014 other people\u2019s choices matter here.",
  };
}
