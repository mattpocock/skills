# Mobjects Reference

Everything visible on screen is a Mobject. They have position, color, opacity, and can be animated.

## Text

```python
title = Text("Hello World", font_size=48, color=BLUE)
eq = MathTex(r"E = mc^2", font_size=40)

# Multi-part (for selective coloring)
eq = MathTex(r"a^2", r"+", r"b^2", r"=", r"c^2")
eq[0].set_color(RED)
eq[4].set_color(BLUE)

# Mixed text and math
t = Tex(r"The area is $\pi r^2$", font_size=36)

# Styled markup
t = MarkupText('<span foreground="#58C4DD">Blue</span> text', font_size=30)
```

**Always use raw strings (`r""`) for any string with backslashes.**

## Shapes

```python
circle = Circle(radius=1, color=BLUE, fill_opacity=0.5)
square = Square(side_length=2, color=RED)
rect = Rectangle(width=4, height=2, color=GREEN)
dot = Dot(point=ORIGIN, radius=0.08, color=YELLOW)
line = Line(LEFT * 2, RIGHT * 2, color=WHITE)
arrow = Arrow(LEFT, RIGHT, color=ORANGE)
rrect = RoundedRectangle(corner_radius=0.3, width=4, height=2)
brace = Brace(rect, DOWN, color=YELLOW)
```

## Polygons and Arcs

```python
# Arbitrary polygon from vertices
poly = Polygon(LEFT, UP * 2, RIGHT, color=GREEN, fill_opacity=0.3)

# Regular n-sided polygon
hexagon = RegularPolygon(n=6, color=TEAL, fill_opacity=0.4)

# Triangle (shorthand for RegularPolygon(n=3))
tri = Triangle(color=YELLOW, fill_opacity=0.5)

# Arc (portion of a circle)
arc = Arc(radius=2, start_angle=0, angle=PI / 2, color=BLUE)

# Arc between two points
arc_between = ArcBetweenPoints(LEFT * 2, RIGHT * 2, angle=TAU / 4, color=RED)

# Curved arrow (arc with tip)
curved_arrow = CurvedArrow(LEFT * 2, RIGHT * 2, color=ORANGE)
```

## Sectors and Annuli

```python
# Sector (pie slice)
sector = Sector(outer_radius=2, start_angle=0, angle=PI / 3, fill_opacity=0.7, color=BLUE)

# Annulus (ring)
ring = Annulus(inner_radius=1, outer_radius=2, fill_opacity=0.5, color=GREEN)

# Annular sector (partial ring)
partial_ring = AnnularSector(
    inner_radius=1, outer_radius=2,
    angle=PI / 2, start_angle=0,
    fill_opacity=0.7, color=TEAL
)

# Cutout (punch holes in a shape)
background = Square(side_length=4, fill_opacity=1, color=BLUE)
hole = Circle(radius=0.5)
cutout = Cutout(background, hole, fill_opacity=1, color=BLUE)
```

Use cases: pie charts, ring progress indicators, Venn diagrams with arcs, geometric proofs.

## Positioning

```python
mob.move_to(ORIGIN)                        # center
mob.move_to(UP * 2 + RIGHT)               # relative
label.next_to(circle, DOWN, buff=0.3)     # next to another
title.to_edge(UP, buff=0.5)               # screen edge (buff >= 0.5!)
mob.to_corner(UL, buff=0.5)               # corner
```

## VGroup vs Group

**VGroup** is for collections of shapes (VMobjects only — Circle, Square, Arrow, Line, MathTex):
```python
shapes = VGroup(circle, square, arrow)
shapes.arrange(DOWN, buff=0.5)
shapes.set_color(BLUE)
```

**Group** is for mixed collections (Text + shapes, or any Mobject types):
```python
# Text objects are Mobjects, not VMobjects — use Group when mixing
labeled_shape = Group(circle, Text("Label").next_to(circle, DOWN))
labeled_shape.move_to(ORIGIN)

# FadeOut everything on screen (may contain mixed types)
self.play(FadeOut(Group(*self.mobjects)))
```

