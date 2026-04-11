# Composition & Brightness Reference

The composable system is the core of visual complexity. It operates at three levels: pixel-level blend modes, multi-grid composition, and adaptive brightness management. This document covers all three, plus the masking/stencil system for spatial control.

> **See also:** architecture.md · effects.md · scenes.md · shaders.md · troubleshooting.md

## Pixel-Level Blend Modes

### The `blend_canvas()` Function

All blending operates on full pixel canvases (`uint8 H,W,3`). Internally converts to float32 [0,1] for precision, blends, lerps by opacity, converts back.

```python
def blend_canvas(base, top, mode="normal", opacity=1.0):
    af = base.astype(np.float32) / 255.0
    bf = top.astype(np.float32) / 255.0
    fn = BLEND_MODES.get(mode, BLEND_MODES["normal"])
    result = fn(af, bf)
    if opacity < 1.0:
        result = af * (1 - opacity) + result * opacity
    return np.clip(result * 255, 0, 255).astype(np.uint8)
```

### 20 Blend Modes

```python
BLEND_MODES = {
    # Basic arithmetic
    "normal":       lambda a, b: b,
    "add":          lambda a, b: np.clip(a + b, 0, 1),
    "subtract":     lambda a, b: np.clip(a - b, 0, 1),
    "multiply":     lambda a, b: a * b,
    "screen":       lambda a, b: 1 - (1 - a) * (1 - b),

    # Contrast
    "overlay":      lambda a, b: np.where(a < 0.5, 2*a*b, 1 - 2*(1-a)*(1-b)),
    "softlight":    lambda a, b: (1 - 2*b)*a*a + 2*b*a,
    "hardlight":    lambda a, b: np.where(b < 0.5, 2*a*b, 1 - 2*(1-a)*(1-b)),

    # Difference
    "difference":   lambda a, b: np.abs(a - b),
    "exclusion":    lambda a, b: a + b - 2*a*b,

    # Dodge / burn
    "colordodge":   lambda a, b: np.clip(a / (1 - b + 1e-6), 0, 1),
    "colorburn":    lambda a, b: np.clip(1 - (1 - a) / (b + 1e-6), 0, 1),

    # Light
    "linearlight":  lambda a, b: np.clip(a + 2*b - 1, 0, 1),
    "vividlight":   lambda a, b: np.where(b < 0.5,
                        np.clip(1 - (1-a)/(2*b + 1e-6), 0, 1),
                        np.clip(a / (2*(1-b) + 1e-6), 0, 1)),
    "pin_light":    lambda a, b: np.where(b < 0.5,
                        np.minimum(a, 2*b), np.maximum(a, 2*b - 1)),
    "hard_mix":     lambda a, b: np.where(a + b >= 1.0, 1.0, 0.0),

    # Compare
    "lighten":      lambda a, b: np.maximum(a, b),
    "darken":       lambda a, b: np.minimum(a, b),

    # Grain
    "grain_extract": lambda a, b: np.clip(a - b + 0.5, 0, 1),
    "grain_merge":  lambda a, b: np.clip(a + b - 0.5, 0, 1),
}
```

### Blend Mode Selection Guide

**Modes that brighten** (safe for dark inputs):
- `screen` — always brightens. Two 50% gray layers screen to 75%. The go-to safe blend.
- `add` — simple addition, clips at white. Good for sparkles, glows, particle overlays.
- `colordodge` — extreme brightening at overlap zones. Can blow out. Use low opacity (0.3-0.5).
- `linearlight` — aggressive brightening. Similar to add but with offset.

**Modes that darken** (avoid with dark inputs):
- `multiply` — darkens everything. Only use when both layers are already bright.
- `overlay` — darkens when base < 0.5, brightens when base > 0.5. Crushes dark inputs: `2 * 0.12 * 0.12 = 0.03`. Use `screen` instead for dark material.
- `colorburn` — extreme darkening at overlap zones.

**Modes that create contrast**:
- `softlight` — gentle contrast. Good for subtle texture overlay.
- `hardlight` — strong contrast. Like overlay but keyed on the top layer.
- `vividlight` — very aggressive contrast. Use sparingly.

**Modes that create color effects**:
- `difference` — XOR-like patterns. Two identical layers difference to black; offset layers create wild colors. Great for psychedelic looks.
- `exclusion` — softer version of difference. Creates complementary color patterns.
- `hard_mix` — posterizes to pure black/white/saturated color at intersections.

**Modes for texture blending**:
- `grain_extract` / `grain_merge` — extract a texture from one layer, apply it to another.

### Multi-Layer Chaining

