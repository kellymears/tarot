import { useEffect, useMemo, useRef, useState } from "react";

import type { FullReading } from "../engine/types.js";

import { ANIMATION } from "../constants.js";

export interface AnimationVisibility {
  cards: CardState[];
  closing: TypewriterState;
  connections: TypewriterState;
  divider: boolean;
  done: boolean;
  header: boolean;
  opening: TypewriterState;
  sections: TypewriterState[];
  synthesis: TypewriterState;
}

export type CardState = "faceDown" | "faceUp" | "hidden";

interface InternalState {
  cardIndex: number;
  chars: number;
  phase: Phase;
  sectionIndex: number;
  skipped: boolean;
  ticks: number;
}

type Phase =
  | "closing"
  | "connections"
  | "deal"
  | "divider"
  | "done"
  | "header"
  | "opening"
  | "reveal"
  | "sections"
  | "synthesis";

interface TextLengths {
  closing: number;
  connections: number;
  hasConnections: boolean;
  opening: number;
  sections: number[];
  synthesis: number;
}

interface TypewriterState {
  chars: number;
  visible: boolean;
}

const HIDDEN: TypewriterState = { chars: 0, visible: false };
const FULL: TypewriterState = { chars: Infinity, visible: true };

const SPREAD_PHASES: Phase[] = [
  "header",
  "deal",
  "reveal",
  "divider",
  "opening",
  "sections",
  "connections",
  "synthesis",
  "closing",
  "done",
];

const CARD_PHASES: Phase[] = [
  "header",
  "deal",
  "reveal",
  "divider",
  "sections",
  "closing",
  "done",
];

const skippedState = (cardCount: 1 | 3 | 5 | 7 | 10): AnimationVisibility => ({
  cards: Array.from({ length: cardCount }, () => "faceUp" as CardState),
  closing: FULL,
  connections: cardCount >= 3 ? FULL : HIDDEN,
  divider: true,
  done: true,
  header: true,
  opening: cardCount >= 3 ? FULL : HIDDEN,
  sections: Array.from({ length: cardCount }, () => FULL),
  synthesis: cardCount >= 3 ? FULL : HIDDEN,
});

interface AnimationOptions {
  cardCount?: 1 | 3 | 5 | 7 | 10;
  skip?: boolean;
  startAfterCards?: boolean;
}

export function useAnimationController(
  reading: FullReading,
  options?: AnimationOptions,
): {
  skip: () => void;
  visibility: AnimationVisibility;
} {
  const startSkipped = options?.skip === true;
  const startAfterCards = options?.startAfterCards === true;
  const cardCount: 1 | 3 | 5 | 7 | 10 = options?.cardCount ?? 3;
  const phases = cardCount === 1 ? CARD_PHASES : SPREAD_PHASES;
  const skipped = skippedState(cardCount);
  const lengths = useMemo(
    () => textLengths(reading, cardCount),
    [reading, cardCount],
  );

  const initialPhase: Phase = startSkipped
    ? "done"
    : startAfterCards
      ? "divider"
      : "header";

  const stateRef = useRef<InternalState>({
    cardIndex: 0,
    chars: 0,
    phase: initialPhase,
    sectionIndex: 0,
    skipped: startSkipped,
    ticks: 0,
  });

  const [visibility, setVisibility] = useState<AnimationVisibility>(() =>
    startSkipped
      ? skipped
      : computeVisibility(stateRef.current, phases, cardCount),
  );

  useEffect(() => {
    if (startSkipped) return;

    const id = setInterval(() => {
      const next = tick(stateRef.current, lengths, phases, cardCount);
      stateRef.current = next;
      setVisibility(computeVisibility(next, phases, cardCount));
      if (next.phase === "done") clearInterval(id);
    }, ANIMATION.tickMs);

    return () => clearInterval(id);
  }, [reading, lengths, startSkipped, phases, cardCount]);

  const skip = () => {
    stateRef.current = { ...stateRef.current, skipped: true };
    setVisibility(skipped);
  };

  return { skip, visibility };
}

