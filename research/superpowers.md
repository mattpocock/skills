# Research: `obra/superpowers`

A single plugin/skills bundle that ships itself as a Claude Code plugin, a Codex plugin, a Cursor plugin, an OpenCode plugin, and a Gemini extension *simultaneously* by colocating every harness's manifest at the repo root.

## Repo structure

```
.claude-plugin/      marketplace.json + plugin.json (Claude Code)
.codex-plugin/       plugin.json (Codex App)
.codex/              INSTALL.md (Codex CLI bootstrap docs)
.cursor-plugin/      plugin.json (Cursor)
.opencode/           INSTALL.md + plugins/superpowers.js (OpenCode)
gemini-extension.json (Gemini CLI)
agents/              code-reviewer.md
commands/            brainstorm.md, execute-plan.md, write-plan.md
hooks/               hooks.json, hooks-cursor.json, run-hook.cmd, session-start
skills/              14 top-level SKILL.md folders (FLAT, not nested)
docs/                handwritten markdown — README.codex.md, README.opencode.md, plans/, specs/
scripts/             bump-version.sh, sync-to-codex-plugin.sh
tests/               brainstorm-server, claude-code, codex-plugin-sync, opencode, skill-triggering, subagent-driven-dev
assets/              icons, logos
package.json, AGENTS.md, CLAUDE.md, GEMINI.md, RELEASE-NOTES.md
```

No `dist/`, no `plugins/` subdir, no nested skills. All skills live at `skills/<kebab-name>/SKILL.md` (14 of them). Skills can have sibling reference files or a `references/` subdir.

## Plugin packaging — multi-harness, not multi-plugin

The repo ships **one logical plugin packaged six ways**:

- **Claude Code**: `.claude-plugin/plugin.json` + `.claude-plugin/marketplace.json` (the marketplace declares a single plugin named `superpowers` with `"source": "./"`, so the repo *is* its own dev marketplace).
- **Codex App**: `.codex-plugin/plugin.json` — much richer than the Claude one, includes an `interface` block (`displayName`, `shortDescription`, `defaultPrompt`, `brandColor`, `composerIcon`, `logo`, `category: "Coding"`).
- **Cursor**: `.cursor-plugin/plugin.json` — declares `skills`, `agents`, `commands`, `hooks: ./hooks/hooks-cursor.json`.
- **OpenCode**: `.opencode/plugins/superpowers.js` — a real JS module that injects bootstrap context via system-prompt transform and parses SKILL.md frontmatter at runtime.
- **Codex CLI**: install via `git clone` + `ln -s skills ~/.agents/skills/superpowers` (no plugin manifest, uses native skill discovery).
- **Gemini CLI**: `gemini-extension.json` with `contextFileName: "GEMINI.md"`.

The **separate marketplace repo** `obra/superpowers-marketplace` is where themed grouping happens. Its `.claude-plugin/marketplace.json` lists 7 plugins by remote git URL: `superpowers`, `superpowers-chrome`, `elements-of-style`, `episodic-memory`, `superpowers-lab`, `superpowers-developing-for-claude-code`, `superpowers-dev`. Each entry is `{name, source: {source: "url", url}, description, version, strict: true}`. So the marketplace is a thin curation layer pointing at independent plugin repos — **no monorepo, no themed sub-plugins inside one repo**.

## Build tooling

`package.json` is minimal — just `name`, `version`, `type: "module"`, `main` pointing at the OpenCode plugin file. **No scripts, no dependencies, no build step, no TypeScript.** Manifests are handwritten and kept in sync by a custom version-bump tool.

Two interesting scripts:

1. **`scripts/bump-version.sh`** — driven by `.version-bump.json`, which lists every file containing a version field (`package.json`, `.claude-plugin/plugin.json`, `.cursor-plugin/plugin.json`, `.codex-plugin/plugin.json`, `.claude-plugin/marketplace.json` at `plugins.0.version`, `gemini-extension.json`). Has `--check` (drift detection) and `--audit` (greps repo for stale version strings). Pure bash + jq.

2. **`scripts/sync-to-codex-plugin.sh`** — ~300-line bash tool that rsyncs the upstream tree into a fork (`prime-radiant-inc/openai-codex-plugins/plugins/superpowers/`), opens a PR via `gh`. Has `--dry-run`, `--bootstrap`, `--local`. Deterministic: same upstream SHA → identical PR diff. This is how the Codex App marketplace gets updated.

