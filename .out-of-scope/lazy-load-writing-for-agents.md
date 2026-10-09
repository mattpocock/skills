# Lazy-loading `writing-for-agents` in skills that judge agent-facing writing

`retro` loads `writing-for-agents` on every run, not only before it writes. Requests to defer that load until the skill edits a skill, an `AGENTS.md`/`CLAUDE.md` or a doc are out of scope.

## Why this is out of scope

`writing-for-agents` is more than a style guide. It defines what a no-op instruction is and what makes a good skill, and `retro` uses those definitions to judge the steering files it reads, before it writes anything. A retro that only reads and reports still needs it. Load it lazily and the No-ops and Skills candidates get judged with no yardstick.

## Prior requests

- #1238: "retro: load writing-for-agents only before writing" (closed)
