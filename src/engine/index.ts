import type { ReversalMode } from "../data/interpretations/types.js";
import type { FullReading, SpreadCard } from "./types.js";

import { loadInterpretations } from "../data/interpretations/index.js";
import { resolvePassages } from "./layer1.js";
import { analyzeRelations } from "./layer2.js";
import { assembleNarrative } from "./layer3.js";

const interpretations = loadInterpretations();

export function interpret(
  spread: SpreadCard[],
  reversalMode: ReversalMode = "opposite",
): FullReading {
  const cards = resolvePassages(spread, interpretations, reversalMode);
  const relational = analyzeRelations(spread);
  const narrative = assembleNarrative(cards, relational, spread);

  return { cards, narrative, relational };
}
