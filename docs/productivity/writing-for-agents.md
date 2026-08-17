## What it does

`writing-for-agents` is the reference you write agent-facing documents against — a skill, an `AGENTS.md` / `CLAUDE.md`, a [spec](https://www.aihero.dev/ai-coding-dictionary/spec), a runtime prompt, a README, any doc an [agent](https://www.aihero.dev/ai-coding-dictionary/agent) reads. The packaging differs; the writing does not: the same levers make each one predictable, so the agent takes the same *process* every run rather than producing the same output.

Its default move is deletion, not explanation. Ask an agent to write instructions for another agent and it spends most of its words explaining what the [model](https://www.aihero.dev/ai-coding-dictionary/model) already knows — every one of those lines is a **no-op**, paying [context](https://www.aihero.dev/ai-coding-dictionary/context) and changing no behaviour. This reference is the lens that finds them, which is why it earns its keep at least as often on a document you already have as on a blank file.

It was called `writing-great-skills` until v1.1. The rename tracks what it always was underneath: almost none of it is skill-specific. The skill-only mechanics — frontmatter, the model- versus user-invoked choice, router skills — are disclosed to a linked `SKILL-MECHANICS.md` you read only when the document in front of you is a skill.

## When to reach for it

Type `/writing-for-agents`, or the agent reaches for it on its own when you're creating or editing a skill, or modifying `AGENTS.md` or `CLAUDE.md`.

Reach for it by hand for everything else an agent reads: your docs, specs and [tickets](https://www.aihero.dev/ai-coding-dictionary/ticket), system and [AFK](https://www.aihero.dev/ai-coding-dictionary/afk) prompts. The test is one question — does an agent read this? — and it does not matter how the document gets in front of it, whether a pointer names it, a human pastes it, or it simply sits in the repo. For working out what a codebase actually contains in the first place, use [grill-with-docs](https://aihero.dev/skills-grill-with-docs) — this reference governs how a document reads, not what it knows.

## The two loads

The idea the whole reference turns on is a pair of budgets every document and pointer spends:

- **Context load** — the cost of always-loaded material on the agent's window: an `AGENTS.md` line, a skill description, anything sitting in context every [turn](https://www.aihero.dev/ai-coding-dictionary/turn) whether or not it fires.
- **Cognitive load** — the cost on you: which documents exist, and when to reach for each. You are the index. Not a cost to minimise — it is the price of human agency.

Once you think in these two loads, most authoring decisions — split or don't, inline or disclose, point or push — become the same trade made in different places.

## The levers

- **[Context pointers](https://www.aihero.dev/ai-coding-dictionary/context-pointer)** — the reference held in context that names out-of-context material and encodes when to reach it. A skill description and an `AGENTS.md` line naming a doc are the same object; the pointer's *wording*, not its target, decides how reliably the agent reaches through it.
- **Information hierarchy** — the ladder from in-file step, to in-file reference, to disclosed reference behind a pointer. **[Progressive disclosure](https://www.aihero.dev/ai-coding-dictionary/progressive-disclosure)** is the move down that ladder so the top stays legible.
- **Completion criteria** — the clarity and demand of each step's done-condition, and the **legwork** that demand drives; the defence against **premature completion**.
- **Leading words** — a compact concept already in the model's pretraining (*tight*, *red*, *tracer bullet*) that the agent thinks with while running the document. It anchors twice: execution in the body, invocation in the pointer.
- **Pruning** — single source of truth, relevance, and the no-op test applied sentence by sentence, against **duplication**, **sediment** and **sprawl**.

## Common questions

**Where did `/writing-great-skills` go?**
It is this skill, renamed in v1.1. Practitioners were already pointing it at `AGENTS.md`, docs, specs, tickets and runtime prompts long before the name caught up; structure, leading words and pruning turn out to be the craft of any text an agent reads. There is no alias — reinstall under the new name.

**"Writing for agents" — so the agent does the writing?**
The other way round. You are the author; the agent is the reader. That is the whole difficulty of the genre: you are writing for a reader who has already read everything, so explanation is waste and precision is the entire job.

**Can't I just ask the agent to write it for me?**
You can, and it will produce something verbose. Left alone the model explains what it already knows, and it will not apply the no-op test or reach for a leading word on its own. Use the reference on the draft — a review pass is where most of its value lands.

**I asked an agent to trim a document and it cut the functionality.**
Agents told to "streamline" optimise for length, because length is the thing they can see. The no-op test is behavioural, not aesthetic: delete the line and ask whether the agent's behaviour changed. When a sentence fails, delete the whole sentence rather than trim words from it — and settle a disagreement about it by running the document, not by arguing.

**How do I know when it's done?**
When it works, and you can no longer find duplication, sediment or no-ops. There is no automated eval here; the check is a manual run plus the failure-mode vocabulary as a diagnostic. When a document misbehaves, that vocabulary is also the repair kit — name the failure mode first, then fix that.

**Should this live in `CLAUDE.md` or somewhere else?**
Ask which load you want to pay. `CLAUDE.md` loads into every [session](https://www.aihero.dev/ai-coding-dictionary/session) unconditionally; material behind a pointer costs only the pointer's own line until it fires. Anything that applies in one context out of ten is paying context load the nine other times.

**Do I need to rewrite my documents for each new model?**
Mostly no, and over-fitting to one model is its own trap. Updating for a new model is usually another no-op pass rather than a rewrite.

**My skill only works on the exact task I built it from.**
The common route — do the work once, then have the agent write it up as a skill — over-indexes on that one run, and the exemplars come out too specific. Keep the run as evidence, then abstract deliberately: strip what belonged to that repo and those files, and write for the class of task.

**English isn't my first language. Do I lose the leading-word advantage?**
No — finding the word that packs the most behaviour into the fewest [tokens](https://www.aihero.dev/ai-coding-dictionary/token) is work the reference does for you. It is one of the things it is for.

## It's working if

- The document gets shorter as it gets better, and you are surprised how little is left.
- You can point at a leading word and watch it doing work in more than one place.
- Nothing is stated twice, in any form. Duplication is the most reliable sign a document was never tested.
- Reference that only one branch needs sits behind a pointer rather than in the main file.

## Where it fits

This is a reach-for-it-anytime standalone reference. It has no neighbour in the chain because it sits underneath the whole set rather than beside any one skill: every skill here was written against it, and the documents the other skills leave behind — a `GLOSSARY.md` and its ADRs, a spec, a ticket — are exactly the text it governs once an agent has to read them. When you're unsure which skill or flow fits a task, [ask-matt](https://aihero.dev/skills-ask-matt) routes you over the whole set.
