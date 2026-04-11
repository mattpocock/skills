# Visual Effects

## Noise

### Perlin Noise Basics

```javascript
noiseSeed(42);
noiseDetail(4, 0.5);  // octaves, falloff

// 1D noise — smooth undulation
let y = noise(x * 0.01);  // returns 0.0 to 1.0

// 2D noise — terrain/texture
let v = noise(x * 0.005, y * 0.005);

// 3D noise — animated 2D field (z = time)
let v = noise(x * 0.005, y * 0.005, frameCount * 0.005);
```

The scale factor (0.005 etc.) is critical:
- `0.001` — very smooth, large features
- `0.005` — smooth, medium features
- `0.01` — standard generative art scale
- `0.05` — detailed, small features
- `0.1` — near-random, grainy

### Fractal Brownian Motion (fBM)

Layered noise octaves for natural-looking texture. Each octave adds detail at smaller scale.

```javascript
function fbm(x, y, octaves = 6, lacunarity = 2.0, gain = 0.5) {
  let value = 0;
  let amplitude = 1.0;
  let frequency = 1.0;
  let maxValue = 0;
  for (let i = 0; i < octaves; i++) {
    value += noise(x * frequency, y * frequency) * amplitude;
    maxValue += amplitude;
    amplitude *= gain;
    frequency *= lacunarity;
  }
  return value / maxValue;
}
```

### Domain Warping

Feed noise output back as input coordinates for flowing organic distortion.

```javascript
function domainWarp(x, y, scale, strength, time) {
  // First warp pass
  let qx = fbm(x + 0.0, y + 0.0);
  let qy = fbm(x + 5.2, y + 1.3);

  // Second warp pass (feed back)
  let rx = fbm(x + strength * qx + 1.7, y + strength * qy + 9.2, 4, 2, 0.5);
  let ry = fbm(x + strength * qx + 8.3, y + strength * qy + 2.8, 4, 2, 0.5);

  return fbm(x + strength * rx + time, y + strength * ry + time);
}
```

### Curl Noise

Divergence-free noise field. Particles following curl noise never converge or diverge — they flow in smooth, swirling patterns.

```javascript
function curlNoise(x, y, scale, time) {
  let eps = 0.001;
  // Partial derivatives via finite differences
  let dndx = (noise(x * scale + eps, y * scale, time) -
              noise(x * scale - eps, y * scale, time)) / (2 * eps);
  let dndy = (noise(x * scale, y * scale + eps, time) -
              noise(x * scale, y * scale - eps, time)) / (2 * eps);
  // Curl = perpendicular to gradient
  return createVector(dndy, -dndx);
}
```

## Flow Fields

A grid of vectors that steer particles. The foundational generative art technique.

```javascript
class FlowField {
  constructor(resolution, noiseScale) {
    this.resolution = resolution;
    this.cols = ceil(width / resolution);
    this.rows = ceil(height / resolution);
    this.field = new Array(this.cols * this.rows);
    this.noiseScale = noiseScale;
  }

  update(time) {
    for (let i = 0; i < this.cols; i++) {
      for (let j = 0; j < this.rows; j++) {
        let angle = noise(i * this.noiseScale, j * this.noiseScale, time) * TWO_PI * 2;
        this.field[i + j * this.cols] = p5.Vector.fromAngle(angle);
      }
    }
  }

  lookup(x, y) {
    let col = constrain(floor(x / this.resolution), 0, this.cols - 1);
    let row = constrain(floor(y / this.resolution), 0, this.rows - 1);
    return this.field[col + row * this.cols].copy();
  }
}
```

### Flow Field Particle

```javascript
class FlowParticle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.prev = this.pos.copy();
    this.maxSpeed = 2;
    this.life = 1.0;
  }

  follow(field) {
    let force = field.lookup(this.pos.x, this.pos.y);
    force.mult(0.5);  // force magnitude
    this.acc.add(force);
  }

  update() {
    this.prev = this.pos.copy();
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.life -= 0.001;
  }

  edges() {
    if (this.pos.x > width) this.pos.x = 0;
    if (this.pos.x < 0) this.pos.x = width;
    if (this.pos.y > height) this.pos.y = 0;
    if (this.pos.y < 0) this.pos.y = height;
    this.prev = this.pos.copy();  // prevent wrap line
  }

  display(buffer) {
    buffer.stroke(255, this.life * 30);
    buffer.strokeWeight(0.5);
    buffer.line(this.prev.x, this.prev.y, this.pos.x, this.pos.y);
  }
}
```

