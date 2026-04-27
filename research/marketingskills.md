# Research: `coreyhaines31/marketingskills`

A marketing-themed Agent Skills repo by Corey Haines. The infrastructure is genuinely interesting and notably *minimal*: zero npm dependencies, all codegen done with Node stdlib + bash.

## Repo structure

```
.claude-plugin/        marketplace.json, plugin.json
.github/               workflows + sync script + issue/PR templates
skills/                40 skill dirs (flat, one level deep)
tools/                 clis/, integrations/, composio/, REGISTRY.md
AGENTS.md  CLAUDE.md  CONTRIBUTING.md  README.md  VERSIONS.md
validate-skills.sh  validate-skills-official.sh
```

`CLAUDE.md` is a one-line file: `AGENTS.md` (i.e. it points Claude at the cross-agent file, treating AGENTS.md as the source of truth).

Each skill directory is uniform:

```
skills/<name>/
├── SKILL.md
├── evals/evals.json        # eval prompts + assertions
└── references/*.md         # progressive-disclosure docs
```

No `scripts/` or `assets/`. Skills are flat (no nesting / sub-skills). **No `plugins/` or `dist/` directories** — the repo *is* the plugin, served from root.

## Plugin packaging

Ships as a Claude Code plugin marketplace via two manifests:

`.claude-plugin/marketplace.json`:
```json
{
  "name": "marketingskills",
  "owner": { "name": "Corey Haines", "url": "https://corey.co" },
  "metadata": { "version": "1.9.0" },
  "plugins": [
    { "name": "marketing-skills",
      "description": "40 marketing skills...",
      "source": "./" }
  ]
}
```

`.claude-plugin/plugin.json`:
```json
{ "name": "marketing-skills", "version": "1.9.0",
  "skills": "./skills", "license": "MIT" }
```

**One marketplace, one plugin, all 40 skills bundled.** No themed sub-grouping into multiple plugins — the README's "categories" exist only as headings, not separate installable units. (Relevant for Matt's multi-plugin goal: this repo doesn't actually demonstrate a multi-plugin marketplace.)

VERSIONS.md notes the `plugin.json` was added explicitly so Claude Code's loader recognizes the skills directory.

## Build tooling

**No package.json, no TypeScript, no bundler, no dist build.** The only Node code is `.github/scripts/sync-skills.js` — a zero-dependency script (`fs`, `path` only) that:

1. Walks `skills/*/SKILL.md`
2. Parses YAML frontmatter with a hand-rolled regex (`/^---\n([\s\S]*?)\n---/`) — naïve key:value splitter, no real YAML lib
3. Rewrites the `plugins[0].skills` array in `marketplace.json` to a list of `./skills/<name>` paths
4. Updates the skill count in the plugin description (`/\d+ marketing skills/`)
5. Replaces the `<!-- SKILLS:START -->...<!-- SKILLS:END -->` block in README.md with a regenerated table (description truncated to 120 chars at a word boundary)

That's the entire codegen story. `validate-skills.sh` and `validate-skills-official.sh` are bash-only frontmatter linters using `sed`/`grep`.

## Installation story

Six options listed in the README, in priority order:

1. **vercel-labs/skills CLI** — `npx skills add coreyhaines31/marketingskills [--skill page-cro copywriting] [--list]`. README claims this installs to `.agents/skills/` and symlinks `.claude/skills/` for Claude Code.
2. **Claude Code plugins** — `/plugin marketplace add coreyhaines31/marketingskills` then `/plugin install marketing-skills`.
3. Clone-and-copy.
4. Git submodule.
5. Fork.
6. **SkillKit** (`npx skillkit install ...`) for cross-agent install (Cursor/Copilot/etc).

**Codex support** is implicit: the repo ships `AGENTS.md` (the cross-agent spec file Codex reads) and the README claims compatibility with "Claude Code, OpenAI Codex, Cursor, Windsurf, and any agent that supports the Agent Skills spec." There is **no Codex-specific plugin manifest** — Codex compatibility comes purely from being SKILL.md-spec-compliant + AGENTS.md at root.

## Docs site

**There is no embedded docs site.** No `docs/`, no `site/`, no `website/`, no Docusaurus/Nextra/Astro config, `has_pages: false`. The README claims `homepage: https://marketing-skills.com` but it is not built from this repo.

The only generated docs artifact is the README skills table (built by `sync-skills.js`).

## CI / release

Two workflows:

- **`.github/workflows/sync-skills.yml`** — on push to `main` touching `skills/**`, runs `sync-skills.js` and commits the result back via `stefanzweifel/git-auto-commit-action@v7` as a bot user. This is the "build step" — it auto-rewrites `marketplace.json` and `README.md` whenever skills change.
- **`.github/workflows/validate-skill.yml`** — on push/PR touching `**/SKILL.md`. A `detect-changes` job computes the changed skill dirs via git diff and a jq-built JSON array, then a matrix `validate` job runs `Flash-Brew-Digital/validate-skill@v1` on each. Skips drafts and dependabot.

