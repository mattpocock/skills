#!/bin/bash
# p5.js Skill — Local Development Server
# Serves the current directory over HTTP for loading local assets (fonts, images)
#
# Usage:
#   bash scripts/serve.sh [port] [directory]
#
# Examples:
#   bash scripts/serve.sh                    # serve CWD on port 8080
#   bash scripts/serve.sh 3000               # serve CWD on port 3000
#   bash scripts/serve.sh 8080 ./my-project  # serve specific directory

PORT="${1:-8080}"
DIR="${2:-.}"

echo "=== p5.js Dev Server ==="
echo "Serving: $(cd "$DIR" && pwd)"
echo "URL:     http://localhost:$PORT"
echo "Press Ctrl+C to stop"
echo ""

cd "$DIR" && python3 -m http.server "$PORT" 2>/dev/null || {
  echo "Python3 not found. Trying Node.js..."
  npx serve -l "$PORT" "$DIR" 2>/dev/null || {
    echo "Error: Need python3 or npx (Node.js) for local server"
    exit 1
  }
}
