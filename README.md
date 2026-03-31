# arcana

A tarot reading CLI built with [Ink](https://github.com/vadimdemedes/ink). Full 78-card deck with authored interpretations for every card, six spread types, elemental dignities, animated terminal output, and an MCP server for LLM integration.

## Getting started

```sh
npm install
npm run build
```

To make `arcana` available globally:

```sh
npm link
```

## Usage

```sh
arcana                    # three-card spread (defaults to OS username)
arcana kelly              # reading for "kelly"
arcana kelly --new        # force a fresh draw
arcana card               # single daily card
arcana yes-no             # yes/no oracle (upright = yes)
arcana five-card          # five-card cross
arcana horseshoe          # seven-card horseshoe
arcana celtic-cross       # ten-card celtic cross
arcana history            # browse past readings
```

Each person gets one reading per day per spread type. Running again shows the same cards. `--new` forces a fresh draw.

### Spreads

| Spread               | Cards | Positions                                                                                 |
| -------------------- | ----- | ----------------------------------------------------------------------------------------- |
| Three-Card (default) | 3     | past, present, future                                                                     |
| Daily Card           | 1     | present                                                                                   |
| Five-Card Cross      | 5     | above, past, present, future, below                                                       |
| Horseshoe            | 7     | past, present, future, self, environment, obstacle, outcome                               |
| Celtic Cross         | 10    | present, challenge, past, future, above, below, self, environment, hopes & fears, outcome |
| Yes or No            | 1     | upright = yes, reversed = no                                                              |

### Interactive mode

Pick your own cards from a shuffled pool. Arrow keys to navigate, Enter to select.

```sh
arcana -i
arcana kelly --interactive
```

### Reversal modes

Five ways to read reversed cards:

```sh
arcana --reversals opposite   # authored reversed passage (default)
arcana --reversals blocked    # upright meaning, blocked energy
arcana --reversals shadow     # upright meaning, shadow/unconscious framing
arcana --reversals weakened   # upright meaning, diminished intensity
arcana --reversals none       # ignore reversals entirely
```

### Color themes

```sh
arcana --theme default    # magenta/green palette
arcana --theme classic    # yellow/cyan palette
arcana --no-color         # disable color output
```

### Reading history

```sh
arcana history            # your history
arcana history kelly      # kelly's history
```

Shows past readings in reverse chronological order. With five or more readings, includes pattern analysis: most drawn card, suit dominance, and reversal rate.

### JSON output

For scripts and LLM integrations:

```sh
arcana kelly --json
arcana celtic-cross kelly --json --new
```

Returns the full reading as structured JSON: spread data, per-card interpretations, narrative text, and relational analysis.

## Interpretation engine

Every card has authored passages for each position and orientation. The engine layers three things on top of the individual card readings:

- **Elemental dignities** — adjacent cards interact through their elements. Fire and air strengthen each other; fire and water create tension.
- **Relational analysis** — suit dominance, arcana weight, court card clusters, numerical sequences, reversal patterns, and elemental balance across the spread.
- **Narrative synthesis** — a prose reading that ties the cards together with cross-position insights (past/future echoes, above/below tension, self/environment contrast).

## MCP server

An [MCP](https://modelcontextprotocol.io) server for LLM tool integration. Four tools over stdio:

| Tool              | Description                                                                   |
| ----------------- | ----------------------------------------------------------------------------- |
| `draw_reading`    | Draw a spread for a person. Supports all six spread types and reversal modes. |
| `get_card`        | Look up a card by ID or name with all interpretation passages.                |
| `list_cards`      | Browse the deck, filtered by arcana or suit.                                  |
| `reading_history` | Retrieve recent readings for a person.                                        |

### Running the MCP server

```sh
node dist/mcp.js
```

### Claude Code integration

The project includes a `.mcp.json` that Claude Code auto-discovers when working in this directory.

For global access, add to `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "arcana": {
      "command": "arcana-mcp"
    }
  }
}
```

(Requires `npm link` so `arcana-mcp` is on your PATH.)

### Tool schemas

**`draw_reading`**

```
Input:  { name: string, spread_type?: string, force_new?: boolean, reversal_mode?: string }
Output: { name, spread, reading: { cards, narrative, relational } }
```

**`get_card`**

```
Input:  { query: string }  // "major-00", "fool", "ten of cups"
Output: { card, interpretations: { upright: { past, present, future, ... }, reversed: { ... } } }
```

**`list_cards`**

```
Input:  { arcana?: "major" | "minor", suit?: "cups" | "pentacles" | "swords" | "wands" }
Output: TarotCard[]
```

**`reading_history`**

```
Input:  { name: string, limit?: number }
Output: Reading[]
```

## Data

Readings are stored in `$XDG_DATA_HOME/arcana/` (defaults to `~/.local/share/arcana/`), one JSON file per person per spread type, keyed by date. History is stored separately in `{name}.history.json`.

## Development

```sh
npm run dev     # watch mode
npm run build   # compile to dist/
npm start       # run the CLI
npm run lint    # eslint
npm run format  # prettier
```

## Stack

- [Ink](https://github.com/vadimdemedes/ink) — React for CLIs
- [React](https://react.dev) 19
- [MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk) — Model Context Protocol server
- [TypeScript](https://www.typescriptlang.org) (ESM, NodeNext resolution)
