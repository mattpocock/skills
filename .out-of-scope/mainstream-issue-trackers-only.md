# Issue tracker integrations are limited to mainstream tools

`setup-matt-pocock-skills` only offers first-class support for **mainstream** issue trackers. Requests to add support for niche, new, or single-vendor experimental trackers are out of scope.

## Why this is out of scope

Every issue-tracker backend hard-codes a CLI shape into the skills (commands, flags, output parsing). Each new backend is permanent maintenance surface — it has to keep working as the tool's CLI evolves, and it has to keep being tested against `/to-spec`, `/to-tickets`, `/triage`, and friends. That cost is only worth paying for trackers a meaningful fraction of users actually have.

"Mainstream" is a judgment call, not a numeric bar:

- GitHub, GitLab, and Backlog.md are the kind of tools we'd consider mainstream — broadly known, widely used, well past the experimental phase.
- A brand-new agent-focused tool with a few hundred GitHub stars is not, no matter how interesting the design.

Stars, age, and download counts are useful signals when making the call but none of them is the rule. The rule is: would a typical engineer recognise this tool and have plausibly chosen it for their team?

The escape hatches for non-mainstream trackers already exist:

- `local markdown` for lightweight in-repo tracking.
- `other/custom` for users who want to wire something up themselves.

Neither requires the core skills to know about the specific tool.

## Prior requests

- #99 — "Add dex as an issue tracker backend" (dex was ~3 months old and ~300 stars at the time of the request)
