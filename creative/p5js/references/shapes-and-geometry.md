# Shapes and Geometry

## 2D Primitives

```javascript
point(x, y);
line(x1, y1, x2, y2);
rect(x, y, w, h);            // default: corner mode
rect(x, y, w, h, r);         // rounded corners
rect(x, y, w, h, tl, tr, br, bl);  // per-corner radius
square(x, y, size);
ellipse(x, y, w, h);
circle(x, y, d);             // diameter, not radius
triangle(x1, y1, x2, y2, x3, y3);
quad(x1, y1, x2, y2, x3, y3, x4, y4);
arc(x, y, w, h, start, stop, mode);  // mode: OPEN, CHORD, PIE
```

### Drawing Modes

```javascript
rectMode(CENTER);   // x,y is center (default: CORNER)
rectMode(CORNERS);  // x1,y1 to x2,y2
ellipseMode(CORNER); // x,y is top-left corner
ellipseMode(CENTER); // default — x,y is center
```

## Stroke and Fill

```javascript
fill(r, g, b, a);    // or fill(gray), fill('#hex'), fill(h, s, b) in HSB mode
noFill();
stroke(r, g, b, a);
noStroke();
strokeWeight(2);
strokeCap(ROUND);     // ROUND, SQUARE, PROJECT
strokeJoin(ROUND);    // ROUND, MITER, BEVEL
```

## Custom Shapes with Vertices

### Basic vertex shape

```javascript
beginShape();
  vertex(100, 100);
  vertex(200, 50);
  vertex(300, 100);
  vertex(250, 200);
  vertex(150, 200);
endShape(CLOSE);  // CLOSE connects last vertex to first
```

### Shape modes

```javascript
beginShape();          // default: polygon connecting all vertices
beginShape(POINTS);    // individual points
beginShape(LINES);     // pairs of vertices as lines
beginShape(TRIANGLES); // triplets as triangles
beginShape(TRIANGLE_FAN);
beginShape(TRIANGLE_STRIP);
beginShape(QUADS);     // groups of 4
beginShape(QUAD_STRIP);
```

### Contours (holes in shapes)

```javascript
beginShape();
  // outer shape
  vertex(100, 100);
  vertex(300, 100);
  vertex(300, 300);
  vertex(100, 300);
  // inner hole
  beginContour();
    vertex(150, 150);
    vertex(150, 250);
    vertex(250, 250);
    vertex(250, 150);
  endContour();
endShape(CLOSE);
```

## Bezier Curves

### Cubic Bezier

```javascript
bezier(x1, y1, cx1, cy1, cx2, cy2, x2, y2);
// x1,y1 = start point
// cx1,cy1 = first control point
// cx2,cy2 = second control point
// x2,y2 = end point
```

### Bezier in custom shapes

```javascript
beginShape();
  vertex(100, 200);
  bezierVertex(150, 50, 250, 50, 300, 200);
  // control1, control2, endpoint
endShape();
```

### Quadratic Bezier

```javascript
beginShape();
  vertex(100, 200);
  quadraticVertex(200, 50, 300, 200);
  // single control point + endpoint
endShape();
```

### Interpolation along Bezier

```javascript
let x = bezierPoint(x1, cx1, cx2, x2, t);  // t = 0..1
let y = bezierPoint(y1, cy1, cy2, y2, t);
let tx = bezierTangent(x1, cx1, cx2, x2, t); // tangent
```

## Catmull-Rom Splines

```javascript
curve(cpx1, cpy1, x1, y1, x2, y2, cpx2, cpy2);
// cpx1,cpy1 = control point before start
// x1,y1 = start point (visible)
// x2,y2 = end point (visible)
// cpx2,cpy2 = control point after end

curveVertex(x, y);  // in beginShape() — smooth curve through all points
curveTightness(0);  // 0 = Catmull-Rom, 1 = straight lines, -1 = loose
```

### Smooth curve through points

```javascript
let points = [/* array of {x, y} */];
beginShape();
  curveVertex(points[0].x, points[0].y); // repeat first for tangent
  for (let p of points) {
    curveVertex(p.x, p.y);
  }
  curveVertex(points[points.length-1].x, points[points.length-1].y); // repeat last
endShape();
```

## p5.Vector

Essential for physics, particle systems, and geometric computation.

