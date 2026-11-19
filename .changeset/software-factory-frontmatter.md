---
"mattpocock-skills": patch
---

`software-factory` now installs with `npx skills add`: its description is quoted, so strict YAML parsers no longer read the colon in it as a nested mapping and skip the skill.
