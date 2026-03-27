import { Box, Text } from "ink";

import type { RelationalAnalysis } from "../engine/types.js";

interface RelationalInsightProps {
  analysis: RelationalAnalysis;
}

export function RelationalInsight({ analysis }: RelationalInsightProps) {
  const insights: string[] = [];

  for (const dignity of analysis.dignities) {
    insights.push(dignity.detail);
  }

  if (analysis.suitDominance) {
    insights.push(analysis.suitDominance.detail);
  }

  if (analysis.numericalPattern) {
    insights.push(analysis.numericalPattern.detail);
  }

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
