import { Box, Text } from "ink";

const ROW_A = "◇ · ◇ · ◇ · ◇ · ◇";
const ROW_B = "· ◇ · ◇ · ◇ · ◇ ·";

export function CardBack() {
  return (
    <Box
      borderColor="gray"
      borderStyle="round"
      flexDirection="column"
      paddingX={2}
      paddingY={1}
      width={28}
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
    </Box>
  );
}