## Particle Systems

### Basic Physics Particle

```javascript
class Particle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(1, 3));
    this.acc = createVector(0, 0);
    this.life = 255;
    this.decay = random(1, 5);
    this.size = random(3, 8);
  }

  applyForce(f) { this.acc.add(f); }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.life -= this.decay;
  }

  display() {
    noStroke();
    fill(255, this.life);
    ellipse(this.pos.x, this.pos.y, this.size);
  }

  isDead() { return this.life <= 0; }
}
```

### Attractor-Driven Particles

```javascript
class Attractor {
  constructor(x, y, strength) {
    this.pos = createVector(x, y);
    this.strength = strength;
  }

  attract(particle) {
    let force = p5.Vector.sub(this.pos, particle.pos);
    let d = constrain(force.mag(), 5, 200);
    force.normalize();
    force.mult(this.strength / (d * d));
    particle.applyForce(force);
  }
}
```

### Boid Flocking

```javascript
class Boid {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(2, 4));
    this.acc = createVector(0, 0);
    this.maxForce = 0.2;
    this.maxSpeed = 4;
    this.perceptionRadius = 50;
  }

  flock(boids) {
    let alignment = createVector(0, 0);
    let cohesion = createVector(0, 0);
    let separation = createVector(0, 0);
    let total = 0;

    for (let other of boids) {
      let d = this.pos.dist(other.pos);
      if (other !== this && d < this.perceptionRadius) {
        alignment.add(other.vel);
        cohesion.add(other.pos);
        let diff = p5.Vector.sub(this.pos, other.pos);
        diff.div(d * d);
        separation.add(diff);
        total++;
      }
    }
    if (total > 0) {
      alignment.div(total).setMag(this.maxSpeed).sub(this.vel).limit(this.maxForce);
      cohesion.div(total).sub(this.pos).setMag(this.maxSpeed).sub(this.vel).limit(this.maxForce);
      separation.div(total).setMag(this.maxSpeed).sub(this.vel).limit(this.maxForce);
    }

    this.acc.add(alignment.mult(1.0));
    this.acc.add(cohesion.mult(1.0));
    this.acc.add(separation.mult(1.5));
  }

  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }
}
```

## Pixel Manipulation

### Reading and Writing Pixels

```javascript
loadPixels();
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    let idx = 4 * (y * width + x);
    let r = pixels[idx];
    let g = pixels[idx + 1];
    let b = pixels[idx + 2];
    let a = pixels[idx + 3];

    // Modify
    pixels[idx] = 255 - r;       // invert red
    pixels[idx + 1] = 255 - g;   // invert green
    pixels[idx + 2] = 255 - b;   // invert blue
  }
}
updatePixels();
```

### Pixel-Level Noise Texture

```javascript
loadPixels();
for (let i = 0; i < pixels.length; i += 4) {
  let x = (i / 4) % width;
  let y = floor((i / 4) / width);
  let n = noise(x * 0.01, y * 0.01, frameCount * 0.02);
  let c = n * 255;
  pixels[i] = c;
  pixels[i + 1] = c;
  pixels[i + 2] = c;
  pixels[i + 3] = 255;
}
updatePixels();
```

### Built-in Filters

```javascript
filter(BLUR, 3);        // Gaussian blur (radius)
filter(THRESHOLD, 0.5); // Black/white threshold
filter(INVERT);          // Color inversion
filter(POSTERIZE, 4);    // Reduce color levels
filter(GRAY);            // Desaturate
filter(ERODE);           // Thin bright areas
filter(DILATE);          // Expand bright areas
filter(OPAQUE);          // Remove transparency
```

## Texture Generation

### Stippling / Pointillism

```javascript
function stipple(buffer, density, minSize, maxSize) {
  buffer.loadPixels();
  for (let i = 0; i < density; i++) {
    let x = floor(random(width));
    let y = floor(random(height));
    let idx = 4 * (y * width + x);
    let brightness = (buffer.pixels[idx] + buffer.pixels[idx+1] + buffer.pixels[idx+2]) / 3;
    let size = map(brightness, 0, 255, maxSize, minSize);
    if (random() < map(brightness, 0, 255, 0.8, 0.1)) {
      noStroke();
      fill(buffer.pixels[idx], buffer.pixels[idx+1], buffer.pixels[idx+2]);
      ellipse(x, y, size);
    }
  }
}
```

