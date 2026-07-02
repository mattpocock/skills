---
"mattpocock-skills": minor
---

Make **`wayfinder`** collaborative by moving the map off a local Markdown file and onto the repo's issue tracker.

The map is now a single `wayfinder:map` issue whose tickets are its child issues — one shared URL the whole team can watch and comment on. Blocking, claiming (`wayfinder:claimed`), and the frontier query all use native tracker semantics, so a session loads the map at low resolution (Notes + one context pointer per closed ticket + Fog prose) and zooms into individual tickets on demand, instead of loading the whole map every time.

Wayfinder stays tracker-agnostic: the per-tracker mechanics live behind a pointer in `docs/agents/issue-tracker.md`, so `setup-matt-pocock-skills` now seeds a "Wayfinding operations" section for GitHub, GitLab, and local-markdown. Absent that doc, Wayfinder defaults to local-markdown.
