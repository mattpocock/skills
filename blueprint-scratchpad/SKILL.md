---
name: blueprint-scratchpad
description: Start the shaping period for a feature blueprint by fetching Linear project context, grilling the engineer on the full problem space, and producing a working scratchpad doc. Supports multi-session check-ins. Use when user wants to start a blueprint, begin shaping, has a new feature to blueprint, or provides a Linear project link.
---

# Blueprint Scratchpad

Shaping period tool. Fetches context from Linear and linked docs, then grills the engineer on the full problem space to produce a working scratchpad. Supports multiple check-in sessions as the engineer researches and iterates.

## Process

### 1. Gather context

The user provides a Linear project or ticket identifier.

1. Fetch the Linear project + all child/related tickets.
2. Scan descriptions and comments for links (Notion, Figma, Slack). Fetch each using MCP tools. For unsupported links (e.g., Google Docs), ask the user to paste the content.
3. Present a summary of everything gathered. Ask if anything is missing.
4. Ask where the user wants to keep working docs (local directory, private Notion page, or other location).

### 2. Grill the user

Walk through the full problem space. Cover one topic per exchange, with natural follow-ups allowed within a topic. Every topic is surfaced regardless of how much context was already gathered — provide a recommended answer from gathered context, then ask the user to confirm, correct, or expand.

See [grill-topics.md](grill-topics.md) for the full topic list and recommended questions.

### 3. Write incrementally

After each topic resolves, update the working doc immediately. Use these markers:
- `[DECIDED]` — resolved items with clear conclusions
- `[OPEN]` — unresolved items with homework notes
- `[REJECTED]` — alternatives considered and discarded, with reasoning

See [scratchpad-template.md](scratchpad-template.md) for the document structure.

### 4. Check-in mode (subsequent sessions)

When invoked on an existing scratchpad:
1. Read the current doc.
2. Summarize: "X items decided, Y still open."
3. Ask what the user has come back with.
4. Grill on new information, update the doc.
5. Surface new questions that arise from resolved items.

### 5. Exit

The user decides when to move to `blueprint-draft`. Flag critical open questions that would block blueprinting, but don't gate the transition.

## Conventions

- Codebase exploration only when the user directs it to specific code.
- Phasing context only if Linear already indicates a larger initiative.
- Writing tone: factual, concise. No emoji. No cheerful AI filler.
- No writes to shared systems (Notion, Linear) without explicit approval.
