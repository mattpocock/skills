---
"mattpocock-skills": patch
---

Drop the hand-written Quickstart block from all 24 docs pages.

aihero.dev already renders an install widget above every skill page — a copy button, the single-skill command, the whole-set command, and the update line. Each page then wrote the same two commands out again immediately below it. The reader saw the install command twice.

The two copies had also drifted apart. The widget renders the current `npx skills@latest …` wording; the hand-written blocks still carried the older bare `npx skills …`, so every page showed the correct command and a stale one, one after the other.

Deleting the block removes 24 stale copies and leaves the site's own. `.agents/writing-docs.md` now states the rule directly — install wording is a property of the site, not of the page — and its template no longer carries a Quickstart to copy.
