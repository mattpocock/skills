[Source](https://github.com/mattpocock/skills/tree/main/skills/productivity/to-questionnaire)

## What it does

`to-questionnaire` turns a decision you can't settle on your own into a **questionnaire** — a Markdown document you hand to the one person who holds what you're missing, to fill in async or work through together in a meeting.

It grills you about the **send**, never the subject. A normal grilling session interrogates the topic, which is exactly what you can't answer here — that's why you're writing to someone else. So the interview asks only the two things you can always answer: who this is going to, and what you need back from them. The questions in the document are then aimed at the **gap** between the two.

## When to reach for it

You invoke this by typing `/to-questionnaire` — the agent won't reach for it on its own.

Reach for this when a decision is blocked on knowledge that lives in someone else's head — a client, a domain expert, a colleague on another team — and you want a document that pulls it out of them in one pass. When the knowledge is in *your* head and just needs sharpening, use [grill-me](https://aihero.dev/skills-grill-me) instead; when it's in the codebase, use [grill-with-docs](https://aihero.dev/skills-grill-with-docs).

## The send, not the subject

The interview is two exchanges, and it stops there:

- **Who is it going to?** Their role, expertise, and relationship to you. This fixes the tone and how much context the document has to carry — an outside client needs orienting; a teammate does not.
- **What do you need back?** The concrete decisions or facts you can't resolve alone. This becomes the checklist the finished questionnaire is measured against: every item you named has a question aimed at it.

Everything after that is drafting. The output is written to `to-questionnaire-<slug>.md` in the current directory.

## The document

It's a **discovery questionnaire**: you lack the context, the recipient holds it. That framing drives its shape — a purpose line and the decision riding on it, a short context section for a recipient who wasn't in your head, and questions ordered **most-important-first**, because async means you may only get one pass. Each question is one idea, never compound, with an answer stub beneath it and a *why this matters* line only where the question could be misread. It closes with a catch-all: anything we didn't ask that we should know?

## It's working if

- It asks you about the recipient and the deliverable, then stops asking — no interrogation of the topic itself.
- Every item you named as "what I need back" is traceable to a question in the file.
- The questions read as aimed at what the *recipient* knows, not as your own open questions copied down.

## Where it fits

`to-questionnaire` is a reach-for-it-anytime standalone — it sits at the boundary of your own knowledge, where the next step is another person rather than another skill. Its neighbour is [grill-me](https://aihero.dev/skills-grill-me), because the two split on where the answers live: grilling mines you, a questionnaire mines someone else. What comes back typically feeds the main flow at [grill-with-docs](https://aihero.dev/skills-grill-with-docs) or [to-spec](https://aihero.dev/skills-to-spec). When you're unsure which skill fits the moment, [ask-matt](https://aihero.dev/skills-ask-matt) routes you.
