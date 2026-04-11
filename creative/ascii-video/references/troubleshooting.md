# Troubleshooting Reference

> **See also:** composition.md · architecture.md · shaders.md · scenes.md · optimization.md

## Quick Diagnostic

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| All black output | tonemap gamma too high or no effects rendering | Lower gamma to 0.5, check scene_fn returns non-zero canvas |
| Washed out / too bright | Linear brightness multiplier instead of tonemap | Replace `canvas * N` with `tonemap(canvas, gamma=0.75)` |
| ffmpeg hangs mid-render | stderr=subprocess.PIPE deadlock | Redirect stderr to file |
| "read-only" array error | broadcast_to view without .copy() | Add `.copy()` after broadcast_to |
| PicklingError | Lambda or closure in SCENES table | Define all fx_* at module level |
| Random dark holes in output | Font missing Unicode glyphs | Validate palettes at init |
| Audio-visual desync | Frame timing accumulation | Use integer frame counter, compute t fresh each frame |
| Single-color flat output | Hue field shape mismatch | Ensure h,s,v arrays all (rows,cols) before hsv2rgb |
| Text unreadable over busy bg | No contrast between text and background | Use `apply_text_backdrop()` (composition.md) + `reverse_vignette` shader (shaders.md) |
| Text garbled/mirrored | Kaleidoscope or mirror shader applied to text scene | **Never apply kaleidoscope, mirror_h/v/quad/diag to scenes with readable text** — radial folding destroys legibility. Apply these only to background layers or text-free scenes |

Common bugs, gotchas, and platform-specific issues encountered during ASCII video development.

## NumPy Broadcasting

### The `broadcast_to().copy()` Trap

Hue field generators often return arrays that are broadcast views — they have shape `(1, cols)` or `(rows, 1)` that numpy broadcasts to `(rows, cols)`. These views are **read-only**. If any downstream code tries to modify them in-place (e.g., `h %= 1.0`), numpy raises:

```
ValueError: output array is read-only
```

**Fix**: Always `.copy()` after `broadcast_to()`:

```python
h = np.broadcast_to(h, (g.rows, g.cols)).copy()
```

This is especially important in `_render_vf()` where hue arrays flow through `hsv2rgb()`.

### The `+=` vs `+` Trap

Broadcasting also fails with in-place operators when operand shapes don't match exactly:

```python
# FAILS if result is (rows,1) and operand is (rows, cols)
val += np.sin(g.cc * 0.02 + t * 0.3) * 0.5

# WORKS — creates a new array
val = val + np.sin(g.cc * 0.02 + t * 0.3) * 0.5
```

The `vf_plasma()` function had this bug. Use `+` instead of `+=` when mixing different-shaped arrays.

### Shape Mismatch in `hsv2rgb()`

`hsv2rgb(h, s, v)` requires all three arrays to have identical shapes. If `h` is `(1, cols)` and `s` is `(rows, cols)`, the function crashes or produces wrong output.

**Fix**: Ensure all inputs are broadcast and copied to `(rows, cols)` before calling.

---

## Blend Mode Pitfalls

### Overlay Crushes Dark Inputs

`overlay(a, b) = 2*a*b` when `a < 0.5`. Two values of 0.12 produce `2 * 0.12 * 0.12 = 0.03`. The result is darker than either input.

**Impact**: If both layers are dark (which ASCII art usually is), overlay produces near-black output.

**Fix**: Use `screen` for dark source material. Screen always brightens: `1 - (1-a)*(1-b)`.

### Colordodge Division by Zero

`colordodge(a, b) = a / (1 - b)`. When `b = 1.0` (pure white pixels), this divides by zero.

**Fix**: Add epsilon: `a / (1 - b + 1e-6)`. The implementation in `BLEND_MODES` should include this.

### Colorburn Division by Zero

`colorburn(a, b) = 1 - (1-a) / b`. When `b = 0` (pure black pixels), this divides by zero.

**Fix**: Add epsilon: `1 - (1-a) / (b + 1e-6)`.

### Multiply Always Darkens

`multiply(a, b) = a * b`. Since both operands are [0,1], the result is always <= min(a,b). Never use multiply as a feedback blend mode — the frame goes black within a few frames.

**Fix**: Use `screen` for feedback, or `add` with low opacity.

---

## Multiprocessing

### Pickling Constraints

`ProcessPoolExecutor` serializes function arguments via pickle. This constrains what you can pass to workers:

| Can Pickle | Cannot Pickle |
|-----------|---------------|
| Module-level functions (`def fx_foo():`) | Lambdas (`lambda x: x + 1`) |
| Dicts, lists, numpy arrays | Closures (functions defined inside functions) |
| Class instances (with `__reduce__`) | Instance methods |
| Strings, numbers | File handles, sockets |

