# tarot

A tarot CLI built with [Ink](https://github.com/vadimdemedes/ink). Draws a three-card spread (past, present, future) with authored interpretations for all 78 cards, relational analysis between cards, and animated terminal output.

## Getting started

```sh
npm install
npm run build
```

To make `tarot` available globally:

```sh
npm link
```

## Usage

```sh
tarot              # daily reading (defaults to your OS username)
tarot caitlyn      # reading for "caitlyn"
tarot caitlyn --new  # force a fresh draw for "caitlyn"
```

Each person gets one reading per day. Running again shows the same cards. Use `--new` to draw fresh.

### JSON output

For scripts and LLM integrations, `--json` outputs the full reading as structured JSON:

```sh
tarot kelly --json
tarot kelly --json --new
```

Returns a JSON object with:

- `name` — the querent
- `spread` — the three drawn cards with metadata, orientation, and position
- `reading.cards` — per-card interpretive passages
- `reading.narrative` — opening, synthesis, and closing text
- `reading.relational` — elemental dignities, numerical patterns, arcana weight, suit dominance, reversal analysis

## MCP server

An [MCP](https://modelcontextprotocol.io) server is included for LLM tool integration. It exposes three tools over stdio:

| Tool           | Description                                                    |
| -------------- | -------------------------------------------------------------- |
| `draw_reading` | Draw a daily three-card spread for a person. Cached per day.   |
| `get_card`     | Look up a card by ID or name with all interpretation passages. |
| `list_cards`   | Browse the deck, optionally filtered by arcana or suit.        |

### Running the MCP server

```sh
node dist/mcp.js
```

### Claude Code integration

The project includes a `.mcp.json` that Claude Code auto-discovers when working in this directory. The `tarot` MCP server will appear in your available tools.

For global access, add to `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "tarot": {
      "command": "tarot-mcp"
    }
  }
}
```

(Requires `npm link` so `tarot-mcp` is on your PATH.)

### Tool schemas

**`draw_reading`**

```
Input:  { name: string, force_new?: boolean }
Output: { name, spread: [{ card, orientation, position }], reading: { cards, narrative, relational } }
```

**`get_card`**

```
Input:  { query: string }  // "major-00", "fool", "ten of cups"
Output: { card, interpretations: { upright: { past, present, future }, reversed: { ... } } }
```

**`list_cards`**

```
Input:  { arcana?: "major" | "minor", suit?: "cups" | "pentacles" | "swords" | "wands" }
Output: TarotCard[]
```

## Data

Readings are stored in `$XDG_DATA_HOME/tarot/` (defaults to `~/.local/share/tarot/`), one JSON file per person, keyed by date.

## Development

Watch mode recompiles on file changes:

```sh
npm run dev
```

## Scripts

| Script                 | Description                   |
| ---------------------- | ----------------------------- |
| `npm run build`        | Compile TypeScript to `dist/` |
| `npm run dev`          | Watch mode                    |
| `npm start`            | Run the CLI                   |
| `npm run start:mcp`    | Run the MCP server            |
| `npm run lint`         | Run ESLint                    |
| `npm run format`       | Format with Prettier          |
| `npm run format:check` | Check formatting              |

## Stack

- [Ink](https://github.com/vadimdemedes/ink) — React for CLIs
- [React](https://react.dev) 19
- [MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk) — Model Context Protocol server
- [TypeScript](https://www.typescriptlang.org) (ESM, NodeNext resolution)
- [ESLint](https://eslint.org) with [perfectionist](https://perfectionist.dev) plugin
- [Prettier](https://prettier.io)
