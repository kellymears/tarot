import type { NumericalPattern, SpreadCard } from "../types.js";

import { NUMBER_MEANING } from "../../constants.js";

export function detectNumericalPattern(
  spread: SpreadCard[],
): null | NumericalPattern {
  const numbers = spread.map((s) => s.card.number);

  const allMatch = numbers.every((n) => n === numbers[0]);
  if (allMatch) {
    return {
      detail: `All three cards carry the number ${numbers[0]}, amplifying the theme of ${meaningFor(numbers[0])}. This repetition is a signal — the lesson is being presented from every angle.`,
      type: "matching",
    };
  }

  const pairs = numbers.filter(
    (n, i) => numbers.indexOf(n) !== i || numbers.lastIndexOf(n) !== i,
  );
  if (pairs.length > 0) {
    const repeated = pairs[0];
    return {
      detail: `The number ${repeated} appears twice in this spread, underscoring a theme of ${meaningFor(repeated)} that threads through your reading.`,
      type: "matching",
    };
  }

  const sorted = [...numbers].sort((a, b) => a - b);
  if (sorted[2] - sorted[1] === 1 && sorted[1] - sorted[0] === 1) {
    const ascending = numbers[0] < numbers[1] && numbers[1] < numbers[2];
    const descending = numbers[0] > numbers[1] && numbers[1] > numbers[2];

    if (ascending) {
      return {
        detail: `The numbers ${numbers.join(", ")} form an ascending sequence — momentum is building. Each position carries you further along a clear trajectory.`,
        type: "ascending",
      };
    }
    if (descending) {
      return {
        detail: `The numbers ${numbers.join(", ")} descend in sequence — a winding down, a return to essentials. The energy is consolidating rather than expanding.`,
        type: "descending",
      };
    }
    return {
      detail: `The numbers ${sorted.join(", ")} form a consecutive sequence, suggesting a continuous thread of development across your reading.`,
      type: "sequential",
    };
  }

  return null;
}

const meaningFor = (n: number): string =>
  NUMBER_MEANING[n] ?? `the energy of ${n}`;
