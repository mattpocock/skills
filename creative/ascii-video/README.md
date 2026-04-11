# ☤ ASCII Video

Renders any content as colored ASCII character video. Audio, video, images, text, or pure math in, MP4/GIF/PNG sequence out. Full RGB color per character cell, 1080p 24fps default. No GPU.

Built for [Hermes Agent](https://github.com/NousResearch/hermes-agent). Usable in any coding agent. Canonical source lives here; synced to [`NousResearch/hermes-agent/skills/creative/ascii-video`](https://github.com/NousResearch/hermes-agent/tree/main/skills/creative/ascii-video) via PR.

## What this is

A skill that teaches an agent how to build single-file Python renderers for ASCII video from scratch. The agent gets the full pipeline: grid system, font rasterization, effect library, shader chain, audio analysis, parallel encoding. It writes the renderer, runs it, gets video.

The output is actual video. Not terminal escape codes. Frames are computed as grids of colored characters, composited onto pixel canvases with pre-rasterized font bitmaps, post-processed through shaders, piped to ffmpeg.

## Modes

| Mode | Input | Output |
|------|-------|--------|
| Video-to-ASCII | A video file | ASCII recreation of the footage |
| Audio-reactive | An audio file | Visuals driven by frequency bands, beats, energy |
| Generative | Nothing | Procedural animation from math |
| Hybrid | Video + audio | ASCII video with audio-reactive overlays |
| Lyrics/text | Audio + timed text (SRT) | Karaoke-style text with effects |
| TTS narration | Text quotes + API key | Narrated video with typewriter text and generated speech |

## Pipeline

Every mode follows the same 6-stage path:

```
INPUT --> ANALYZE --> SCENE_FN --> TONEMAP --> SHADE --> ENCODE
```

1. **Input** loads source material (or nothing for generative).
2. **Analyze** extracts per-frame features. Audio gets 6-band FFT, RMS, spectral centroid, flatness, flux, beat detection with exponential decay. Video gets luminance, edges, motion.
3. **Scene function** returns a pixel canvas directly. Composes multiple character grids at different densities, value/hue fields, pixel blend modes. This is where the visuals happen.
4. **Tonemap** does adaptive percentile-based brightness normalization with per-scene gamma. ASCII on black is inherently dark. Linear multipliers don't work. This does.
5. **Shade** runs a `ShaderChain` (38 composable shaders) plus a `FeedbackBuffer` for temporal recursion with spatial transforms.
6. **Encode** pipes raw RGB frames to ffmpeg for H.264 encoding. Segments concatenated, audio muxed.

## Grid system

Characters render on fixed-size grids. Layer multiple densities for depth.

| Size | Font | Grid at 1080p | Use |
|------|------|---------------|-----|
| xs | 8px | 400x108 | Ultra-dense data fields |
| sm | 10px | 320x83 | Rain, starfields |
| md | 16px | 192x56 | Default balanced |
| lg | 20px | 160x45 | Readable text |
| xl | 24px | 137x37 | Large titles |
| xxl | 40px | 80x22 | Giant minimal |

Rendering the same scene on `sm` and `lg` then screen-blending them creates natural texture interference. Fine detail shows through gaps in coarse characters. Most scenes use two or three grids.

## Character palettes (24)

Each sorted dark-to-bright, each a different visual texture. Validated against the font at init so broken glyphs get dropped silently.

| Family | Examples | Feel |
|--------|----------|------|
| Density ramps | ` .:-=+#@█` | Classic ASCII art gradient |
| Block elements | ` ░▒▓█▄▀▐▌` | Chunky, digital |
| Braille | ` ⠁⠂⠃...⠿` | Fine-grained pointillism |
| Dots | ` ⋅∘∙●◉◎` | Smooth, organic |
| Stars | ` ·✧✦✩✨★✶` | Sparkle, celestial |
| Half-fills | ` ◔◑◕◐◒◓◖◗◙` | Directional fill progression |
| Crosshatch | ` ▣▤▥▦▧▨▩` | Hatched density ramp |
| Math | ` ·∘∙•°±×÷≈≠≡∞∫∑Ω` | Scientific, abstract |
| Box drawing | ` ─│┌┐└┘├┤┬┴┼` | Structural, circuit-like |
| Katakana | ` ·ｦｧｨｩｪｫｬｭ...` | Matrix rain |
| Greek | ` αβγδεζηθ...ω` | Classical, academic |
| Runes | ` ᚠᚢᚦᚱᚷᛁᛇᛒᛖᛚᛞᛟ` | Mystical, ancient |
| Alchemical | ` ☉☽♀♂♃♄♅♆♇` | Esoteric |
| Arrows | ` ←↑→↓↔↕↖↗↘↙` | Directional, kinetic |
| Music | ` ♪♫♬♩♭♮♯○●` | Musical |
| Project-specific | ` .·~=≈∞⚡☿✦★⊕◊◆▲▼●■` | Themed per project |

Custom palettes are built per project to match the content.

## Color strategies

| Strategy | How it maps hue | Good for |
|----------|----------------|----------|
| Angle-mapped | Position angle from center | Rainbow radial effects |
| Distance-mapped | Distance from center | Depth, tunnels |
| Frequency-mapped | Audio spectral centroid | Timbral shifting |
| Value-mapped | Brightness level | Heat maps, fire |
| Time-cycled | Slow rotation over time | Ambient, chill |
| Source-sampled | Original video pixel colors | Video-to-ASCII |
| Palette-indexed | Discrete lookup table | Retro, flat graphic |
| Temperature | Warm-to-cool blend | Emotional tone |
| Complementary | Hue + opposite | Bold, dramatic |
| Triadic | Three equidistant hues | Psychedelic, vibrant |
| Analogous | Neighboring hues | Harmonious, subtle |
| Monochrome | Fixed hue, vary S/V | Noir, focused |

Plus 10 discrete RGB palettes (neon, pastel, cyberpunk, vaporwave, earth, ice, blood, forest, mono-green, mono-amber).

Full OKLAB/OKLCH color system: sRGB↔linear↔OKLAB conversion pipeline, perceptually uniform gradient interpolation, and color harmony generation (complementary, triadic, analogous, split-complementary, tetradic).

## Value field generators (21)

Value fields are the core visual building blocks. Each produces a 2D float array in [0, 1] mapping every grid cell to a brightness value.

### Trigonometric (12)

| Field | Description |
|-------|-------------|
| Sine field | Layered multi-sine interference, general-purpose background |
| Smooth noise | Multi-octave sine approximation of Perlin noise |
| Rings | Concentric rings, bass-driven count and wobble |
| Spiral | Logarithmic spiral arms, configurable arm count/tightness |
| Tunnel | Infinite depth perspective (inverse distance) |
| Vortex | Twisting radial pattern, distance modulates angle |
| Interference | N overlapping sine waves creating moire |
| Aurora | Horizontal flowing bands |
| Ripple | Concentric waves from configurable source points |
| Plasma | Sum of sines at multiple orientations/speeds |
| Diamond | Diamond/checkerboard pattern |
| Noise/static | Random per-cell per-frame flicker |

### Noise-based (4)

| Field | Description |
|-------|-------------|
| Value noise | Smooth organic noise, no axis-alignment artifacts |
| fBM | Fractal Brownian Motion — octaved noise for clouds, terrain, smoke |
| Domain warp | Inigo Quilez technique — fBM-driven coordinate distortion for flowing organic forms |
| Voronoi | Moving seed points with distance, edge, and cell-ID output modes |

### Simulation-based (4)

| Field | Description |
|-------|-------------|
| Reaction-diffusion | Gray-Scott with 7 presets: coral, spots, worms, labyrinths, mitosis, pulsating, chaos |
| Cellular automata | Game of Life + 4 rule variants with analog fade trails |
| Strange attractors | Clifford, De Jong, Bedhead — iterated point systems binned to density fields |
| Temporal noise | 3D noise that morphs in-place without directional drift |

### SDF-based

7 signed distance field primitives (circle, box, ring, line, triangle, star, heart) with smooth boolean combinators (union, intersection, subtraction, smooth union/subtraction) and infinite tiling. Render as solid fills or glowing outlines.

## Hue field generators (9)

Determine per-cell color independent of brightness: fixed hue, angle-mapped rainbow, distance gradient, time-cycled rotation, audio spectral centroid, horizontal/vertical gradients, plasma variation, perceptually uniform OKLCH rainbow.

## Coordinate transforms (11)

UV-space transforms applied before effect evaluation: rotate, scale, skew, tile (with mirror seaming), polar, inverse-polar, twist (rotation increasing with distance), fisheye, wave displacement, Möbius conformal transformation. `make_tgrid()` wraps transformed coordinates into a grid object.

## Particle systems (9)

| Type | Behavior |
|------|----------|
| Explosion | Beat-triggered radial burst with gravity and life decay |
| Embers | Rising from bottom with horizontal drift |
| Dissolving cloud | Spreading outward with accelerating fade |
| Starfield | 3D projected, Z-depth stars approaching with streak trails |
| Orbit | Circular/elliptical paths around center |
| Gravity well | Attracted toward configurable point sources |
| Boid flocking | Separation/alignment/cohesion with spatial hash for O(n) neighbors |
| Flow-field | Steered by gradient of any value field |
| Trail particles | Fading lines between current and previous positions |

14 themed particle character sets (energy, spark, leaf, snow, rain, bubble, data, hex, binary, rune, zodiac, dot, dash).

## Temporal coherence

10 easing functions (linear, quad, cubic, expo, elastic, bounce — in/out/in-out). Keyframe interpolation with eased transitions. Value field morphing (smooth crossfade between fields). Value field sequencing (cycle through fields with crossfade). Temporal noise (3D noise evolving smoothly in-place).

## Shader pipeline

38 composable shaders, applied to the pixel canvas after character rendering. Configurable per section.

| Category | Shaders |
|----------|---------|
| Geometry | CRT barrel, pixelate, wave distort, displacement map, kaleidoscope, mirror (h/v/quad/diag) |
| Channel | Chromatic aberration (beat-reactive), channel shift, channel swap, RGB split radial |
| Color | Invert, posterize, threshold, solarize, hue rotate, saturation, color grade, color wobble, color ramp |
| Glow/Blur | Bloom, edge glow, soft focus, radial blur |
| Noise | Film grain (beat-reactive), static noise |
| Lines/Patterns | Scanlines, halftone |
| Tone | Vignette, contrast, gamma, levels, brightness |
| Glitch/Data | Glitch bands (beat-reactive), block glitch, pixel sort, data bend |

12 color tint presets: warm, cool, matrix green, amber, sepia, neon pink, ice, blood, forest, void, sunset, neutral.

7 mood presets for common shader combos:

| Mood | Shaders |
|------|---------|
| Retro terminal | CRT + scanlines + grain + amber/green tint |
| Clean modern | Light bloom + subtle vignette |
| Glitch art | Heavy chromatic + glitch bands + color wobble |
| Cinematic | Bloom + vignette + grain + color grade |
| Dreamy | Heavy bloom + soft focus + color wobble |
| Harsh/industrial | High contrast + grain + scanlines, no bloom |
| Psychedelic | Color wobble + chromatic + kaleidoscope mirror |

## Blend modes and composition

20 pixel blend modes for layering canvases: normal, add, subtract, multiply, screen, overlay, softlight, hardlight, difference, exclusion, colordodge, colorburn, linearlight, vividlight, pin_light, hard_mix, lighten, darken, grain_extract, grain_merge. Both sRGB and linear-light blending supported.

**Feedback buffer.** Temporal recursion — each frame blends with a transformed version of the previous frame. 7 spatial transforms: zoom, shrink, rotate CW/CCW, shift up/down, mirror. Optional per-frame hue shift for rainbow trails. Configurable decay, blend mode, and opacity per scene.

**Masking.** 16 mask types for spatial compositing: shape masks (circle, rect, ring, gradients), procedural masks (any value field as a mask, text stencils), animated masks (iris open/close, wipe, dissolve), boolean operations (union, intersection, subtraction, invert).

**Transitions.** Crossfade, directional wipe, radial wipe, dissolve, glitch cut.

## Scene design patterns

Compositional patterns for making scenes that look intentional rather than random.

**Layer hierarchy.** Background (dim atmosphere, dense grid), content (main visual, standard grid), accent (sparse highlights, coarse grid). Three distinct roles, not three competing layers.

**Directional parameter arcs.** The defining parameter of each scene ramps, accelerates, or builds over its duration. Progress-based formulas (linear, ease-out, step reveal) replace aimless `sin(t)` oscillation.

**Scene concepts.** Scenes built around visual metaphors (emergence, descent, collision, entropy) with motivated layer/palette/feedback choices. Not named after their effects.

**Compositional techniques.** Counter-rotating dual systems, wave collision, progressive fragmentation (voronoi cells multiplying over time), entropy (geometry consumed by reaction-diffusion), staggered layer entry (crescendo buildup).

## Hardware adaptation

Auto-detects CPU count, RAM, platform, ffmpeg. Adapts worker count, resolution, FPS.

| Profile | Resolution | FPS | When |
|---------|-----------|-----|------|
| `draft` | 960x540 | 12 | Check timing/layout |
| `preview` | 1280x720 | 15 | Review effects |
| `production` | 1920x1080 | 24 | Final output |
| `max` | 3840x2160 | 30 | Ultra-high |
| `auto` | Detected | 24 | Adapts to hardware + duration |

`auto` estimates render time and downgrades if it would take over an hour. Low-memory systems drop to 720p automatically.

### Render times (1080p 24fps, ~180ms/frame/worker)

| Duration | 4 workers | 8 workers | 16 workers |
|----------|-----------|-----------|------------|
| 30s | ~3 min | ~2 min | ~1 min |
| 2 min | ~13 min | ~7 min | ~4 min |
| 5 min | ~33 min | ~17 min | ~9 min |
| 10 min | ~65 min | ~33 min | ~17 min |

720p roughly halves these. 4K roughly quadruples them.

## Known pitfalls

**Brightness.** ASCII characters are small bright dots on black. Most frame pixels are background. Linear `* N` multipliers clip highlights and wash out. Use `tonemap()` with per-scene gamma instead. Default gamma 0.75, solarize scenes 0.55, posterize 0.50.

**Render bottleneck.** The per-cell Python loop compositing font bitmaps runs at ~100-150ms/frame. Unavoidable without Cython/C. Everything else must be vectorized numpy. Python for-loops over rows/cols in effect functions will tank performance.

**ffmpeg deadlock.** Never `stderr=subprocess.PIPE` on long-running encodes. Buffer fills at ~64KB, process hangs. Redirect stderr to a file.

**Font cell height.** Pillow's `textbbox()` returns wrong height on macOS. Use `font.getmetrics()` for `ascent + descent`.

**Font compatibility.** Not all Unicode renders in all fonts. Palettes validated at init, blank glyphs silently removed.

## Requirements

◆ Python 3.10+
◆ NumPy, Pillow, SciPy (audio modes)
◆ ffmpeg on PATH
◆ A monospace font (Menlo, Courier, Monaco, auto-detected)
◆ Optional: OpenCV, ElevenLabs API key (TTS mode)

## File structure

```
├── SKILL.md                 # Modes, workflow, creative direction
├── README.md                # This file
└── references/
    ├── architecture.md      # Grid system, fonts, palettes, color, _render_vf()
    ├── effects.md           # Value fields, hue fields, backgrounds, particles
    ├── shaders.md           # 38 shaders, ShaderChain, tint presets, transitions
    ├── composition.md       # Blend modes, multi-grid, tonemap, FeedbackBuffer
    ├── scenes.md            # Scene protocol, SCENES table, render_clip(), examples
    ├── design-patterns.md   # Layer hierarchy, directional arcs, scene concepts
    ├── inputs.md            # Audio analysis, video sampling, text, TTS
    ├── optimization.md      # Hardware detection, vectorized patterns, parallelism
    └── troubleshooting.md   # Broadcasting traps, blend pitfalls, diagnostics
```

## Projects built with this

✦ 85-second highlight reel. 15 scenes (14×5s + 15s crescendo finale), randomized order, directional parameter arcs, layer hierarchy composition. Showcases the full effect vocabulary: fBM, voronoi fragmentation, reaction-diffusion, cellular automata, dual counter-rotating spirals, wave collision, domain warping, tunnel descent, kaleidoscope symmetry, boid flocking, fire simulation, glitch corruption, and a 7-layer crescendo buildup.

✦ Audio-reactive music visualizer. 3.5 min, 8 sections with distinct effects, beat-triggered particles and glitch, cycling palettes.

✦ TTS narrated testimonial video. 23 quotes, per-quote ElevenLabs voices, background music at 15% wide stereo, per-clip re-rendering for iterative editing.
