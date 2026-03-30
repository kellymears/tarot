import type {
  InterpretationMap,
  Position,
  ReversalMode,
} from "../data/interpretations/types.js";
import type { CardReading, SpreadCard } from "./types.js";

import { lookupPassage } from "../data/interpretations/index.js";

const reversalFraming: Record<
  "blocked" | "shadow" | "weakened",
  { prefix: string; suffix: string }
> = {
  blocked: {
    prefix: "This energy is present but finds itself obstructed. ",
    suffix: " Yet something prevents its full expression right now.",
  },
  shadow: {
    prefix: "This influence operates beneath conscious awareness. ",
    suffix: " It works from the inner landscape, not the visible one.",
  },
  weakened: {
    prefix: "A quieter version of this energy is at play. ",
    suffix: " The essence remains, but its force is diminished.",
  },
};

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
  reversalMode: ReversalMode = "opposite",
): CardReading[] {
  return spread.map((sc) => {
    const isReversed = sc.orientation === "reversed";
    const useUpright =
      isReversed && reversalMode !== "opposite" && reversalMode !== "none";
    const effectiveOrientation =
      reversalMode === "none"
        ? "upright"
        : useUpright
          ? "upright"
          : sc.orientation;

    const authored = lookupPassage(
      interpretations,
      sc.card.id,
      sc.position,
      effectiveOrientation,
    );

    let passage = authored ?? fallbackPassage(sc, effectiveOrientation);

    if (isReversed && useUpright) {
      const framing =
        reversalFraming[reversalMode as "blocked" | "shadow" | "weakened"];
      passage = framing.prefix + passage + framing.suffix;
    }

    return {
      fallback: !authored,
      passage,
      position: sc.position,
    };
  });
}

const fallbackPassage = (
  card: SpreadCard,
  effectiveOrientation: "reversed" | "upright",
): string => {
  const keywords =
    effectiveOrientation === "reversed"
      ? card.card.reversed
      : card.card.upright;
  const name =
    effectiveOrientation === "reversed"
      ? `${card.card.name} reversed`
      : card.card.name;
  return positionFraming[card.position](name, keywords);
};
