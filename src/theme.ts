import type { Suit } from "./data/cards.js";

interface Theme {
  accent: string;
  negative: string;
  positive: string;
  suits: Record<Suit, string>;
  thread: string;
}

type ThemeName = "classic" | "default";

const THEMES: Record<ThemeName, Theme> = {
  classic: {
    accent: "yellow",
    negative: "red",
    positive: "cyan",
    suits: {
      cups: "cyan",
      pentacles: "yellow",
      swords: "white",
      wands: "red",
    },
    thread: "cyan",
  },
  default: {
    accent: "magenta",
    negative: "red",
    positive: "green",
    suits: {
      cups: "blue",
      pentacles: "green",
      swords: "cyan",
      wands: "yellow",
    },
    thread: "green",
  },
};

export { THEMES };
export type { Theme, ThemeName };
