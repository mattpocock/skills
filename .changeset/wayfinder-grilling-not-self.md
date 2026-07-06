---
"mattpocock-skills": patch
---

Stop **`wayfinder`** grilling *itself* instead of the human, and classify ticket types by **HITL** / **AFK**.

Students reported `/wayfinder` picking a **grilling** ticket and answering its own questions rather than turning to the human. Root cause: **`grilling`** carried a line written for the live-human case — "If a question can be answered by exploring the codebase, explore the codebase instead" — which, once `wayfinder` runs grilling inside a resolve-the-ticket frame, reads as license to answer questions autonomously and race the ticket to "resolved".

Two changes:

- **`grilling`** now splits *facts* (look them up) from *decisions* (put each one to the human and wait for their answer).
- **`wayfinder`** labels every ticket type **HITL** (human in the loop — Prototype, Grilling) or **AFK** (agent alone — Research; Task is either). A HITL ticket only resolves through the live exchange, so the "wait for the human" behaviour falls out of the label instead of being spelled out per type — a grilling agent that answers its own questions has, by definition, broken HITL.