```python
# Pattern: render layers -> blend sequentially
canvas_a = _render_vf(r, "md", vf_plasma, hf_angle(0.0), PAL_DENSE, f, t, S)
canvas_b = _render_vf(r, "sm", vf_vortex, hf_time_cycle(0.1), PAL_RUNE, f, t, S)
canvas_c = _render_vf(r, "lg", vf_rings, hf_distance(), PAL_BLOCKS, f, t, S)

result = blend_canvas(canvas_a, canvas_b, "screen", 0.8)
result = blend_canvas(result, canvas_c, "difference", 0.6)
```

Order matters: `screen(A, B)` is commutative, but `difference(screen(A,B), C)` differs from `difference(A, screen(B,C))`.

### Linear-Light Blend Modes

Standard `blend_canvas()` operates in sRGB space — the raw byte values. This is fine for most uses, but sRGB is perceptually non-linear: blending in sRGB darkens midtones and shifts hues slightly. For physically accurate blending (matching how light actually combines), convert to linear light first.

Uses `srgb_to_linear()` / `linear_to_srgb()` from `architecture.md` § OKLAB Color System.

```python
def blend_canvas_linear(base, top, mode="normal", opacity=1.0):
    """Blend in linear light space for physically accurate results.
    
    Identical API to blend_canvas(), but converts sRGB → linear before
    blending and linear → sRGB after. More expensive (~2x) due to the
    gamma conversions, but produces correct results for additive blending,
    screen, and any mode where brightness matters.
    """
    af = srgb_to_linear(base.astype(np.float32) / 255.0)
    bf = srgb_to_linear(top.astype(np.float32) / 255.0)
    fn = BLEND_MODES.get(mode, BLEND_MODES["normal"])
    result = fn(af, bf)
    if opacity < 1.0:
        result = af * (1 - opacity) + result * opacity
    result = linear_to_srgb(np.clip(result, 0, 1))
    return np.clip(result * 255, 0, 255).astype(np.uint8)
```

**When to use `blend_canvas_linear()` vs `blend_canvas()`:**

| Scenario | Use | Why |
|----------|-----|-----|
| Screen-blending two bright layers | `linear` | sRGB screen over-brightens highlights |
| Add mode for glow/bloom effects | `linear` | Additive light follows linear physics |
| Blending text overlay at low opacity | `srgb` | Perceptual blending looks more natural for text |
| Multiply for shadow/darkening | `srgb` | Differences are minimal for darken ops |
| Color-critical work (matching reference) | `linear` | Avoids sRGB hue shifts in midtones |
| Performance-critical inner loop | `srgb` | ~2x faster, good enough for most ASCII art |

**Batch version** for compositing many layers (converts once, blends multiple, converts back):

```python
def blend_many_linear(layers, modes, opacities):
    """Blend a stack of layers in linear light space.
    
    Args:
        layers: list of uint8 (H,W,3) canvases
        modes: list of blend mode strings (len = len(layers) - 1)
        opacities: list of floats (len = len(layers) - 1)
    Returns:
        uint8 (H,W,3) canvas
    """
    # Convert all to linear at once
    linear = [srgb_to_linear(l.astype(np.float32) / 255.0) for l in layers]
    result = linear[0]
    for i in range(1, len(linear)):
        fn = BLEND_MODES.get(modes[i-1], BLEND_MODES["normal"])
        blended = fn(result, linear[i])
        op = opacities[i-1]
        if op < 1.0:
            blended = result * (1 - op) + blended * op
        result = np.clip(blended, 0, 1)
    result = linear_to_srgb(result)
    return np.clip(result * 255, 0, 255).astype(np.uint8)
```

---

## Multi-Grid Composition

This is the core visual technique. Rendering the same conceptual scene at different grid densities (character sizes) creates natural texture interference, because characters at different scales overlap at different spatial frequencies.

### Why It Works

- `sm` grid (10pt font): 320x83 characters. Fine detail, dense texture.
- `md` grid (16pt): 192x56 characters. Medium density.
- `lg` grid (20pt): 160x45 characters. Coarse, chunky characters.

When you render a plasma field on `sm` and a vortex on `lg`, then screen-blend them, the fine plasma texture shows through the gaps in the coarse vortex characters. The result has more visual complexity than either layer alone.

### The `_render_vf()` Helper

This is the workhorse function. It takes a value field + hue field + palette + grid, renders to a complete pixel canvas:

