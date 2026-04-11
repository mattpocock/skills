# Scene System & Creative Composition

> **See also:** architecture.md · composition.md · effects.md · shaders.md

## Scene Design Philosophy

Scenes are storytelling units, not effect demos. Every scene needs:
- A **concept** — what is happening visually? Not "plasma + rings" but "emergence from void" or "crystallization"
- An **arc** — how does it change over its duration? Build, decay, transform, reveal?
- A **role** — how does it serve the larger video narrative? Opening tension, peak energy, resolution?

The design patterns below provide compositional techniques. The scene examples show them in practice at increasing complexity. The protocol section covers the technical contract.

Good scene design starts with the concept, then selects effects and parameters that serve it. The design patterns section shows *how* to compose layers intentionally. The examples section shows complete working scenes at every complexity level. The protocol section covers the technical contract that all scenes must follow.

---

## Scene Design Patterns

Higher-order patterns for composing scenes that feel intentional rather than random. These patterns use the existing building blocks (value fields, blend modes, shaders, feedback) but organize them with compositional intent.

## Layer Hierarchy

Every scene should have clear visual layers with distinct roles:

| Layer | Grid | Brightness | Purpose |
|-------|------|-----------|---------|
| **Background** | xs or sm (dense) | 0.1–0.25 | Atmosphere, texture. Never competes with content. |
| **Content** | md (balanced) | 0.4–0.8 | The main visual idea. Carries the scene's concept. |
| **Accent** | lg or sm (sparse) | 0.5–1.0 (sparse coverage) | Highlights, punctuation, sparse bright points. |

The background sets mood. The content layer is what the scene *is about*. The accent adds visual interest without overwhelming.

```python
def fx_example(r, f, t, S):
    local = t
    progress = min(local / 5.0, 1.0)

    g_bg = r.get_grid("sm")
    g_main = r.get_grid("md")
    g_accent = r.get_grid("lg")

    # --- Background: dim atmosphere ---
    bg_val = vf_smooth_noise(g_bg, f, t * 0.3, S, octaves=2, bri=0.15)
    # ... render bg to canvas

    # --- Content: the main visual idea ---
    content_val = vf_spiral(g_main, f, t, S, n_arms=n_arms, tightness=tightness)
    # ... render content on top of canvas

    # --- Accent: sparse highlights ---
    accent_val = vf_noise_static(g_accent, f, t, S, density=0.05)
    # ... render accent on top

    return canvas
```

## Directional Parameter Arcs

Parameters should *go somewhere* over the scene's duration — not oscillate aimlessly with `sin(t * N)`.

**Bad:** `twist = 3.0 + 2.0 * math.sin(t * 0.6)` — wobbles back and forth, feels aimless.

**Good:** `twist = 2.0 + progress * 5.0` — starts gentle, ends intense. The scene *builds*.

Use `progress = min(local / duration, 1.0)` (0→1 over the scene) to drive directional change:

| Pattern | Formula | Feel |
|---------|---------|------|
| Linear ramp | `progress * range` | Steady buildup |
| Ease-out | `1 - (1 - progress) ** 2` | Fast start, gentle finish |
| Ease-in | `progress ** 2` | Slow start, accelerating |
| Step reveal | `np.clip((progress - 0.5) / 0.25, 0, 1)` | Nothing until 50%, then fades in |
| Build + plateau | `min(1.0, progress * 1.5)` | Reaches full at 67%, holds |

Oscillation is fine for *secondary* parameters (saturation shimmer, hue drift). But the *defining* parameter of the scene should have a direction.

### Examples of Directional Arcs

| Scene concept | Parameter | Arc |
|--------------|-----------|-----|
| Emergence | Ring radius | 0 → max (ease-out) |
| Shatter | Voronoi cell count | 8 → 38 (linear) |
| Descent | Tunnel speed | 2.0 → 10.0 (linear) |
| Mandala | Shape complexity | ring → +polygon → +star → +rosette (step reveals) |
| Crescendo | Layer count | 1 → 7 (staggered entry) |
| Entropy | Geometry visibility | 1.0 → 0.0 (consumed) |

## Scene Concepts

Each scene should be built around a *visual idea*, not an effect name.

**Bad:** "fx_plasma_cascade" — named after the effect. No concept.
**Good:** "fx_emergence" — a point of light expands into a field. The name tells you *what happens*.

Good scene concepts have:
1. A **visual metaphor** (emergence, descent, collision, entropy)
2. A **directional arc** (things change from A to B, not oscillate)
3. **Motivated layer choices** (each layer serves the concept)
4. **Motivated feedback** (transform direction matches the metaphor)

| Concept | Metaphor | Feedback transform | Why |
|---------|----------|-------------------|-----|
| Emergence | Birth, expansion | zoom-out | Past frames expand outward |
| Descent | Falling, acceleration | zoom-in | Past frames rush toward center |
| Inferno | Rising fire | shift-up | Past frames rise with the flames |
| Entropy | Decay, dissolution | none | Clean, no persistence — things disappear |
| Crescendo | Accumulation | zoom + hue_shift | Everything compounds and shifts |

## Compositional Techniques

### Counter-Rotating Dual Systems

Two instances of the same effect rotating in opposite directions create visual interference:

