import type { Position, ReversalMode } from "./data/interpretations/types.js";
import type { FullReading, SpreadCard } from "./engine/types.js";

import {
  FIVE_CARD_POSITIONS,
  HORSESHOE_POSITIONS,
  POSITIONS,
} from "./constants.js";
import { cards } from "./data/cards.js";
import { interpret } from "./engine/index.js";
import { loadDaily, saveDaily } from "./store.js";

interface ResolveResult {
  cached: boolean;
  reading: FullReading;
  spread: SpreadCard[];
}

export function resolve(
  name: string,
  forceNew: boolean,
  reversalMode: ReversalMode = "opposite",
): ResolveResult {
  return resolveWith(name, forceNew, "", () => draw(3), reversalMode);
}

export function resolveCard(
  name: string,
  forceNew: boolean,
  reversalMode: ReversalMode = "opposite",
): ResolveResult {
  return resolveWith(
    name,
    forceNew,
    "card",
    () => draw(1, ["present"]),
    reversalMode,
  );
}

export function resolveFiveCard(
  name: string,
  forceNew: boolean,
  reversalMode: ReversalMode = "opposite",
): ResolveResult {
  return resolveWith(
    name,
    forceNew,
    "five-card",
    () => draw(5, FIVE_CARD_POSITIONS),
    reversalMode,
  );
}

export function resolveHorseshoe(
  name: string,
  forceNew: boolean,
  reversalMode: ReversalMode = "opposite",
): ResolveResult {
  return resolveWith(
    name,
    forceNew,
    "horseshoe",
    () => draw(7, HORSESHOE_POSITIONS),
    reversalMode,
  );
}

export function resolveYesNo(
  name: string,
  forceNew: boolean,
  reversalMode: ReversalMode = "opposite",
): ResolveResult {
  return resolveWith(
    name,
    forceNew,
    "yesno",
    () => draw(1, ["present"]),
    reversalMode,
  );
}

const resolveWith = (
  name: string,
  forceNew: boolean,
  suffix: string,
  drawCards: () => SpreadCard[],
  reversalMode: ReversalMode = "opposite",
): ResolveResult => {
  const cardsById = new Map(cards.map((c) => [c.id, c]));

  if (!forceNew) {
    const stored = loadDaily(name, suffix);
    if (stored) {
      const spread = stored
        .map((s) => {
          const card = cardsById.get(s.cardId);
          if (!card) return null;
          return { card, orientation: s.orientation, position: s.position };
        })
        .filter((s): s is SpreadCard => s !== null);

      if (spread.length === stored.length) {
        return {
          cached: true,
          reading: interpret(spread, reversalMode),
          spread,
        };
      }
    }
  }

  const spread = drawCards();
  saveDaily(
    name,
    spread.map((s) => ({
      cardId: s.card.id,
      orientation: s.orientation,
      position: s.position,
    })),
    suffix,
  );
  return { cached: false, reading: interpret(spread, reversalMode), spread };
};

const draw = (n: number, positions: Position[] = POSITIONS): SpreadCard[] =>
  shuffle(cards)
    .slice(0, n)
    .map<SpreadCard>((card, i) => ({
      card,
      orientation: Math.random() < 0.5 ? "reversed" : "upright",
      position: positions[i],
    }));

const shuffle = <T>(array: T[]): T[] => {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};
