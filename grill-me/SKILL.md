---
name: grill-me
description: Interview the user relentlessly about a plan or design until reaching shared understanding, resolving each branch of the decision tree. Use when user wants to stress-test a plan, get grilled on their design, or mentions "grill me".
---

Interview me relentlessly about every aspect of this plan until we reach a shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one-by-one.

**Question Format Requirements:**
- Each question MUST be prefixed with "Question N:" where N increments from 1 (e.g., "Question 1:", "Question 2:", etc.)
- Each question MUST end with a "Recommended: N. because ..." line explaining why this option is recommended
- Ask questions ONE AT A TIME - do not batch multiple questions together
- After asking a question, wait for the user's response before asking the next question
- If the user responds in natural language or provides additional context, acknowledge it and continue to the next numbered question

If a question can be answered by exploring the codebase, explore the codebase instead.
