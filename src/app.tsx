import { Box, useApp, useInput, useStdout } from "ink";
import { useEffect, useState } from "react";

import { AnimatedCard } from "./components/AnimatedCard.js";
import { RelationalInsight } from "./components/RelationalInsight.js";
import { Text } from "./components/Text.js";
import { Typewriter } from "./components/Typewriter.js";
import {
  CARD,
  MAJOR_SYMBOL,
  ORNAMENT,
  POSITION_LABELS,
  POSITION_SUBTITLES,
  SUIT_COLOR,
  SUIT_SYMBOL,
} from "./constants.js";
import { useAnimationController } from "./hooks/useAnimationController.js";
import { resolve } from "./resolve.js";

const TEXT_WIDTH = 76;
const BORDERED_WIDTH = TEXT_WIDTH - 2; // left border (1) + paddingLeft (1)
const CARD_ROW_WIDTH = CARD.width * 3 + 2; // 3 cards + 2 gaps

interface AppProps {
  animate: boolean;
  forceNew: boolean;
  name: string;
}

export function App({ animate, forceNew, name }: AppProps) {
  const { exit } = useApp();
  const { stdout } = useStdout();
  const columns = stdout.columns ?? CARD_ROW_WIDTH;
  const paddingX = Math.max(0, Math.floor((columns - CARD_ROW_WIDTH) / 2));

  const [{ cached, reading, spread }] = useState(() => resolve(name, forceNew));
  const { skip, visibility: v } = useAnimationController(reading, {
    skip: !animate,
  });

  const interactive = process.stdin.isTTY === true;

  useInput(
    () => {
      if (!v.done) skip();
    },
    { isActive: interactive && !v.done },
  );

  useEffect(() => {
    if (v.done) {
      const id = setTimeout(() => exit(), 100);
      return () => clearTimeout(id);
    }
  }, [v.done, exit]);

  const displayName = name.charAt(0).toUpperCase() + name.slice(1);
  const dateLabel = new Date().toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Box flexDirection="column" gap={1} paddingX={paddingX}>
      {v.header && (
        <Box alignItems="center" flexDirection="column">
          <Text dimColor>{ORNAMENT}</Text>
          <Text bold color="magenta">
            Three-Card Spread
          </Text>
          <Text dimColor>
            A reading for <Text color="magenta">{displayName}</Text>
          </Text>
          <Text dimColor>Past · Present · Future</Text>
          {cached && (
            <Text dimColor italic>
              {dateLabel}
            </Text>
          )}
        </Box>
      )}

      <Box flexDirection="row" flexWrap="wrap" gap={1} justifyContent="center">
        {spread.map((sc, i) => (
          <Box alignItems="center" flexDirection="column" key={sc.card.id}>
            {v.cards[i] !== "hidden" && (
              <Text bold dimColor>
                {POSITION_LABELS[sc.position]}
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

      {interactive && !v.done && v.header && (
        <Box justifyContent="center">
          <Text dimColor italic>
            press any key to skip
          </Text>
        </Box>
      )}

      {v.divider && (
        <Box flexDirection="column" gap={1} width={TEXT_WIDTH}>
          <Box justifyContent="center">
            <Text dimColor>{"───────────── ✦ ─────────────"}</Text>
          </Box>

          {v.opening.visible && (
            <Typewriter chars={v.opening.chars}>
              <Text dimColor italic textWidth={TEXT_WIDTH}>
                {reading.narrative.opening}
              </Text>
            </Typewriter>
          )}

          {reading.cards.map((cardReading, i) => {
            if (!v.sections[i].visible) return null;

            const sc = spread[i];
            const color = sc.card.suit ? SUIT_COLOR[sc.card.suit] : "magenta";
            const symbol = sc.card.suit
              ? SUIT_SYMBOL[sc.card.suit]
              : MAJOR_SYMBOL;

            return (
              <Box flexDirection="column" key={cardReading.position}>
                <Text bold color={color}>
                  {POSITION_LABELS[cardReading.position]}
                  <Text dimColor>
                    {" "}
                    · {POSITION_SUBTITLES[cardReading.position]} ·{" "}
                  </Text>
                  <Text color={color}>
                    {symbol} {sc.card.name}
                  </Text>
                </Text>
                <Box
                  borderBottom={false}
                  borderColor={color}
                  borderRight={false}
                  borderStyle="single"
                  borderTop={false}
                  paddingLeft={1}
                >
                  <Typewriter chars={v.sections[i].chars}>
                    <Text textWidth={BORDERED_WIDTH}>
                      {cardReading.passage}
                    </Text>
                  </Typewriter>
                </Box>
              </Box>
            );
          })}

          {v.connections.visible && (
            <RelationalInsight analysis={reading.relational} />
          )}

          {v.synthesis.visible && (
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
                <Typewriter chars={v.synthesis.chars}>
                  <Text textWidth={BORDERED_WIDTH}>
                    {reading.narrative.synthesis}
                  </Text>
                </Typewriter>
              </Box>
            </Box>
          )}

          {v.closing.visible && (
            <Box flexDirection="column" gap={1}>
              <Typewriter chars={v.closing.chars}>
                <Text bold color="magenta" textWidth={TEXT_WIDTH}>
                  {reading.narrative.closing}
                </Text>
              </Typewriter>
              <Box justifyContent="center">
                <Text dimColor>{ORNAMENT}</Text>
              </Box>
              {cached && (
                <Text dimColor italic>
                  tarot --new for a fresh spread · tarot --json for data
                </Text>
              )}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
