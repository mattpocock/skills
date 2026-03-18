#!/bin/bash

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command')

# Dangerous git patterns
DANGEROUS_GIT_PATTERNS=(
  "git push"
  "git reset --hard"
  "git clean -fd"
  "git clean -f"
  "git branch -D"
  "git checkout \."
  "git restore \."
  "push --force"
  "reset --hard"
)

# Dangerous gh CLI patterns
# Destructive: delete repos, releases, issues, secrets, variables, codespaces, deploy keys
DANGEROUS_GH_PATTERNS=(
  "gh repo delete"
  "gh repo archive"
  "gh repo rename"
  "gh repo edit"
  "gh release delete"
  "gh release delete-asset"
  "gh issue delete"
  "gh issue close"
  "gh issue lock"
  "gh pr merge"
  "gh pr close"
  "gh pr review"
  "gh pr comment"
  "gh issue comment"
  "gh secret delete"
  "gh secret set"
  "gh variable delete"
  "gh variable set"
  "gh codespace delete"
  "gh repo deploy-key delete"
  "gh repo deploy-key add"
  "gh workflow run"
  "gh release create"
  "gh api -X DELETE"
  "gh api -X POST"
  "gh api -X PUT"
  "gh api -X PATCH"
  "gh api --method DELETE"
  "gh api --method POST"
  "gh api --method PUT"
  "gh api --method PATCH"
)

for pattern in "${DANGEROUS_GIT_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -qE "$pattern"; then
    echo "BLOCKED: '$COMMAND' matches dangerous git pattern '$pattern'. The user has prevented you from doing this." >&2
    exit 2
  fi
done

for pattern in "${DANGEROUS_GH_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -qE "$pattern"; then
    echo "BLOCKED: '$COMMAND' matches dangerous gh CLI pattern '$pattern'. The user has prevented you from doing this." >&2
    exit 2
  fi
done

exit 0
