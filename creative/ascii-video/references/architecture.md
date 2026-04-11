# Architecture Reference

> **See also:** composition.md · effects.md · scenes.md · shaders.md · inputs.md · optimization.md · troubleshooting.md

## Grid System

### Resolution Presets

```python
RESOLUTION_PRESETS = {
    "landscape":  (1920, 1080),  # 16:9 — YouTube, default
    "portrait":   (1080, 1920),  # 9:16 — TikTok, Reels, Stories
    "square":     (1080, 1080),  # 1:1  — Instagram feed
    "ultrawide":  (2560, 1080),  # 21:9 — cinematic
    "landscape4k":(3840, 2160),  # 16:9 — 4K
    "portrait4k": (2160, 3840),  # 9:16 — 4K portrait
}

def get_resolution(preset="landscape", custom=None):
    """Returns (VW, VH) tuple."""
    if custom:
        return custom
    return RESOLUTION_PRESETS.get(preset, RESOLUTION_PRESETS["landscape"])
```

### Multi-Density Grids

Pre-initialize multiple grid sizes. Switch per section for visual variety. Grid dimensions auto-compute from resolution:

**Landscape (1920x1080):**

| Key | Font Size | Grid (cols x rows) | Use |
|-----|-----------|-------------------|-----|
| xs | 8 | 400x108 | Ultra-dense data fields |
| sm | 10 | 320x83 | Dense detail, rain, starfields |
| md | 16 | 192x56 | Default balanced, transitions |
| lg | 20 | 160x45 | Quote/lyric text (readable at 1080p) |
| xl | 24 | 137x37 | Short quotes, large titles |
| xxl | 40 | 80x22 | Giant text, minimal |

**Portrait (1080x1920):**

| Key | Font Size | Grid (cols x rows) | Use |
|-----|-----------|-------------------|-----|
| xs | 8 | 225x192 | Ultra-dense, tall data columns |
| sm | 10 | 180x148 | Dense detail, vertical rain |
| md | 16 | 112x100 | Default balanced |
| lg | 20 | 90x80 | Readable text (~30 chars/line centered) |
| xl | 24 | 75x66 | Short quotes, stacked |
| xxl | 40 | 45x39 | Giant text, minimal |

**Square (1080x1080):**

| Key | Font Size | Grid (cols x rows) | Use |
|-----|-----------|-------------------|-----|
| sm | 10 | 180x83 | Dense detail |
| md | 16 | 112x56 | Default balanced |
| lg | 20 | 90x45 | Readable text |

**Key differences in portrait mode:**
- Fewer columns (90 at `lg` vs 160) — lines must be shorter or wrap
- Many more rows (80 at `lg` vs 45) — vertical stacking is natural
- Aspect ratio correction flips: `asp = cw / ch` still works but the visual emphasis is vertical
- Radial effects appear as tall ellipses unless corrected
- Vertical effects (rain, embers, fire columns) are naturally enhanced
- Horizontal effects (spectrum bars, waveforms) need rotation or compression

**Grid sizing for text in portrait**: Use `lg` (20px) for 2-3 word lines. Max comfortable line length is ~25-30 chars. For longer quotes, break aggressively into many short lines stacked vertically — portrait has vertical space to spare. `xl` (24px) works for single words or very short phrases.

Grid dimensions: `cols = VW // cell_width`, `rows = VH // cell_height`.

### Font Selection

Don't hardcode a single font. Choose fonts to match the project's mood. Monospace fonts are required for grid alignment but vary widely in personality:

| Font | Personality | Platform |
|------|-------------|----------|
| Menlo | Clean, neutral, Apple-native | macOS |
| Monaco | Retro terminal, compact | macOS |
| Courier New | Classic typewriter, wide | Cross-platform |
| SF Mono | Modern, tight spacing | macOS |
| Consolas | Windows native, clean | Windows |
| JetBrains Mono | Developer, ligature-ready | Install |
| Fira Code | Geometric, modern | Install |
| IBM Plex Mono | Corporate, authoritative | Install |
| Source Code Pro | Adobe, balanced | Install |

**Font detection at init**: probe available fonts and fall back gracefully:

