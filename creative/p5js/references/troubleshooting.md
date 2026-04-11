# Troubleshooting

## Performance

### Step Zero — Disable FES

The Friendly Error System (FES) adds massive overhead — up to 10x slowdown. Disable it in every production sketch:

```javascript
// BEFORE any p5 code
p5.disableFriendlyErrors = true;

// Or use p5.min.js instead of p5.js — FES is stripped from minified build
```

### Step One — pixelDensity(1)

Retina/HiDPI displays default to 2x or 3x density, multiplying pixel count by 4-9x:

```javascript
function setup() {
  pixelDensity(1);        // force 1:1 — always do this first
  createCanvas(1920, 1080);
}
```

### Use Math.* in Hot Loops

p5's `sin()`, `cos()`, `random()`, `min()`, `max()`, `abs()` are wrapper functions with overhead. In hot loops (thousands of iterations per frame), use native `Math.*`:

```javascript
// SLOW — p5 wrappers
for (let p of particles) {
  let a = sin(p.angle);
  let d = dist(p.x, p.y, mx, my);
}

// FAST — native Math
for (let p of particles) {
  let a = Math.sin(p.angle);
  let dx = p.x - mx, dy = p.y - my;
  let dSq = dx * dx + dy * dy;  // skip sqrt entirely
}
```

Use `magSq()` instead of `mag()` for distance comparisons — avoids expensive `sqrt()`.

### Diagnosis

Open Chrome DevTools > Performance tab > Record while sketch runs.

Common bottlenecks:
1. **FES enabled** — 10x overhead on every p5 function call
2. **pixelDensity > 1** — 4x pixel count, 4x slower
3. **Too many draw calls** — thousands of `ellipse()`, `rect()` per frame
4. **Large canvas + pixel operations** — `loadPixels()`/`updatePixels()` on 4K canvas
5. **Unoptimized particle systems** — checking all-vs-all distances (O(n^2))
6. **Memory leaks** — creating objects every frame without cleanup
7. **Shader compilation** — calling `createShader()` in `draw()` instead of `setup()`
8. **console.log() in draw()** — DOM write per frame, destroys performance
9. **DOM manipulation in draw()** — layout thrashing (400-500x slower than canvas ops)

### Solutions

**Reduce draw calls:**
```javascript
// BAD: 10000 individual circles
for (let p of particles) {
  ellipse(p.x, p.y, p.size);
}

// GOOD: single shape with vertices
beginShape(POINTS);
for (let p of particles) {
  vertex(p.x, p.y);
}
endShape();

// BEST: direct pixel manipulation
loadPixels();
for (let p of particles) {
  let idx = 4 * (floor(p.y) * width + floor(p.x));
  pixels[idx] = p.r;
  pixels[idx+1] = p.g;
  pixels[idx+2] = p.b;
  pixels[idx+3] = 255;
}
updatePixels();
```

**Spatial hashing for neighbor queries:**
```javascript
class SpatialHash {
  constructor(cellSize) {
    this.cellSize = cellSize;
    this.cells = new Map();
  }

  clear() { this.cells.clear(); }

  _key(x, y) {
    return `${floor(x / this.cellSize)},${floor(y / this.cellSize)}`;
  }

  insert(obj) {
    let key = this._key(obj.pos.x, obj.pos.y);
    if (!this.cells.has(key)) this.cells.set(key, []);
    this.cells.get(key).push(obj);
  }

  query(x, y, radius) {
    let results = [];
    let minCX = floor((x - radius) / this.cellSize);
    let maxCX = floor((x + radius) / this.cellSize);
    let minCY = floor((y - radius) / this.cellSize);
    let maxCY = floor((y + radius) / this.cellSize);

    for (let cx = minCX; cx <= maxCX; cx++) {
      for (let cy = minCY; cy <= maxCY; cy++) {
        let key = `${cx},${cy}`;
        let cell = this.cells.get(key);
        if (cell) {
          for (let obj of cell) {
            if (dist(x, y, obj.pos.x, obj.pos.y) <= radius) {
              results.push(obj);
            }
          }
        }
      }
    }
    return results;
  }
}
```

**Object pooling:**
```javascript
class ParticlePool {
  constructor(maxSize) {
    this.pool = [];
    this.active = [];
    for (let i = 0; i < maxSize; i++) {
      this.pool.push(new Particle(0, 0));
    }
  }

  spawn(x, y) {
    let p = this.pool.pop();
    if (p) {
      p.reset(x, y);
      this.active.push(p);
    }
  }

  update() {
    for (let i = this.active.length - 1; i >= 0; i--) {
      this.active[i].update();
      if (this.active[i].isDead()) {
        this.pool.push(this.active.splice(i, 1)[0]);
      }
    }
  }
}
```

**Throttle heavy operations:**
```javascript
// Only update flow field every N frames
if (frameCount % 5 === 0) {
  flowField.update(frameCount * 0.001);
}
```

