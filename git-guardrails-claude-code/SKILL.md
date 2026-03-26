---
name: git-guardrails-claude-code
description: Set up Claude Code hooks to block dangerous git and gh CLI commands before they execute. Use when user wants to prevent destructive git operations, block dangerous GitHub CLI actions (repo delete, pr merge, secret management, API mutations), or add git/gh safety hooks to Claude Code. Supports two tiers — irreversible operations are always blocked, while write operations (push, PR/issue CRUD) can be allowed on personal repos via a configurable allowlist.
---

# Setup Git & GitHub CLI Guardrails

Sets up PreToolUse hooks that intercept git and gh CLI commands before Claude executes them. Uses a two-tier system:

1. **Always blocked** — Irreversible or high-risk operations that should never be automated, regardless of repository.
2. **Repo-gated** — Write operations that can be allowed on personal repositories via an allowlist config, with per-category control (allow / ask / block).

## What Gets Blocked

### Always blocked (every repo, no exceptions)

These are enforced by `block-always.sh` and cannot be overridden:

| Category | Commands |
|----------|----------|
| Force push | `git push --force`, `git push -f`, `--force-with-lease` |
| Destructive git | `git reset --hard`, `git clean -f`, `git branch -D`, `git checkout .`, `git restore .` |
| Repo destruction | `gh repo delete`, `gh repo archive`, `gh repo rename` |
| Release management | `gh release create`, `gh release delete`, `gh release delete-asset` |
| PR merge | `gh pr merge` |
| Issue deletion | `gh issue delete` |
| Workflow execution | `gh workflow run` |
| Secrets & variables | `gh secret set/delete`, `gh variable set/delete` |
| Deploy keys | `gh repo deploy-key add/delete` |
| Codespace deletion | `gh codespace delete` |
| Raw API mutations | `gh api -X POST/PUT/PATCH/DELETE`, `gh api --method POST/PUT/PATCH/DELETE` |

### Repo-gated (configurable per category)

These are enforced by `block-repo-writes.sh`. Each category can be set to:
- **allow** — permitted on repos matching the allowlist, blocked elsewhere
- **ask** — Claude pauses and asks the user for confirmation (any repo)
- **block** — always blocked (same effect as the always-blocked tier)

| Category | Commands | Suggested default |
|----------|----------|-------------------|
| `git-push` | `git push` (non-force) | allow |
| `pr-write` | `gh pr create/close/reopen/comment/edit/review` | allow |
| `issue-write` | `gh issue create/close/reopen/comment/edit/lock/unlock/transfer` | allow |
| `repo-settings` | `gh repo edit` | block |

## Steps

### 1. Check for existing guardrails

Look for an older version of this skill (single `block-dangerous-git.sh` hook). If found:
- Note its location and scope (project or global)
- Remove the old hook entry from the settings file
- Delete the old script file
- Inform the user that the old version is being replaced with the two-tier system

Check both `.claude/settings.json` (project) and `~/.claude/settings.json` (global) for existing hook entries referencing `block-dangerous-git.sh`.

### 2. Ask scope

Ask the user: install for **this project only** (`.claude/settings.json`) or **all projects** (`~/.claude/settings.json`)?

Global is recommended since these guardrails protect against mistakes in any repo.

### 3. Ask for repo allowlist patterns

Ask the user which repositories should allow write operations. Explain:

> "I need to know which repos are yours (where push, PR, and issue operations should be allowed). Give me glob patterns that match `owner/repo` — for example, `yourusername/*` to allow all your personal repos, or `your-org/*` for an org you own."

Collect one or more patterns. These go in the `[repos]` section of the config file.

### 4. Walk through command categories

Present the four configurable categories and ask the user to choose a mode for each. Show them this table:

| Category | What it covers | Modes |
|----------|---------------|-------|
| `git-push` | Non-force `git push` | **allow** / ask / block |
| `pr-write` | PR create, close, reopen, comment, edit, review | **allow** / ask / block |
| `issue-write` | Issue create, close, reopen, comment, edit, lock, unlock, transfer | **allow** / ask / block |
| `repo-settings` | `gh repo edit` | allow / ask / **block** |

Bold = suggested default. Explain the three modes:
- **allow**: Works silently on your allowlisted repos, blocked on everything else
- **ask**: Claude pauses and asks you before proceeding (on any repo)
- **block**: Always blocked, even on your own repos

### 5. Copy the hook scripts

The bundled scripts are:
- [scripts/block-always.sh](scripts/block-always.sh) — always-blocked tier
- [scripts/block-repo-writes.sh](scripts/block-repo-writes.sh) — repo-gated tier

Copy both to the target location based on scope:
- **Project**: `.claude/hooks/block-always.sh` and `.claude/hooks/block-repo-writes.sh`
- **Global**: `~/.claude/hooks/block-always.sh` and `~/.claude/hooks/block-repo-writes.sh`

Make both executable with `chmod +x`.

### 6. Write the config file

Create `git-guardrails.conf` based on the user's answers. Use the example at [scripts/git-guardrails.conf.example](scripts/git-guardrails.conf.example) as a template.

The config file always goes at `~/.claude/hooks/git-guardrails.conf` (even for project-scoped hooks) because the allowlist is personal — it defines *your* repos, not a project setting.

Fill in:
- `[repos]` section with the user's glob patterns
- Each category section with the chosen mode

### 7. Add hooks to settings

Add both hooks to the appropriate settings file. If the file already has hooks, merge into the existing `hooks.PreToolUse` array — don't overwrite other settings.

**Global** (`~/.claude/settings.json`):

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/hooks/block-always.sh"
          },
          {
            "type": "command",
            "command": "~/.claude/hooks/block-repo-writes.sh"
          }
        ]
      }
    ]
  }
}
```

**Project** (`.claude/settings.json`):

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/block-always.sh"
          },
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/block-repo-writes.sh"
          }
        ]
      }
    ]
  }
}
```

### 8. Verify

Run test commands to confirm both hooks work:

```bash
# Should be blocked by block-always.sh (force push)
echo '{"tool_input":{"command":"git push --force origin main"}}' | ~/.claude/hooks/block-always.sh

# Should be blocked by block-always.sh (PR merge)
echo '{"tool_input":{"command":"gh pr merge 42"}}' | ~/.claude/hooks/block-always.sh

# Should be allowed by block-repo-writes.sh (allowlisted repo push)
echo '{"tool_input":{"command":"git push origin main"},"cwd":"/path/to/personal/repo"}' | ~/.claude/hooks/block-repo-writes.sh

# Should be blocked by block-repo-writes.sh (non-allowlisted repo push)
echo '{"tool_input":{"command":"git push origin main"},"cwd":"/path/to/employer/repo"}' | ~/.claude/hooks/block-repo-writes.sh
```

For the repo-writes tests, use actual directories on the user's machine where the git remote will resolve correctly.

### 9. Summarize

Tell the user what was installed and how to reconfigure. Mention:
- To change repo patterns or category modes, edit `~/.claude/hooks/git-guardrails.conf`
- To re-run this setup interactively, invoke this skill again
- The always-blocked list is hardcoded in `block-always.sh` — edit that script directly if needed
