import { readFileSync } from "node:fs";

export type Arcana = "major" | "minor";

export type Suit = "cups" | "pentacles" | "swords" | "wands";

export interface TarotCard {
  arcana: Arcana;
  id: string;
  name: string;
  number: number;
  reversed: string;
  suit: null | Suit;
  upright: string;
}

const url = new URL("./cards.json", import.meta.url);

export const cards: TarotCard[] = JSON.parse(readFileSync(url, "utf-8"));
