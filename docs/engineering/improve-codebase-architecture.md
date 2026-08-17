## What it does

`improve-codebase-architecture` surveys a codebase for **deepening opportunities** — places where a shallow module (an interface nearly as complex as the thing it hides) could become a deep one — writes them up as a self-contained HTML report, and then [grills](https://www.aihero.dev/ai-coding-dictionary/grilling) you through whichever one you pick.

It never changes the code. The whole run produces one HTML file in your OS temp directory and a conversation; the refactor itself happens later, in a separate [session](https://www.aihero.dev/ai-coding-dictionary/session), through the normal build flow. That is what makes it a survey rather than a refactoring tool, and it is why the skill is worth running on a codebase you are not ready to touch yet.

Two filters keep the report from becoming generic cleanup advice. Every candidate has to pass the **deletion test** — would removing this module concentrate complexity behind a smaller interface, or just spread it across callers? Only the "concentrates" cases earn a card. And unless you point it at a specific area, it reads recent commit history first and biases the scan toward paths that are actively changing, on the grounds that a deepening in code nobody touches is a refactor you will never cash in.

## When to reach for it

You invoke this by typing `/improve-codebase-architecture` — the [agent](https://www.aihero.dev/ai-coding-dictionary/agent) will not reach for it on its own.

It sits outside the build loop — it is not a step in the main loop but something you run periodically to queue up more work to improve the codebase. The four situations it gets used in:

| Situation | How it is used |
| --- | --- |
| Routine upkeep | Run it every few days, or whenever a spare moment appears, to stop structure rotting between features. |
| Before a big build | Point it at the [spec](https://www.aihero.dev/ai-coding-dictionary/spec): "how can we make this change easy?" This is the most effective prompt for it. |
| Brownfield audit | Run it on a large, unstructured or [vibe-coded](https://www.aihero.dev/ai-coding-dictionary/vibe-coding) repo to find out what shape it is actually in. |
| Legacy test work | Use it to find the missing seams first, before writing tests against untestable code. |

Where it is confusable with siblings:

- For designing one module you have already chosen, use [codebase-design](https://aihero.dev/skills-codebase-design) — that is the bench, this is the survey that finds what to put on it.
- For a whole effort too big to hold in one session, use [wayfinder](https://aihero.dev/skills-wayfinder).
- For "this specific thing is broken," use [diagnosing-bugs](https://aihero.dev/skills-diagnosing-bugs). It hands back here when the real finding is that there is no good seam to lock the bug down.

## Prerequisites

None to run it. It reads `GLOSSARY.md` and any ADRs in `docs/adr/` if they exist, and speaks in your domain's own nouns when they do — a candidate reads as "deepen the Order intake module," not "refactor the FooBarHandler."

It writes in two places. The report goes to `<tmpdir>/architecture-review-<timestamp>.html`, outside the repo. During the grilling loop it will add or sharpen terms in `GLOSSARY.md`, creating that file if it does not exist, and offer to record a rejected candidate as an ADR so a future run does not re-suggest it.

## Depth, and the report that hunts for it

The skill turns on one idea: **depth**. A deep module puts a lot of behaviour behind a small, stable interface. A shallow one leaks its implementation through an interface nearly as wide as the code beneath it. The report is a hunt for shallowness — pure functions extracted only for testability while the real bugs live in how they are called (no **locality**), modules leaking across their **seams**, a concept you cannot understand without opening five files — and a proposal for the deepening that fixes it.

Each candidate is a card: the files involved, the friction, a plain-English solution, the benefit stated in terms of **locality** and **leverage**, a before/after diagram, and a strength badge.

| Badge | What it means for you |
| --- | --- |
| `Strong` | The deletion test passes clearly and the friction is real. Take these seriously. |
| `Worth exploring` | Plausible deepening, but the payoff depends on where the code is going next. |
| `Speculative` | Surfaced for completeness. Most of these are safe to ignore. |

The report ends with a **Top recommendation** — the one it would tackle first — and then the skill stops and asks which candidate you want to explore. Nothing has been decided at that point, and no code has moved.

## What happens after you pick one

Picking a candidate starts a [grilling](https://aihero.dev/skills-grilling) session over it: constraints, what sits behind the seam, which tests survive, what the deepened interface should look like. The output of that session is a decision, not a diff. From there the normal flow applies — take the decision into [to-spec](https://aihero.dev/skills-to-spec), then [to-tickets](https://aihero.dev/skills-to-tickets), then [implement](https://aihero.dev/skills-implement).

## Common questions

**It grilled me for an hour about one idea instead of showing me options. Can I turn that off?**

Yes — say so when you invoke it ("don't grill me, just show the report"). This is the loudest complaint the skill has. One user put it bluntly: they liked it as "a convenient way to get a thorough analysis of improvements," and after the grilling loop was added found it "borderline unusable," reporting sessions where it proposed a single solution and then asked "10's or 100's of questions." The design intent is that the report comes first and the grill only starts on a candidate you chose, but weaker [models](https://www.aihero.dev/ai-coding-dictionary/model) skip straight to interviewing you about the first idea they had. Reports in that thread vary sharply by model, and it is an open issue — the skill does not yet have a documented no-grill mode.

**The report opened as unstyled raw HTML with no diagrams. What happened?**

The report loads Tailwind and Mermaid from CDNs, so it needs network access when you open it, and it breaks silently when something blocks those scripts. The filed case was a security hook demanding SRI hashes: the agent added them, the CDN served different bytes to the browser than to the `curl` used to compute the hash, and the browser blocked the script. Offline and locked-down environments hit the same wall. The agent cannot see this, because it never renders the page. The workaround is to ask for inline CSS and hand-built SVG diagrams instead of the CDN scaffold. This is an open issue and a real rough edge.

**It gave me twelve candidates. Do I work through them in the same session or start a new one?**

One candidate per session. Working through several in one conversation fills the [context window](https://www.aihero.dev/ai-coding-dictionary/context-window) with the report, the grilling, the domain-model edits and the code changes all at once. The report only lives in a temp file, so carry the candidate itself rather than the file: pick one, grill it, take the decision into `/to-spec`, and turn the rest into [tickets](https://www.aihero.dev/ai-coding-dictionary/ticket) you can pick up independently later. Put the chosen improvement into a spec rather than going straight to implementation. This is a recurring question with no documented workflow in the skill itself.

**How should I prompt it?**

With the next thing you are building in mind. Where a big build is coming up, point it at the spec and ask "how can we make this change easy?" An unprompted run scans for hot spots on its own, which is fine for routine upkeep, but naming a direction is what makes the report actionable.

**Does it work on a large legacy codebase?**

Partly. It is strong on big existing codebases lacking consistent structure, and it is the recommended upkeep mechanism after any one-time structural setup. The honest counterweight: users with genuinely out-of-control projects report it "helped a little but still doesn't seem to cut it," and one developer with an eight-year legacy codebase reported the model going in circles where the same skill produces a clean graph on a tidy repo. There is no dedicated `/refactor` skill for that case yet. If the codebase has no shared vocabulary at all, [grill-with-docs](https://aihero.dev/skills-grill-with-docs) to establish one first tends to make this skill's output much better.

**How is this different from `/codebase-design`?**

`/codebase-design` is a reference, not a session driver. It supplies the vocabulary — module, interface, depth, seam, adapter, leverage, locality — and this skill borrows it. Pointing a fresh agent at `/codebase-design` as the thing to "do" is a known failure: with no process of its own to follow, the agent invents one, re-explores code and runs for a very long time before asking you anything. Drive with this skill; consume that one.

**Will it ever tell me the codebase is fine?**

Rarely, and you should know that going in. The skill is built to output findings, so the framing pushes it toward producing candidates rather than concluding that nothing is wrong. The strength badges are the defence — a report where everything is `Speculative` is the skill telling you it found nothing, in the only way it knows how.

**Does it work in Codex or another harness?**

Partially. The exploration step names Claude Code's `Agent` tool with `subagent_type=Explore` directly, so a [harness](https://www.aihero.dev/ai-coding-dictionary/harness) without that tool may skip the parallel exploration rather than substitute its own. The skill still runs; the scan is just less thorough. A harness-neutral rewrite has been proposed but is not merged.

**How do I actually implement deep modules in TypeScript?**

There is no good answer shipped with the skill. The recurring request is for a `TYPESCRIPT.md` giving concrete file and module layouts for the principles, and it does not exist. The skill will tell you where a deepening belongs and what should sit behind the seam; translating that into a package or directory structure is currently on you.

## It's working if

- The candidates name your domain's concepts, not invented class names — "the Order intake module," not "the FooBarHandler."
- The candidates cluster in files you have edited recently, not in dormant corners of the repo.
- No code changed during the run. The only new file is the HTML report in your temp directory.
- It stops after the report and asks which candidate you want, rather than continuing on its own.
- Each card explains the payoff as locality or leverage, and says which tests get simpler — not just "this is cleaner."
- Rejecting a candidate for a durable reason gets you an offer to record an ADR, so the next run does not re-suggest it.

## Where it fits

`improve-codebase-architecture` is **periodic maintenance** — run it every few days, outside any chain, to queue up work rather than to do it. Its neighbours are [codebase-design](https://aihero.dev/skills-codebase-design), which owns the depth-and-seam vocabulary every candidate is written in, [grilling](https://aihero.dev/skills-grilling), which walks the decision tree once you have chosen a candidate, and [domain-modeling](https://aihero.dev/skills-domain-modeling), which keeps `GLOSSARY.md` and the ADRs current as the decision settles. What it produces is an idea, which re-enters the main build flow at [grill-with-docs](https://aihero.dev/skills-grill-with-docs) or [to-spec](https://aihero.dev/skills-to-spec). For which skill fits a situation, [ask-matt](https://aihero.dev/skills-ask-matt) is the router over the whole set.
