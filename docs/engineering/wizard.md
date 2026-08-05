[Source](https://github.com/mattpocock/skills/tree/main/skills/engineering/wizard)

## What it does

`wizard` generates an interactive bash script that walks a human, step by step, through a manual procedure that's tedious to do by hand and tedious to re-explain to an agent every time — wiring up third-party services, running a one-off migration, moving a project from state A to state B. It opens each URL, says what to click and copy, captures what comes back, and writes it where it belongs.

The UX is not yours to design. A [template](https://github.com/mattpocock/skills/blob/main/skills/engineering/wizard/template.sh) already solves it — progress with time-remaining, confirmation gates, cross-platform URL opening (WSL included), hidden entry for secrets, idempotent `.env` upserts, `gh secret` / `gh variable` writes, and a closing summary of anything it had to skip. Everything above the `STAGES` marker is a fixed library that is identical in every wizard and never hand-edited. Your job is only to scope the procedure and author its **stages**.

## When to reach for it

You invoke this by typing `/wizard` — the agent won't reach for it on its own.

Reach for this when the next thing blocking you is a human clicking through a dashboard: a new dev needs six services configured before the app boots, a migration needs someone to flip switches in the right order, or you're about to write those steps into a README that will rot. If the procedure is something the *agent* can just do, it should do it — a wizard is specifically for the steps only a human can take.

## Prerequisites

None to generate one. The wizard it writes runs on bash, and reaches for `gh` when a stage sets a GitHub secret or variable — if `gh` is missing or unauthenticated, that stage degrades to a warning and the closing summary tells the human what to set by hand, rather than failing the run.

## Stages

A **stage** is the unit of authoring and the unit of attention: one focused task, one screen. The script clears between stages, so anything that doesn't fit is anything the human loses. You author them in dependency order and set an honest `TOTAL_STAGES` and `TOTAL_MINUTES`, which is what drives the time-remaining display — the estimate is a promise to the person running it.

Getting there is three steps of scoping before a line is written. The skill reads the repo first rather than asking cold — `.env*`, `docker-compose*`, framework config, and every `secrets.*` / `vars.*` reference in `.github/workflows/`, each of which is a value the wizard must produce — then shows you the ordered stage list to confirm, then maps each stage to the precise path a human follows ("Dashboard → Developers → API keys → Reveal test key → copy"). Where it doesn't know the current UI, it asks or checks the docs; it does not invent clicks that may not exist.

## Ephemeral by default

A wizard is built for one run — saved to a scratch or `scripts/` path, deleted when the job is done. Commit it only when it's a repeatable setup path that should live in the repo, in which case link it from the README so the next person runs the script instead of re-asking an agent.

It's also never run end-to-end by the agent that wrote it: it opens browsers and blocks on human input. Verification is static instead — `bash -n`, `shellcheck` where available, and a trace that every value lands where scoping said it would, with every `set_secret` name matching a real `secrets.*` reference in CI.

## It's working if

- You're shown an ordered list of stages and the values each produces, and asked to confirm, before any script exists.
- The generated file's library section is byte-identical to `template.sh` — only the block below the `STAGES` marker is yours.
- Every URL is opened before the value it produces is asked for, secrets use hidden entry, and irreversible actions sit behind a confirmation.

## Where it fits

`wizard` is a reach-for-it-anytime standalone, sitting where automation stops and a human has to click. Its nearest neighbour is [setup-matt-pocock-skills](https://aihero.dev/skills-setup-matt-pocock-skills), because both are run-once setup — that one configures this skill set for a repo, while `wizard` generates setup paths for everything else. It also pairs with [implement](https://aihero.dev/skills-implement): when a build lands a feature that needs credentials or a manual cutover, a wizard is how the human half gets done. When you're unsure which skill fits the moment, [ask-matt](https://aihero.dev/skills-ask-matt) routes you.
