# Export Pipeline

## PNG Export

### In-Sketch (Keyboard Shortcut)

```javascript
function keyPressed() {
  if (key === 's' || key === 'S') {
    saveCanvas('output', 'png');
    // Downloads output.png immediately
  }
}
```

### Timed Export (Static Generative)

```javascript
function setup() {
  createCanvas(3840, 2160);
  pixelDensity(1);
  randomSeed(CONFIG.seed);
  noiseSeed(CONFIG.seed);
  noLoop();
}

function draw() {
  // ... render everything ...
  saveCanvas('output-seed-' + CONFIG.seed, 'png');
}
```

### High-Resolution Export

For resolutions beyond screen size, use `pixelDensity()` or a large offscreen buffer:

```javascript
function exportHighRes(scale) {
  let buffer = createGraphics(width * scale, height * scale);
  buffer.scale(scale);
  // Re-render everything to buffer at higher resolution
  renderScene(buffer);
  buffer.save('highres-output.png');
}
```

### Batch Seed Export

```javascript
function exportBatch(startSeed, count) {
  for (let i = 0; i < count; i++) {
    CONFIG.seed = startSeed + i;
    randomSeed(CONFIG.seed);
    noiseSeed(CONFIG.seed);
    // Render
    background(0);
    renderScene();
    saveCanvas('seed-' + nf(CONFIG.seed, 5), 'png');
  }
}
```

## GIF Export

### saveGif()

```javascript
function keyPressed() {
  if (key === 'g' || key === 'G') {
    saveGif('output', 5);
    // Captures 5 seconds of animation
    // Options: saveGif(filename, duration, options)
  }
}

// With options
saveGif('output', 5, {
  delay: 0,        // delay before starting capture (seconds)
  units: 'seconds' // or 'frames'
});
```

Limitations:
- GIF is 256 colors max — dithering artifacts on gradients
- Large canvases produce huge files
- Use a smaller canvas (640x360) for GIF, higher for PNG/MP4
- Frame rate is approximate

### Optimal GIF Settings

```javascript
// For GIF output, use smaller canvas and lower framerate
function setup() {
  createCanvas(640, 360);
  frameRate(15);  // GIF standard
  pixelDensity(1);
}
```

## Frame Sequence Export

### saveFrames()

```javascript
function keyPressed() {
  if (key === 'f') {
    saveFrames('frame', 'png', 10, 30);
    // 10 seconds, 30 fps → 300 PNG files
    // Downloads as individual files (browser may block bulk downloads)
  }
}
```

### Manual Frame Export (More Control)

```javascript
let recording = false;
let frameNum = 0;
const TOTAL_FRAMES = 300;

function keyPressed() {
  if (key === 'r') recording = !recording;
}

function draw() {
  // ... render frame ...

  if (recording) {
    saveCanvas('frame-' + nf(frameNum, 4), 'png');
    frameNum++;
    if (frameNum >= TOTAL_FRAMES) {
      recording = false;
      noLoop();
      console.log('Recording complete: ' + frameNum + ' frames');
    }
  }
}
```

### Deterministic Capture (Critical for Video)

The `noLoop()` + `redraw()` pattern is **required** for frame-perfect headless capture. Without it, p5's draw loop runs freely in Chrome while Puppeteer screenshots are slow — the sketch runs ahead and you get duplicate/missing frames.

```javascript
function setup() {
  createCanvas(1920, 1080);
  pixelDensity(1);
  noLoop();                    // STOP the automatic draw loop
  window._p5Ready = true;      // Signal to capture script
}

function draw() {
  // This only runs when redraw() is called by the capture script
  // frameCount increments exactly once per redraw()
}
```

The bundled `scripts/export-frames.js` detects `window._p5Ready` and switches to deterministic mode automatically. Without it, falls back to timed capture (less precise).

### ffmpeg: Frames to MP4

```bash
# Basic encoding
ffmpeg -framerate 30 -i frame-%04d.png -c:v libx264 -pix_fmt yuv420p output.mp4

# High quality
ffmpeg -framerate 30 -i frame-%04d.png \
  -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p \
  output.mp4

# With audio
ffmpeg -framerate 30 -i frame-%04d.png -i audio.mp3 \
  -c:v libx264 -c:a aac -shortest \
  output.mp4

# Loop for social media (3 loops)
ffmpeg -stream_loop 2 -i output.mp4 -c copy output-looped.mp4
```

