# Writing docs pages

Every skill in `engineering/` and `productivity/` has a human-facing **docs page** at `docs/<bucket>/<skill-name>.md` — the docs tree mirrors those two bucket folders under `skills/`. It is published at `https://aihero.dev/skills-<skill-name>`; the URL is always `skills-<skill-name>` regardless of bucket, so the docs path is repo organisation only. The page is not the skill and not a copy of `SKILL.md`. Only these two buckets are promoted; the rest (`misc/`, `in-progress/`, `deprecated/`) ship no docs page.

Most of these skills are **user-invoked**: the agent will never fire them for you, so *you* are the index that has to remember they exist and when to reach for them. That memory is **cognitive load**. The job of a docs page is to relieve it — to orient one reader around one skill so they can hold it in their head, know when to reach for it, and see where it sits in the system. The pages are collectively a distributed router; each is a node.

Act whenever a promoted skill is added, renamed, or has its behaviour changed: create or re-sync its docs page. A rename moves the file too (`docs/<bucket>/<old>.md` → `docs/<bucket>/<new>.md`), because the published URL tracks the name; a skill that moves between `engineering/` and `productivity/` moves its docs file to the matching folder. Skills in `misc/`, `in-progress/`, and `deprecated/` get no page — none of those buckets is promoted. A skill moving *out* of one of them into `engineering/` or `productivity/` gains a page; one moving the other way loses it.

Because these pages are published on `aihero.dev`, **every link is absolute** — never a repo-relative path. A link to another skill points at `https://aihero.dev/skills-<name>`; a link into the repo points at its full `https://github.com/mattpocock/skills/...` URL. A relative link that works in the repo breaks once published.

There is no H1 — the published page takes its title from the slug.

## Page structure

Fill the template below, keeping its order. The **fixed frame** (`## What it does`, `## When to reach for it`, `## Where it fits`) appears on every page. `## Prerequisites` and the free-form substance sections carry only what this particular skill needs; delete the rest.

Four sections make a page worth reading: `What it does`, `When to reach for it`, `Common questions`, `It's working if`. The first two orient the reader; the last two are where the page stops summarising the skill and starts answering the reader's own situation. Each of the last two has a bar to clear, below — but treat a page that clears neither as unfinished, not as finished-and-short.

**A page carries no install commands.** The ai-hero page template renders the install widget itself — a copy button, the single-skill command, the whole-set command, and the update line — above the body. A page that also writes them out shows the reader the same command twice, and the two copies drift: the hand-written pair on every page went stale against the widget beside it. Install wording is a property of the site, not of the page. If it needs changing, change it in ai-hero; the canonical wording lives in [the install block](./install-block.md).

<page-template>

## What it does

One or two plain-language paragraphs. Lead with the skill's one-sentence job, then state the **defining constraint** — the single fact that makes this skill behave differently from the obvious default (for `to-spec`: it does not interview the user again, it synthesises what is already known). Write it as a plain declarative sentence — never a labelled aside like "The defining constraint:" or "The key thing:"; the formula reads as filler. This line is the most valuable on the page; never omit it.

## When to reach for it

How and when you reach for the skill — two beats, both effectively always present:

- **Invocation mode.** State whether you type it or the agent fires it. A user-invoked skill: "You invoke this by typing `/<name>` — the agent won't reach for it on its own." A model-invoked skill: "Type `/<name>`, or the agent reaches for it automatically when a task fits."
- **Trigger boundary.** The index entry: "reach for this when …". Where the skill is confusable with a sibling, add the other half — "for <X> instead, use [<sibling>](https://aihero.dev/skills-<sibling>)."

## Prerequisites

Optional — include only when the skill needs something in place to be functional; omit the heading entirely otherwise. Covers: a **workspace it writes into** (a stateful skill like `grill-with-docs` writes `GLOSSARY.md` and ADRs; `teach` builds a whole directory — say what it writes and where), **prior setup** (`triage`/`to-spec`/`to-tickets` need `setup-matt-pocock-skills` to have configured an issue tracker), or **repo-specific tooling**. A stateless skill that runs anywhere has no prerequisites — drop the section.

## <free-form middle>

One to three short sections, in the skill's *own vocabulary*, that make it click — choose whatever headings fit the skill: the loop it runs, the artifact it produces, the fork it makes, the one anti-pattern it kills. There is no prescribed heading; the skills are too heterogeneous for one.

The single non-negotiable: **surface the skill's leading word / defining idea** — `tight` feedback loop, `deep module`, throwaway-code-answers-a-question, red-green. It pays off twice: the reader learns what the skill *is*, and learns the word they'll later think with to *reach for* it.

## Common questions

The questions readers really ask about this skill, each in bold with the answer in the lines beneath it — no sub-headings.

An observed question always beats an invented one, so go and find them before you write any:

- **The wiki.** If `~/repos/matt/personal-wiki` exists on this machine, it is the richest source there is. Its `wiki/audience/` area is organised around what the audience wants, discusses, and **is confused by** — read `wiki/index.md` first for the registry of pages, then the pages bearing on this skill. Every page carries `sources:` linkbacks to the original X, Discord, GitHub, and email threads; the wiki is a secondary source, so quote the asker's own question rather than the wiki's summary of it. Skip this bullet where the directory does not exist.
- **This repo's issues.** `gh issue list --repo mattpocock/skills --search "<skill-name>" --state all`. A question filed twice is a question the page owes an answer to.
- **`CHANGELOG.md`.** Anything renamed, moved, or behaviourally changed generates a "where did it go?" that the page has to answer.