```python
import platform

def find_font(preferences):
    """Try fonts in order, return first that exists."""
    for name, path in preferences:
        if os.path.exists(path):
            return path
    raise FileNotFoundError(f"No monospace font found. Tried: {[p for _,p in preferences]}")

FONT_PREFS_MACOS = [
    ("Menlo", "/System/Library/Fonts/Menlo.ttc"),
    ("Monaco", "/System/Library/Fonts/Monaco.ttf"),
    ("SF Mono", "/System/Library/Fonts/SFNSMono.ttf"),
    ("Courier", "/System/Library/Fonts/Courier.ttc"),
]
FONT_PREFS_LINUX = [
    ("DejaVu Sans Mono", "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"),
    ("Liberation Mono", "/usr/share/fonts/truetype/liberation/LiberationMono-Regular.ttf"),
    ("Noto Sans Mono", "/usr/share/fonts/truetype/noto/NotoSansMono-Regular.ttf"),
    ("Ubuntu Mono", "/usr/share/fonts/truetype/ubuntu/UbuntuMono-R.ttf"),
]
FONT_PREFS_WINDOWS = [
    ("Consolas", r"C:\Windows\Fonts\consola.ttf"),
    ("Courier New", r"C:\Windows\Fonts\cour.ttf"),
    ("Lucida Console", r"C:\Windows\Fonts\lucon.ttf"),
    ("Cascadia Code", os.path.expandvars(r"%LOCALAPPDATA%\Microsoft\Windows\Fonts\CascadiaCode.ttf")),
    ("Cascadia Mono", os.path.expandvars(r"%LOCALAPPDATA%\Microsoft\Windows\Fonts\CascadiaMono.ttf")),
]

def _get_font_prefs():
    s = platform.system()
    if s == "Darwin":
        return FONT_PREFS_MACOS
    elif s == "Windows":
        return FONT_PREFS_WINDOWS
    return FONT_PREFS_LINUX

FONT_PREFS = _get_font_prefs()
```

**Multi-font rendering**: use different fonts for different layers (e.g., monospace for background, a bolder variant for overlay text). Each GridLayer owns its own font:

```python
grid_bg = GridLayer(find_font(FONT_PREFS), 16)       # background
grid_text = GridLayer(find_font(BOLD_PREFS), 20)      # readable text
```

### Collecting All Characters

Before initializing grids, gather all characters that need bitmap pre-rasterization:

```python
all_chars = set()
for pal in [PAL_DEFAULT, PAL_DENSE, PAL_BLOCKS, PAL_RUNE, PAL_KATA,
            PAL_GREEK, PAL_MATH, PAL_DOTS, PAL_BRAILLE, PAL_STARS,
            PAL_HALFFILL, PAL_HATCH, PAL_BINARY, PAL_MUSIC, PAL_BOX,
            PAL_CIRCUIT, PAL_ARROWS, PAL_HERMES]:  # ... all palettes used in project
    all_chars.update(pal)
# Add any overlay text characters
all_chars.update("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,-:;!?/|")
all_chars.discard(" ")  # space is never rendered
```

### GridLayer Initialization

Each grid pre-computes coordinate arrays for vectorized effect math. The grid automatically adapts to any resolution (landscape, portrait, square):

```python
class GridLayer:
    def __init__(self, font_path, font_size, vw=None, vh=None):
        """Initialize grid for any resolution.
        vw, vh: video width/height in pixels. Defaults to global VW, VH."""
        vw = vw or VW; vh = vh or VH
        self.vw = vw; self.vh = vh

        self.font = ImageFont.truetype(font_path, font_size)
        asc, desc = self.font.getmetrics()
        bbox = self.font.getbbox("M")
        self.cw = bbox[2] - bbox[0]  # character cell width
        self.ch = asc + desc  # CRITICAL: not textbbox height

        self.cols = vw // self.cw
        self.rows = vh // self.ch
        self.ox = (vw - self.cols * self.cw) // 2  # centering
        self.oy = (vh - self.rows * self.ch) // 2

        # Aspect ratio metadata
        self.aspect = vw / vh  # >1 = landscape, <1 = portrait, 1 = square
        self.is_portrait = vw < vh
        self.is_landscape = vw > vh

        # Index arrays
        self.rr = np.arange(self.rows, dtype=np.float32)[:, None]
        self.cc = np.arange(self.cols, dtype=np.float32)[None, :]

        # Polar coordinates (aspect-corrected)
        cx, cy = self.cols / 2.0, self.rows / 2.0
        asp = self.cw / self.ch
        self.dx = self.cc - cx
        self.dy = (self.rr - cy) * asp
        self.dist = np.sqrt(self.dx**2 + self.dy**2)
        self.angle = np.arctan2(self.dy, self.dx)

        # Normalized (0-1 range) -- for distance falloff
        self.dx_n = (self.cc - cx) / max(self.cols, 1)
        self.dy_n = (self.rr - cy) / max(self.rows, 1) * asp
        self.dist_n = np.sqrt(self.dx_n**2 + self.dy_n**2)

        # Pre-rasterize all characters to float32 bitmaps
        self.bm = {}
        for c in all_chars:
            img = Image.new("L", (self.cw, self.ch), 0)
            ImageDraw.Draw(img).text((0, 0), c, fill=255, font=self.font)
            self.bm[c] = np.array(img, dtype=np.float32) / 255.0
```

### Character Render Loop

The bottleneck. Composites pre-rasterized bitmaps onto pixel canvas:

```python
def render(self, chars, colors, canvas=None):
    if canvas is None:
        canvas = np.zeros((VH, VW, 3), dtype=np.uint8)
    for row in range(self.rows):
        y = self.oy + row * self.ch
        if y + self.ch > VH: break
        for col in range(self.cols):
            c = chars[row, col]
            if c == " ": continue
            x = self.ox + col * self.cw
            if x + self.cw > VW: break
            a = self.bm[c]  # float32 bitmap
            canvas[y:y+self.ch, x:x+self.cw] = np.maximum(
                canvas[y:y+self.ch, x:x+self.cw],
                (a[:, :, None] * colors[row, col]).astype(np.uint8))
    return canvas
```

