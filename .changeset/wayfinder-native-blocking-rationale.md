---
"mattpocock-skills": patch
---

Sharpen Wayfinder's blocking rule to prefer the tracker's native dependency relationship, and update the GitHub and GitLab issue-tracker templates to match.

Native blocking is essential rather than cosmetic: it renders the frontier visually in the tracker's own UI, so the human sees what's takeable at a glance without opening the map. `wayfinder`'s SKILL.md now states that preference and rationale; the GitHub template spells out the native issue-dependencies recipe (`gh api .../dependencies/blocked_by`, frontier query on `issue_dependencies_summary.blocked_by`), and the GitLab template names the native `/blocked_by` blocking link (Premium/Ultimate) with the body-convention fallback. Both keep the body fallback for trackers that lack native blocking.