**Impact**: All scene functions referenced in the SCENES table must be defined at module level with `def`. If you use a lambda or closure, you get:

```
_pickle.PicklingError: Can't pickle <function <lambda> at 0x...>
```

**Fix**: Define all scene functions at module top level. Lambdas used inside `_render_vf()` as val_fn/hue_fn are fine because they execute within the worker process — they're not pickled across process boundaries.

### macOS spawn vs Linux fork

On macOS, `multiprocessing` defaults to `spawn` (full serialization). On Linux, it defaults to `fork` (copy-on-write). This means:

- **macOS**: Feature arrays are serialized per worker (~57KB for 30s video, but scales with duration). Each worker re-imports the entire module.
- **Linux**: Feature arrays are shared via COW. Workers inherit the parent's memory.

**Impact**: On macOS, module-level code (like `detect_hardware()`) runs in every worker process. If it has side effects (e.g., subprocess calls), those happen N+1 times.

### Per-Worker State Isolation

Each worker creates its own:
- `Renderer` instance (with fresh grid cache)
- `FeedbackBuffer` (feedback doesn't cross scene boundaries)
- Random seed (`random.seed(hash(seg_id) + 42)`)

This means:
- Particle state doesn't carry between scenes (expected)
- Feedback trails reset at scene cuts (expected)
- `np.random` state is NOT seeded by `random.seed()` — they use separate RNGs

**Fix for deterministic noise**: Use `np.random.RandomState(seed)` explicitly:

```python
rng = np.random.RandomState(hash(seg_id) + 42)
noise = rng.random((rows, cols))
```

---

## Brightness Issues

### Dark Scenes After Tonemap

If a scene is still dark after tonemap, check:

1. **Gamma too high**: Lower gamma (0.5-0.6) for scenes with destructive post-processing
2. **Shader destroying brightness**: Solarize, posterize, or contrast adjustments in the shader chain can undo tonemap's work. Move destructive shaders earlier in the chain, or increase gamma to compensate.
3. **Feedback with multiply**: Multiply feedback darkens every frame. Switch to screen or add.
4. **Overlay blend in scene**: If the scene function uses `blend_canvas(..., "overlay", ...)` with dark layers, switch to screen.

### Diagnostic: Test-Frame Brightness

```bash
python reel.py --test-frame 10.0
# Output: Mean brightness: 44.3, max: 255
```

If mean < 20, the scene needs attention. Common fixes:
- Lower gamma in the SCENES entry
- Change internal blend modes from overlay/multiply to screen/add
- Increase value field multipliers (e.g., `vf_plasma(...) * 1.5`)
- Check that the shader chain doesn't have an aggressive solarize or threshold

### v1 Brightness Pattern (Deprecated)

The old pattern used a linear multiplier:

```python
# OLD — don't use
canvas = np.clip(canvas.astype(np.float32) * 2.0, 0, 255).astype(np.uint8)
```

This fails because:
- Dark scenes (mean 8): `8 * 2.0 = 16` — still dark
- Bright scenes (mean 130): `130 * 2.0 = 255` — clipped, lost detail

Use `tonemap()` instead. See `composition.md` § Adaptive Tone Mapping.

---

## ffmpeg Issues

### Pipe Deadlock

The #1 production bug. If you use `stderr=subprocess.PIPE`:

```python
# DEADLOCK — stderr buffer fills at 64KB, blocks ffmpeg, blocks your writes
pipe = subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=subprocess.PIPE)
```

**Fix**: Always redirect stderr to a file:

```python
stderr_fh = open(err_path, "w")
pipe = subprocess.Popen(cmd, stdin=subprocess.PIPE,
                        stdout=subprocess.DEVNULL, stderr=stderr_fh)
```

### Frame Count Mismatch

If the number of frames written to the pipe doesn't match what ffmpeg expects (based on `-r` and duration), the output may have:
- Missing frames at the end
- Incorrect duration
- Audio-video desync

**Fix**: Calculate frame count explicitly: `n_frames = int(duration * FPS)`. Don't use `range(int(start*FPS), int(end*FPS))` without verifying the total matches.

### Concat Fails with "unsafe file name"

```
[concat @ ...] Unsafe file name
```

**Fix**: Always use `-safe 0`:
```python
["ffmpeg", "-f", "concat", "-safe", "0", "-i", concat_path, ...]
```

---

## Font Issues

### Cell Height (macOS Pillow)

`textbbox()` and `getbbox()` return incorrect heights on some macOS Pillow versions. Use `getmetrics()`:

```python
ascent, descent = font.getmetrics()
cell_height = ascent + descent  # correct
# NOT: font.getbbox("M")[3]  # wrong on some versions
```

### Missing Unicode Glyphs

Not all fonts render all Unicode characters. If a palette character isn't in the font, the glyph renders as a blank or tofu box, appearing as a dark hole in the output.

**Fix**: Validate at init:

```python
all_chars = set()
for pal in [PAL_DEFAULT, PAL_DENSE, PAL_RUNE, ...]:
    all_chars.update(pal)

valid_chars = set()
for c in all_chars:
    if c == " ":
        valid_chars.add(c)
        continue
    img = Image.new("L", (20, 20), 0)
    ImageDraw.Draw(img).text((0, 0), c, fill=255, font=font)
    if np.array(img).max() > 0:
        valid_chars.add(c)
    else:
        log(f"WARNING: '{c}' (U+{ord(c):04X}) missing from font")
```

### Platform Font Paths

| Platform | Common Paths |
|----------|-------------|
| macOS | `/System/Library/Fonts/Menlo.ttc`, `/System/Library/Fonts/Monaco.ttf` |
| Linux | `/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf` |
| Windows | `C:\Windows\Fonts\consola.ttf` (Consolas) |

Always probe multiple paths and fall back gracefully. See `architecture.md` § Font Selection.

---

## Performance

### Slow Shaders

Some shaders use Python loops and are very slow at 1080p:

| Shader | Issue | Fix |
|--------|-------|-----|
| `wave_distort` | Per-row Python loop | Use vectorized fancy indexing |
| `halftone` | Triple-nested loop | Vectorize with block reduction |
| `matrix rain` | Per-column per-trail loop | Accumulate index arrays, bulk assign |

### Render Time Scaling

If render is taking much longer than expected:
1. Check grid count — each extra grid adds ~100-150ms/frame for init
2. Check particle count — cap at quality-appropriate limits
3. Check shader count — each shader adds 2-25ms
4. Check for accidental Python loops in effects (should be numpy only)

---

## Common Mistakes

### Using `r.S` vs the `S` Parameter

The v2 scene protocol passes `S` (the state dict) as an explicit parameter. But `S` IS `r.S` — they're the same object. Both work:

```python
def fx_scene(r, f, t, S):
    S["counter"] = S.get("counter", 0) + 1   # via parameter (preferred)
    r.S["counter"] = r.S.get("counter", 0) + 1  # via renderer (also works)
```

Use the `S` parameter for clarity. The explicit parameter makes it obvious that the function has persistent state.

### Forgetting to Handle Empty Feature Values

Audio features default to 0.0 if the audio is silent. Use `.get()` with sensible defaults:

```python
energy = f.get("bass", 0.3)  # default to 0.3, not 0
```

If you default to 0, effects go blank during silence.

### Writing New Files Instead of Editing Existing State

A common bug in particle systems: creating new arrays every frame instead of updating persistent state.

```python
# WRONG — particles reset every frame
S["px"] = []
for _ in range(100):
    S["px"].append(random.random())

# RIGHT — only initialize once, update each frame
if "px" not in S:
    S["px"] = []
# ... emit new particles based on beats
# ... update existing particles
```

### Not Clipping Value Fields

Value fields should be [0, 1]. If they exceed this range, `val2char()` produces index errors:

```python
# WRONG — vf_plasma() * 1.5 can exceed 1.0
val = vf_plasma(g, f, t, S) * 1.5

# RIGHT — clip after scaling
val = np.clip(vf_plasma(g, f, t, S) * 1.5, 0, 1)
```

The `_render_vf()` helper clips automatically, but if you're building custom scenes, clip explicitly.

## Brightness Best Practices

- Dense animated backgrounds — never flat black, always fill the grid
- Vignette minimum clamped to 0.15 (not 0.12)
- Bloom threshold 130 (not 170) so more pixels contribute to glow
- Use `screen` blend mode (not `overlay`) for dark ASCII layers — overlay squares dark values: `2 * 0.12 * 0.12 = 0.03`
- FeedbackBuffer decay minimum 0.5 — below that, feedback disappears too fast to see
- Value field floor: `vf * 0.8 + 0.05` ensures no cell is truly zero
- Per-scene gamma overrides: default 0.75, solarize 0.55, posterize 0.50, bright scenes 0.85
- Test frames early: render single frames at key timestamps before committing to full render

**Quick checklist before full render:**
1. Render 3 test frames (start, middle, end)
2. Check `canvas.mean() > 8` after tonemap
3. Check no scene is visually flat black
4. Verify per-section variation (different bg/palette/color per scene)
5. Confirm shader chain includes bloom (threshold 130)
6. Confirm vignette strength ≤ 0.25
