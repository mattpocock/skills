#!/bin/bash
# git-guardrails: repo-aware conditional blocking
# Blocks write operations unless the current repository matches
# an allowlisted pattern in git-guardrails.conf.
#
# Each command category can be set to: allow, ask, or block.
# - allow: permitted on allowlisted repos, blocked elsewhere
# - ask:   prompts the user for confirmation (works on any repo)
# - block: always blocked (redundant with block-always.sh, but available)

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command')
CWD=$(echo "$INPUT" | jq -r '.cwd')

# --- Config loading ---

CONF_FILE="${HOME}/.claude/hooks/git-guardrails.conf"
if [ ! -f "$CONF_FILE" ]; then
  # Fall back to project-level config
  CONF_FILE="${CLAUDE_PROJECT_DIR:-.}/.claude/hooks/git-guardrails.conf"
fi

# Look up the mode for a given category by grep-ing the config file.
# Returns "block" if category not found or config missing.
get_mode() {
  local category="$1"
  [ ! -f "$CONF_FILE" ] && echo "block" && return

  # Find the section, then the first mode= line after it
  local in_section=false
  while IFS= read -r line || [ -n "$line" ]; do
    line="${line%%#*}"
    line="$(echo "$line" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"
    [ -z "$line" ] && continue

    if [[ "$line" =~ ^\[([a-z-]+)\]$ ]]; then
      if [ "${BASH_REMATCH[1]}" = "$category" ]; then
        in_section=true
      else
        # Left our section — stop looking
        $in_section && break
        in_section=false
      fi
      continue
    fi

    if $in_section && [[ "$line" =~ ^mode=(.+)$ ]]; then
      local mode="${BASH_REMATCH[1]}"
      if [[ "$mode" =~ ^(allow|ask|block)$ ]]; then
        echo "$mode"
        return
      fi
    fi
  done < "$CONF_FILE"

  echo "block"
}

# Collect repo allowlist patterns from config
get_repo_patterns() {
  [ ! -f "$CONF_FILE" ] && return
  local in_repos=false
  while IFS= read -r line || [ -n "$line" ]; do
    line="${line%%#*}"
    line="$(echo "$line" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"
    [ -z "$line" ] && continue

    if [[ "$line" =~ ^\[([a-z-]+)\]$ ]]; then
      if [ "${BASH_REMATCH[1]}" = "repos" ]; then
        in_repos=true
      else
        in_repos=false
      fi
      continue
    fi

    if $in_repos; then
      echo "$line"
    fi
  done < "$CONF_FILE"
}

# --- Category detection ---
# Determine which category (if any) this command falls into.
# Commands not matching any category are allowed through (they're
# either read-only or handled by block-always.sh).

detect_category() {
  local cmd="$1"

  # git push (non-force; force push is caught by block-always.sh)
  if echo "$cmd" | grep -qE 'git\s+push'; then
    echo "git-push"
    return
  fi

  # PR write operations (merge is caught by block-always.sh)
  if echo "$cmd" | grep -qE 'gh\s+pr\s+(create|close|reopen|comment|edit|review)'; then
    echo "pr-write"
    return
  fi

  # Issue write operations (delete is caught by block-always.sh)
  if echo "$cmd" | grep -qE 'gh\s+issue\s+(create|close|reopen|comment|edit|lock|unlock|transfer)'; then
    echo "issue-write"
    return
  fi

  # Repo settings
  if echo "$cmd" | grep -qE 'gh\s+repo\s+edit'; then
    echo "repo-settings"
    return
  fi

  # No category matched — allow through
  echo ""
}

CATEGORY=$(detect_category "$COMMAND")

# Not a gated command — allow
if [ -z "$CATEGORY" ]; then
  exit 0
fi

# --- Mode lookup ---

MODE=$(get_mode "$CATEGORY")

# If mode is "block", block regardless of repo
if [ "$MODE" = "block" ]; then
  echo "BLOCKED: '$COMMAND' is blocked by git-guardrails (category: $CATEGORY, mode: block). You do not have authority to run this command." >&2
  exit 2
fi

# If mode is "ask", prompt the user regardless of repo
if [ "$MODE" = "ask" ]; then
  # Output structured JSON for the "ask" permission decision
  cat <<EOF
{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"ask","permissionDecisionReason":"git-guardrails: '$COMMAND' requires approval (category: $CATEGORY)"}}
EOF
  exit 0
fi

# Mode is "allow" — check if repo is in the allowlist

# --- Repo detection ---

REPO=""
if [ -d "$CWD" ]; then
  REMOTE_URL=$(git -C "$CWD" remote get-url origin 2>/dev/null)
  if [ -n "$REMOTE_URL" ]; then
    # Normalize to owner/repo from common URL formats:
    #   git@github.com:owner/repo.git
    #   https://github.com/owner/repo.git
    #   https://github.com/owner/repo
    REPO=$(echo "$REMOTE_URL" | sed -E 's|.*github\.com[:/]||; s|\.git$||')
  fi
fi

if [ -z "$REPO" ]; then
  echo "BLOCKED: Could not determine repository from git remote. Write operations are blocked by default (category: $CATEGORY)." >&2
  exit 2
fi

# --- Allowlist check ---

PATTERNS=$(get_repo_patterns)
if [ -z "$PATTERNS" ]; then
  echo "BLOCKED: No repo patterns configured in git-guardrails.conf. '$REPO' is not allowlisted (category: $CATEGORY)." >&2
  exit 2
fi

while IFS= read -r pattern; do
  # Bash glob matching: pattern like "owner/*" matches "owner/any-repo"
  if [[ "$REPO" == $pattern ]]; then
    exit 0
  fi
done <<< "$PATTERNS"

echo "BLOCKED: Repository '$REPO' is not in the git-guardrails allowlist. Write operations are blocked (category: $CATEGORY)." >&2
exit 2
