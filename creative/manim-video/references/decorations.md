# Decorations and Visual Polish

Decorations are mobjects that annotate, highlight, or frame other mobjects. They turn a technically correct animation into a visually polished one.

## SurroundingRectangle

Draws a rectangle around any mobject. The go-to for highlighting:

```python
highlight = SurroundingRectangle(
    equation[2],            # the term to highlight
    color=YELLOW,
    buff=0.15,              # padding between content and border
    corner_radius=0.1,      # rounded corners
    stroke_width=2
)
self.play(Create(highlight))
self.wait(1)
self.play(FadeOut(highlight))
```

### Around part of an equation

```python
eq = MathTex(r"E", r"=", r"m", r"c^2")
box = SurroundingRectangle(eq[2:], color=YELLOW, buff=0.1)  # highlight "mc²"
label = Text("mass-energy", font_size=18, font="Menlo", color=YELLOW)
label.next_to(box, DOWN, buff=0.2)
self.play(Create(box), FadeIn(label))
```

## BackgroundRectangle

Semi-transparent background behind text for readability over complex scenes:

```python
bg = BackgroundRectangle(equation, fill_opacity=0.7, buff=0.2, color=BLACK)
self.play(FadeIn(bg), Write(equation))

# Or using set_stroke for a "backdrop" effect on the text itself:
label.set_stroke(BLACK, width=5, background=True)
```

The `set_stroke(background=True)` approach is cleaner for text labels over graphs/diagrams.

## Brace and BraceLabel

Curly braces that annotate sections of a diagram or equation:

```python
brace = Brace(equation[2:4], DOWN, color=YELLOW)
brace_label = brace.get_text("these terms", font_size=20)
self.play(GrowFromCenter(brace), FadeIn(brace_label))

# Between two specific points
brace = BraceBetweenPoints(point_a, point_b, direction=UP)
```

### Brace placement

```python
# Below a group
Brace(group, DOWN)
# Above a group
Brace(group, UP)
# Left of a group
Brace(group, LEFT)
# Right of a group
Brace(group, RIGHT)
```

## Arrows for Annotation

### Straight arrows pointing to mobjects

```python
arrow = Arrow(
    start=label.get_bottom(),
    end=target.get_top(),
    color=YELLOW,
    stroke_width=2,
    buff=0.1,                    # gap between arrow tip and target
    max_tip_length_to_length_ratio=0.15  # small arrowhead
)
self.play(GrowArrow(arrow), FadeIn(label))
```

### Curved arrows

```python
arrow = CurvedArrow(
    start_point=source.get_right(),
    end_point=target.get_left(),
    angle=PI/4,                  # curve angle
    color=PRIMARY
)
```

### Labeling with arrows

```python
# LabeledArrow: arrow with built-in text label
arr = LabeledArrow(
    Text("gradient", font_size=16, font="Menlo"),
    start=point_a, end=point_b, color=RED
)
```

## DashedLine and DashedVMobject

```python
# Dashed line (for asymptotes, construction lines, implied connections)
asymptote = DashedLine(
    axes.c2p(2, -3), axes.c2p(2, 3),
    color=YELLOW, dash_length=0.15
)

# Make any VMobject dashed
dashed_circle = DashedVMobject(Circle(radius=2, color=BLUE), num_dashes=30)
```

## Angle and RightAngle Markers

```python
line1 = Line(ORIGIN, RIGHT * 2)
line2 = Line(ORIGIN, UP * 2 + RIGHT)

# Angle arc between two lines
angle = Angle(line1, line2, radius=0.5, color=YELLOW)
angle_value = angle.get_value()  # radians

# Right angle marker (the small square)
right_angle = RightAngle(line1, Line(ORIGIN, UP * 2), length=0.3, color=WHITE)
```

## Cross (strikethrough)

Mark something as wrong or deprecated:

```python
cross = Cross(old_equation, color=RED, stroke_width=4)
self.play(Create(cross))
# Then show the correct version
```

## Underline

```python
underline = Underline(important_text, color=ACCENT, stroke_width=3)
self.play(Create(underline))
```

## Color Highlighting Workflow

### Method 1: At creation with t2c

```python
text = Text("The gradient is negative here", t2c={"gradient": BLUE, "negative": RED})
```

### Method 2: set_color_by_tex after creation

```python
eq = MathTex(r"\nabla L = -\frac{\partial L}{\partial w}")
eq.set_color_by_tex(r"\nabla", BLUE)
eq.set_color_by_tex(r"\partial", RED)
```

### Method 3: Index into submobjects

```python
eq = MathTex(r"a", r"+", r"b", r"=", r"c")
eq[0].set_color(RED)    # "a"
eq[2].set_color(BLUE)   # "b"
eq[4].set_color(GREEN)  # "c"
```

## Combining Annotations

Layer multiple annotations for emphasis:

```python
# Highlight a term, add a brace, and an arrow — in sequence
box = SurroundingRectangle(eq[2], color=YELLOW, buff=0.1)
brace = Brace(eq[2], DOWN, color=YELLOW)
label = brace.get_text("learning rate", font_size=18)

self.play(Create(box))
self.wait(0.5)
self.play(FadeOut(box), GrowFromCenter(brace), FadeIn(label))
self.wait(1.5)
self.play(FadeOut(brace), FadeOut(label))
```

### The annotation lifecycle

Annotations should follow a rhythm:
1. **Appear** — draw attention (Create, GrowFromCenter)
2. **Hold** — viewer reads and understands (self.wait)
3. **Disappear** — clear the stage for the next thing (FadeOut)

Never leave annotations on screen indefinitely — they become visual noise once their purpose is served.
