#!/usr/bin/env bash
set -euo pipefail
G="\033[0;32m"; R="\033[0;31m"; N="\033[0m"
ok() { echo -e "  ${G}+${N} $1"; }
fail() { echo -e "  ${R}x${N} $1"; }
echo ""; echo "Manim Video Skill — Setup Check"; echo ""
errors=0
command -v python3 &>/dev/null && ok "Python $(python3 --version 2>&1 | awk '{print $2}')" || { fail "Python 3 not found"; errors=$((errors+1)); }
python3 -c "import manim" 2>/dev/null && ok "Manim $(manim --version 2>&1 | head -1)" || { fail "Manim not installed: pip install manim"; errors=$((errors+1)); }
command -v pdflatex &>/dev/null && ok "LaTeX (pdflatex)" || { fail "LaTeX not found (macOS: brew install --cask mactex-no-gui)"; errors=$((errors+1)); }
command -v ffmpeg &>/dev/null && ok "ffmpeg" || { fail "ffmpeg not found"; errors=$((errors+1)); }
echo ""
[ $errors -eq 0 ] && echo -e "${G}All prerequisites satisfied.${N}" || echo -e "${R}$errors prerequisite(s) missing.${N}"
echo ""
