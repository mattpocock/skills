---
"mattpocock-skills": patch
---

Fix `to-tickets` collapsing every local ticket into a single root `tickets.md`. On a local-markdown tracker it now publishes **one file per ticket** under the configured local structure (`.scratch/<feature-slug>/issues/<NN>-<slug>.md`, numbered in dependency order, each with a `Status:` line and text "Blocked by" references), matching the local issue-tracker model that `triage`, `wayfinder`, and the rest of the engineering skills already use. Real trackers are unchanged — still one issue per ticket with native blocking links. The single-file `tickets.md` template is gone; local and real trackers now share one per-ticket template, differing only in where the ticket lands and how its blocking edges are expressed.
