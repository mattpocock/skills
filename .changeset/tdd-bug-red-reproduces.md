---
"mattpocock-skills": patch
---

`tdd` now requires a bug fix's red test to reproduce the bug against the existing code, failing on the wrong behaviour rather than on a missing symbol, so the regression guard actually gets written (#1210).
