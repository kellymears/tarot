import { useEffect, useRef, useState } from "react";

import type { FullReading } from "../engine/types.js";

import {
  CHARS_PER_TICK,
  DEAL_CARD_TICKS,
  DIVIDER_TICKS,
  HEADER_TICKS,
  REVEAL_CARD_TICKS,
  TICK_MS,
} from "../constants.js";

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

interface TypewriterState {
  chars: number;
  visible: boolean;
}

const HIDDEN: TypewriterState = { chars: 0, visible: false };
const FULL: TypewriterState = { chars: Infinity, visible: true };

export function useAnimationController(reading: FullReading): {
  skip: () => void;
  visibility: AnimationVisibility;
} {
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
      stateRef.current = tick(stateRef.current, reading);
      setVisibility(computeVisibility(stateRef.current));
    }, TICK_MS);

    return () => clearInterval(id);
  }, [reading]);

  const skip = () => {
    stateRef.current = { ...stateRef.current, skipped: true };
    setVisibility(skippedVisibility());
  };

  return { skip, visibility };
}

function computeVisibility(state: InternalState): AnimationVisibility {
  if (state.skipped) return skippedVisibility();

  const cards: [CardState, CardState, CardState] = [
    "hidden",
    "hidden",
    "hidden",
  ];
  const sections: [TypewriterState, TypewriterState, TypewriterState] = [
    HIDDEN,
    HIDDEN,
    HIDDEN,
  ];
  let header = false;
  let divider = false;
  let opening: TypewriterState = HIDDEN;
  let connections: TypewriterState = HIDDEN;
  let synthesis: TypewriterState = HIDDEN;
  let closing: TypewriterState = HIDDEN;
  let done = false;

  const phaseOrder: Phase[] = [
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
  const phaseIndex = phaseOrder.indexOf(state.phase);
  const past = (p: Phase) => phaseOrder.indexOf(p) < phaseIndex;
  const active = (p: Phase) => state.phase === p;

  // Header
  if (active("header") || past("header")) header = true;

  // Cards - deal phase
  if (past("deal")) {
    cards[0] = cards[1] = cards[2] = "faceDown";
  } else if (active("deal")) {
    for (let i = 0; i <= state.cardIndex; i++) cards[i] = "faceDown";
  }

  // Cards - reveal phase
  if (past("reveal")) {
    cards[0] = cards[1] = cards[2] = "faceUp";
  } else if (active("reveal")) {
    for (let i = 0; i < 3; i++) {
      if (i <= state.cardIndex) cards[i] = "faceUp";
      else cards[i] = "faceDown";
    }
  }

  // Divider
  if (active("divider") || past("divider")) divider = true;

  // Opening
  if (past("opening")) {
    opening = FULL;
  } else if (active("opening")) {
    opening = { chars: state.chars, visible: true };
  }

  // Sections
  if (past("sections")) {
    sections[0] = sections[1] = sections[2] = FULL;
  } else if (active("sections")) {
    for (let i = 0; i < state.sectionIndex; i++) sections[i] = FULL;
    sections[state.sectionIndex] = { chars: state.chars, visible: true };
  }

  // Connections
  if (past("connections")) {
    connections = FULL;
  } else if (active("connections")) {
    connections = { chars: state.chars, visible: true };
  }

  // Synthesis
  if (past("synthesis")) {
    synthesis = FULL;
  } else if (active("synthesis")) {
    synthesis = { chars: state.chars, visible: true };
  }

  // Closing
  if (past("closing")) {
    closing = FULL;
  } else if (active("closing")) {
    closing = { chars: state.chars, visible: true };
  }

  // Done
  if (active("done")) done = true;

  return {
    cards,
    closing,
    connections,
    divider,
    done,
    header,
    opening,
    sections,
    synthesis,
  };
}

function hasConnections(reading: FullReading): boolean {
  const r = reading.relational;
  return (
    r.dignities.length > 0 ||
    r.suitDominance !== null ||
    r.numericalPattern !== null
  );
}

function skippedVisibility(): AnimationVisibility {
  return {
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
}

function textLengths(reading: FullReading) {
  const connectionsText = [
    ...reading.relational.dignities.map((d) => d.detail),
    reading.relational.suitDominance?.detail,
    reading.relational.numericalPattern?.detail,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    closing: reading.narrative.closing.length,
    connections: connectionsText.length,
    opening: reading.narrative.opening.length,
    sections: reading.cards.map((c) => c.passage.length + 20) as [
      number,
      number,
      number,
    ],
    synthesis: reading.narrative.synthesis.length,
  };
}

function tick(state: InternalState, reading: FullReading): InternalState {
  if (state.skipped || state.phase === "done") return state;

  const next = { ...state, ticks: state.ticks + 1 };
  const lengths = textLengths(reading);

  switch (next.phase) {
    case "closing":
      next.chars += CHARS_PER_TICK;
      if (next.chars >= lengths.closing) {
        return { ...next, phase: "done", ticks: 0 };
      }
      break;

    case "connections":
      next.chars += CHARS_PER_TICK;
      if (next.chars >= lengths.connections) {
        return { ...next, chars: 0, phase: "synthesis", ticks: 0 };
      }
      break;

    case "deal":
      if (next.ticks >= DEAL_CARD_TICKS) {
        if (next.cardIndex < 2) {
          return { ...next, cardIndex: next.cardIndex + 1, ticks: 0 };
        }
        return { ...next, cardIndex: 0, phase: "reveal", ticks: 0 };
      }
      break;

    case "divider":
      if (next.ticks >= DIVIDER_TICKS) {
        return { ...next, chars: 0, phase: "opening", ticks: 0 };
      }
      break;

    case "header":
      if (next.ticks >= HEADER_TICKS) {
        return { ...next, cardIndex: 0, phase: "deal", ticks: 0 };
      }
      break;

    case "opening":
      next.chars += CHARS_PER_TICK;
      if (next.chars >= lengths.opening) {
        return {
          ...next,
          chars: 0,
          phase: "sections",
          sectionIndex: 0,
          ticks: 0,
        };
      }
      break;

    case "reveal":
      if (next.ticks >= REVEAL_CARD_TICKS) {
        if (next.cardIndex < 2) {
          return { ...next, cardIndex: next.cardIndex + 1, ticks: 0 };
        }
        return { ...next, phase: "divider", ticks: 0 };
      }
      break;

    case "sections":
      next.chars += CHARS_PER_TICK;
      if (next.chars >= lengths.sections[next.sectionIndex]) {
        if (next.sectionIndex < 2) {
          return {
            ...next,
            chars: 0,
            sectionIndex: next.sectionIndex + 1,
            ticks: 0,
          };
        }
        const nextPhase = hasConnections(reading) ? "connections" : "synthesis";
        return { ...next, chars: 0, phase: nextPhase, ticks: 0 };
      }
      break;

    case "synthesis":
      next.chars += CHARS_PER_TICK;
      if (next.chars >= lengths.synthesis) {
        return { ...next, chars: 0, phase: "closing", ticks: 0 };
      }
      break;
  }

  return next;
}