```python
def _render_vf(r, grid_key, val_fn, hue_fn, pal, f, t, S, sat=0.8, threshold=0.03):
    """Render a value field + hue field to a pixel canvas via a named grid.

    Args:
        r: Renderer instance (has .get_grid())
        grid_key: "xs", "sm", "md", "lg", "xl", "xxl"
        val_fn: (g, f, t, S) -> float32 [0,1] array (rows, cols)
        hue_fn: callable (g, f, t, S) -> float32 hue array, OR float scalar
        pal: character palette string
        f: feature dict
        t: time in seconds
        S: persistent state dict
        sat: HSV saturation (0-1)
        threshold: minimum value to render (below = space)

    Returns:
        uint8 array (VH, VW, 3) — full pixel canvas
    """
    g = r.get_grid(grid_key)
    val = np.clip(val_fn(g, f, t, S), 0, 1)
    mask = val > threshold
    ch = val2char(val, mask, pal)

    # Hue: either a callable or a fixed float
    if callable(hue_fn):
        h = hue_fn(g, f, t, S) % 1.0
    else:
        h = np.full((g.rows, g.cols), float(hue_fn), dtype=np.float32)

    # CRITICAL: broadcast to full shape and copy (see Troubleshooting)
    h = np.broadcast_to(h, (g.rows, g.cols)).copy()

    R, G, B = hsv2rgb(h, np.full_like(val, sat), val)
    co = mkc(R, G, B, g.rows, g.cols)
    return g.render(ch, co)
```

### Grid Combination Strategies

| Combination | Effect | Good For |
|-------------|--------|----------|
| `sm` + `lg` | Maximum contrast between fine detail and chunky blocks | Bold, graphic looks |
| `sm` + `md` | Subtle texture layering, similar scales | Organic, flowing looks |
| `md` + `lg` + `xs` | Three-scale interference, maximum complexity | Psychedelic, dense |
| `sm` + `sm` (different effects) | Same scale, pattern interference only | Moire, interference |

### Complete Multi-Grid Scene Example

```python
def fx_psychedelic(r, f, t, S):
    """Three-layer multi-grid scene with beat-reactive kaleidoscope."""
    # Layer A: plasma on medium grid with rainbow hue
    canvas_a = _render_vf(r, "md",
        lambda g, f, t, S: vf_plasma(g, f, t, S) * 1.3,
        hf_angle(0.0), PAL_DENSE, f, t, S, sat=0.8)

    # Layer B: vortex on small grid with cycling hue
    canvas_b = _render_vf(r, "sm",
        lambda g, f, t, S: vf_vortex(g, f, t, S, twist=5.0) * 1.2,
        hf_time_cycle(0.1), PAL_RUNE, f, t, S, sat=0.7)

    # Layer C: rings on large grid with distance hue
    canvas_c = _render_vf(r, "lg",
        lambda g, f, t, S: vf_rings(g, f, t, S, n_base=8, spacing_base=3) * 1.4,
        hf_distance(0.3, 0.02), PAL_BLOCKS, f, t, S, sat=0.9)

    # Blend: A screened with B, then difference with C
    result = blend_canvas(canvas_a, canvas_b, "screen", 0.8)
    result = blend_canvas(result, canvas_c, "difference", 0.6)

    # Beat-triggered kaleidoscope
    if f.get("bdecay", 0) > 0.3:
        result = sh_kaleidoscope(result.copy(), folds=6)

    return result
```

---

## Adaptive Tone Mapping

### The Brightness Problem

ASCII characters are small bright dots on a black background. Most pixels in any frame are background (black). This means:
- Mean frame brightness is inherently low (often 5-30 out of 255)
- Different effect combinations produce wildly different brightness levels
- A spiral scene might be 50 mean, while a fire scene is 9 mean
- Linear multipliers (e.g., `canvas * 2.0`) either leave dark scenes dark or blow out bright scenes

### The `tonemap()` Function

Replaces linear brightness multipliers with adaptive per-frame normalization + gamma correction:

```python
def tonemap(canvas, target_mean=90, gamma=0.75, black_point=2, white_point=253):
    """Adaptive tone-mapping: normalizes + gamma-corrects so no frame is
    fully dark or washed out.

    1. Compute 1st and 99.5th percentile on 4x subsample (16x fewer values,
       negligible accuracy loss, major speedup at 1080p+)
    2. Stretch that range to [0, 1]
    3. Apply gamma curve (< 1 lifts shadows, > 1 darkens)
    4. Rescale to [black_point, white_point]
    """
    f = canvas.astype(np.float32)
    sub = f[::4, ::4]  # 4x subsample: ~390K values vs ~6.2M at 1080p
    lo = np.percentile(sub, 1)
    hi = np.percentile(sub, 99.5)
    if hi - lo < 10:
        hi = max(hi, lo + 10)  # near-uniform frame fallback
    f = np.clip((f - lo) / (hi - lo), 0.0, 1.0)
    np.power(f, gamma, out=f)          # in-place: avoids allocation
    np.multiply(f, (white_point - black_point), out=f)
    np.add(f, black_point, out=f)
    return np.clip(f, 0, 255).astype(np.uint8)
```

### Why Gamma, Not Linear

Linear multiplier `* 2.0`:
```
input 10  -> output 20   (still dark)
input 100 -> output 200  (ok)
input 200 -> output 255  (clipped, lost detail)
```

