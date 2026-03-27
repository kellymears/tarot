#!/usr/bin/env node

import { render } from "ink";
import { userInfo } from "node:os";

import { App } from "./app.js";
import { resolve } from "./resolve.js";

const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const forceNew = process.argv.includes("--new");
const jsonMode = process.argv.includes("--json");
const name = args[0] ?? userInfo().username;

if (jsonMode) {
  const { reading, spread } = resolve(name, forceNew);
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
} else {
  render(<App forceNew={forceNew} name={name} />);
}
