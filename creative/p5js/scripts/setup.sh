#!/bin/bash
# p5.js Skill — Dependency Verification
# Run: bash skills/creative/p5js/scripts/setup.sh

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ok() { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
fail() { echo -e "${RED}[FAIL]${NC} $1"; }

echo "=== p5.js Skill — Setup Check ==="
echo ""

# Required: Node.js (for Puppeteer headless export)
if command -v node &>/dev/null; then
  NODE_VER=$(node -v)
  ok "Node.js $NODE_VER"
else
  warn "Node.js not found — optional, needed for headless export"
  echo "  Install: https://nodejs.org/ or 'brew install node'"
fi

# Required: npm (for Puppeteer install)
if command -v npm &>/dev/null; then
  NPM_VER=$(npm -v)
  ok "npm $NPM_VER"
else
  warn "npm not found — optional, needed for headless export"
fi

# Optional: Puppeteer
if node -e "require('puppeteer')" 2>/dev/null; then
  ok "Puppeteer installed"
else
  warn "Puppeteer not installed — needed for headless export"
  echo "  Install: npm install puppeteer"
fi

# Optional: ffmpeg (for MP4 encoding from frame sequences)
if command -v ffmpeg &>/dev/null; then
  FFMPEG_VER=$(ffmpeg -version 2>&1 | head -1 | awk '{print $3}')
  ok "ffmpeg $FFMPEG_VER"
else
  warn "ffmpeg not found — needed for MP4 export"
  echo "  Install: brew install ffmpeg (macOS) or apt install ffmpeg (Linux)"
fi

# Optional: Python3 (for local server)
if command -v python3 &>/dev/null; then
  PY_VER=$(python3 --version 2>&1 | awk '{print $2}')
  ok "Python $PY_VER (for local server: python3 -m http.server)"
else
  warn "Python3 not found — needed for local file serving"
fi

# Browser check (macOS)
if [[ "$(uname)" == "Darwin" ]]; then
  if open -Ra "Google Chrome" 2>/dev/null; then
    ok "Google Chrome found"
  elif open -Ra "Safari" 2>/dev/null; then
    ok "Safari found"
  else
    warn "No browser detected"
  fi
fi

echo ""
echo "=== Core Requirements ==="
echo "  A modern browser (Chrome/Firefox/Safari/Edge)"
echo "  p5.js loaded via CDN — no local install needed"
echo ""
echo "=== Optional (for export) ==="
echo "  Node.js + Puppeteer — headless frame capture"
echo "  ffmpeg — frame sequence to MP4"
echo "  Python3 — local development server"
echo ""
echo "=== Quick Start ==="
echo "  1. Create an HTML file with inline p5.js sketch"
echo "  2. Open in browser: open sketch.html"
echo "  3. Press 's' to save PNG, 'g' to save GIF"
echo ""
echo "Setup check complete."