```python
# Primary spiral (clockwise)
s1_val = vf_spiral(g_main, f, t * 1.5, S, n_arms=n_arms_1, tightness=tightness_1)

# Counter-rotating spiral (counter-clockwise via negative time)
s2_val = vf_spiral(g_accent, f, -t * 1.2, S, n_arms=n_arms_2, tightness=tightness_2)

# Screen blend creates bright interference at crossing points
canvas = blend_canvas(canvas_with_s1, c2, "screen", 0.7)
```

Works with spirals, vortexes, rings. The counter-rotation creates constantly shifting interference patterns.

### Wave Collision

Two wave fronts converging from opposite sides, meeting at a collision point:

```python
collision_phase = abs(progress - 0.5) * 2  # 1→0→1 (0 at collision)

# Wave A approaches from left
offset_a = (1 - progress) * g.cols * 0.4
wave_a = np.sin((g.cc + offset_a) * 0.08 + t * 2) * 0.5 + 0.5

# Wave B approaches from right
offset_b = -(1 - progress) * g.cols * 0.4
wave_b = np.sin((g.cc + offset_b) * 0.08 - t * 2) * 0.5 + 0.5

# Interference peaks at collision
combined = wave_a * 0.5 + wave_b * 0.5 + np.abs(wave_a - wave_b) * (1 - collision_phase) * 0.5
```

### Progressive Fragmentation

Voronoi with cell count increasing over time — visual shattering:

```python
n_pts = int(8 + progress * 30)  # 8 cells → 38 cells
# Pre-generate enough points, slice to n_pts
px = base_x[:n_pts] + np.sin(t * 0.3 + np.arange(n_pts) * 0.7) * (3 + progress * 3)
```

The edge glow width can also increase with progress to emphasize the cracks.

### Entropy / Consumption

A clean geometric pattern being overtaken by an organic process:

```python
# Geometry fades out
geo_val = clean_pattern * max(0.05, 1.0 - progress * 0.9)

# Organic process grows in
rd_val = vf_reaction_diffusion(g, f, t, S) * min(1.0, progress * 1.5)

# Render geometry first, organic on top — organic consumes geometry
```

### Staggered Layer Entry (Crescendo)

Layers enter one at a time, building to overwhelming density:

```python
def layer_strength(enter_t, ramp=1.5):
    """0.0 until enter_t, ramps to 1.0 over ramp seconds."""
    return max(0.0, min(1.0, (local - enter_t) / ramp))

# Layer 1: always present
s1 = layer_strength(0.0)
# Layer 2: enters at 2s
s2 = layer_strength(2.0)
# Layer 3: enters at 4s
s3 = layer_strength(4.0)
# ... etc

# Each layer uses a different effect, grid, palette, and blend mode
# Screen blend between layers so they accumulate light
```

For a 15-second crescendo, 7 layers entering every 2 seconds works well. Use different blend modes (screen for most, add for energy, colordodge for the final wash).

## Scene Ordering

For a multi-scene reel or video:
- **Vary mood between adjacent scenes** — don't put two calm scenes next to each other
- **Randomize order** rather than grouping by type — prevents "effect demo" feel
- **End on the strongest scene** — crescendo or something with a clear payoff
- **Open with energy** — grab attention in the first 2 seconds

---

## Scene Protocol

Scenes are the top-level creative unit. Each scene is a time-bounded segment with its own effect function, shader chain, feedback configuration, and tone-mapping gamma.

### Scene Protocol (v2)

### Function Signature

```python
def fx_scene_name(r, f, t, S) -> canvas:
    """
    Args:
        r: Renderer instance — access multiple grids via r.get_grid("sm")
        f: dict of audio/video features, all values normalized to [0, 1]
        t: time in seconds — local to scene (0.0 at scene start)
        S: dict for persistent state (particles, rain columns, etc.)

    Returns:
        canvas: numpy uint8 array, shape (VH, VW, 3) — full pixel frame
    """
```

**Local time convention:** Scene functions receive `t` starting at 0.0 for the first frame of the scene, regardless of where the scene appears in the timeline. The render loop subtracts the scene's start time before calling the function:

```python
# In render_clip:
t_local = fi / FPS - scene_start
canvas = fx_fn(r, feat, t_local, S)
```

This makes scenes reorderable without modifying their code. Compute scene progress as:

```python
progress = min(t / scene_duration, 1.0)  # 0→1 over the scene
```

This replaces the v1 protocol where scenes returned `(chars, colors)` tuples. The v2 protocol gives scenes full control over multi-grid rendering and pixel-level composition internally.

### The Renderer Class

```python
class Renderer:
    def __init__(self):
        self.grids = {}   # lazy-initialized grid cache
        self.g = None      # "active" grid (for backward compat)
        self.S = {}        # persistent state dict

    def get_grid(self, key):
        """Get or create a GridLayer by size key."""
        if key not in self.grids:
            sizes = {"xs": 8, "sm": 10, "md": 16, "lg": 20, "xl": 24, "xxl": 40}
            self.grids[key] = GridLayer(FONT_PATH, sizes[key])
        return self.grids[key]

    def set_grid(self, key):
        """Set active grid (legacy). Prefer get_grid() for multi-grid scenes."""
        self.g = self.get_grid(key)
        return self.g
```

**Key difference from v1**: scenes call `r.get_grid("sm")`, `r.get_grid("lg")`, etc. to access multiple grids. Each grid is lazy-initialized and cached. The `set_grid()` method still works for single-grid scenes.

### Minimal Scene (Single Grid)

