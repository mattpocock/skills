# Equations and LaTeX Reference

## Basic LaTeX

```python
eq = MathTex(r"E = mc^2")
eq = MathTex(r"f(x) &= x^2 + 2x + 1 \\ &= (x + 1)^2")  # multi-line aligned
```

**Always use raw strings (`r""`).**

## Step-by-Step Derivations

```python
step1 = MathTex(r"a^2 + b^2 = c^2")
step2 = MathTex(r"a^2 = c^2 - b^2")
self.play(Write(step1), run_time=1.5)
self.wait(1.5)
self.play(TransformMatchingTex(step1, step2), run_time=1.5)
```

## Selective Color

```python
eq = MathTex(r"a^2", r"+", r"b^2", r"=", r"c^2")
eq[0].set_color(RED)
eq[4].set_color(GREEN)
```

## Building Incrementally

```python
parts = MathTex(r"f(x)", r"=", r"\sum_{n=0}^{\infty}", r"\frac{f^{(n)}(a)}{n!}", r"(x-a)^n")
self.play(Write(parts[0:2]))
self.wait(0.5)
self.play(Write(parts[2]))
self.wait(0.5)
self.play(Write(parts[3:]))
```

## Highlighting

```python
highlight = SurroundingRectangle(eq[2], color=YELLOW, buff=0.1)
self.play(Create(highlight))
self.play(Indicate(eq[4], color=YELLOW))
```

## Annotation

```python
brace = Brace(eq, DOWN, color=YELLOW)
label = brace.get_text("Fundamental Theorem", font_size=24)
self.play(GrowFromCenter(brace), Write(label))
```

## Common LaTeX

```python
MathTex(r"\frac{a}{b}")                  # fraction
MathTex(r"\alpha, \beta, \gamma")         # Greek
MathTex(r"\sum_{i=1}^{n} x_i")           # summation
MathTex(r"\int_{0}^{\infty} e^{-x} dx")  # integral
MathTex(r"\vec{v}")                       # vector
MathTex(r"\lim_{x \to \infty} f(x)")    # limit
```

## Matrices

`MathTex` supports standard LaTeX matrix environments via `amsmath` (loaded by default):

```python
# Bracketed matrix
MathTex(r"\begin{bmatrix} 1 & 0 \\ 0 & 1 \end{bmatrix}")

# Parenthesized matrix
MathTex(r"\begin{pmatrix} a & b \\ c & d \end{pmatrix}")

# Determinant (vertical bars)
MathTex(r"\begin{vmatrix} a & b \\ c & d \end{vmatrix}")

# Plain (no delimiters)
MathTex(r"\begin{matrix} x_1 \\ x_2 \\ x_3 \end{matrix}")
```

For matrices you need to animate element-by-element or color individual entries, use the `IntegerMatrix`, `DecimalMatrix`, or `MobjectMatrix` mobjects instead — see `mobjects.md`.

## Cases and Piecewise Functions

```python
MathTex(r"""
    f(x) = \begin{cases}
        x^2    & \text{if } x \geq 0 \\
        -x^2   & \text{if } x < 0
    \end{cases}
""")
```

## Aligned Environments

For multi-line derivations with alignment, use `aligned` inside `MathTex`:

```python
MathTex(r"""
    \begin{aligned}
        \nabla \cdot \mathbf{E} &= \frac{\rho}{\epsilon_0} \\
        \nabla \cdot \mathbf{B} &= 0 \\
        \nabla \times \mathbf{E} &= -\frac{\partial \mathbf{B}}{\partial t} \\
        \nabla \times \mathbf{B} &= \mu_0 \mathbf{J} + \mu_0 \epsilon_0 \frac{\partial \mathbf{E}}{\partial t}
    \end{aligned}
""")
```

Note: `MathTex` wraps content in `align*` by default. Override with `tex_environment` if needed:
```python
MathTex(r"...", tex_environment="gather*")
```

