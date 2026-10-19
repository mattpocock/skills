---
"mattpocock-skills": patch
---

`setup-matt-pocock-skills` now wires up a git remote before writing a GitHub/GitLab tracker that nothing can reach (#1201), and offers to `git mv` a legacy `CONTEXT.md` / `CONTEXT-MAP.md` to its `GLOSSARY` name (#1176). The GitHub template comments before closing (#873), reads a PR's body as well as its comments (#1138), moves **Blocking** into Conventions with the native `gh` flags (#855), and names the command that counts open blockers (#1118). The GitLab template lists MRs with `-O json` and names the frontier query's command (#1143). Re-run `/setup-matt-pocock-skills` to refresh `docs/agents/`.
