# Typography

## Loading Fonts

### System Fonts

```javascript
textFont('Helvetica');
textFont('Georgia');
textFont('monospace');
```

### Custom Fonts (OTF/TTF/WOFF2)

```javascript
let myFont;

function preload() {
  myFont = loadFont('path/to/font.otf');
  // Requires local server or CORS-enabled URL
}

function setup() {
  textFont(myFont);
}
```

### Google Fonts via CSS

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet">
<script>
function setup() {
  textFont('Inter');
}
</script>
```

Google Fonts work without `loadFont()` but only for `text()` — not for `textToPoints()`. For particle text, you need `loadFont()` with an OTF/TTF file.

## Text Rendering

### Basic Text

```javascript
textSize(32);
textAlign(CENTER, CENTER);
text('Hello World', width/2, height/2);
```

### Text Properties

```javascript
textSize(48);                    // pixel size
textAlign(LEFT, TOP);            // horizontal: LEFT, CENTER, RIGHT
                                 // vertical: TOP, CENTER, BOTTOM, BASELINE
textLeading(40);                 // line spacing (for multi-line text)
textStyle(BOLD);                 // NORMAL, BOLD, ITALIC, BOLDITALIC
textWrap(WORD);                  // WORD or CHAR (for text() with max width)
```

### Text Metrics

```javascript
let w = textWidth('Hello');      // pixel width of string
let a = textAscent();            // height above baseline
let d = textDescent();           // height below baseline
let totalH = a + d;              // full line height
```

### Text Bounding Box

```javascript
let bounds = myFont.textBounds('Hello', x, y, size);
// bounds = { x, y, w, h }
// Useful for positioning, collision, background rectangles
```

### Multi-Line Text

```javascript
// With max width — auto wraps
textWrap(WORD);
text('Long text that wraps within the given width', x, y, maxWidth);

// With max width AND height — clips
text('Very long text', x, y, maxWidth, maxHeight);
```

## textToPoints() — Text as Particles

Convert text outline to array of points. Requires a loaded font (OTF/TTF via `loadFont()`).

```javascript
let font;
let points;

function preload() {
  font = loadFont('font.otf');  // MUST be loadFont, not CSS
}

function setup() {
  createCanvas(1200, 600);
  points = font.textToPoints('HELLO', 100, 400, 200, {
    sampleFactor: 0.1,  // lower = more points (0.1-0.5 typical)
    simplifyThreshold: 0
  });
}

function draw() {
  background(0);
  for (let pt of points) {
    let n = noise(pt.x * 0.01, pt.y * 0.01, frameCount * 0.01);
    fill(255, n * 255);
    noStroke();
    ellipse(pt.x + random(-2, 2), pt.y + random(-2, 2), 3);
  }
}
```

### Particle Text Class

```javascript
class TextParticle {
  constructor(target) {
    this.target = createVector(target.x, target.y);
    this.pos = createVector(random(width), random(height));
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.maxSpeed = 10;
    this.maxForce = 0.5;
  }

  arrive() {
    let desired = p5.Vector.sub(this.target, this.pos);
    let d = desired.mag();
    let speed = d < 100 ? map(d, 0, 100, 0, this.maxSpeed) : this.maxSpeed;
    desired.setMag(speed);
    let steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxForce);
    this.acc.add(steer);
  }

  flee(target, radius) {
    let d = this.pos.dist(target);
    if (d < radius) {
      let desired = p5.Vector.sub(this.pos, target);
      desired.setMag(this.maxSpeed);
      let steer = p5.Vector.sub(desired, this.vel);
      steer.limit(this.maxForce * 2);
      this.acc.add(steer);
    }
  }

  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  display() {
    fill(255);
    noStroke();
    ellipse(this.pos.x, this.pos.y, 3);
  }
}

// Usage: particles form text, scatter from mouse
let textParticles = [];
for (let pt of points) {
  textParticles.push(new TextParticle(pt));
}

function draw() {
  background(0);
  for (let p of textParticles) {
    p.arrive();
    p.flee(createVector(mouseX, mouseY), 80);
    p.update();
    p.display();
  }
}
```

## Kinetic Typography

### Wave Text

```javascript
function waveText(str, x, y, size, amplitude, frequency) {
  textSize(size);
  textAlign(LEFT, BASELINE);
  let xOff = 0;
  for (let i = 0; i < str.length; i++) {
    let yOff = sin(frameCount * 0.05 + i * frequency) * amplitude;
    text(str[i], x + xOff, y + yOff);
    xOff += textWidth(str[i]);
  }
}
```

### Typewriter Effect

```javascript
class Typewriter {
  constructor(str, x, y, speed = 50) {
    this.str = str;
    this.x = x;
    this.y = y;
    this.speed = speed;  // ms per character
    this.startTime = millis();
    this.cursor = true;
  }

  display() {
    let elapsed = millis() - this.startTime;
    let chars = min(floor(elapsed / this.speed), this.str.length);
    let visible = this.str.substring(0, chars);

    textAlign(LEFT, TOP);
    text(visible, this.x, this.y);

    // Blinking cursor
    if (chars < this.str.length && floor(millis() / 500) % 2 === 0) {
      let cursorX = this.x + textWidth(visible);
      line(cursorX, this.y, cursorX, this.y + textAscent() + textDescent());
    }
  }

  isDone() { return millis() - this.startTime >= this.str.length * this.speed; }
}
```

### Character-by-Character Animation

```javascript
function animatedText(str, x, y, size, delay = 50) {
  textSize(size);
  textAlign(LEFT, BASELINE);
  let xOff = 0;

  for (let i = 0; i < str.length; i++) {
    let charStart = i * delay;
    let t = constrain((millis() - charStart) / 500, 0, 1);
    let et = easeOutElastic(t);

    push();
    translate(x + xOff, y);
    scale(et);
    let alpha = t * 255;
    fill(255, alpha);
    text(str[i], 0, 0);
    pop();

    xOff += textWidth(str[i]);
  }
}
```

## Text as Mask

```javascript
let textBuffer;

function setup() {
  createCanvas(800, 800);
  textBuffer = createGraphics(width, height);
  textBuffer.background(0);
  textBuffer.fill(255);
  textBuffer.textSize(200);
  textBuffer.textAlign(CENTER, CENTER);
  textBuffer.text('MASK', width/2, height/2);
}

function draw() {
  // Draw content
  background(0);
  // ... render something colorful

  // Apply text mask (show content only where text is white)
  loadPixels();
  textBuffer.loadPixels();
  for (let i = 0; i < pixels.length; i += 4) {
    let maskVal = textBuffer.pixels[i];  // white = show, black = hide
    pixels[i + 3] = maskVal;  // set alpha from mask
  }
  updatePixels();
}
```

## Responsive Text Sizing

```javascript
function responsiveTextSize(baseSize, baseWidth = 1920) {
  return baseSize * (width / baseWidth);
}

// Usage
textSize(responsiveTextSize(48));
text('Scales with canvas', width/2, height/2);
```