## Derivation Pattern

```python
class DerivationScene(Scene):
    def construct(self):
        self.camera.background_color = BG
        s1 = MathTex(r"ax^2 + bx + c = 0")
        self.play(Write(s1))
        self.wait(1.5)
        s2 = MathTex(r"x^2 + \frac{b}{a}x + \frac{c}{a} = 0")
        s2.next_to(s1, DOWN, buff=0.8)
        self.play(s1.animate.set_opacity(0.4), TransformMatchingTex(s1.copy(), s2))
```

## substrings_to_isolate for Complex Equations

For dense equations where manually splitting into parts is impractical, use `substrings_to_isolate` to tell Manim which substrings to track as individual elements:

```python
# Without isolation — the whole expression is one blob
lagrangian = MathTex(
    r"\mathcal{L} = \bar{\psi}(i \gamma^\mu D_\mu - m)\psi - \tfrac{1}{4}F_{\mu\nu}F^{\mu\nu}"
)

# With isolation — each named substring is a separate submobject
lagrangian = MathTex(
    r"\mathcal{L} = \bar{\psi}(i \gamma^\mu D_\mu - m)\psi - \tfrac{1}{4}F_{\mu\nu}F^{\mu\nu}",
    substrings_to_isolate=[r"\psi", r"D_\mu", r"\gamma^\mu", r"F_{\mu\nu}"]
)
# Now you can color individual terms
lagrangian.set_color_by_tex(r"\psi", BLUE)
lagrangian.set_color_by_tex(r"F_{\mu\nu}", YELLOW)
```

Essential for `TransformMatchingTex` on complex equations — without isolation, matching fails on dense expressions.

## Multi-Line Complex Equations

For equations with multiple related lines, pass each line as a separate argument:

```python
maxwell = MathTex(
    r"\nabla \cdot \mathbf{E} = \frac{\rho}{\epsilon_0}",
    r"\nabla \times \mathbf{B} = \mu_0\mathbf{J} + \mu_0\epsilon_0\frac{\partial \mathbf{E}}{\partial t}"
).arrange(DOWN)

# Each line is a separate submobject — animate independently
self.play(Write(maxwell[0]))
self.wait(1)
self.play(Write(maxwell[1]))
```

## TransformMatchingTex with key_map

Map specific substrings between source and target equations during transformation:

```python
eq1 = MathTex(r"A^2 + B^2 = C^2")
eq2 = MathTex(r"A^2 = C^2 - B^2")

self.play(TransformMatchingTex(
    eq1, eq2,
    key_map={"+": "-"},   # map "+" in source to "-" in target
    path_arc=PI / 2,      # arc the pieces into position
))
```

## set_color_by_tex — Color by Substring

```python
eq = MathTex(r"E = mc^2")
eq.set_color_by_tex("E", BLUE)
eq.set_color_by_tex("m", RED)
eq.set_color_by_tex("c", GREEN)
```

## TransformMatchingTex with matched_keys

When matching substrings are ambiguous, specify which to align explicitly:

```python
kw = dict(font_size=72, t2c={"A": BLUE, "B": TEAL, "C": GREEN})
lines = [
    MathTex(r"A^2 + B^2 = C^2", **kw),
    MathTex(r"A^2 = C^2 - B^2", **kw),
    MathTex(r"A^2 = (C + B)(C - B)", **kw),
    MathTex(r"A = \sqrt{(C + B)(C - B)}", **kw),
]

self.play(TransformMatchingTex(
    lines[0].copy(), lines[1],
    matched_keys=["A^2", "B^2", "C^2"],  # explicitly match these
    key_map={"+": "-"},                    # map + to -
    path_arc=PI / 2,                       # arc pieces into position
))
```

Without `matched_keys`, the animation matches the longest common substrings, which can produce unexpected results on complex equations (e.g., "^2 = C^2" matching across terms).
