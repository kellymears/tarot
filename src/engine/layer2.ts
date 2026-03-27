import type { RelationalAnalysis, SpreadCard } from "./types.js";

import { analyzeDignities } from "./rules/dignities.js";
import { detectNumericalPattern } from "./rules/numerology.js";
import {
  analyzeArcanaWeight,
  analyzeReversalPattern,
  analyzeSuitDominance,
} from "./rules/patterns.js";

export function analyzeRelations(spread: SpreadCard[]): RelationalAnalysis {
  return {
    arcanaWeight: analyzeArcanaWeight(spread),
    dignities: analyzeDignities(spread),
    numericalPattern: detectNumericalPattern(spread),
    reversalPattern: analyzeReversalPattern(spread),
    suitDominance: analyzeSuitDominance(spread),
  };
}
