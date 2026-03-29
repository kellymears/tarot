import { Box } from "ink";

import type { FullReading, SpreadCard } from "../engine/types.js";

import { ORNAMENT } from "../constants.js";
import { ReadingSection } from "./ReadingSection.js";
import { RelationalInsight } from "./RelationalInsight.js";
import { Text } from "./Text.js";

const TEXT_WIDTH = 76;
const BORDERED_WIDTH = TEXT_WIDTH - 2;

interface ReadingProps {
  reading: FullReading;
  spread: SpreadCard[];
}

export function Reading({ reading, spread }: ReadingProps) {
  return (
    <Box flexDirection="column" gap={1}>
      <Text dimColor italic textWidth={TEXT_WIDTH}>
        {reading.narrative.opening}
      </Text>

      {reading.cards.map((cardReading, i) => (
        <ReadingSection
          key={cardReading.position}
          passage={cardReading.passage}
          spreadCard={spread[i]}
        />
      ))}

      <RelationalInsight analysis={reading.relational} />

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
          <Text textWidth={BORDERED_WIDTH}>{reading.narrative.synthesis}</Text>
        </Box>
      </Box>

      <Text bold color="magenta" textWidth={TEXT_WIDTH}>
        {reading.narrative.closing}
      </Text>

      <Box justifyContent="center">
        <Text dimColor>{ORNAMENT}</Text>
      </Box>
    </Box>
  );
}
