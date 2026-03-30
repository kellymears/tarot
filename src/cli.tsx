#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { userInfo } from "node:os";

const KNOWN_FLAGS = new Set([
  "--help",
  "--json",
  "--new",
  "--no-color",
  "--version",
  "-h",
  "-v",
]);

const flags = new Set(process.argv.slice(2).filter((a) => a.startsWith("-")));
const args = process.argv.slice(2).filter((a) => !a.startsWith("-"));

const mode = args[0] === "card" ? ("card" as const) : ("spread" as const);

const noColor =
  flags.has("--no-color") ||
  "NO_COLOR" in process.env ||
  process.env.TERM === "dumb";
const showHelp = flags.has("-h") || flags.has("--help");
const showVersion = flags.has("-v") || flags.has("--version");
const forceNew = flags.has("--new");
const jsonMode = flags.has("--json");
const name = (mode === "card" ? args[1] : args[0]) ?? userInfo().username;

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
  tarot                 Draw today's reading
  tarot luna            Draw a reading for "luna"
  tarot card            Draw a single card
  tarot card luna       Draw a single card for "luna"
  tarot --new           Draw a fresh spread (ignore today's cache)
  tarot --json          Output the reading as JSON

Flags:
  -h, --help            Show this help
  -v, --version         Show version
      --new             Force a new spread for today
      --json            Output structured JSON instead of the animated reading
      --no-color        Disable color output

https://github.com/kellymears/tarot
`);
} else if (showVersion) {
  const pkg = JSON.parse(
    readFileSync(new URL("../package.json", import.meta.url), "utf-8"),
  );
  process.stdout.write(`tarot ${pkg.version}\n`);
} else if (jsonMode) {
  try {
    const { resolve, resolveCard } = await import("./resolve.js");
    const { reading, spread } =
      mode === "card" ? resolveCard(name, forceNew) : resolve(name, forceNew);
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
    render(<App animate={isTTY} forceNew={forceNew} mode={mode} name={name} />);
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
