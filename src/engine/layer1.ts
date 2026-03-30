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
  environment: (name: string, keywords: string) =>
    `Around you, ${name} highlights external forces shaped by ${keywords}.`,
  future: (name: string, keywords: string) =>
    `Looking ahead, ${name} indicates ${keywords} in what is to come.`,
  obstacle: (name: string, keywords: string) =>
    `Standing in your way, ${name} warns of a challenge rooted in ${keywords}.`,
  outcome: (name: string, keywords: string) =>
    `At the arc's end, ${name} points toward a resolution defined by ${keywords}.`,
  past: (name: string, keywords: string) =>
    `In your past, ${name} suggests a period defined by ${keywords}.`,
  present: (name: string, keywords: string) =>
    `${name} at the center of your reading speaks to a present shaped by ${keywords}.`,
  self: (name: string, keywords: string) =>
    `Within you, ${name} reflects an inner landscape of ${keywords}.`,
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