**Rule: if your group contains any `Text()` objects, use `Group`, not `VGroup`.** VGroup will raise a TypeError on Manim CE v0.20+. MathTex and Tex are VMobjects and work with VGroup.

Both support `arrange()`, `arrange_in_grid()`, `set_opacity()`, `shift()`, `scale()`, `move_to()`.

## Styling

```python
mob.set_color(BLUE)
mob.set_fill(RED, opacity=0.5)
mob.set_stroke(WHITE, width=2)
mob.set_opacity(0.4)
mob.set_z_index(1)                         # layering
```

## Specialized Mobjects

```python
nl = NumberLine(x_range=[-3, 3, 1], length=8, include_numbers=True)
table = Table([["A", "B"], ["C", "D"]], row_labels=[Text("R1"), Text("R2")])
code = Code("example.py", tab_width=4, font_size=20, language="python")
highlight = SurroundingRectangle(target, color=YELLOW, buff=0.2)
bg = BackgroundRectangle(equation, fill_opacity=0.7, buff=0.2)
```

## Custom Mobjects

```python
class NetworkNode(Group):
    def __init__(self, label_text, color=BLUE, **kwargs):
        super().__init__(**kwargs)
        self.circle = Circle(radius=0.4, color=color, fill_opacity=0.3)
        self.label = Text(label_text, font_size=20).move_to(self.circle)
        self.add(self.circle, self.label)
```

## Matrix Mobjects

Display matrices as grids of numbers or mobjects:

```python
# Integer matrix
m = IntegerMatrix([[1, 2], [3, 4]])

# Decimal matrix (control decimal places)
m = DecimalMatrix([[1.5, 2.7], [3.1, 4.9]], element_to_mobject_config={"num_decimal_places": 2})

# Mobject matrix (any mobject in each cell)
m = MobjectMatrix([
    [MathTex(r"\pi"), MathTex(r"e")],
    [MathTex(r"\phi"), MathTex(r"\tau")]
])

# Bracket types: "(" "[" "|" or "\\{"
m = IntegerMatrix([[1, 0], [0, 1]], left_bracket="[", right_bracket="]")
```

Use cases: linear algebra, transformation matrices, system-of-equations coefficient display.

## Constants

Directions: `UP, DOWN, LEFT, RIGHT, ORIGIN, UL, UR, DL, DR`
Colors: `RED, BLUE, GREEN, YELLOW, WHITE, GRAY, ORANGE, PINK, PURPLE, TEAL, GOLD`
Frame: `config.frame_width = 14.222, config.frame_height = 8.0`

## SVGMobject — Import SVG Files

```python
logo = SVGMobject("path/to/logo.svg")
logo.set_color(WHITE).scale(0.5).to_corner(UR)
self.play(FadeIn(logo))

# SVG submobjects are individually animatable
for part in logo.submobjects:
    self.play(part.animate.set_color(random_color()))
```

## ImageMobject — Display Images

```python
img = ImageMobject("screenshot.png")
img.set_height(3).to_edge(RIGHT)
self.play(FadeIn(img))
```