```python
def fx_simple_rings(r, f, t, S):
    """Single-grid scene: rings with distance-mapped hue."""
    canvas = _render_vf(r, "md",
        lambda g, f, t, S: vf_rings(g, f, t, S, n_base=8, spacing_base=3),
        hf_distance(0.3, 0.02), PAL_STARS, f, t, S, sat=0.85)
    return canvas
```

### Standard Scene (Two Grids + Blend)

```python
def fx_tunnel_ripple(r, f, t, S):
    """Two-grid scene: tunnel depth exclusion-blended with ripple."""
    canvas_a = _render_vf(r, "md",
        lambda g, f, t, S: vf_tunnel(g, f, t, S, speed=5.0, complexity=10) * 1.3,
        hf_distance(0.55, 0.02), PAL_GREEK, f, t, S, sat=0.7)

    canvas_b = _render_vf(r, "sm",
        lambda g, f, t, S: vf_ripple(g, f, t, S,
            sources=[(0.3,0.3), (0.7,0.7), (0.5,0.2)], freq=0.5, damping=0.012) * 1.4,
        hf_angle(0.1), PAL_STARS, f, t, S, sat=0.8)

    return blend_canvas(canvas_a, canvas_b, "exclusion", 0.8)
```

### Complex Scene (Three Grids + Conditional + Custom Rendering)

```python
def fx_rings_explosion(r, f, t, S):
    """Three-grid scene with particles and conditional kaleidoscope."""
    # Layer 1: rings
    canvas_a = _render_vf(r, "sm",
        lambda g, f, t, S: vf_rings(g, f, t, S, n_base=10, spacing_base=2) * 1.4,
        lambda g, f, t, S: (g.angle / (2*np.pi) + t * 0.15) % 1.0,
        PAL_STARS, f, t, S, sat=0.9)

    # Layer 2: vortex on different grid
    canvas_b = _render_vf(r, "md",
        lambda g, f, t, S: vf_vortex(g, f, t, S, twist=6.0) * 1.2,
        hf_time_cycle(0.15), PAL_BLOCKS, f, t, S, sat=0.8)

    result = blend_canvas(canvas_b, canvas_a, "screen", 0.7)

    # Layer 3: particles (custom rendering, not _render_vf)
    g = r.get_grid("sm")
    if "px" not in S:
        S["px"], S["py"], S["vx"], S["vy"], S["life"], S["pch"] = (
            [], [], [], [], [], [])
    if f.get("beat", 0) > 0.5:
        chars = list("\u2605\u2736\u2733\u2738\u2726\u2728*+")
        for _ in range(int(80 + f.get("rms", 0.3) * 120)):
            ang = random.uniform(0, 2 * math.pi)
            sp = random.uniform(1, 10) * (0.5 + f.get("sub_r", 0.3) * 2)
            S["px"].append(float(g.cols // 2))
            S["py"].append(float(g.rows // 2))
            S["vx"].append(math.cos(ang) * sp * 2.5)
            S["vy"].append(math.sin(ang) * sp)
            S["life"].append(1.0)
            S["pch"].append(random.choice(chars))

    # Update + draw particles
    ch_p = np.full((g.rows, g.cols), " ", dtype="U1")
    co_p = np.zeros((g.rows, g.cols, 3), dtype=np.uint8)
    i = 0
    while i < len(S["px"]):
        S["px"][i] += S["vx"][i]; S["py"][i] += S["vy"][i]
        S["vy"][i] += 0.03; S["life"][i] -= 0.02
        if S["life"][i] <= 0:
            for k in ("px","py","vx","vy","life","pch"): S[k].pop(i)
        else:
            pr, pc = int(S["py"][i]), int(S["px"][i])
            if 0 <= pr < g.rows and 0 <= pc < g.cols:
                ch_p[pr, pc] = S["pch"][i]
                co_p[pr, pc] = hsv2rgb_scalar(
                    0.08 + (1-S["life"][i])*0.15, 0.95, S["life"][i])
            i += 1

    canvas_p = g.render(ch_p, co_p)
    result = blend_canvas(result, canvas_p, "add", 0.8)

    # Conditional kaleidoscope on strong beats
    if f.get("bdecay", 0) > 0.4:
        result = sh_kaleidoscope(result.copy(), folds=6)

    return result
```

### Scene with Custom Character Rendering (Matrix Rain)

When you need per-cell control beyond what `_render_vf()` provides:

