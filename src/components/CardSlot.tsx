import { Box } from "ink";

import type { TarotCard } from "../data/cards.js";
import type { CardState } from "../hooks/useAnimationController.js";

import { AnimatedCard } from "./AnimatedCard.js";
import { Text } from "./Text.js";

interface CardSlotProps {
  card: TarotCard;
  color: string;
  label?: string;
  reversed: boolean;
  showLabel: boolean;
  state: CardState;
}

export function CardSlot({
  card,
  color,
  label,
  reversed,
  showLabel,
  state,
}: CardSlotProps) {
  return (
    <Box alignItems="center" flexDirection="column">
      {showLabel && state !== "hidden" && (
        <Text bold dimColor>
          {label}
        </Text>
      )}
      <AnimatedCard
        card={card}
        color={color}
        reversed={reversed}
        state={state}
      />
    </Box>
  );
}
