---
"mattpocock-skills": patch
---

Add `constrain`, an in-progress user-invoked skill: fence one tool's API down to an allowlisted surface that agents may use, enforced by import-level lint rules in any language whose error messages name the alternative. A ratchet baseline lets a fence land on a dirty codebase: existing violations get paid down by future changes, and re-running the skill tightens the allowlist.