```python
def fx_matrix_layered(r, f, t, S):
    """Matrix rain blended with tunnel — two grids, screen blend."""
    # Layer 1: Matrix rain (custom per-column rendering)
    g = r.get_grid("md")
    rows, cols = g.rows, g.cols
    pal = PAL_KATA

    if "ry" not in S or len(S["ry"]) != cols:
        S["ry"] = np.random.uniform(-rows, rows, cols).astype(np.float32)
        S["rsp"] = np.random.uniform(0.3, 2.0, cols).astype(np.float32)
        S["rln"] = np.random.randint(8, 35, cols)
        S["rch"] = np.random.randint(1, len(pal), (rows, cols))

    speed = 0.6 + f.get("bass", 0.3) * 3
    if f.get("beat", 0) > 0.5: speed *= 2.5
    S["ry"] += S["rsp"] * speed

    ch = np.full((rows, cols), " ", dtype="U1")
    co = np.zeros((rows, cols, 3), dtype=np.uint8)
    heads = S["ry"].astype(int)
    for c in range(cols):
        head = heads[c]
        for i in range(S["rln"][c]):
            row = head - i
            if 0 <= row < rows:
                fade = 1.0 - i / S["rln"][c]
                ch[row, c] = pal[S["rch"][row, c] % len(pal)]
                if i == 0:
                    v = int(min(255, fade * 300))
                    co[row, c] = (int(v*0.9), v, int(v*0.9))
                else:
                    v = int(fade * 240)
                    co[row, c] = (int(v*0.1), v, int(v*0.4))
    canvas_a = g.render(ch, co)

    # Layer 2: Tunnel on sm grid for depth texture
    canvas_b = _render_vf(r, "sm",
        lambda g, f, t, S: vf_tunnel(g, f, t, S, speed=5.0, complexity=10),
        hf_distance(0.3, 0.02), PAL_BLOCKS, f, t, S, sat=0.6)

    return blend_canvas(canvas_a, canvas_b, "screen", 0.5)
```

---

## Scene Table

The scene table defines the timeline: which scene plays when, with what configuration.

### Structure

```python
SCENES = [
    {
        "start": 0.0,           # start time in seconds
        "end": 3.96,            # end time in seconds
        "name": "starfield",    # identifier (used for clip filenames)
        "grid": "sm",           # default grid (for render_clip setup)
        "fx": fx_starfield,     # scene function reference (must be module-level)
        "gamma": 0.75,          # tonemap gamma override (default 0.75)
        "shaders": [            # shader chain (applied after tonemap + feedback)
            ("bloom", {"thr": 120}),
            ("vignette", {"s": 0.2}),
            ("grain", {"amt": 8}),
        ],
        "feedback": None,       # feedback buffer config (None = disabled)
        # "feedback": {"decay": 0.8, "blend": "screen", "opacity": 0.3,
        #              "transform": "zoom", "transform_amt": 0.02, "hue_shift": 0.02},
    },
    {
        "start": 3.96,
        "end": 6.58,
        "name": "matrix_layered",
        "grid": "md",
        "fx": fx_matrix_layered,
        "shaders": [
            ("crt", {"strength": 0.05}),
            ("scanlines", {"intensity": 0.12}),
            ("color_grade", {"tint": (0.7, 1.2, 0.7)}),
            ("bloom", {"thr": 100}),
        ],
        "feedback": {"decay": 0.5, "blend": "add", "opacity": 0.2},
    },
    # ... more scenes ...
]
```

### Beat-Synced Scene Cutting

Derive cut points from audio analysis:

```python
# Get beat timestamps
beats = [fi / FPS for fi in range(N_FRAMES) if features["beat"][fi] > 0.5]

# Group beats into phrase boundaries (every 4-8 beats)
cuts = [0.0]
for i in range(0, len(beats), 4):  # cut every 4 beats
    cuts.append(beats[i])
cuts.append(DURATION)

# Or use the music's structure: silence gaps, energy changes
energy = features["rms"]
# Find timestamps where energy drops significantly -> natural break points
```

### `render_clip()` — The Render Loop

This function renders one scene to a clip file:

```python
def render_clip(seg, features, clip_path):
    r = Renderer()
    r.set_grid(seg["grid"])
    S = r.S
    random.seed(hash(seg["id"]) + 42)  # deterministic per scene

    # Build shader chain from config
    chain = ShaderChain()
    for shader_name, kwargs in seg.get("shaders", []):
        chain.add(shader_name, **kwargs)

    # Setup feedback buffer
    fb = None
    fb_cfg = seg.get("feedback", None)
    if fb_cfg:
        fb = FeedbackBuffer()

    fx_fn = seg["fx"]

    # Open ffmpeg pipe
    cmd = ["ffmpeg", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
           "-s", f"{VW}x{VH}", "-r", str(FPS), "-i", "pipe:0",
           "-c:v", "libx264", "-preset", "fast", "-crf", "20",
           "-pix_fmt", "yuv420p", clip_path]
    stderr_fh = open(clip_path.replace(".mp4", ".log"), "w")
    pipe = subprocess.Popen(cmd, stdin=subprocess.PIPE,
                            stdout=subprocess.DEVNULL, stderr=stderr_fh)

    for fi in range(seg["frame_start"], seg["frame_end"]):
        t = fi / FPS
        feat = {k: float(features[k][fi]) for k in features}

        # 1. Scene renders canvas
        canvas = fx_fn(r, feat, t, S)

        # 2. Tonemap normalizes brightness
        canvas = tonemap(canvas, gamma=seg.get("gamma", 0.75))

        # 3. Feedback adds temporal recursion
        if fb and fb_cfg:
            canvas = fb.apply(canvas, **{k: fb_cfg[k] for k in fb_cfg})

        # 4. Shader chain adds post-processing
        canvas = chain.apply(canvas, f=feat, t=t)

        pipe.stdin.write(canvas.tobytes())

    pipe.stdin.close(); pipe.wait(); stderr_fh.close()
```

### Building Segments from Scene Table

```python
segments = []
for i, scene in enumerate(SCENES):
    segments.append({
        "id": f"s{i:02d}_{scene['name']}",
        "name": scene["name"],
        "grid": scene["grid"],
        "fx": scene["fx"],
        "shaders": scene.get("shaders", []),
        "feedback": scene.get("feedback", None),
        "gamma": scene.get("gamma", 0.75),
        "frame_start": int(scene["start"] * FPS),
        "frame_end": int(scene["end"] * FPS),
    })
```

