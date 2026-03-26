#!/bin/bash
# git-guardrails: always-blocked operations
# These patterns are blocked regardless of repository. They represent
# irreversible or high-risk operations that should never be automated.

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command')

# Force push detection: match git push combined with any force flag
if echo "$COMMAND" | grep -qE 'git\s+push' && echo "$COMMAND" | grep -qE '(--force-with-lease|--force|\s-f)(\s|$)'; then
  echo "BLOCKED: Force push is always blocked by git-guardrails." >&2
  exit 2
fi

ALWAYS_BLOCKED=(
  # Destructive git operations (local but hard to recover)
  'git\s+reset\s+--hard'
  'git\s+clean\s+-f'
  'git\s+branch\s+-D'
  'git\s+checkout\s+\.'
  'git\s+restore\s+\.'

  # Repository destruction / renaming
  'gh\s+repo\s+delete'
  'gh\s+repo\s+archive'
  'gh\s+repo\s+rename'

  # Release destruction
  'gh\s+release\s+delete'
  'gh\s+release\s+delete-asset'

  # Issue/PR deletion (not close — deletion is permanent)
  'gh\s+issue\s+delete'

  # Codespace destruction
  'gh\s+codespace\s+delete'

  # Deploy key management
  'gh\s+repo\s+deploy-key\s+delete'
  'gh\s+repo\s+deploy-key\s+add'

  # Secrets and variables (security-sensitive)
  'gh\s+secret\s+(set|delete)'
  'gh\s+variable\s+(set|delete)'

  # PR merge (changes target branch permanently)
  'gh\s+pr\s+merge'

  # Release creation (publishes artifacts)
  'gh\s+release\s+create'

  # Workflow execution
  'gh\s+workflow\s+run'

  # Raw API mutations (could do anything)
  'gh\s+api\s+.*-X\s+(DELETE|POST|PUT|PATCH)'
  'gh\s+api\s+.*--method\s+(DELETE|POST|PUT|PATCH)'
)

for pattern in "${ALWAYS_BLOCKED[@]}"; do
  if echo "$COMMAND" | grep -qE "$pattern"; then
    echo "BLOCKED: '$COMMAND' is always blocked by git-guardrails (matched: $pattern). You do not have authority to run this command." >&2
    exit 2
  fi
done

exit 0
