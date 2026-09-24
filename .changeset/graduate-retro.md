---
"mattpocock-skills": minor
---

Graduate **`retro`** into the **Engineering** bucket, so it ships in the Claude Code plugin, gets a docs page, and is routed by `ask-matt` as the last step of the main flow, after `code-review`.

`retro` (user-invoked) looks back at a coding session and suggests changes to the agent's environment rather than the code: navigation pointers, automated checks, coding standards, steering files, tool economy, information access. It classifies each coding-standards finding first: a mechanical violation gets a deterministic check (a linter rule, a pre-commit hook, or a CI job), and `CODING_STANDARDS.md` is kept for genuine judgement calls. A repo with no guardrail at all is a finding in its own right.