### Video Export Gotchas

**YUV420 clips dark values.** H.264 encodes in YUV420 color space, which rounds dark RGB values. Content below RGB(8,8,8) may become pure black. Subtle dark details (dim particle trails, faint noise textures) disappear in the encoded video even though they're visible in the PNG frames.

**Fix:** Ensure minimum brightness of ~10 for any visible content. Test by encoding a few frames and comparing the MP4 frame vs the source PNG.

```bash
# Extract a frame from MP4 for comparison
ffmpeg -i output.mp4 -vf "select=eq(n\,100)" -vframes 1 check.png
```

**Static frames look broken in video.** If an algorithm produces a single static image (like a pre-computed attractor heatmap), it reads as a freeze/glitch in video. Always add animation even to static content:
- Progressive reveal (expand from center, sweep across)
- Slow parameter drift (rotate color mapping, shift noise offset)
- Camera-like motion (slow zoom, slight pan)
- Overlay animated particles or grain

**Scene transitions are mandatory.** Hard cuts between visually different scenes are jarring. Use fade envelopes:

```javascript
const FADE_FRAMES = 15;  // half-second at 30fps
let fade = 1;
if (localFrame < FADE_FRAMES) fade = localFrame / FADE_FRAMES;
if (localFrame > SCENE_FRAMES - FADE_FRAMES) fade = (SCENE_FRAMES - localFrame) / FADE_FRAMES;
fade = fade * fade * (3 - 2 * fade);  // smoothstep
// Apply: multiply all alpha/brightness by fade
```

### Per-Clip Architecture (Multi-Scene Videos)

For videos with multiple scenes, render each as a separate HTML file + MP4 clip, then stitch with ffmpeg. This enables re-rendering individual scenes without touching the rest.

**Directory structure:**
```
project/
├── capture-scene.js          # Shared: node capture-scene.js <html> <outdir> <frames>
├── render-all.sh             # Renders all + stitches
├── scenes/
│   ├── 00-intro.html         # Each scene is self-contained
│   ├── 01-particles.html
│   ├── 02-noise.html
│   └── 03-outro.html
└── clips/
    ├── 00-intro.mp4          # Each clip rendered independently
    ├── 01-particles.mp4
    ├── 02-noise.mp4
    ├── 03-outro.mp4
    └── concat.txt
```

**Stitch clips with ffmpeg concat:**
```bash
# concat.txt (order determines final sequence)
file '00-intro.mp4'
file '01-particles.mp4'
file '02-noise.mp4'
file '03-outro.mp4'

# Lossless stitch (all clips must have same codec/resolution/fps)
ffmpeg -f concat -safe 0 -i concat.txt -c copy final.mp4
```

**Re-render a single scene:**
```bash
node capture-scene.js scenes/01-particles.html clips/01-particles 150
ffmpeg -y -framerate 30 -i clips/01-particles/frame-%04d.png \
  -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p clips/01-particles.mp4
# Then re-stitch
ffmpeg -y -f concat -safe 0 -i clips/concat.txt -c copy final.mp4
```

**Re-order without re-rendering:** Just change the order in concat.txt and re-stitch. No frames need re-rendering.

**Each scene HTML must:**
- Call `noLoop()` in setup and set `window._p5Ready = true`
- Use `frameCount`-based timing (not `millis()`) for deterministic output
- Handle its own fade-in/fade-out envelope
- Be fully self-contained (no shared state between scenes)

### ffmpeg: Frames to GIF (Better Quality)

```bash
# Generate palette first for optimal colors
ffmpeg -i frame-%04d.png -vf "fps=15,palettegen=max_colors=256" palette.png

# Render GIF using palette
ffmpeg -i frame-%04d.png -i palette.png \
  -lavfi "fps=15 [x]; [x][1:v] paletteuse=dither=bayer:bayer_scale=3" \
  output.gif
```

## Headless Export (Puppeteer)

For automated, server-side, or CI rendering. Uses a headless Chrome browser to run the sketch.

