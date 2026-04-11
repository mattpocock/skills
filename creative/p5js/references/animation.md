# Animation

## Frame-Based Animation

### The Draw Loop

```javascript
function draw() {
  // Called ~60 times/sec by default
  // frameCount — integer, starts at 1
  // deltaTime — ms since last frame (use for framerate-independent motion)
  // millis() — ms since sketch start
}
```

### Time-Based vs Frame-Based

```javascript
// Frame-based (speed varies with framerate)
x += speed;

// Time-based (consistent speed regardless of framerate)
x += speed * (deltaTime / 16.67);  // normalized to 60fps
```

### Normalized Time

```javascript
// Progress from 0 to 1 over N seconds
let duration = 5000;  // 5 seconds in ms
let t = constrain(millis() / duration, 0, 1);

// Looping progress (0 → 1 → 0 → 1...)
let period = 3000;  // 3 second loop
let t = (millis() % period) / period;

// Ping-pong (0 → 1 → 0 → 1...)
let raw = (millis() % (period * 2)) / period;
let t = raw <= 1 ? raw : 2 - raw;
```

## Easing Functions

### Built-in Lerp

```javascript
// Linear interpolation — smooth but mechanical
let x = lerp(startX, endX, t);

// Map for non-0-1 ranges
let y = map(t, 0, 1, startY, endY);
```

### Common Easing Curves

```javascript
// Ease in (slow start)
function easeInQuad(t) { return t * t; }
function easeInCubic(t) { return t * t * t; }
function easeInExpo(t) { return t === 0 ? 0 : pow(2, 10 * (t - 1)); }

// Ease out (slow end)
function easeOutQuad(t) { return 1 - (1 - t) * (1 - t); }
function easeOutCubic(t) { return 1 - pow(1 - t, 3); }
function easeOutExpo(t) { return t === 1 ? 1 : 1 - pow(2, -10 * t); }

// Ease in-out (slow both ends)
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - pow(-2 * t + 2, 3) / 2;
}
function easeInOutQuint(t) {
  return t < 0.5 ? 16 * t * t * t * t * t : 1 - pow(-2 * t + 2, 5) / 2;
}

// Elastic (spring overshoot)
function easeOutElastic(t) {
  if (t === 0 || t === 1) return t;
  return pow(2, -10 * t) * sin((t * 10 - 0.75) * (2 * PI / 3)) + 1;
}

// Bounce
function easeOutBounce(t) {
  if (t < 1/2.75) return 7.5625 * t * t;
  else if (t < 2/2.75) { t -= 1.5/2.75; return 7.5625 * t * t + 0.75; }
  else if (t < 2.5/2.75) { t -= 2.25/2.75; return 7.5625 * t * t + 0.9375; }
  else { t -= 2.625/2.75; return 7.5625 * t * t + 0.984375; }
}

// Smooth step (Hermite interpolation — great default)
function smoothstep(t) { return t * t * (3 - 2 * t); }

// Smoother step (Ken Perlin)
function smootherstep(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
```

### Applying Easing

```javascript
// Animate from startVal to endVal over duration ms
function easedValue(startVal, endVal, startTime, duration, easeFn) {
  let t = constrain((millis() - startTime) / duration, 0, 1);
  return lerp(startVal, endVal, easeFn(t));
}

// Usage
let x = easedValue(100, 700, animStartTime, 2000, easeOutCubic);
```

## Spring Physics

More natural than easing — responds to force, overshoots, settles.

```javascript
class Spring {
  constructor(value, target, stiffness = 0.1, damping = 0.7) {
    this.value = value;
    this.target = target;
    this.velocity = 0;
    this.stiffness = stiffness;
    this.damping = damping;
  }

  update() {
    let force = (this.target - this.value) * this.stiffness;
    this.velocity += force;
    this.velocity *= this.damping;
    this.value += this.velocity;
    return this.value;
  }

  setTarget(t) { this.target = t; }
  isSettled(threshold = 0.01) {
    return abs(this.velocity) < threshold && abs(this.value - this.target) < threshold;
  }
}

// Usage
let springX = new Spring(0, 0, 0.08, 0.85);
function draw() {
  springX.setTarget(mouseX);
  let x = springX.update();
  ellipse(x, height/2, 50);
}
```

