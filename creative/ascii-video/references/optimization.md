# Optimization Reference

> **See also:** architecture.md · composition.md · scenes.md · shaders.md · inputs.md · troubleshooting.md

## Hardware Detection

Detect the user's hardware at script startup and adapt rendering parameters automatically. Never hardcode worker counts or resolution.

### CPU and Memory Detection

```python
import multiprocessing
import platform
import shutil
import os

def detect_hardware():
    """Detect hardware capabilities and return render config."""
    cpu_count = multiprocessing.cpu_count()
    
    # Leave 1-2 cores free for OS + ffmpeg encoding
    if cpu_count >= 16:
        workers = cpu_count - 2
    elif cpu_count >= 8:
        workers = cpu_count - 1
    elif cpu_count >= 4:
        workers = cpu_count - 1
    else:
        workers = max(1, cpu_count)
    
    # Memory detection (platform-specific)
    try:
        if platform.system() == "Darwin":
            import subprocess
            mem_bytes = int(subprocess.check_output(["sysctl", "-n", "hw.memsize"]).strip())
        elif platform.system() == "Linux":
            with open("/proc/meminfo") as f:
                for line in f:
                    if line.startswith("MemTotal"):
                        mem_bytes = int(line.split()[1]) * 1024
                        break
        else:
            mem_bytes = 8 * 1024**3  # assume 8GB on unknown
    except Exception:
        mem_bytes = 8 * 1024**3

    mem_gb = mem_bytes / (1024**3)
    
    # Each worker uses ~50-150MB depending on grid sizes
    # Cap workers if memory is tight
    mem_per_worker_mb = 150
    max_workers_by_mem = int(mem_gb * 1024 * 0.6 / mem_per_worker_mb)  # use 60% of RAM
    workers = min(workers, max_workers_by_mem)
    
    # ffmpeg availability and codec support
    has_ffmpeg = shutil.which("ffmpeg") is not None
    
    return {
        "cpu_count": cpu_count,
        "workers": workers,
        "mem_gb": mem_gb,
        "platform": platform.system(),
        "arch": platform.machine(),
        "has_ffmpeg": has_ffmpeg,
    }
```

### Adaptive Quality Profiles

Scale resolution, FPS, CRF, and grid density based on hardware:

```python
def quality_profile(hw, target_duration_s, user_preference="auto"):
    """
    Returns render settings adapted to hardware.
    user_preference: "auto", "draft", "preview", "production", "max"
    """
    if user_preference == "draft":
        return {"vw": 960, "vh": 540, "fps": 12, "crf": 28, "workers": min(4, hw["workers"]),
                "grid_scale": 0.5, "shaders": "minimal", "particles_max": 200}
    
    if user_preference == "preview":
        return {"vw": 1280, "vh": 720, "fps": 15, "crf": 25, "workers": hw["workers"],
                "grid_scale": 0.75, "shaders": "standard", "particles_max": 500}
    
    if user_preference == "max":
        return {"vw": 3840, "vh": 2160, "fps": 30, "crf": 15, "workers": hw["workers"],
                "grid_scale": 2.0, "shaders": "full", "particles_max": 3000}
    
    # "production" or "auto"
    # Auto-detect: estimate render time, downgrade if it would take too long
    n_frames = int(target_duration_s * 24)
    est_seconds_per_frame = 0.18  # ~180ms at 1080p
    est_total_s = n_frames * est_seconds_per_frame / max(1, hw["workers"])
    
    if hw["mem_gb"] < 4 or hw["cpu_count"] <= 2:
        # Low-end: 720p, 15fps
        return {"vw": 1280, "vh": 720, "fps": 15, "crf": 23, "workers": hw["workers"],
                "grid_scale": 0.75, "shaders": "standard", "particles_max": 500}
    
    if est_total_s > 3600:  # would take over an hour
        # Downgrade to 720p to speed up
        return {"vw": 1280, "vh": 720, "fps": 24, "crf": 20, "workers": hw["workers"],
                "grid_scale": 0.75, "shaders": "standard", "particles_max": 800}
    
    # Standard production: 1080p 24fps
    return {"vw": 1920, "vh": 1080, "fps": 24, "crf": 20, "workers": hw["workers"],
            "grid_scale": 1.0, "shaders": "full", "particles_max": 1200}


def apply_quality_profile(profile):
    """Set globals from quality profile."""
    global VW, VH, FPS, N_WORKERS
    VW = profile["vw"]
    VH = profile["vh"]
    FPS = profile["fps"]
    N_WORKERS = profile["workers"]
    # Grid sizes scale with resolution
    # CRF passed to ffmpeg encoder
    # Shader set determines which post-processing is active
```

