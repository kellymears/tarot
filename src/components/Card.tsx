import { Box, Text } from "ink";

import type { TarotCard } from "../data/cards.js";

import { CARD_HEIGHT, CARD_WIDTH, NUMERALS } from "../constants.js";

interface CardProps {
  card: TarotCard;
  reversed: boolean;
}

export function Card({ card, reversed }: CardProps) {
  return (
    <Box flexDirection="column">
      <Box
        borderColor="magenta"
        borderStyle="round"
        flexDirection="column"
        height={CARD_HEIGHT}
        paddingBottom={1}
        paddingTop={1}
        paddingX={2}
        width={CARD_WIDTH}
      >
        <Text dimColor>{card.arcana === "major" ? "M" : "m"}</Text>
        <Box flexGrow={1} />
        <Box justifyContent="center">
          <Text bold>{toRoman(card.number)}</Text>
        </Box>
        <Box justifyContent="center">
          <Text color="cyan">{card.name}</Text>
        </Box>
        <Box flexGrow={1} />
      </Box>
      {reversed && (
        <Box justifyContent="center" width={CARD_WIDTH}>
          <Text dimColor>(Reversed)</Text>
        </Box>
      )}
    </Box>
  );
}

function toRoman(n: number): string {
  return NUMERALS[n] ?? String(n);
}
