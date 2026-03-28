import { Box, Newline, Text } from "ink";

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
        height={17}
        paddingBottom={1}
        paddingTop={1}
        paddingX={2}
        width={28}
      >
        <Text dimColor>{card.arcana === "major" ? "M" : "m"}</Text>
        <Newline />
        <Newline />
        <Newline />
        <Newline />
        <Box justifyContent="center">
          <Text bold>{toRoman(card.number)}</Text>
        </Box>
        <Newline />
        <Box justifyContent="center">
          <Text color="cyan">{card.name}</Text>
        </Box>
        <Newline />
        <Newline />
        <Newline />
        <Newline />
        <Newline />
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
