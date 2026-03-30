#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { userInfo } from "node:os";

import type { ReversalMode } from "./data/interpretations/types.js";
import type { SpreadMode } from "./spreads.js";
import type { ThemeName } from "./theme.js";

import { SPREADS } from "./spreads.js";

const KNOWN_FLAGS = new Set([
  "--help",
  "--json",
  "--new",
  "--no-color",
  "--reversals",
  "--theme",
  "--version",
  "-h",
  "-v",
]);

const REVERSAL_MODES = new Set([
  "blocked",
  "none",
  "opposite",
  "shadow",
  "weakened",
]);

const SUBCOMMANDS = new Set(Object.keys(SPREADS).filter((k) => k !== "spread"));

const THEME_NAMES = new Set(["classic", "default"]);

const VALUE_FLAGS = new Set(["--reversals", "--theme"]);

const rawArgs = process.argv.slice(2);

// Extract value flag arguments so they aren't treated as unknown flags
const valueFlagArgs = new Set<number>();
for (let i = 0; i < rawArgs.length; i++) {
  if (VALUE_FLAGS.has(rawArgs[i]) && i + 1 < rawArgs.length) {
    valueFlagArgs.add(i + 1);
  }
}

const flags = new Set(
  rawArgs.filter((a, i) => a.startsWith("-") && !valueFlagArgs.has(i)),
);
const args = rawArgs.filter(
  (a, i) => !a.startsWith("-") && !valueFlagArgs.has(i),
);

const isHistory = args[0] === "history";
const mode: SpreadMode = SUBCOMMANDS.has(args[0])
  ? (args[0] as SpreadMode)
  : "spread";
const noColor =
  flags.has("--no-color") ||
  "NO_COLOR" in process.env ||
  process.env.TERM === "dumb";
const showHelp = flags.has("-h") || flags.has("--help");
const showVersion = flags.has("-v") || flags.has("--version");
const forceNew = flags.has("--new");
const jsonMode = flags.has("--json");

const reversalsIdx = rawArgs.indexOf("--reversals");
const reversalsArg =
  reversalsIdx !== -1 ? rawArgs[reversalsIdx + 1] : undefined;
if (reversalsArg !== undefined && !REVERSAL_MODES.has(reversalsArg)) {
  process.stderr.write(
    `Invalid reversal mode: "${reversalsArg}"\nValid modes: blocked, none, opposite, shadow, weakened\n`,
  );
  process.exit(1);
}
const reversalMode: ReversalMode =
  (reversalsArg as ReversalMode | undefined) ?? "opposite";

const themeIdx = rawArgs.indexOf("--theme");
const themeArg = themeIdx !== -1 ? rawArgs[themeIdx + 1] : undefined;
if (themeArg !== undefined && !THEME_NAMES.has(themeArg)) {
  process.stderr.write(
    `Invalid theme: "${themeArg}"\nValid themes: classic, default\n`,
  );
  process.exit(1);
}
const themeName: ThemeName = (themeArg as ThemeName | undefined) ?? "default";

const name =
  (isHistory ? args[1] : mode !== "spread" ? args[1] : args[0]) ??
  userInfo().username;

if (noColor) {
  process.env.NO_COLOR = "1";
}

for (const flag of flags) {
  if (!KNOWN_FLAGS.has(flag)) {
    process.stderr.write(
      `Unknown flag: ${flag}\nRun tarot --help for usage.\n`,
    );
    process.exit(1);
  }
}

