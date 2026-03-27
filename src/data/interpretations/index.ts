import { existsSync, readFileSync } from "node:fs";

import type {
  InterpretationFile,
  InterpretationMap,
  Orientation,
  Position,
} from "./types.js";

const FILES = [
  "major.json",
  "cups.json",
  "pentacles.json",
  "swords.json",
  "wands.json",
];

export function loadInterpretations(): InterpretationMap {
  const map: InterpretationMap = new Map();

  for (const file of FILES) {
    const url = new URL(`./${file}`, import.meta.url);
    if (!existsSync(url)) continue;

    const data: InterpretationFile = JSON.parse(readFileSync(url, "utf-8"));

    for (const [id, interp] of Object.entries(data)) {
      if (interp) map.set(id, interp);
    }
  }

  return map;
}

export function lookupPassage(
  map: InterpretationMap,
  cardId: string,
  position: Position,
  orientation: Orientation,
): string | undefined {
  const interp = map.get(cardId);
  if (!interp) return undefined;

  const orientationData = interp[orientation];
  if (!orientationData) return undefined;

  return orientationData[position]?.passage;
}
