import { Box, useApp, useInput, useStdout } from "ink";
import { useEffect, useState } from "react";

import type { ReversalMode } from "./data/interpretations/types.js";
import type { SpreadMode } from "./spreads.js";
import type { ThemeName } from "./theme.js";

import { CardSlot } from "./components/CardSlot.js";
import { RelationalInsight } from "./components/RelationalInsight.js";
import { Text } from "./components/Text.js";
import { Typewriter } from "./components/Typewriter.js";
import {
  MAJOR_SYMBOL,
  MAX_TEXT_WIDTH,
  ORNAMENT,
  POSITION_LABELS,
  POSITION_SUBTITLES,
  SUIT_SYMBOL,
} from "./constants.js";
import { useAnimationController } from "./hooks/useAnimationController.js";
import { resolveSpread } from "./resolve.js";
import { SPREADS } from "./spreads.js";
import { THEMES } from "./theme.js";

interface AppProps {
  animate: boolean;
  forceNew: boolean;
  mode: SpreadMode;
  name: string;
  reversalMode: ReversalMode;
  themeName: ThemeName;
}

export function App({
  animate,
  forceNew,
  mode,
  name,
  reversalMode,
  themeName,
}: AppProps) {
  const { exit } = useApp();
  const { stdout } = useStdout();
  const theme = THEMES[themeName];
  const def = SPREADS[mode];
  const isSingleCard = def.cardCount === 1;
  const isMultiCard = !isSingleCard;
  const isYesNo = mode === "yes-no";
  const columns = stdout.columns ?? MAX_TEXT_WIDTH;
  const textWidth = Math.min(MAX_TEXT_WIDTH, columns);
  const borderedWidth = textWidth - 2;

  const [{ cached, reading, spread }] = useState(() =>
    resolveSpread(mode, name, forceNew, reversalMode),
  );
  const { skip, visibility: v } = useAnimationController(reading, {
    cardCount: def.cardCount,
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
    <Box flexDirection="column" gap={1}>
      {v.header && (
        <Box alignItems="center" flexDirection="column">
          <Text dimColor>{ORNAMENT}</Text>
          <Text bold color={theme.accent}>
            {def.title}
          </Text>
          <Text dimColor>
            A reading for <Text color={theme.accent}>{displayName}</Text>
          </Text>
          {def.subtitle && <Text dimColor>{def.subtitle}</Text>}
          {cached && (
            <Text dimColor italic>
              {dateLabel}
            </Text>
          )}
        </Box>
      )}

      <Box alignItems="center" flexDirection="column" gap={1}>
        {def.layout.map((section, si) => (
          <Box alignItems="center" flexDirection="column" gap={1} key={si}>
            {section.label && (
              <Text bold dimColor>
                {section.label}
              </Text>
            )}
            {section.rows.map((row, ri) => (
              <Box flexDirection="row" gap={1} justifyContent="center" key={ri}>
                {row.map((idx) => {
                  const slotColor = spread[idx].card.suit
                    ? theme.suits[spread[idx].card.suit!]
                    : theme.accent;
                  return (
                    <CardSlot
                      card={spread[idx].card}
                      color={slotColor}
                      key={spread[idx].card.id}
                      label={
                        spread[idx].position === "challenge"
                          ? "✦ " + POSITION_LABELS[spread[idx].position]
                          : POSITION_LABELS[spread[idx].position]
                      }
                      reversed={spread[idx].orientation === "reversed"}
                      showLabel={isMultiCard}
                      state={v.cards[idx]}
                    />
                  );
                })}
              </Box>
            ))}
          </Box>
        ))}
      </Box>

      {v.divider && (
        <Box
          alignSelf="center"
          flexDirection="column"
          gap={1}
          width={textWidth}
        >
          <Box justifyContent="center">
            <Text dimColor>{"───────────── ✦ ─────────────"}</Text>
          </Box>

          {isMultiCard && v.opening.visible && (
            <Typewriter chars={v.opening.chars}>
              <Text dimColor italic textWidth={textWidth}>
                {reading.narrative.opening}
              </Text>
            </Typewriter>
          )}

          {isYesNo && v.sections[0]?.visible && (
            <Box justifyContent="center">
              <Text
                bold
                color={
                  spread[0].orientation === "upright"
                    ? theme.positive
                    : theme.negative
                }
              >
                {spread[0].orientation === "upright" ? "Yes" : "No"}
              </Text>
            </Box>
          )}

          {reading.cards.slice(0, def.cardCount).map((cardReading, i) => {
            if (!v.sections[i].visible) return null;

            const sc = spread[i];
            const color = sc.card.suit
              ? theme.suits[sc.card.suit]
              : theme.accent;
            const symbol = sc.card.suit
              ? SUIT_SYMBOL[sc.card.suit]
              : MAJOR_SYMBOL;

            return (
              <Box flexDirection="column" key={cardReading.position}>
                {isSingleCard ? (
                  <Text bold color={color}>
                    {symbol} {sc.card.name}
                    {isYesNo && (
                      <Text dimColor>
                        {" "}
                        ·{" "}
                        {sc.orientation === "upright"
                          ? "upright"
                          : "reversed"}{" "}
                      </Text>
                    )}
                  </Text>
                ) : (
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
                )}
                <Box
                  borderBottom={false}
                  borderColor={color}
                  borderRight={false}
                  borderStyle="single"
                  borderTop={false}
                  paddingLeft={1}
                >
                  <Typewriter chars={v.sections[i].chars}>
                    <Text textWidth={borderedWidth}>{cardReading.passage}</Text>
                  </Typewriter>
                </Box>
              </Box>
            );
          })}

          {isMultiCard && v.connections.visible && (
            <RelationalInsight
              accentColor={theme.accent}
              analysis={reading.relational}
              textWidth={textWidth}
            />
          )}

          {isMultiCard && v.synthesis.visible && (
            <Box flexDirection="column">
              <Text bold color={theme.thread}>
                ✦ The Thread
              </Text>
              <Box
                borderBottom={false}
                borderColor={theme.thread}
                borderRight={false}
                borderStyle="single"
                borderTop={false}
                paddingLeft={1}
              >
                <Typewriter chars={v.synthesis.chars}>
                  <Text textWidth={borderedWidth}>
                    {reading.narrative.synthesis}
                  </Text>
                </Typewriter>
              </Box>
            </Box>
          )}

          {v.closing.visible && (
            <Box flexDirection="column" gap={1}>
              <Typewriter chars={v.closing.chars}>
                <Text bold color={theme.accent} textWidth={textWidth}>
                  {reading.narrative.closing}
                </Text>
              </Typewriter>
              <Box justifyContent="center">
                <Text dimColor>{ORNAMENT}</Text>
              </Box>
              {cached && (
                <Text dimColor italic>
                  {`tarot ${mode !== "spread" ? mode + " " : ""}--new for a fresh ${isSingleCard ? "draw" : "spread"} · tarot ${mode !== "spread" ? mode + " " : ""}--json for data`}
                </Text>
              )}
            </Box>
          )}
        </Box>
      )}

      {interactive && !v.done && v.header && (
        <Box justifyContent="center">
          <Text dimColor italic>
            press any key to skip
          </Text>
        </Box>
      )}
    </Box>
  );
}