Where the hunt comes up thin, the section may also carry a question a reader would plainly ask — but **the count stays honest to the evidence**. A well-discussed skill earns six; an obscure one earns one or two, or none at all. Padding a thin skill out to match a rich one is how the section fills with questions nobody has, and an invented question teaches the reader nothing.

Order them by how often each comes up, sharpest first, and say the unflattering thing where it is true — a very long grilling session usually means the scope was too big; a model asked to write its own skill produces something verbose. Omit the heading where there is nothing worth answering.

## It's working if

A few bullets naming what the reader sees when the skill is doing its job. The bar on each is that the reader can check it without opening `SKILL.md` — a signal in their own work, or in the trace in front of them. "The document gets shorter as it gets better" passes; "the library section is byte-identical to `template.sh`" is a compliance check on the skill's internals wearing this section's name. Include it wherever the tells are crisp; omit the heading where they stay vague.

## Where it fits

Always present. Situate the skill in the system in a sentence or two:

- **Role.** Name it: a **chain step** (`grill-with-docs → to-spec → to-tickets → implement → code-review`), a **run-once setup** (`setup-matt-pocock-skills`), **periodic maintenance** (`improve-codebase-architecture`, "every few days"), or a **reach-for-it-anytime standalone** (`diagnosing-bugs`, `prototype`, `handoff`). A standalone's map is one honest sentence — far better than omitting the section.
- **Neighbours.** The one or two siblings that matter, each with a because-clause, linked absolutely.
- **The map.** Point to [ask-matt](https://aihero.dev/skills-ask-matt), the router over the whole set, so this page stays a node and never has to redraw the graph.

</page-template>

## Conventions

- Explain the **why**, not the process. The page orients and situates the skill; it never reproduces the `SKILL.md` steps or template dumps — a human choosing a tool does not need the runbook.
- **Never name the author.** The page is a technical document, not a record of who said what. "Matt says", "Matt's own answer", "his position is", a quoted reply — all of it goes. A finding from the question hunt is worth keeping; its attribution is not. State the substance as a plain claim about the skill ("the fix is a direct instruction: …", "the split comes down to session count") and drop the frame. The reader is deciding whether to use a tool; an opinion carries the same weight either way, and an attributed one dates as soon as the position moves. Quoting a *user* stays fine — "one user reported …" is evidence about the skill in the wild, and stays anonymous.
- Use the skill's **leading words** (_seam_, _deep module_, _tracer bullet_) so the page and the skill speak one language.
- **Use the [AI Coding Dictionary](https://www.aihero.dev/ai-coding-dictionary)'s term where one exists, and link its first use on the page.** The dictionary is the house vocabulary for AI coding — _context window_, _subagent_, _harness_, _primary source_, _agent mode_. Prefer its word over a synonym you invent. Link the first occurrence of each term to `https://www.aihero.dev/ai-coding-dictionary/<slug>` (the slug is the term lowercased with non-alphanumerics as hyphens: _context window_ → `context-window`), and leave every later occurrence unlinked. Link only where the word carries the dictionary's sense — a domain *model*, background *context* or an auth *token* is a different word that happens to match. Never link inside a heading, a code span, or an existing link, and never link a word that names a skill in this repo rather than the concept. For the full term list, read `~/repos/ai/ai-coding-dictionary/dictionary/` if it exists on this machine — one file per term, the filename *is* the term — and otherwise [mattpocock/dictionary-of-ai-coding](https://github.com/mattpocock/dictionary-of-ai-coding), which is the source of truth either way.
- **Branches go in a table or a list, never in a paragraph.** Where the page presents a choice — two artifacts the skill can produce, four situations that trigger it, five options at a boundary — the reader is scanning for the one row that matches their situation. A paragraph makes them read all of it to find out. A short markdown table (condition in the left column, what to do in the right) or a bulleted list gives it back in one glance. This applies wherever the branch appears, most often in `## When to reach for it` and the free-form middle.
- Keep the page itself low-load. It is documentation *about* low-cognitive-load skills; furniture (spare headings, restated links) is the thing it is arguing against.

## Done when

- The page exists at `docs/<bucket>/<name>.md`, and no stale page survives a rename or bucket move.
- The page carries no source link and writes no install command of its own.
- `## What it does` states the defining constraint, as plain prose rather than a labelled aside.
- The page names no author and quotes no author — every claim stands on its own.
- `## When to reach for it` states invocation mode and the trigger boundary.
- `## Where it fits` names the role and links to `ask-matt`.
- A prerequisite (workspace, prior setup, tooling) is stated where one exists, and the section is absent where none does.
- The middle surfaces the leading word.
- Every AI Coding Dictionary term the page uses is spelt the dictionary's way, and its first use — and only its first use — links to the dictionary entry.
- Every multi-way branch is a table or a list, not a paragraph the reader has to read in full.
- The hunt for real questions ran — the wiki, the issues, the changelog — and `## Common questions` is sized to what it found, not padded to match a richer skill's page.
- Every `## It's working if` bullet is checkable without opening `SKILL.md`.
- The sections appear in the template's order.
- Every link is absolute, and every one resolves.
