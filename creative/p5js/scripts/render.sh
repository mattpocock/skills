#!/bin/bash
# p5.js Skill — Headless Render Pipeline
# Renders a p5.js sketch to MP4 video via Puppeteer + ffmpeg
#
# Usage:
#   bash scripts/render.sh sketch.html output.mp4 [options]
#
# Options:
#   --width    Canvas width (default: 1920)
#   --height   Canvas height (default: 1080)
#   --fps      Frames per second (default: 30)
#   --duration Duration in seconds (default: 10)
#   --quality  CRF value 0-51 (default: 18, lower = better)
#   --frames-only  Only export frames, skip MP4 encoding
#
# Examples:
#   bash scripts/render.sh sketch.html output.mp4
#   bash scripts/render.sh sketch.html output.mp4 --duration 30 --fps 60
#   bash scripts/render.sh sketch.html output.mp4 --width 3840 --height 2160

set -euo pipefail

# Defaults
WIDTH=1920
HEIGHT=1080
FPS=30
DURATION=10
CRF=18
FRAMES_ONLY=false

# Parse arguments
INPUT="${1:?Usage: render.sh <input.html> <output.mp4> [options]}"
OUTPUT="${2:?Usage: render.sh <input.html> <output.mp4> [options]}"
shift 2

while [[ $# -gt 0 ]]; do
  case $1 in
    --width) WIDTH="$2"; shift 2 ;;
    --height) HEIGHT="$2"; shift 2 ;;
    --fps) FPS="$2"; shift 2 ;;
    --duration) DURATION="$2"; shift 2 ;;
    --quality) CRF="$2"; shift 2 ;;
    --frames-only) FRAMES_ONLY=true; shift ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

TOTAL_FRAMES=$((FPS * DURATION))
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FRAME_DIR=$(mktemp -d)

echo "=== p5.js Render Pipeline ==="
echo "Input:      $INPUT"
echo "Output:     $OUTPUT"
echo "Resolution: ${WIDTH}x${HEIGHT}"
echo "FPS:        $FPS"
echo "Duration:   ${DURATION}s (${TOTAL_FRAMES} frames)"
echo "Quality:    CRF $CRF"
echo "Frame dir:  $FRAME_DIR"
echo ""

# Check dependencies
command -v node >/dev/null 2>&1 || { echo "Error: Node.js required"; exit 1; }
if [ "$FRAMES_ONLY" = false ]; then
  command -v ffmpeg >/dev/null 2>&1 || { echo "Error: ffmpeg required for MP4"; exit 1; }
fi

# Step 1: Capture frames via Puppeteer
echo "Step 1/2: Capturing ${TOTAL_FRAMES} frames..."
node "$SCRIPT_DIR/export-frames.js" \
  "$INPUT" \
  --output "$FRAME_DIR" \
  --width "$WIDTH" \
  --height "$HEIGHT" \
  --frames "$TOTAL_FRAMES" \
  --fps "$FPS"

echo "Frames captured to $FRAME_DIR"

if [ "$FRAMES_ONLY" = true ]; then
  echo "Frames saved to: $FRAME_DIR"
  echo "To encode manually:"
  echo "  ffmpeg -framerate $FPS -i $FRAME_DIR/frame-%04d.png -c:v libx264 -crf $CRF -pix_fmt yuv420p $OUTPUT"
  exit 0
fi

# Step 2: Encode to MP4
echo "Step 2/2: Encoding MP4..."
ffmpeg -y \
  -framerate "$FPS" \
  -i "$FRAME_DIR/frame-%04d.png" \
  -c:v libx264 \
  -preset slow \
  -crf "$CRF" \
  -pix_fmt yuv420p \
  -movflags +faststart \
  "$OUTPUT" \
  2>"$FRAME_DIR/ffmpeg.log"

# Cleanup
rm -rf "$FRAME_DIR"

# Report
FILE_SIZE=$(ls -lh "$OUTPUT" | awk '{print $5}')
echo ""
echo "=== Done ==="
echo "Output: $OUTPUT ($FILE_SIZE)"
echo "Duration: ${DURATION}s at ${FPS}fps, ${WIDTH}x${HEIGHT}"