### Halftone

```javascript
function halftone(sourceBuffer, dotSpacing, maxDotSize) {
  sourceBuffer.loadPixels();
  background(255);
  fill(0);
  noStroke();
  for (let y = 0; y < height; y += dotSpacing) {
    for (let x = 0; x < width; x += dotSpacing) {
      let idx = 4 * (y * width + x);
      let brightness = (sourceBuffer.pixels[idx] + sourceBuffer.pixels[idx+1] + sourceBuffer.pixels[idx+2]) / 3;
      let dotSize = map(brightness, 0, 255, maxDotSize, 0);
      ellipse(x + dotSpacing/2, y + dotSpacing/2, dotSize);
    }
  }
}
```

### Cross-Hatching

```javascript
function crossHatch(x, y, w, h, value, spacing) {
  // value: 0 (dark) to 1 (light)
  let numLayers = floor(map(value, 0, 1, 4, 0));
  let angles = [PI/4, -PI/4, 0, PI/2];

  for (let layer = 0; layer < numLayers; layer++) {
    push();
    translate(x + w/2, y + h/2);
    rotate(angles[layer]);
    let s = spacing + layer * 2;
    for (let i = -max(w, h); i < max(w, h); i += s) {
      line(i, -max(w, h), i, max(w, h));
    }
    pop();
  }
}
```

## Feedback Loops

### Frame Feedback (Echo/Trail)

```javascript
let feedback;

function setup() {
  createCanvas(800, 800);
  feedback = createGraphics(width, height);
}

function draw() {
  // Copy current feedback, slightly zoomed and rotated
  let temp = feedback.get();

  feedback.push();
  feedback.translate(width/2, height/2);
  feedback.scale(1.005);  // slow zoom
  feedback.rotate(0.002); // slow rotation
  feedback.translate(-width/2, -height/2);
  feedback.tint(255, 245);  // slight fade
  feedback.image(temp, 0, 0);
  feedback.pop();

  // Draw new content to feedback
  feedback.noStroke();
  feedback.fill(255);
  feedback.ellipse(mouseX, mouseY, 20);

  // Show
  image(feedback, 0, 0);
}
```

### Bloom / Glow (Post-Processing)

Downsample the scene to a small buffer, blur it, overlay additively. Creates soft glow around bright areas. This is the standard generative art bloom technique.

```javascript
let scene, bloomBuf;

function setup() {
  createCanvas(1080, 1080);
  scene = createGraphics(width, height);
  bloomBuf = createGraphics(width, height);
}

function draw() {
  // 1. Render scene to offscreen buffer
  scene.background(0);
  scene.fill(255, 200, 100);
  scene.noStroke();
  // ... draw bright elements to scene ...

  // 2. Build bloom: downsample → blur → upscale
  bloomBuf.clear();
  bloomBuf.image(scene, 0, 0, width / 4, height / 4);  // 4x downsample
  bloomBuf.filter(BLUR, 6);  // blur the small version

  // 3. Composite: scene + additive bloom
  background(0);
  image(scene, 0, 0);           // base layer
  blendMode(ADD);               // additive = glow
  tint(255, 80);                // control bloom intensity (0-255)
  image(bloomBuf, 0, 0, width, height);  // upscale back to full size
  noTint();
  blendMode(BLEND);             // ALWAYS reset blend mode
}
```

**Tuning:**
- Downsample ratio (1/4 is standard, 1/8 for softer, 1/2 for tighter)
- Blur radius (4-8 typical, higher = wider glow)
- Tint alpha (40-120, controls glow intensity)
- Update bloom every N frames to save perf: `if (frameCount % 2 === 0) { ... }`

**Common mistake:** Forgetting `blendMode(BLEND)` after the ADD pass — everything drawn after will be additive.

### Trail Buffer Brightness

Trail accumulation via `createGraphics()` + semi-transparent fade rect is the standard technique for particle trails, but **trails are always dimmer than you expect**. The fade rect's alpha compounds multiplicatively every frame.

```javascript
// The fade rect alpha controls trail length AND brightness:
trailBuf.fill(0, 0, 0, alpha);
trailBuf.rect(0, 0, width, height);

// alpha=5  → very long trails, very dim (content fades to 50% in ~35 frames)
// alpha=10 → long trails, dim
// alpha=20 → medium trails, visible
// alpha=40 → short trails, bright
// alpha=80 → very short trails, crisp
```

