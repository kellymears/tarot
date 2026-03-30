import type { FullReading, SpreadCard } from "./engine/types.js";

import { POSITIONS } from "./constants.js";
import { cards } from "./data/cards.js";
import { interpret } from "./engine/index.js";
import { loadDaily, saveDaily } from "./store.js";

export function resolve(
  name: string,
  forceNew: boolean,
): {
  cached: boolean;
  reading: FullReading;
  spread: SpreadCard[];
} {
  const cardsById = new Map(cards.map((c) => [c.id, c]));

  if (!forceNew) {
    const stored = loadDaily(name);
    if (stored) {
      const spread = stored
        .map((s) => {
          const card = cardsById.get(s.cardId);
          if (!card) return null;
          return { card, orientation: s.orientation, position: s.position };
        })
        .filter((s): s is SpreadCard => s !== null);

      if (spread.length === stored.length) {
        return { cached: true, reading: interpret(spread), spread };
      }
    }
  }

  const spread = draw(3);
  saveDaily(
    name,
    spread.map((s) => ({
      cardId: s.card.id,
      orientation: s.orientation,
      position: s.position,
    })),
  );
  return { cached: false, reading: interpret(spread), spread };
}

const draw = (n: number): SpreadCard[] =>
  shuffle(cards)
    .slice(0, n)
    .map<SpreadCard>((card, i) => ({
      card,
      orientation: Math.random() < 0.5 ? "reversed" : "upright",
      position: POSITIONS[i],
    }));

const shuffle = <T>(array: T[]): T[] => {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};
