## What it does

`grilling` is the interview loop that stress-tests a plan, a decision, or an idea before anyone acts on it. It maps the subject as a **design tree** — every decision branches into the decisions that hang off it — and interviews you branch by branch until nothing is left silently assumed.

It does not ask one question at a time, and it does not ask everything at once. Each **round** asks the whole **frontier**: every decision whose prerequisites are already settled, and nothing else. Two questions never share a round if one depends on the other — a question that hinges on an answer still open belongs to a later round. Your answers settle decisions, the frontier moves outward, and the next round asks what that unblocked. Thirteen questions typically land in about three rounds rather than thirteen.

## When to reach for it

Type `/grilling`, or the [agent](https://www.aihero.dev/ai-coding-dictionary/agent) reaches for it on its own when a task fits. It is the only [skill](https://www.aihero.dev/ai-coding-dictionary/skill) in the grilling family that is model-invoked, which is why you rarely type it: usually a skill you *did* type is running it for you.

Typing `/grilling` directly gets you the plain interview and nothing else. Where you want something more than that:

| What you have | Reach for |
| --- | --- |
| You aren't working in a working directory | [grill-me](https://aihero.dev/skills-grill-me) — the same [session](https://www.aihero.dev/ai-coding-dictionary/session), under a name the agent will never fire by itself |
| You are in a working directory | [grill-with-docs](https://aihero.dev/skills-grill-with-docs) — the same session, and it writes `GLOSSARY.md` and ADRs as it goes |
| An effort too big to hold in one session | [wayfinder](https://aihero.dev/skills-wayfinder) — it charts a map and runs grilling inside the decision tickets |
| A question that talking cannot settle — how something should look or feel | [prototype](https://aihero.dev/skills-prototype) — build the throwaway version, then come back |
| A skill of your own that needs an interview | Invoke `/grilling` from it, rather than writing another interview |

## The round, the frontier, and who decides

Three ideas carry the whole skill.

The **design tree** is the model of the subject: decisions with decisions hanging off them. The **frontier** is the set of decisions whose prerequisites are all settled — the only questions that can honestly be asked yet. A **round** is one frontier, asked in full and answered in full.

Inside a round every question arrives in a fixed shape: numbered and titled behind a `❓`, then the body, then the agent's recommended answer alone on a `➡️` line. That is what makes a round answerable by number — "1 yes, 2 the second option, 3 no, here's why" — instead of by quoting questions back. The format has one known rough edge: the recommendation sometimes argues *against* the question as it was worded, so agreeing with the recommendation means answering "no" to the question. When that happens, answer the recommendation and say so.

The other half of the design is the split between facts and decisions. Facts are the skill's own job: when a frontier question needs something the [environment](https://www.aihero.dev/ai-coding-dictionary/environment) can settle, it dispatches a [sub-agent](https://www.aihero.dev/ai-coding-dictionary/subagent) to go and find out rather than asking you. It does not block on that — only the questions downstream of a running exploration wait. Decisions are yours, and it must wait for them. An agent running `grilling` that answers its own decisions has broken the skill, not interpreted it liberally. The session ends when the frontier is empty, and it will not act on what you agreed until you confirm you have reached a shared understanding.

The honest limit: the frontier is the agent's judgement, not a computed graph. It can put two questions in one round and only afterwards discover that one answer should have changed the other. There is no guard against that beyond telling it, which reopens the affected branch in the next round.

## What lives here and what lives in the wrappers

This page covers the mechanism. The things people most often want are documented one level up.

| Question | Where it is answered |
| --- | --- |
| The tree, the frontier, rounds, the question format, facts vs decisions | Here |
| How long a session should run, what to do with a question you can't answer by talking, how to avoid nodding along | [grill-me](https://aihero.dev/skills-grill-me) |
| What gets written to `GLOSSARY.md`, what becomes an ADR | [grill-with-docs](https://aihero.dev/skills-grill-with-docs) |

## Common questions

**Can I go back to one question at a time?**
Yes, and a large part of the audience does. Add this to your global `CLAUDE.md`:

```
When grilling, ask one question at a time.
```

The round-based default is genuinely contested. Practitioners who read slowly, who work in a second language, or who use the sequential format as focus scaffolding all report the one-at-a-time rhythm is better for them, and the opt-out is supported rather than tolerated.

**Where did `/batch-grill-me` go?**
Into this skill. Round-based questioning shipped briefly as a separate skill, then moved into `grilling` itself, so everything built on the primitive — `grill-me`, `grill-with-docs`, `triage`, `wayfinder` — got it at once. There is no `batch-grill-me` to install, and no separate sequential skill either; the `CLAUDE.md` line above is the way back to one-at-a-time.

**Asking a whole round at once must lose the questions my earlier answers would have raised. Doesn't it?**
This is the most common objection to the round design, and the frontier is the answer to it: a round only ever contains questions that do not depend on each other, so no answer in a round can invalidate another question in that round. Answers still reshape everything downstream — the next round is recomputed, not pre-written. What you lose is smaller than "all questions at once" implies, and larger than nothing: see the frontier's limit above.

**It ran out of questions and started building.**
A confirmation gate exists precisely for this: the skill is not finished when the frontier empties, it is finished when you say the understanding is shared. Weaker and faster [models](https://www.aihero.dev/ai-coding-dictionary/model) still break it — this is reported most often on lower-effort or non-frontier models, which collapse "interview until shared understanding" into a couple of questions and an outline. If yours does it, the reliable fix is a line in your own `AGENTS.md` or `CLAUDE.md` telling the agent not to implement without permission.

**It answered its own questions instead of asking me.**
That is a bug in the run, not the intended behaviour, and it was the reason facts and decisions were separated in the skill's text. It shows up most when another skill runs `grilling` inside a resolve-this-ticket frame, where the surrounding task reads as licence to keep moving. The same constraint is why there is no async mode: people have asked for a variant that reads a GitHub issue and posts one consolidated decision memo, and that is a different skill, because a grilling session that nobody answers has produced the agent's opinion rather than yours.

**Can I cap the number of questions?**
No, and a cap is deliberately out of scope. Some plans need three questions and some need fifty; a fixed ceiling either truncates the hard case or feels arbitrary on the easy one. Steering in plain language is the intended control — tell it to wrap up, or stop and accept the plan where it stands. If a session is running very long, the cause is usually that the scope was too big; break the work up and grill the pieces.

**I installed `grill-me` on its own and nothing happens.**
`grill-me` is a one-line skill whose whole body is "run a `/grilling` session", so it needs this skill installed too. The same is true of `grill-with-docs`, which additionally needs [domain-modeling](https://aihero.dev/skills-domain-modeling). Installing the whole set avoids the problem; installing selectively means installing the primitives as well.

**`grill-with-docs` ran, but it never loaded `grilling`.**
A real and unfixed rough edge, reported across [harnesses](https://www.aihero.dev/ai-coding-dictionary/harness) and models: a skill that names another skill does not reliably cause that skill to load, and `grill-with-docs` names two. The tell is a session that asks everything at once with no recommendations attached — that is the model improvising an interview rather than running this one. Asking the agent directly whether it loaded `grilling` and `domain-modeling` usually recovers it.

## It's working if

- A round arrives as a numbered list, each question with its recommendation on a separate `➡️` line, and you can answer the whole round by number.
- Nothing in a round needs another question in the same round answered first.
- Later rounds ask things the first round could not have asked.
- It goes and looks facts up — reading files, dispatching a sub-agent — rather than asking you something it could have found out.
- Research running in the background does not stall the round; only the questions that depend on it wait.
- It stops at the end and asks you to confirm the understanding is shared, instead of starting work.
- Question count stays high while round count stays low.

## Where it fits

`grilling` is a **primitive**, not a step you schedule: the single source of truth for the interview technique, kept in one place so every skill that needs an interview reaches for it instead of inventing one. [grill-me](https://aihero.dev/skills-grill-me) and [grill-with-docs](https://aihero.dev/skills-grill-with-docs) are its two user-invoked front doors, and `grill-with-docs` is where the main build chain begins, ahead of [to-spec](https://aihero.dev/skills-to-spec). [wayfinder](https://aihero.dev/skills-wayfinder) runs it to resolve decision tickets, [triage](https://aihero.dev/skills-triage) to grill a vague report into a workable one, and [improve-codebase-architecture](https://aihero.dev/skills-improve-codebase-architecture) to walk the tree once you have picked a candidate to deepen. When you are unsure which entry point fits, [ask-matt](https://aihero.dev/skills-ask-matt) routes you.