**The trap:** You set alpha=5 for long trails, but particle strokes at alpha=30 are invisible because they fade before accumulating enough density. Either:
- **Boost stroke alpha** to 80-150 (not the intuitive 20-40)
- **Reduce fade alpha** but accept shorter trails
- **Use additive blending** for the strokes: bright particles accumulate, dim ones stay dark

```javascript
// WRONG: low fade + low stroke = invisible
trailBuf.fill(0, 0, 0, 5);     // long trails
trailBuf.rect(0, 0, W, H);
trailBuf.stroke(255, 30);       // too dim to ever accumulate
trailBuf.line(px, py, x, y);

// RIGHT: low fade + high stroke = visible long trails
trailBuf.fill(0, 0, 0, 5);
trailBuf.rect(0, 0, W, H);
trailBuf.stroke(255, 100);      // bright enough to persist through fade
trailBuf.line(px, py, x, y);
```

### Reaction-Diffusion (Gray-Scott)

```javascript
class ReactionDiffusion {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.a = new Float32Array(w * h).fill(1);
    this.b = new Float32Array(w * h).fill(0);
    this.nextA = new Float32Array(w * h);
    this.nextB = new Float32Array(w * h);
    this.dA = 1.0;
    this.dB = 0.5;
    this.feed = 0.055;
    this.kill = 0.062;
  }

  seed(cx, cy, r) {
    for (let y = cy - r; y < cy + r; y++) {
      for (let x = cx - r; x < cx + r; x++) {
        if (dist(x, y, cx, cy) < r) {
          let idx = y * this.w + x;
          this.b[idx] = 1;
        }
      }
    }
  }

  step() {
    for (let y = 1; y < this.h - 1; y++) {
      for (let x = 1; x < this.w - 1; x++) {
        let idx = y * this.w + x;
        let a = this.a[idx], b = this.b[idx];
        let lapA = this.laplacian(this.a, x, y);
        let lapB = this.laplacian(this.b, x, y);
        let abb = a * b * b;
        this.nextA[idx] = constrain(a + this.dA * lapA - abb + this.feed * (1 - a), 0, 1);
        this.nextB[idx] = constrain(b + this.dB * lapB + abb - (this.kill + this.feed) * b, 0, 1);
      }
    }
    [this.a, this.nextA] = [this.nextA, this.a];
    [this.b, this.nextB] = [this.nextB, this.b];
  }

  laplacian(arr, x, y) {
    let w = this.w;
    return arr[(y-1)*w+x] + arr[(y+1)*w+x] + arr[y*w+(x-1)] + arr[y*w+(x+1)]
           - 4 * arr[y*w+x];
  }
}
```

## Pixel Sorting

```javascript
function pixelSort(buffer, threshold, direction = 'horizontal') {
  buffer.loadPixels();
  let px = buffer.pixels;

  if (direction === 'horizontal') {
    for (let y = 0; y < height; y++) {
      let spans = findSpans(px, y, width, threshold, true);
      for (let span of spans) {
        sortSpan(px, span.start, span.end, y, true);
      }
    }
  }
  buffer.updatePixels();
}

function findSpans(px, row, w, threshold, horizontal) {
  let spans = [];
  let start = -1;
  for (let i = 0; i < w; i++) {
    let idx = horizontal ? 4 * (row * w + i) : 4 * (i * w + row);
    let brightness = (px[idx] + px[idx+1] + px[idx+2]) / 3;
    if (brightness > threshold && start === -1) {
      start = i;
    } else if (brightness <= threshold && start !== -1) {
      spans.push({ start, end: i });
      start = -1;
    }
  }
  if (start !== -1) spans.push({ start, end: w });
  return spans;
}
```

## Advanced Generative Techniques

### L-Systems (Lindenmayer Systems)

Grammar-based recursive growth for trees, plants, fractals.

