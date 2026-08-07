---
"mattpocock-skills": patch
---

Flatten `skills/` so the repo conforms to the [Agent Plugins 1.0](https://agent-plugins.org/) standard, which reads only the immediate children of `skills/` and can't be pointed anywhere else.

Nothing changes for installed users: same plugin name, same 25 skills, same slash commands, same install commands. **Source paths moved**, so anything pinning a `skills/engineering/…` or `skills/productivity/…` path needs updating.

- Promoted skills are now flat at `skills/<name>/`. Which folder a skill lives in is the only thing that decides whether it ships.
- `in-progress/` → `drafts/`, `misc/` → `extras/`, both outside `skills/`. `deprecated/` is deleted; it was empty.
- New `plugin.json` at the repo root — the Agent Plugins 1.0 manifest, read by Codex, Cursor and Copilot.
- `.claude-plugin/plugin.json` keeps serving Claude Code, which doesn't implement the standard yet, and loses its 25-entry `skills` array.
- `npx skills@latest add mattpocock/skills` now offers the promoted 25 only. It was quietly offering all 35, drafts included.

The reasoning, and the generated-package approach we rejected, are in [ADR 0003](https://github.com/mattpocock/skills/blob/main/.agents/adr/0003-flat-skills-tree-for-agent-plugins.md).
