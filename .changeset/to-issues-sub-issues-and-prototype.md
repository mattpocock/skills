---
"mattpocock-skills": minor
---

Sharpen how the **`to-issues`** skill records structure. The "What to build" template now adds a context pointer to where the **`/prototype`** skill's code lives, rather than inlining a snippet from it. And publishing now prefers the tracker's **native sub-issues** for parent → slice and **native blocking edges** for `Blocked by` where the tracker supports them (mechanics already live in the issue-tracker doc), keeping the `## Parent` / `## Blocked by` body sections as the fallback.