### export-frames.js (Node.js Script)

See `scripts/export-frames.js` for the full implementation. Basic pattern:

```javascript
const puppeteer = require('puppeteer');

async function captureFrames(htmlPath, outputDir, options) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  await page.setViewport({
    width: options.width || 1920,
    height: options.height || 1080,
    deviceScaleFactor: 1
  });

  await page.goto(`file://${path.resolve(htmlPath)}`, {
    waitUntil: 'networkidle0'
  });

  // Wait for sketch to initialize
  await page.waitForSelector('canvas');
  await page.waitForTimeout(1000);

  for (let i = 0; i < options.frames; i++) {
    const canvas = await page.$('canvas');
    await canvas.screenshot({
      path: path.join(outputDir, `frame-${String(i).padStart(4, '0')}.png`)
    });

    // Advance one frame
    await page.evaluate(() => { redraw(); });
    await page.waitForTimeout(1000 / options.fps);
  }

  await browser.close();
}
```

### render.sh (Full Pipeline)

See `scripts/render.sh` for the complete render script. Pipeline:

```
1. Launch Puppeteer → open sketch HTML
2. Capture N frames as PNG sequence
3. Pipe to ffmpeg → encode H.264 MP4
4. Optional: add audio track
5. Clean up temp frames
```

## SVG Export

### Using p5.js-svg Library

```html
<script src="https://unpkg.com/p5.js-svg@1.5.1"></script>
```

```javascript
function setup() {
  createCanvas(1920, 1080, SVG);  // SVG renderer
  noLoop();
}

function draw() {
  // Only vector operations (no pixels, no blend modes)
  stroke(0);
  noFill();
  for (let i = 0; i < 100; i++) {
    let x = random(width);
    let y = random(height);
    ellipse(x, y, random(10, 50));
  }
  save('output.svg');
}
```

Limitations:
- No `loadPixels()`, `updatePixels()`, `filter()`, `blendMode()`
- No WebGL
- No pixel-level effects
- Great for: line art, geometric patterns, plots

### Hybrid: Raster Background + SVG Overlay

Render background effects to PNG, then SVG for crisp vector elements on top.

## Export Format Decision Guide

| Need | Format | Method |
|------|--------|--------|
| Single still image | PNG | `saveCanvas()` or `keyPressed()` |
| Print-quality still | PNG (high-res) | `pixelDensity(1)` + large canvas |
| Short animated loop | GIF | `saveGif()` |
| Long animation | MP4 | Frame sequence + ffmpeg |
| Social media video | MP4 | `scripts/render.sh` |
| Vector/print | SVG | p5.js-svg renderer |
| Batch variations | PNG sequence | Seed loop + `saveCanvas()` |
| Interactive deployment | HTML | Single self-contained file |
| Headless rendering | PNG/MP4 | Puppeteer + ffmpeg |

## Tiling for Ultra-High-Resolution

For resolutions too large for a single canvas (e.g., 10000x10000 for print):

```javascript
function renderTiled(totalW, totalH, tileSize) {
  let cols = ceil(totalW / tileSize);
  let rows = ceil(totalH / tileSize);

  for (let ty = 0; ty < rows; ty++) {
    for (let tx = 0; tx < cols; tx++) {
      let buffer = createGraphics(tileSize, tileSize);
      buffer.push();
      buffer.translate(-tx * tileSize, -ty * tileSize);
      renderScene(buffer, totalW, totalH);
      buffer.pop();
      buffer.save(`tile-${tx}-${ty}.png`);
      buffer.remove();  // free memory
    }
  }
  // Stitch with ImageMagick:
  // montage tile-*.png -tile 4x4 -geometry +0+0 final.png
}
```

## CCapture.js — Deterministic Video Capture

The built-in `saveFrames()` has limitations: small frame counts, memory issues, browser download blocking. CCapture.js solves all of these by hooking into the browser's timing functions to simulate constant time steps regardless of actual render speed.

```html
<script src="https://cdn.jsdelivr.net/npm/ccapture.js-npmfixed/build/CCapture.all.min.js"></script>
```

### Basic Setup

```javascript
let capturer;
let recording = false;