## Installation story

**No `npx` installer of its own.** Installation is per-harness:

- Claude Code: `/plugin marketplace add obra/superpowers-marketplace` then `/plugin install superpowers@superpowers-marketplace`, OR Anthropic's official marketplace `/plugin install superpowers@claude-plugins-official`.
- Codex App: search & install via in-app plugin UI.
- Codex CLI: clone + symlink (manual).
- Cursor: `/add-plugin superpowers`.
- OpenCode: tell agent to fetch `INSTALL.md`.
- Gemini: `gemini extensions install https://github.com/obra/superpowers`.
- Copilot CLI: `copilot plugin marketplace add obra/superpowers-marketplace`.

Vercel-labs/skills is **not mentioned anywhere**.

## Docs site

**There is no docs site.** No Docusaurus/Nextra/Astro/Starlight, no GitHub Pages (`has_pages: false`). `docs/` is a flat folder of handwritten markdown plus design specs dated YYYY-MM-DD. All discovery happens via the README plus per-harness INSTALL.md files.

## CI / release

`.github/` contains only `FUNDING.yml`, `ISSUE_TEMPLATE/`, and `PULL_REQUEST_TEMPLATE.md` — **no GitHub Actions workflows**. Releases appear to be manual: bump versions with the script, push tag, the marketplace repo points at git URLs (and `superpowers-dev` entry pins `ref: "dev"`).

## SKILL.md format

Frontmatter is intentionally minimal — only `name` and `description`:

```yaml
---
name: test-driven-development
description: Use when implementing any feature or bugfix, before writing implementation code
---
```

Body uses heavy XML-style emphasis tags (`<EXTREMELY-IMPORTANT>`, `<SUBAGENT-STOP>`, `<important-reminder>`) and prescriptive uppercase rules. No tags, no allowed-tools, no version field per skill.

## Distinctive patterns

- **Bootstrap via SessionStart hook**: `hooks/hooks.json` registers a `SessionStart` (matchers `startup|clear|compact`) that runs `hooks/run-hook.cmd session-start`, which reads `skills/using-superpowers/SKILL.md` and injects it as additional system context — this is how skills "trigger automatically" without the user opting in.
- **`using-superpowers` as meta-skill**: forces the agent to invoke the Skill tool *before any reply, including clarifying questions*.
- **OpenCode runtime SKILL.md parser**: `.opencode/plugins/superpowers.js` reimplements frontmatter extraction inline ("avoid dependency on skills-core for bootstrap").
- **Tests for skill triggering**: `tests/skill-triggering/`, `tests/codex-plugin-sync/`, `tests/opencode/` — actual integration tests for whether agents invoke the right skill.
- **Multi-harness CLAUDE.md/AGENTS.md/GEMINI.md** at root, one per agent's convention.
- **Spec-driven development** visible in `docs/superpowers/specs/`.

## Implications for Matt's repo

- **Multi-plugin themed marketplace**: superpowers' pattern is **separate plugin repos + one curation repo with `.claude-plugin/marketplace.json`** listing them by URL — *not* a monorepo. If Matt wants a monorepo, he'd be inventing a different pattern.
- **Codex support**: cheapest path is `.codex-plugin/plugin.json` at root (Codex App) plus `.codex/INSTALL.md` for CLI clone+symlink. No build step needed.
- **Docs site**: superpowers offers no precedent — Matt would be ahead of it.
- **Build tooling**: superpowers proves you can run a popular skills plugin with **zero npm scripts** and just two bash scripts (version bump + cross-repo sync). The `.version-bump.json` config-driven approach is worth copying.
- **SKILL.md conventions**: keep frontmatter to `name` + `description`; lean on body prose for behavior.

## Key URLs

- https://github.com/obra/superpowers/blob/main/.claude-plugin/marketplace.json
- https://github.com/obra/superpowers/blob/main/.codex-plugin/plugin.json
- https://github.com/obra/superpowers/blob/main/.opencode/plugins/superpowers.js
- https://github.com/obra/superpowers/blob/main/scripts/bump-version.sh
- https://github.com/obra/superpowers/blob/main/scripts/sync-to-codex-plugin.sh
- https://github.com/obra/superpowers/blob/main/hooks/hooks.json
- https://github.com/obra/superpowers-marketplace/blob/main/.claude-plugin/marketplace.json
