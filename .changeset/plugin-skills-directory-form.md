---
"mattpocock-skills": patch
---

Switch the plugin manifest's `skills` field to self-maintaining directory form. Instead of hand-listing all 22 skill directories, `.claude-plugin/plugin.json` now points at the two promoted buckets (`./skills/engineering`, `./skills/productivity`) and lets Claude Code discover the skills one level down. New promoted skills are picked up automatically, and the manifest can no longer drift out of sync with the tree.
