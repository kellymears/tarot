import type {
  InterpretationMap,
  Position,
  ReversalMode,
} from "../data/interpretations/types.js";
import type { CardReading, SpreadCard } from "./types.js";

import { lookupPassage } from "../data/interpretations/index.js";

const reversalPositionPrefix: Record<
  "blocked" | "shadow" | "weakened",
  Record<Position, string>
> = {
  blocked: {
    above:
      "Your aspiration carries this energy, but something blocks its expression. ",
    below: "At the root, this energy stirs but cannot surface freely. ",
    challenge:
      "The crossing force is present but muted — its pressure is real but indirect. ",
    environment:
      "In your surroundings, this energy circulates but cannot land. ",
    future: "Ahead of you, this energy approaches but may arrive delayed. ",
    "hopes-fears":
      "This hope or fear is real but cannot fully take shape yet. ",
    obstacle:
      "The challenge itself is partially blocked — even the obstacle is struggling. ",
    outcome:
      "The resolution carries this energy, but it may manifest incompletely. ",
    past: "In your past, this energy was present but never fully released. ",
    present: "Right now, this energy is present but finds itself obstructed. ",
    self: "Within you, this energy exists but you are holding it back. ",
  },
  shadow: {
    above: "Your conscious aspiration masks a deeper version of this energy. ",
    below: "At the root, this is the unconscious truth driving events. ",
    challenge:
      "The crossing force works subtly — its influence is felt more than seen. ",
    environment:
      "Around you, this influence moves unseen through others' actions. ",
    future:
      "What approaches carries this influence in its undertow, invisible but shaping. ",
    "hopes-fears":
      "This hope or fear operates below the surface of your awareness. ",
    obstacle:
      "The challenge operates in shadow — you may not recognize it as an obstacle. ",
    outcome:
      "The resolution will arrive carrying undertones you may not immediately see. ",
    past: "In your past, this influence worked beneath your awareness. ",
    present: "Right now, this influence operates beneath conscious awareness. ",
    self: "Within you, this energy works from the inner landscape. ",
  },
  weakened: {
    above: "Your aspiration holds this energy in diluted form. ",
    below: "At the root, this energy stirs faintly. ",
    challenge:
      "The crossing force is weakened — present but not overwhelming. ",
    environment: "Around you, this influence is present but muted. ",
    future:
      "What approaches carries this energy, but with less force than expected. ",
    "hopes-fears":
      "This hope or fear is real but carries less weight than you might assume. ",
    obstacle:
      "The challenge is real but not at full strength — there is room to move. ",
    outcome:
      "The resolution carries this energy, but its force is diminished. ",
    past: "In your past, a quieter version of this energy was at play. ",
    present: "Right now, a diminished echo of this energy is present. ",
    self: "Within you, this energy exists but at reduced intensity. ",
  },
};

const reversalSuffix: Record<"blocked" | "shadow" | "weakened", string> = {
  blocked: " Yet something prevents its full expression right now.",
  shadow: " It works from the inner landscape, not the visible one.",
  weakened: " The essence remains, but its force is diminished.",
};

const reversalFraming = (
  mode: "blocked" | "shadow" | "weakened",
  position: Position,
): { prefix: string; suffix: string } => ({
  prefix:
    reversalPositionPrefix[mode][position] ??
    reversalPositionPrefix[mode].present,
  suffix: reversalSuffix[mode],
});

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
      const framing = reversalFraming(
        reversalMode as "blocked" | "shadow" | "weakened",
        sc.position,
      );
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
