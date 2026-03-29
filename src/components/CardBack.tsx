import { Box, Text } from "ink";

import { CARD } from "../constants.js";

const rows = Array.from({ length: 11 }, (_, i) =>
  i % 2 === 0 ? CARD.back.rowA : CARD.back.rowB,
);

export function CardBack() {
  return (
    <Box
      borderColor="magenta"
      borderStyle="round"
      flexDirection="column"
      paddingX={2}
      paddingY={2}
      width={CARD.width}
    >
      {rows.map((row, i) => (
        <Box justifyContent="center" key={i}>
          <Text color="magenta" dimColor>
            {row}
          </Text>
        </Box>
      ))}
    </Box>
  );
}
