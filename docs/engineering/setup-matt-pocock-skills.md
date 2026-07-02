Quickstart:

```bash
npx skills add mattpocock/skills --skill=setup-matt-pocock-skills
```

```bash
npx skills update setup-matt-pocock-skills
```

[Source](https://github.com/mattpocock/skills/tree/main/skills/engineering/setup-matt-pocock-skills)

## What it does

`setup-matt-pocock-skills` teaches one repo how the engineering skills should behave in it — where issues live, what the triage labels are called, and where the domain docs sit — and records those answers as **config** the other skills read.

It writes config, it does not hard-code behaviour. The engineering chain assumes three files under `docs/agents/` exist; this skill is the one-time bootstrap that produces them, discovered from your actual repo (`git remote`, existing labels, existing `CONTEXT.md`) and confirmed with you rather than guessed. It is prompt-driven — explore, present what it found, confirm, then write — not a deterministic scaffold.

## When to reach for it

You invoke this by typing `/setup-matt-pocock-skills` — the agent won't reach for it on its own.

Reach for it **once per repo, before the first use of any other engineering skill**. If [triage](https://aihero.dev/skills-triage), [to-spec](https://aihero.dev/skills-to-spec), or [to-tickets](https://aihero.dev/skills-to-tickets) start guessing where your issues live or applying labels that don't exist, they haven't been set up here yet. Re-run it only to switch issue trackers or start over — day-to-day tweaks are just edits to `docs/agents/*.md`.

## The three decisions

It walks you through three choices, one at a time, each with a plain-language explainer (it assumes you don't already know the terms):

- **Issue tracker** — where work is tracked, so `triage`/`to-spec`/`to-tickets` know whether to call `gh`, `glab`, write markdown under `.scratch/`, or follow a workflow you describe. GitHub, GitLab, local markdown, or other.
- **Triage labels** — the strings behind the five canonical roles (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`), mapped to labels you've actually configured so `triage` applies real ones instead of creating duplicates.
- **Domain docs** — whether the repo has one `CONTEXT.md` or a multi-context map, so skills that read domain language look in the right place.

The output is three files — `docs/agents/issue-tracker.md`, `docs/agents/triage-labels.md`, `docs/agents/domain.md` — plus an `## Agent skills` block pointing to them in whichever of `CLAUDE.md` / `AGENTS.md` the repo already uses. Those files are the shared substrate the rest of the toolkit stands on.

## It's working if

- Three files land under `docs/agents/`, and an `## Agent skills` section appears in your `CLAUDE.md` or `AGENTS.md`.
- The tracker it proposes matches your real `git remote`, and the labels match strings that already exist in your repo.
- Afterwards, `triage` and `to-tickets` act on the right place with the right labels instead of asking or guessing.

## Where it fits

`setup-matt-pocock-skills` is a **run-once setup** — the foundation the whole engineering set stands on, not a step you repeat. Its neighbours are the skills that read what it writes: [triage](https://aihero.dev/skills-triage), because it applies the label vocabulary configured here, and [to-spec](https://aihero.dev/skills-to-spec) / [to-tickets](https://aihero.dev/skills-to-tickets), because they publish into the issue tracker configured here. Run it first; everything downstream assumes it has. When you're unsure which skill or flow fits, [ask-matt](https://aihero.dev/skills-ask-matt) routes you.
