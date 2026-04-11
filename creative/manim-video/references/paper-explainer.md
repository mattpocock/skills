# Paper Explainer Workflow

How to turn a research paper into an animated explainer video.

## Why animate a paper?

A research paper is optimized for precision and completeness. A video is optimized for understanding and retention. The translation is NOT "read the paper aloud with pictures" — it's "extract the core insight and make it feel obvious through visual storytelling."

The paper has one job: prove the claim is true. The video has a different job: make the viewer understand WHY the claim is true, and WHY it matters.

## Who is watching?

Before anything, decide the audience:

| Audience | Prerequisites | Pacing | Depth |
|----------|--------------|--------|-------|
| General public | None | Slow, many analogies | Intuition only, skip proofs |
| Undergrad students | Basic math/CS | Medium, some formalism | Key equations, skip derivations |
| Grad students / researchers | Domain knowledge | Faster, more notation | Full equations, sketch proofs |

This determines everything: vocabulary, pacing, which sections to animate, how much math to show.

## The 5-minute template

Most paper explainers fit this structure (scale times proportionally for longer videos):

| Section | Duration | Purpose |
|---------|----------|---------|
| **Hook** | 0:00-0:30 | Surprising result or provocative question |
| **Problem** | 0:30-1:30 | What was broken/missing before this paper |
| **Key insight** | 1:30-3:00 | The core idea, explained visually |
| **How it works** | 3:00-4:00 | Method/algorithm, simplified |
| **Evidence** | 4:00-4:30 | Key result that proves it works |
| **Implications** | 4:30-5:00 | Why it matters, what it enables |

### What to skip

- Related work survey → one sentence: "Previous approaches did X, which had problem Y"
- Implementation details → skip unless they're the contribution
- Ablation studies → show one chart at most
- Proofs → show the key step, not the full proof
- Hyperparameter tuning → skip entirely

### What to expand

- The core insight → this gets the most screen time
- Geometric/visual intuition → if the paper has math, show what it MEANS
- Before/after comparison → the most compelling evidence

## Pre-code workflow

### Gate 1: Narration script

Write the full narration before any code. Every sentence maps to a visual beat. If you can't write the narration, you don't understand the paper well enough to animate it.

```markdown
## Hook (30s)
"What if I told you that a model with 7 billion parameters can outperform
one with 70 billion — if you train it on the right data?"

## Problem (60s)
"The standard approach is to scale up. More parameters, more compute.
[VISUAL: bar chart showing model sizes growing exponentially]
But Chinchilla showed us that most models are undertrained..."
```

### Gate 2: Scene list

After the narration, break it into scenes. Each scene is one Manim class.

```markdown
Scene 1: Hook — surprising stat with animated counter
Scene 2: Problem — model size bar chart growing
Scene 3: Key insight — training data vs parameters, animated 2D plot
Scene 4: Method — pipeline diagram building left to right
Scene 5: Results — before/after comparison with animated bars
Scene 6: Closing — implications text
```

### Gate 3: Style constants

Before coding scenes, define the visual language:

```python
# style.py — import in every scene file
BG = "#0D1117"
PRIMARY = "#58C4DD"
SECONDARY = "#83C167"
ACCENT = "#FFFF00"
HIGHLIGHT = "#FF6B6B"
MONO = "Menlo"

# Color meanings for THIS paper
MODEL_COLOR = PRIMARY      # "the model"
DATA_COLOR = SECONDARY     # "training data"
BASELINE_COLOR = HIGHLIGHT # "previous approach"
RESULT_COLOR = ACCENT      # "our result"
```

## First-principles equation explanation

When the paper has a key equation, don't just show it — build it from intuition:

### The "what would you do?" pattern

1. Pose the problem in plain language
2. Ask what the simplest solution would be
3. Show why it doesn't work (animate the failure)
4. Introduce the paper's solution as the fix
5. THEN show the equation — it now feels earned

```python
# Scene: Why we need attention (for a Transformer paper)
# Step 1: "How do we let each word look at every other word?"
# Step 2: Show naive approach (fully connected = O(n²) everything)
# Step 3: Show it breaks (information overload, no selectivity)
# Step 4: "What if each word could CHOOSE which words to attend to?"
# Step 5: Show attention equation — Q, K, V now mean something
```

### Equation reveal strategy

```python
# Show equation dimmed first (full destination)
eq = MathTex(r"Attention(Q,K,V) = softmax\left(\frac{QK^T}{\sqrt{d_k}}\right)V")
eq.set_opacity(0.15)
self.play(FadeIn(eq))

# Highlight Q, K, V one at a time with color + label
for part, color, label_text in [
    (r"Q", PRIMARY, "Query: what am I looking for?"),
    (r"K", SECONDARY, "Key: what do I contain?"),
    (r"V", ACCENT, "Value: what do I output?"),
]:
    eq.set_color_by_tex(part, color)
    label = Text(label_text, font_size=18, color=color, font=MONO)
    # position label, animate it, wait, then dim it
```

