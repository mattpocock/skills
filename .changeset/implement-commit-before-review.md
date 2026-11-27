---
"mattpocock-skills": patch
---

`implement` now commits before calling `code-review`, which only diffs committed work, and passes the commit it started from as the fixed point. Review fixes go in a commit on top.
