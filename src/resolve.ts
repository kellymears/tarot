import type { Orientation, Position } from "./data/interpretations/types.js";
import type { FullReading, SpreadCard } from "./engine/types.js";

import { cards } from "./data/cards.js";
import { interpret } from "./engine/index.js";
import { loadDaily, saveDaily } from "./store.js";

export const POSITIONS: Position[] = ["past", "present", "future"];

export function resolve(
  name: string,
  forceNew: boolean,
): {
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
        return { reading: interpret(spread), spread };
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
  return { reading: interpret(spread), spread };
}

function draw(n: number): SpreadCard[] {
  return shuffle(cards)
    .slice(0, n)
    .map<SpreadCard>((card, i) => ({
      card,
      orientation:
        Math.random() < 0.5
          ? ("reversed" as Orientation)
          : ("upright" as Orientation),
      position: POSITIONS[i],
    }));
}

function shuffle<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