## Building architecture diagrams

### The progressive build pattern

Don't show the full architecture at once. Build it:

1. First component appears alone → explain
2. Arrow grows → "this feeds into..."
3. Second component appears → explain
4. Repeat until complete

```python
# Component factory
def make_box(label, color, width=2.0, height=0.8):
    box = RoundedRectangle(corner_radius=0.1, width=width, height=height,
                           color=color, fill_opacity=0.1, stroke_width=1.5)
    text = Text(label, font_size=18, font=MONO, color=color).move_to(box)
    return Group(box, text)

encoder = make_box("Encoder", PRIMARY)
decoder = make_box("Decoder", SECONDARY).next_to(encoder, RIGHT, buff=1.5)
arrow = Arrow(encoder.get_right(), decoder.get_left(), color=DIM, stroke_width=1.5)

self.play(FadeIn(encoder))
self.wait(1)  # explain encoder
self.play(GrowArrow(arrow))
self.play(FadeIn(decoder))
self.wait(1)  # explain decoder
```

### Data flow animation

After building the diagram, show data moving through it:

```python
# Dot traveling along the pipeline
data_dot = Dot(color=ACCENT, radius=0.1).move_to(encoder)
self.play(FadeIn(data_dot))
self.play(MoveAlongPath(data_dot, arrow), run_time=1)
self.play(data_dot.animate.move_to(decoder), run_time=0.5)
self.play(Flash(data_dot.get_center(), color=ACCENT), run_time=0.3)
```

## Animating results

### Bar chart comparison (most common)

```python
# Before/after bars
before_data = [45, 52, 38, 61]
after_data = [78, 85, 72, 91]
labels = ["Task A", "Task B", "Task C", "Task D"]

before_chart = BarChart(before_data, bar_names=labels,
    y_range=[0, 100, 20], bar_colors=[HIGHLIGHT]*4).scale(0.6).shift(LEFT*3)
after_chart = BarChart(after_data, bar_names=labels,
    y_range=[0, 100, 20], bar_colors=[SECONDARY]*4).scale(0.6).shift(RIGHT*3)

before_label = Text("Baseline", font_size=20, color=HIGHLIGHT, font=MONO)
after_label = Text("Ours", font_size=20, color=SECONDARY, font=MONO)

# Reveal baseline first, then ours (dramatic comparison)
self.play(Create(before_chart), FadeIn(before_label))
self.wait(1.5)
self.play(Create(after_chart), FadeIn(after_label))
self.wait(0.5)

# Highlight the improvement
improvement = Text("+35% avg", font_size=24, color=ACCENT, font=MONO)
self.play(FadeIn(improvement))
```

### Training curve (for ML papers)

```python
tracker = ValueTracker(0)
curve = always_redraw(lambda: axes.plot(
    lambda x: 1 - 0.8 * np.exp(-x / 3),
    x_range=[0, tracker.get_value()], color=PRIMARY
))
epoch_label = always_redraw(lambda: Text(
    f"Epoch {int(tracker.get_value())}", font_size=18, font=MONO
).to_corner(UR))

self.add(curve, epoch_label)
self.play(tracker.animate.set_value(10), run_time=5, rate_func=linear)
```

## Domain-specific patterns

### ML papers
- Show data flow through the model (animated pipeline)
- Training curves with `ValueTracker`
- Attention heatmaps as colored grids
- Embedding space as 2D scatter (PCA/t-SNE visualization)
- Loss landscape as 3D surface with gradient descent dot

### Physics/math papers
- Use `LinearTransformationScene` for linear algebra
- Vector fields with `ArrowVectorField` / `StreamLines`
- Phase spaces with `NumberPlane` + trajectories
- Wave equations with time-parameterized plots

### Systems/architecture papers
- Pipeline diagrams built progressively
- `ShowPassingFlash` for data flow along arrows
- `ZoomedScene` for zooming into components
- Before/after latency/throughput comparisons

## Common mistakes

1. **Trying to cover the whole paper.** A 5-minute video can explain ONE core insight well. Covering everything means explaining nothing.
2. **Reading the abstract as narration.** Academic writing is designed for readers, not listeners. Rewrite in conversational language.
3. **Showing notation without meaning.** Never show a symbol without first showing what it represents visually.
4. **Skipping the motivation.** Jumping straight to "here's our method" without showing why the problem matters. The Problem section is what makes the viewer care.
5. **Identical pacing throughout.** The hook and key insight need the most visual energy. The method section can be faster. Evidence should land with impact (pause after showing the big number).
