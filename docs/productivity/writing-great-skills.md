Quickstart:

```bash
npx skills add mattpocock/skills --skill=writing-great-skills
```

```bash
npx skills update writing-great-skills
```

[Source](https://github.com/mattpocock/skills/tree/main/skills/productivity/writing-great-skills)

## What it does

`writing-great-skills` is the reference you write and edit skills against — the shared vocabulary and principles that make a skill predictable.

A skill's job is to wrangle determinism out of a stochastic system, so the goal is not the same *output* every run but the same *process*. **Predictability** is the root virtue, and every design choice is judged against it — not against how clever, complete, or exhaustive the skill reads.

## When to reach for it

You invoke this by typing `/writing-great-skills` — the agent won't reach for it on its own.

Reach for it whenever you're authoring a new skill or editing an existing one and want it to behave the same way every time: deciding invocation mode, writing a description, choosing what lives in `SKILL.md` versus a linked file, or diagnosing why a skill misfires.

## Cognitive load

The concept the whole reference turns on is **cognitive load** — and its counterpart, **context load**. Every skill spends one or the other:

- A **model-invoked** skill keeps its description in the model's skill list, so it costs **context load** but fires on its own.
- A **user-invoked** skill keeps its description for the picker but is excluded from the model's default context; it costs zero context load, but now *you* are the index that has to remember it exists — that's **cognitive load**.

Most of these skills are user-invoked, which is why cognitive load is the pressure the whole system is built to manage: when user-invoked skills multiply past what you can hold in your head, the cure is a **router skill** that names the others and when to reach for each. Once you're thinking in these two loads, most authoring decisions — split or don't, inline or disclose, model- or user-invoked — become the same trade made in different places.

Provider-specific invocation metadata can coexist: Claude Code uses `argument-hint` in `SKILL.md`, while Codex uses a natural `interface.default_prompt` in `agents/openai.yaml`. Codex safely ignores the Claude-only field; its default prompt is a starter rather than argument expansion.

## The other levers

The rest of the reference is the toolkit for spending those loads well:

- **Leading words** — a compact concept already in the model's pretraining (_tight_, _red_, _tracer bullet_) that the agent thinks with while running the skill. It anchors execution *and* invocation in the fewest tokens; hunt restatements that a single word can retire.
- **Information hierarchy** — the ladder from in-skill step, to in-skill reference, to external reference behind a **context pointer**. **Progressive disclosure** is the move down that ladder so the top stays legible.
- **Pruning** — single source of truth, relevance, and the no-op test applied sentence by sentence, against **sediment** and **sprawl**.
- **Failure modes** — **premature completion**, **duplication**, **sediment**, **sprawl**, **no-op** — to diagnose a skill that isn't behaving.

## Where it fits

This is a reach-for-it-anytime standalone reference — the meta-skill you consult while building the rest of the set, not a step in a chain. Its natural neighbour is any router you maintain, because a router is the direct cure for the cognitive load that user-invoked skills pile up; when you're unsure which skill or flow fits a task, [ask-matt](https://aihero.dev/skills-ask-matt) routes you over the whole set.
