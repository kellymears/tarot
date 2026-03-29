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

interface ReadingSectionProps {
  passage: string;
  spreadCard: SpreadCard;
  textWidth: number;
}

export function ReadingSection({
  passage,
  spreadCard,
  textWidth,
}: ReadingSectionProps) {
  const borderedWidth = textWidth - 2; // border (1) + paddingLeft (1)
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
        <Text textWidth={borderedWidth}>{passage}</Text>
      </Box>
    </Box>
  );
}
