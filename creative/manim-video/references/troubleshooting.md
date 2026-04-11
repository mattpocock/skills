# Troubleshooting

## LaTeX Errors

**Missing raw string** (the #1 error):
```python
# WRONG: MathTex("\\frac{1}{2}")  -- \\f is form-feed
# RIGHT: MathTex(r"\frac{1}{2}")
```

**Unbalanced braces**: `MathTex(r"\frac{1}{2")` -- missing closing brace.

**LaTeX not installed**: `which pdflatex` -- install texlive-full or mactex.

**Missing package**: Add to preamble:
```python
tex_template = TexTemplate()
tex_template.add_to_preamble(r"\usepackage{mathrsfs}")
MathTex(r"\mathscr{L}", tex_template=tex_template)
```

## VGroup TypeError

**Error:** `TypeError: Only values of type VMobject can be added as submobjects of VGroup`

**Cause:** `Text()` objects are `Mobject`, not `VMobject`. Mixing `Text` with shapes in a `VGroup` fails on Manim CE v0.20+.

```python
# WRONG: Text is not a VMobject
group = VGroup(circle, Text("Label"))

# RIGHT: use Group for mixed types
group = Group(circle, Text("Label"))

# RIGHT: VGroup is fine for shapes-only
shapes = VGroup(circle, square, arrow)

# RIGHT: MathTex IS a VMobject — VGroup works
equations = VGroup(MathTex(r"a"), MathTex(r"b"))
```

**Rule:** If the group contains any `Text()`, use `Group`. If it's all shapes or all `MathTex`, `VGroup` is fine.

**FadeOut everything:** Always use `Group(*self.mobjects)`, not `VGroup(*self.mobjects)`:
```python
self.play(FadeOut(Group(*self.mobjects)))  # safe for mixed types
```

## Group save_state() / restore() Not Supported

**Error:** `NotImplementedError: Please override in a child class.`

**Cause:** `Group.save_state()` and `Group.restore()` are not implemented in Manim CE v0.20+. Only `VGroup` and individual `Mobject` subclasses support save/restore.

```python
# WRONG: Group doesn't support save_state
group = Group(circle, Text("label"))
group.save_state()  # NotImplementedError!

# RIGHT: use FadeIn with shift/scale instead of save_state/restore
self.play(FadeIn(group, shift=UP * 0.3, scale=0.8))

# RIGHT: or save/restore on individual VMobjects
circle.save_state()
self.play(circle.animate.shift(RIGHT))
self.play(Restore(circle))
```

## letter_spacing Is Not a Valid Parameter

**Error:** `TypeError: Mobject.__init__() got an unexpected keyword argument 'letter_spacing'`

**Cause:** `Text()` does not accept `letter_spacing`. Manim uses Pango for text rendering and does not expose kerning controls on `Text()`.

```python
# WRONG
Text("HERMES", letter_spacing=6)

# RIGHT: use MarkupText with Pango attributes for spacing control
MarkupText('<span letter_spacing="6000">HERMES</span>', font_size=18)
# Note: Pango letter_spacing is in 1/1024 of a point
```

## Animation Errors

**Invisible animation** -- mobject never added:
```python
# WRONG: circle = Circle(); self.play(circle.animate.set_color(RED))
# RIGHT: self.play(Create(circle)); self.play(circle.animate.set_color(RED))
```

**Transform confusion** -- after Transform(A, B), A is on screen, B is not. Use ReplacementTransform if you want B.

**Duplicate animation** -- same mobject twice in one play():
```python
# WRONG: self.play(c.animate.shift(RIGHT), c.animate.set_color(RED))
# RIGHT: self.play(c.animate.shift(RIGHT).set_color(RED))
```

**Updater fights animation**:
```python
mob.suspend_updating()
self.play(mob.animate.shift(RIGHT))
mob.resume_updating()
```

## Rendering Issues

**Blurry output**: Using -ql (480p). Switch to -qm/-qh for final.

**Slow render**: Use -ql during development. Reduce Surface resolution. Shorter self.wait().

**Stale output**: `manim -ql --disable_caching script.py Scene`

**ffmpeg concat fails**: All clips must match resolution/FPS/codec.

## Common Mistakes

**Text clips at edge**: `buff >= 0.5` for `.to_edge()`

**Overlapping text**: Use `ReplacementTransform(old, new)`, not `Write(new)` on top.

**Too crowded**: Max 5-6 elements visible. Split into scenes or use opacity layering.

**No breathing room**: `self.wait(1.5)` minimum after reveals, `self.wait(2.0)` for key moments.

**Missing background color**: Set `self.camera.background_color = BG` in every scene.

## Debugging Strategy

1. Render a still: `manim -ql -s script.py Scene` -- instant layout check
2. Isolate the broken scene -- render only that one
3. Replace `self.play()` with `self.add()` to see final state instantly
4. Print positions: `print(mob.get_center())`
5. Clear cache: delete `media/` directory
