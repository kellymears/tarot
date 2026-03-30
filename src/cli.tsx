#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { userInfo } from "node:os";

import type { ReversalMode } from "./data/interpretations/types.js";

const KNOWN_FLAGS = new Set([
  "--help",
  "--json",
  "--new",
  "--no-color",
  "--reversals",
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

const VALUE_FLAGS = new Set(["--reversals"]);

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

const mode =
  args[0] === "card"
    ? ("card" as const)
    : args[0] === "celtic-cross"
      ? ("celtic-cross" as const)
      : args[0] === "five-card"
        ? ("five-card" as const)
        : args[0] === "horseshoe"
          ? ("horseshoe" as const)
          : args[0] === "yes-no"
            ? ("yes-no" as const)
            : ("spread" as const);

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
const name =
  (mode === "card" ||
  mode === "celtic-cross" ||
  mode === "five-card" ||
  mode === "horseshoe" ||
  mode === "yes-no"
    ? args[1]
    : args[0]) ?? userInfo().username;

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
  tarot --new                Draw a fresh spread (ignore today's cache)
  tarot --json               Output the reading as JSON

Flags:
  -h, --help            Show this help
  -v, --version         Show version
      --new             Force a new spread for today
      --json            Output structured JSON instead of the animated reading
      --no-color        Disable color output
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
} else if (jsonMode) {
  try {
    const {
      resolve,
      resolveCard,
      resolveCelticCross,
      resolveFiveCard,
      resolveHorseshoe,
      resolveYesNo,
    } = await import("./resolve.js");
    const { reading, spread } =
      mode === "yes-no"
        ? resolveYesNo(name, forceNew, reversalMode)
        : mode === "card"
          ? resolveCard(name, forceNew, reversalMode)
          : mode === "celtic-cross"
            ? resolveCelticCross(name, forceNew, reversalMode)
            : mode === "five-card"
              ? resolveFiveCard(name, forceNew, reversalMode)
              : mode === "horseshoe"
                ? resolveHorseshoe(name, forceNew, reversalMode)
                : resolve(name, forceNew, reversalMode);
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