```javascript
class LSystem {
  constructor(axiom, rules) {
    this.axiom = axiom;
    this.rules = rules;  // { 'F': 'F[+F]F[-F]F' }
    this.sentence = axiom;
  }

  generate(iterations) {
    for (let i = 0; i < iterations; i++) {
      let next = '';
      for (let ch of this.sentence) {
        next += this.rules[ch] || ch;
      }
      this.sentence = next;
    }
  }

  draw(len, angle) {
    for (let ch of this.sentence) {
      switch (ch) {
        case 'F': line(0, 0, 0, -len); translate(0, -len); break;
        case '+': rotate(angle); break;
        case '-': rotate(-angle); break;
        case '[': push(); break;
        case ']': pop(); break;
      }
    }
  }
}

// Usage: fractal plant
let lsys = new LSystem('X', {
  'X': 'F+[[X]-X]-F[-FX]+X',
  'F': 'FF'
});
lsys.generate(5);
translate(width/2, height);
lsys.draw(4, radians(25));
```

### Circle Packing

Fill a space with non-overlapping circles of varying size.

```javascript
class PackedCircle {
  constructor(x, y, r) {
    this.x = x; this.y = y; this.r = r;
    this.growing = true;
  }

  grow() { if (this.growing) this.r += 0.5; }

  overlaps(other) {
    let d = dist(this.x, this.y, other.x, other.y);
    return d < this.r + other.r + 2;  // +2 gap
  }

  atEdge() {
    return this.x - this.r < 0 || this.x + this.r > width ||
           this.y - this.r < 0 || this.y + this.r > height;
  }
}

let circles = [];

function packStep() {
  // Try to place new circle
  for (let attempts = 0; attempts < 100; attempts++) {
    let x = random(width), y = random(height);
    let valid = true;
    for (let c of circles) {
      if (dist(x, y, c.x, c.y) < c.r + 2) { valid = false; break; }
    }
    if (valid) { circles.push(new PackedCircle(x, y, 1)); break; }
  }

  // Grow existing circles
  for (let c of circles) {
    if (!c.growing) continue;
    c.grow();
    if (c.atEdge()) { c.growing = false; continue; }
    for (let other of circles) {
      if (c !== other && c.overlaps(other)) { c.growing = false; break; }
    }
  }
}
```

### Voronoi Diagram (Fortune's Algorithm Approximation)

```javascript
// Simple brute-force Voronoi (for small point counts)
function drawVoronoi(points, colors) {
  loadPixels();
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let minDist = Infinity;
      let closest = 0;
      for (let i = 0; i < points.length; i++) {
        let d = (x - points[i].x) ** 2 + (y - points[i].y) ** 2;  // magSq
        if (d < minDist) { minDist = d; closest = i; }
      }
      let idx = 4 * (y * width + x);
      let c = colors[closest % colors.length];
      pixels[idx] = red(c);
      pixels[idx+1] = green(c);
      pixels[idx+2] = blue(c);
      pixels[idx+3] = 255;
    }
  }
  updatePixels();
}
```

### Fractal Trees

```javascript
function fractalTree(x, y, len, angle, depth, branchAngle) {
  if (depth <= 0 || len < 2) return;

  let x2 = x + Math.cos(angle) * len;
  let y2 = y + Math.sin(angle) * len;

  strokeWeight(map(depth, 0, 10, 0.5, 4));
  line(x, y, x2, y2);

  let shrink = 0.67 + noise(x * 0.01, y * 0.01) * 0.15;
  fractalTree(x2, y2, len * shrink, angle - branchAngle, depth - 1, branchAngle);
  fractalTree(x2, y2, len * shrink, angle + branchAngle, depth - 1, branchAngle);
}

// Usage
fractalTree(width/2, height, 120, -HALF_PI, 10, PI/6);
```

### Strange Attractors

```javascript
// Clifford Attractor
function cliffordAttractor(a, b, c, d, iterations) {
  let x = 0, y = 0;
  beginShape(POINTS);
  for (let i = 0; i < iterations; i++) {
    let nx = Math.sin(a * y) + c * Math.cos(a * x);
    let ny = Math.sin(b * x) + d * Math.cos(b * y);
    x = nx; y = ny;
    let px = map(x, -3, 3, 0, width);
    let py = map(y, -3, 3, 0, height);
    vertex(px, py);
  }
  endShape();
}

// De Jong Attractor
function deJongAttractor(a, b, c, d, iterations) {
  let x = 0, y = 0;
  beginShape(POINTS);
  for (let i = 0; i < iterations; i++) {
    let nx = Math.sin(a * y) - Math.cos(b * x);
    let ny = Math.sin(c * x) - Math.cos(d * y);
    x = nx; y = ny;
    let px = map(x, -2.5, 2.5, 0, width);
    let py = map(y, -2.5, 2.5, 0, height);
    vertex(px, py);
  }
  endShape();
}
```

