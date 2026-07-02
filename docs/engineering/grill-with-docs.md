Quickstart:

```bash
npx skills add mattpocock/skills --skill=grill-with-docs
```

```bash
npx skills update grill-with-docs
```

[Source](https://github.com/mattpocock/skills/tree/main/skills/engineering/grill-with-docs)

## What it does

`grill-with-docs` interviews you relentlessly about a plan or design, one question at a time, until you and the agent reach a shared understanding — and it writes the vocabulary and decisions down as you go.

The grilling **leaves a paper trail**. A plain interview sharpens your thinking and then evaporates when the session ends; this one captures each term the moment it's resolved into a `CONTEXT.md` glossary, and records the hard, one-way decisions as ADRs. The alignment survives the conversation instead of living only in your head.

## When to reach for it

You invoke this by typing `/grill-with-docs` — the agent won't reach for it on its own.

Reach for it at the very start of a change, when the plan is still fuzzy and the domain language isn't settled, and you want to stress-test both before any code exists. If you only want the interview and don't need the artifacts, use [grilling](https://aihero.dev/skills-grilling); if the plan is already clear and you just need to pin down or record terminology, use [domain-modeling](https://aihero.dev/skills-domain-modeling).

## Prerequisites

This skill is stateful — it writes into your repo as it grills. Resolved terms land in a `CONTEXT.md` glossary at the root (or the relevant context's `CONTEXT.md` if a `CONTEXT-MAP.md` marks a multi-context repo), and genuinely hard-to-reverse decisions land as ADRs under `docs/adr/`. Both are created lazily — nothing exists until the first term or decision crystallises — so you don't need to scaffold anything up front, but you do need to be somewhere it's safe to write these files.

## The grill

The engine is a **grill**: a relentless, one-question-at-a-time walk down the design tree, resolving dependencies between decisions before moving on, with a recommended answer offered for every question. Questions the codebase can answer are answered by reading the codebase, not by asking you.

What makes this variant its own skill is where the answers go. As the grill runs, fuzzy language gets sharpened into canonical terms and written to the glossary inline — not batched at the end. The glossary stays a glossary: pure vocabulary, no implementation details, no spec. ADRs are offered sparingly, only when a decision is hard to reverse, surprising without context, and the result of a real trade-off. Most sessions produce a sharper glossary and few or no ADRs, and that's the intended shape.

## It's working if

- It asks one question at a time and waits, rather than dumping a questionnaire.
- Terms get written to `CONTEXT.md` the moment they resolve, in your project's own words.
- It reaches into the codebase to answer its own questions where it can.
- ADRs stay rare — you're not asked to rubber-stamp reversible choices.

## Where it fits

`grill-with-docs` is the opening step of the main build chain:

```txt
grill-with-docs → to-spec → to-tickets → implement → code-review
```

It comes first, before anything is written down as a spec: it produces the shared understanding and settled vocabulary that [to-spec](https://aihero.dev/skills-to-spec) then synthesises into a spec without re-interviewing you. Its close neighbours are [grilling](https://aihero.dev/skills-grilling), the same interview without the docs, and [domain-modeling](https://aihero.dev/skills-domain-modeling), the glossary-and-ADR discipline it drives. When you're unsure which skill or flow fits, [ask-matt](https://aihero.dev/skills-ask-matt) routes you.
