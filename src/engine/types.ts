import type { Suit, TarotCard } from "../data/cards.js";
import type { Orientation, Position } from "../data/interpretations/types.js";

export interface ArcanaWeight {
  count: number;
  detail: string;
}

export interface CardReading {
  fallback: boolean;
  passage: string;
  position: Position;
}

export interface CourtCardPresence {
  count: number;
  detail: string;
}

export type Element = "air" | "earth" | "fire" | "water";

export interface ElementalBalance {
  detail: string;
  dominant: Element[];
  missing: Element[];
}

export interface ElementalDignity {
  cards: [string, string];
  detail: string;
  relationship: "allied" | "enemy" | "neutral";
}

export interface FullReading {
  cards: CardReading[];
  narrative: Narrative;
  relational: RelationalAnalysis;
}

export interface Narrative {
  closing: string;
  opening: string;
  synthesis: string;
}

export interface NumericalPattern {
  detail: string;
  type: "ascending" | "descending" | "matching" | "sequential";
}

export interface RelationalAnalysis {
  arcanaWeight: ArcanaWeight;
  courtCards: CourtCardPresence | null;
  dignities: ElementalDignity[];
  elementalBalance: ElementalBalance | null;
  numericalPattern: null | NumericalPattern;
  reversalPattern: ReversalPattern;
  suitDominance: null | SuitDominance;
}

export interface ReversalPattern {
  count: number;
  detail: string;
}

export interface SpreadCard {
  card: TarotCard;
  orientation: Orientation;
  position: Position;
}

export interface SuitDominance {
  count: number;
  detail: string;
  suit: Suit;
}