const computeVisibility = (
  state: InternalState,
  phases: Phase[],
  cardCount: 1 | 3 | 5 | 7 | 10,
): AnimationVisibility => {
  if (state.skipped) return skippedState(cardCount);

  const phaseIndex = phases.indexOf(state.phase);
  const past = (p: Phase) => {
    const idx = phases.indexOf(p);
    return idx !== -1 && idx < phaseIndex;
  };
  const active = (p: Phase) => state.phase === p;

  const typewriter = (p: Phase): TypewriterState => {
    if (phases.indexOf(p) === -1) return HIDDEN;
    if (past(p)) return FULL;
    if (active(p)) return { chars: state.chars, visible: true };
    return HIDDEN;
  };

  const cardState = (i: number): CardState => {
    if (i >= cardCount) return "hidden";
    if (past("reveal") || (active("reveal") && i <= state.cardIndex))
      return "faceUp";
    if (past("deal") || (active("deal") && i <= state.cardIndex))
      return "faceDown";
    if (active("reveal")) return "faceDown";
    return "hidden";
  };
  const cards = Array.from({ length: cardCount }, (_, i) => cardState(i));

  const sectionState = (i: number): TypewriterState => {
    if (i >= cardCount) return HIDDEN;
    if (past("sections") || (active("sections") && i < state.sectionIndex))
      return FULL;
    if (active("sections") && i === state.sectionIndex)
      return { chars: state.chars, visible: true };
    return HIDDEN;
  };
  const sections = Array.from({ length: cardCount }, (_, i) => sectionState(i));

  return {
    cards,
    closing: typewriter("closing"),
    connections: typewriter("connections"),
    divider: active("divider") || past("divider"),
    done: active("done"),
    header: active("header") || past("header"),
    opening: typewriter("opening"),
    sections,
    synthesis: typewriter("synthesis"),
  };
};

const textLengths = (
  reading: FullReading,
  cardCount: 1 | 3 | 5 | 7 | 10,
): TextLengths => {
  const r = reading.relational;
  const connectionsText = [
    ...r.dignities.map((d) => d.detail),
    r.suitDominance?.detail,
    r.numericalPattern?.detail,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    closing: reading.narrative.closing.length,
    connections: connectionsText.length,
    hasConnections:
      r.dignities.length > 0 ||
      r.suitDominance !== null ||
      r.numericalPattern !== null,
    opening: reading.narrative.opening.length,
    sections: reading.cards
      .slice(0, cardCount)
      .map((c) => c.passage.length + ANIMATION.sectionPauseChars),
    synthesis: reading.narrative.synthesis.length,
  };
};

const nextPhaseAfter = (current: Phase, phases: Phase[]): Phase => {
  const idx = phases.indexOf(current);
  return phases[idx + 1] ?? "done";
};

const tick = (
  state: InternalState,
  lengths: TextLengths,
  phases: Phase[],
  cardCount: 1 | 3 | 5 | 7 | 10,
): InternalState => {
  if (state.skipped || state.phase === "done") return state;

  const t = state.ticks + 1;
  const c = state.chars + ANIMATION.charsPerTick;

  switch (state.phase) {
    case "closing":
      return c >= lengths.closing
        ? { ...state, chars: c, phase: "done", ticks: 0 }
        : { ...state, chars: c, ticks: t };

    case "connections":
      return c >= lengths.connections
        ? { ...state, chars: 0, phase: "synthesis", ticks: 0 }
        : { ...state, chars: c, ticks: t };

    case "deal":
      if (t >= ANIMATION.dealCardTicks) {
        return state.cardIndex < cardCount - 1
          ? { ...state, cardIndex: state.cardIndex + 1, ticks: 0 }
          : { ...state, cardIndex: 0, phase: "reveal", ticks: 0 };
      }
      return { ...state, ticks: t };

    case "divider":
      return t >= ANIMATION.dividerTicks
        ? {
            ...state,
            chars: 0,
            phase: nextPhaseAfter("divider", phases),
            ticks: 0,
          }
        : { ...state, ticks: t };

    case "header":
      return t >= ANIMATION.headerTicks
        ? { ...state, cardIndex: 0, phase: "deal", ticks: 0 }
        : { ...state, ticks: t };

    case "opening":
      return c >= lengths.opening
        ? { ...state, chars: 0, phase: "sections", sectionIndex: 0, ticks: 0 }
        : { ...state, chars: c, ticks: t };

    case "reveal":
      if (t >= ANIMATION.revealCardTicks) {
        return state.cardIndex < cardCount - 1
          ? { ...state, cardIndex: state.cardIndex + 1, ticks: 0 }
          : { ...state, phase: "divider", ticks: 0 };
      }
      return { ...state, ticks: t };

    case "sections":
      if (c >= lengths.sections[state.sectionIndex]) {
        if (state.sectionIndex < cardCount - 1) {
          return {
            ...state,
            chars: 0,
            sectionIndex: state.sectionIndex + 1,
            ticks: 0,
          };
        }
        const next =
          cardCount >= 3 && lengths.hasConnections
            ? "connections"
            : nextPhaseAfter("sections", phases);
        return { ...state, chars: 0, phase: next, ticks: 0 };
      }
      return { ...state, chars: c, ticks: t };

    case "synthesis":
      return c >= lengths.synthesis
        ? { ...state, chars: 0, phase: "closing", ticks: 0 }
        : { ...state, chars: c, ticks: t };

    default:
      return state;
  }
};
