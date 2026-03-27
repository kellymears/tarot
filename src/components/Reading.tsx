import { Box, Text } from "ink";

import type { FullReading } from "../engine/types.js";

import { ReadingSection } from "./ReadingSection.js";
import { RelationalInsight } from "./RelationalInsight.js";

interface ReadingProps {
  reading: FullReading;
}

export function Reading({ reading }: ReadingProps) {
  return (
    <Box flexDirection="column" gap={1} paddingX={2}>
      <Text dimColor italic wrap="wrap">
        {reading.narrative.opening}
      </Text>

      {reading.cards.map((cardReading) => (
        <ReadingSection key={cardReading.position} reading={cardReading} />
      ))}

      <RelationalInsight analysis={reading.relational} />

      <Text wrap="wrap">{reading.narrative.synthesis}</Text>

      <Text bold color="magenta" wrap="wrap">
        {reading.narrative.closing}
      </Text>
    </Box>
  );
}