function setup() {
  createCanvas(1920, 1080);
  pixelDensity(1);

  capturer = new CCapture({
    format: 'webm',       // 'webm', 'gif', 'png', 'jpg'
    framerate: 30,
    quality: 99,           // 0-100 for webm/jpg
    // timeLimit: 10,      // auto-stop after N seconds
    // motionBlurFrames: 4 // supersampled motion blur
  });
}

function draw() {
  // ... render frame ...

  if (recording) {
    capturer.capture(document.querySelector('canvas'));
  }
}

function keyPressed() {
  if (key === 'c') {
    if (!recording) {
      capturer.start();
      recording = true;
      console.log('Recording started');
    } else {
      capturer.stop();
      capturer.save();  // triggers download
      recording = false;
      console.log('Recording saved');
    }
  }
}
```

### Format Comparison

| Format | Quality | Size | Browser Support |
|--------|---------|------|-----------------|
| **WebM** | High | Medium | Chrome only |
| **GIF** | 256 colors | Large | All (via gif.js worker) |
| **PNG sequence** | Lossless | Very large (TAR) | All |
| **JPEG sequence** | Lossy | Large (TAR) | All |

### Important: Timing Hook

CCapture.js overrides `Date.now()`, `setTimeout`, `requestAnimationFrame`, and `performance.now()`. This means:
- `millis()` returns simulated time (perfect for recording)
- `deltaTime` is constant (1000/framerate)
- Complex sketches that take 500ms per frame still record at smooth 30fps
- **Caveat**: Audio sync breaks (audio plays in real-time, not simulated time)

## Programmatic Export (canvas API)

For custom export workflows beyond `saveCanvas()`:

```javascript
// Canvas to Blob (for upload, processing)
document.querySelector('canvas').toBlob((blob) => {
  // Upload to server, process, etc.
  let url = URL.createObjectURL(blob);
  console.log('Blob URL:', url);
}, 'image/png');

// Canvas to Data URL (for inline embedding)
let dataUrl = document.querySelector('canvas').toDataURL('image/png');
// Use in <img src="..."> or send as base64
```

## SVG Export (p5.js-svg)

```html
<script src="https://unpkg.com/p5.js-svg@1.6.0"></script>
```

```javascript
function setup() {
  createCanvas(1920, 1080, SVG);  // SVG renderer
  noLoop();
}

function draw() {
  // Only vector operations work (no pixel ops, no blendMode)
  stroke(0);
  noFill();
  for (let i = 0; i < 100; i++) {
    ellipse(random(width), random(height), random(10, 50));
  }
  save('output.svg');
}
```

**Critical SVG caveats:**
- **Must call `clear()` in `draw()`** for animated sketches — SVG DOM accumulates child elements, causing memory bloat
- `blendMode()` is **not implemented** in SVG renderer
- `filter()`, `loadPixels()`, `updatePixels()` don't work
- Requires **p5.js 1.11.x** — not compatible with p5.js 2.x
- Perfect for: line art, geometric patterns, pen plotter output

## Platform Export

### fxhash Conventions

```javascript
// Replace p5's random with fxhash's deterministic PRNG
const rng = $fx.rand;

// Declare features for rarity/filtering
$fx.features({
  'Palette': paletteName,
  'Complexity': complexity > 0.7 ? 'High' : 'Low',
  'Has Particles': particleCount > 0
});

// Declare on-chain parameters
$fx.params([
  { id: 'density', name: 'Density', type: 'number',
    options: { min: 1, max: 100, step: 1 } },
  { id: 'palette', name: 'Palette', type: 'select',
    options: { options: ['Warm', 'Cool', 'Mono'] } },
  { id: 'accent', name: 'Accent Color', type: 'color' }
]);

// Read params
let density = $fx.getParam('density');

// Build: npx fxhash build → upload.zip
// Dev: npx fxhash dev → localhost:3300
```

### Art Blocks / Generic Platform

```javascript
// Platform provides a hash string
const hash = tokenData.hash;  // Art Blocks convention

// Build deterministic PRNG from hash
function prngFromHash(hash) {
  let seed = parseInt(hash.slice(0, 16), 16);
  // xoshiro128** or similar
  return function() { /* ... */ };
}

const rng = prngFromHash(hash);
```