### Frame Rate Targets

| Context | Target | Acceptable |
|---------|--------|------------|
| Interactive sketch | 60fps | 30fps |
| Ambient animation | 30fps | 20fps |
| Export/recording | 30fps render | Any (offline) |
| Mobile | 30fps | 20fps |

### Per-Pixel Rendering Budgets

Pixel-level operations (`loadPixels()` loops) are the most expensive common pattern. Budget depends on canvas size and computation per pixel.

| Canvas | Pixels | Simple noise (1 call) | fBM (4 octave) | Domain warp (3-layer fBM) |
|--------|--------|----------------------|----------------|--------------------------|
| 540x540 | 291K | ~5ms | ~20ms | ~80ms |
| 1080x1080 | 1.17M | ~20ms | ~80ms | ~300ms+ |
| 1920x1080 | 2.07M | ~35ms | ~140ms | ~500ms+ |
| 3840x2160 | 8.3M | ~140ms | ~560ms | WILL CRASH |

**Rules of thumb:**
- 1 `noise()` call per pixel at 1080x1080 = ~20ms/frame (OK at 30fps)
- 4-octave fBM per pixel at 1080x1080 = ~80ms/frame (borderline)
- Multi-layer domain warp at 1080x1080 = 300ms+ (too slow for real-time, fine for `noLoop()` export)
- **Headless Chrome is 2-5x slower** than desktop Chrome for pixel ops

**Solution: render at lower resolution, fill blocks:**
```javascript
let step = 3;  // render 1/9 of pixels, fill 3x3 blocks
loadPixels();
for (let y = 0; y < H; y += step) {
  for (let x = 0; x < W; x += step) {
    let v = expensiveNoise(x, y);
    for (let dy = 0; dy < step && y+dy < H; dy++)
      for (let dx = 0; dx < step && x+dx < W; dx++) {
        let i = 4 * ((y+dy) * W + (x+dx));
        pixels[i] = v; pixels[i+1] = v; pixels[i+2] = v; pixels[i+3] = 255;
      }
  }
}
updatePixels();
```

Step=2 gives 4x speedup. Step=3 gives 9x. Visible at 1080p but acceptable for video (motion hides it).

## Common Mistakes

### 1. Forgetting to reset blend mode

```javascript
blendMode(ADD);
image(glowLayer, 0, 0);
// WRONG: everything after this is ADD blended
blendMode(BLEND);  // ALWAYS reset
```

### 2. Creating objects in draw()

```javascript
// BAD: creates new font object every frame
function draw() {
  let f = loadFont('font.otf');  // NEVER load in draw()
}

// GOOD: load in preload, use in draw
let f;
function preload() { f = loadFont('font.otf'); }
```

### 3. Not using push()/pop() with transforms

```javascript
// BAD: transforms accumulate
translate(100, 0);
rotate(0.1);
ellipse(0, 0, 50);
// Everything after this is also translated and rotated

// GOOD: isolated transforms
push();
translate(100, 0);
rotate(0.1);
ellipse(0, 0, 50);
pop();
```

### 4. Integer coordinates for crisp lines

```javascript
// BLURRY: sub-pixel rendering
line(10.5, 20.3, 100.7, 80.2);

// CRISP: integer + 0.5 for 1px lines
line(10.5, 20.5, 100.5, 80.5);  // on pixel boundary
```

### 5. Pixel density confusion

```javascript
// WRONG: assuming pixel array matches canvas dimensions
loadPixels();
let idx = 4 * (y * width + x);  // wrong if pixelDensity > 1

// RIGHT: account for pixel density
let d = pixelDensity();
loadPixels();
let idx = 4 * ((y * d) * (width * d) + (x * d));

// SIMPLEST: set pixelDensity(1) at the start
```

### 6. Color mode confusion

```javascript
// In HSB mode, fill(255) is NOT white
colorMode(HSB, 360, 100, 100);
fill(255);  // This is hue=255, sat=100, bri=100 = vivid purple

// White in HSB:
fill(0, 0, 100);  // any hue, 0 saturation, 100 brightness

// Black in HSB:
fill(0, 0, 0);
```

### 7. WebGL origin is center

```javascript
// In WEBGL mode, (0,0) is CENTER, not top-left
function draw() {
  // This draws at the center, not the corner
  rect(0, 0, 100, 100);

  // For top-left behavior:
  translate(-width/2, -height/2);
  rect(0, 0, 100, 100);  // now at top-left
}
```

### 8. createGraphics cleanup

```javascript
// BAD: memory leak — buffer never freed
function draw() {
  let temp = createGraphics(width, height);  // new buffer every frame!
  // ...
}

// GOOD: create once, reuse
let temp;
function setup() {
  temp = createGraphics(width, height);
}
function draw() {
  temp.clear();
  // ... reuse temp
}

// If you must create/destroy:
temp.remove();  // explicitly free
```

