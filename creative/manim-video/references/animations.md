# Animations Reference

## Core Concept

An animation is a Python object that computes intermediate visual states of a mobject over time. Animations are objects passed to `self.play()`, not functions.

`run_time` controls seconds (default: 1). Always specify it explicitly for important animations.

## Creation Animations

```python
self.play(Create(circle))          # traces outline
self.play(Write(equation))         # simulates handwriting (for Text/MathTex)
self.play(FadeIn(group))           # opacity 0 -> 1
self.play(GrowFromCenter(dot))     # scale 0 -> 1 from center
self.play(DrawBorderThenFill(sq))  # outline first, then fill
```

## Removal Animations

```python
self.play(FadeOut(mobject))         # opacity 1 -> 0
self.play(Uncreate(circle))        # reverse of Create
self.play(ShrinkToCenter(group))   # scale 1 -> 0
```

## Transform Animations

```python
# Transform -- modifies the original in place
self.play(Transform(circle, square))
# After: circle IS the square (same object, new appearance)

# ReplacementTransform -- replaces old with new
self.play(ReplacementTransform(circle, square))
# After: circle removed, square on screen

# TransformMatchingTex -- smart equation morphing
eq1 = MathTex(r"a^2 + b^2")
eq2 = MathTex(r"a^2 + b^2 = c^2")
self.play(TransformMatchingTex(eq1, eq2))
```

**Critical**: After `Transform(A, B)`, variable `A` references the on-screen mobject. Variable `B` is NOT on screen. Use `ReplacementTransform` when you want to work with `B` afterwards.

## The .animate Syntax

```python
self.play(circle.animate.set_color(RED))
self.play(circle.animate.shift(RIGHT * 2).scale(0.5))  # chain multiple
```

## Additional Creation Animations

```python
self.play(GrowFromPoint(circle, LEFT * 3))     # scale 0 -> 1 from a specific point
self.play(GrowFromEdge(rect, DOWN))             # grow from one edge
self.play(SpinInFromNothing(square))            # scale up while rotating (default PI/2)
self.play(GrowArrow(arrow))                     # grows arrow from start to tip
```

## Movement Animations

```python
# Move a mobject along an arbitrary path
path = Arc(radius=2, angle=PI)
self.play(MoveAlongPath(dot, path), run_time=2)

# Rotate (as a Transform, not .animate — supports about_point)
self.play(Rotate(square, angle=PI / 2, about_point=ORIGIN), run_time=1.5)

# Rotating (continuous rotation, updater-style — good for spinning objects)
self.play(Rotating(gear, angle=TAU, run_time=4, rate_func=linear))
```

`MoveAlongPath` takes any `VMobject` as the path — use `Arc`, `CubicBezier`, `Line`, or a custom `VMobject`. Position is computed via `path.point_from_proportion()`.

## Emphasis Animations

```python
self.play(Indicate(mobject))             # brief yellow flash + scale
self.play(Circumscribe(mobject))         # draw rectangle around it
self.play(Flash(point))                  # radial flash
self.play(Wiggle(mobject))               # shake side to side
```

## Rate Functions

```python
self.play(FadeIn(mob), rate_func=smooth)          # default: ease in/out
self.play(FadeIn(mob), rate_func=linear)           # constant speed
self.play(FadeIn(mob), rate_func=rush_into)        # start slow, end fast
self.play(FadeIn(mob), rate_func=rush_from)        # start fast, end slow
self.play(FadeIn(mob), rate_func=there_and_back)   # animate then reverse
```

## Composition

```python
# Simultaneous
self.play(FadeIn(title), Create(circle), run_time=2)

# AnimationGroup with lag
self.play(AnimationGroup(*[FadeIn(i) for i in items], lag_ratio=0.2))

# LaggedStart
self.play(LaggedStart(*[Write(l) for l in lines], lag_ratio=0.3, run_time=3))

# Succession (sequential in one play call)
self.play(Succession(FadeIn(title), Wait(0.5), Write(subtitle)))
```

## Updaters

```python
tracker = ValueTracker(0)
dot = Dot().add_updater(lambda m: m.move_to(axes.c2p(tracker.get_value(), 0)))
self.play(tracker.animate.set_value(5), run_time=3)
```

## Subtitles

```python
# Method 1: standalone
self.add_subcaption("Key insight", duration=2)
self.play(Write(equation), run_time=2.0)

# Method 2: inline
self.play(Write(equation), subcaption="Key insight", subcaption_duration=2)
```

Manim auto-generates `.srt` subtitle files. Always add subcaptions for accessibility.

## Timing Patterns

```python
# Pause-after-reveal
self.play(Write(key_equation), run_time=2.0)
self.wait(2.0)

# Dim-and-focus
self.play(old_content.animate.set_opacity(0.3), FadeIn(new_content))

# Clean exit
self.play(FadeOut(Group(*self.mobjects)), run_time=0.5)
self.wait(0.3)
```

