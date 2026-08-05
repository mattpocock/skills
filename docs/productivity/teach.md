[Source](https://github.com/mattpocock/skills/tree/main/skills/productivity/teach)

## What it does

`teach` turns the current directory into a standing teaching workspace and teaches you one topic across many sessions — devising short, beautiful, interactive lessons tied to *why* you want to learn.

It does **not** teach from the model's own memory. Parametric knowledge is treated as untrusted; before it can teach, it gathers high-trust resources and grounds every claim in a citation. And it is stateful — the workspace remembers what you've learned, so each session picks up where the last left off rather than starting from scratch.

## When to reach for it

You invoke this by typing `/teach` — the agent won't reach for it on its own.

Reach for it when you want to *learn* a topic over time — a language, a framework, yoga, theoretical physics — and want the sessions to accumulate rather than evaporate. It is not for a one-off explanation; if you just need something clarified in the moment, ask directly. Reach for `teach` when the learning is a project.

## Prerequisites

`teach` builds a whole directory in place, so run it somewhere you're happy to keep as a dedicated workspace. Over time it writes:

- `MISSION.md` — the reason you're learning this, which grounds everything else. If it's empty, `teach`'s first job is to question you until it isn't.
- `RESOURCES.md` — the vetted, high-trust sources it teaches from.
- `./lessons/*.html` — the numbered, self-contained lessons (the primary unit of teaching).
- `./reference/*.html` — compressed cheat-sheets, algorithms, glossaries you'll return to.
- `./learning-records/*.md` — what you've learned, ADR-style, used to judge what to teach next.
- `./assets/*` — reusable components (a shared stylesheet first) so the lessons look like one course.
- `NOTES.md` — your teaching preferences.

## Mission, and the zone of proximal development

Every lesson hangs off the **mission**. Without it, knowledge has nothing to attach to and lessons feel abstract — so the mission is the first thing `teach` pins down and keeps updating as you grow. From the mission and your learning records it computes your **zone of proximal development**: the next lesson should challenge you *just enough*, no more.

## Storage strength, not fluency

The word to think with is **storage strength** — long-term retention — as opposed to **fluency**, the in-the-moment recall that feels like mastery but isn't. `teach` deliberately builds the former through desirable difficulty: retrieval practice, spacing, and interleaving. Knowledge is taught first (where difficulty is the enemy), then skills are drilled through a tight feedback loop (where difficulty is the tool).

## Where it fits

`teach` is a reach-for-it-anytime standalone — a long-running learning project you drive session by session, not a step in a build chain. It shares no workflow with the other productivity skills; it simply owns its workspace directory and lives there. When you're unsure which skill or flow fits, [ask-matt](https://aihero.dev/skills-ask-matt) routes you.
