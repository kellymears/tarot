import { Box, Text } from "ink";

import type { TarotCard } from "../data/cards.js";

import { CARD, NUMERALS } from "../constants.js";

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
        height={CARD.height}
        paddingBottom={1}
        paddingTop={1}
        paddingX={2}
        width={CARD.width}
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
        <Box justifyContent="center" width={CARD.width}>
          <Text dimColor>(Reversed)</Text>
        </Box>
      )}
    </Box>
  );
}

const toRoman = (n: number): string => NUMERALS[n] ?? String(n);
