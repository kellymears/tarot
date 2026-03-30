import type { Orientation, Position } from "./data/interpretations/types.js";
import type { FullReading, SpreadCard } from "./engine/types.js";

import { POSITIONS } from "./constants.js";
import { cards } from "./data/cards.js";
import { interpret } from "./engine/index.js";
import { loadDaily, loadDailyCard, saveDaily, saveDailyCard } from "./store.js";

interface ResolveResult {
  cached: boolean;
  reading: FullReading;
  spread: SpreadCard[];
}

interface StoredCard {
  cardId: string;
  orientation: Orientation;
  position: Position;
}

export function resolve(name: string, forceNew: boolean): ResolveResult {
  return resolveWith(name, forceNew, loadDaily, saveDaily, () => draw(3));
}

export function resolveCard(name: string, forceNew: boolean): ResolveResult {
  return resolveWith(name, forceNew, loadDailyCard, saveDailyCard, () =>
    draw(1, ["present"]),
  );
}

const resolveWith = (
  name: string,
  forceNew: boolean,
  load: (name: string) => null | StoredCard[],
  save: (name: string, spread: StoredCard[]) => void,
  drawCards: () => SpreadCard[],
): ResolveResult => {
  const cardsById = new Map(cards.map((c) => [c.id, c]));

  if (!forceNew) {
    const stored = load(name);
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

  const spread = drawCards();
  save(
    name,
    spread.map((s) => ({
      cardId: s.card.id,
      orientation: s.orientation,
      position: s.position,
    })),
  );
  return { cached: false, reading: interpret(spread), spread };
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
