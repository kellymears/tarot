import { Box, Text, useApp, useInput } from "ink";
import { useEffect, useState } from "react";

import type { Position } from "./data/interpretations/types.js";

import { AnimatedCard } from "./components/AnimatedCard.js";
import { RelationalInsight } from "./components/RelationalInsight.js";
import { Typewriter } from "./components/Typewriter.js";
import { useAnimationController } from "./hooks/useAnimationController.js";
import { resolve } from "./resolve.js";

const SPREAD_LABELS: Record<Position, string> = {
  future: "Future",
  past: "Past",
  present: "Present",
};

interface AppProps {
  forceNew: boolean;
  name: string;
}

export function App({ forceNew, name }: AppProps) {
  const { exit } = useApp();
  const [{ reading, spread }] = useState(() => resolve(name, forceNew));
  const { skip, visibility: v } = useAnimationController(reading);

  useInput(
    () => {
      if (!v.done) skip();
    },
    { isActive: process.stdin.isTTY === true && !v.done },
  );

  useEffect(() => {
    if (v.done) {
      const id = setTimeout(() => exit(), 100);
      return () => clearTimeout(id);
    }
  }, [v.done, exit]);

  return (
    <Box flexDirection="column" gap={1}>
      {v.header && (
        <Box alignItems="center" flexDirection="column">
          <Text bold color="magenta">
            Three-Card Spread
          </Text>
          <Text dimColor>
            Reading for{" "}
            <Text color="magenta">
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </Text>
          </Text>
          <Text dimColor>Past · Present · Future</Text>
        </Box>
      )}

      <Box flexDirection="row" flexWrap="wrap" gap={1} justifyContent="center">
        {spread.map((sc, i) => (
          <Box alignItems="center" flexDirection="column" key={sc.card.id}>
            {v.cards[i] !== "hidden" && (
              <Text bold dimColor>
                {SPREAD_LABELS[sc.position]}
              </Text>
            )}
            <AnimatedCard
              card={sc.card}
              reversed={sc.orientation === "reversed"}
              state={v.cards[i]}
            />
          </Box>
        ))}
      </Box>

      {v.divider && (
        <Box justifyContent="center">
          <Text dimColor>{"─".repeat(48)}</Text>
        </Box>
      )}

      {v.opening.visible && (
        <Box paddingX={2}>
          <Typewriter chars={v.opening.chars}>
            <Text dimColor italic wrap="wrap">
              {reading.narrative.opening}
            </Text>
          </Typewriter>
        </Box>
      )}

      {reading.cards.map(
        (cardReading, i) =>
          v.sections[i].visible && (
            <Box flexDirection="column" key={cardReading.position} paddingX={2}>
              <Text bold color="cyan">
                {cardReading.position.charAt(0).toUpperCase() +
                  cardReading.position.slice(1)}
              </Text>
              <Typewriter chars={v.sections[i].chars}>
                <Text wrap="wrap">{cardReading.passage}</Text>
              </Typewriter>
            </Box>
          ),
      )}

      {v.connections.visible && (
        <Box paddingX={2}>
          <RelationalInsight analysis={reading.relational} />
        </Box>
      )}

      {v.synthesis.visible && (
        <Box paddingX={2}>
          <Typewriter chars={v.synthesis.chars}>
            <Text wrap="wrap">{reading.narrative.synthesis}</Text>
          </Typewriter>
        </Box>
      )}

      {v.closing.visible && (
        <Box paddingX={2}>
          <Typewriter chars={v.closing.chars}>
            <Text bold color="magenta" wrap="wrap">
              {reading.narrative.closing}
            </Text>
          </Typewriter>
        </Box>
      )}
    </Box>
  );
}
