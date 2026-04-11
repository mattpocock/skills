# Design System: Mistral AI


> **Hermes Agent — Implementation Notes**
>
> The original site uses proprietary fonts. For self-contained HTML output, use these CDN substitutes:
> - **Primary:** `Inter` | **Mono:** `JetBrains Mono`
> - **Font stack (CSS):** `font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;`
> - **Mono stack (CSS):** `font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;`
> ```html
> <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
> ```
> Use `write_file` to create HTML, serve via `generative-widgets` skill (cloudflared tunnel).
> Verify visual accuracy with `browser_vision` after generating.

## 1. Visual Theme & Atmosphere

Mistral AI's interface is a sun-drenched landscape rendered in code — a warm, bold, unapologetically European design that trades the typical blue-screen AI aesthetic for golden amber, burnt orange, and the feeling of late-afternoon light in southern France. Every surface glows with warmth: backgrounds fade from pale cream to deep amber, shadows carry golden undertones (`rgba(127, 99, 21, ...)`), and the brand's signature orange (`#fa520f`) burns through the page like a signal fire.

The design language is maximalist in its warmth but minimalist in its structure. Huge display headlines (82px) crash into the viewport with aggressive negative tracking (-2.05px), creating text blocks that feel like billboards or protest posters — declarations rather than descriptions. The typography uses Arial (likely a custom font with Arial as fallback) at extreme sizes, creating a raw, unadorned voice that says "we build frontier AI" with no decoration needed.

What makes Mistral distinctive is the complete commitment to a warm color temperature. The signature "block" identity — a gradient system flowing from bright yellow (`#ffd900`) through amber (`#ffa110`) to burnt orange (`#fa520f`) — creates a visual identity that's immediately recognizable. Even the shadows are warm, using amber-tinted blacks instead of cool grays. Combined with dramatic landscape photography in golden tones, the design feels less like a tech company and more like a European luxury brand that happens to build language models.

