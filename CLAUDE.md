A skill's folder decides whether it ships. There are three top-level folders, and no buckets inside them:

- `skills/` — the **promoted** set. Exactly what the plugin ships, flat, one folder per skill.
- `drafts/` — beta: public on purpose, feedback wanted, not shipped.
- `extras/` — kept around but rarely used, not shipped.

`skills/` is flat because the [Agent Plugins](https://agent-plugins.org/) standard reads only the immediate children of `skills/` and cannot be pointed elsewhere. Never add a folder between `skills/` and a skill, and never put a non-promoted skill under `skills/` — it would ship.

Promoting a skill is a `git mv` into `skills/`, plus a reference in the top-level `README.md`. Retiring one is a `git mv` out. There is no manifest list to keep in step.

Install commands are copied verbatim from [.agents/install-block.md](./.agents/install-block.md). Two manifests carry the same metadata and must agree: `plugin.json` at the root (the Agent Plugins 1.0 manifest, read by Codex, Cursor and Copilot) and `.claude-plugin/plugin.json` (read by Claude Code, which does not implement the standard yet). Neither lists skills. `.claude-plugin/marketplace.json` makes the repo its own single-plugin marketplace — a fallback the install block explains, not the documented route. Run `claude plugin validate . --strict` and `node scripts/sync-plugin-version.mjs --check` after touching any manifest. Why the repo is laid out this way lives in [.agents/adr/0003-flat-skills-tree-for-agent-plugins.md](./.agents/adr/0003-flat-skills-tree-for-agent-plugins.md).

Each skill entry in the top-level `README.md` must link the skill name to its `SKILL.md`.

`drafts/` and `extras/` each have a `README.md` listing every skill in the folder with a one-line description, name linked to its `SKILL.md`, as a flat list. The promoted skills are listed only in the top-level `README.md`, grouped into **User-invoked** and **Model-invoked**.

Every promoted skill also has a human-facing docs page at `docs/<category>/<skill-name>.md`, where `<category>` is `engineering` or `productivity`. That docs folder is the **only** place a skill's category lives — no client reads it, and it drives nothing but the grouping on the site and in the top-level `README.md`. The published URL is `https://aihero.dev/skills-<skill-name>` regardless of category. When you add, rename, or change the behaviour of a promoted skill, create or re-sync its docs page following [.agents/writing-docs.md](./.agents/writing-docs.md). A finished page carries four sections — **What it does**, **When to reach for it**, **Common questions**, **It's working if** — and `writing-docs.md` holds the template, the section order, and where to hunt for the questions. Skills in `drafts/` and `extras/` get **no** docs page.

Every `SKILL.md` is either user-invoked (`disable-model-invocation: true` plus `policy.allow_implicit_invocation: false` in `agents/openai.yaml`, reachable only by the human) or model-invoked (model- or user-reachable). See [.agents/invocation.md](./.agents/invocation.md).

[`ask-matt`](./skills/ask-matt/SKILL.md) is the router that maps every user-reachable skill and how they relate. The same trigger that re-syncs a docs page applies to it: whenever you add, rename, remove, or change how a user-reachable skill fits the flows, re-read `ask-matt`'s `SKILL.md` and update it so the map stays accurate — a new skill it never mentions, or a stale one it still routes to, is a router that lies.

To (re)link every skill into the local harness skill directories (`~/.claude/skills`, `~/.agents/skills`), run `scripts/link-skills.sh`. Each entry is a symlink into this repo, so a `git pull` keeps installed skills current; re-run the script after adding, removing, or renaming a skill.
