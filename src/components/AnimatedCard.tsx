import { Box } from "ink";

import type { TarotCard } from "../data/cards.js";
import type { CardState } from "../hooks/useAnimationController.js";

import { CARD } from "../constants.js";
import { Card } from "./Card.js";
import { CardBack } from "./CardBack.js";

interface AnimatedCardProps {
  card: TarotCard;
  color: string;
  reversed: boolean;
  state: CardState;
}

export function AnimatedCard({
  card,
  color,
  reversed,
  state,
}: AnimatedCardProps) {
  if (state === "hidden") {
    return <Box height={CARD.height} width={CARD.width} />;
  }
  if (state === "faceDown") {
    return <CardBack color={color} />;
  }
  return <Card card={card} color={color} reversed={reversed} />;
}
