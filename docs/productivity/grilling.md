Quickstart:

```bash
npx skills add mattpocock/skills --skill=grilling
```

```bash
npx skills update grilling
```

[Source](https://github.com/mattpocock/skills/tree/main/skills/productivity/grilling)

## What it does

`grilling` is the relentless interview that stress-tests a plan or design before you build it. It maps the plan as a **design tree** — every decision branches into the decisions that hang off it — and works that tree in **rounds** until you and the agent share the same understanding.

Each round asks the whole **frontier**: every decision whose prerequisites are already settled — the questions it can put to you *now* without guessing at answers it hasn't heard yet. Your answers reshape the tree, pushing the frontier outward, and the next round asks whatever that unblocks. Thirteen questions land in a handful of rounds instead of thirteen. Every question comes with the agent's own recommended answer; any *fact* the environment can settle it dispatches to a background sub-agent rather than asking you — and it doesn't block on that research, only the questions downstream of it wait. It won't act on the plan until you confirm the shared understanding has been reached.

### Prefer one question at a time?

If the old one-at-a-time rhythm suited you better, keep it. Add a line to your global `CLAUDE.md`:

```
When grilling, ask one question at a time.
```

## When to reach for it

Type `/grilling`, or the agent reaches for it automatically when a task fits — this is the underlying primitive, not a user-only entry point.

Reach for it when a plan or design still has soft spots and you want them surfaced before code is written. In practice you usually invoke it through one of its two wrappers rather than by name: for a plain grilling session use [grill-me](https://aihero.dev/skills-grill-me); to have the session also write ADRs and a glossary as it goes, use [grill-with-docs](https://aihero.dev/skills-grill-with-docs).

## The decision tree

The mental model is a **design tree**: every plan branches into decisions, and decisions depend on each other. The **frontier** is the set of decisions whose prerequisites are all settled — the only questions that can be asked without guessing. `grilling` asks the whole frontier at once, then recomputes it from your answers, so a round is exactly the batch of questions that *don't* depend on each other. A question whose answer hinges on another still open this round waits for a later round. Asking in frontier-sized rounds keeps the dependency structure intact while sparing you a question-at-a-time drip.

## Pulled out on purpose

`grilling` is the **single source of truth** for the interview technique, split out as a model-invoked **primitive** so every skill that needs an interview can reach it instead of reinventing one. [grill-me](https://aihero.dev/skills-grill-me) and [grill-with-docs](https://aihero.dev/skills-grill-with-docs) are its two user-invoked front doors, but [improve-codebase-architecture](https://aihero.dev/skills-improve-codebase-architecture) and [triage](https://aihero.dev/skills-triage) also lean on it to pressure-test their own decisions.

Keeping the technique in one place means you can also reach for it directly when you just want the interview — without the ADR-writing or ticket-shaping that its wrappers add on top.

## Where it fits

`grilling` is the interview **primitive** under the main build chain: [grill-with-docs](https://aihero.dev/skills-grill-with-docs) runs it to sharpen context before [to-spec](https://aihero.dev/skills-to-spec) writes the spec. When you're unsure which entry point fits, [ask-matt](https://aihero.dev/skills-ask-matt) routes you.
