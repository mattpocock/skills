---
"mattpocock-skills": minor
---

Make **`wayfinder`**'s no-duplication contract explicit: the map is an **index**, not a store.

Adopting "index" as the leading word for the map's role fixes two duplication risks. The map now states up front that a decision lives in exactly one place — its ticket — so it only ever gists and links, never restates the answer (previously this rule was implied inside an HTML comment in the map-body template). And graduating fog into a ticket now clears the graduated patch from the Fog, so a suspected question can't linger in both places at once.
