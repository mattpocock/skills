---
"mattpocock-skills": patch
---

`wayfinder` fixes: with no tracker doc, charting tells you to run `/setup-matt-pocock-skills` and uses the local-markdown tracker instead of inferring GitHub Issues from the git remote (#599); walking the map now fires a research subagent for each `research` ticket it creates or graduates, as charting already did (#941); a research ticket's context pointer is an absolute URL, since issue comments don't resolve relative links (#896).