Gamma 0.75 after normalization:
```
input 0.04 -> output 0.08 (lifted from invisible to visible)
input 0.39 -> output 0.50 (moderate lift)
input 0.78 -> output 0.84 (gentle lift, no clipping)
```

Gamma < 1 compresses the highlights and expands the shadows. This is exactly what we need: lift dark ASCII content into visibility without blowing out the bright parts.

### Pipeline Ordering

The pipeline in `render_clip()` is:

```
scene_fn(r, f, t, S)  ->  canvas
         |
    tonemap(canvas, gamma=scene_gamma)
         |
    FeedbackBuffer.apply(canvas, ...)
         |
    ShaderChain.apply(canvas, f=f, t=t)
         |
    ffmpeg pipe
```

Tonemap runs BEFORE feedback and shaders. This means:
- Feedback operates on normalized data (consistent behavior regardless of scene brightness)
- Shaders like solarize, posterize, contrast operate on properly-ranged data
- The brightness shader in the chain is no longer needed (tonemap handles it)

### Per-Scene Gamma Tuning

Default gamma is 0.75. Scenes that apply destructive post-processing need more aggressive lift because the destruction happens after tonemap:

| Scene Type | Recommended Gamma | Why |
|------------|-------------------|-----|
| Standard effects | 0.75 | Default, works for most scenes |
| Solarize post-process | 0.50-0.60 | Solarize inverts bright pixels, reducing overall brightness |
| Posterize post-process | 0.50-0.55 | Posterize quantizes, often crushing mid-values to black |
| Heavy difference blending | 0.60-0.70 | Difference mode creates many near-zero pixels |
| Already bright scenes | 0.85-1.0 | Don't over-boost scenes that are naturally bright |

Configure via the scene table:

```python
SCENES = [
    {"start": 9.17, "end": 11.25, "name": "fire", "gamma": 0.55,
     "fx": fx_fire, "shaders": [("solarize", {"threshold": 200}), ...]},
    {"start": 25.96, "end": 27.29, "name": "diamond", "gamma": 0.5,
     "fx": fx_diamond, "shaders": [("bloom", {"thr": 90}), ...]},
]
```

### Brightness Verification

After rendering, spot-check frame brightness:

```python
# In test-frame mode
canvas = scene["fx"](r, feat, t, r.S)
canvas = tonemap(canvas, gamma=scene.get("gamma", 0.75))
chain = ShaderChain()
for sn, kw in scene.get("shaders", []):
    chain.add(sn, **kw)
canvas = chain.apply(canvas, f=feat, t=t)
print(f"Mean brightness: {canvas.astype(float).mean():.1f}, max: {canvas.max()}")
```

Target ranges after tonemap + shaders:
- Quiet/ambient scenes: mean 30-60
- Active scenes: mean 40-100
- Climax/peak scenes: mean 60-150
- If mean < 20: gamma is too high or a shader is destroying brightness
- If mean > 180: gamma is too low or add is stacking too much

---

## FeedbackBuffer Spatial Transforms

The feedback buffer stores the previous frame and blends it into the current frame with decay. Spatial transforms applied to the buffer before blending create the illusion of motion in the feedback trail.

### Implementation

