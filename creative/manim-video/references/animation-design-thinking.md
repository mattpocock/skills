# Animation Design Thinking

How to decide WHAT to animate and HOW to structure it — before writing any code.

## Should I animate this?

Not everything benefits from animation. Motion adds cognitive load. Bad animation is worse than a good static diagram.

**Animate when:**
- A sequence unfolds over time (algorithm steps, derivation, pipeline stages)
- Spatial relationships change (transformation, deformation, rotation)
- Something is built from parts (construction, assembly, accumulation)
- You're comparing states (before/after, method A vs method B)
- Temporal evolution is the point (training curves, wave propagation, gradient descent)

**Show static when:**
- The concept is a single labeled diagram (circuit, anatomy, architecture overview)
- Motion would distract from spatial layout
- The viewer needs to study it carefully (dense table, reference chart)
- The concept is already intuitive from a well-labeled figure

**Rule of thumb:** If you'd explain it with "first X, then Y, then Z" — animate it. If you'd explain it by pointing at parts of one picture — show it static.

## Decomposing a concept into animation

### Step 1: Write the narration first

Before any code, write what the narrator would say. This determines:
- **Order** — what concept comes first
- **Duration** — how long each idea gets
- **Visuals** — what the viewer must SEE when they HEAR each sentence

A scene where the narration says "the gradient points uphill" must show a gradient arrow at that moment. If the visual doesn't match the audio, the viewer's brain splits attention and both tracks are lost.

### Step 2: Identify visual beats

A "beat" is a moment where something changes on screen. Mark each beat in your narration:

```
"Consider a function f of x."         → [BEAT: axes + curve appear]
"At this point..."                     → [BEAT: dot appears on curve]
"...the slope is positive."            → [BEAT: tangent line drawn]
"So the gradient tells us to go left." → [BEAT: arrow points left, dot moves]
```

Each beat is one `self.play()` call or a small group of simultaneous animations.

### Step 3: Choose the right tool per beat

| Visual need | Manim approach |
|-------------|----------------|
| Object appears for first time | `Create`, `Write`, `FadeIn`, `GrowFromCenter` |
| Object transforms into another | `Transform`, `ReplacementTransform`, `FadeTransform` |
| Attention drawn to existing object | `Indicate`, `Circumscribe`, `Flash`, `ShowPassingFlash` |
| Continuous relationship maintained | `add_updater`, `always_redraw`, `ValueTracker` |
| Object leaves the scene | `FadeOut`, `Uncreate`, `ShrinkToCenter` |
| Static context that stays visible | `self.add()` (no animation) |

## Pacing: the universal mistake is too fast

### Timing rules

| Content type | Minimum on-screen time |
|-------------|----------------------|
| New equation appearing | 2.0s animation + 2.0s pause |
| New concept label | 1.0s animation + 1.0s pause |
| Key insight ("aha moment") | 2.5s animation + 3.0s pause |
| Supporting annotation | 0.8s animation + 0.5s pause |
| Scene transition (FadeOut all) | 0.5s animation + 0.3s pause |

### Breathing room

After every reveal, add `self.wait()`. The viewer needs time to:
1. Read the new text
2. Connect it to what's already on screen
3. Form an expectation about what comes next

**No wait = the viewer is always behind you.** They're still reading the equation when you've already started transforming it.

### Tempo variation

Monotonous pacing feels like a lecture. Vary the tempo:
- **Slow build** for core concepts (long run_time, long pauses)
- **Quick succession** for supporting details (short run_time, minimal pauses)
- **Dramatic pause** before the key reveal (extra `self.wait(2.0)` before the "aha")
- **Rapid montage** for "and this applies to X, Y, Z..." sequences (`LaggedStart` with tight lag_ratio)

## Narration synchronization

### The "see then hear" principle

The visual should appear slightly BEFORE the narration describes it. When the viewer sees a circle appear and THEN hears "consider a circle," the visual primes their brain for the concept. The reverse — hearing first, seeing second — creates confusion because they're searching the screen for something that isn't there yet.

### Practical timing

```python
# Scene duration should match narration duration.
# If narration for this scene is 8 seconds:
# Total animation run_times + total self.wait() times = ~8 seconds.

# Use manim-voiceover for automatic sync:
with self.voiceover(text="The gradient points downhill") as tracker:
    self.play(GrowArrow(gradient_arrow), run_time=tracker.duration)
```

## Equation decomposition strategy

### The "dim and reveal" pattern

When building a complex equation step by step:
1. Show the full equation dimmed at `opacity=0.2` (sets expectation for where you're going)
2. Highlight the first term at full opacity
3. Explain it
4. Highlight the next term, dim the first to `0.5` (it's now context)
5. Repeat until the full equation is bright

This is better than building left-to-right because the viewer always sees the destination.

### Term ordering

Animate terms in the order the viewer needs to understand them, not in the order they appear in the equation. For `E = mc²`:
- Show `E` (the thing we want to know)
- Then `m` (the input)
- Then `c²` (the constant that makes it work)
- Then the `=` (connecting them)

## Architecture and pipeline diagrams

### Box granularity

The most common mistake: too many boxes. Each box is a concept the viewer must track. Five boxes with clear labels beats twelve boxes with abbreviations.

**Rule:** If two consecutive boxes could be labeled "X" and "process X output," merge them into one box.

### Animation strategy

Build pipelines left-to-right (or top-to-bottom) with arrows connecting them:
1. First box appears alone → explain it
2. Arrow grows from first to second → "the output feeds into..."
3. Second box appears → explain it
4. Repeat

Then show data flowing through: `ShowPassingFlash` along the arrows, or a colored dot traversing the path.

### The zoom-and-return pattern

For complex systems:
1. Show the full overview (all boxes, small)
2. Zoom into one box (`MovingCameraScene.camera.frame.animate`)
3. Expand that box into its internal components
4. Zoom back out to the overview
5. Zoom into the next box

## Common design mistakes

1. **Animating everything at once.** The viewer can track 1-2 simultaneous animations. More than that and nothing registers.
2. **No visual hierarchy.** Everything at the same opacity/size/color means nothing stands out. Use opacity layering.
3. **Equations without context.** An equation appearing alone means nothing. Always show the geometric/visual interpretation first or simultaneously.
4. **Skipping the "why."** Showing HOW a transformation works without WHY it matters. Add a sentence/label explaining the purpose.
5. **Identical pacing throughout.** Every animation at run_time=1.5, every wait at 1.0. Vary it.
6. **Forgetting the audience.** A video for high schoolers needs different pacing and complexity than one for PhD students. Decide the audience in the planning phase.