**Key Characteristics:**
- Golden-amber color universe: every tone from pale cream (#fffaeb) to burnt orange (#fa520f)
- Massive display typography (82px) with aggressive negative letter-spacing (-2.05px)
- Warm golden shadow system using amber-tinted rgba values
- The Mistral "M" block identity — a gradient from yellow to orange
- Dramatic landscape photography in warm golden tones
- Uppercase typography used strategically for section labels and CTAs
- Near-zero border-radius — sharp, architectural geometry
- French-European confidence: bold, warm, declarative

## 2. Color Palette & Roles

### Primary
- **Mistral Orange** (`#fa520f`): The core brand color — a vivid, saturated orange-red that anchors the entire identity. Used for primary emphasis, the brand block, and the highest-signal moments.
- **Mistral Flame** (`#fb6424`): A slightly warmer, lighter variant of the brand orange used for secondary brand moments and hover states.
- **Block Orange** (`#ff8105`): A pure orange used in the gradient block system — warmer and less red than Mistral Orange.

### Secondary & Accent
- **Sunshine 900** (`#ff8a00`): Deep golden amber — the darkest sunshine tone, used for strong accent moments.
- **Sunshine 700** (`#ffa110`): Warm amber-gold — the core sunshine accent for backgrounds and interactive elements.
- **Sunshine 500** (`#ffb83e`): Medium golden — balanced warmth for mid-level emphasis.
- **Sunshine 300** (`#ffd06a`): Light golden — for subtle warm tints and secondary backgrounds.
- **Block Gold** (`#ffe295`): Pale gold — soft background accents and gentle warmth.
- **Bright Yellow** (`#ffd900`): The brightest tone in the gradient — used at the "top" of the block identity.

### Surface & Background
- **Warm Ivory** (`#fffaeb`): The lightest page background — barely tinted with warmth, the foundation canvas.
- **Cream** (`#fff0c2`): The primary warm surface and secondary button background — noticeably golden.
- **Pure White** (`#ffffff`): Used for maximum contrast elements and popover surfaces.
- **Mistral Black** (`#1f1f1f`): The primary dark surface for buttons, text, and dark sections.
- **Accent Orange** (defined as `hsl(17, 96%, 52%)`): The functional accent color for interactive states.

### Neutrals & Text
- **Mistral Black** (`#1f1f1f`): Primary text color and dark button backgrounds — a near-black that's warmer than pure #000.
- **Black Tint** (defined as `hsl(0, 0%, 24%)`): A medium dark gray for secondary text on light backgrounds.
- **Pure White** (`#ffffff`): Text on dark surfaces and CTA labels.

### Semantic & Accent
- **Input Border** (defined as `hsl(240, 5.9%, 90%)`): A cool-tinted light gray for form borders — one of the few cool tones in the system.
- **White Overlay** (`oklab(1, 0, 0 / 0.088–0.1)`): Semi-transparent white for frosted glass effects and button overlays.

### Gradient System
- **Mistral Block Gradient**: The signature identity — a multi-step gradient flowing through Yellow (`#ffd900`) → Gold (`#ffe295`) → Amber (`#ffa110`) → Orange (`#ff8105`) → Flame (`#fb6424`) → Mistral Orange (`#fa520f`). This gradient appears in the logo blocks, section backgrounds, and decorative elements.
- **Golden Landscape Wash**: Photography and backgrounds use warm amber overlays creating a consistent golden temperature across the page.
- **Warm Shadow Cascade**: Multi-layered golden shadows that build depth with amber-tinted transparency rather than gray.

## 3. Typography Rules

### Font Family
- **Primary**: Likely a custom font (Font Source detected) with `Arial` as fallback, and extended stack: `ui-sans-serif, system-ui, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji`

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Display / Hero | Arial (custom) | 82px (5.13rem) | 400 | 1.00 (tight) | -2.05px | Maximum impact, billboard scale |
| Section Heading | Arial (custom) | 56px (3.5rem) | 400 | 0.95 (ultra-tight) | normal | Feature section anchors |
| Sub-heading Large | Arial (custom) | 48px (3rem) | 400 | 0.95 (ultra-tight) | normal | Secondary section titles |
| Sub-heading | Arial (custom) | 32px (2rem) | 400 | 1.15 (tight) | normal | Card headings, feature names |
| Card Title | Arial (custom) | 30px (1.88rem) | 400 | 1.20 (tight) | normal | Mid-level headings |
| Feature Title | Arial (custom) | 24px (1.5rem) | 400 | 1.33 | normal | Small headings |
| Body / Button | Arial (custom) | 16px (1rem) | 400 | 1.50 | normal | Standard body, button text |
| Button Uppercase | Arial (custom) | 16px (1rem) | 400 | 1.50 | normal | Uppercase CTA labels |
| Caption / Link | Arial (custom) | 14px (0.88rem) | 400 | 1.43 | normal | Metadata, secondary links |

### Principles
- **Single weight, maximum impact**: The entire system uses weight 400 (regular) — even at 82px. This creates a surprisingly elegant effect where the size alone carries authority without needing bold weight.
- **Ultra-tight at scale**: Line-heights of 0.95–1.00 at display sizes create text blocks where ascenders nearly touch descenders from the line above — creating dense, poster-like composition.
- **Aggressive tracking on display**: -2.05px letter-spacing at 82px compresses the hero text into a monolithic block.
- **Uppercase as emphasis**: Strategic `text-transform: uppercase` on button labels and section markers creates a formal, European signage quality.
- **No weight variation**: Unlike most systems that use 300–700 weight range, Mistral uses 400 everywhere. Hierarchy comes from size and color, never weight.

## 4. Component Stylings

### Buttons

**Cream Surface**
- Background: Cream (`#fff0c2`)
- Text: Mistral Black (`#1f1f1f`)
- No visible border
- The warm, inviting secondary CTA

**Dark Solid**
- Background: Mistral Black (`#1f1f1f`)
- Text: Pure White (`#ffffff`)
- Padding: 12px (all sides)
- No visible border
- The primary action button — dark on warm

**Ghost / Transparent**
- Background: transparent with slight dark overlay (`oklab(0, 0, 0 / 0.1)`)
- Text: Mistral Black (`#1f1f1f`)
- Opacity: 0.4
- For secondary/de-emphasized actions

**Text / Underline**
- Background: transparent
- Text: Mistral Black (`#1f1f1f`)
- Padding: 8px 0px 0px (top-only)
- Minimal styling — text link as button
- For tertiary navigation actions

### Cards & Containers
- Background: Warm Ivory (`#fffaeb`), Cream (`#fff0c2`), or Pure White
- Border: minimal to none — containers defined by background color
- Radius: near-zero — sharp, architectural corners
- Shadow: warm golden multi-layer (`rgba(127, 99, 21, 0.12) -8px 16px 39px, rgba(127, 99, 21, 0.1) -33px 64px 72px, rgba(127, 99, 21, 0.06) -73px 144px 97px, ...`) — a dramatic, cascading warm shadow
- Distinctive: the golden shadow creates a "golden hour" lighting effect

### Inputs & Forms
- Border: `hsl(240, 5.9%, 90%)` — the sole cool-toned element
- Focus: accent color ring
- Minimal styling consistent with sparse aesthetic

### Navigation
- Transparent nav overlaying the warm hero
- Logo: Mistral "M" wordmark
- Links: Dark text (white on dark sections)
- CTA: Dark solid button or cream surface button
- Minimal, wide-spaced layout

### Image Treatment
- Dramatic landscape photography in warm golden tones
- The winding road through golden hills — a recurring visual motif
- The Mistral "M" rendered at large scale on golden backgrounds
- Warm color grading on all photography
- Full-bleed sections with photography

### Distinctive Components

**Mistral Block Identity**
- A row of colored blocks forming the gradient: yellow → amber → orange → burnt orange
- Each block gets progressively more orange/red
- The visual DNA of the brand — recognizable at any size

**Golden Shadow Cards**
- Cards elevated with warm amber multi-layered shadows
- 5 layers of shadow from 16px to 400px offset
- Creates a "floating in golden light" effect unique to Mistral

**Dark Footer Gradient**
- Footer transitions from warm amber to dark through a dramatic gradient
- Creates a "sunset" effect as the page ends

## 5. Layout Principles

### Spacing System
- Base unit: 8px
- Scale: 2px, 4px, 8px, 10px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px, 80px, 98px, 100px
- Button padding: 12px or 8px 0px (compact)
- Section vertical spacing: very generous (80px–100px)

### Grid & Container
- Max container width: approximately 1280px, centered
- Hero: full-width with massive typography overlaying warm backgrounds
- Feature sections: wide-format layouts with dramatic imagery
- Card grids: 2–3 column layouts

### Whitespace Philosophy
- **Bold declarations**: Huge headlines surrounded by generous whitespace create billboard-like impact — each statement gets its own breathing space.
- **Warm void**: Empty space itself feels warm because the backgrounds are tinted ivory/cream rather than pure white.
- **Photography as space-filler**: Large landscape images serve double duty as content and decorative whitespace.

### Border Radius Scale
- Near-zero: The dominant radius — sharp, architectural corners on most elements
- This extreme sharpness contrasts with the warmth of the colors, creating a tension between soft color and hard geometry.

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (Level 0) | No shadow | Page backgrounds, text blocks |
| Golden Float (Level 1) | Multi-layer warm shadow (5 layers, 12%→0% opacity, amber-tinted) | Feature cards, product showcases, elevated content |

**Shadow Philosophy**: Mistral uses a single but extraordinarily complex shadow — **five cascading layers** of amber-tinted shadow (`rgba(127, 99, 21, ...)`) that build from a close 16px offset to a distant 400px offset. The result is a rich, warm, "golden hour" lighting effect that makes elevated elements look like they're bathed in afternoon sunlight. This is the most distinctive shadow system in any major AI brand.

## 7. Do's and Don'ts

### Do
- Use the warm color spectrum exclusively: ivory, cream, amber, gold, orange
- Keep display typography at 82px+ with -2.05px letter-spacing for hero sections
- Use the Mistral block gradient (yellow → amber → orange) for brand moments
- Apply warm golden shadows (amber-tinted rgba) for elevated elements
- Use Mistral Black (#1f1f1f) for text — never pure #000000
- Keep font weight at 400 throughout — let size and color carry hierarchy
- Use sharp, architectural corners — near-zero border-radius
- Apply uppercase on button labels and section markers for European formality
- Use warm landscape photography with golden color grading

### Don't
- Don't introduce cool colors (blue, green, purple) — the palette is exclusively warm
- Don't use bold (700+) weight — 400 is the only weight
- Don't round corners — the sharp geometry is intentional
- Don't use cool-toned shadows — shadows must carry amber warmth
- Don't use pure white as a page background — always warm-tinted (#fffaeb minimum)
- Don't reduce hero text below 48px on desktop — the billboard scale is core
- Don't use more than 2 font weights — size variation replaces weight variation
- Don't add gradients outside the warm spectrum — no blue-to-purple, no cool transitions
- Don't use generic gray for text — even neutrals should be warm-tinted

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile | <640px | Single column, stacked everything, hero text reduces to ~32px |
| Tablet | 640–768px | Minor layout adjustments |
| Small Desktop | 768–1024px | 2-column layouts begin |
| Desktop | 1024–1280px | Full layout with maximum typography scale |

### Touch Targets
- Buttons use generous padding (12px minimum)
- Navigation elements adequately spaced
- Cards serve as large touch targets

### Collapsing Strategy
- **Navigation**: Collapses to hamburger on mobile
- **Hero text**: 82px → 56px → 48px → 32px progressive scaling
- **Feature sections**: Multi-column → stacked
- **Photography**: Scales proportionally, may crop on mobile
- **Block identity**: Scales down proportionally

### Image Behavior
- Landscape photography scales proportionally
- Warm color grading maintained at all sizes
- Block gradient elements resize fluidly
- No art direction changes — same warm composition at all sizes

## 9. Agent Prompt Guide

### Quick Color Reference
- Brand Orange: "Mistral Orange (#fa520f)"
- Page Background: "Warm Ivory (#fffaeb)"
- Warm Surface: "Cream (#fff0c2)"
- Primary Text: "Mistral Black (#1f1f1f)"
- Sunshine Amber: "Sunshine 700 (#ffa110)"
- Bright Gold: "Bright Yellow (#ffd900)"
- Text on Dark: "Pure White (#ffffff)"

### Example Component Prompts
- "Create a hero section on Warm Ivory (#fffaeb) with a massive headline at 82px Arial weight 400, line-height 1.0, letter-spacing -2.05px. Mistral Black (#1f1f1f) text. Add a dark solid CTA button (#1f1f1f bg, white text, 12px padding, sharp corners) and a cream secondary button (#fff0c2 bg)."
- "Design a feature card on Cream (#fff0c2) with sharp corners (no border-radius). Apply the golden shadow system: rgba(127, 99, 21, 0.12) -8px 16px 39px as the primary layer. Title at 32px weight 400, body at 16px."
- "Build the Mistral block identity: a row of colored blocks from Bright Yellow (#ffd900) through Sunshine 700 (#ffa110) to Mistral Orange (#fa520f). Sharp corners, no gaps."
- "Create a dark footer section on Mistral Black (#1f1f1f) with Pure White (#ffffff) text. Footer links at 14px. Add a warm gradient from Sunshine 700 (#ffa110) at the top fading to Mistral Black."

### Iteration Guide
1. Keep the warm temperature — "shift toward amber" not "shift toward gray"
2. Use size for hierarchy — 82px → 56px → 48px → 32px → 24px → 16px
3. Never add border-radius — sharp corners only
4. Shadows are always warm: "golden shadow with amber tones"
5. Font weight is always 400 — describe emphasis through size and color