```python
class FeedbackBuffer:
    def __init__(self):
        self.buf = None

    def apply(self, canvas, decay=0.85, blend="screen", opacity=0.5,
              transform=None, transform_amt=0.02, hue_shift=0.0):
        if self.buf is None:
            self.buf = canvas.astype(np.float32) / 255.0
            return canvas

        # Decay old buffer
        self.buf *= decay

        # Spatial transform
        if transform:
            self.buf = self._transform(self.buf, transform, transform_amt)

        # Hue shift the feedback for rainbow trails
        if hue_shift > 0:
            self.buf = self._hue_shift(self.buf, hue_shift)

        # Blend feedback into current frame
        result = blend_canvas(canvas,
                              np.clip(self.buf * 255, 0, 255).astype(np.uint8),
                              blend, opacity)

        # Update buffer with current frame
        self.buf = result.astype(np.float32) / 255.0
        return result

    def _transform(self, buf, transform, amt):
        h, w = buf.shape[:2]
        if transform == "zoom":
            # Zoom in: sample from slightly inside (creates expanding tunnel)
            m = int(h * amt); n = int(w * amt)
            if m > 0 and n > 0:
                cropped = buf[m:-m or None, n:-n or None]
                # Resize back to full (nearest-neighbor for speed)
                buf = np.array(Image.fromarray(
                    np.clip(cropped * 255, 0, 255).astype(np.uint8)
                ).resize((w, h), Image.NEAREST)).astype(np.float32) / 255.0
        elif transform == "shrink":
            # Zoom out: pad edges, shrink center
            m = int(h * amt); n = int(w * amt)
            small = np.array(Image.fromarray(
                np.clip(buf * 255, 0, 255).astype(np.uint8)
            ).resize((w - 2*n, h - 2*m), Image.NEAREST))
            new = np.zeros((h, w, 3), dtype=np.uint8)
            new[m:m+small.shape[0], n:n+small.shape[1]] = small
            buf = new.astype(np.float32) / 255.0
        elif transform == "rotate_cw":
            # Small clockwise rotation via affine
            angle = amt * 10  # amt=0.005 -> 0.05 degrees per frame
            cy, cx = h / 2, w / 2
            Y = np.arange(h, dtype=np.float32)[:, None]
            X = np.arange(w, dtype=np.float32)[None, :]
            cos_a, sin_a = np.cos(angle), np.sin(angle)
            sx = (X - cx) * cos_a + (Y - cy) * sin_a + cx
            sy = -(X - cx) * sin_a + (Y - cy) * cos_a + cy
            sx = np.clip(sx.astype(int), 0, w - 1)
            sy = np.clip(sy.astype(int), 0, h - 1)
            buf = buf[sy, sx]
        elif transform == "rotate_ccw":
            angle = -amt * 10
            cy, cx = h / 2, w / 2
            Y = np.arange(h, dtype=np.float32)[:, None]
            X = np.arange(w, dtype=np.float32)[None, :]
            cos_a, sin_a = np.cos(angle), np.sin(angle)
            sx = (X - cx) * cos_a + (Y - cy) * sin_a + cx
            sy = -(X - cx) * sin_a + (Y - cy) * cos_a + cy
            sx = np.clip(sx.astype(int), 0, w - 1)
            sy = np.clip(sy.astype(int), 0, h - 1)
            buf = buf[sy, sx]
        elif transform == "shift_up":
            pixels = max(1, int(h * amt))
            buf = np.roll(buf, -pixels, axis=0)
            buf[-pixels:] = 0  # black fill at bottom
        elif transform == "shift_down":
            pixels = max(1, int(h * amt))
            buf = np.roll(buf, pixels, axis=0)
            buf[:pixels] = 0
        elif transform == "mirror_h":
            buf = buf[:, ::-1]
        return buf

    def _hue_shift(self, buf, amount):
        """Rotate hues of the feedback buffer. Operates on float32 [0,1]."""
        rgb = np.clip(buf * 255, 0, 255).astype(np.uint8)
        hsv = np.zeros_like(buf)
        # Simple approximate RGB->HSV->shift->RGB
        r, g, b = buf[:,:,0], buf[:,:,1], buf[:,:,2]
        mx = np.maximum(np.maximum(r, g), b)
        mn = np.minimum(np.minimum(r, g), b)
        delta = mx - mn + 1e-10
        # Hue
        h = np.where(mx == r, ((g - b) / delta) % 6,
            np.where(mx == g, (b - r) / delta + 2, (r - g) / delta + 4))
        h = (h / 6 + amount) % 1.0
        # Reconstruct with shifted hue (simplified)
        s = delta / (mx + 1e-10)
        v = mx
        c = v * s; x = c * (1 - np.abs((h * 6) % 2 - 1)); m = v - c
        ro = np.zeros_like(h); go = np.zeros_like(h); bo = np.zeros_like(h)
        for lo, hi, rv, gv, bv in [(0,1,c,x,0),(1,2,x,c,0),(2,3,0,c,x),
                                     (3,4,0,x,c),(4,5,x,0,c),(5,6,c,0,x)]:
            mask = ((h*6) >= lo) & ((h*6) < hi)
            ro[mask] = rv[mask] if not isinstance(rv, (int,float)) else rv
            go[mask] = gv[mask] if not isinstance(gv, (int,float)) else gv
            bo[mask] = bv[mask] if not isinstance(bv, (int,float)) else bv
        return np.stack([ro+m, go+m, bo+m], axis=2)
```

### Feedback Presets

| Preset | Config | Visual Effect |
|--------|--------|---------------|
| Infinite zoom tunnel | `decay=0.8, blend="screen", transform="zoom", transform_amt=0.015` | Expanding ring patterns |
| Rainbow trails | `decay=0.7, blend="screen", transform="zoom", transform_amt=0.01, hue_shift=0.02` | Psychedelic color trails |
| Ghostly echo | `decay=0.9, blend="add", opacity=0.15, transform="shift_up", transform_amt=0.01` | Faint upward smearing |
| Kaleidoscopic recursion | `decay=0.75, blend="screen", transform="rotate_cw", transform_amt=0.005, hue_shift=0.01` | Rotating mandala feedback |
| Color evolution | `decay=0.8, blend="difference", opacity=0.4, hue_shift=0.03` | Frame-to-frame color XOR |
| Rising heat haze | `decay=0.5, blend="add", opacity=0.2, transform="shift_up", transform_amt=0.02` | Hot air shimmer |

---

## Masking / Stencil System