### CLI Integration

```python
parser = argparse.ArgumentParser()
parser.add_argument("--quality", choices=["draft", "preview", "production", "max", "auto"],
                    default="auto", help="Render quality preset")
parser.add_argument("--aspect", choices=["landscape", "portrait", "square"],
                    default="landscape", help="Aspect ratio preset")
parser.add_argument("--workers", type=int, default=0, help="Override worker count (0=auto)")
parser.add_argument("--resolution", type=str, default="", help="Override resolution e.g. 1280x720")
args = parser.parse_args()

hw = detect_hardware()
if args.workers > 0:
    hw["workers"] = args.workers
profile = quality_profile(hw, target_duration, args.quality)

# Apply aspect ratio preset (before manual resolution override)
ASPECT_PRESETS = {
    "landscape": (1920, 1080),
    "portrait":  (1080, 1920),
    "square":    (1080, 1080),
}
if args.aspect != "landscape" and not args.resolution:
    profile["vw"], profile["vh"] = ASPECT_PRESETS[args.aspect]

if args.resolution:
    w, h = args.resolution.split("x")
    profile["vw"], profile["vh"] = int(w), int(h)
apply_quality_profile(profile)

log(f"Hardware: {hw['cpu_count']} cores, {hw['mem_gb']:.1f}GB RAM, {hw['platform']}")
log(f"Render:   {profile['vw']}x{profile['vh']} @{profile['fps']}fps, "
    f"CRF {profile['crf']}, {profile['workers']} workers")
```

### Portrait Mode Considerations

Portrait (1080x1920) has the same pixel count as landscape 1080p, so performance is equivalent. But composition patterns differ:

| Concern | Landscape | Portrait |
|---------|-----------|----------|
| Grid cols at `lg` | 160 | 90 |
| Grid rows at `lg` | 45 | 80 |
| Max text line chars | ~50 centered | ~25-30 centered |
| Vertical rain | Short travel | Long, dramatic travel |
| Horizontal spectrum | Full width | Needs rotation or compression |
| Radial effects | Natural circles | Tall ellipses (aspect correction handles this) |
| Particle explosions | Wide spread | Tall spread |
| Text stacking | 3-4 lines comfortable | 8-10 lines comfortable |
| Quote layout | 2-3 wide lines | 5-6 short lines |

**Portrait-optimized patterns:**
- Vertical rain/matrix effects are naturally enhanced — longer column travel
- Fire columns rise through more screen space
- Rising embers/particles have more vertical runway
- Text can be stacked more aggressively with more lines
- Radial effects work if aspect correction is applied (GridLayer handles this automatically)
- Spectrum bars can be rotated 90 degrees (vertical bars from bottom)

**Portrait text layout:**
```python
def layout_text_portrait(text, max_chars_per_line=25, grid=None):
    """Break text into short lines for portrait display."""
    words = text.split()
    lines = []; current = ""
    for w in words:
        if len(current) + len(w) + 1 > max_chars_per_line:
            lines.append(current.strip())
            current = w + " "
        else:
            current += w + " "
    if current.strip():
        lines.append(current.strip())
    return lines
```

## Performance Budget

Target: 100-200ms per frame (5-10 fps single-threaded, 40-80 fps across 8 workers).

| Component | Time | Notes |
|-----------|------|-------|
| Feature extraction | 1-5ms | Pre-computed for all frames before render |
| Effect function | 2-15ms | Vectorized numpy, avoid Python loops |
| Character render | 80-150ms | **Bottleneck** -- per-cell Python loop |
| Shader pipeline | 5-25ms | Depends on active shaders |
| ffmpeg encode | ~5ms | Amortized by pipe buffering |

## Bitmap Pre-Rasterization

Rasterize every character at init, not per-frame:

```python
# At init time -- done once
for c in all_characters:
    img = Image.new("L", (cell_w, cell_h), 0)
    ImageDraw.Draw(img).text((0, 0), c, fill=255, font=font)
    bitmaps[c] = np.array(img, dtype=np.float32) / 255.0  # float32 for fast multiply

# At render time -- fast lookup
bitmap = bitmaps[char]
canvas[y:y+ch, x:x+cw] = np.maximum(canvas[y:y+ch, x:x+cw],
                                      (bitmap[:,:,None] * color).astype(np.uint8))
```

Collect all characters from all palettes + overlay text into the init set. Lazy-init for any missed characters.

## Pre-Rendered Background Textures

Alternative to `_render_vf()` for backgrounds where characters don't need to change every frame. Pre-bake a static ASCII texture once at init, then multiply by a per-cell color field each frame. One matrix multiply vs thousands of bitmap blits.

Use when: background layer uses a fixed character palette and only color/brightness varies per frame. NOT suitable for layers where character selection depends on a changing value field.

### Init: Bake the Texture

```python
# In GridLayer.__init__:
self._bg_row_idx = np.clip(
    (np.arange(VH) - self.oy) // self.ch, 0, self.rows - 1
)
self._bg_col_idx = np.clip(
    (np.arange(VW) - self.ox) // self.cw, 0, self.cols - 1
)
self._bg_textures = {}

def make_bg_texture(self, palette):
    """Pre-render a static ASCII texture (grayscale float32) once."""
    if palette not in self._bg_textures:
        texture = np.zeros((VH, VW), dtype=np.float32)
        rng = random.Random(12345)
        ch_list = [c for c in palette if c != " " and c in self.bm]
        if not ch_list:
            ch_list = list(self.bm.keys())[:5]
        for row in range(self.rows):
            y = self.oy + row * self.ch
            if y + self.ch > VH:
                break
            for col in range(self.cols):
                x = self.ox + col * self.cw
                if x + self.cw > VW:
                    break
                bm = self.bm[rng.choice(ch_list)]
                texture[y:y+self.ch, x:x+self.cw] = bm
        self._bg_textures[palette] = texture
    return self._bg_textures[palette]
```

### Render: Color Field x Cached Texture

```python
def render_bg(self, color_field, palette=PAL_CIRCUIT):
    """Fast background: pre-rendered ASCII texture * per-cell color field.
    color_field: (rows, cols, 3) uint8. Returns (VH, VW, 3) uint8."""
    texture = self.make_bg_texture(palette)
    # Expand cell colors to pixel coords via pre-computed index maps
    color_px = color_field[
        self._bg_row_idx[:, None], self._bg_col_idx[None, :]
    ].astype(np.float32)
    return (texture[:, :, None] * color_px).astype(np.uint8)
```

### Usage in a Scene

```python
# Build per-cell color from effect fields (cheap — rows*cols, not VH*VW)
hue = ((t * 0.05 + val * 0.2) % 1.0).astype(np.float32)
R, G, B = hsv2rgb(hue, np.full_like(val, 0.5), val)
color_field = mkc(R, G, B, g.rows, g.cols)  # (rows, cols, 3) uint8

# Render background — single matrix multiply, no per-cell loop
canvas_bg = g.render_bg(color_field, PAL_DENSE)
```

The texture init loop runs once and is cached per palette. Per-frame cost is one fancy-index lookup + one broadcast multiply — orders of magnitude faster than the per-cell bitmap blit loop in `render()` for dense backgrounds.

## Coordinate Array Caching

Pre-compute all grid-relative coordinate arrays at init, not per-frame:

```python
# These are O(rows*cols) and used in every effect
self.rr = np.arange(rows)[:, None]    # row indices
self.cc = np.arange(cols)[None, :]    # col indices
self.dist = np.sqrt(dx**2 + dy**2)   # distance from center
self.angle = np.arctan2(dy, dx)       # angle from center
self.dist_n = ...                      # normalized distance
```

## Vectorized Effect Patterns

### Avoid Per-Cell Python Loops in Effects

The render loop (compositing bitmaps) is unavoidably per-cell. But effect functions must be fully vectorized numpy -- never iterate over rows/cols in Python.

Bad (O(rows*cols) Python loop):
```python
for r in range(rows):
    for c in range(cols):
        val[r, c] = math.sin(c * 0.1 + t) * math.cos(r * 0.1 - t)
```

Good (vectorized):
```python
val = np.sin(g.cc * 0.1 + t) * np.cos(g.rr * 0.1 - t)
```

### Vectorized Matrix Rain

