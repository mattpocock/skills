---
"mattpocock-skills": patch
---

Restore **`wayfinder`**'s early exit when the frontier grilling turns up no fog.

The skill used to have a **Skipping The Decision Map** section: if the opening grilling surfaced no fog of war, there was no map to build, so it offered to skip straight to implementing. That clause was demoted to a parenthetical inside the Handoff section, then deleted as collateral when Handoff was removed — never an intentional cut.

It's back, co-located in **Chart the map** step 2 (Map the frontier), where the fog/no-fog outcome is actually determined: if breadth-first grilling surfaces no fog — the journey is small enough for one session — you don't need a map, so stop and ask the user how they'd like to proceed. The ask, rather than an auto-skip, is preserved from the original.
