import { Box } from "ink";

import type { FullReading, SpreadCard } from "../engine/types.js";

import { ORNAMENT } from "../constants.js";
import { ReadingSection } from "./ReadingSection.js";
import { RelationalInsight } from "./RelationalInsight.js";
import { Text } from "./Text.js";

interface ReadingProps {
  reading: FullReading;
  spread: SpreadCard[];
  textWidth: number;
}

export function Reading({ reading, spread, textWidth }: ReadingProps) {
  const borderedWidth = textWidth - 2;

  return (
    <Box flexDirection="column" gap={1}>
      <Text dimColor italic textWidth={textWidth}>
        {reading.narrative.opening}
      </Text>

      {reading.cards.map((cardReading, i) => (
        <ReadingSection
          key={cardReading.position}
          passage={cardReading.passage}
          spreadCard={spread[i]}
          textWidth={textWidth}
        />
      ))}

      <RelationalInsight analysis={reading.relational} textWidth={textWidth} />

      <Box flexDirection="column">
        <Text bold color="green">
          ✦ The Thread
        </Text>
        <Box
          borderBottom={false}
          borderColor="green"
          borderRight={false}
          borderStyle="single"
          borderTop={false}
          paddingLeft={1}
        >
          <Text textWidth={borderedWidth}>{reading.narrative.synthesis}</Text>
        </Box>
      </Box>

      <Text bold color="magenta" textWidth={textWidth}>
        {reading.narrative.closing}
      </Text>

      <Box justifyContent="center">
        <Text dimColor>{ORNAMENT}</Text>
      </Box>
    </Box>
  );
}
