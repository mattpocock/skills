---
"mattpocock-skills": patch
---

Add `constrain`, an in-progress user-invoked skill: fence one tool's API down to an allowlisted surface that agents may use, covering its imports, the properties and methods allowed on each object it hands out, and the import edges allowed between modules, enforced by lint and import-graph rules in any language (type-aware where the object is identified by type) whose error messages name the alternative. A ratchet baseline lets a fence land on a dirty codebase: existing violations get paid down by future changes, and re-running the skill tightens the allowlist.