### Poisson Disk Sampling

Even distribution that looks natural — better than pure random for placing elements.

```javascript
function poissonDiskSampling(r, k = 30) {
  let cellSize = r / Math.sqrt(2);
  let cols = Math.ceil(width / cellSize);
  let rows = Math.ceil(height / cellSize);
  let grid = new Array(cols * rows).fill(-1);
  let points = [];
  let active = [];

  function gridIndex(x, y) {
    return Math.floor(x / cellSize) + Math.floor(y / cellSize) * cols;
  }

  // Seed
  let p0 = createVector(random(width), random(height));
  points.push(p0);
  active.push(p0);
  grid[gridIndex(p0.x, p0.y)] = 0;

  while (active.length > 0) {
    let idx = Math.floor(Math.random() * active.length);
    let pos = active[idx];
    let found = false;

    for (let n = 0; n < k; n++) {
      let angle = Math.random() * TWO_PI;
      let mag = r + Math.random() * r;
      let sample = createVector(pos.x + Math.cos(angle) * mag, pos.y + Math.sin(angle) * mag);

      if (sample.x < 0 || sample.x >= width || sample.y < 0 || sample.y >= height) continue;

      let col = Math.floor(sample.x / cellSize);
      let row = Math.floor(sample.y / cellSize);
      let ok = true;

      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          let nc = col + dx, nr = row + dy;
          if (nc >= 0 && nc < cols && nr >= 0 && nr < rows) {
            let gi = nc + nr * cols;
            if (grid[gi] !== -1 && points[grid[gi]].dist(sample) < r) { ok = false; }
          }
        }
      }

      if (ok) {
        points.push(sample);
        active.push(sample);
        grid[gridIndex(sample.x, sample.y)] = points.length - 1;
        found = true;
        break;
      }
    }
    if (!found) active.splice(idx, 1);
  }
  return points;
}
```

## Addon Libraries

### p5.brush — Natural Media

Hand-drawn, organic aesthetics. Watercolor, charcoal, pen, marker. Requires **p5.js 2.x + WEBGL**.

```html
<script src="https://cdn.jsdelivr.net/npm/p5.brush@latest/dist/p5.brush.js"></script>
```

```javascript
function setup() {
  createCanvas(1200, 1200, WEBGL);
  brush.scaleBrushes(3);  // essential for proper sizing
  translate(-width/2, -height/2);  // WEBGL origin is center
  brush.pick('2B');  // pencil brush
  brush.stroke(50, 50, 50);
  brush.strokeWeight(2);
  brush.line(100, 100, 500, 500);
  brush.pick('watercolor');
  brush.fill('#4a90d9', 150);
  brush.circle(400, 400, 200);
}
```

Built-in brushes: `2B`, `HB`, `2H`, `cpencil`, `pen`, `rotring`, `spray`, `marker`, `charcoal`, `hatch_brush`.
Built-in vector fields: `hand`, `curved`, `zigzag`, `waves`, `seabed`, `spiral`, `columns`.

### p5.grain — Film Grain & Texture

```html
<script src="https://cdn.jsdelivr.net/npm/p5.grain@0.7.0/p5.grain.min.js"></script>
```

```javascript
function draw() {
  // ... render scene ...
  applyMonochromaticGrain(42);   // uniform grain
  // or: applyChromaticGrain(42); // per-channel randomization
}
```

### CCapture.js — Deterministic Video Capture

Records canvas at fixed framerate regardless of actual render speed. Essential for complex generative art.

```html
<script src="https://cdn.jsdelivr.net/npm/ccapture.js-npmfixed/build/CCapture.all.min.js"></script>
```

```javascript
let capturer;

function setup() {
  createCanvas(1920, 1080);
  capturer = new CCapture({
    format: 'webm',
    framerate: 60,
    quality: 99,
    // timeLimit: 10,    // auto-stop after N seconds
    // motionBlurFrames: 4  // supersampled motion blur
  });
}

function startRecording() {
  capturer.start();
}

function draw() {
  // ... render frame ...
  if (capturer) capturer.capture(document.querySelector('canvas'));
}

function stopRecording() {
  capturer.stop();
  capturer.save();  // triggers download
}
```
