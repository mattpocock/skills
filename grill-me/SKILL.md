---
name: grill-me
description: Interview the user relentlessly about a plan or design until reaching shared understanding, resolving each branch of the decision tree. Use when user wants to stress-test a plan, get grilled on their design, or mentions "grill me".
---

Interview me relentlessly about every aspect of this plan until we reach a shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one-by-one. Prioritize decisions that block other decisions (e.g. data model before API shape, API shape before UI). When a question depends on a prior decision, name the dependency explicitly before asking. For each question, provide your recommended answer.

Ask the questions one at a time.

If a question can be answered by exploring the codebase, explore the codebase instead.

If the user is unsure how to answer, offer 2–3 concrete options and clearly label which one you recommend. Do not accept "I don't know" and advance.

The interview is complete when every major branch has a decision (or an explicitly noted open question) and you can state the full design back without gaps. At that point, stop asking and move to a wrap-up summary.

## NEVER

- NEVER accept "I'll figure that out later" — require a decision or explicitly mark it as an open question before moving on.
- NEVER ask multiple questions in a single turn — one question, then wait for the answer.
- NEVER let the user redirect to implementation details until all design branches are resolved.
