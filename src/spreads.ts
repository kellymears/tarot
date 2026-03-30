import type { Position } from "./data/interpretations/types.js";

interface SpreadDefinition {
  cacheSuffix: string;
  cardCount: 1 | 3 | 5 | 7 | 10;
  layout: SpreadSection[];
  positions: Position[];
  subtitle: string;
  title: string;
}

type SpreadMode =
  | "card"
  | "celtic-cross"
  | "five-card"
  | "horseshoe"
  | "spread"
  | "yes-no";

interface SpreadSection {
  label?: string;
  rows: number[][]; // each row is an array of spread indices
}

export const SPREADS: Record<SpreadMode, SpreadDefinition> = {
  card: {
    cacheSuffix: "card",
    cardCount: 1,
    layout: [{ rows: [[0]] }],
    positions: ["present"],
    subtitle: "",
    title: "Daily Card",
  },
  "celtic-cross": {
    cacheSuffix: "celtic-cross",
    cardCount: 10,
    layout: [
      {
        label: "── The Cross ──",
        rows: [[4], [2, 0, 1, 3], [5]],
      },
      {
        label: "── The Staff ──",
        rows: [
          [6, 7],
          [8, 9],
        ],
      },
    ],
    positions: [
      "present",
      "challenge",
      "past",
      "future",
      "above",
      "below",
      "self",
      "environment",
      "hopes-fears",
      "outcome",
    ],
    subtitle:
      "Present · Challenge · Past · Future · Above · Below · Self · Environment · Hopes & Fears · Outcome",
    title: "Celtic Cross",
  },
  "five-card": {
    cacheSuffix: "five-card",
    cardCount: 5,
    layout: [{ rows: [[3], [1, 0, 2], [4]] }],
    positions: ["present", "past", "future", "above", "below"],
    subtitle: "Above · Past · Present · Future · Below",
    title: "Five-Card Cross",
  },
  horseshoe: {
    cacheSuffix: "horseshoe",
    cardCount: 7,
    layout: [
      {
        rows: [
          [0, 1, 2],
          [3, 4],
          [5, 6],
        ],
      },
    ],
    positions: [
      "past",
      "present",
      "future",
      "self",
      "environment",
      "obstacle",
      "outcome",
    ],
    subtitle:
      "Past · Present · Future · Self · Environment · Obstacle · Outcome",
    title: "Horseshoe Spread",
  },
  spread: {
    cacheSuffix: "",
    cardCount: 3,
    layout: [{ rows: [[0, 1, 2]] }],
    positions: ["past", "present", "future"],
    subtitle: "Past · Present · Future",
    title: "Three-Card Spread",
  },
  "yes-no": {
    cacheSuffix: "yesno",
    cardCount: 1,
    layout: [{ rows: [[0]] }],
    positions: ["present"],
    subtitle: "",
    title: "Yes or No?",
  },
};

export type { SpreadDefinition, SpreadMode };
