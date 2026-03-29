import { Box } from "ink";

import type { RelationalAnalysis } from "../engine/types.js";

import { Text } from "./Text.js";

const CONTENT_WIDTH = 72; // parent TEXT_WIDTH (76) minus border (2) + paddingX (2)

interface RelationalInsightProps {
  analysis: RelationalAnalysis;
}

export function RelationalInsight({ analysis }: RelationalInsightProps) {
  const insights = [
    ...analysis.dignities.map((d) => d.detail),
    analysis.suitDominance?.detail,
    analysis.numericalPattern?.detail,
  ].filter(Boolean) as string[];

  if (insights.length === 0) return null;

  return (
    <Box
      borderColor="magenta"
      borderStyle="round"
      flexDirection="column"
      paddingX={1}
      rowGap={1}
    >
      <Text bold color="magenta">
        ✦ Connections
      </Text>

      <Box flexDirection="column" rowGap={1}>
        {insights.map((insight, i) => (
          <Text dimColor key={i} textWidth={CONTENT_WIDTH}>
            {insight}
          </Text>
        ))}
      </Box>
    </Box>
  );
}
