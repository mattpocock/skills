# Flatten `skills/` to the promoted set, and adopt Agent Plugins 1.0

[ADR 0002](./0002-ship-as-a-claude-code-plugin.md) shipped the Claude Code plugin and deferred everything else, because no other manifest format could express "a curated subset of a bucketed repo". It named two ways out: **(a)** restructure so `skills/` holds only promoted skills, or **(b)** commit a generated flat copy. This ADR takes **(a)**.

## What forced the decision

The [Agent Plugins](https://agent-plugins.org/) standard published 1.0.0 on 6 August 2026 — Cursor, VS Code, GitHub Copilot, ChatGPT/Codex and Kiro are listed as clients. Its discovery rule is fixed and normative: a client reads the immediate children of `skills/`, "MUST NOT recursively search deeper descendants", and "`plugin.json` cannot override these locations". A bucketed `skills/engineering/<name>/` tree is therefore invisible to every conformant client.

A spec was proposed that kept the buckets and generated a flat package under `plugins/mattpocock-skills/`, with a TypeScript builder, a validator, a promoted-skill allowlist, and a CI job failing on any rebuild diff. That is option (b) with extra steps: every skill in the repo twice, a rewrite step mangling `SKILL.md` frontmatter on the way through, and four new pieces of tooling — in a repo with no TypeScript at all. The whole apparatus exists only to work around the buckets.

Removing the buckets removes the apparatus. We are conformant by layout instead of by tooling.

## Decision

- `skills/` is **flat** and holds **exactly** the promoted set. Folder location is the only promotion mechanism.
- Unpromoted skills move out of `skills/`: `in-progress/` → `drafts/`, `misc/` → `extras/`. `deprecated/` is deleted — it was empty, and a retired skill is deleted outright anyway.
- Add `plugin.json` at the repo root: the canonical Agent Plugins 1.0 manifest. It lists no skills, because the standard's schema is closed and discovery is fixed.
- Keep `.claude-plugin/plugin.json` for Claude Code, which does not implement the standard yet, and **delete its `skills` array** — Claude auto-discovers a flat `skills/`, and a 25-entry list is a second promotion mechanism that can drift.
- No generated package, no build script, no duplicate skill tree, no drift CI, no TypeScript.

## What we deliberately did not do

- **No `.codex-plugin/plugin.json` or `.cursor-plugin/plugin.json`.** Cursor documents dual support ("A plugin that conforms to the Agent Plugins specification loads in Cursor without changes"), and the Codex source reads the root `plugin.json` first, falling back to the legacy paths only if it is absent. The proposed spec was more conservative than either client.
- **No new marketplace manifests.** Marketplaces are not part of Agent Plugins at all. Copilot reads `.claude-plugin/marketplace.json`, and Codex treats it as legacy-compatible, so the file we already have may serve all three. Add `.agents/plugins/marketplace.json` or `.github/plugin/marketplace.json` only where a real install fails.
- **No rename to `mp`.** The public name stays `mattpocock-skills`. It is live in Claude Code's official marketplace with auto-update, so renaming would break every existing install for a shorter slash command.
- **No flattening of `docs/`.** `docs/<category>/` is now the only place a skill's category lives. Flattening it would force 27 manual `githubSource` repoints on aihero.dev, one CLI call each, with no bulk command — for zero technical gain, because no client reads `docs/`.

## Consequences

- Promoting a skill is `git mv drafts/<name> skills/<name>` plus a README entry and a docs page. Retiring one is `git mv` out. No manifest to keep in step.
- `npx skills@latest add mattpocock/skills` stops offering all 35 skills. It walks `skills/` to depth 3 regardless of any manifest, so it has been offering every draft and extra all along; moving them out of `skills/` narrows the offer to the promoted 25. A fix we got for free.
- `disable-model-invocation` is carried by 14 of the 25 promoted skills and is **not** part of the Agent Skills standard — there is an open, unanswered proposal to make it one. We keep it in one shared tree and rely on non-Claude clients ignoring an unknown frontmatter key. If a portable client ever fires a user-invoked skill on its own, that assumption is broken and this decision needs revisiting; the alternative is a second skill tree, which is the duplication we just removed.
- Claude Code was **not** on the compatible-clients list when this was written, and neither the docs nor a 5,370-line changelog mention the standard. `.claude-plugin/plugin.json` therefore stays as the working manifest, not as legacy baggage. Delete it only once Claude reads the root manifest.
- The standard is one day old and still labelled a Working Draft. The flatten is right regardless of what the standard does next; the root `plugin.json` is 20 lines and costs nothing if the spec moves.

## Status of ADR 0002

Superseded in part. Its Claude-plugin decision stands. Its deferral of every other ecosystem is resolved here by taking the restructure it described.