### Parallel Rendering

Scenes are independent units dispatched to a process pool:

```python
from concurrent.futures import ProcessPoolExecutor, as_completed

with ProcessPoolExecutor(max_workers=N_WORKERS) as pool:
    futures = {
        pool.submit(render_clip, seg, features, clip_path): seg["id"]
        for seg, clip_path in zip(segments, clip_paths)
    }
    for fut in as_completed(futures):
        try:
            fut.result()
        except Exception as e:
            log(f"ERROR {futures[fut]}: {e}")
```

**Pickling constraint**: `ProcessPoolExecutor` serializes arguments via pickle. Module-level functions can be pickled; lambdas and closures cannot. All `fx_*` scene functions MUST be defined at module level, not as closures or class methods.

### Test-Frame Mode

Render a single frame at a specific timestamp to verify visuals without a full render:

```python
if args.test_frame >= 0:
    fi = min(int(args.test_frame * FPS), N_FRAMES - 1)
    t = fi / FPS
    feat = {k: float(features[k][fi]) for k in features}
    scene = next(sc for sc in reversed(SCENES) if t >= sc["start"])
    r = Renderer()
    r.set_grid(scene["grid"])
    canvas = scene["fx"](r, feat, t, r.S)
    canvas = tonemap(canvas, gamma=scene.get("gamma", 0.75))
    chain = ShaderChain()
    for sn, kw in scene.get("shaders", []):
        chain.add(sn, **kw)
    canvas = chain.apply(canvas, f=feat, t=t)
    Image.fromarray(canvas).save(f"test_{args.test_frame:.1f}s.png")
    print(f"Mean brightness: {canvas.astype(float).mean():.1f}")
```

CLI: `python reel.py --test-frame 10.0`

---

## Scene Design Checklist

For each scene:

1. **Choose 2-3 grid sizes** — different scales create interference
2. **Choose different value fields** per layer — don't use the same effect on every grid
3. **Choose different hue fields** per layer — or at minimum different hue offsets
4. **Choose different palettes** per layer — mixing PAL_RUNE with PAL_BLOCKS looks different from PAL_RUNE with PAL_DENSE
5. **Choose a blend mode** that matches the energy — screen for bright, difference for psychedelic, exclusion for subtle
6. **Add conditional effects** on beat — kaleidoscope, mirror, glitch
7. **Configure feedback** for trailing/recursive looks — or None for clean cuts
8. **Set gamma** if using destructive shaders (solarize, posterize)
9. **Test with --test-frame** at the scene's midpoint before full render

---

## Scene Examples

Copy-paste-ready scene functions at increasing complexity. Each is a complete, working v2 scene function that returns a pixel canvas. See the Scene Protocol section above for the scene protocol and `composition.md` for blend modes and tonemap.

---

### Minimal — Single Grid, Single Effect

### Breathing Plasma

One grid, one value field, one hue field. The simplest possible scene.

```python
def fx_breathing_plasma(r, f, t, S):
    """Plasma field with time-cycling hue. Audio modulates brightness."""
    canvas = _render_vf(r, "md",
        lambda g, f, t, S: vf_plasma(g, f, t, S) * 1.3,
        hf_time_cycle(0.08), PAL_DENSE, f, t, S, sat=0.8)
    return canvas
```

### Reaction-Diffusion Coral

Single grid, simulation-based field. Evolves organically over time.

```python
def fx_coral(r, f, t, S):
    """Gray-Scott reaction-diffusion — coral branching pattern.
    Slow-evolving, organic. Best for ambient/chill sections."""
    canvas = _render_vf(r, "sm",
        lambda g, f, t, S: vf_reaction_diffusion(g, f, t, S,
            feed=0.037, kill=0.060, steps_per_frame=6, init_mode="center"),
        hf_distance(0.55, 0.015), PAL_DOTS, f, t, S, sat=0.7)
    return canvas
```

### SDF Geometry

Geometric shapes from SDFs. Clean, precise, graphic.

```python
def fx_sdf_rings(r, f, t, S):
    """Concentric SDF rings with smooth pulsing."""
    def val_fn(g, f, t, S):
        d1 = sdf_ring(g, radius=0.15 + f.get("bass", 0.3) * 0.05, thickness=0.015)
        d2 = sdf_ring(g, radius=0.25 + f.get("mid", 0.3) * 0.05, thickness=0.012)
        d3 = sdf_ring(g, radius=0.35 + f.get("hi", 0.3) * 0.04, thickness=0.010)
        combined = sdf_smooth_union(sdf_smooth_union(d1, d2, 0.05), d3, 0.05)
        return sdf_glow(combined, falloff=0.08) * (0.5 + f.get("rms", 0.3) * 0.8)
    canvas = _render_vf(r, "md", val_fn, hf_angle(0.0), PAL_STARS, f, t, S, sat=0.85)
    return canvas
```

---

### Standard — Two Grids + Blend

### Tunnel Through Noise

Two grids at different densities, screen blended. The fine noise texture shows through the coarser tunnel characters.