Use `np.maximum` for additive blending (brighter chars overwrite dimmer ones, never darken).

### Multi-Layer Rendering

Render multiple grids onto the same canvas for depth:

```python
canvas = np.zeros((VH, VW, 3), dtype=np.uint8)
canvas = grid_lg.render(bg_chars, bg_colors, canvas)   # background layer
canvas = grid_md.render(main_chars, main_colors, canvas)  # main layer
canvas = grid_sm.render(detail_chars, detail_colors, canvas)  # detail overlay
```

---

## Character Palettes

### Design Principles

Character palettes are the primary visual texture of ASCII video. They control not just brightness mapping but the entire visual feel. Design palettes intentionally:

- **Visual weight**: characters sorted by the amount of ink/pixels they fill. Space is always index 0.
- **Coherence**: characters within a palette should belong to the same visual family.
- **Density curve**: the brightness-to-character mapping is nonlinear. Dense palettes (many chars) give smoother gradients; sparse palettes (5-8 chars) give posterized/graphic looks.
- **Rendering compatibility**: every character in the palette must exist in the font. Test at init and remove missing glyphs.

### Palette Library

Organized by visual family. Mix and match per project -- don't default to PAL_DEFAULT for everything.

#### Density / Brightness Palettes
```python
PAL_DEFAULT  = " .`'-:;!><=+*^~?/|(){}[]#&$@%"       # classic ASCII art
PAL_DENSE    = " .:;+=xX$#@\u2588"                          # simple 11-level ramp
PAL_MINIMAL  = " .:-=+#@"                               # 8-level, graphic
PAL_BINARY   = " \u2588"                                      # 2-level, extreme contrast
PAL_GRADIENT = " \u2591\u2592\u2593\u2588"                              # 4-level block gradient
```

#### Unicode Block Elements
```python
PAL_BLOCKS   = " \u2591\u2592\u2593\u2588\u2584\u2580\u2590\u258c"                 # standard blocks
PAL_BLOCKS_EXT = " \u2596\u2597\u2598\u2599\u259a\u259b\u259c\u259d\u259e\u259f\u2591\u2592\u2593\u2588"  # quadrant blocks (more detail)
PAL_SHADE    = " \u2591\u2592\u2593\u2588\u2587\u2586\u2585\u2584\u2583\u2582\u2581"          # vertical fill progression
```

#### Symbolic / Thematic
```python
PAL_MATH     = " \u00b7\u2218\u2219\u2022\u00b0\u00b1\u2213\u00d7\u00f7\u2248\u2260\u2261\u2264\u2265\u221e\u222b\u2211\u220f\u221a\u2207\u2202\u2206\u03a9"    # math symbols
PAL_BOX      = " \u2500\u2502\u250c\u2510\u2514\u2518\u251c\u2524\u252c\u2534\u253c\u2550\u2551\u2554\u2557\u255a\u255d\u2560\u2563\u2566\u2569\u256c"          # box drawing
PAL_CIRCUIT  = " .\u00b7\u2500\u2502\u250c\u2510\u2514\u2518\u253c\u25cb\u25cf\u25a1\u25a0\u2206\u2207\u2261"                 # circuit board
PAL_RUNE     = " .\u16a0\u16a2\u16a6\u16b1\u16b7\u16c1\u16c7\u16d2\u16d6\u16da\u16de\u16df"                   # elder futhark runes
PAL_ALCHEMIC = " \u2609\u263d\u2640\u2642\u2643\u2644\u2645\u2646\u2647\u2648\u2649\u264a\u264b"            # planetary/alchemical symbols
PAL_ZODIAC   = " \u2648\u2649\u264a\u264b\u264c\u264d\u264e\u264f\u2650\u2651\u2652\u2653"            # zodiac
PAL_ARROWS   = " \u2190\u2191\u2192\u2193\u2194\u2195\u2196\u2197\u2198\u2199\u21a9\u21aa\u21bb\u27a1"             # directional arrows
PAL_MUSIC    = " \u266a\u266b\u266c\u2669\u266d\u266e\u266f\u25cb\u25cf"                       # musical notation
```

#### Script / Writing System
```python
PAL_KATA     = " \u00b7\uff66\uff67\uff68\uff69\uff6a\uff6b\uff6c\uff6d\uff6e\uff6f\uff70\uff71\uff72\uff73\uff74\uff75\uff76\uff77"          # katakana halfwidth (matrix rain)
PAL_GREEK    = " \u03b1\u03b2\u03b3\u03b4\u03b5\u03b6\u03b7\u03b8\u03b9\u03ba\u03bb\u03bc\u03bd\u03be\u03c0\u03c1\u03c3\u03c4\u03c6\u03c8\u03c9"    # Greek lowercase
PAL_CYRILLIC = " \u0430\u0431\u0432\u0433\u0434\u0435\u0436\u0437\u0438\u043a\u043b\u043c\u043d\u043e\u043f\u0440\u0441\u0442\u0443\u0444\u0445\u0446\u0447\u0448"  # Cyrillic lowercase
PAL_ARABIC   = " \u0627\u0628\u062a\u062b\u062c\u062d\u062e\u062f\u0630\u0631\u0632\u0633\u0634\u0635\u0636\u0637"       # Arabic letters (isolated forms)
```

#### Dot / Point Progressions
```python
PAL_DOTS     = " ⋅∘∙●◉◎◆✦★"                   # dot size progression
PAL_BRAILLE  = " ⠁⠂⠃⠄⠅⠆⠇⠈⠉⠊⠋⠌⠍⠎⠏⠐⠑⠒⠓⠔⠕⠖⠗⠘⠙⠚⠛⠜⠝⠞⠟⠿"  # braille patterns
PAL_STARS    = " ·✧✦✩✨★✶✳✸"               # star progression
PAL_HALFFILL = " ◔◑◕◐◒◓◖◗◙"               # directional half-fill progression
PAL_HATCH    = " ▣▤▥▦▧▨▩"                     # crosshatch density ramp
```

#### Project-Specific (examples -- invent new ones per project)
```python
PAL_HERMES   = " .\u00b7~=\u2248\u221e\u26a1\u263f\u2726\u2605\u2295\u25ca\u25c6\u25b2\u25bc\u25cf\u25a0"   # mythology/tech blend
PAL_OCEAN    = " ~\u2248\u2248\u2248\u223c\u2307\u2248\u224b\u224c\u2248"                       # water/wave characters
PAL_ORGANIC  = " .\u00b0\u2218\u2022\u25e6\u25c9\u2742\u273f\u2741\u2743"                 # growing/botanical
PAL_MACHINE  = " _\u2500\u2502\u250c\u2510\u253c\u2261\u25a0\u2588\u2593\u2592\u2591"             # mechanical/industrial
```

### Creating Custom Palettes

When designing for a project, build palettes from the content's theme:

1. **Choose a visual family** (dots, blocks, symbols, script)
2. **Sort by visual weight** -- render each char at target font size, count lit pixels, sort ascending
3. **Test at target grid size** -- some chars collapse to blobs at small sizes
4. **Validate in font** -- remove chars the font can't render:

```python
def validate_palette(pal, font):
    """Remove characters the font can't render."""
    valid = []
    for c in pal:
        if c == " ":
            valid.append(c)
            continue
        img = Image.new("L", (20, 20), 0)
        ImageDraw.Draw(img).text((0, 0), c, fill=255, font=font)
        if np.array(img).max() > 0:  # char actually rendered something
            valid.append(c)
    return "".join(valid)
