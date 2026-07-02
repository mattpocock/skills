Quickstart:

```bash
npx skills add mattpocock/skills --skill=handoff
```

```bash
npx skills update handoff
```

[Source](https://github.com/mattpocock/skills/tree/main/skills/productivity/handoff)

## What it does

`handoff` compacts the current conversation into a **handoff document** — a single write-up a fresh agent can read to pick up the work where you left off.

It does **not** re-state what already lives elsewhere. Anything captured in a spec, plan, ADR, issue, commit, or diff is referenced by path or URL, never copied. The document carries only the live thread — what you were doing, why, and what's next — and it's saved to your OS's temporary directory, not into the workspace, so it never becomes another artifact to maintain.

## When to reach for it

You invoke this by typing `/handoff` — the agent won't reach for it on its own. Pass a note about what the next session is for and the document is tailored to it.

Reach for this when a conversation has gone long enough that its context is at risk — you're near a context limit, wrapping for the day, or deliberately handing the work to another agent — and you want the thread preserved without dragging the whole transcript along.

## What the document carries

- **The live thread** — what's in flight and why, in the conversation's own terms, minus anything already written down elsewhere.
- **Suggested skills** — a pointer to the skills the next agent should reach for to continue.
- **References, not copies** — links and paths to the specs, plans, ADRs, issues, and diffs that hold the settled detail.
- **Redacted secrets** — API keys, passwords, and PII stripped before the document is written.

The idea to hold onto is **compaction**: a handoff is the conversation squeezed down to just its resumable core, so a fresh agent inherits the momentum, not the noise.

## Where it fits

`handoff` is a reach-for-it-anytime standalone — it sits at the seam between two sessions rather than inside a build chain. It pairs naturally with the artifact-producing skills whose output it points at: [to-spec](https://aihero.dev/skills-to-spec), because a finished spec is exactly the kind of settled detail a handoff references instead of repeating. When you're unsure which skill fits the moment, [ask-matt](https://aihero.dev/skills-ask-matt) routes you.
