import { Box, Text } from "ink";

import { CARD } from "../constants.js";

export function CardBack() {
  return (
    <Box
      borderColor="gray"
      borderStyle="round"
      flexDirection="column"
      paddingX={2}
      paddingY={2}
      width={CARD.width}
    >
      <Box justifyContent="center">
        <Text dimColor>{CARD.back.rowA}</Text>
      </Box>
      <Box justifyContent="center">
        <Text dimColor>{CARD.back.rowB}</Text>
      </Box>
      <Box justifyContent="center">
        <Text dimColor>{CARD.back.rowA}</Text>
      </Box>
      <Box justifyContent="center">
        <Text dimColor>{CARD.back.rowB}</Text>
      </Box>
      <Box justifyContent="center">
        <Text dimColor>{CARD.back.rowA}</Text>
      </Box>
      <Box justifyContent="center">
        <Text dimColor>{CARD.back.rowB}</Text>
      </Box>
      <Box justifyContent="center">
        <Text dimColor>{CARD.back.rowA}</Text>
      </Box>
      <Box justifyContent="center">
        <Text dimColor>{CARD.back.rowB}</Text>
      </Box>
      <Box justifyContent="center">
        <Text dimColor>{CARD.back.rowA}</Text>
      </Box>
      <Box justifyContent="center">
        <Text dimColor>{CARD.back.rowB}</Text>
      </Box>
      <Box justifyContent="center">
        <Text dimColor>{CARD.back.rowA}</Text>
      </Box>
    </Box>
  );
}