Note: images cannot be animated with `.animate` (they're raster, not vector). Use `FadeIn`/`FadeOut` and `shift`/`scale` only.

## Variable — Auto-Updating Display

```python
var = Variable(0, Text("x"), num_decimal_places=2)
var.move_to(ORIGIN)
self.add(var)

# Animate the value
self.play(var.tracker.animate.set_value(5), run_time=2)
# Display auto-updates: "x = 5.00"
```

Cleaner than manual `DecimalNumber` + `add_updater` for simple labeled-value displays.

## BulletedList

```python
bullets = BulletedList(
    "First key point",
    "Second important fact",
    "Third conclusion",
    font_size=28
)
bullets.to_edge(LEFT, buff=1.0)
self.play(Write(bullets))

# Highlight individual items
self.play(bullets[1].animate.set_color(YELLOW))
```

## DashedLine and Angle Markers

```python
# Dashed line (asymptotes, construction lines)
dashed = DashedLine(LEFT * 3, RIGHT * 3, color=SUBTLE, dash_length=0.15)

# Angle marker between two lines
line1 = Line(ORIGIN, RIGHT * 2)
line2 = Line(ORIGIN, UP * 2 + RIGHT)
angle = Angle(line1, line2, radius=0.5, color=YELLOW)
angle_label = angle.get_value()  # returns the angle in radians

# Right angle marker
right_angle = RightAngle(line1, Line(ORIGIN, UP * 2), length=0.3, color=WHITE)
```

## Boolean Operations (CSG)

Combine, subtract, or intersect 2D shapes:

```python
circle = Circle(radius=1.5, color=BLUE, fill_opacity=0.5).shift(LEFT * 0.5)
square = Square(side_length=2, color=RED, fill_opacity=0.5).shift(RIGHT * 0.5)

# Union, Intersection, Difference, Exclusion
union = Union(circle, square, color=GREEN, fill_opacity=0.5)
intersect = Intersection(circle, square, color=YELLOW, fill_opacity=0.5)
diff = Difference(circle, square, color=PURPLE, fill_opacity=0.5)
exclude = Exclusion(circle, square, color=ORANGE, fill_opacity=0.5)
```

Use cases: Venn diagrams, set theory, geometric proofs, area calculations.

## LabeledArrow / LabeledLine

```python
# Arrow with built-in label (auto-positioned)
arr = LabeledArrow(Text("force", font_size=18), start=LEFT, end=RIGHT, color=RED)

# Line with label
line = LabeledLine(Text("d = 5m", font_size=18), start=LEFT * 2, end=RIGHT * 2)
```

Auto-handles label positioning — cleaner than manual `Arrow` + `Text().next_to()`.

## Text Color/Font/Style Per-Substring (t2c, t2f, t2s, t2w)

```python
# Color specific words (t2c = text-to-color)
text = Text(
    "Gradient descent minimizes the loss function",
    t2c={"Gradient descent": BLUE, "loss function": RED}
)

# Different fonts per word (t2f = text-to-font)
text = Text(
    "Use Menlo for code and Inter for prose",
    t2f={"Menlo": "Menlo", "Inter": "Inter"}
)

# Italic/slant per word (t2s = text-to-slant)
text = Text("Normal and italic text", t2s={"italic": ITALIC})

# Bold per word (t2w = text-to-weight)
text = Text("Normal and bold text", t2w={"bold": BOLD})
```

These are much cleaner than creating separate Text objects and grouping them.

## Backstroke for Readability Over Backgrounds

When text overlaps other content (graphs, diagrams, images), add a dark stroke behind it:

```python
# CE syntax:
label.set_stroke(BLACK, width=5, background=True)

# Apply to a group
for mob in labels:
    mob.set_stroke(BLACK, width=4, background=True)
```

This is how 3Blue1Brown keeps text readable over complex backgrounds without using BackgroundRectangle.

## Complex Function Transforms

Apply complex functions to entire mobjects — transforms the plane:

```python
c_grid = ComplexPlane()
moving_grid = c_grid.copy()
moving_grid.prepare_for_nonlinear_transform()  # adds more sample points for smooth deformation

self.play(
    moving_grid.animate.apply_complex_function(lambda z: z**2),
    run_time=5,
)

# Also works with R3->R3 functions:
self.play(grid.animate.apply_function(
    lambda p: [p[0] + 0.5 * math.sin(p[1]), p[1] + 0.5 * math.sin(p[0]), p[2]]
), run_time=5)
```

**Critical:** Call `prepare_for_nonlinear_transform()` before applying nonlinear functions — without it, the grid has too few sample points and the deformation looks jagged.
