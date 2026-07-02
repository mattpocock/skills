Quickstart:

```bash
npx skills add mattpocock/skills --skill=domain-modeling
```

```bash
npx skills update domain-modeling
```

[Source](https://github.com/mattpocock/skills/tree/main/skills/engineering/domain-modeling)

## What it does

`domain-modeling` builds and sharpens a project's **ubiquitous language** as you design — challenging fuzzy terms, stress-testing relationships with concrete scenarios, and writing the glossary and decisions down the moment they crystallise.

This is the **active** discipline, not the passive one. Merely reading `CONTEXT.md` to borrow its vocabulary is a one-line habit any skill can do; this skill is for when you are *changing* the model — coining a canonical term, catching a contradiction between the code and what you just said, recording a hard-to-reverse decision. And it keeps the glossary clean: `CONTEXT.md` is a glossary and nothing else — no implementation details, no spec, no scratch pad.

## When to reach for it

Type `/domain-modeling`, or the agent reaches for it automatically when a task fits — when you are pinning down terminology, resolving an overloaded word, or recording an architectural decision.

Reach for it when the *words* are the problem: two people mean different things by "cancellation", "account" is doing three jobs, or a design conversation keeps snagging on a concept that has never been named precisely. If instead the module's *shape* is the problem — where the seam goes, how deep the interface is — use [codebase-design](https://aihero.dev/skills-codebase-design). If you want the plan itself interrogated before you build, use [grilling](https://aihero.dev/skills-grilling).

## Prerequisites

The skill writes into two places, both created lazily — only once there is something to record. Resolved terms go into `CONTEXT.md` at the root (or, in a multi-context repo flagged by a `CONTEXT-MAP.md`, into the per-context `CONTEXT.md`). Decisions go into `docs/adr/`. Nothing needs to exist up front; the first resolved term creates the glossary, the first real trade-off creates the ADR.

## Glossary vs. ADR

Two artifacts, two different bars:

- **The glossary** (`CONTEXT.md`) captures language. Every time a vague term is made canonical, it's written down inline — not batched — so the shared vocabulary stays current with the conversation. It stays ruthlessly free of implementation detail.
- **An ADR** captures a decision, and the bar is high: offered only when the choice is **hard to reverse**, **surprising without context**, and **the result of a real trade-off**. Miss any one of the three and there is no ADR. This is what keeps `docs/adr/` a record of consequential forks rather than a diary.

The move that makes it click: when you state how something works, the skill cross-references the code and surfaces the contradiction — "your code cancels entire Orders, but you just said partial cancellation is possible — which is right?" The language and the code are forced to agree.

## Pulled out on purpose

`domain-modeling` is the **single source of truth** for building the project's ubiquitous language, split out as its own model-invoked skill so any other skill can reach it. [grill-with-docs](https://aihero.dev/skills-grill-with-docs) leans on it to record terms and decisions as a grilling session runs, [triage](https://aihero.dev/skills-triage) uses it to keep tickets in the project's own words, and [improve-codebase-architecture](https://aihero.dev/skills-improve-codebase-architecture) reaches for it while it works.

Keeping it standalone means you can also reach for it directly — as a **reference** for how to sharpen a model — without committing to the steps any of those skills mandate. The language lives in one place, and everything that needs it points there.

## Where it fits

`domain-modeling` is a **reach-for-it-anytime standalone** that runs *underneath* other skills as often as at a fixed step. Its closest neighbour is [codebase-design](https://aihero.dev/skills-codebase-design), because a shared language is what lets you name a deep module and its seam precisely; downstream, a settled glossary is exactly what [to-spec](https://aihero.dev/skills-to-spec) synthesises into a spec written in the project's own words. When you're unsure which skill or flow fits, [ask-matt](https://aihero.dev/skills-ask-matt) routes you.
