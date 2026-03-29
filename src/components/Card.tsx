import { Box, Text } from "ink";

import type { TarotCard } from "../data/cards.js";

import {
  CARD,
  ELEMENT_NAME,
  MAJOR_ELEMENT,
  MAJOR_SYMBOL,
  NUMERALS,
  SUIT_COLOR,
  SUIT_ELEMENT,
  SUIT_SYMBOL,
} from "../constants.js";

interface CardProps {
  card: TarotCard;
  reversed: boolean;
}

const INNER_WIDTH = CARD.width - 6; // border (2) + paddingX (4)

export function Card({ card, reversed }: CardProps) {
  const color = card.suit ? SUIT_COLOR[card.suit] : "magenta";
  const symbol = card.suit ? SUIT_SYMBOL[card.suit] : MAJOR_SYMBOL;
  const element = card.suit
    ? ELEMENT_NAME[SUIT_ELEMENT[card.suit]]
    : ELEMENT_NAME[MAJOR_ELEMENT[card.id] ?? "fire"];
  const keywords = reversed ? card.reversed : card.upright;
  const truncated =
    keywords.length > INNER_WIDTH
      ? keywords.slice(0, INNER_WIDTH - 1) + "\u2026"
      : keywords;

  return (
    <Box flexDirection="column">
      <Box
        borderColor={color}
        borderStyle="round"
        flexDirection="column"
        height={CARD.height}
        paddingBottom={1}
        paddingTop={1}
        paddingX={2}
        width={CARD.width}
      >
        <Box justifyContent="space-between">
          <Text color={color}>{symbol}</Text>
          <Text dimColor>{card.arcana === "major" ? "major" : card.suit}</Text>
        </Box>
        <Box flexGrow={1} />
        <Box justifyContent="center">
          <Text bold>{toRoman(card.number)}</Text>
        </Box>
        <Box justifyContent="center">
          <Text bold color={color}>
            {card.name}
          </Text>
        </Box>
        <Box justifyContent="center">
          <Text dimColor italic>
            {truncated}
          </Text>
        </Box>
        <Box flexGrow={1} />
        <Box justifyContent="space-between">
          <Text dimColor>{element.toLowerCase()}</Text>
          <Text color={color}>{symbol}</Text>
        </Box>
      </Box>
      {reversed && (
        <Box justifyContent="center" width={CARD.width}>
          <Text dimColor italic>
            {symbol} reversed
          </Text>
        </Box>
      )}
    </Box>
  );
}

const toRoman = (n: number): string => NUMERALS[n] ?? String(n);
