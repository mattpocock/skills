#!/usr/bin/env bash
# spawn.sh <claude|codex> <name> [prompt|-]
# Launches a background agent session seeded with the prompt.
# Prompt is read from stdin when the third argument is omitted or '-'.
set -euo pipefail

usage() {
  echo "usage: spawn.sh <claude|codex> <name> [prompt|-]   (prompt read from stdin when omitted or '-')" >&2
  exit 2
}

agent="${1:-}"
name="${2:-}"
prompt="${3:--}"
[ -n "$agent" ] && [ -n "$name" ] || usage

if [ "$prompt" = "-" ]; then
  prompt="$(cat)"
fi
[ -n "$prompt" ] || { echo "spawn.sh: empty prompt" >&2; exit 2; }

case "$agent" in
claude)
  claude --bg --name "$name" "$prompt"
  echo "Spawned claude session '$name'. Manage it with: claude agents"
  ;;
codex)
  slug="$(printf '%s' "$name" | tr '[:upper:] ' '[:lower:]-' | tr -cd 'a-z0-9-')"
  dir="${TMPDIR:-/tmp}/codex-spawns"
  mkdir -p "$dir"
  base="$dir/${slug:-session}-$(date +%Y%m%d-%H%M%S)"
  nohup codex exec --sandbox workspace-write --cd "$PWD" \
    -o "$base.last.md" - <<<"$prompt" >"$base.log" 2>&1 &
  echo "Spawned codex session '$name' (pid $!)."
  echo "  log:          $base.log"
  echo "  final answer: $base.last.md"
  echo "  follow with:  tail -f $base.log"
  ;;
*)
  usage
  ;;
esac
