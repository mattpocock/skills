Quickstart:

```bash
npx skills add mattpocock/skills --skill=grill-me
```

```bash
npx skills update grill-me
```

[Source](https://github.com/mattpocock/skills/tree/main/skills/productivity/grill-me)

## What it does

`grill-me` runs a relentless interview about a plan or design, walking every branch of the decision tree until you and the agent reach a **shared understanding**.

It asks **one question at a time** and waits. It never dumps a batch of questions at you — that is bewildering — and where a question can be answered by reading the codebase, it goes and reads rather than asking. Each question comes with the agent's own recommended answer, so you are reacting to a proposal, not staring at a blank prompt.

## When to reach for it

You invoke this by typing `/grill-me` — the agent won't reach for it on its own.

Reach for it before you build, when a plan feels roughly right but you can sense unresolved decisions hiding in it — the moment you want the soft spots found and forced into the open. If you want that same interrogation to also leave a paper trail of ADRs and a glossary behind, use [grill-with-docs](https://aihero.dev/skills-grill-with-docs) instead.

## The design tree

The session walks the plan as a tree of decisions, resolving dependencies between them one by one — a parent decision settled before the choices that hang off it. The point is not to reach agreement quickly; it is to make every implicit call explicit, so nothing important is left silently assumed. You come out the other side with a plan whose branches have all been visited.

`grill-me` is **stateless**: it writes nothing and leaves no workspace behind. It runs anywhere, and the only artifact is the sharpened understanding in the conversation itself. That is the deliberate contrast with [grill-with-docs](https://aihero.dev/skills-grill-with-docs), which captures the same interview as durable ADRs and a glossary.

## Where it fits

`grill-me` is a reach-for-it-anytime standalone — the pre-build stress test you run whenever a plan needs hardening. It is the stateless, user-invoked front door to the [grilling](https://aihero.dev/skills-grilling) primitive; its closest neighbour is [grill-with-docs](https://aihero.dev/skills-grill-with-docs), the stateful sibling that runs the same interview but additionally records the decisions as ADRs and a glossary. If the outcome is a spec you want written down, hand off to [to-spec](https://aihero.dev/skills-to-spec), which synthesises the settled understanding into a spec without re-interviewing you. When you're unsure which flow fits, [ask-matt](https://aihero.dev/skills-ask-matt) routes you.
