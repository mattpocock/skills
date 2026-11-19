---
"mattpocock-skills": patch
---

`setup-matt-pocock-skills` now records how to attach a file (an image or a video) to a comment on an issue or PR in `docs/agents/issue-tracker.md`: `gh issue comment` / `gh pr comment --attach` on GitHub, an uploads-API Markdown link on GitLab, an `assets/` folder for local markdown, and for any other tracker the user's own method or a note that it can't. Each template gains a "When a skill says 'attach a file to a comment'" section, and "Read a PR" / "Read an MR" moves into Conventions so any skill can read a PR, not just triage.
