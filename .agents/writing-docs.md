# Writing docs pages

Every skill in `engineering/` and `productivity/` has a human-facing **docs page** at `docs/<bucket>/<skill-name>.md` — the docs tree mirrors those two bucket folders under `skills/`. It is published at `https://aihero.dev/skills-<skill-name>`; the URL is always `skills-<skill-name>` regardless of bucket, so the docs path is repo organisation only. The page is not the skill and not a copy of `SKILL.md`. Only these two buckets are promoted; the rest (`misc/`, `personal/`, `in-progress/`, `deprecated/`) ship no docs page.

Most of these skills are **user-invoked**: the agent will never fire them for you, so *you* are the index that has to remember they exist and when to reach for them. That memory is **cognitive load**. The job of a docs page is to relieve it — to orient one reader around one skill so they can hold it in their head, know when to reach for it, and see where it sits in the system. The pages are collectively a distributed router; each is a node.

Act whenever a promoted skill is added, renamed, or has its behaviour changed: create or re-sync its docs page. A rename moves the file too (`docs/<bucket>/<old>.md` → `docs/<bucket>/<new>.md`), because the published URL tracks the name; a skill that moves between `engineering/` and `productivity/` moves its docs file to the matching folder. Skills in `misc/`, `personal/`, `in-progress/`, and `deprecated/` get no page — none of those buckets is promoted. A skill moving *out* of one of them into `engineering/` or `productivity/` gains a page; one moving the other way loses it.

Because these pages are published on `aihero.dev`, **every link is absolute** — never a repo-relative path. A link to another skill points at `https://aihero.dev/skills-<name>`; a link into the repo points at its full `https://github.com/mattpocock/skills/...` URL. A relative link that works in the repo breaks once published.

There is no H1 — the published page takes its title from the slug.

## Page structure

Fill the template below. The **fixed frame** (Quickstart block, source link, `## What it does`, `## When to reach for it`, `## Where it fits`) appears on every page. The **adaptable middle** — `## Prerequisites` and the free-form substance sections — carries only what this particular skill earns; delete the rest.

<page-template>

Quickstart:

```bash
npx skills add mattpocock/skills --skill=<name>
```

```bash
npx skills update <name>
```

[Source](https://github.com/mattpocock/skills/tree/main/skills/<bucket>/<name>)

## What it does

One or two plain-language paragraphs. Lead with the skill's one-sentence job, then state the **defining constraint** — the single fact that makes this skill behave differently from the obvious default (for `to-spec`: it does not interview the user again, it synthesises what is already known). Write it as a plain declarative sentence — never a labelled aside like "The defining constraint:" or "The key thing:"; the formula reads as filler. This line is the most valuable on the page; never omit it.

## When to reach for it

How and when you reach for the skill — two beats, both effectively always present:

- **Invocation mode.** State whether you type it or the agent fires it. A user-invoked skill: "You invoke this by typing `/<name>` — the agent won't reach for it on its own." A model-invoked skill: "Type `/<name>`, or the agent reaches for it automatically when a task fits."
- **Trigger boundary.** The index entry: "reach for this when …". Where the skill is confusable with a sibling, add the other half — "for <X> instead, use [<sibling>](https://aihero.dev/skills-<sibling>)."

## Prerequisites

Optional — include only when the skill needs something in place to be functional; omit the heading entirely otherwise. Covers: a **workspace it writes into** (a stateful skill like `grill-with-docs` writes `CONTEXT.md` and ADRs; `teach` builds a whole directory — say what it writes and where), **prior setup** (`triage`/`to-spec`/`to-tickets` need `setup-matt-pocock-skills` to have configured an issue tracker), or **repo-specific tooling**. A stateless skill that runs anywhere has no prerequisites — drop the section.

## <free-form middle>

One to three short sections, in the skill's *own vocabulary*, that make it click — choose whatever headings fit the skill: the loop it runs, the artifact it produces, the fork it makes, the one anti-pattern it kills. There is no prescribed heading; the skills are too heterogeneous for one.

The single non-negotiable: **surface the skill's leading word / defining idea** — `tight` feedback loop, `deep module`, throwaway-code-answers-a-question, red-green. It pays off twice: the reader learns what the skill *is*, and learns the word they'll later think with to *reach for* it.

## It's working if

Optional. A short, checkable list of the observable signals that tell the reader the skill is actually doing its job — what they should see when it fires, and by absence when it hasn't. Include it when a skill has crisp tells (e.g. `to-spec` writes without re-interviewing you; a leading word reappearing in the trace); omit the heading when the signals are vague. A few bullets, no more.

## Where it fits

Always present. Situate the skill in the system in a sentence or two:

- **Role.** Name it: a **chain step** (`grill-with-docs → to-spec → to-tickets → implement → code-review`), a **run-once setup** (`setup-matt-pocock-skills`), **periodic maintenance** (`improve-codebase-architecture`, "every few days"), or a **reach-for-it-anytime standalone** (`diagnosing-bugs`, `prototype`, `handoff`). A standalone's map is one honest sentence — far better than omitting the section.
- **Neighbours.** The one or two siblings that matter, each with a because-clause, linked absolutely.
- **The map.** Point to [ask-matt](https://aihero.dev/skills-ask-matt), the router over the whole set, so this page stays a node and never has to redraw the graph.

</page-template>

## Conventions

- Explain the **why**, not the process. The page orients and situates the skill; it never reproduces the `SKILL.md` steps or template dumps — a human choosing a tool does not need the runbook.
- Use the skill's **leading words** (_seam_, _deep module_, _tracer bullet_) so the page and the skill speak one language.
- Keep the page itself low-load. It is documentation *about* low-cognitive-load skills; furniture (spare headings, restated links) is the thing it is arguing against.

## Done when

- The page exists at `docs/<bucket>/<name>.md`, and no stale page survives a rename or bucket move.
- The Quickstart block and source link name the correct bucket and skill; the update line names the skill.
- `## What it does` states the defining constraint, as plain prose rather than a labelled aside.
- `## When to reach for it` states invocation mode and the trigger boundary.
- `## Where it fits` names the role and links to `ask-matt`.
- A prerequisite (workspace, prior setup, tooling) is stated where one exists, and the section is absent where none does.
- The middle surfaces the leading word.
- Every link is absolute, and every one resolves.
