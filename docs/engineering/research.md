## What it does

`research` answers a question by reading the sources that own the answer, then leaves a cited Markdown file in the repo. It works only from **[primary sources](https://www.aihero.dev/ai-coding-dictionary/primary-source)** — official docs, source code, specs, first-party APIs — and follows every claim back to the source that owns it, so it will not repeat a blog post's account of an API when the API's own docs are reachable.

It does not answer you in the conversation. The output is a file, written where the repo already keeps such notes, with a link on each claim. That is the point: a document you can react to, hand to another agent, or throw away, rather than an answer that vanishes when the [session](https://www.aihero.dev/ai-coding-dictionary/session) ends.

## When to reach for it

Type `/research`, or the [agent](https://www.aihero.dev/ai-coding-dictionary/agent) reaches for it automatically when a task turns into reading legwork.

Reach for it when the next step is *finding something out* from outside the working directory — how a third-party API behaves, what a spec actually says, whether a version claim holds — and you'd rather not stall your own thread doing the reading. What you need decides which skill:

| What you need | Reach for |
| --- | --- |
| An external fact a decision is waiting on | `research` |
| A decision made *with* you, by interview | [grilling](https://aihero.dev/skills-grilling) |
| A durable architecture decision, written into `GLOSSARY.md` and ADRs | [grill-with-docs](https://aihero.dev/skills-grill-with-docs) |
| To find out whether an approach works in your codebase | [prototype](https://aihero.dev/skills-prototype) |
| A plan too big to hold in one session | [wayfinder](https://aihero.dev/skills-wayfinder) |

The line between `research` and `grill-with-docs` is the **shelf life of what comes back**. Research produces short-lived assets — what this library's auth mechanism does as of this week. An ADR records a decision you keep. If what you are producing is a decision rather than a fact, you are [grilling](https://www.aihero.dev/ai-coding-dictionary/grilling), not researching.

## Delegated legwork

The defining move is that the reading runs as a **background agent**. You keep working; it goes off, follows each claim to its primary source, writes one Markdown file, and reports back. Research is legwork you delegate, not thinking you outsource — you get a document to grill, plan, or design against, and you still make the call.

The delegation is unguarded, and the background agent can spawn a further background agent of its own. This is the skill's best-documented rough edge.

Where the file lands is decided by the repo, not by the skill: it matches whatever convention already exists for notes, and if there is none it picks somewhere sensible and tells you where. It writes one file per run.

## Common questions

**It spawned a second research agent — is that meant to happen?**

No. This is an open bug, [issue #530](https://github.com/mattpocock/skills/issues/530). The skill tells its caller to spin up a background agent but does not restrict the agent type, so the agent it spawns is a `general-purpose` one that holds the `Agent` tool and the same instructions — and fires them again. One reporter measured a single research task costing roughly 450k [tokens](https://www.aihero.dev/ai-coding-dictionary/token) across three overlapping runs, with the duplicate finishing half an hour later entirely out of view. It reproduces outside Claude Code too; the same nesting was confirmed in Codex with GPT-5.6-sol. There is no shipped fix. Users have patched their own installed copy with a line telling an agent that is already a [subagent](https://www.aihero.dev/ai-coding-dictionary/subagent) to do the work itself, which helps but is instruction-level, not structural. Watch your background task list after invoking, and stop the duplicate.

The opposite failure exists as well: if your own global instructions forbid an agent from re-delegating work, the background agent will politely decline the task and the skill quietly does nothing.

**Where should the file live — and should I commit it?**

The skill puts the file where the repo already keeps notes and does not have an opinion beyond that. The community one is fairly settled: ADRs are kept, research files are not. The sharpest version of it, from a Discord thread on exactly this question: "ADRs yes. Everything else archive or delete after done. It otherwise becomes cruft of work and can poison future repo reads if you've drifted away from the spec/research." A research file records what was true on the day it was written, so a stale one is worse than none. On balance these artifacts don't really belong in git, and there is no canonical home for them — people use Obsidian, a separate knowledge repo, or the issue tracker instead.

**What counts as a "high-trust" primary source, and who decides?**

The [model](https://www.aihero.dev/ai-coding-dictionary/model) does. The skill names the *kinds* of source that qualify — official docs, source code, specs, first-party APIs — and there is no allowlist, no domain gate, and no verification pass. This was the loudest objection when the skill was first proposed and it has never been answered publicly: "Five research subagents pointed at junk just gives you five confident wrong answers faster. How are you gating what counts as high-trust sources?" The mitigation you actually have is the citation on each claim. Follow two or three of them. If they land on a summary of the thing rather than the thing, the run failed at its one job.

**Does a later session reuse what an earlier run found?**

No. Nothing auto-loads a past research file; it is a document sitting in the repo until a human or a skill points at it. This was raised early as the strongest challenge to the design — "the value's the markdown becoming context the agent re-reads later, not the fetch itself. A write-once dead file is just a fancy search" — and the shipped skill does not solve it. In practice the file earns its keep by being fed into the next step deliberately: attach it to a spec, quote it into a grilling session, point a [ticket](https://www.aihero.dev/ai-coding-dictionary/ticket) at it.

**Why not just ask the agent to go read the docs?**

You can, and a two-line prompt saying exactly that was the practice this skill replaced. Two things the skill buys over the prompt: it runs in the background so your session keeps its [context](https://www.aihero.dev/ai-coding-dictionary/context) clean, and the primary-source constraint and the cited-file output come out the same way every time rather than however you happened to phrase it. Against a [harness](https://www.aihero.dev/ai-coding-dictionary/harness)'s own deep-research mode, the difference is the artifact and the source discipline, not the search. If a two-line prompt gets you what you need on a small question, use the two-line prompt.

**When does it stop reading?**

There is no stopping criterion in the skill, and this shows up as two complaints that look opposite but are the same gap: agents that go far too deep, and agents that cover a topic broadly while missing the one specific detail that mattered. One practitioner put it as "deep-research skills are a bit too deep sometimes. And telling an agent to research usually results in missing crucial details." Scoping is on you. A narrow, answerable question — one API, one behaviour, one version claim — comes back far better than "research X".

**`/wayfinder` created research tickets — do I resolve those myself?**

No, it now fires them for you. In the unreleased changes since v1.1, a charting session spawns a `/research` subagent per research ticket and burns them down in parallel, capturing findings on a throwaway `research/<name>` branch with a [context pointer](https://www.aihero.dev/ai-coding-dictionary/context-pointer) from the ticket. Research tickets are the one exception to wayfinder's one-ticket-per-session rule, because they are [AFK](https://www.aihero.dev/ai-coding-dictionary/afk) — nothing waits on you. Two known snags with those branches: the subagent has been seen opening a draft PR from a branch that is never meant to merge ([issue #576](https://github.com/mattpocock/skills/issues/576)), and deleting the branch later breaks the context pointers the tickets hold.

## It's working if

- Your own session keeps going. If you are sitting watching it read, the delegation didn't happen.
- Exactly one new background task appears. A second one with a near-identical name is the nesting bug.
- One new Markdown file shows up, in the folder the repo already uses for notes, and the agent tells you the path.
- Every claim in it carries a link, and following two at random lands you on an official doc, a spec, or the actual source file — not on someone's write-up of it.
- You can make the decision you were stuck on from the file alone, without going back to the sources yourself.

## Where it fits

A reach-for-it-anytime standalone that feeds the thinking skills rather than sitting in the build chain. Its file is something to take *into* the flow: [grilling](https://aihero.dev/skills-grilling) and [grill-with-docs](https://aihero.dev/skills-grill-with-docs) ask sharper questions when the facts are already on the table, and [to-spec](https://aihero.dev/skills-to-spec) can synthesise against it. [wayfinder](https://aihero.dev/skills-wayfinder) is the one skill that invokes it directly, resolving each research ticket on its map with a `/research` subagent. For the whole map, see [ask-matt](https://aihero.dev/skills-ask-matt).
