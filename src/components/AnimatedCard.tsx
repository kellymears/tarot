import { Box } from "ink";

import type { TarotCard } from "../data/cards.js";
import type { CardState } from "../hooks/useAnimationController.js";

import { CARD } from "../constants.js";
import { Card } from "./Card.js";
import { CardBack } from "./CardBack.js";

interface AnimatedCardProps {
  card: TarotCard;
  reversed: boolean;
  state: CardState;
}

export function AnimatedCard({ card, reversed, state }: AnimatedCardProps) {
  if (state === "hidden") {
    return <Box height={CARD.height} width={CARD.width} />;
  }
  if (state === "faceDown") {
    return <CardBack />;
  }
  return <Card card={card} reversed={reversed} />;
}