```python
def fx_tunnel_noise(r, f, t, S):
    """Tunnel depth on md grid + fBM noise on sm grid, screen blended."""
    canvas_a = _render_vf(r, "md",
        lambda g, f, t, S: vf_tunnel(g, f, t, S, speed=4.0, complexity=8) * 1.2,
        hf_distance(0.5, 0.02), PAL_BLOCKS, f, t, S, sat=0.7)

    canvas_b = _render_vf(r, "sm",
        lambda g, f, t, S: vf_fbm(g, f, t, S, octaves=4, freq=0.05, speed=0.15) * 1.3,
        hf_time_cycle(0.06), PAL_RUNE, f, t, S, sat=0.6)

    return blend_canvas(canvas_a, canvas_b, "screen", 0.7)
```

### Voronoi Cells + Spiral Overlay

Voronoi cell edges with a spiral arm pattern overlaid.

```python
def fx_voronoi_spiral(r, f, t, S):
    """Voronoi edge detection on md + logarithmic spiral on lg."""
    canvas_a = _render_vf(r, "md",
        lambda g, f, t, S: vf_voronoi(g, f, t, S,
            n_cells=15, mode="edge", edge_width=2.0, speed=0.4),
        hf_angle(0.2), PAL_CIRCUIT, f, t, S, sat=0.75)

    canvas_b = _render_vf(r, "lg",
        lambda g, f, t, S: vf_spiral(g, f, t, S, n_arms=4, tightness=3.0) * 1.2,
        hf_distance(0.1, 0.03), PAL_BLOCKS, f, t, S, sat=0.9)

    return blend_canvas(canvas_a, canvas_b, "exclusion", 0.6)
```

### Domain-Warped fBM

Two layers of the same fBM, one domain-warped, difference-blended for psychedelic organic texture.

```python
def fx_organic_warp(r, f, t, S):
    """Clean fBM vs domain-warped fBM, difference blended."""
    canvas_a = _render_vf(r, "sm",
        lambda g, f, t, S: vf_fbm(g, f, t, S, octaves=5, freq=0.04, speed=0.1),
        hf_plasma(0.2), PAL_DENSE, f, t, S, sat=0.6)

    canvas_b = _render_vf(r, "md",
        lambda g, f, t, S: vf_domain_warp(g, f, t, S,
            warp_strength=20.0, freq=0.05, speed=0.15),
        hf_time_cycle(0.05), PAL_BRAILLE, f, t, S, sat=0.7)

    return blend_canvas(canvas_a, canvas_b, "difference", 0.7)
```

---

### Complex — Three Grids + Conditional + Feedback

### Psychedelic Cathedral

Three-grid composition with beat-triggered kaleidoscope and feedback zoom tunnel. The most visually complex pattern.

```python
def fx_cathedral(r, f, t, S):
    """Three-layer cathedral: interference + rings + noise, kaleidoscope on beat,
    feedback zoom tunnel."""
    # Layer 1: interference pattern on sm grid
    canvas_a = _render_vf(r, "sm",
        lambda g, f, t, S: vf_interference(g, f, t, S, n_waves=7) * 1.3,
        hf_angle(0.0), PAL_MATH, f, t, S, sat=0.8)

    # Layer 2: pulsing rings on md grid
    canvas_b = _render_vf(r, "md",
        lambda g, f, t, S: vf_rings(g, f, t, S, n_base=10, spacing_base=3) * 1.4,
        hf_distance(0.3, 0.02), PAL_STARS, f, t, S, sat=0.9)

    # Layer 3: temporal noise on lg grid (slow morph)
    canvas_c = _render_vf(r, "lg",
        lambda g, f, t, S: vf_temporal_noise(g, f, t, S,
            freq=0.04, t_freq=0.2, octaves=3),
        hf_time_cycle(0.12), PAL_BLOCKS, f, t, S, sat=0.7)

    # Blend: A screen B, then difference with C
    result = blend_canvas(canvas_a, canvas_b, "screen", 0.8)
    result = blend_canvas(result, canvas_c, "difference", 0.5)

    # Beat-triggered kaleidoscope
    if f.get("bdecay", 0) > 0.3:
        folds = 6 if f.get("sub_r", 0.3) > 0.4 else 8
        result = sh_kaleidoscope(result.copy(), folds=folds)

    return result

# Scene table entry with feedback:
# {"start": 30.0, "end": 50.0, "name": "cathedral", "fx": fx_cathedral,
#  "gamma": 0.65, "shaders": [("bloom", {"thr": 110}), ("chromatic", {"amt": 4}),
#                              ("vignette", {"s": 0.2}), ("grain", {"amt": 8})],
#  "feedback": {"decay": 0.75, "blend": "screen", "opacity": 0.35,
#               "transform": "zoom", "transform_amt": 0.012, "hue_shift": 0.015}}
```

### Masked Reaction-Diffusion with Attractor Overlay

Reaction-diffusion visible only through an animated iris mask, with a strange attractor density field underneath.