### 2D Spring

```javascript
class Spring2D {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.target = createVector(x, y);
    this.vel = createVector(0, 0);
    this.stiffness = 0.08;
    this.damping = 0.85;
  }

  update() {
    let force = p5.Vector.sub(this.target, this.pos).mult(this.stiffness);
    this.vel.add(force).mult(this.damping);
    this.pos.add(this.vel);
    return this.pos;
  }
}
```

## State Machines

For complex multi-phase animations.

```javascript
const STATES = { IDLE: 0, ENTER: 1, ACTIVE: 2, EXIT: 3 };
let state = STATES.IDLE;
let stateStart = 0;

function setState(newState) {
  state = newState;
  stateStart = millis();
}

function stateTime() {
  return millis() - stateStart;
}

function draw() {
  switch (state) {
    case STATES.IDLE:
      // waiting...
      break;
    case STATES.ENTER:
      let t = constrain(stateTime() / 1000, 0, 1);
      let alpha = easeOutCubic(t) * 255;
      // fade in...
      if (t >= 1) setState(STATES.ACTIVE);
      break;
    case STATES.ACTIVE:
      // main animation...
      break;
    case STATES.EXIT:
      let t2 = constrain(stateTime() / 500, 0, 1);
      // fade out...
      if (t2 >= 1) setState(STATES.IDLE);
      break;
  }
}
```

## Timeline Sequencing

For timed multi-scene animations (motion graphics, title sequences).

```javascript
class Timeline {
  constructor() {
    this.events = [];
  }

  at(timeMs, duration, fn) {
    this.events.push({ start: timeMs, end: timeMs + duration, fn });
    return this;
  }

  update() {
    let now = millis();
    for (let e of this.events) {
      if (now >= e.start && now < e.end) {
        let t = (now - e.start) / (e.end - e.start);
        e.fn(t);
      }
    }
  }
}

// Usage
let timeline = new Timeline();
timeline
  .at(0, 2000, (t) => {
    // Scene 1: title fade in (0-2s)
    let alpha = easeOutCubic(t) * 255;
    fill(255, alpha);
    textSize(48);
    text("Hello", width/2, height/2);
  })
  .at(2000, 1000, (t) => {
    // Scene 2: title fade out (2-3s)
    let alpha = (1 - easeInCubic(t)) * 255;
    fill(255, alpha);
    textSize(48);
    text("Hello", width/2, height/2);
  })
  .at(3000, 5000, (t) => {
    // Scene 3: main content (3-8s)
    renderMainContent(t);
  });

function draw() {
  background(0);
  timeline.update();
}
```

## Noise-Driven Motion

More organic than deterministic animation.

```javascript
// Smooth wandering position
let x = map(noise(frameCount * 0.005, 0), 0, 1, 0, width);
let y = map(noise(0, frameCount * 0.005), 0, 1, 0, height);

// Noise-driven rotation
let angle = noise(frameCount * 0.01) * TWO_PI;

// Noise-driven scale (breathing effect)
let s = map(noise(frameCount * 0.02), 0, 1, 0.8, 1.2);

// Noise-driven color shift
let hue = map(noise(frameCount * 0.003), 0, 1, 0, 360);
```

## Transition Patterns

### Fade In/Out

```javascript
function fadeIn(t) { return constrain(t, 0, 1); }
function fadeOut(t) { return constrain(1 - t, 0, 1); }
```

### Slide

```javascript
function slideIn(t, direction = 'left') {
  let et = easeOutCubic(t);
  switch (direction) {
    case 'left': return lerp(-width, 0, et);
    case 'right': return lerp(width, 0, et);
    case 'up': return lerp(-height, 0, et);
    case 'down': return lerp(height, 0, et);
  }
}
```