```

### Mapping Values to Characters

```python
def val2char(v, mask, pal=PAL_DEFAULT):
    """Map float array (0-1) to character array using palette."""
    n = len(pal)
    idx = np.clip((v * n).astype(int), 0, n - 1)
    out = np.full(v.shape, " ", dtype="U1")
    for i, ch in enumerate(pal):
        out[mask & (idx == i)] = ch
    return out
```

**Nonlinear mapping** for different visual curves:

```python
def val2char_gamma(v, mask, pal, gamma=1.0):
    """Gamma-corrected palette mapping. gamma<1 = brighter, gamma>1 = darker."""
    v_adj = np.power(np.clip(v, 0, 1), gamma)
    return val2char(v_adj, mask, pal)

def val2char_step(v, mask, pal, thresholds):
    """Custom threshold mapping. thresholds = list of float breakpoints."""
    out = np.full(v.shape, pal[0], dtype="U1")
    for i, thr in enumerate(thresholds):
        out[mask & (v > thr)] = pal[min(i + 1, len(pal) - 1)]
    return out
```

---

## Color System

### HSV->RGB (Vectorized)

All color computation in HSV for intuitive control, converted at render time:

```python
def hsv2rgb(h, s, v):
    """Vectorized HSV->RGB. h,s,v are numpy arrays. Returns (R,G,B) uint8 arrays."""
    h = h % 1.0
    c = v * s; x = c * (1 - np.abs((h*6) % 2 - 1)); m = v - c
    # ... 6 sector assignment ...
    return (np.clip((r+m)*255, 0, 255).astype(np.uint8),
            np.clip((g+m)*255, 0, 255).astype(np.uint8),
            np.clip((b+m)*255, 0, 255).astype(np.uint8))
