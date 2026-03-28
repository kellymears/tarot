import { Box } from "ink";

import type { TarotCard } from "../data/cards.js";

import { Card } from "./Card.js";
import { CardBack } from "./CardBack.js";

export type CardState = "faceDown" | "faceUp" | "hidden";

interface AnimatedCardProps {
  card: TarotCard;
  reversed: boolean;
  state: CardState;
}

export function AnimatedCard({ card, reversed, state }: AnimatedCardProps) {
  if (state === "hidden") {
    return <Box height={17} width={28} />;
  }
  if (state === "faceDown") {
    return <CardBack />;
  }
  return <Card card={card} reversed={reversed} />;
}