### Scale Reveal

```javascript
function scaleReveal(t) {
  let et = easeOutElastic(constrain(t, 0, 1));
  push();
  translate(width/2, height/2);
  scale(et);
  translate(-width/2, -height/2);
  // draw content...
  pop();
}
```

### Staggered Entry

```javascript
// N elements appear one after another
let staggerDelay = 100;  // ms between each
for (let i = 0; i < elements.length; i++) {
  let itemStart = baseTime + i * staggerDelay;
  let t = constrain((millis() - itemStart) / 500, 0, 1);
  let alpha = easeOutCubic(t) * 255;
  let yOffset = lerp(30, 0, easeOutCubic(t));
  // draw element with alpha and yOffset
}
```

## Recording Deterministic Animations

For frame-perfect export, use frame count instead of millis():

```javascript
const TOTAL_FRAMES = 300;  // 10 seconds at 30fps
const FPS = 30;

function draw() {
  let t = frameCount / TOTAL_FRAMES;  // 0 to 1 over full duration
  if (t > 1) { noLoop(); return; }

  // Use t for all animation timing — deterministic
  renderFrame(t);

  // Export
  if (CONFIG.recording) {
    saveCanvas('frame-' + nf(frameCount, 4), 'png');
  }
}
```

## Scene Fade Envelopes (Video)

Every scene in a multi-scene video needs fade-in and fade-out. Hard cuts between visually different generative scenes are jarring.

```javascript
const SCENE_FRAMES = 150;  // 5 seconds at 30fps
const FADE = 15;           // half-second fade

function draw() {
  let lf = frameCount - 1;  // 0-indexed local frame
  let t = lf / SCENE_FRAMES; // 0..1 normalized progress

  // Fade envelope: ramp up at start, ramp down at end
  let fade = 1;
  if (lf < FADE) fade = lf / FADE;
  if (lf > SCENE_FRAMES - FADE) fade = (SCENE_FRAMES - lf) / FADE;
  fade = fade * fade * (3 - 2 * fade);  // smoothstep for organic feel

  // Apply fade to all visual output
  // Option 1: multiply alpha values by fade
  fill(r, g, b, alpha * fade);

  // Option 2: tint entire composited image
  tint(255, fade * 255);
  image(sceneBuffer, 0, 0);
  noTint();

  // Option 3: multiply pixel brightness (for pixel-level scenes)
  pixels[i] = r * fade;
}
```

## Animating Static Algorithms

Some generative algorithms produce a single static result (attractors, circle packing, Voronoi). In video, static content reads as frozen/broken. Techniques to add motion:

### Progressive Reveal

Expand a mask from center outward to reveal the precomputed result:

```javascript
let revealRadius = easeOutCubic(min(t * 1.5, 1)) * (width * 0.8);
// In the render loop, skip pixels beyond revealRadius from center
let dx = x - width/2, dy = y - height/2;
if (sqrt(dx*dx + dy*dy) > revealRadius) continue;
// Soft edge:
let edgeFade = constrain((revealRadius - dist) / 40, 0, 1);
```

### Parameter Sweep

Slowly change a parameter to show the algorithm evolving:

```javascript
// Attractor with drifting parameters
let a = -1.7 + sin(t * 0.5) * 0.2;  // oscillate around base value
let b = 1.3 + cos(t * 0.3) * 0.15;
```

### Slow Camera Motion

Apply subtle zoom or rotation to the final image:

```javascript
push();
translate(width/2, height/2);
scale(1 + t * 0.05);       // slow 5% zoom over scene duration
rotate(t * 0.1);            // gentle rotation
translate(-width/2, -height/2);
image(precomputedResult, 0, 0);
pop();
```

### Overlay Dynamic Elements

Add particles, grain, or subtle noise on top of static content:

```javascript
// Static background
image(staticResult, 0, 0);
// Dynamic overlay
for (let p of ambientParticles) {
  p.update();
  p.display();  // slow-moving specks add life
}
```
