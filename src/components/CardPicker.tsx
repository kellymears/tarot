import { Box, Text, useInput } from "ink";
import { useState } from "react";

import type { TarotCard } from "../data/cards.js";
import type { Orientation, Position } from "../data/interpretations/types.js";
import type { SpreadCard } from "../engine/types.js";

import { cards } from "../data/cards.js";
import { Card } from "./Card.js";
import { CardBack } from "./CardBack.js";

interface CardPickerProps {
  accentColor: string;
  onComplete: (selected: SpreadCard[]) => void;
  positions: Position[];
}

interface Selection {
  index: number;
  orientation: Orientation;
}

const POOL_SIZE = 7;

const shuffle = <T,>(array: T[]): T[] => {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const POSITION_LABELS: Record<string, string> = {
  above: "Above",
  below: "Below",
  challenge: "Challenge",
  environment: "Environment",
  future: "Future",
  "hopes-fears": "Hopes & Fears",
  obstacle: "Obstacle",
  outcome: "Outcome",
  past: "Past",
  present: "Present",
  self: "Self",
};

export function CardPicker({
  accentColor,
  onComplete,
  positions,
}: CardPickerProps) {
  const [cursor, setCursor] = useState(0);
  const [pool] = useState<TarotCard[]>(() =>
    shuffle(cards).slice(0, POOL_SIZE),
  );
  const [selected, setSelected] = useState<Selection[]>([]);
  const picking = selected.length < positions.length;

  useInput(
    (_input, key) => {
      if (key.leftArrow) {
        setCursor((c) => Math.max(0, c - 1));
      }
      if (key.rightArrow) {
        setCursor((c) => Math.min(pool.length - 1, c + 1));
      }
      if (key.return && !selected.some((s) => s.index === cursor)) {
        const orientation: Orientation =
          Math.random() < 0.5 ? "reversed" : "upright";
        const newSelected = [...selected, { index: cursor, orientation }];
        setSelected(newSelected);
        if (newSelected.length >= positions.length) {
          const spread: SpreadCard[] = newSelected.map((s, i) => ({
            card: pool[s.index],
            orientation: s.orientation,
            position: positions[i],
          }));
          onComplete(spread);
        }
      }
    },
    { isActive: picking },
  );

  return (
    <Box alignItems="center" flexDirection="column" gap={1}>
      <Box flexDirection="row" gap={1} justifyContent="center">
        {pool.map((card, i) => {
          const selIdx = selected.findIndex((s) => s.index === i);
          if (selIdx !== -1) {
            return (
              <Box alignItems="center" flexDirection="column" key={card.id}>
                <Text bold color={accentColor}>
                  {POSITION_LABELS[positions[selIdx]] ?? positions[selIdx]}
                </Text>
                <Card
                  card={card}
                  color={accentColor}
                  reversed={selected[selIdx].orientation === "reversed"}
                />
              </Box>
            );
          }
          const isFocused = cursor === i;
          return (
            <Box alignItems="center" flexDirection="column" key={card.id}>
              {isFocused ? (
                <Text bold color={accentColor}>
                  {"  \u25BC"}
                </Text>
              ) : (
                <Text> </Text>
              )}
              <CardBack color={isFocused ? accentColor : "gray"} />
            </Box>
          );
        })}
      </Box>
      {picking && (
        <Text dimColor>
          {"\u2190 \u2192 to move \u00B7 Enter to select \u00B7 "}
          {positions.length - selected.length} remaining
        </Text>
      )}
    </Box>
  );
}
