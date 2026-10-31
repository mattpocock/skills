---
"mattpocock-skills": patch
---

`chief-of-staff` now looks for a shared wiki before starting its own. It also runs `retro` after every large subagent run and acts on the findings itself, and runs `to-spec`, `to-tickets` and `implement-spec` for large chunks of work, reading each skill by relative path so they can stay user-invoked.