```

### Color Mapping Strategies

Don't default to a single strategy. Choose based on the visual intent:

| Strategy | Hue source | Effect | Good for |
|----------|------------|--------|----------|
| Angle-mapped | `g.angle / (2*pi)` | Rainbow around center | Radial effects, kaleidoscopes |
| Distance-mapped | `g.dist_n * 0.3` | Gradient from center | Tunnels, depth effects |
| Frequency-mapped | `f["cent"] * 0.2` | Timbral color shifting | Audio-reactive |
| Value-mapped | `val * 0.15` | Brightness-dependent hue | Fire, heat maps |
| Time-cycled | `t * rate` | Slow color rotation | Ambient, chill |
| Source-sampled | Video frame pixel colors | Preserve original color | Video-to-ASCII |
| Palette-indexed | Discrete color lookup | Flat graphic style | Retro, pixel art |
| Temperature | Blend between warm/cool | Emotional tone | Mood-driven scenes |
| Complementary | `hue` and `hue + 0.5` | High contrast | Bold, dramatic |
| Triadic | `hue`, `hue + 0.33`, `hue + 0.66` | Vibrant, balanced | Psychedelic |
| Analogous | `hue +/- 0.08` | Harmonious, subtle | Elegant, cohesive |
| Monochrome | Fixed hue, vary S and V | Restrained, focused | Noir, minimal |

### Color Palettes (Discrete RGB)

For non-HSV workflows -- direct RGB color sets for graphic/retro looks:

```python
# Named color palettes -- use for flat/graphic styles or per-character coloring
COLORS_NEON = [(255,0,102), (0,255,153), (102,0,255), (255,255,0), (0,204,255)]
COLORS_PASTEL = [(255,179,186), (255,223,186), (255,255,186), (186,255,201), (186,225,255)]
COLORS_MONO_GREEN = [(0,40,0), (0,80,0), (0,140,0), (0,200,0), (0,255,0)]
COLORS_MONO_AMBER = [(40,20,0), (80,50,0), (140,90,0), (200,140,0), (255,191,0)]
COLORS_CYBERPUNK = [(255,0,60), (0,255,200), (180,0,255), (255,200,0)]
COLORS_VAPORWAVE = [(255,113,206), (1,205,254), (185,103,255), (5,255,161)]
COLORS_EARTH = [(86,58,26), (139,90,43), (189,154,91), (222,193,136), (245,230,193)]
COLORS_ICE = [(200,230,255), (150,200,240), (100,170,230), (60,130,210), (30,80,180)]
COLORS_BLOOD = [(80,0,0), (140,10,10), (200,20,20), (255,50,30), (255,100,80)]
COLORS_FOREST = [(10,30,10), (20,60,15), (30,100,20), (50,150,30), (80,200,50)]

def rgb_palette_map(val, mask, palette):
    """Map float array (0-1) to RGB colors from a discrete palette."""
    n = len(palette)
    idx = np.clip((val * n).astype(int), 0, n - 1)
    R = np.zeros(val.shape, dtype=np.uint8)
    G = np.zeros(val.shape, dtype=np.uint8)
    B = np.zeros(val.shape, dtype=np.uint8)
    for i, (r, g, b) in enumerate(palette):
        m = mask & (idx == i)
        R[m] = r; G[m] = g; B[m] = b
    return R, G, B
```

### OKLAB Color Space (Perceptually Uniform)

HSV hue is perceptually non-uniform: green occupies far more visual range than blue. OKLAB / OKLCH provide perceptually even color steps — hue increments of 0.1 look equally different regardless of starting hue. Use OKLAB for:
- Gradient interpolation (no unwanted intermediate hues)
- Color harmony generation (perceptually balanced palettes)
- Smooth color transitions over time

```python
# --- sRGB <-> Linear sRGB ---

def srgb_to_linear(c):
    """Convert sRGB [0,1] to linear light. c: float32 array."""
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)

def linear_to_srgb(c):
    """Convert linear light to sRGB [0,1]."""
    return np.where(c <= 0.0031308, c * 12.92, 1.055 * np.power(np.maximum(c, 0), 1/2.4) - 0.055)

# --- Linear sRGB <-> OKLAB ---

def linear_rgb_to_oklab(r, g, b):
    """Linear sRGB to OKLAB. r,g,b: float32 arrays [0,1].
    Returns (L, a, b) where L=[0,1], a,b=[-0.4, 0.4] approx."""
    l_ = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
    m_ = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
    s_ = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b
    l_c = np.cbrt(l_); m_c = np.cbrt(m_); s_c = np.cbrt(s_)
    L = 0.2104542553 * l_c + 0.7936177850 * m_c - 0.0040720468 * s_c
    a = 1.9779984951 * l_c - 2.4285922050 * m_c + 0.4505937099 * s_c
    b_ = 0.0259040371 * l_c + 0.7827717662 * m_c - 0.8086757660 * s_c
    return L, a, b_

def oklab_to_linear_rgb(L, a, b):
    """OKLAB to linear sRGB. Returns (r, g, b) float32 arrays [0,1]."""
    l_ = L + 0.3963377774 * a + 0.2158037573 * b
    m_ = L - 0.1055613458 * a - 0.0638541728 * b
    s_ = L - 0.0894841775 * a - 1.2914855480 * b
    l_c = l_ ** 3; m_c = m_ ** 3; s_c = s_ ** 3
    r = +4.0767416621 * l_c - 3.3077115913 * m_c + 0.2309699292 * s_c
    g = -1.2684380046 * l_c + 2.6097574011 * m_c - 0.3413193965 * s_c
    b_ = -0.0041960863 * l_c - 0.7034186147 * m_c + 1.7076147010 * s_c
    return np.clip(r, 0, 1), np.clip(g, 0, 1), np.clip(b_, 0, 1)

