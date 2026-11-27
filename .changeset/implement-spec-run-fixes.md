---
"mattpocock-skills": patch
---

`implement-spec` implementers now fast-forward the integration branch themselves, so a merger subagent runs only when that fails. They verify with the pre-commit hook plus touched tests (CI runs the full suite), treat prototype branches as a behaviour reference only, and step 7 splits review fixes into batches of about five across parallel implementers. `prototype` tags deliberate shortcuts with `PROTOTYPE-SHORTCUT` and says its code is never copied.