## Reactive Mobjects: always_redraw()

Rebuild a mobject from scratch every frame — essential when its geometry depends on other animated objects:

```python
# Brace that follows a resizing square
brace = always_redraw(Brace, square, UP)
self.add(brace)
self.play(square.animate.scale(2))  # brace auto-adjusts

# Horizontal line that tracks a moving dot
h_line = always_redraw(lambda: axes.get_h_line(dot.get_left()))

# Label that always stays next to another mobject
label = always_redraw(lambda: Text("here", font_size=20).next_to(dot, UP, buff=0.2))
```

Note: `always_redraw` recreates the mobject every frame. For simple property tracking, use `add_updater` instead (cheaper):
```python
label.add_updater(lambda m: m.next_to(dot, UP))
```

## TracedPath — Trajectory Tracing

Draw the path a point has traveled:

```python
dot = Dot(color=YELLOW)
path = TracedPath(dot.get_center, stroke_color=YELLOW, stroke_width=2)
self.add(dot, path)
self.play(dot.animate.shift(RIGHT * 3 + UP * 2), run_time=2)
# path shows the trail the dot left behind

# Fading trail (dissipates over time):
path = TracedPath(dot.get_center, dissipating_time=0.5, stroke_opacity=[0, 1])
```

Use cases: gradient descent paths, planetary orbits, function tracing, particle trajectories.

## FadeTransform — Smoother Cross-Fades

`Transform` morphs shapes through ugly intermediate warping. `FadeTransform` cross-fades with position matching — use it when source and target look different:

```python
# UGLY: Transform warps circle into square through a blob
self.play(Transform(circle, square))

# SMOOTH: FadeTransform cross-fades cleanly
self.play(FadeTransform(circle, square))

# FadeTransformPieces: per-submobject FadeTransform
self.play(FadeTransformPieces(group1, group2))

# TransformFromCopy: animate a COPY while keeping the original visible
self.play(TransformFromCopy(source, target))
# source stays on screen, a copy morphs into target
```

**Recommendation:** Use `FadeTransform` as default for dissimilar shapes. Use `Transform`/`ReplacementTransform` only for similar shapes (circle→ellipse, equation→equation).

## ApplyMatrix — Linear Transformation Visualization

Animate a matrix transformation on mobjects:

```python
# Apply a 2x2 matrix to a grid
matrix = [[2, 1], [1, 1]]
self.play(ApplyMatrix(matrix, number_plane), run_time=2)

# Also works on individual mobjects
self.play(ApplyMatrix([[0, -1], [1, 0]], square))  # 90-degree rotation
```

Pairs with `LinearTransformationScene` — see `camera-and-3d.md`.

## squish_rate_func — Time-Window Staggering

Compress any rate function into a time window within an animation. Enables overlapping stagger without `LaggedStart`:

```python
self.play(
    FadeIn(a, rate_func=squish_rate_func(smooth, 0, 0.5)),    # 0% to 50%
    FadeIn(b, rate_func=squish_rate_func(smooth, 0.25, 0.75)), # 25% to 75%
    FadeIn(c, rate_func=squish_rate_func(smooth, 0.5, 1.0)),  # 50% to 100%
    run_time=2
)
```

More precise than `LaggedStart` when you need exact overlap control.

## Additional Rate Functions

```python
from manim import (
    smooth, linear, rush_into, rush_from,
    there_and_back, there_and_back_with_pause,
    running_start, double_smooth, wiggle,
    lingering, exponential_decay, not_quite_there,
    squish_rate_func
)

# running_start: pulls back before going forward (anticipation)
self.play(FadeIn(mob, rate_func=running_start))

# there_and_back_with_pause: goes there, holds, comes back
self.play(mob.animate.shift(UP), rate_func=there_and_back_with_pause)

# not_quite_there: stops at a fraction of the full animation
self.play(FadeIn(mob, rate_func=not_quite_there(0.7)))
```

## ShowIncreasingSubsets / ShowSubmobjectsOneByOne

Reveal group members progressively — ideal for algorithm visualization:

```python
# Reveal array elements one at a time
array = Group(*[Square() for _ in range(8)]).arrange(RIGHT)
self.play(ShowIncreasingSubsets(array), run_time=3)

# Show submobjects with staggered appearance
self.play(ShowSubmobjectsOneByOne(code_lines), run_time=4)
```

## ShowPassingFlash

A flash of light travels along a path:

```python
# Flash traveling along a curve
self.play(ShowPassingFlash(curve.copy().set_color(YELLOW), time_width=0.3))

# Great for: data flow, electrical signals, network traffic
```
