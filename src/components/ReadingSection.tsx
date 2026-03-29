import { Box } from "ink";

import type { SpreadCard } from "../engine/types.js";

import {
  MAJOR_SYMBOL,
  POSITION_LABELS,
  POSITION_SUBTITLES,
  SUIT_COLOR,
  SUIT_SYMBOL,
} from "../constants.js";
import { Text } from "./Text.js";

const BORDERED_WIDTH = 74; // parent TEXT_WIDTH (76) minus border (1) + paddingLeft (1)

interface ReadingSectionProps {
  passage: string;
  spreadCard: SpreadCard;
}

export function ReadingSection({ passage, spreadCard }: ReadingSectionProps) {
  const { card, position } = spreadCard;
  const color = card.suit ? SUIT_COLOR[card.suit] : "magenta";
  const symbol = card.suit ? SUIT_SYMBOL[card.suit] : MAJOR_SYMBOL;

  return (
    <Box flexDirection="column">
      <Text bold color={color}>
        {POSITION_LABELS[position]}
        <Text dimColor> · {POSITION_SUBTITLES[position]} · </Text>
        <Text color={color}>
          {symbol} {card.name}
        </Text>
      </Text>
      <Box
        borderBottom={false}
        borderColor={color}
        borderRight={false}
        borderStyle="single"
        borderTop={false}
        paddingLeft={1}
      >
        <Text textWidth={BORDERED_WIDTH}>{passage}</Text>
      </Box>
    </Box>
  );
}
