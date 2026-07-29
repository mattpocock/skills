#!/usr/bin/env bash
# spawn.sh <agent> <name> [prompt|-]
# Launches a background agent session seeded with the prompt.
# Prompt is read from stdin when the third argument is omitted or '-'.
#
# claude has native managed background jobs (claude --bg / claude agents).
# Every other agent is spawned interactively inside herdr when its server is
# running (list/read/send/attach management); otherwise as a supervised
# one-shot under the user's systemd session (status/logs/stop management).
set -euo pipefail

usage() {
  echo "usage: spawn.sh <claude|codex|pi|cursor|opencode|copilot> <name> [prompt|-]" >&2
  echo "       prompt is read from stdin when omitted or '-'" >&2
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

if [ "$agent" = "claude" ]; then
  claude --bg --name "$name" "$prompt"
  echo "Spawned claude session '$name'. Manage it with: claude agents"
  exit 0
fi

# Interactive invocation, seeded with the prompt — used inside herdr panes.
case "$agent" in
codex) interactive=(codex "$prompt") ;;
pi) interactive=(pi "$prompt") ;;
cursor) interactive=(cursor-agent "$prompt") ;;
opencode) interactive=(opencode --prompt "$prompt") ;;
copilot) interactive=(copilot -i "$prompt") ;;
*) usage ;;
esac

if herdr agent list >/dev/null 2>&1; then
  herdr agent start "$name" --cwd "$PWD" --no-focus -- "${interactive[@]}"
  echo "Spawned $agent session '$name' in herdr."
  echo "  list:   herdr agent list"
  echo "  read:   herdr agent read '$name'"
  echo "  steer:  herdr agent send '$name' '<text>'"
  echo "  attach: herdr agent attach '$name'"
  exit 0
fi

command -v systemd-run >/dev/null 2>&1 || {
  echo "spawn.sh: no herdr server running and systemd-run unavailable — launch herdr and retry" >&2
  exit 1
}

# Non-interactive one-shot — flags keep the run from blocking on approvals.
case "$agent" in
codex) oneshot=(codex exec --sandbox workspace-write --skip-git-repo-check "$prompt") ;;
pi) oneshot=(pi -p "$prompt") ;;
cursor) oneshot=(cursor-agent -p --force --output-format text "$prompt") ;;
opencode) oneshot=(opencode run --title "$name" "$prompt") ;;
copilot) oneshot=(copilot -p "$prompt" --allow-all-tools) ;;
esac

# The systemd user manager doesn't inherit this shell's PATH; resolve the
# binary now and pass PATH through for any children it spawns.
bin="$(command -v "${oneshot[0]}")" || {
  echo "spawn.sh: ${oneshot[0]} is not installed" >&2
  exit 1
}
oneshot[0]="$bin"

slug="$(printf '%s' "$name" | tr '[:upper:] ' '[:lower:]-' | tr -cd 'a-z0-9-')"
unit="spawn-${slug:-session}-$(date +%H%M%S)"
systemd-run --user --unit "$unit" --working-directory="$PWD" \
  --setenv=PATH="$PATH" --setenv=HOME="$HOME" "${oneshot[@]}" >/dev/null 2>&1

echo "Spawned $agent session '$name' as user unit $unit (no herdr server running)."
echo "  status: systemctl --user status $unit"
echo "  logs:   journalctl --user -u $unit -f"
echo "  stop:   systemctl --user stop $unit"
case "$agent" in
codex) echo "  resume: codex exec resume <session id from logs>" ;;
pi) echo "  resume: pi -c   (from this directory)" ;;
cursor) echo "  resume: cursor-agent resume" ;;
opencode) echo "  resume: opencode run -c   (or: opencode session list)" ;;
copilot) echo "  resume: copilot --resume" ;;
esac