```python
def fx_masked_life(r, f, t, S):
    """Attractor base + reaction-diffusion visible through iris mask + particles."""
    g_sm = r.get_grid("sm")
    g_md = r.get_grid("md")

    # Layer 1: strange attractor density field (background)
    canvas_bg = _render_vf(r, "sm",
        lambda g, f, t, S: vf_strange_attractor(g, f, t, S,
            attractor="clifford", n_points=30000),
        hf_time_cycle(0.04), PAL_DOTS, f, t, S, sat=0.5)

    # Layer 2: reaction-diffusion (foreground, will be masked)
    canvas_rd = _render_vf(r, "md",
        lambda g, f, t, S: vf_reaction_diffusion(g, f, t, S,
            feed=0.046, kill=0.063, steps_per_frame=4, init_mode="ring"),
        hf_angle(0.15), PAL_HALFFILL, f, t, S, sat=0.85)

    # Animated iris mask — opens over first 5 seconds of scene
    scene_start = S.get("_scene_start", t)
    if "_scene_start" not in S:
        S["_scene_start"] = t
    mask = mask_iris(g_md, t, scene_start, scene_start + 5.0,
                     max_radius=0.6)
    canvas_rd = apply_mask_canvas(canvas_rd, mask, bg_canvas=canvas_bg)

    # Layer 3: flow-field particles following the R-D gradient
    rd_field = vf_reaction_diffusion(g_sm, f, t, S,
        feed=0.046, kill=0.063, steps_per_frame=0)  # read without stepping
    ch_p, co_p = update_flow_particles(S, g_sm, f, rd_field,
        n=300, speed=0.8, char_set=list("·•◦∘°"))
    canvas_p = g_sm.render(ch_p, co_p)

    result = blend_canvas(canvas_rd, canvas_p, "add", 0.7)
    return result
```

### Morphing Field Sequence with Eased Keyframes

Demonstrates temporal coherence: smooth morphing between effects with keyframed parameters.

```python
def fx_morphing_journey(r, f, t, S):
    """Morphs through 4 value fields over 20 seconds with eased transitions.
    Parameters (twist, arm count) also keyframed."""
    # Keyframed twist parameter
    twist = keyframe(t, [(0, 1.0), (5, 5.0), (10, 2.0), (15, 8.0), (20, 1.0)],
                     ease_fn=ease_in_out_cubic, loop=True)

    # Sequence of value fields with 2s crossfade
    fields = [
        lambda g, f, t, S: vf_plasma(g, f, t, S),
        lambda g, f, t, S: vf_vortex(g, f, t, S, twist=twist),
        lambda g, f, t, S: vf_fbm(g, f, t, S, octaves=5, freq=0.04),
        lambda g, f, t, S: vf_domain_warp(g, f, t, S, warp_strength=15),
    ]
    durations = [5.0, 5.0, 5.0, 5.0]

    val_fn = lambda g, f, t, S: vf_sequence(g, f, t, S, fields, durations,
                                             crossfade=2.0)

    # Render with slowly rotating hue
    canvas = _render_vf(r, "md", val_fn, hf_time_cycle(0.06),
                        PAL_DENSE, f, t, S, sat=0.8)

    # Second layer: tiled version of same sequence at smaller grid
    tiled_fn = lambda g, f, t, S: vf_sequence(
        make_tgrid(g, *uv_tile(g, 3, 3, mirror=True)),
        f, t, S, fields, durations, crossfade=2.0)
    canvas_b = _render_vf(r, "sm", tiled_fn, hf_angle(0.1),
                          PAL_RUNE, f, t, S, sat=0.6)

    return blend_canvas(canvas, canvas_b, "screen", 0.5)
```

---

### Specialized — Unique State Patterns

### Game of Life with Ghost Trails

Cellular automaton with analog fade trails. Beat injects random cells.

```python
def fx_life(r, f, t, S):
    """Conway's Game of Life with fading ghost trails.
    Beat events inject random live cells for disruption."""
    canvas = _render_vf(r, "sm",
        lambda g, f, t, S: vf_game_of_life(g, f, t, S,
            rule="life", steps_per_frame=1, fade=0.92, density=0.25),
        hf_fixed(0.33), PAL_BLOCKS, f, t, S, sat=0.8)

    # Overlay: coral automaton on lg grid for chunky texture
    canvas_b = _render_vf(r, "lg",
        lambda g, f, t, S: vf_game_of_life(g, f, t, S,
            rule="coral", steps_per_frame=1, fade=0.85, density=0.15, seed=99),
        hf_time_cycle(0.1), PAL_HATCH, f, t, S, sat=0.6)

    return blend_canvas(canvas, canvas_b, "screen", 0.5)
```

### Boids Flock Over Voronoi

Emergent swarm movement over a cellular background.

```python
def fx_boid_swarm(r, f, t, S):
    """Flocking boids over animated voronoi cells."""
    # Background: voronoi cells
    canvas_bg = _render_vf(r, "md",
        lambda g, f, t, S: vf_voronoi(g, f, t, S,
            n_cells=20, mode="distance", speed=0.2),
        hf_distance(0.4, 0.02), PAL_CIRCUIT, f, t, S, sat=0.5)

    # Foreground: boids
    g = r.get_grid("md")
    ch_b, co_b = update_boids(S, g, f, n_boids=150, perception=6.0,
                              max_speed=1.5, char_set=list("▸▹►▻→⟶"))
    canvas_boids = g.render(ch_b, co_b)

    # Trails for the boids
    # (boid positions are stored in S["boid_x"], S["boid_y"])
    S["px"] = list(S.get("boid_x", []))
    S["py"] = list(S.get("boid_y", []))
    ch_t, co_t = draw_particle_trails(S, g, max_trail=6, fade=0.6)
    canvas_trails = g.render(ch_t, co_t)

    result = blend_canvas(canvas_bg, canvas_trails, "add", 0.3)
    result = blend_canvas(result, canvas_boids, "add", 0.9)
    return result
```