```javascript
let v = createVector(x, y);

// Arithmetic (modifies in place)
v.add(other);        // vector addition
v.sub(other);        // subtraction
v.mult(scalar);      // scale
v.div(scalar);       // inverse scale
v.normalize();       // unit vector (length 1)
v.limit(max);        // cap magnitude
v.setMag(len);       // set exact magnitude

// Queries (non-destructive)
v.mag();             // magnitude (length)
v.magSq();           // squared magnitude (faster, no sqrt)
v.heading();         // angle in radians
v.dist(other);       // distance to other vector
v.dot(other);        // dot product
v.cross(other);      // cross product (3D)
v.angleBetween(other); // angle between vectors

// Static methods (return new vector)
p5.Vector.add(a, b);      // a + b → new vector
p5.Vector.sub(a, b);      // a - b → new vector
p5.Vector.fromAngle(a);   // unit vector at angle
p5.Vector.random2D();     // random unit vector
p5.Vector.lerp(a, b, t);  // interpolate

// Copy
let copy = v.copy();
```

## Signed Distance Fields (2D)

SDFs return the distance from a point to the nearest edge of a shape. Negative inside, positive outside. Useful for smooth shapes, glow effects, boolean operations.

```javascript
// Circle SDF
function sdCircle(px, py, cx, cy, r) {
  return dist(px, py, cx, cy) - r;
}

// Box SDF
function sdBox(px, py, cx, cy, hw, hh) {
  let dx = abs(px - cx) - hw;
  let dy = abs(py - cy) - hh;
  return sqrt(max(dx, 0) ** 2 + max(dy, 0) ** 2) + min(max(dx, dy), 0);
}

// Line segment SDF
function sdSegment(px, py, ax, ay, bx, by) {
  let pa = createVector(px - ax, py - ay);
  let ba = createVector(bx - ax, by - ay);
  let t = constrain(pa.dot(ba) / ba.dot(ba), 0, 1);
  let closest = p5.Vector.add(createVector(ax, ay), p5.Vector.mult(ba, t));
  return dist(px, py, closest.x, closest.y);
}

// Smooth boolean union
function opSmoothUnion(d1, d2, k) {
  let h = constrain(0.5 + 0.5 * (d2 - d1) / k, 0, 1);
  return lerp(d2, d1, h) - k * h * (1 - h);
}

// Rendering SDF as glow
let d = sdCircle(x, y, width/2, height/2, 200);
let glow = exp(-abs(d) * 0.02);  // exponential falloff
fill(glow * 255);
```

## Useful Geometry Patterns

### Regular Polygon

```javascript
function regularPolygon(cx, cy, r, sides) {
  beginShape();
  for (let i = 0; i < sides; i++) {
    let a = TWO_PI * i / sides - HALF_PI;
    vertex(cx + cos(a) * r, cy + sin(a) * r);
  }
  endShape(CLOSE);
}
```

### Star Shape

```javascript
function star(cx, cy, r1, r2, npoints) {
  beginShape();
  let angle = TWO_PI / npoints;
  let halfAngle = angle / 2;
  for (let a = -HALF_PI; a < TWO_PI - HALF_PI; a += angle) {
    vertex(cx + cos(a) * r2, cy + sin(a) * r2);
    vertex(cx + cos(a + halfAngle) * r1, cy + sin(a + halfAngle) * r1);
  }
  endShape(CLOSE);
}
```

### Rounded Line (Capsule)

```javascript
function capsule(x1, y1, x2, y2, weight) {
  strokeWeight(weight);
  strokeCap(ROUND);
  line(x1, y1, x2, y2);
}
```

### Soft Body / Blob

```javascript
function blob(cx, cy, baseR, noiseScale, noiseOffset, detail = 64) {
  beginShape();
  for (let i = 0; i < detail; i++) {
    let a = TWO_PI * i / detail;
    let r = baseR + noise(cos(a) * noiseScale + noiseOffset,
                          sin(a) * noiseScale + noiseOffset) * baseR * 0.4;
    vertex(cx + cos(a) * r, cy + sin(a) * r);
  }
  endShape(CLOSE);
}
```

## Clipping and Masking

```javascript
// Clip shape — everything drawn after is masked by the clip shape
beginClip();
  circle(width/2, height/2, 400);
endClip();
// Only content inside the circle is visible
image(myImage, 0, 0);

// Or functional form
clip(() => {
  circle(width/2, height/2, 400);
});

// Erase mode — cut holes
erase();
  circle(mouseX, mouseY, 100);  // this area becomes transparent
noErase();
```