# --- Convenience: sRGB uint8 <-> OKLAB ---

def rgb_to_oklab(R, G, B):
    """sRGB uint8 arrays to OKLAB."""
    r = srgb_to_linear(R.astype(np.float32) / 255.0)
    g = srgb_to_linear(G.astype(np.float32) / 255.0)
    b = srgb_to_linear(B.astype(np.float32) / 255.0)
    return linear_rgb_to_oklab(r, g, b)

def oklab_to_rgb(L, a, b):
    """OKLAB to sRGB uint8 arrays."""
    r, g, b_ = oklab_to_linear_rgb(L, a, b)
    R = np.clip(linear_to_srgb(r) * 255, 0, 255).astype(np.uint8)
    G = np.clip(linear_to_srgb(g) * 255, 0, 255).astype(np.uint8)
    B = np.clip(linear_to_srgb(b_) * 255, 0, 255).astype(np.uint8)
    return R, G, B

# --- OKLCH (cylindrical form of OKLAB) ---

def oklab_to_oklch(L, a, b):
    """OKLAB to OKLCH. Returns (L, C, H) where H is in [0, 1] (normalized)."""
    C = np.sqrt(a**2 + b**2)
    H = (np.arctan2(b, a) / (2 * np.pi)) % 1.0
    return L, C, H

def oklch_to_oklab(L, C, H):
    """OKLCH to OKLAB. H in [0, 1]."""
    angle = H * 2 * np.pi
    a = C * np.cos(angle)
    b = C * np.sin(angle)
    return L, a, b
```

### Gradient Interpolation (OKLAB vs HSV)

Interpolating colors through OKLAB avoids the hue detours that HSV produces:

```python
def lerp_oklab(color_a, color_b, t_array):
    """Interpolate between two sRGB colors through OKLAB.
    color_a, color_b: (R, G, B) tuples 0-255
    t_array: float32 array [0,1] — interpolation parameter per pixel.
    Returns (R, G, B) uint8 arrays."""
    La, aa, ba = rgb_to_oklab(
        np.full_like(t_array, color_a[0], dtype=np.uint8),
        np.full_like(t_array, color_a[1], dtype=np.uint8),
        np.full_like(t_array, color_a[2], dtype=np.uint8))
    Lb, ab, bb = rgb_to_oklab(
        np.full_like(t_array, color_b[0], dtype=np.uint8),
        np.full_like(t_array, color_b[1], dtype=np.uint8),
        np.full_like(t_array, color_b[2], dtype=np.uint8))
    L = La + (Lb - La) * t_array
    a = aa + (ab - aa) * t_array
    b = ba + (bb - ba) * t_array
    return oklab_to_rgb(L, a, b)

def lerp_oklch(color_a, color_b, t_array, short_path=True):
    """Interpolate through OKLCH (preserves chroma, smooth hue path).
    short_path: take the shorter arc around the hue wheel."""
    La, aa, ba = rgb_to_oklab(
        np.full_like(t_array, color_a[0], dtype=np.uint8),
        np.full_like(t_array, color_a[1], dtype=np.uint8),
        np.full_like(t_array, color_a[2], dtype=np.uint8))
    Lb, ab, bb = rgb_to_oklab(
        np.full_like(t_array, color_b[0], dtype=np.uint8),
        np.full_like(t_array, color_b[1], dtype=np.uint8),
        np.full_like(t_array, color_b[2], dtype=np.uint8))
    L1, C1, H1 = oklab_to_oklch(La, aa, ba)
    L2, C2, H2 = oklab_to_oklch(Lb, ab, bb)
    # Shortest hue path
    if short_path:
        dh = H2 - H1
        dh = np.where(dh > 0.5, dh - 1.0, np.where(dh < -0.5, dh + 1.0, dh))
        H = (H1 + dh * t_array) % 1.0
    else:
        H = H1 + (H2 - H1) * t_array
    L = L1 + (L2 - L1) * t_array
    C = C1 + (C2 - C1) * t_array
    Lout, aout, bout = oklch_to_oklab(L, C, H)
    return oklab_to_rgb(Lout, aout, bout)
```

### Color Harmony Generation

Auto-generate harmonious palettes from a seed color:

```python
def harmony_complementary(seed_rgb):
    """Two colors: seed + opposite hue."""
    L, a, b = rgb_to_oklab(np.array([seed_rgb[0]]), np.array([seed_rgb[1]]), np.array([seed_rgb[2]]))
    _, C, H = oklab_to_oklch(L, a, b)
    return [seed_rgb, _oklch_to_srgb_tuple(L[0], C[0], (H[0] + 0.5) % 1.0)]