Masks are float32 arrays `(rows, cols)` or `(VH, VW)` in range [0, 1]. They control where effects are visible: 1.0 = fully visible, 0.0 = fully hidden. Use masks to create figure/ground relationships, focal points, and shaped reveals.

### Shape Masks

```python
def mask_circle(g, cx_frac=0.5, cy_frac=0.5, radius=0.3, feather=0.05):
    """Circular mask centered at (cx_frac, cy_frac) in normalized coords.
    feather: width of soft edge (0 = hard cutoff)."""
    asp = g.cw / g.ch if hasattr(g, 'cw') else 1.0
    dx = (g.cc / g.cols - cx_frac)
    dy = (g.rr / g.rows - cy_frac) * asp
    d = np.sqrt(dx**2 + dy**2)
    if feather > 0:
        return np.clip(1.0 - (d - radius) / feather, 0, 1)
    return (d <= radius).astype(np.float32)

def mask_rect(g, x0=0.2, y0=0.2, x1=0.8, y1=0.8, feather=0.03):
    """Rectangular mask. Coordinates in [0,1] normalized."""
    dx = np.maximum(x0 - g.cc / g.cols, g.cc / g.cols - x1)
    dy = np.maximum(y0 - g.rr / g.rows, g.rr / g.rows - y1)
    d = np.maximum(dx, dy)
    if feather > 0:
        return np.clip(1.0 - d / feather, 0, 1)
    return (d <= 0).astype(np.float32)

def mask_ring(g, cx_frac=0.5, cy_frac=0.5, inner_r=0.15, outer_r=0.35,
              feather=0.03):
    """Ring / annulus mask."""
    inner = mask_circle(g, cx_frac, cy_frac, inner_r, feather)
    outer = mask_circle(g, cx_frac, cy_frac, outer_r, feather)
    return outer - inner

def mask_gradient_h(g, start=0.0, end=1.0):
    """Left-to-right gradient mask."""
    return np.clip((g.cc / g.cols - start) / (end - start + 1e-10), 0, 1).astype(np.float32)

def mask_gradient_v(g, start=0.0, end=1.0):
    """Top-to-bottom gradient mask."""
    return np.clip((g.rr / g.rows - start) / (end - start + 1e-10), 0, 1).astype(np.float32)

def mask_gradient_radial(g, cx_frac=0.5, cy_frac=0.5, inner=0.0, outer=0.5):
    """Radial gradient mask — bright at center, dark at edges."""
    d = np.sqrt((g.cc / g.cols - cx_frac)**2 + (g.rr / g.rows - cy_frac)**2)
    return np.clip(1.0 - (d - inner) / (outer - inner + 1e-10), 0, 1)
```

### Value Field as Mask

Use any `vf_*` function's output as a spatial mask:

```python
def mask_from_vf(vf_result, threshold=0.5, feather=0.1):
    """Convert a value field to a mask by thresholding.
    feather: smooth edge width around threshold."""
    if feather > 0:
        return np.clip((vf_result - threshold + feather) / (2 * feather), 0, 1)
    return (vf_result > threshold).astype(np.float32)

def mask_select(mask, vf_a, vf_b):
    """Spatial conditional: show vf_a where mask is 1, vf_b where mask is 0.
    mask: float32 [0,1] array. Intermediate values blend."""
    return vf_a * mask + vf_b * (1 - mask)
```

### Text Stencil

Render text to a mask. Effects are visible only through the letterforms:

```python
def mask_text(grid, text, row_frac=0.5, font=None, font_size=None):
    """Render text string as a float32 mask [0,1] at grid resolution.
    Characters = 1.0, background = 0.0.

    row_frac: vertical position as fraction of grid height.
    font: PIL ImageFont (defaults to grid's font if None).
    font_size: override font size for the mask text (for larger stencil text).
    """
    from PIL import Image, ImageDraw, ImageFont

    f = font or grid.font
    if font_size and font != grid.font:
        f = ImageFont.truetype(font.path, font_size)

    # Render text to image at pixel resolution, then downsample to grid
    img = Image.new("L", (grid.cols * grid.cw, grid.ch), 0)
    draw = ImageDraw.Draw(img)
    bbox = draw.textbbox((0, 0), text, font=f)
    tw = bbox[2] - bbox[0]
    x = (grid.cols * grid.cw - tw) // 2
    draw.text((x, 0), text, fill=255, font=f)
    row_mask = np.array(img, dtype=np.float32) / 255.0

    # Place in full grid mask
    mask = np.zeros((grid.rows, grid.cols), dtype=np.float32)
    target_row = int(grid.rows * row_frac)
    # Downsample rendered text to grid cells
    for c in range(grid.cols):
        px = c * grid.cw
        if px + grid.cw <= row_mask.shape[1]:
            cell = row_mask[:, px:px + grid.cw]
            if cell.mean() > 0.1:
                mask[target_row, c] = cell.mean()
    return mask

def mask_text_block(grid, lines, start_row_frac=0.3, font=None):
    """Multi-line text stencil. Returns full grid mask."""
    mask = np.zeros((grid.rows, grid.cols), dtype=np.float32)
    for i, line in enumerate(lines):
        row_frac = start_row_frac + i / grid.rows
        line_mask = mask_text(grid, line, row_frac, font)
        mask = np.maximum(mask, line_mask)
    return mask
```

