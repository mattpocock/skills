#!/bin/bash

INPUT=$(cat)
CMD=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

case "$CMD" in
  "git commit"*)
    STAGED=$(git diff --cached --name-only --diff-filter=ACM 2>/dev/null | grep -E '\.(go|ts|tsx|js|jsx|py|rs)$')
    if [ -n "$STAGED" ]; then
      printf "Run /clean-comments on these staged files before committing:\n%s\n" "$STAGED"
      exit 2
    fi
    ;;
esac

exit 0