The naive per-column per-trail-pixel loop is the second biggest bottleneck after the render loop. Use numpy fancy indexing:

```python
# Instead of nested Python loops over columns and trail pixels:
# Build row index arrays for all active trail pixels at once
all_rows = []
all_cols = []
all_fades = []
for c in range(cols):
    head = int(S["ry"][c])
    trail_len = S["rln"][c]
    for i in range(trail_len):
        row = head - i
        if 0 <= row < rows:
            all_rows.append(row)
            all_cols.append(c)
            all_fades.append(1.0 - i / trail_len)

# Vectorized assignment
ar = np.array(all_rows)
ac = np.array(all_cols)
af = np.array(all_fades, dtype=np.float32)
# Assign chars and colors in bulk using fancy indexing
ch[ar, ac] = ...  # vectorized char assignment
co[ar, ac, 1] = (af * bri * 255).astype(np.uint8)  # green channel
```

### Vectorized Fire Columns

Same pattern -- accumulate index arrays, assign in bulk:

```python
fire_val = np.zeros((rows, cols), dtype=np.float32)
for fi in range(n_cols):
    fx_c = int((fi * cols / n_cols + np.sin(t * 2 + fi * 0.7) * 3) % cols)
    height = int(energy * rows * 0.7)
    dy = np.arange(min(height, rows))
    fr = rows - 1 - dy
    frac = dy / max(height, 1)
    # Width spread: base columns wider at bottom
    for dx in range(-1, 2):  # 3-wide columns
        c = fx_c + dx
        if 0 <= c < cols:
            fire_val[fr, c] = np.maximum(fire_val[fr, c],
                                          (1 - frac * 0.6) * (0.5 + rms * 0.5))
# Now map fire_val to chars and colors in one vectorized pass
```

## PIL String Rendering for Text-Heavy Scenes

Alternative to per-cell bitmap blitting when rendering many long text strings (scrolling tickers, typewriter sequences, idea floods). Uses PIL's native `ImageDraw.text()` which renders an entire string in one C call, vs one Python-loop bitmap blit per character.

Typical win: a scene with 56 ticker rows renders 56 PIL `text()` calls instead of ~10K individual bitmap blits.

Use when: scene renders many rows of readable text strings. NOT suitable for sparse or spatially-scattered single characters (use normal `render()` for those).

```python
from PIL import Image, ImageDraw

def render_text_layer(grid, rows_data, font):
    """Render dense text rows via PIL instead of per-cell bitmap blitting.

    Args:
        grid: GridLayer instance (for oy, ch, ox, font metrics)
        rows_data: list of (row_index, text_string, rgb_tuple) — one per row
        font: PIL ImageFont instance (grid.font)

    Returns:
        uint8 array (VH, VW, 3) — canvas with rendered text
    """
    img = Image.new("RGB", (VW, VH), (0, 0, 0))
    draw = ImageDraw.Draw(img)
    for row_idx, text, color in rows_data:
        y = grid.oy + row_idx * grid.ch
        if y + grid.ch > VH:
            break
        draw.text((grid.ox, y), text, fill=color, font=font)
    return np.array(img)
```

### Usage in a Ticker Scene

```python
# Build ticker data (text + color per row)
rows_data = []
for row in range(n_tickers):
    text = build_ticker_text(row, t)       # scrolling substring
    color = hsv2rgb_scalar(hue, 0.85, bri) # (R, G, B) tuple
    rows_data.append((row, text, color))

# One PIL pass instead of thousands of bitmap blits
canvas_tickers = render_text_layer(g_md, rows_data, g_md.font)

# Blend with other layers normally
result = blend_canvas(canvas_bg, canvas_tickers, "screen", 0.9)
```

This is purely a rendering optimization — same visual output, fewer draw calls. The grid's `render()` method is still needed for sparse character fields where characters are placed individually based on value fields.

## Bloom Optimization

**Do NOT use `scipy.ndimage.uniform_filter`** -- measured at 424ms/frame.

Use 4x downsample + manual box blur instead -- 84ms/frame (5x faster):

