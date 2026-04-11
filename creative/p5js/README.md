# p5.js Skill

Production pipeline for interactive and generative visual art using [p5.js](https://p5js.org/).

## What it does

Creates browser-based visual art from text prompts. The agent handles the full pipeline: creative concept, code generation, preview, export, and iterative refinement. Output is a single self-contained HTML file that runs in any browser — no build step, no server, no dependencies beyond a CDN script tag.

The output is real interactive art. Not tutorial exercises. Generative systems, particle physics, noise fields, shader effects, kinetic typography — composed with intentional color palettes, layered composition, and visual hierarchy.

## Modes

| Mode | Input | Output |
|------|-------|--------|
| **Generative art** | Seed / parameters | Procedural visual composition |
| **Data visualization** | Dataset / API | Interactive charts, custom data displays |
| **Interactive experience** | None (user drives) | Mouse/keyboard/touch-driven sketch |
| **Animation / motion graphics** | Timeline / storyboard | Timed sequences, kinetic typography |
| **3D scene** | Concept description | WebGL geometry, lighting, shaders |
| **Image processing** | Image file(s) | Pixel manipulation, filters, pointillism |
| **Audio-reactive** | Audio file / mic | Sound-driven generative visuals |

## Export Formats

| Format | Method |
|--------|--------|
| **HTML** | Self-contained file, opens in any browser |
| **PNG** | `saveCanvas()` — press 's' to capture |
| **GIF** | `saveGif()` — press 'g' to capture |
| **MP4** | Frame sequence + ffmpeg via `scripts/render.sh` |
| **SVG** | p5.js-svg renderer for vector output |

## Prerequisites

A modern browser. That's it for basic use.

For headless export: Node.js, Puppeteer, ffmpeg.

```bash
bash skills/creative/p5js/scripts/setup.sh
```

## File Structure

```
├── SKILL.md                      # Modes, workflow, creative direction, critical notes
├── README.md                     # This file
├── references/
│   ├── core-api.md              # Canvas, draw loop, transforms, offscreen buffers, math
│   ├── shapes-and-geometry.md   # Primitives, vertices, curves, vectors, SDFs, clipping
│   ├── visual-effects.md        # Noise, flow fields, particles, pixels, textures, feedback
│   ├── animation.md             # Easing, springs, state machines, timelines, transitions
│   ├── typography.md            # Fonts, textToPoints, kinetic text, text masks
│   ├── color-systems.md         # HSB/RGB, palettes, gradients, blend modes, curated colors
│   ├── webgl-and-3d.md          # 3D primitives, camera, lighting, shaders, framebuffers
│   ├── interaction.md           # Mouse, keyboard, touch, DOM, audio, scroll
│   ├── export-pipeline.md       # PNG, GIF, MP4, SVG, headless, tiling, batch export
│   └── troubleshooting.md       # Performance, common mistakes, browser issues, debugging
└── scripts/
    ├── setup.sh                 # Dependency verification
    ├── serve.sh                 # Local dev server (for loading local assets)
    ├── render.sh                # Headless render pipeline (HTML → frames → MP4)
    └── export-frames.js         # Puppeteer frame capture (Node.js)
```
