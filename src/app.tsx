import { Box, useApp, useInput, useStdout } from "ink";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { ReversalMode } from "./data/interpretations/types.js";
import type { FullReading, SpreadCard } from "./engine/types.js";
import type { SpreadMode } from "./spreads.js";
import type { ThemeName } from "./theme.js";

import { CardPicker } from "./components/CardPicker.js";
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
import { interpret } from "./engine/index.js";
import { useAnimationController } from "./hooks/useAnimationController.js";
import { resolveSpread } from "./resolve.js";
import { SPREADS } from "./spreads.js";
import { appendHistory } from "./store.js";
import { THEMES } from "./theme.js";

export interface AppProps {
  animate: boolean;
  forceNew: boolean;
  interactive: boolean;
  mode: SpreadMode;
  name: string;
  reversalMode: ReversalMode;
  themeName: ThemeName;
}

interface ReadingProps {
  animate: boolean;
  cached: boolean;
  def: (typeof SPREADS)[SpreadMode];
  displayName: string;
  mode: SpreadMode;
  reading: FullReading;
  spread: SpreadCard[];
  startAfterCards: boolean;
  theme: (typeof THEMES)[keyof typeof THEMES];
}

export function App({
  animate,
  forceNew,
  interactive,
  mode,
  name,
  reversalMode,
  themeName,
}: AppProps) {
  const theme = THEMES[themeName];
  const def = SPREADS[mode];
  const isInteractiveMode = interactive && mode === "spread";

  const [pickerResult, setPickerResult] = useState<null | {
    reading: FullReading;
    spread: SpreadCard[];
  }>(null);

  const handlePickerComplete = useCallback(
    (selected: SpreadCard[]) => {
      const reading = interpret(selected, reversalMode);
      appendHistory(name, {
        cards: selected.map((s) => ({
          cardId: s.card.id,
          orientation: s.orientation,
          position: s.position,
        })),
        date: new Date().toISOString().slice(0, 10),
        spreadType: mode,
      });
      setPickerResult({ reading, spread: selected });
    },
    [mode, name, reversalMode],
  );

  // Auto-resolve for non-interactive mode
  const autoResolved = useMemo(
    () =>
      isInteractiveMode
        ? null
        : resolveSpread(mode, name, forceNew, reversalMode),
    [forceNew, isInteractiveMode, mode, name, reversalMode],
  );

  const displayName = name.charAt(0).toUpperCase() + name.slice(1);

  // Interactive mode: show picker until cards are selected
  if (isInteractiveMode && !pickerResult) {
    return (
      <Box flexDirection="column" gap={1}>
        <Box alignItems="center" flexDirection="column">
          <Text dimColor>{ORNAMENT}</Text>
          <Text bold color={theme.accent}>
            {def.title}
          </Text>
          <Text dimColor>
            A reading for <Text color={theme.accent}>{displayName}</Text>
          </Text>
          <Text dimColor italic>
            Choose your cards
          </Text>
        </Box>
        <CardPicker
          accentColor={theme.accent}
          onComplete={handlePickerComplete}
          positions={def.positions}
        />
      </Box>
    );
  }

  // Either auto-resolved or picker-selected
  const resolved = pickerResult ?? autoResolved!;

  return (
    <Reading
      animate={animate}
      cached={!pickerResult && (autoResolved?.cached ?? false)}
      def={def}
      displayName={displayName}
      mode={mode}
      reading={resolved.reading}
      spread={resolved.spread}
      startAfterCards={isInteractiveMode}
      theme={theme}
    />
  );
}

function Reading({
  animate,
  cached,
  def,
  displayName,
  mode,
  reading,
  spread,
  startAfterCards,
  theme,
}: ReadingProps) {
  const { exit } = useApp();
  const { stdout } = useStdout();
  const isSingleCard = def.cardCount === 1;
  const isMultiCard = !isSingleCard;
  const isYesNo = mode === "yes-no";
  const columns = stdout.columns ?? MAX_TEXT_WIDTH;
  const textWidth = Math.min(MAX_TEXT_WIDTH, columns);
  const borderedWidth = textWidth - 2;

  const { skip, visibility: v } = useAnimationController(reading, {
    cardCount: def.cardCount,
    skip: !animate,
    startAfterCards,
  });

  const isTTY = process.stdin.isTTY === true;

  useInput(
    () => {
      if (!v.done) skip();
    },
    { isActive: isTTY && !v.done },
  );

  useEffect(() => {
    if (v.done) {
      const id = setTimeout(() => exit(), 100);
      return () => clearTimeout(id);
    }
  }, [v.done, exit]);

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

      {isTTY && !v.done && v.header && (
        <Box justifyContent="center">
          <Text dimColor italic>
            press any key to skip
          </Text>
        </Box>
      )}
    </Box>
  );
}
