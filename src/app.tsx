import { Box, useApp, useInput, useStdout } from "ink";
import { useEffect, useState } from "react";

import { AnimatedCard } from "./components/AnimatedCard.js";
import { RelationalInsight } from "./components/RelationalInsight.js";
import { Text } from "./components/Text.js";
import { Typewriter } from "./components/Typewriter.js";
import {
  MAJOR_SYMBOL,
  MAX_TEXT_WIDTH,
  ORNAMENT,
  POSITION_LABELS,
  POSITION_SUBTITLES,
  SUIT_COLOR,
  SUIT_SYMBOL,
} from "./constants.js";
import { useAnimationController } from "./hooks/useAnimationController.js";
import {
  resolve,
  resolveCard,
  resolveFiveCard,
  resolveHorseshoe,
  resolveYesNo,
} from "./resolve.js";

interface AppProps {
  animate: boolean;
  forceNew: boolean;
  mode: "card" | "five-card" | "horseshoe" | "spread" | "yes-no";
  name: string;
}

export function App({ animate, forceNew, mode, name }: AppProps) {
  const { exit } = useApp();
  const { stdout } = useStdout();
  const isCard = mode === "card";
  const isFiveCard = mode === "five-card";
  const isHorseshoe = mode === "horseshoe";
  const isYesNo = mode === "yes-no";
  const isSingleCard = isCard || isYesNo;
  const isMultiCard = !isSingleCard;
  const cardCount: 1 | 3 | 5 | 7 = isHorseshoe
    ? 7
    : isFiveCard
      ? 5
      : isSingleCard
        ? 1
        : 3;
  const columns = stdout.columns ?? MAX_TEXT_WIDTH;
  const textWidth = Math.min(MAX_TEXT_WIDTH, columns);
  const borderedWidth = textWidth - 2;

  const [{ cached, reading, spread }] = useState(() =>
    isYesNo
      ? resolveYesNo(name, forceNew)
      : isCard
        ? resolveCard(name, forceNew)
        : isFiveCard
          ? resolveFiveCard(name, forceNew)
          : isHorseshoe
            ? resolveHorseshoe(name, forceNew)
            : resolve(name, forceNew),
  );
  const { skip, visibility: v } = useAnimationController(reading, {
    cardCount,
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
          <Text bold color="magenta">
            {isYesNo
              ? "Yes or No?"
              : isCard
                ? "Daily Card"
                : isFiveCard
                  ? "Five-Card Cross"
                  : isHorseshoe
                    ? "Horseshoe Spread"
                    : "Three-Card Spread"}
          </Text>
          <Text dimColor>
            A reading for <Text color="magenta">{displayName}</Text>
          </Text>
          {isMultiCard && (
            <Text dimColor>
              {isFiveCard
                ? "Above · Past · Present · Future · Below"
                : isHorseshoe
                  ? "Past · Present · Future · Self · Environment · Obstacle · Outcome"
                  : "Past · Present · Future"}
            </Text>
          )}
          {cached && (
            <Text dimColor italic>
              {dateLabel}
            </Text>
          )}
        </Box>
      )}

      {isFiveCard ? (
        <Box alignItems="center" flexDirection="column" gap={1}>
          {/* Row 1: Above (spread[3]) */}
          <Box justifyContent="center">
            <Box alignItems="center" flexDirection="column">
              {v.cards[3] !== "hidden" && (
                <Text bold dimColor>
                  {POSITION_LABELS[spread[3].position]}
                </Text>
              )}
              <AnimatedCard
                card={spread[3].card}
                reversed={spread[3].orientation === "reversed"}
                state={v.cards[3]}
              />
            </Box>
          </Box>
          {/* Row 2: Past (spread[1]), Present (spread[0]), Future (spread[2]) */}
          <Box flexDirection="row" gap={1} justifyContent="center">
            {[1, 0, 2].map((idx) => (
              <Box
                alignItems="center"
                flexDirection="column"
                key={spread[idx].card.id}
              >
                {v.cards[idx] !== "hidden" && (
                  <Text bold dimColor>
                    {POSITION_LABELS[spread[idx].position]}
                  </Text>
                )}
                <AnimatedCard
                  card={spread[idx].card}
                  reversed={spread[idx].orientation === "reversed"}
                  state={v.cards[idx]}
                />
              </Box>
            ))}
          </Box>
          {/* Row 3: Below (spread[4]) */}
          <Box justifyContent="center">
            <Box alignItems="center" flexDirection="column">
              {v.cards[4] !== "hidden" && (
                <Text bold dimColor>
                  {POSITION_LABELS[spread[4].position]}
                </Text>
              )}
              <AnimatedCard
                card={spread[4].card}
                reversed={spread[4].orientation === "reversed"}
                state={v.cards[4]}
              />
            </Box>
          </Box>
        </Box>
      ) : isHorseshoe ? (
        <Box alignItems="center" flexDirection="column" gap={1}>
          {/* Row 1: Past, Present, Future */}
          <Box flexDirection="row" gap={1} justifyContent="center">
            {[0, 1, 2].map((idx) => (
              <Box
                alignItems="center"
                flexDirection="column"
                key={spread[idx].card.id}
              >
                {v.cards[idx] !== "hidden" && (
                  <Text bold dimColor>
                    {POSITION_LABELS[spread[idx].position]}
                  </Text>
                )}
                <AnimatedCard
                  card={spread[idx].card}
                  reversed={spread[idx].orientation === "reversed"}
                  state={v.cards[idx]}
                />
              </Box>
            ))}
          </Box>
          {/* Row 2: Self, Environment */}
          <Box flexDirection="row" gap={1} justifyContent="center">
            {[3, 4].map((idx) => (
              <Box
                alignItems="center"
                flexDirection="column"
                key={spread[idx].card.id}
              >
                {v.cards[idx] !== "hidden" && (
                  <Text bold dimColor>
                    {POSITION_LABELS[spread[idx].position]}
                  </Text>
                )}
                <AnimatedCard
                  card={spread[idx].card}
                  reversed={spread[idx].orientation === "reversed"}
                  state={v.cards[idx]}
                />
              </Box>
            ))}
          </Box>
          {/* Row 3: Obstacle, Outcome */}
          <Box flexDirection="row" gap={1} justifyContent="center">
            {[5, 6].map((idx) => (
              <Box
                alignItems="center"
                flexDirection="column"
                key={spread[idx].card.id}
              >
                {v.cards[idx] !== "hidden" && (
                  <Text bold dimColor>
                    {POSITION_LABELS[spread[idx].position]}
                  </Text>
                )}
                <AnimatedCard
                  card={spread[idx].card}
                  reversed={spread[idx].orientation === "reversed"}
                  state={v.cards[idx]}
                />
              </Box>
            ))}
          </Box>
        </Box>
      ) : (
        <Box
          flexDirection="row"
          flexWrap="wrap"
          gap={1}
          justifyContent="center"
        >
          {spread.slice(0, cardCount).map((sc, i) => (
            <Box alignItems="center" flexDirection="column" key={sc.card.id}>
              {isMultiCard && v.cards[i] !== "hidden" && (
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
      )}

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
                color={spread[0].orientation === "upright" ? "green" : "red"}
              >
                {spread[0].orientation === "upright" ? "Yes" : "No"}
              </Text>
            </Box>
          )}

          {reading.cards.slice(0, cardCount).map((cardReading, i) => {
            if (!v.sections[i].visible) return null;

            const sc = spread[i];
            const color = sc.card.suit ? SUIT_COLOR[sc.card.suit] : "magenta";
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
              analysis={reading.relational}
              textWidth={textWidth}
            />
          )}

          {isMultiCard && v.synthesis.visible && (
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
                <Text bold color="magenta" textWidth={textWidth}>
                  {reading.narrative.closing}
                </Text>
              </Typewriter>
              <Box justifyContent="center">
                <Text dimColor>{ORNAMENT}</Text>
              </Box>
              {cached && (
                <Text dimColor italic>
                  {isYesNo
                    ? "tarot yes-no --new for a fresh draw · tarot yes-no --json for data"
                    : isCard
                      ? "tarot card --new for a fresh draw · tarot --json for data"
                      : isFiveCard
                        ? "tarot five-card --new for a fresh spread · tarot five-card --json for data"
                        : isHorseshoe
                          ? "tarot horseshoe --new for a fresh spread · tarot horseshoe --json for data"
                          : "tarot --new for a fresh spread · tarot --json for data"}
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
