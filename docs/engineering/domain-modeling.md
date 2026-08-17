## What it does

`domain-modeling` builds and sharpens a project's **ubiquitous language** while you are designing — challenging a term that conflicts with the glossary, forcing a precise word where you used a vague one, and stress-testing a relationship with a concrete scenario until the boundaries are exact.

It is the **active** discipline, not the passive one. Reading `GLOSSARY.md` to borrow its vocabulary is a one-line habit any skill can do; this skill is for when you are *changing* the model. That is what makes it interrupt. It writes a resolved term into `GLOSSARY.md` at the moment it is resolved, in the middle of the conversation, rather than producing a tidy glossary at the end — because the batched version is a summary of a [session](https://www.aihero.dev/ai-coding-dictionary/session), and the inline version is the session's actual output.

## When to reach for it

Type `/domain-modeling`, or the agent reaches for it automatically when a task fits. In practice, automatic invocation is the weakest part of the skill: when `grill-with-docs` or `wayfinder` say to load it, [models](https://www.aihero.dev/ai-coding-dictionary/model) frequently load `grilling` and skip this one. If a [grilling](https://www.aihero.dev/ai-coding-dictionary/grilling) session runs and `GLOSSARY.md` is untouched at the end, that is what happened — invoke it by name alongside the other skill.

Reach for it when the *words* are the problem:

| The situation | The move |
| --- | --- |
| Two people mean different things by "cancellation" | `domain-modeling` — pick the canonical term, list the other under `_Avoid_` |
| "Account" is doing three jobs in three files | `domain-modeling` — split it into Customer and User |
| You just made a hard-to-reverse architectural choice | `domain-modeling` — it offers an ADR, if the choice clears the bar |
| The module's *shape* is the problem — where the seam goes, how deep the interface is | [codebase-design](https://aihero.dev/skills-codebase-design) |
| You want the whole plan interrogated before you build | [grill-with-docs](https://aihero.dev/skills-grill-with-docs), which drives this skill underneath |
| You want a term looked up, not changed | Nothing. Read `GLOSSARY.md`. It is a file. |

## Prerequisites

None up front. The skill writes into two places and creates both lazily:

- **`GLOSSARY.md`** at the repo root, created by the first resolved term. In a repo with a `GLOSSARY-MAP.md` at the root, terms go into the per-context `GLOSSARY.md` the map points at instead.
- **`docs/adr/`**, created by the first ADR that clears the bar.

Nothing needs to exist before you start, and nothing is created speculatively.

## Two artifacts, two bars

The glossary and the ADR are held to different standards, and conflating them is where most of the trouble in this skill comes from.

| | `GLOSSARY.md` | `docs/adr/NNNN-slug.md` |
| --- | --- | --- |
| Holds | Terms. What a thing **is**, in one or two sentences, with rejected synonyms under `_Avoid_` | One decision, in one to three sentences: context, choice, reason |
| Bar to write | A vague term became canonical | **All three**: hard to reverse, surprising without context, the result of a real trade-off |
| Written | Inline, the moment the term is settled | Offered, not assumed |
| Never holds | Implementation details, a [spec](https://www.aihero.dev/ai-coding-dictionary/spec), a scratch pad, general programming concepts | A diary of every choice made this session |

Miss any one of the ADR's three tests and there is no ADR. An easily-reversed decision will just get reversed; an unsurprising one is nobody's question; one with no real alternative records that you did the obvious thing.

The `GLOSSARY.md` rule is the one to actually hold onto, because it is the one that breaks in the field. **It is a glossary and nothing else.** Left unchecked, models treat "write to `GLOSSARY.md`" as permission to persist every answer you give, and the file turns into a running spec — this is the most-reported problem with the skill, across several models.

## Cross-referencing, and where it stops

The move that makes the skill click: when you state how something works, it checks the code and surfaces the contradiction. *"Your code cancels entire Orders, but you just said partial cancellation is possible — which is right?"* The language and the code are made to agree, out loud, before either is changed.

The limit is worth knowing. It cross-references **code** and the committed `GLOSSARY.md`/ADRs, and nothing else. It does not search your issue tracker, so a naming collision that was argued out and deliberately settled in a closed issue months ago gets surfaced as if it were new. There is [an open request](https://github.com/mattpocock/skills/issues/717) to fix this; until then, the workaround is to put the instruction in your own `docs/agents/domain.md`, which the skills already read.

## Common questions

**My `GLOSSARY.md` is 500 lines. 1,000. 3,000. What do I do?**
The size is a symptom, not the disease — the file has absorbed implementation detail and decisions that were never glossary material. The fix is a direct instruction: `/grill-with-docs make my GLOSSARY.md more concise and remove any implementation details from it`. Run it against a bloated file and most of it goes. Only reach for a `GLOSSARY-MAP.md` split once the file is genuinely lean and still covers two domains that a reader would not want to hold at once; splitting a bloated file just gives you several bloated files. The skill's guidance here is not yet strong enough to prevent the growth in the first place, and the issue tracking that is still open.

**Why is it `GLOSSARY.md` and not `CONTEXT.md`?**
It used to be `CONTEXT.md`, and this was the most-argued naming question in the whole skill set. The case against the old name was good: if it is "a glossary and nothing else", `GLOSSARY.md` says so, and — as one reader put it — "with ai agents everything is [context](https://www.aihero.dev/ai-coding-dictionary/context)". The case for `CONTEXT.md` was the map: `CONTEXT-MAP.md` pointing at several `CONTEXT.md` files read naturally in a way `GLOSSARY-MAP.md`/`GLOSSARY.md` doesn't quite, and `context` is the standing DDD word for a bounded area of the model. The naming case eventually won out over the map's cadence, and every skill in the set that reads or writes the file was repointed to `GLOSSARY.md`/`GLOSSARY-MAP.md` in the same change. If you have an older repo with a `CONTEXT.md` from before the rename, `git mv` it to `GLOSSARY.md` (and `CONTEXT-MAP.md` to `GLOSSARY-MAP.md`, if present) — the skills only look for the new names.

**Where did `/ubiquitous-language` go?**
It was removed, and it was not deprecated. Its job moved into `domain-modeling`, which maintains the whole model continuously rather than dumping a glossary out of one conversation. Vocabulary enforcement got more load-bearing, not less — it now runs underneath grilling, triage and mapping rather than as a separate pass you remember to do.

**How do I get a glossary for a codebase that has none?**
Ask for it explicitly rather than waiting for it to accumulate. `/grill-with-docs help me scaffold my existing repo with a GLOSSARY.md` is the documented route; expect a long interrogation — one user reported 50+ questions before the file was in shape. Incidental use builds the glossary far too slowly on a brownfield repo.

**Can I keep the domain model and use my own ADR format?**
Not cleanly today. The glossary half and the ADR half ship in one skill, so a team with an established ADR convention — different template, different location, different naming — gets instructions that conflict with its house style. The current options are to copy the skill locally and edit it, or to override the ADR conventions in your repo's own agent docs. Splitting the two apart is [an open request](https://github.com/mattpocock/skills/issues/557).

**Does a glossary actually earn its keep? It is one more artifact to review, and it can go stale.**
Sometimes it does not, and it is worth being honest about where. DDD gets less useful the closer it gets to the implementation — the payoff is upstream, in naming and concept alignment, not in aggregates and layer ceremony. Synonym control matters at naming boundaries: module names, table names, status enums, issue titles, CLI commands. It matters much less in ordinary prose. There is also a live objection that domain terms compress communication *between humans* who already share them, and that an agent responds the same way to the plain-English description — on that reading, the glossary's value is keeping you and your reviewers aligned with what the agent is doing, not making the agent better. On a one-day build, skip it. And an unreviewed, agent-authored glossary is worse than none: it becomes confident-sounding lore that later sessions treat as truth.

**Can it turn my vague prompts into domain language for me?**
No, and there is no plan for a skill that does. A domain language you do not understand yourself becomes meaningless drivel once written down. This skill enforces precision once you have the understanding — it does not manufacture vocabulary you do not have. The related trap is using domain words without doing the modelling: right nouns over the wrong conceptual structure produce output that reads correct and is not.

## It's working if

- It stops you mid-sentence to ask which of two things you meant, instead of picking one and moving on.
- `GLOSSARY.md` changes **during** the conversation, not in a burst at the end.
- It refuses to write an ADR for something you could undo tomorrow — and says which of the three tests failed.
- New entries define what a thing *is* in one or two sentences and name the words you are giving up under `_Avoid_`.
- It quotes your code back at you when your code and your sentence disagree.
- `GLOSSARY.md` gets shorter as often as it gets longer.

## Where it fits

`domain-modeling` is a **model-invoked reference** that runs *underneath* other skills more often than it runs on its own. [grill-with-docs](https://aihero.dev/skills-grill-with-docs) drives it through a grilling session, [wayfinder](https://aihero.dev/skills-wayfinder) loads it while charting a map, [triage](https://aihero.dev/skills-triage) uses it to keep [tickets](https://www.aihero.dev/ai-coding-dictionary/ticket) in the project's own words, and [improve-codebase-architecture](https://aihero.dev/skills-improve-codebase-architecture) calls it as decisions crystallise. Its closest sibling is [codebase-design](https://aihero.dev/skills-codebase-design): the two are the vocabulary layer under everything else, this one for the *domain*, that one for the module's *shape*. It is also reachable directly, when you want the discipline without committing to the steps of whatever skill would normally pull it in. When you are unsure which skill fits, [ask-matt](https://aihero.dev/skills-ask-matt) routes you.
