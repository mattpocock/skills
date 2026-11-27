## What it does

`teach` turns the directory you run it in into a standing teaching workspace and teaches you one topic across many [sessions](https://www.aihero.dev/ai-coding-dictionary/session), in short self-contained HTML lessons.

It does not teach from what the [model](https://www.aihero.dev/ai-coding-dictionary/model) already knows. It treats [parametric knowledge](https://www.aihero.dev/ai-coding-dictionary/parametric-knowledge) as untrusted. Before it teaches, it finds high-trust resources, records them in `RESOURCES.md`, and cites them inside every lesson. It is also [stateful](https://www.aihero.dev/ai-coding-dictionary/stateful). The mission, the resources, the lessons and the record of what you have learned all live as files in the directory, so the next session continues from those files, not from what is left of the last conversation.

## When to reach for it

You invoke this by typing `/teach`; the [agent](https://www.aihero.dev/ai-coding-dictionary/agent) won't reach for it on its own.

Reach for it when the learning is the project: a language, a framework, a codebase you have just joined, yoga, shaders, a certification. It is not the tool for one explanation in passing.

| What you want | What to reach for |
| --- | --- |
| To learn a topic over weeks, with sessions that accumulate | `teach` |
| One idea explained inside the session you are already in | Just ask, in that session |
| The agent's last message re-pitched because it didn't land | [wait-what](https://aihero.dev/skills-wait-what) |
| To sharpen thinking you already have, rather than acquire new material | [grill-me](https://aihero.dev/skills-grill-me) |
| A background agent to read [primary sources](https://www.aihero.dev/ai-coding-dictionary/primary-source) and leave you a cited document | [research](https://aihero.dev/skills-research) |
| To learn something that came up mid-grilling, without derailing the [grilling](https://www.aihero.dev/ai-coding-dictionary/grilling) | [handoff](https://aihero.dev/skills-handoff) out to a teaching workspace, then `teach` there |

## Prerequisites

`teach` builds a directory rather than producing a file, and the skill assumes one mission per workspace, so run it somewhere you are happy to give over to a single topic. Keep it out of the project you are working in. A separate repo is the best home, better than a global `~/.learnings/` folder or the working project itself. A dedicated repo also lets you commit the lessons, which is how teams have shared them.

What accumulates in that directory:

| Path | What it holds |
| --- | --- |
| `MISSION.md` | Why you are learning this. Every other file depends on it. If it is missing, the first thing `teach` does is interview you until it isn't |
| `RESOURCES.md` | The vetted sources it teaches from, split into Knowledge and Wisdom (communities) |
| `lessons/*.html` | The numbered lessons: the primary unit of teaching |
| `reference/*.html` | Compressed cheat-sheets, algorithms, glossaries: the documents you return to |
| `learning-records/*.md` | ADR-style notes on what you have demonstrably learned, used to decide what to teach next |
| `assets/*` | Reusable components, starting with a shared stylesheet, so the lessons look like one course |
| `NOTES.md` | Your stated teaching preferences |

Two notes on that list. A glossary suits most topics, but the skill ships a `GLOSSARY-FORMAT.md` that `SKILL.md` no longer links to, so you only get one if you ask ([issue #559](https://github.com/mattpocock/skills/issues/559)). All of it lands in the directory you ran `/teach` in.

## Storage strength, not fluency

The word to think with is **storage strength**: long-term retention, as opposed to **fluency**, the in-the-moment recall that feels like mastery while you are reading and is gone a week later. `teach` builds the former through desirable difficulty: retrieval practice, spacing, interleaving. Knowledge comes first. At that stage difficulty works against you, because it uses up the working memory you need to understand. Then `teach` drills the skill through a tight feedback loop, and at that stage difficulty is the tool.

Two things decide what you get taught. The **mission** (the concrete real-world reason you want this) is the basis of every lesson. Without it the lessons become abstract and nothing decides what comes next. From the mission and the learning records, `teach` picks the next lesson inside your **zone of proximal development**: hard enough to take effort, but not so far ahead that you cannot learn it.

Storage strength is also why the skill pushes back instead of agreeing. A question that needs **wisdom** (real-world judgement) gets an attempted answer and then a pointer to a community where you can test it. The skill does not let you skip a quiz. One user reported saying "thanks a lot" and being told the drill was not finished.

## Lessons, references and components

A **lesson** is one self-contained HTML file, short enough to finish in a sitting, tied to the mission, giving one tangible win. It cites its sources, recommends one primary source to go and read yourself, and links to sibling lessons and reference documents.

You rarely go back to a lesson, but you do go back to reference documents. So the short form of a lesson (the syntax table, the algorithm, the pose sequence, the glossary) belongs in `reference/`, not buried in the lesson that introduced it.

Lessons are built from **components** in `assets/`: stylesheets, quiz widgets, simulators, diagram helpers. Reuse is the default. The agent reads `assets/` before authoring a lesson and builds from what is there. It writes anything new that a second lesson could use as a component, not inline. The shared stylesheet is the first component in every workspace, and it makes the lessons look like one course instead of many unrelated pages.

## Common questions

**Where does it put the files? Mine ended up in `~/.claude/skills`.**
In the directory you ran `/teach` in ([#377](https://github.com/mattpocock/skills/issues/377)).

**Do I stay in one session, or start a new one per lesson?**
All three approaches work: staying in the same session, re-invoking `/teach` in a new session, or opening a new session in the same folder. Each lesson is its own invocation. The course state lives in the folder, not in the conversation. Common practice is to open a fresh session in the workspace and say `/teach next lesson for <topic>`.

**How do I know it isn't teaching me something it made up?**
You don't, on the skill's word alone. You read the primary sources. `teach` is not reliable enough to trust unchecked, and no skill built on an LLM is. The grounding (`RESOURCES.md`, citations in every lesson, one recommended primary source per lesson) makes it cheap to check a lesson. It does not remove the need to check. This failure has happened: one user learning a 2x2 Rubik's cube got made-up move sequences that don't solve it. In a case like that, check the model, the harness, the effort setting, and the source. Risk is highest in procedural domains with precise notation, and lowest where the output is immediately verifiable, like code you can run.

**The correct quiz answer is always the first option.**
Several people have confirmed this on Sonnet, Opus and GLM, and it is still unfixed. `SKILL.md` now requires every answer to be the same number of words. That removes a different clue (the correct answer used to be the only fully-reasoned one), but says nothing about position. One contributor tested an instruction-level fix for position, and the correct answer still landed in slot A 33 times out of 33 across nine lessons ([#335](https://github.com/mattpocock/skills/issues/335)). So the real fix is a quiz component in `assets/` that shuffles the answers, not better wording. Until that ships, ignore answer position. Your `assets/` directory is yours to change, so you can ask for a component that shuffles at render time as a local fix.

**It assumed I already knew things, and used terms it never defined.**
This is the most common real complaint. There is no assessment step. `teach` infers your level from the mission and the learning records, and in session one there are no learning records. One user running it inside a wayfinder pipeline put it plainly: "It never did grilling to establish my starting point so it made lots of assumptions of what I already knew." Another reported lessons that used undefined jargon, and a lesson about their hardware that covered what the hardware could do but never said what it couldn't. Two things help: state your prior knowledge and your gaps in the first message, and correct the level out loud when a lesson misses, because the correction becomes a learning record and steers the next one. An explicit knowledge-assessment step is a standing feature request ([#725](https://github.com/mattpocock/skills/issues/725)), not shipped behaviour.

**Does it do spaced repetition, and does it know when to stop teaching?**
No to the first, and not reliably to the second. The skill designs lessons around spacing and interleaving, but nothing schedules a review, and there is no Anki or calendar integration. Users ask for both often. A related gap is exit criteria. As one user put it, `teach` "is good at making the next lesson, but not as good at knowing when to stop and switch to review or real practice." If you want review or drilling instead of new material, ask for it; the skill will not propose the switch on its own.

**Is it only useful for code?**
No. Most reported use is outside coding: Korean, Japanese formal register, piano, guitar, board game design, OpenSCAD, film plots, Azure and CCNA certifications, university exams, and children of eight and ten getting printable books on escape rooms and fire salamanders. Nothing in the skill is specific to programming. Mission, resources, zone of proximal development and drill work the same way in any domain. Within code, users report the most value from getting oriented in an unfamiliar codebase or a new team's stack, more than from learning a language from scratch.

**Which model should I run it with?**
There is no canonical answer, and the reported differences are large. Users report that higher [reasoning effort](https://www.aihero.dev/ai-coding-dictionary/effort) produces better lessons than the medium setting. One user ran the same skill through Copilot CLI with Codex and got a single 30-line HTML card where Claude Code produced a full lesson. It runs unmodified in Claude Cowork, if your organisation lets you add skills there. If the lessons come out thin, change model, [harness](https://www.aihero.dev/ai-coding-dictionary/harness) or effort before rewriting your prompt.

## It's working if

- The first thing it does in an empty directory is interview you about why you want this, rather than produce a lesson.
- `RESOURCES.md` fills up before the lessons do, and each lesson names one primary source worth reading yourself.
- Claims in a lesson carry links out. A lesson with no citations is the skill teaching from memory.
- A lesson takes one sitting and leaves you able to do one thing you couldn't before.
- Opening a fresh session in the folder and saying "next lesson" continues the course instead of restarting it.
- `learning-records/` grows, and lessons stop re-teaching what you have already demonstrated.
- The lessons look like one course: they link the stylesheet in `assets/` rather than each carrying its own.
- Quizzes respond when you click: each lesson loads the scripts it uses from `assets/` with a `<script src>` tag.
- A question that needs judgement gets you pointed at a forum, subreddit or class, not just an answer.

## Where it fits

`teach` is a **reach-for-it-anytime standalone**. It is not a step in a build chain and shares no artifacts with the engineering flow; it works in its own directory for as long as you study the topic.

Its one real neighbour is [handoff](https://aihero.dev/skills-handoff). Together they answer "what do I do if I'm being grilled about something I don't understand?" Don't stop the grilling to learn. `/handoff` to a teaching workspace, learn the topic there with `/teach`, then go back and continue where you left off. The nearby alternative is [research](https://aihero.dev/skills-research), for when what you want is a cited document rather than lessons and retention. When you are not sure which skill or flow fits, [ask-matt](https://aihero.dev/skills-ask-matt) routes you over the whole set.
