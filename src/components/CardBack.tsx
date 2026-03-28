import { Box, Text } from "ink";

import { CARD_WIDTH, ROW_A, ROW_B } from "../constants.js";

export function CardBack() {
  return (
    <Box
      borderColor="gray"
      borderStyle="round"
      flexDirection="column"
      paddingX={2}
      paddingY={2}
      width={CARD_WIDTH}
    >
      <Box justifyContent="center">
        <Text dimColor>{ROW_A}</Text>
      </Box>
      <Box justifyContent="center">
        <Text dimColor>{ROW_B}</Text>
      </Box>
      <Box justifyContent="center">
        <Text dimColor>{ROW_A}</Text>
      </Box>
      <Box justifyContent="center">
        <Text dimColor>{ROW_B}</Text>
      </Box>
      <Box justifyContent="center">
        <Text dimColor>{ROW_A}</Text>
      </Box>
      <Box justifyContent="center">
        <Text dimColor>{ROW_B}</Text>
      </Box>
      <Box justifyContent="center">
        <Text dimColor>{ROW_A}</Text>
      </Box>
      <Box justifyContent="center">
        <Text dimColor>{ROW_B}</Text>
      </Box>
      <Box justifyContent="center">
        <Text dimColor>{ROW_A}</Text>
      </Box>
      <Box justifyContent="center">
        <Text dimColor>{ROW_B}</Text>
      </Box>
      <Box justifyContent="center">
        <Text dimColor>{ROW_A}</Text>
      </Box>
    </Box>
  );
}