```python
sm = canvas[::4, ::4].astype(np.float32)  # 4x downsample
br = np.where(sm > threshold, sm, 0)
for _ in range(3):                          # 3-pass manual box blur
    p = np.pad(br, ((1,1),(1,1),(0,0)), mode='edge')
    br = (p[:-2,:-2] + p[:-2,1:-1] + p[:-2,2:] +
          p[1:-1,:-2] + p[1:-1,1:-1] + p[1:-1,2:] +
          p[2:,:-2] + p[2:,1:-1] + p[2:,2:]) / 9.0
bl = np.repeat(np.repeat(br, 4, axis=0), 4, axis=1)[:H, :W]
```

## Vignette Caching

Distance field is resolution- and strength-dependent, never changes per frame:

```python
_vig_cache = {}
def sh_vignette(canvas, strength):
    key = (canvas.shape[0], canvas.shape[1], round(strength, 2))
    if key not in _vig_cache:
        Y = np.linspace(-1, 1, H)[:, None]
        X = np.linspace(-1, 1, W)[None, :]
        _vig_cache[key] = np.clip(1.0 - np.sqrt(X**2+Y**2) * strength, 0.15, 1).astype(np.float32)
    return np.clip(canvas * _vig_cache[key][:,:,None], 0, 255).astype(np.uint8)
```

Same pattern for CRT barrel distortion (cache remap coordinates).

## Film Grain Optimization

Generate noise at half resolution, tile up:

```python
noise = np.random.randint(-amt, amt+1, (H//2, W//2, 1), dtype=np.int16)
noise = np.repeat(np.repeat(noise, 2, axis=0), 2, axis=1)[:H, :W]
```

2x blocky grain looks like film grain and costs 1/4 the random generation.

## Parallel Rendering

### Worker Architecture

```python
hw = detect_hardware()
N_WORKERS = hw["workers"]

# Batch splitting (for non-clip architectures)
batch_size = (n_frames + N_WORKERS - 1) // N_WORKERS
batches = [(i, i*batch_size, min((i+1)*batch_size, n_frames), features, seg_path) ...]

with multiprocessing.Pool(N_WORKERS) as pool:
    segments = pool.starmap(render_batch, batches)
```

### Per-Clip Parallelism (Preferred for Segmented Videos)

```python
from concurrent.futures import ProcessPoolExecutor, as_completed

with ProcessPoolExecutor(max_workers=N_WORKERS) as pool:
    futures = {pool.submit(render_clip, seg, features, path): seg["id"]
               for seg, path in clip_args}
    for fut in as_completed(futures):
        clip_id = futures[fut]
        try:
            fut.result()
            log(f"  {clip_id} done")
        except Exception as e:
            log(f"  {clip_id} FAILED: {e}")
```

### Worker Isolation

Each worker:
- Creates its own `Renderer` instance (with full grid + bitmap init)
- Opens its own ffmpeg subprocess
- Has independent random seed (`random.seed(batch_id * 10000)`)
- Writes to its own segment file and stderr log

### ffmpeg Pipe Safety

**CRITICAL**: Never `stderr=subprocess.PIPE` with long-running ffmpeg. The stderr buffer fills at ~64KB and deadlocks:

```python
# WRONG -- will deadlock
pipe = subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=subprocess.PIPE)

# RIGHT -- stderr to file
stderr_fh = open(err_path, "w")
pipe = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=stderr_fh)
# ... write all frames ...
pipe.stdin.close()
pipe.wait()
stderr_fh.close()
```

### Concatenation

```python
with open(concat_file, "w") as cf:
    for seg in segments:
        cf.write(f"file '{seg}'\n")

cmd = ["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", concat_file]
if audio_path:
    cmd += ["-i", audio_path, "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest"]
else:
    cmd += ["-c:v", "copy"]
cmd.append(output_path)
subprocess.run(cmd, capture_output=True, check=True)
```

## Particle System Performance

Cap particle counts based on quality profile:

| System | Low | Standard | High |
|--------|-----|----------|------|
| Explosion | 300 | 1000 | 2500 |
| Embers | 500 | 1500 | 3000 |
| Starfield | 300 | 800 | 1500 |
| Dissolve | 200 | 600 | 1200 |

Cull by truncating lists:
```python
MAX_PARTICLES = profile.get("particles_max", 1200)
if len(S["px"]) > MAX_PARTICLES:
    for k in ("px", "py", "vx", "vy", "life", "char"):
        S[k] = S[k][-MAX_PARTICLES:]  # keep newest
```

## Memory Management

