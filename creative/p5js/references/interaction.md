# Interaction

## Mouse Events

### Continuous State

```javascript
mouseX, mouseY          // current position (relative to canvas)
pmouseX, pmouseY        // previous frame position
mouseIsPressed          // boolean
mouseButton             // LEFT, RIGHT, CENTER (during press)
movedX, movedY          // delta since last frame
winMouseX, winMouseY    // relative to window (not canvas)
```

### Event Callbacks

```javascript
function mousePressed() {
  // fires once on press
  // mouseButton tells you which button
}

function mouseReleased() {
  // fires once on release
}

function mouseClicked() {
  // fires after press+release (same element)
}

function doubleClicked() {
  // fires on double-click
}

function mouseMoved() {
  // fires when mouse moves (no button pressed)
}

function mouseDragged() {
  // fires when mouse moves WITH button pressed
}

function mouseWheel(event) {
  // event.delta: positive = scroll down, negative = scroll up
  zoom += event.delta * -0.01;
  return false;  // prevent page scroll
}
```

### Mouse Interaction Patterns

**Spawn on click:**
```javascript
function mousePressed() {
  particles.push(new Particle(mouseX, mouseY));
}
```

**Mouse follow with spring:**
```javascript
let springX, springY;
function setup() {
  springX = new Spring(width/2, width/2);
  springY = new Spring(height/2, height/2);
}
function draw() {
  springX.setTarget(mouseX);
  springY.setTarget(mouseY);
  let x = springX.update();
  let y = springY.update();
  ellipse(x, y, 50);
}
```

**Drag interaction:**
```javascript
let dragging = false;
let dragObj = null;
let offsetX, offsetY;

function mousePressed() {
  for (let obj of objects) {
    if (dist(mouseX, mouseY, obj.x, obj.y) < obj.radius) {
      dragging = true;
      dragObj = obj;
      offsetX = mouseX - obj.x;
      offsetY = mouseY - obj.y;
      break;
    }
  }
}

function mouseDragged() {
  if (dragging && dragObj) {
    dragObj.x = mouseX - offsetX;
    dragObj.y = mouseY - offsetY;
  }
}

function mouseReleased() {
  dragging = false;
  dragObj = null;
}
```

**Mouse repulsion (particles flee cursor):**
```javascript
function draw() {
  let mousePos = createVector(mouseX, mouseY);
  for (let p of particles) {
    let d = p.pos.dist(mousePos);
    if (d < 150) {
      let repel = p5.Vector.sub(p.pos, mousePos);
      repel.normalize();
      repel.mult(map(d, 0, 150, 5, 0));
      p.applyForce(repel);
    }
  }
}
```

## Keyboard Events

### State

```javascript
keyIsPressed         // boolean
key                  // last key as string ('a', 'A', ' ')
keyCode              // numeric code (LEFT_ARROW, UP_ARROW, etc.)
```

### Event Callbacks

```javascript
function keyPressed() {
  // fires once on press
  if (keyCode === LEFT_ARROW) { /* ... */ }
  if (key === 's') saveCanvas('output', 'png');
  if (key === ' ') CONFIG.paused = !CONFIG.paused;
  return false;  // prevent default browser behavior
}

function keyReleased() {
  // fires once on release
}

function keyTyped() {
  // fires for printable characters only (not arrows, shift, etc.)
}
```

### Continuous Key State (Multiple Keys)

```javascript
let keys = {};

function keyPressed() { keys[keyCode] = true; }
function keyReleased() { keys[keyCode] = false; }

function draw() {
  if (keys[LEFT_ARROW]) player.x -= 5;
  if (keys[RIGHT_ARROW]) player.x += 5;
  if (keys[UP_ARROW]) player.y -= 5;
  if (keys[DOWN_ARROW]) player.y += 5;
}
```

### Key Constants

```
LEFT_ARROW, RIGHT_ARROW, UP_ARROW, DOWN_ARROW
BACKSPACE, DELETE, ENTER, RETURN, TAB, ESCAPE
SHIFT, CONTROL, OPTION, ALT
```

## Touch Events

```javascript
touches   // array of { x, y, id } — all current touches

function touchStarted() {
  // fires on first touch
  return false;  // prevent default (stops scroll on mobile)
}

function touchMoved() {
  // fires on touch drag
  return false;
}

function touchEnded() {
  // fires on touch release
}
```

### Pinch Zoom

