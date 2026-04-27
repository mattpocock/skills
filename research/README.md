# Research

Research notes informing the infrastructure plan for this repo.

- [superpowers.md](./superpowers.md) — `obra/superpowers`: a single skill bundle that ships as Claude Code, Codex App, Cursor, OpenCode, and Gemini plugins simultaneously by colocating manifests at the repo root. Themed grouping happens in a _separate_ curation repo (`obra/superpowers-marketplace`), not as a monorepo.
- [marketingskills.md](./marketingskills.md) — `coreyhaines31/marketingskills`: minimalist single-plugin marketplace, zero npm deps, all codegen via Node stdlib + bash. Notable patterns: `evals/evals.json` per skill, `VERSIONS.md` auto-update protocol, sync-skills.js GHA that auto-rewrites the marketplace and README on push.

## Cross-cutting takeaways

| Goal                 | superpowers                                                            | marketingskills                           | Implication                                                                                                                                                                   |
| -------------------- | ---------------------------------------------------------------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npx skills add`     | not used                                                               | first-class                               | "Just be SKILL.md-spec compliant under `skills/`" — no work                                                                                                                   |
| Claude Code plugins  | `.claude-plugin/` at root, themed groups via separate marketplace repo | single-plugin marketplace                 | Neither models a multi-plugin monorepo. Matt's plan (multiple plugins under `plugins/<name>/`, one marketplace.json listing them with `source: "./plugins/<name>"`) is novel. |
| Codex plugins        | `.codex-plugin/plugin.json` (Codex App) + `.codex/INSTALL.md` (CLI)    | implicit via AGENTS.md only               | If Matt wants Codex App marketplace presence, copy superpowers' `.codex-plugin/`. If just CLI, AGENTS.md suffices.                                                            |
| Docs site            | none                                                                   | none                                      | No prior art — Matt would be the first.                                                                                                                                       |
| Build tooling        | bash + jq, no package.json scripts                                     | Node stdlib + bash, no deps               | Both prove you don't need a build pipeline. Multi-plugin assembly may change that.                                                                                            |
| SKILL.md frontmatter | `name`, `description` only                                             | `name`, `description`, `metadata.version` | Keep it minimal.                                                                                                                                                              |
