---
name: git-guardrails-claude-code
description: Set up Claude Code hooks to block dangerous git and gh CLI commands before they execute. Use when user wants to prevent destructive git operations, block dangerous GitHub CLI actions (repo delete, pr merge, secret management, API mutations), or add git/gh safety hooks to Claude Code.
---

# Setup Git & GitHub CLI Guardrails

Sets up a PreToolUse hook that intercepts and blocks dangerous git and gh CLI commands before Claude executes them.

## What Gets Blocked

### Git commands

- `git push` (all variants including `--force`)
- `git reset --hard`
- `git clean -f` / `git clean -fd`
- `git branch -D`
- `git checkout .` / `git restore .`

### GitHub CLI (`gh`) commands

**Destructive operations:**
- `gh repo delete` / `gh repo archive` / `gh repo rename` / `gh repo edit`
- `gh release delete` / `gh release delete-asset`
- `gh issue delete`
- `gh codespace delete`
- `gh repo deploy-key delete`

**Shared-state modifications (visible to others):**
- `gh pr merge` / `gh pr close` / `gh pr review` / `gh pr comment`
- `gh issue close` / `gh issue lock` / `gh issue comment`
- `gh release create`
- `gh workflow run`

**Secret and variable management:**
- `gh secret set` / `gh secret delete`
- `gh variable set` / `gh variable delete`
- `gh repo deploy-key add`

**Raw API mutations:**
- `gh api -X DELETE|POST|PUT|PATCH`
- `gh api --method DELETE|POST|PUT|PATCH`

When blocked, Claude sees a message telling it that it does not have authority to access these commands.

## Steps

### 1. Ask scope

Ask the user: install for **this project only** (`.claude/settings.json`) or **all projects** (`~/.claude/settings.json`)?

### 2. Copy the hook script

The bundled script is at: [scripts/block-dangerous-git.sh](scripts/block-dangerous-git.sh)

Copy it to the target location based on scope:

- **Project**: `.claude/hooks/block-dangerous-git.sh`
- **Global**: `~/.claude/hooks/block-dangerous-git.sh`

Make it executable with `chmod +x`.

### 3. Add hook to settings

Add to the appropriate settings file:

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
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/block-dangerous-git.sh"
          }
        ]
      }
    ]
  }
}
```

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
            "command": "~/.claude/hooks/block-dangerous-git.sh"
          }
        ]
      }
    ]
  }
}
```

If the settings file already exists, merge the hook into existing `hooks.PreToolUse` array — don't overwrite other settings.

### 4. Ask about customization

Ask if user wants to add or remove any patterns from the blocked list. Edit the copied script accordingly.

### 5. Verify

Run a quick test:

```bash
echo '{"tool_input":{"command":"git push origin main"}}' | <path-to-script>
```

Should exit with code 2 and print a BLOCKED message to stderr.