```javascript
let prevDist = 0;
let zoomLevel = 1;

function touchMoved() {
  if (touches.length === 2) {
    let d = dist(touches[0].x, touches[0].y, touches[1].x, touches[1].y);
    if (prevDist > 0) {
      zoomLevel *= d / prevDist;
    }
    prevDist = d;
  }
  return false;
}

function touchEnded() {
  prevDist = 0;
}
```

## DOM Elements

### Creating Controls

```javascript
function setup() {
  createCanvas(800, 800);

  // Slider
  let slider = createSlider(0, 255, 100, 1);  // min, max, default, step
  slider.position(10, height + 10);
  slider.input(() => { CONFIG.value = slider.value(); });

  // Button
  let btn = createButton('Reset');
  btn.position(10, height + 40);
  btn.mousePressed(() => { resetSketch(); });

  // Checkbox
  let check = createCheckbox('Show grid', false);
  check.position(10, height + 70);
  check.changed(() => { CONFIG.showGrid = check.checked(); });

  // Select / dropdown
  let sel = createSelect();
  sel.position(10, height + 100);
  sel.option('Mode A');
  sel.option('Mode B');
  sel.changed(() => { CONFIG.mode = sel.value(); });

  // Color picker
  let picker = createColorPicker('#ff0000');
  picker.position(10, height + 130);
  picker.input(() => { CONFIG.color = picker.value(); });

  // Text input
  let inp = createInput('Hello');
  inp.position(10, height + 160);
  inp.input(() => { CONFIG.text = inp.value(); });
}
```

### Styling DOM Elements

```javascript
let slider = createSlider(0, 100, 50);
slider.position(10, 10);
slider.style('width', '200px');
slider.class('my-slider');
slider.parent('controls-div');  // attach to specific DOM element
```

## Audio Input (p5.sound)

Requires `p5.sound.min.js` addon.

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.11.3/addons/p5.sound.min.js"></script>
```

### Microphone Input

```javascript
let mic, fft, amplitude;

function setup() {
  createCanvas(800, 800);
  userStartAudio();  // required — user gesture to enable audio

  mic = new p5.AudioIn();
  mic.start();

  fft = new p5.FFT(0.8, 256);  // smoothing, bins
  fft.setInput(mic);

  amplitude = new p5.Amplitude();
  amplitude.setInput(mic);
}

function draw() {
  let level = amplitude.getLevel();    // 0.0 to 1.0 (overall volume)
  let spectrum = fft.analyze();         // array of 256 frequency values (0-255)
  let waveform = fft.waveform();        // array of 256 time-domain samples (-1 to 1)

  // Get energy in frequency bands
  let bass = fft.getEnergy('bass');          // 20-140 Hz
  let lowMid = fft.getEnergy('lowMid');      // 140-400 Hz
  let mid = fft.getEnergy('mid');            // 400-2600 Hz
  let highMid = fft.getEnergy('highMid');    // 2600-5200 Hz
  let treble = fft.getEnergy('treble');      // 5200-14000 Hz
  // Each returns 0-255
}
```

### Audio File Playback

```javascript
let song, fft;

function preload() {
  song = loadSound('track.mp3');
}

function setup() {
  createCanvas(800, 800);
  fft = new p5.FFT(0.8, 512);
  fft.setInput(song);
}

function mousePressed() {
  if (song.isPlaying()) {
    song.pause();
  } else {
    song.play();
  }
}
```

### Beat Detection (Simple)

```javascript
let prevBass = 0;
let beatThreshold = 30;
let beatCooldown = 0;

function detectBeat() {
  let bass = fft.getEnergy('bass');
  let isBeat = bass - prevBass > beatThreshold && beatCooldown <= 0;
  prevBass = bass;
  if (isBeat) beatCooldown = 10;  // frames
  beatCooldown--;
  return isBeat;
}
```

## Scroll-Driven Animation

```javascript
let scrollProgress = 0;

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.style('position', 'fixed');
  // Make page scrollable
  document.body.style.height = '500vh';
}

window.addEventListener('scroll', () => {
  let maxScroll = document.body.scrollHeight - window.innerHeight;
  scrollProgress = window.scrollY / maxScroll;
});

function draw() {
  background(0);
  // Use scrollProgress (0 to 1) to drive animation
  let x = lerp(0, width, scrollProgress);
  ellipse(x, height/2, 50);
}
```

## Responsive Events

```javascript
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // Recreate buffers
  bgLayer = createGraphics(width, height);
  // Recalculate layout
  recalculateLayout();
}

// Visibility change (tab switching)
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    noLoop();  // pause when tab not visible
  } else {
    loop();
  }
});
```
