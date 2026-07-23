---
name: spawn
description: Hand the current conversation off to a fresh background agent — claude or codex — that picks up the work immediately.
argument-hint: "[claude|codex] What will the next session be used for?"
disable-model-invocation: true
---

Write a handoff summary of the current conversation so a fresh agent can continue the work, then spawn the agent with it via the bundled [spawn.sh](spawn.sh) — run it, never read it:

```bash
bash <this skill's base directory>/spawn.sh <claude|codex> "<descriptive session name>" - <<'PROMPT'
<handoff summary>
PROMPT
```

Spawn `claude` unless the user named `codex`. The agent starts in the current working directory; the script prints how the user monitors the session — relay that.

The handoff summary:

- Include a "suggested skills" section naming skills the agent should invoke.
- Reference artifacts (PRDs, plans, ADRs, issues, commits, diffs) by path or URL instead of duplicating them.
- Redact sensitive information (API keys, passwords, PII) — the summary becomes the agent's prompt.
- If the user passed arguments beyond the agent choice, treat them as what the next session will focus on and tailor the summary accordingly.
