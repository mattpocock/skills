## What it does

`grill-me` takes a **loose idea** and interviews you until you can commit to it. You do not need a worked-out plan to start — producing one is what the [session](https://www.aihero.dev/ai-coding-dictionary/session) is for. It asks in **rounds**: each round is the whole **frontier** — every question whose prerequisites you have already settled — so you are never asked something that hinges on an answer it hasn't heard yet.

It is **[stateless](https://www.aihero.dev/ai-coding-dictionary/stateless)**. It writes no files and leaves no workspace behind. The only thing it leaves is a sharper version of the idea, in your own head.

## When to reach for it

You invoke this by typing `/grill-me` — the [agent](https://www.aihero.dev/ai-coding-dictionary/agent) won't reach for it on its own. Start it in a **fresh conversation**, not on top of a plan you already had an agent write.

Reach for it as soon as you have an idea worth taking seriously — a feature, a product direction, a business call, a piece of writing — and long before you have worked out what it involves. Vagueness is not a reason to wait; it is the thing the session eats. If you can already specify the thing precisely, you don't need to grill it.

Which of the three grilling skills you want depends on what is in front of you:

- **Anything, anywhere** — `grill-me`. It needs no repo and writes no files, and the subject doesn't have to be code.
- **A codebase to align against** — [grill-with-docs](https://aihero.dev/skills-grill-with-docs). The same interview, but [stateful](https://www.aihero.dev/ai-coding-dictionary/stateful): it reads your code and keeps what it learns in `GLOSSARY.md` and ADRs.
- **Too big for one session** — [wayfinder](https://aihero.dev/skills-wayfinder). It charts the effort as a map and runs grilling sessions inside it.

Leave [plan mode](https://www.aihero.dev/ai-coding-dictionary/agent-mode) off. Plan mode primes the agent to rush toward producing a plan, which is the opposite of staying in inquiry.

## It's a conversation, not an interview

The skill asks the questions, but **you** own the scope. That is the part people miss, and it separates a session that turns an idea into decisions from one that produces confident nonsense.

The failure mode is **passivity** — answering "agreed, agreed, agreed" for forty questions and coming out with a plan the agent wrote and you nodded at. It feels productive because it was long. Nothing was actually decided, and the result carries a certainty it hasn't earned.

Being active means steering. Push back on a question pitched beneath the fidelity you need. Say when the scope is drifting. Answer "I don't know" and mean it. This skill is built to aid an engineer, not to replace one: what comes out tracks the quality of your answers, not the number of questions asked.

The opposite error is real but rarer — staying in the interview so long you never reach code.

## Grillable and ungrillable

Some questions can be answered by talking. Others can't, and no amount of grilling will get you there.

"One long form or three pages?" and "how should this interaction feel?" are **ungrillable** — they need something to react to. When you hit one, stop grilling. Build the throwaway version with [prototype](https://aihero.dev/skills-prototype), look at it, then come back and answer in one line.

Talking your way through an ungrillable question is where sessions balloon. The agent keeps rephrasing, you keep guessing, and the scope grows to fill the uncertainty.

## It's working if

- You disagree with something. A session with no pushback from you is a session you didn't need.
- Questions arrive in a few rounds rather than one long drip, and later rounds clearly build on what you said earlier.
- You end up somewhere you didn't expect, because a question surfaced a decision you had been making implicitly.
- At the end you could defend each choice to someone who wasn't there.

## Common questions

**How many questions should I expect, and how do I know when it ends?**
Count rounds, not questions. Forty-six questions across four rounds is an ordinary session. It ends when the frontier is empty — every branch visited, nothing left silently assumed.

**It asked me two hundred questions. What went wrong?**
Usually the scope was too large. Ask the agent to break the work into smaller pieces first, then grill each one. Very long sessions also drift into the **[dumb zone](https://www.aihero.dev/ai-coding-dictionary/smart-zone)**, where the [context window](https://www.aihero.dev/ai-coding-dictionary/context-window) is full enough that the questions get worse.

**Can I go back to one question at a time?**
Yes. Add this to your global `CLAUDE.md`:

```
When grilling, ask one question at a time.
```

**What if I genuinely don't know the answer?**
Say so. "I don't know" is a real answer, and a question you can't answer is usually a sign to prototype rather than to guess.

**Do I start a fresh session before writing the spec?**
No. The value of the session is the [context](https://www.aihero.dev/ai-coding-dictionary/context) you just built. Hand the same conversation straight to [to-spec](https://aihero.dev/skills-to-spec).

**Does the model matter?**
More than for most skills. Grilling leans on the [model](https://www.aihero.dev/ai-coding-dictionary/model)'s own sense of how systems break, so give it your best one. Implementation mostly follows context and tolerates a cheaper model.

## Where it fits

`grill-me` is a **standalone you can run anywhere, on anything**. Being stateless is what makes it portable: no repo, no workspace, no setup, and no assumption that the idea is even about software. People point it at business decisions, at writing, at what to do next — anything that won't sit still in their head.

That portability is the whole difference from [grill-with-docs](https://aihero.dev/skills-grill-with-docs), which runs the same interview but reads a codebase to align against and records what it learns as `GLOSSARY.md` and ADRs. Both sit on the [grilling](https://aihero.dev/skills-grilling) primitive; `grill-me` is the user-invoked front door that carries nothing with it.

If what you grilled does turn out to be software, you can hand the same conversation to [to-spec](https://aihero.dev/skills-to-spec) and carry on into the build flow — an option, not the point of the skill. When you're unsure which flow fits, [ask-matt](https://aihero.dev/skills-ask-matt) routes you.