- Feature arrays: pre-computed for all frames, shared across workers via fork semantics (COW)
- Canvas: allocated once per worker, reused (`np.zeros(...)`)
- Character arrays: allocated per frame (cheap -- rows*cols U1 strings)
- Bitmap cache: ~500KB per grid size, initialized once per worker

Total memory per worker: ~50-150MB. Total: ~400-800MB for 8 workers.

For low-memory systems (< 4GB), reduce worker count and use smaller grids.

## Brightness Verification

After render, spot-check brightness at sample timestamps:

```python
for t in [2, 30, 60, 120, 180]:
    cmd = ["ffmpeg", "-ss", str(t), "-i", output_path,
           "-frames:v", "1", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"]
    r = subprocess.run(cmd, capture_output=True)
    arr = np.frombuffer(r.stdout, dtype=np.uint8)
    print(f"t={t}s  mean={arr.mean():.1f}  max={arr.max()}")
```

Target: mean > 5 for quiet sections, mean > 15 for active sections. If consistently below, increase brightness floor in effects and/or global boost multiplier.

## Render Time Estimates

Scale with hardware. Baseline: 1080p, 24fps, ~180ms/frame/worker.

| Duration | Frames | 4 workers | 8 workers | 16 workers |
|----------|--------|-----------|-----------|------------|
| 30s | 720 | ~3 min | ~2 min | ~1 min |
| 2 min | 2,880 | ~13 min | ~7 min | ~4 min |
| 3.5 min | 5,040 | ~23 min | ~12 min | ~6 min |
| 5 min | 7,200 | ~33 min | ~17 min | ~9 min |
| 10 min | 14,400 | ~65 min | ~33 min | ~17 min |

At 720p: multiply times by ~0.5. At 4K: multiply by ~4.

Heavier effects (many particles, dense grids, extra shader passes) add ~20-50%.

---

## Temp File Cleanup

Rendering generates intermediate files that accumulate across runs. Clean up after the final concat/mux step.

### Files to Clean

| File type | Source | Location |
|-----------|--------|----------|
| WAV extracts | `ffmpeg -i input.mp3 ... tmp.wav` | `tempfile.mktemp()` or project dir |
| Segment clips | `render_clip()` output | `segments/seg_00.mp4` etc. |
| Concat list | ffmpeg concat demuxer input | `segments/concat.txt` |
| ffmpeg stderr logs | piped to file for debugging | `*.log` in project dir |
| Feature cache | pickled numpy arrays | `*.pkl` or `*.npz` |

### Cleanup Function

```python
import glob
import tempfile
import shutil

def cleanup_render_artifacts(segments_dir="segments", keep_final=True):
    """Remove intermediate files after successful render.
    
    Call this AFTER verifying the final output exists and plays correctly.
    
    Args:
        segments_dir: directory containing segment clips and concat list
        keep_final: if True, only delete intermediates (not the final output)
    """
    removed = []
    
    # 1. Segment clips
    if os.path.isdir(segments_dir):
        shutil.rmtree(segments_dir)
        removed.append(f"directory: {segments_dir}")
    
    # 2. Temporary WAV files
    for wav in glob.glob("*.wav"):
        if wav.startswith("tmp") or wav.startswith("extracted_"):
            os.remove(wav)
            removed.append(wav)
    
    # 3. ffmpeg stderr logs
    for log in glob.glob("ffmpeg_*.log"):
        os.remove(log)
        removed.append(log)
    
    # 4. Feature cache (optional — useful to keep for re-renders)
    # for cache in glob.glob("features_*.npz"):
    #     os.remove(cache)
    #     removed.append(cache)
    
    print(f"Cleaned {len(removed)} artifacts: {removed}")
    return removed
```

### Integration with Render Pipeline

Call cleanup at the end of the main render script, after the final output is verified:

```python
# At end of main()
if os.path.exists(output_path) and os.path.getsize(output_path) > 1000:
    cleanup_render_artifacts(segments_dir="segments")
    print(f"Done. Output: {output_path}")
else:
    print("WARNING: final output missing or empty — skipping cleanup")
```

### Temp File Best Practices

- Use `tempfile.mkdtemp()` for segment directories — avoids polluting the project dir
- Name WAV extracts with `tempfile.mktemp(suffix=".wav")` so they're in the OS temp dir
- For debugging, set `KEEP_INTERMEDIATES=1` env var to skip cleanup
- Feature caches (`.npz`) are cheap to store and expensive to recompute — default to keeping them
