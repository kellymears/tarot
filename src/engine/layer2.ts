import type { RelationalAnalysis, SpreadCard } from "./types.js";

import { analyzeDignities } from "./rules/dignities.js";
import { analyzeElementalBalance } from "./rules/elements.js";
import { detectNumericalPattern } from "./rules/numerology.js";
import {
  analyzeArcanaWeight,
  analyzeCourtCards,
  analyzeReversalPattern,
  analyzeSuitDominance,
} from "./rules/patterns.js";

export function analyzeRelations(spread: SpreadCard[]): RelationalAnalysis {
  return {
    arcanaWeight: analyzeArcanaWeight(spread),
    courtCards: analyzeCourtCards(spread),
    dignities: analyzeDignities(spread),
    elementalBalance: analyzeElementalBalance(spread),
    numericalPattern: detectNumericalPattern(spread),
    reversalPattern: analyzeReversalPattern(spread),
    suitDominance: analyzeSuitDominance(spread),
  };
}
