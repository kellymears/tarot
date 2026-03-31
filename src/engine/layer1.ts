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
  above: (name, keywords) =>
    `Above you, ${name} reveals aspirations tied to ${keywords}. This is the best version of the situation — the conscious ideal you are reaching toward. Whether or not you achieve it depends on how honestly you engage with the cards below.`,
  below: (name, keywords) =>
    `Beneath the surface, ${name} points to a root cause grounded in ${keywords}. This is the foundation you may not be fully aware of — the subconscious driver shaping events from below. Understanding this influence is key to navigating what lies ahead.`,
  challenge: (name, keywords) =>
    `Crossing your path, ${name} presents an immediate challenge of ${keywords}. This energy directly opposes or complicates the central situation. It is not here to destroy — it is here to test whether your foundation is sound.`,
  environment: (name, keywords) =>
    `Around you, ${name} highlights external forces shaped by ${keywords}. These are the influences you cannot directly control — other people, circumstances, and the broader context pressing upon your situation.`,
  future: (name, keywords) =>
    `Looking ahead, ${name} indicates ${keywords} in what is to come.`,
  "hopes-fears": (name, keywords) =>
    `In the realm of hopes and fears, ${name} reveals a tension around ${keywords}. What you hope for and what you fear often share a root — this card illuminates that ambivalence.`,
  obstacle: (name, keywords) =>
    `Standing in your way, ${name} warns of a challenge rooted in ${keywords}. This is not necessarily an enemy — sometimes the obstacle is a lesson that must be absorbed before progress can resume.`,
  outcome: (name, keywords) =>
    `At the arc's end, ${name} points toward a resolution defined by ${keywords}. This is the most likely result if the current trajectory holds. It is a probability, not a certainty — the cards show the road, not the destination you must accept.`,
  past: (name, keywords) =>
    `In your past, ${name} suggests a period defined by ${keywords}.`,
  present: (name, keywords) =>
    `${name} at the center of your reading speaks to a present shaped by ${keywords}.`,
  self: (name, keywords) =>
    `Within you, ${name} reflects an inner landscape of ${keywords}. This is how you see yourself in this situation — not necessarily how others see you, but the internal lens through which you are interpreting events.`,
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