### Animated Masks

Masks that change over time for reveals, wipes, and morphing:

```python
def mask_iris(g, t, t_start, t_end, cx_frac=0.5, cy_frac=0.5,
              max_radius=0.7, ease_fn=None):
    """Iris open/close: circle that grows from 0 to max_radius.
    ease_fn: easing function (default: ease_in_out_cubic from effects.md)."""
    if ease_fn is None:
        ease_fn = lambda x: x * x * (3 - 2 * x)  # smoothstep fallback
    progress = np.clip((t - t_start) / (t_end - t_start), 0, 1)
    radius = ease_fn(progress) * max_radius
    return mask_circle(g, cx_frac, cy_frac, radius, feather=0.03)

def mask_wipe_h(g, t, t_start, t_end, direction="right"):
    """Horizontal wipe reveal."""
    progress = np.clip((t - t_start) / (t_end - t_start), 0, 1)
    if direction == "left":
        progress = 1 - progress
    return mask_gradient_h(g, start=progress - 0.05, end=progress + 0.05)

def mask_wipe_v(g, t, t_start, t_end, direction="down"):
    """Vertical wipe reveal."""
    progress = np.clip((t - t_start) / (t_end - t_start), 0, 1)
    if direction == "up":
        progress = 1 - progress
    return mask_gradient_v(g, start=progress - 0.05, end=progress + 0.05)

def mask_dissolve(g, t, t_start, t_end, seed=42):
    """Random pixel dissolve — noise threshold sweeps from 0 to 1."""
    progress = np.clip((t - t_start) / (t_end - t_start), 0, 1)
    rng = np.random.RandomState(seed)
    noise = rng.random((g.rows, g.cols)).astype(np.float32)
    return (noise < progress).astype(np.float32)
```

### Mask Boolean Operations

```python
def mask_union(a, b):
    """OR — visible where either mask is active."""
    return np.maximum(a, b)

def mask_intersect(a, b):
    """AND — visible only where both masks are active."""
    return np.minimum(a, b)

def mask_subtract(a, b):
    """A minus B — visible where A is active but B is not."""
    return np.clip(a - b, 0, 1)

def mask_invert(m):
    """NOT — flip mask."""
    return 1.0 - m
```

### Applying Masks to Canvases

```python
def apply_mask_canvas(canvas, mask, bg_canvas=None):
    """Apply a grid-resolution mask to a pixel canvas.
    Expands mask from (rows, cols) to (VH, VW) via nearest-neighbor.

    canvas: uint8 (VH, VW, 3)
    mask: float32 (rows, cols) [0,1]
    bg_canvas: what shows through where mask=0. None = black.
    """
    # Expand mask to pixel resolution
    mask_px = np.repeat(np.repeat(mask, canvas.shape[0] // mask.shape[0] + 1, axis=0),
                        canvas.shape[1] // mask.shape[1] + 1, axis=1)
    mask_px = mask_px[:canvas.shape[0], :canvas.shape[1]]

    if bg_canvas is not None:
        return np.clip(canvas * mask_px[:, :, None] +
                       bg_canvas * (1 - mask_px[:, :, None]), 0, 255).astype(np.uint8)
    return np.clip(canvas * mask_px[:, :, None], 0, 255).astype(np.uint8)

def apply_mask_vf(vf_a, vf_b, mask):
    """Apply mask at value-field level — blend two value fields spatially.
    All arrays are (rows, cols) float32."""
    return vf_a * mask + vf_b * (1 - mask)
```

---

## PixelBlendStack

Higher-level wrapper for multi-layer compositing:

```python
class PixelBlendStack:
    def __init__(self):
        self.layers = []

    def add(self, canvas, mode="normal", opacity=1.0):
        self.layers.append((canvas, mode, opacity))
        return self

    def composite(self):
        if not self.layers:
            return np.zeros((VH, VW, 3), dtype=np.uint8)
        result = self.layers[0][0]
        for canvas, mode, opacity in self.layers[1:]:
            result = blend_canvas(result, canvas, mode, opacity)
        return result
```

## Text Backdrop (Readability Mask)

When placing readable text over busy multi-grid ASCII backgrounds, the text will blend into the background and become illegible. **Always apply a dark backdrop behind text regions.**

The technique: compute the bounding box of all text glyphs, create a gaussian-blurred dark mask covering that area with padding, and multiply the background by `(1 - mask * darkness)` before rendering text on top.