def harmony_triadic(seed_rgb):
    """Three colors: seed + two at 120-degree offsets."""
    L, a, b = rgb_to_oklab(np.array([seed_rgb[0]]), np.array([seed_rgb[1]]), np.array([seed_rgb[2]]))
    _, C, H = oklab_to_oklch(L, a, b)
    return [seed_rgb,
            _oklch_to_srgb_tuple(L[0], C[0], (H[0] + 0.333) % 1.0),
            _oklch_to_srgb_tuple(L[0], C[0], (H[0] + 0.667) % 1.0)]

def harmony_analogous(seed_rgb, spread=0.08, n=5):
    """N colors spread evenly around seed hue."""
    L, a, b = rgb_to_oklab(np.array([seed_rgb[0]]), np.array([seed_rgb[1]]), np.array([seed_rgb[2]]))
    _, C, H = oklab_to_oklch(L, a, b)
    offsets = np.linspace(-spread * (n-1)/2, spread * (n-1)/2, n)
    return [_oklch_to_srgb_tuple(L[0], C[0], (H[0] + off) % 1.0) for off in offsets]

def harmony_split_complementary(seed_rgb, split=0.08):
    """Three colors: seed + two flanking the complement."""
    L, a, b = rgb_to_oklab(np.array([seed_rgb[0]]), np.array([seed_rgb[1]]), np.array([seed_rgb[2]]))
    _, C, H = oklab_to_oklch(L, a, b)
    comp = (H[0] + 0.5) % 1.0
    return [seed_rgb,
            _oklch_to_srgb_tuple(L[0], C[0], (comp - split) % 1.0),
            _oklch_to_srgb_tuple(L[0], C[0], (comp + split) % 1.0)]

def harmony_tetradic(seed_rgb):
    """Four colors: two complementary pairs at 90-degree offset."""
    L, a, b = rgb_to_oklab(np.array([seed_rgb[0]]), np.array([seed_rgb[1]]), np.array([seed_rgb[2]]))
    _, C, H = oklab_to_oklch(L, a, b)
    return [seed_rgb,
            _oklch_to_srgb_tuple(L[0], C[0], (H[0] + 0.25) % 1.0),
            _oklch_to_srgb_tuple(L[0], C[0], (H[0] + 0.5) % 1.0),
            _oklch_to_srgb_tuple(L[0], C[0], (H[0] + 0.75) % 1.0)]

def _oklch_to_srgb_tuple(L, C, H):
    """Helper: single OKLCH -> sRGB (R,G,B) int tuple."""
    La = np.array([L]); Ca = np.array([C]); Ha = np.array([H])
    Lo, ao, bo = oklch_to_oklab(La, Ca, Ha)
    R, G, B = oklab_to_rgb(Lo, ao, bo)
    return (int(R[0]), int(G[0]), int(B[0]))
```

### OKLAB Hue Fields

Drop-in replacements for `hf_*` generators that produce perceptually uniform hue variation:

```python
def hf_oklch_angle(offset=0.0, chroma=0.12, lightness=0.7):
    """OKLCH hue mapped to angle from center. Perceptually uniform rainbow.
    Returns (R, G, B) uint8 color array instead of a float hue.
    NOTE: Use with _render_vf_rgb() variant, not standard _render_vf()."""
    def fn(g, f, t, S):
        H = (g.angle / (2 * np.pi) + offset + t * 0.05) % 1.0
        L = np.full_like(H, lightness)
        C = np.full_like(H, chroma)
        Lo, ao, bo = oklch_to_oklab(L, C, H)
        R, G, B = oklab_to_rgb(Lo, ao, bo)
        return mkc(R, G, B, g.rows, g.cols)
    return fn
```

### Compositing Helpers

```python
def mkc(R, G, B, rows, cols):
    """Pack 3 uint8 arrays into (rows, cols, 3) color array."""
    o = np.zeros((rows, cols, 3), dtype=np.uint8)
    o[:,:,0] = R; o[:,:,1] = G; o[:,:,2] = B
    return o

def layer_over(base_ch, base_co, top_ch, top_co):
    """Composite top layer onto base. Non-space chars overwrite."""
    m = top_ch != " "
    base_ch[m] = top_ch[m]; base_co[m] = top_co[m]
    return base_ch, base_co

def layer_blend(base_co, top_co, alpha):
    """Alpha-blend top color layer onto base. alpha is float array (0-1) or scalar."""
    if isinstance(alpha, (int, float)):
        alpha = np.full(base_co.shape[:2], alpha, dtype=np.float32)
    a = alpha[:,:,None]
    return np.clip(base_co * (1 - a) + top_co * a, 0, 255).astype(np.uint8)

def stamp(ch, co, text, row, col, color=(255,255,255)):
    """Write text string at position."""
    for i, c in enumerate(text):
        cc = col + i
        if 0 <= row < ch.shape[0] and 0 <= cc < ch.shape[1]:
            ch[row, cc] = c; co[row, cc] = color
```

---

## Section System

Map time ranges to effect functions + shader configs + grid sizes:

```python
SECTIONS = [
    (0.0, "void"), (3.94, "starfield"), (21.0, "matrix"),
    (46.0, "drop"), (130.0, "glitch"), (187.0, "outro"),
]

