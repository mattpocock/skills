# Visual Design Principles

## 12 Core Principles

1. **Geometry Before Algebra** — Show the shape first, the equation second.
2. **Opacity Layering** — PRIMARY=1.0, CONTEXT=0.4, GRID=0.15. Direct attention through brightness.
3. **One New Idea Per Scene** — Each scene introduces exactly one concept.
4. **Spatial Consistency** — Same concept occupies the same screen region throughout.
5. **Color = Meaning** — Assign colors to concepts, not mobjects. If velocity is blue, it stays blue.
6. **Progressive Disclosure** — Show simplest version first, add complexity incrementally.
7. **Transform, Don't Replace** — Use Transform/ReplacementTransform to show connections.
8. **Breathing Room** — `self.wait(1.5)` minimum after showing something new.
9. **Visual Weight Balance** — Don't cluster everything on one side.
10. **Consistent Motion Vocabulary** — Pick a small set of animation types and reuse them.
11. **Dark Background, Light Content** — #1C1C1C to #2D2B55 backgrounds maximize contrast.
12. **Intentional Empty Space** — Leave at least 15% of the frame empty.

## Layout Templates

### FULL_CENTER
One main element centered, title above, note below.
Best for: single equations, single diagrams, title cards.

### LEFT_RIGHT
Two elements side by side at x=-3.5 and x=3.5.
Best for: equation + visual, before/after, comparison.

### TOP_BOTTOM
Main element at y=1.5, supporting content at y=-1.5.
Best for: concept + examples, theorem + cases.

### GRID
Multiple elements via `arrange_in_grid()`.
Best for: comparison matrices, multi-step processes.

### PROGRESSIVE
Elements appear one at a time, arranged DOWN with aligned_edge=LEFT.
Best for: algorithms, proofs, step-by-step processes.

### ANNOTATED_DIAGRAM
Central diagram with floating labels connected by arrows.
Best for: architecture diagrams, annotated figures.

## Color Palettes

### Classic 3B1B
```python
BG="#1C1C1C"; PRIMARY=BLUE; SECONDARY=GREEN; ACCENT=YELLOW; HIGHLIGHT=RED
```

### Warm Academic
```python
BG="#2D2B55"; PRIMARY="#FF6B6B"; SECONDARY="#FFD93D"; ACCENT="#6BCB77"
```

### Neon Tech
```python
BG="#0A0A0A"; PRIMARY="#00F5FF"; SECONDARY="#FF00FF"; ACCENT="#39FF14"
```

## Font Selection

**Use monospace fonts for all text.** Manim's Pango text renderer produces broken kerning with proportional fonts (Helvetica, Inter, SF Pro, Arial) at all sizes and resolutions. Characters overlap and spacing is inconsistent. This is a fundamental Pango limitation, not a Manim bug.

Monospace fonts have fixed character widths — zero kerning issues by design.

### Recommended Fonts

| Use case | Font | Fallback |
|----------|------|----------|
| **All text (default)** | `"Menlo"` | `"Courier New"`, `"DejaVu Sans Mono"` |
| Code, labels | `"JetBrains Mono"`, `"SF Mono"` | `"Menlo"` |
| Math | Use `MathTex` (renders via LaTeX, not Pango) | — |

```python
MONO = "Menlo"  # define once at top of file

title = Text("Fourier Series", font_size=48, color=PRIMARY, weight=BOLD, font=MONO)
label = Text("n=1: (4/pi) sin(x)", font_size=20, color=BLUE, font=MONO)
note = Text("Convergence at discontinuities", font_size=18, color=DIM, font=MONO)

# Math — always use MathTex, not Text
equation = MathTex(r"\nabla L = \frac{\partial L}{\partial w}")
```

### When Proportional Fonts Are Acceptable

Large title text (font_size >= 48) with short strings (1-3 words) can use proportional fonts without visible kerning issues. For anything else — labels, descriptions, multi-word text, small sizes — use monospace.

### Font Availability

- **macOS**: Menlo (pre-installed), SF Mono
- **Linux**: DejaVu Sans Mono (pre-installed), Liberation Mono
- **Cross-platform**: JetBrains Mono (install from jetbrains.com)

`"Menlo"` is the safest default — pre-installed on macOS, and Linux systems fall back to DejaVu Sans Mono.

### Fine-Grained Text Control

`Text()` does not support `letter_spacing` or kerning parameters. For fine control, use `MarkupText` with Pango attributes:

```python
# Letter spacing (Pango units: 1/1024 of a point)
MarkupText('<span letter_spacing="6000">HERMES</span>', font_size=18, font="Menlo")

# Bold specific words
MarkupText('This is <b>important</b>', font_size=24, font="Menlo")

# Color specific words
MarkupText('Red <span foreground="#FF6B6B">warning</span>', font_size=24, font="Menlo")
```

### Minimum Font Size

`font_size=18` is the minimum for readable text at any resolution. Below 18, characters become blurry at `-ql` and barely readable even at `-qh`.

## Visual Hierarchy Checklist

For every frame:
1. What is the ONE thing to look at? (brightest/largest)
2. What is context? (dimmed to 0.3-0.4)
3. What is structural? (dimmed to 0.15)
4. Enough empty space? (>15%)
5. All text readable at phone size?
