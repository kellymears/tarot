import { Box, Text } from "ink";

import type { RelationalAnalysis } from "../engine/types.js";

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
      borderColor="gray"
      borderStyle="single"
      flexDirection="column"
      paddingX={1}
      rowGap={1}
    >
      <Text bold dimColor>
        Connections
      </Text>

      <Box flexDirection="column" rowGap={1}>
        {insights.map((insight, i) => (
          <Text dimColor key={i} wrap="wrap">
            {insight}
          </Text>
        ))}
      </Box>
    </Box>
  );
}
