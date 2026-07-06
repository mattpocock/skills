---
"mattpocock-skills": minor
---

Change **`wayfinder`**'s claim mechanism from a label to an assignee.

A session now **claims** a ticket by assigning it to the dev driving the map, rather than setting a `wayfinder:claimed` label. The assignee _is_ the claim — an open, unassigned ticket is unclaimed — which reads more naturally in GitHub's own UI and frees the label vocabulary to `wayfinder:<type>` alone. The *claim* leading word and its "first, before any work" rationale are unchanged; only the physical expression moved.
