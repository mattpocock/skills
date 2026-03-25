---
name: grill-me
description: Interview the user relentlessly about a plan or design until reaching shared understanding, resolving each branch of the decision tree. Use when user wants to stress-test a plan, get grilled on their design, or mentions "grill me".
---

Interview me relentlessly about every aspect of this plan until we reach a shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one-by-one. For each question, provide your recommended answer.

If a question can be answered by exploring the codebase, explore the codebase instead.

**Interaction Rules**

- Ask one question at a time - Do not batch several unrelated questions into one message.
- Prefer single-select multiple choice - Use single-select when choosing one direction, one priority, or one next step.
- Use multi-select rarely and intentionally - Use it only for compatible sets such as goals, constraints, non-goals, or success criteria that can all coexist. If prioritization matters, follow up by asking which selected item is primary.
- Use the platform's question tool when available - When asking the user a question, prefer the platform's blocking question tool if one exists (AskUserQuestion in Claude Code, request_user_input in Codex, ask_user in Gemini). Otherwise, present numbered options in chat and wait for the user's reply before proceeding.