### Fire Rising Through SDF Text Stencil

Fire effect visible only through text letterforms.

```python
def fx_fire_text(r, f, t, S):
    """Fire columns visible through text stencil. Text acts as window."""
    g = r.get_grid("lg")

    # Full-screen fire (will be masked)
    canvas_fire = _render_vf(r, "sm",
        lambda g, f, t, S: np.clip(
            vf_fbm(g, f, t, S, octaves=4, freq=0.08, speed=0.8) *
            (1.0 - g.rr / g.rows) *  # fade toward top
            (0.6 + f.get("bass", 0.3) * 0.8), 0, 1),
        hf_fixed(0.05), PAL_BLOCKS, f, t, S, sat=0.9)  # fire hue

    # Background: dark domain warp
    canvas_bg = _render_vf(r, "md",
        lambda g, f, t, S: vf_domain_warp(g, f, t, S,
            warp_strength=8, freq=0.03, speed=0.05) * 0.3,
        hf_fixed(0.6), PAL_DENSE, f, t, S, sat=0.4)

    # Text stencil mask
    mask = mask_text(g, "FIRE", row_frac=0.45)
    # Expand vertically for multi-row coverage
    for offset in range(-2, 3):
        shifted = mask_text(g, "FIRE", row_frac=0.45 + offset / g.rows)
        mask = mask_union(mask, shifted)

    canvas_masked = apply_mask_canvas(canvas_fire, mask, bg_canvas=canvas_bg)
    return canvas_masked
```

### Portrait Mode: Vertical Rain + Quote

Optimized for 9:16. Uses vertical space for long rain trails and stacked text.

```python
def fx_portrait_rain_quote(r, f, t, S):
    """Portrait-optimized: matrix rain (long vertical trails) with stacked quote.
    Designed for 1080x1920 (9:16)."""
    g = r.get_grid("md")  # ~112x100 in portrait

    # Matrix rain — long trails benefit from portrait's extra rows
    ch, co, S = eff_matrix_rain(g, f, t, S,
        hue=0.33, bri=0.6, pal=PAL_KATA, speed_base=0.4, speed_beat=2.5)
    canvas_rain = g.render(ch, co)

    # Tunnel depth underneath for texture
    canvas_tunnel = _render_vf(r, "sm",
        lambda g, f, t, S: vf_tunnel(g, f, t, S, speed=3.0, complexity=6) * 0.8,
        hf_fixed(0.33), PAL_BLOCKS, f, t, S, sat=0.5)

    result = blend_canvas(canvas_tunnel, canvas_rain, "screen", 0.8)

    # Quote text — portrait layout: short lines, many of them
    g_text = r.get_grid("lg")  # ~90x80 in portrait
    quote_lines = layout_text_portrait(
        "The code is the art and the art is the code",
        max_chars_per_line=20)
    # Center vertically
    block_start = (g_text.rows - len(quote_lines)) // 2
    ch_t = np.full((g_text.rows, g_text.cols), " ", dtype="U1")
    co_t = np.zeros((g_text.rows, g_text.cols, 3), dtype=np.uint8)
    total_chars = sum(len(l) for l in quote_lines)
    progress = min(1.0, (t - S.get("_scene_start", t)) / 3.0)
    if "_scene_start" not in S: S["_scene_start"] = t
    render_typewriter(ch_t, co_t, quote_lines, block_start, g_text.cols,
                      progress, total_chars, (200, 255, 220), t)
    canvas_text = g_text.render(ch_t, co_t)

    result = blend_canvas(result, canvas_text, "add", 0.9)
    return result
```

---

### Scene Table Template

Wire scenes into a complete video:

```python
SCENES = [
    {"start": 0.0,  "end": 5.0,  "name": "coral",
     "fx": fx_coral, "grid": "sm", "gamma": 0.70,
     "shaders": [("bloom", {"thr": 110}), ("vignette", {"s": 0.2})],
     "feedback": {"decay": 0.8, "blend": "screen", "opacity": 0.3,
                  "transform": "zoom", "transform_amt": 0.01}},

    {"start": 5.0,  "end": 15.0, "name": "tunnel_noise",
     "fx": fx_tunnel_noise, "grid": "md", "gamma": 0.75,
     "shaders": [("chromatic", {"amt": 3}), ("bloom", {"thr": 120}),
                 ("scanlines", {"intensity": 0.06}), ("grain", {"amt": 8})],
     "feedback": None},

    {"start": 15.0, "end": 35.0, "name": "cathedral",
     "fx": fx_cathedral, "grid": "sm", "gamma": 0.65,
     "shaders": [("bloom", {"thr": 100}), ("chromatic", {"amt": 5}),
                 ("color_wobble", {"amt": 0.2}), ("vignette", {"s": 0.18})],
     "feedback": {"decay": 0.75, "blend": "screen", "opacity": 0.35,
                  "transform": "zoom", "transform_amt": 0.012, "hue_shift": 0.015}},

    {"start": 35.0, "end": 50.0, "name": "morphing",
     "fx": fx_morphing_journey, "grid": "md", "gamma": 0.70,
     "shaders": [("bloom", {"thr": 110}), ("grain", {"amt": 6})],
     "feedback": {"decay": 0.7, "blend": "screen", "opacity": 0.25,
                  "transform": "rotate_cw", "transform_amt": 0.003}},
]
```