FX_DISPATCH = {"void": fx_void, "starfield": fx_starfield, ...}
SECTION_FX = {"void": {"vignette": 0.3, "bloom": 170}, ...}
SECTION_GRID = {"void": "md", "starfield": "sm", "drop": "lg", ...}
SECTION_MIRROR = {"drop": "h", "bass_rings": "quad"}

def get_section(t):
    sec = SECTIONS[0][1]
    for ts, name in SECTIONS:
        if t >= ts: sec = name
    return sec
```

---

## Parallel Encoding

Split frames across N workers. Each pipes raw RGB to its own ffmpeg subprocess:

```python
def render_batch(batch_id, frame_start, frame_end, features, seg_path):
    r = Renderer()
    cmd = ["ffmpeg", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
           "-s", f"{VW}x{VH}", "-r", str(FPS), "-i", "pipe:0",
           "-c:v", "libx264", "-preset", "fast", "-crf", "18",
           "-pix_fmt", "yuv420p", seg_path]

    # CRITICAL: stderr to file, not pipe
    stderr_fh = open(os.path.join(workdir, f"err_{batch_id:02d}.log"), "w")
    pipe = subprocess.Popen(cmd, stdin=subprocess.PIPE,
                            stdout=subprocess.DEVNULL, stderr=stderr_fh)

    for fi in range(frame_start, frame_end):
        t = fi / FPS
        sec = get_section(t)
        f = {k: float(features[k][fi]) for k in features}
        ch, co = FX_DISPATCH[sec](r, f, t)
        canvas = r.render(ch, co)
        canvas = apply_mirror(canvas, sec, f)
        canvas = apply_shaders(canvas, sec, f, t)
        pipe.stdin.write(canvas.tobytes())

    pipe.stdin.close()
    pipe.wait()
    stderr_fh.close()
```

Concatenate segments + mux audio:

```python
# Write concat file
with open(concat_path, "w") as cf:
    for seg in segments:
        cf.write(f"file '{seg}'\n")

subprocess.run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", concat_path,
                "-i", audio_path, "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
                "-shortest", output_path])
```

## Effect Function Contract

### v2 Protocol (Current)

Every scene function: `(r, f, t, S) -> canvas_uint8` — where `r` = Renderer, `f` = features dict, `t` = time float, `S` = persistent state dict

```python
def fx_example(r, f, t, S):
    """Scene function returns a full pixel canvas (uint8 H,W,3).
    Scenes have full control over multi-grid rendering and pixel-level composition.
    """
    # Render multiple layers at different grid densities
    canvas_a = _render_vf(r, "md", vf_plasma, hf_angle(0.0), PAL_DENSE, f, t, S)
    canvas_b = _render_vf(r, "sm", vf_vortex, hf_time_cycle(0.1), PAL_RUNE, f, t, S)

    # Pixel-level blend
    result = blend_canvas(canvas_a, canvas_b, "screen", 0.8)
    return result
```

See `references/scenes.md` for the full scene protocol, the Renderer class, `_render_vf()` helper, and complete scene examples.

See `references/composition.md` for blend modes, tone mapping, feedback buffers, and multi-grid composition.

### v1 Protocol (Legacy)

Simple scenes that use a single grid can still return `(chars, colors)` and let the caller handle rendering, but the v2 canvas protocol is preferred for all new code.

```python
def fx_simple(r, f, t, S):
    g = r.get_grid("md")
    val = np.sin(g.dist * 0.1 - t * 3) * f.get("bass", 0.3) * 2
    val = np.clip(val, 0, 1); mask = val > 0.03
    ch = val2char(val, mask, PAL_DEFAULT)
    R, G, B = hsv2rgb(np.full_like(val, 0.6), np.full_like(val, 0.7), val)
    co = mkc(R, G, B, g.rows, g.cols)
    return g.render(ch, co)  # returns canvas directly
```

### Persistent State

Effects that need state across frames (particles, rain columns) use the `S` dict parameter (which is `r.S` — same object, but passed explicitly for clarity):

```python
def fx_with_state(r, f, t, S):
    if "particles" not in S:
        S["particles"] = initialize_particles()
    update_particles(S["particles"])
    # ...
```

State persists across frames within a single scene/clip. Each worker process (and each scene) gets its own independent state.

### Helper Functions

```python
def hsv2rgb_scalar(h, s, v):
    """Single-value HSV to RGB. Returns (R, G, B) tuple of ints 0-255."""
    h = h % 1.0
    c = v * s; x = c * (1 - abs((h * 6) % 2 - 1)); m = v - c
    if h * 6 < 1:   r, g, b = c, x, 0
    elif h * 6 < 2:  r, g, b = x, c, 0
    elif h * 6 < 3:  r, g, b = 0, c, x
    elif h * 6 < 4:  r, g, b = 0, x, c
    elif h * 6 < 5:  r, g, b = x, 0, c
    else:             r, g, b = c, 0, x
    return (int((r+m)*255), int((g+m)*255), int((b+m)*255))

def log(msg):
    """Print timestamped log message."""
    print(msg, flush=True)
```
