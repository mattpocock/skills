Skills are organized into bucket folders under `skills/`:

- `engineering/` — daily code work
- `productivity/` — daily non-code workflow tools
- `misc/` — kept around but rarely used, not promoted
- `personal/` — tied to my own setup, not promoted
- `in-progress/` — drafts not yet ready to ship
- `deprecated/` — no longer used

Every skill in `engineering/` or `productivity/` (the **promoted** buckets) must have a reference in the top-level `README.md` and an entry in `.claude-plugin/plugin.json`. Skills in `misc/`, `personal/`, `in-progress/`, and `deprecated/` must not appear in either.

Each skill entry in the top-level `README.md` must link the skill name to its `SKILL.md`.

Each bucket folder has a `README.md` that lists every skill in the bucket with a one-line description, with the skill name linked to its `SKILL.md`. The promoted buckets' `README.md`s and the top-level `README.md` group entries into **User-invoked** and **Model-invoked**; non-promoted bucket `README.md`s (`misc/`, `personal/`) use a flat list.

Skills in `engineering/` and `productivity/` also have a human-facing docs page at `docs/<bucket>/<skill-name>.md` (the docs tree mirrors those two bucket folders under `skills/`). The published URL is `https://aihero.dev/skills-<skill-name>` regardless of bucket — the docs path is repo organisation only. When you add, rename, or change the behaviour of a skill in `engineering/` or `productivity/`, create or re-sync its docs page following [.agents/writing-docs.md](./.agents/writing-docs.md). Skills in the non-promoted buckets (`misc/`, `personal/`, `in-progress/`, `deprecated/`) get **no** docs page.

Every `SKILL.md` is either user-invoked (Claude Code: `disable-model-invocation: true`, Codex: `policy.allow_implicit_invocation: false` in `agents/openai.yaml`, reachable only by the human) or model-invoked (model- or user-reachable). See [.agents/invocation.md](./.agents/invocation.md).

[`ask-matt`](./skills/engineering/ask-matt/SKILL.md) is the router that maps every user-reachable skill and how they relate. The same trigger that re-syncs a docs page applies to it: whenever you add, rename, remove, or change how a user-reachable skill fits the flows, re-read `ask-matt`'s `SKILL.md` and update it so the map stays accurate — a new skill it never mentions, or a stale one it still routes to, is a router that lies.

To (re)link every skill into the local harness skill directories (`~/.claude/skills`, `~/.agents/skills`), run `scripts/link-skills.sh`. Each entry is a symlink into this repo, so a `git pull` keeps installed skills current; re-run the script after adding, removing, or renaming a skill.