if (showHelp) {
  process.stdout
    .write(`Tarot — draw a three-card spread and see what the cards have to say.

Usage:
  tarot                      Draw today's reading
  tarot luna                 Draw a reading for "luna"
  tarot card                 Draw a single card
  tarot card luna            Draw a single card for "luna"
  tarot celtic-cross         Draw a ten-card Celtic Cross spread
  tarot celtic-cross luna    Draw a Celtic Cross spread for "luna"
  tarot five-card            Draw a five-card cross spread
  tarot five-card luna       Draw a five-card cross spread for "luna"
  tarot horseshoe            Draw a seven-card horseshoe spread
  tarot horseshoe luna       Draw a horseshoe spread for "luna"
  tarot yes-no               Ask a yes-or-no question
  tarot yes-no luna          Ask a yes-or-no question for "luna"
  tarot history              Browse past readings
  tarot history luna         Browse past readings for "luna"
  tarot --new                Draw a fresh spread (ignore today's cache)
  tarot --json               Output the reading as JSON

Flags:
  -h, --help            Show this help
  -v, --version         Show version
      --new             Force a new spread for today
      --json            Output structured JSON instead of the animated reading
      --no-color        Disable color output
      --theme NAME      Color theme (default, classic)
      --reversals MODE  How to interpret reversed cards (default: opposite)
                        opposite  Use reversed passage (default behavior)
                        blocked   Upright meaning, framed as blocked energy
                        shadow    Upright meaning, framed as unconscious influence
                        weakened  Upright meaning, framed as diminished force
                        none      Ignore reversals — always use upright

https://github.com/kellymears/tarot
`);
} else if (showVersion) {
  const pkg = JSON.parse(
    readFileSync(new URL("../package.json", import.meta.url), "utf-8"),
  );
  process.stdout.write(`tarot ${pkg.version}\n`);
} else if (isHistory) {
  try {
    const { cards } = await import("./data/cards.js");
    const { MAJOR_SYMBOL, POSITION_LABELS, SUIT_SYMBOL } =
      await import("./constants.js");
    const { loadHistory } = await import("./store.js");

    const cardsById = new Map(cards.map((c) => [c.id, c]));
    const history = loadHistory(name);

    if (history.length === 0) {
      process.stdout.write(`No readings found for ${name}.\n`);
    } else {
      const entries = [...history].reverse();
      const lines: string[] = [];

      for (const entry of entries) {
        const d = new Date(entry.date + "T00:00:00");
        const dateStr = d.toLocaleDateString("en-US", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
        const spreadDef = SPREADS[entry.spreadType as SpreadMode];
        const spreadTitle = spreadDef?.title ?? entry.spreadType;
        lines.push(`${dateStr} — ${spreadTitle}`);

        for (const c of entry.cards) {
          const card = cardsById.get(c.cardId);
          if (!card) continue;

          const symbol = card.suit ? SUIT_SYMBOL[card.suit] : MAJOR_SYMBOL;
          const reversed = c.orientation === "reversed" ? " (reversed)" : "";
          const label =
            entry.cards.length > 1 ? `${POSITION_LABELS[c.position]}: ` : "";
          lines.push(`  ${label}${symbol} ${card.name}${reversed}`);
        }

        lines.push("");
      }

      // Pattern analysis for 5+ readings
      if (history.length >= 5) {
        const cardCounts = new Map<string, number>();
        const readingsWithSuit = new Map<string, Set<number>>();
        let reversals = 0;
        let total = 0;

        for (let i = 0; i < history.length; i++) {
          const entry = history[i];
          for (const c of entry.cards) {
            total++;
            const card = cardsById.get(c.cardId);
            if (!card) continue;
            cardCounts.set(card.name, (cardCounts.get(card.name) ?? 0) + 1);
            if (c.orientation === "reversed") reversals++;
            if (card.suit) {
              if (!readingsWithSuit.has(card.suit)) {
                readingsWithSuit.set(card.suit, new Set());
              }
              readingsWithSuit.get(card.suit)!.add(i);
            }
          }
        }

        lines.push("── Patterns ──");

        // Most drawn card
        let maxCard = "";
        let maxCount = 0;
        for (const [card, count] of cardCounts) {
          if (count > maxCount) {
            maxCard = card;
            maxCount = count;
          }
        }
        if (maxCount > 1) {
          lines.push(`  Most drawn: ${maxCard} (${maxCount} times)`);
        }

        // Dominant suit
        let maxSuit = "";
        let maxSuitReadings = 0;
        for (const [suit, readings] of readingsWithSuit) {
          if (readings.size > maxSuitReadings) {
            maxSuit = suit;
            maxSuitReadings = readings.size;
          }
        }
        if (maxSuit) {
          const suitName = maxSuit.charAt(0).toUpperCase() + maxSuit.slice(1);
          lines.push(
            `  Dominant suit: ${suitName} (appeared in ${maxSuitReadings}/${history.length} readings)`,
          );
        }

        // Reversal rate
        if (total > 0) {
          const rate = Math.round((reversals / total) * 100);
          lines.push(`  Reversal rate: ${rate}%`);
        }

        lines.push("");
      }

      process.stdout.write(lines.join("\n"));
    }
  } catch (err) {
    printError(err);
    process.exit(1);
  }
} else if (jsonMode) {
  try {
    const { resolveSpread } = await import("./resolve.js");
    const { reading, spread } = resolveSpread(
      mode,
      name,
      forceNew,
      reversalMode,
    );
    const output = {
      name,
      reading,
      spread: spread.map((sc) => ({
        card: sc.card,
        orientation: sc.orientation,
        position: sc.position,
      })),
    };
    process.stdout.write(JSON.stringify(output, null, 2) + "\n");
  } catch (err) {
    printError(err);
    process.exit(1);
  }
} else {
  try {
    const { render } = await import("ink");
    const { App } = await import("./app.js");
    const isTTY = process.stdout.isTTY === true;
    render(
      <App
        animate={isTTY}
        forceNew={forceNew}
        mode={mode}
        name={name}
        reversalMode={reversalMode}
        themeName={themeName}
      />,
    );
  } catch (err) {
    printError(err);
    process.exit(1);
  }
}

function printError(err: unknown): void {
  const message = err instanceof Error ? err.message : String(err);
  process.stderr.write(`Error: ${message}\n`);
  if (message.includes("EACCES") || message.includes("permission")) {
    process.stderr.write(
      `Hint: check file permissions on ~/.local/share/tarot/\n`,
    );
  }
}
