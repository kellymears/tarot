#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { cards } from "./data/cards.js";
import { loadInterpretations } from "./data/interpretations/index.js";
import { resolve } from "./resolve.js";

const interpretations = loadInterpretations();

const server = new McpServer({
  name: "tarot",
  version: "0.0.0",
});

server.tool(
  "draw_reading",
  "Draw a three-card tarot reading (past/present/future) for a person. Returns the cached daily reading unless force_new is true. Each person gets one reading per day.",
  {
    force_new: z
      .boolean()
      .optional()
      .default(false)
      .describe("Force a fresh draw, ignoring today's cache"),
    name: z.string().describe("Name of the person to read for"),
  },
  async ({ force_new, name }) => {
    const { reading, spread } = resolve(name, force_new);
    return {
      content: [
        {
          text: JSON.stringify(
            {
              name,
              reading,
              spread: spread.map((sc) => ({
                card: sc.card,
                orientation: sc.orientation,
                position: sc.position,
              })),
            },
            null,
            2,
          ),
          type: "text" as const,
        },
      ],
    };
  },
);

server.tool(
  "get_card",
  "Look up a specific tarot card by ID or name. Returns card metadata and all interpretation passages across every position and orientation.",
  {
    query: z
      .string()
      .describe(
        'Card ID (e.g. "major-00") or partial name (e.g. "fool", "ten of cups")',
      ),
  },
  async ({ query }) => {
    const q = query.toLowerCase();
    const card =
      cards.find((c) => c.id === q) ??
      cards.find((c) => c.name.toLowerCase().includes(q));

    if (!card) {
      return {
        content: [
          { text: `No card found matching "${query}"`, type: "text" as const },
        ],
        isError: true,
      };
    }

    const interp = interpretations.get(card.id) ?? null;
    return {
      content: [
        {
          text: JSON.stringify({ card, interpretations: interp }, null, 2),
          type: "text" as const,
        },
      ],
    };
  },
);

server.tool(
  "list_cards",
  "List cards in the tarot deck. Filter by arcana type or suit.",
  {
    arcana: z
      .enum(["major", "minor"])
      .optional()
      .describe("Filter by arcana type"),
    suit: z
      .enum(["cups", "pentacles", "swords", "wands"])
      .optional()
      .describe("Filter by suit (minor arcana only)"),
  },
  async ({ arcana, suit }) => {
    let filtered = cards;
    if (arcana) filtered = filtered.filter((c) => c.arcana === arcana);
    if (suit) filtered = filtered.filter((c) => c.suit === suit);
    return {
      content: [
        {
          text: JSON.stringify(filtered, null, 2),
          type: "text" as const,
        },
      ],
    };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
