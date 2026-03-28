import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

import type { Orientation, Position } from "./data/interpretations/types.js";

interface StoredCard {
  cardId: string;
  orientation: Orientation;
  position: Position;
}

interface StoredReading {
  date: string;
  spread: StoredCard[];
}

export function loadDaily(name: string): null | StoredCard[] {
  const path = filePath(name);
  if (!existsSync(path)) return null;

  try {
    const data: StoredReading = JSON.parse(readFileSync(path, "utf-8"));
    if (data.date !== today()) return null;
    return data.spread;
  } catch {
    return null;
  }
}

export function saveDaily(
  name: string,
  spread: Array<{
    cardId: string;
    orientation: Orientation;
    position: Position;
  }>,
): void {
  const dir = dataDir();
  mkdirSync(dir, { recursive: true });
  const data: StoredReading = { date: today(), spread };
  writeFileSync(filePath(name), JSON.stringify(data, null, 2) + "\n");
}

const dataDir = (): string => {
  const xdg =
    process.env["XDG_DATA_HOME"] ?? join(homedir(), ".local", "share");
  return join(xdg, "tarot");
};

const filePath = (name: string): string => {
  const safe = name.toLowerCase().replace(/[^a-z0-9-]/g, "-");
  return join(dataDir(), `${safe}.json`);
};

const today = (): string => new Date().toISOString().slice(0, 10);
