Quickstart:

```bash
npx skills add mattpocock/skills --skill=writing-for-agents
```

```bash
npx skills update writing-for-agents
```

[Source](https://github.com/mattpocock/skills/tree/main/skills/productivity/writing-for-agents)

## What it does

`writing-for-agents` is the reference you write agent-facing documents against — skills, `AGENTS.md` / `CLAUDE.md`, and any doc an agent reaches by a pointer. The packaging differs; the writing does not: the same levers make each one predictable, so the agent takes the same *process* every run rather than producing the same output.

Formerly `writing-great-skills`. The rename tracks what the reference always was underneath: almost none of it is skill-specific. The universal core — context pointers, the two loads, the information hierarchy, completion criteria, leading words, pruning — applies to any document an agent consumes; the genuinely skill-only mechanics (frontmatter, the model- vs user-invoked choice, router skills) are disclosed to a linked `SKILL-MECHANICS.md` you read only when the document you're writing is a skill.

## When to reach for it

The agent reaches for it on its own whenever you're creating or editing a skill, or modifying `AGENTS.md` or `CLAUDE.md` — and you can still type `/writing-for-agents` to pull it up directly.

## The two loads

The concept the whole reference turns on is a pair of budgets every document and pointer spends:

- **Context load** — the cost of always-loaded material on the agent's window: an `AGENTS.md` line, a skill description, anything sitting in context every turn whether or not it fires.
- **Cognitive load** — the cost on the human: which documents exist and when to reach for each. You are the index. Not a cost to minimise — it's the price of human agency.

Once you're thinking in these two loads, most authoring decisions — split or don't, inline or disclose, point or push — become the same trade made in different places.

## The other levers

- **Context pointers** — the reference held in context that names out-of-context material and encodes when to reach it. A skill description and an `AGENTS.md` line pointing at a doc are the same object; the pointer's *wording*, not its target, decides when and how reliably the agent reaches through it.
- **Information hierarchy** — the ladder from in-file step, to in-file reference, to disclosed reference behind a pointer. **Progressive disclosure** is the move down that ladder so the top stays legible; **co-location** decides what sits beside each piece once placed.
- **Completion criteria** — the clarity and demand of each step's done-condition, and the **legwork** it drives; the defence against **premature completion**.
- **Leading words** — a compact concept already in the model's pretraining (*tight*, *red*, *tracer bullet*) that the agent thinks with while running the document; hunt restatements a single word can retire.
- **Pruning** — single source of truth, relevance, and the no-op test applied sentence by sentence, against **sediment** and **sprawl**.

## Where it fits

This is a reach-for-it-anytime standalone reference — the meta-skill you consult while building the rest of the set, not a step in a chain. When you're unsure which skill or flow fits a task, [ask-matt](https://aihero.dev/skills-ask-matt) routes you over the whole set.