No release/publish workflow — versioning is tracked manually in `VERSIONS.md` (per-skill semver + dates) and in `marketplace.json`/`plugin.json`'s top-level `version`.

## SKILL.md format

Frontmatter is minimal:

```yaml
---
name: page-cro
description: When the user wants to optimize... [trigger phrases and "For X, see other-skill" cross-refs]
metadata:
  version: 1.1.0
---
```

Conventions documented in `AGENTS.md`:
- `name`: 1-64 chars, lowercase a-z + digits + hyphens, must match dir
- `description`: 1-1024 chars, *must* include trigger phrases AND scope-boundary cross-references to sibling skills
- `metadata.version` only (no author/license per-skill)
- SKILL.md kept under 500 lines; details pushed into `references/`

Distinctive description style: every skill enumerates trigger-phrase-laden quotes ("CRO," "this page isn't converting," "my landing page sucks") plus explicit `For X, see other-skill` boundaries — clearly tuned for the Skill-tool dispatcher's keyword matching.

## Distinctive / novel patterns

1. **Per-skill `evals/evals.json`** — every skill has structured eval prompts with `expected_output` summary + a list of `assertions` strings. Not wired into CI but provides a dataset for offline eval runs.

2. **Auto-update protocol baked into `AGENTS.md`** — instructs the agent to fetch `VERSIONS.md` from raw.githubusercontent once per session, compare local versions, and surface a non-blocking notification if 2+ skills are stale or any has a major bump. Includes a "say 'update skills'" trigger that runs `git pull`. This is a memory-less, network-fetched update channel.

3. **`product-marketing-context` as a hub skill** — every other skill is documented to read `.agents/product-marketing-context.md` (with `.claude/` fallback) before doing anything. README diagram shows it as the root of a star topology.

4. **Claude Code-only escape hatch in AGENTS.md** — explicitly calls out that `` !`command` `` shell-injection syntax is Claude Code-only and **must not** be in the cross-agent SKILL.md files. Suggests local override in `.claude/skills/` if you want it. Clean pattern: keep skills cross-agent, document Claude-Code-only enhancements separately.

5. **`tools/` registry** — orthogonal to skills, not part of the plugin. 60+ zero-dep Node CLIs (`tools/clis/<vendor>.js`) plus 80+ markdown integration guides plus a Composio mapping. AGENTS.md tells the agent: skills *reference* tools by name, agent reads `tools/REGISTRY.md` and `tools/integrations/<tool>.md` on demand. Effectively a second progressive-disclosure layer beyond `references/`.

6. **No package.json / no JS deps** — the entire codegen + validation pipeline is `node` (stdlib only) + `bash`. Maximally portable.

7. **No agents, no hooks, no slash-commands** — README hints at `/page-cro` invocations, but no `commands/` directory exists. These are skill-name invocations the Claude Code plugin loader produces automatically.

## Takeaways for Matt's infra goals

- **Multi-plugin marketplace (goal 2)**: this repo is *not* a model for that — single-plugin marketplace. The marketplace.json schema does support multiple `plugins[]` entries pointing to different `source` paths, so for themed groups Matt would want each plugin to live in its own subdir (e.g. `plugins/architecture/`, `plugins/typescript/`) each with their own `skills/`. coreyhaines31 doesn't demonstrate this.
- **Codex (goal 3)**: cheap — drop AGENTS.md at root, keep SKILL.md spec-compliant, claim compatibility. No separate manifest needed.
- **vercel-labs CLI (goal 1)**: zero work — once `skills/<name>/SKILL.md` exists with valid frontmatter, the CLI picks it up. coreyhaines31 added nothing extra.
- **Docs site (goal 4)**: not modeled here; this repo opts out and links to a separately-hosted marketing site.
- **Worth copying**: the `sync-skills.js` + GitHub Action pattern (auto-rewrite README table and marketplace skill list on push), the `VERSIONS.md` + auto-update protocol, the `evals/evals.json` per skill, and the AGENTS.md note about keeping `` !`command` `` out of cross-agent SKILL.md.

## Key file paths

(all on `main` branch of `coreyhaines31/marketingskills`)

- `/.claude-plugin/marketplace.json`, `/.claude-plugin/plugin.json`
- `/.github/scripts/sync-skills.js`
- `/.github/workflows/sync-skills.yml`, `/.github/workflows/validate-skill.yml`
- `/AGENTS.md` (the canonical agent guide; `CLAUDE.md` just points to it)
- `/VERSIONS.md`
- `/skills/<name>/SKILL.md` + `/skills/<name>/evals/evals.json` + `/skills/<name>/references/*.md`
- `/validate-skills.sh`, `/validate-skills-official.sh`
