import { Box, Text } from "ink";

import type { CardReading } from "../engine/types.js";

import { POSITION_LABELS } from "../constants.js";

interface ReadingSectionProps {
  reading: CardReading;
}

export function ReadingSection({ reading }: ReadingSectionProps) {
  return (
    <Box flexDirection="column" gap={0}>
      <Text bold color="cyan">
        {POSITION_LABELS[reading.position] ?? reading.position}
      </Text>
      <Text wrap="wrap">{reading.passage}</Text>
    </Box>
  );
}
