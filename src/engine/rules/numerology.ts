import type { NumericalPattern, SpreadCard } from "../types.js";

import { NUMBER_MEANING } from "../../constants.js";

export function detectNumericalPattern(
  spread: SpreadCard[],
): null | NumericalPattern {
  const numbers = spread.map((s) => s.card.number);

  if (numbers.length < 2) return null;

  const allMatch = numbers.every((n) => n === numbers[0]);
  if (allMatch && numbers.length >= 2) {
    return {
      detail:
        numbers.length === 2
          ? `Both cards carry the number ${numbers[0]}, amplifying the theme of ${meaningFor(numbers[0])}. This mirroring is a signal — the lesson is being presented from both angles.`
          : `Multiple cards carry the number ${numbers[0]}, amplifying the theme of ${meaningFor(numbers[0])}. This repetition is a signal — the lesson is being presented from every angle.`,
      type: "matching",
    };
  }

  const counts = new Map<number, number>();
  for (const n of numbers) {
    counts.set(n, (counts.get(n) ?? 0) + 1);
  }
  for (const [num, count] of counts) {
    if (count >= 2) {
      return {
        detail:
          count === 2
            ? `The number ${num} appears twice in this spread, underscoring a theme of ${meaningFor(num)} that threads through your reading.`
            : `The number ${num} appears ${count} times in this spread, strongly underscoring a theme of ${meaningFor(num)} that threads through your reading.`,
        type: "matching",
      };
    }
  }

  const sorted = [...numbers].sort((a, b) => a - b);
  const isConsecutive =
    sorted.length >= 3 &&
    sorted.every((n, i) => i === 0 || n - sorted[i - 1] === 1);

  if (isConsecutive) {
    const ascending = numbers.every((n, i) => i === 0 || n > numbers[i - 1]);
    const descending = numbers.every((n, i) => i === 0 || n < numbers[i - 1]);

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