### 9. noise() returns 0-1, not -1 to 1

```javascript
let n = noise(x);  // 0.0 to 1.0 (biased toward 0.5)

// For -1 to 1 range:
let n = noise(x) * 2 - 1;

// For a specific range:
let n = map(noise(x), 0, 1, -100, 100);
```

### 10. saveCanvas() in draw() saves every frame

```javascript
// BAD: saves a PNG every single frame
function draw() {
  // ... render ...
  saveCanvas('output', 'png');  // DON'T DO THIS
}

// GOOD: save once via keyboard
function keyPressed() {
  if (key === 's') saveCanvas('output', 'png');
}

// GOOD: save once after rendering static piece
function draw() {
  // ... render ...
  saveCanvas('output', 'png');
  noLoop();  // stop after saving
}
```

### 11. console.log() in draw()

```javascript
// BAD: writes to DOM console every frame — massive overhead
function draw() {
  console.log(particles.length);  // 60 DOM writes/second
}

// GOOD: log periodically or conditionally
function draw() {
  if (frameCount % 60 === 0) console.log('FPS:', frameRate().toFixed(1));
}
```

### 12. DOM manipulation in draw()

```javascript
// BAD: layout thrashing — 400-500x slower than canvas ops
function draw() {
  document.getElementById('counter').innerText = frameCount;
  let el = document.querySelector('.info');  // DOM query per frame
}

// GOOD: cache DOM refs, update infrequently
let counterEl;
function setup() { counterEl = document.getElementById('counter'); }
function draw() {
  if (frameCount % 30 === 0) counterEl.innerText = frameCount;
}
```

### 13. Not disabling FES in production

```javascript
// BAD: every p5 function call has error-checking overhead (up to 10x slower)
function setup() { createCanvas(800, 800); }

// GOOD: disable before any p5 code
p5.disableFriendlyErrors = true;
function setup() { createCanvas(800, 800); }

// ALSO GOOD: use p5.min.js (FES stripped from minified build)
```

## Browser Compatibility

### Safari Issues
- WebGL shader precision: always declare `precision mediump float;`
- `AudioContext` requires user gesture (`userStartAudio()`)
- Some `blendMode()` options behave differently

### Firefox Issues
- `textToPoints()` may return slightly different point counts
- WebGL extensions may differ from Chrome
- Color profile handling can shift colors

### Mobile Issues
- Touch events need `return false` to prevent scroll
- `devicePixelRatio` can be 2x or 3x — use `pixelDensity(1)` for performance
- Smaller canvas recommended (720p or less)
- Audio requires explicit user gesture to start

## CORS Issues

```javascript
// Loading images/fonts from external URLs requires CORS headers
// Local files need a server:
// python3 -m http.server 8080

// Or use a CORS proxy for external resources (not recommended for production)
```

## Memory Leaks

### Symptoms
- Framerate degrading over time
- Browser tab memory growing unbounded
- Page becomes unresponsive after minutes

### Common Causes

```javascript
// 1. Growing arrays
let history = [];
function draw() {
  history.push(someData);  // grows forever
}
// FIX: cap the array
if (history.length > 1000) history.shift();

// 2. Creating p5 objects in draw()
function draw() {
  let v = createVector(0, 0);  // allocation every frame
}
// FIX: reuse pre-allocated objects

// 3. Unreleased graphics buffers
let layers = [];
function reset() {
  for (let l of layers) l.remove();  // free old buffers
  layers = [];
}

// 4. Event listener accumulation
function setup() {
  // BAD: adds new listener every time setup runs
  window.addEventListener('resize', handler);
}
// FIX: use p5's built-in windowResized()
```

## Debugging Tips

### Console Logging

```javascript
// Log once (not every frame)
if (frameCount === 1) {
  console.log('Canvas:', width, 'x', height);
  console.log('Pixel density:', pixelDensity());
  console.log('Renderer:', drawingContext.constructor.name);
}

// Log periodically
if (frameCount % 60 === 0) {
  console.log('FPS:', frameRate().toFixed(1));
  console.log('Particles:', particles.length);
}
```

### Visual Debugging

```javascript
// Show frame rate
function draw() {
  // ... your sketch ...
  if (CONFIG.debug) {
    fill(255, 0, 0);
    noStroke();
    textSize(14);
    textAlign(LEFT, TOP);
    text('FPS: ' + frameRate().toFixed(1), 10, 10);
    text('Particles: ' + particles.length, 10, 28);
    text('Frame: ' + frameCount, 10, 46);
  }
}

// Toggle debug with 'd' key
function keyPressed() {
  if (key === 'd') CONFIG.debug = !CONFIG.debug;
}
```

### Isolating Issues

```javascript
// Comment out layers to find the slow one
function draw() {
  renderBackground();      // comment out to test
  // renderParticles();    // this might be slow
  // renderPostEffects();  // or this
}
```
