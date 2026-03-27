import { Box, Text } from "ink";

import type { CardReading } from "../engine/types.js";

interface ReadingSectionProps {
  reading: CardReading;
}

const positionLabel: Record<string, string> = {
  future: "Future",
  past: "Past",
  present: "Present",
};

export function ReadingSection({ reading }: ReadingSectionProps) {
  return (
    <Box flexDirection="column" gap={0}>
      <Text bold color="cyan">
        {positionLabel[reading.position] ?? reading.position}
      </Text>
      <Text wrap="wrap">{reading.passage}</Text>
    </Box>
  );
}
