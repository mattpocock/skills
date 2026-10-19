## What it does

`domain-modeling` builds and sharpens a project's **ubiquitous language** while you are designing. It challenges a term that conflicts with the glossary, asks for a precise word where you used a vague one, and tests a relationship against a concrete scenario until the boundaries are exact.

It is the **active** discipline, not the passive one. Any skill can read `GLOSSARY.md` to borrow its vocabulary. This skill is for when you are *changing* the model, which is why it interrupts you. It writes a term into `GLOSSARY.md` at the moment you settle it, in the middle of the conversation, rather than producing a tidy glossary at the end. A glossary written at the end is a summary of a [session](https://www.aihero.dev/ai-coding-dictionary/session); the inline version is the session's output.

## When to reach for it

Type `/domain-modeling`, or the agent reaches for it automatically when a task fits. In practice, automatic invocation is the weakest part of the skill. When `grill-with-docs` or `wayfinder` say to load it, [models](https://www.aihero.dev/ai-coding-dictionary/model) often load `grilling` and skip this one. If a [grilling](https://www.aihero.dev/ai-coding-dictionary/grilling) session runs and `GLOSSARY.md` is unchanged at the end, that is what happened. Invoke it by name alongside the other skill.

Reach for it when the *words* are the problem:

| The situation | The move |
| --- | --- |
| Two people mean different things by "cancellation" | `domain-modeling`: pick the canonical term, list the other under `_Avoid_` |
| "Account" is doing three jobs in three files | `domain-modeling`: split it into Customer and User |
| You just made a hard-to-reverse architectural choice | `domain-modeling`: it offers an ADR, if the choice clears the bar |
| The module's *shape* is the problem: where the seam goes, how deep the interface is | [codebase-design](https://aihero.dev/skills-codebase-design) |
| You want the whole plan interrogated before you build | [grill-with-docs](https://aihero.dev/skills-grill-with-docs), which drives this skill underneath |
| You want a term looked up, not changed | Nothing. Read `GLOSSARY.md`. It is a file. |

## Prerequisites

None up front. The skill writes into two places and creates both lazily:

- **`GLOSSARY.md`** at the repo root. The skill creates it when you settle the first term. In a repo with a `GLOSSARY-MAP.md` at the root, terms go into the per-context `GLOSSARY.md` the map points at instead.
- **`docs/adr/`**. The skill creates it with the first ADR that clears the bar.

Nothing needs to exist before you start, and the skill creates nothing in advance.

## Two artifacts, two bars

The glossary and the ADR have different bars. Most of the trouble with this skill comes from mixing them up.

| | `GLOSSARY.md` | `docs/adr/NNNN-slug.md` |
| --- | --- | --- |
| Holds | Terms. What a thing **is**, in one or two sentences, with rejected synonyms under `_Avoid_` | One decision, in one to three sentences: context, choice, reason |
| Bar to write | A vague term became canonical | **All three**: hard to reverse, surprising without context, the result of a real trade-off |
| Written | Inline, the moment the term is settled | Offered, not assumed |
| Never holds | Implementation details, a [spec](https://www.aihero.dev/ai-coding-dictionary/spec), a scratch pad, general programming concepts | A diary of every choice made this session |

Miss any one of the ADR's three tests and there is no ADR. An easily-reversed decision will just get reversed; an unsurprising one is nobody's question; one with no real alternative records that you did the obvious thing.

The `GLOSSARY.md` rule matters most, because it is the one that breaks in practice. **It is a glossary and nothing else.** Left unchecked, models treat "write to `GLOSSARY.md`" as permission to persist every answer you give, and the file turns into a running spec. This is the most-reported problem with the skill, across several models.

## Cross-referencing, and where it stops

When you state how something works, the skill checks the code and points out any contradiction. *"Your code cancels entire Orders, but you just said partial cancellation is possible, which is right?"* The skill makes the language and the code agree, out loud, before it changes either.

It cross-references **code** and the committed `GLOSSARY.md` and ADRs, and nothing else. It does not search your issue tracker. If your team argued out a naming collision and settled it in a closed issue months ago, the skill raises it again as if it were new. There is [an open request](https://github.com/mattpocock/skills/issues/717) to fix this. Until then, the workaround is to put the instruction in your own `docs/agents/domain.md`, which the skills already read.

## Common questions

**My `GLOSSARY.md` is 500 lines. 1,000. 3,000. What do I do?**
The size is a symptom. The cause is that the file has taken in implementation detail and decisions that never belonged in a glossary. The fix is a direct instruction: `/grill-with-docs make my GLOSSARY.md more concise and remove any implementation details from it`. Run it against a bloated file and most of it goes. Only split it with a `GLOSSARY-MAP.md` once the file is lean and still covers two domains that a reader would not want to hold at once. Splitting a bloated file gives you several bloated files. The skill's guidance here is not yet strong enough to prevent the growth in the first place, and the issue tracking that is still open.

**Why is it `GLOSSARY.md` and not `CONTEXT.md`?**
It was `CONTEXT.md` (and `CONTEXT-MAP.md`) until 1.3.0. The file is a glossary and nothing else, so `GLOSSARY.md` says so, and, as one reader put it, "with ai agents everything is [context](https://www.aihero.dev/ai-coding-dictionary/context)". If your repo still has a `CONTEXT.md`, re-run `/setup-matt-pocock-skills`: it offers to `git mv` the file and update `docs/agents/domain.md`. Every skill in the set looks for `GLOSSARY.md`, so keeping the old name means patching all of them.

**Where did `/ubiquitous-language` go?**
It was removed, and it was not deprecated. Its job moved into `domain-modeling`, which maintains the whole model continuously rather than dumping a glossary out of one conversation. Vocabulary enforcement now matters more, not less. It runs underneath grilling, triage and mapping rather than as a separate pass you have to remember.

**How do I get a glossary for a codebase that has none?**
Ask for it explicitly rather than waiting for it to accumulate. `/grill-with-docs help me scaffold my existing repo with a GLOSSARY.md` is the documented route. Expect a long interrogation. One user reported more than 50 questions before the file was in shape. Incidental use builds the glossary far too slowly on a brownfield repo.

**Can I keep the domain model and use my own ADR format?**
Not cleanly today. The glossary half and the ADR half ship in one skill, so a team with an established ADR convention (different template, different location, different naming) gets instructions that conflict with its house style. The current options are to copy the skill locally and edit it, or to override the ADR conventions in your repo's own agent docs. Splitting the two apart is [an open request](https://github.com/mattpocock/skills/issues/557).

**Does a glossary actually earn its keep? It is one more artifact to review, and it can go stale.**
Sometimes it does not. DDD gets less useful the closer it gets to the implementation. The payoff is upstream, in naming and concept alignment, not in aggregates and layer ceremony. Synonym control matters at naming boundaries: module names, table names, status enums, issue titles, CLI commands. It matters much less in ordinary prose. There is also an objection that domain terms compress communication *between humans* who already share them, and that an agent responds the same way to the plain-English description. On that reading, the glossary's value is keeping you and your reviewers aligned with what the agent is doing, not making the agent better. On a one-day build, skip it. And an unreviewed, agent-authored glossary is worse than none: it fills with confident claims that later sessions treat as true.

**Can it turn my vague prompts into domain language for me?**
No, and there is no plan for a skill that does. A domain language you do not understand yourself is meaningless once written down. This skill enforces precision once you have the understanding; it does not invent vocabulary you do not have. The related trap is using domain words without doing the modelling. The right nouns on top of the wrong concepts produce output that reads as correct and is not.

## It's working if

- It stops you mid-sentence to ask which of two things you meant, instead of picking one and moving on.
- `GLOSSARY.md` changes **during** the conversation, not in a burst at the end.
- It refuses to write an ADR for something you could undo tomorrow, and says which of the three tests failed.
- New entries define what a thing *is* in one or two sentences and name the words you are giving up under `_Avoid_`.
- It quotes your code back at you when your code and your sentence disagree.
- `GLOSSARY.md` gets shorter as often as it gets longer.

## Where it fits

`domain-modeling` is a **model-invoked reference** that runs *underneath* other skills more often than it runs on its own. [grill-with-docs](https://aihero.dev/skills-grill-with-docs) drives it through a grilling session, [wayfinder](https://aihero.dev/skills-wayfinder) loads it while charting a map, [triage](https://aihero.dev/skills-triage) uses it to keep [tickets](https://www.aihero.dev/ai-coding-dictionary/ticket) in the project's own words, and [improve-codebase-architecture](https://aihero.dev/skills-improve-codebase-architecture) calls it as decisions settle. Its closest sibling is [codebase-design](https://aihero.dev/skills-codebase-design). Together they are the vocabulary layer under everything else, this one for the *domain*, that one for the module's *shape*. It is also reachable directly, when you want the discipline without committing to the steps of whatever skill would normally load it. When you are unsure which skill fits, [ask-matt](https://aihero.dev/skills-ask-matt) routes you.
