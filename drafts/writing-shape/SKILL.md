---
name: writing-shape
description: Writing, exploit — shape raw material into an article, paragraph by paragraph.
disable-model-invocation: true
---

<what-to-do>

The user has passed (or will pass) a markdown file of raw material. Treat it as the input pile — anything from a tidy list of fragments to a wall of unstructured prose to a transcript. The format does not matter. Read it end-to-end before doing anything else.

Then run a shaping session that produces a separate article document. This is **exploit**: the exploring is done, the pile is fixed — commit to a structure and mine the pile to fill it. Do not edit the raw material file — it is read-only to this skill.

If the user did not say where to save the article, ask once and remember the path.

</what-to-do>

<supporting-info>

## The loop

1. **Read the pile.** Read the input file in full. Form a sense of what's in it.
2. **Establish the prerequisites.** Settle with the user what the reader knows walking in — the concepts that are **grounded** from the start. Everything else must be grounded by a block before a later block can lean on it. See [Grounding](#grounding).
3. **Draft 2–3 candidate openings.** Each opening should imply a different thesis or angle for the article. Show all of them. Force the user to pick or compose a hybrid. The chosen opening defines what the rest of the article must do.
4. **Grow paragraph by paragraph.** After the opening lands, ask "given this opening, what does the reader need to hear next?" Pull material from the pile to answer. The next block may only lean on grounded concepts, and grounds new ones as it lands. Argue about the form the next block takes — a paragraph, a list, a table, a callout, a quote, a code block. Each format choice should be deliberate and defensible.
5. **Append to the article file as you go.** Don't batch. Write each agreed paragraph or block immediately so the user can see the article taking shape.
6. **Loop step 4 until the article is done.** The user decides when it's done.

## Grounding

Every **concept** has to be **grounded** before a block can lean on it: the reader either walked in knowing it or met it in an earlier block. A block that reaches for an ungrounded concept loses the reader. The unit is the concept, not the word for it — a block can lean on an idea the reader lacks even with no jargon in sight. Where a concept has a name — a **term** — grounding it means landing the idea and the term together.

A concept gets grounded one of two ways:

- **Prerequisite** — grounded before the opening. The reader brings it. Fixed at the start.
- **Introduced** — a block establishes it, and from then on it's grounded for the rest of the article.

Keep a running list of what's grounded. When you ask "what does the reader need to hear next?", an ungrounded concept the next move needs is itself the answer: ground it first — here or in an earlier block — or you can't make the move. This is the gap-naming of [Pulling from the pile](#pulling-from-the-pile) one level up: there the pile is missing material; here the article is missing a foundation.

The lever is what you make a prerequisite versus what you ground inside the article. Demand too much up front and you shut readers out; ground too much inside and the opening drowns in definitions. Settle it with the user when you establish prerequisites.

## Conversational feel

This is a grilling session inverted. In ideation, the question was "what are you actually noticing?" Here it's "what is this article actually arguing, and in what order does the reader need to hear it?" Push back. Refuse to let weak transitions slide. If a paragraph doesn't earn its place, cut it.

Specific moves to keep using:

- "What does this paragraph do for the reader that the previous one didn't?"
- "If I cut this, what breaks?"
- "Is this prose, or should it be a list? Why prose?"
- "This sentence is doing two jobs — split it or pick one."
- "The opening promised X. We've drifted to Y. Either re-thread it or change the opening."

## Pulling from the pile

Treat the raw material as a quarry, not a script. Pull a fragment, rework it to fit the surrounding paragraph, and place it. A fragment may be split across multiple paragraphs, merged with another, or paraphrased. The pile's job is to be mined; the article's job is to read as one voice.

If the pile lacks something the article needs, name the gap explicitly: "We need an example here and the pile doesn't have one — give me one now or we cut this section."

## Format arguments to actually have

When choosing how to render a block, weigh these tradeoffs out loud with the user, not silently:

- **Prose vs. list.** Prose carries argument; lists carry parallel items. If items aren't truly parallel, prose is better. If they are, a list is faster to scan.
- **Inline vs. callout.** Tips, warnings, and asides go in callouts (`> [!TIP]`, `> [!NOTE]`) — but only if they'd genuinely derail the main argument inline. Otherwise leave them inline.
- **Table vs. repeated structure.** If the same shape repeats 3+ times with the same fields, a table. Otherwise prose with bold leads.
- **Quote vs. paraphrase.** Quote when the original wording is the point. Paraphrase when only the idea matters.
- **Code block vs. inline code.** Multi-line, runnable, or illustrative → block. Single token or identifier → inline.

## Writing rhythm

Append to the article file as each block is agreed. Re-read the file from disk before every write — the user may have edited between turns. Never overwrite blindly. If the user wants a paragraph rewritten, edit that specific paragraph in place; leave the rest alone.

## Out of scope

- Mining for new fragments that aren't in the pile (handle gaps as in "Pulling from the pile").
- Editing the raw material file.
- Publishing, formatting for a specific platform, or adding frontmatter the user didn't ask for.

</supporting-info>
