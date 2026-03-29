import { useEffect, useMemo, useRef, useState } from "react";

import type { FullReading } from "../engine/types.js";

import { ANIMATION } from "../constants.js";

export interface AnimationVisibility {
  cards: [CardState, CardState, CardState];
  closing: TypewriterState;
  connections: TypewriterState;
  divider: boolean;
  done: boolean;
  header: boolean;
  opening: TypewriterState;
  sections: [TypewriterState, TypewriterState, TypewriterState];
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
  sections: [number, number, number];
  synthesis: number;
}

interface TypewriterState {
  chars: number;
  visible: boolean;
}

const HIDDEN: TypewriterState = { chars: 0, visible: false };
const FULL: TypewriterState = { chars: Infinity, visible: true };

const PHASE_ORDER: Phase[] = [
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

const SKIPPED: AnimationVisibility = {
  cards: ["faceUp", "faceUp", "faceUp"],
  closing: FULL,
  connections: FULL,
  divider: true,
  done: true,
  header: true,
  opening: FULL,
  sections: [FULL, FULL, FULL],
  synthesis: FULL,
};

export function useAnimationController(reading: FullReading): {
  skip: () => void;
  visibility: AnimationVisibility;
} {
  const lengths = useMemo(() => textLengths(reading), [reading]);

  const stateRef = useRef<InternalState>({
    cardIndex: 0,
    chars: 0,
    phase: "header",
    sectionIndex: 0,
    skipped: false,
    ticks: 0,
  });

  const [visibility, setVisibility] = useState<AnimationVisibility>(() =>
    computeVisibility(stateRef.current),
  );

  useEffect(() => {
    const id = setInterval(() => {
      const next = tick(stateRef.current, lengths);
      stateRef.current = next;
      setVisibility(computeVisibility(next));
      if (next.phase === "done") clearInterval(id);
    }, ANIMATION.tickMs);

    return () => clearInterval(id);
  }, [reading, lengths]);

  const skip = () => {
    stateRef.current = { ...stateRef.current, skipped: true };
    setVisibility(SKIPPED);
  };

  return { skip, visibility };
}

const computeVisibility = (state: InternalState): AnimationVisibility => {
  if (state.skipped) return SKIPPED;

  const phaseIndex = PHASE_ORDER.indexOf(state.phase);
  const past = (p: Phase) => PHASE_ORDER.indexOf(p) < phaseIndex;
  const active = (p: Phase) => state.phase === p;

  const typewriter = (p: Phase): TypewriterState =>
    past(p) ? FULL : active(p) ? { chars: state.chars, visible: true } : HIDDEN;

  const cards: [CardState, CardState, CardState] = [
    "hidden",
    "hidden",
    "hidden",
  ];

  if (past("deal")) {
    cards[0] = cards[1] = cards[2] = "faceDown";
  } else if (active("deal")) {
    for (let i = 0; i <= state.cardIndex; i++) cards[i] = "faceDown";
  }

  if (past("reveal")) {
    cards[0] = cards[1] = cards[2] = "faceUp";
  } else if (active("reveal")) {
    for (let i = 0; i < 3; i++) {
      if (i <= state.cardIndex) cards[i] = "faceUp";
      else cards[i] = "faceDown";
    }
  }

  const sections: [TypewriterState, TypewriterState, TypewriterState] = [
    HIDDEN,
    HIDDEN,
    HIDDEN,
  ];
  if (past("sections")) {
    sections[0] = sections[1] = sections[2] = FULL;
  } else if (active("sections")) {
    for (let i = 0; i < state.sectionIndex; i++) sections[i] = FULL;
    sections[state.sectionIndex] = { chars: state.chars, visible: true };
  }

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

const textLengths = (reading: FullReading): TextLengths => {
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
    sections: reading.cards.map((c) => c.passage.length + 20) as [
      number,
      number,
      number,
    ],
    synthesis: reading.narrative.synthesis.length,
  };
};

const tick = (state: InternalState, lengths: TextLengths): InternalState => {
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
        return state.cardIndex < 2
          ? { ...state, cardIndex: state.cardIndex + 1, ticks: 0 }
          : { ...state, cardIndex: 0, phase: "reveal", ticks: 0 };
      }
      return { ...state, ticks: t };

    case "divider":
      return t >= ANIMATION.dividerTicks
        ? { ...state, chars: 0, phase: "opening", ticks: 0 }
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
        return state.cardIndex < 2
          ? { ...state, cardIndex: state.cardIndex + 1, ticks: 0 }
          : { ...state, phase: "divider", ticks: 0 };
      }
      return { ...state, ticks: t };

    case "sections":
      if (c >= lengths.sections[state.sectionIndex]) {
        if (state.sectionIndex < 2) {
          return {
            ...state,
            chars: 0,
            sectionIndex: state.sectionIndex + 1,
            ticks: 0,
          };
        }
        const nextPhase = lengths.hasConnections ? "connections" : "synthesis";
        return { ...state, chars: 0, phase: nextPhase, ticks: 0 };
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
