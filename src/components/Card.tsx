import { Box, Text } from "ink";

import type { TarotCard } from "../data/cards.js";

interface CardProps {
  card: TarotCard;
  reversed: boolean;
}

const NUMERALS = [
  "0",
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
  "XIII",
  "XIV",
  "XV",
  "XVI",
  "XVII",
  "XVIII",
  "XIX",
  "XX",
  "XXI",
];

export function Card({ card, reversed }: CardProps) {
  return (
    <Box flexDirection="column">
      <Box
        borderColor="magenta"
        borderStyle="round"
        flexDirection="column"
        paddingX={2}
        paddingY={1}
        width={28}
      >
        <Text dimColor>{card.arcana === "major" ? "M" : "m"}</Text>
        <Box justifyContent="center">
          <Text bold>{toRoman(card.number)}</Text>
        </Box>
        <Box justifyContent="center">
          <Text color="cyan">{card.name}</Text>
        </Box>
      </Box>
      {reversed && (
        <Box justifyContent="center" width={28}>
          <Text dimColor>(Reversed)</Text>
        </Box>
      )}
    </Box>
  );
}

function toRoman(n: number): string {
  return NUMERALS[n] ?? String(n);
}