```python
from scipy.ndimage import gaussian_filter

def apply_text_backdrop(canvas, glyphs, padding=80, darkness=0.75):
    """Darken the background behind text for readability.
    
    Call AFTER rendering background, BEFORE rendering text.
    
    Args:
        canvas: (VH, VW, 3) uint8 background
        glyphs: list of {"x": float, "y": float, ...} glyph positions
        padding: pixel padding around text bounding box
        darkness: 0.0 = no darkening, 1.0 = fully black
    Returns:
        darkened canvas (uint8)
    """
    if not glyphs:
        return canvas
    xs = [g['x'] for g in glyphs]
    ys = [g['y'] for g in glyphs]
    x0 = max(0, int(min(xs)) - padding)
    y0 = max(0, int(min(ys)) - padding)
    x1 = min(VW, int(max(xs)) + padding + 50)   # extra for char width
    y1 = min(VH, int(max(ys)) + padding + 60)   # extra for char height
    
    # Soft dark mask with gaussian blur for feathered edges
    mask = np.zeros((VH, VW), dtype=np.float32)
    mask[y0:y1, x0:x1] = 1.0
    mask = gaussian_filter(mask, sigma=padding * 0.6)
    
    factor = 1.0 - mask * darkness
    return (canvas.astype(np.float32) * factor[:, :, np.newaxis]).astype(np.uint8)
```

### Usage in render pipeline

Insert between background rendering and text rendering:

```python
# 1. Render background (multi-grid ASCII effects)
bg = render_background(cfg, t)

# 2. Darken behind text region
bg = apply_text_backdrop(bg, frame_glyphs, padding=80, darkness=0.75)

# 3. Render text on top (now readable against dark backdrop)
bg = text_renderer.render(bg, frame_glyphs, color=(255, 255, 255))
```

Combine with **reverse vignette** (see shaders.md) for scenes where text is always centered — the reverse vignette provides a persistent center-dark zone, while the backdrop handles per-frame glyph positions.

## External Layout Oracle Pattern

For text-heavy videos where text needs to dynamically reflow around obstacles (shapes, icons, other text), use an external layout engine to pre-compute glyph positions and feed them into the Python renderer via JSON.

### Architecture

```
Layout Engine (browser/Node.js)  →  layouts.json  →  Python ASCII Renderer
         ↑                                                    ↑
   Computes per-frame                               Reads glyph positions,
   glyph (x,y) positions                            renders as ASCII chars
   with obstacle-aware reflow                        with full effect pipeline
```

### JSON interchange format

```json
{
  "meta": {
    "canvas_width": 1080, "canvas_height": 1080,
    "fps": 24, "total_frames": 1248,
    "fonts": {
      "body": {"charW": 12.04, "charH": 24, "fontSize": 20},
      "hero": {"charW": 24.08, "charH": 48, "fontSize": 40}
    }
  },
  "scenes": [
    {
      "id": "scene_name",
      "start_frame": 0, "end_frame": 96,
      "frames": {
        "0": {
          "glyphs": [
            {"char": "H", "x": 287.1, "y": 400.0, "alpha": 1.0},
            {"char": "e", "x": 311.2, "y": 400.0, "alpha": 1.0}
          ],
          "obstacles": [
            {"type": "circle", "cx": 540, "cy": 540, "r": 80},
            {"type": "rect", "x": 300, "y": 500, "w": 120, "h": 80}
          ]
        }
      }
    }
  ]
}
```

### When to use

- Text that dynamically reflows around moving objects
- Per-glyph animation (reveal, scatter, physics)
- Variable typography that needs precise measurement
- Any case where Python's Pillow text layout is insufficient

### When NOT to use

- Static centered text (just use PIL `draw.text()` directly)
- Text that only fades in/out without spatial animation
- Simple typewriter effects (handle in Python with a character counter)

### Running the oracle

Use Playwright to run the layout engine in a headless browser:

```javascript
// extract.mjs
import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto(`file://${oraclePath}`);
await page.waitForFunction(() => window.__ORACLE_DONE__ === true, null, { timeout: 60000 });
const result = await page.evaluate(() => window.__ORACLE_RESULT__);
writeFileSync('layouts.json', JSON.stringify(result));
await browser.close();
```

### Consuming in Python

```python
# In the renderer, map pixel positions to the canvas:
for glyph in frame_data['glyphs']:
    char, px, py = glyph['char'], glyph['x'], glyph['y']
    alpha = glyph.get('alpha', 1.0)
    # Render using PIL draw.text() at exact pixel position
    draw.text((px, py), char, fill=(int(255*alpha),)*3, font=font)
```

Obstacles from the JSON can also be rendered as glowing ASCII shapes (circles, rectangles) to visualize the reflow zones.
