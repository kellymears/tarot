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

export function loadDaily(name: string, suffix = ""): null | StoredCard[] {
  return readStore(filePath(name, suffix));
}

export function saveDaily(
  name: string,
  spread: StoredCard[],
  suffix = "",
): void {
  writeStore(filePath(name, suffix), spread);
}

const readStore = (path: string): null | StoredCard[] => {
  if (!existsSync(path)) return null;

  try {
    const data: StoredReading = JSON.parse(readFileSync(path, "utf-8"));
    if (data.date !== today()) return null;
    return data.spread;
  } catch {
    return null;
  }
};

const writeStore = (path: string, spread: StoredCard[]): void => {
  const dir = dataDir();
  mkdirSync(dir, { recursive: true });
  const data: StoredReading = { date: today(), spread };
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
};

const dataDir = (): string => {
  const xdg =
    process.env["XDG_DATA_HOME"] ?? join(homedir(), ".local", "share");
  return join(xdg, "tarot");
};

const safeName = (name: string): string =>
  name.toLowerCase().replace(/[^a-z0-9-]/g, "-");

const filePath = (name: string, suffix: string): string => {
  const base = safeName(name);
  return join(dataDir(), suffix ? `${base}.${suffix}.json` : `${base}.json`);
};

const today = (): string => new Date().toISOString().slice(0, 10);
