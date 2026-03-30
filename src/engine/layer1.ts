import type {
  InterpretationMap,
  Position,
} from "../data/interpretations/types.js";
import type { CardReading, SpreadCard } from "./types.js";

import { lookupPassage } from "../data/interpretations/index.js";

const positionFraming: Record<
  Position,
  (name: string, keywords: string) => string
> = {
  above: (name: string, keywords: string) =>
    `Above you, ${name} reveals aspirations tied to ${keywords}.`,
  below: (name: string, keywords: string) =>
    `Beneath the surface, ${name} points to a root cause grounded in ${keywords}.`,
  future: (name: string, keywords: string) =>
    `Looking ahead, ${name} indicates ${keywords} in what is to come.`,
  past: (name: string, keywords: string) =>
    `In your past, ${name} suggests a period defined by ${keywords}.`,
  present: (name: string, keywords: string) =>
    `${name} at the center of your reading speaks to a present shaped by ${keywords}.`,
};

export function resolvePassages(
  spread: SpreadCard[],
  interpretations: InterpretationMap,
): CardReading[] {
  return spread.map((sc) => {
    const authored = lookupPassage(
      interpretations,
      sc.card.id,
      sc.position,
      sc.orientation,
    );

    return {
      fallback: !authored,
      passage: authored ?? fallbackPassage(sc),
      position: sc.position,
    };
  });
}

const fallbackPassage = (card: SpreadCard): string => {
  const keywords =
    card.orientation === "reversed" ? card.card.reversed : card.card.upright;
  const name =
    card.orientation === "reversed"
      ? `${card.card.name} reversed`
      : card.card.name;
  return positionFraming[card.position](name, keywords);
};
