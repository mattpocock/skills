# Design System: Pinterest


> **Hermes Agent — Implementation Notes**
>
> The original site uses proprietary fonts. For self-contained HTML output, use these CDN substitutes:
> - **Primary:** `DM Sans` | **Mono:** `system monospace stack`
> - **Font stack (CSS):** `font-family: 'DM Sans', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;`
> - **Mono stack (CSS):** `font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;`
> ```html
> <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap" rel="stylesheet">
> ```
> Use `write_file` to create HTML, serve via `generative-widgets` skill (cloudflared tunnel).
> Verify visual accuracy with `browser_vision` after generating.

## 1. Visual Theme & Atmosphere

Pinterest's website is a warm, inspiration-driven canvas that treats visual discovery like a lifestyle magazine. The design operates on a soft, slightly warm white background with Pinterest Red (`#e60023`) as the singular, bold brand accent. Unlike the cool blues of most tech platforms, Pinterest's neutral scale has a distinctly warm undertone — grays lean toward olive/sand (`#91918c`, `#62625b`, `#e5e5e0`) rather than cool steel, creating a cozy, craft-like atmosphere that invites browsing.

The typography uses Pin Sans — a custom proprietary font with a broad fallback stack including Japanese fonts, reflecting Pinterest's global reach. At display scale (70px, weight 600), Pin Sans creates large, inviting headlines. At smaller sizes, the system is compact: buttons at 12px, captions at 12–14px. The CSS variable naming system (`--comp-*`, `--sema-*`, `--base-*`) reveals a sophisticated three-tier design token architecture: component-level, semantic-level, and base-level tokens.

What distinguishes Pinterest is its generous border-radius system (12px–40px, plus 50% for circles) and warm-tinted button backgrounds. The secondary button (`#e5e5e0`) has a distinctly warm, sand-like tone rather than cold gray. The primary red button uses 16px radius — rounded but not pill-shaped. Combined with warm badge backgrounds (`hsla(60,20%,98%,.5)` — a subtle yellow-warm wash) and photography-dominant layouts, the result is a design that feels handcrafted and personal, not corporate and sterile.

**Key Characteristics:**
- Warm white canvas with olive/sand-toned neutrals — cozy, not clinical
- Pinterest Red (`#e60023`) as singular bold accent — never subtle, always confident
- Pin Sans custom font with global fallback stack (including CJK)
- Three-tier token architecture: `--comp-*` / `--sema-*` / `--base-*`
- Warm secondary surfaces: sand gray (`#e5e5e0`), warm badge (`hsla(60,20%,98%,.5)`)
- Generous border-radius: 16px standard, up to 40px for large containers
- Photography-first content — pins/images are the primary visual element
- Dark near-purple text (`#211922`) — warm, with a hint of plum

## 2. Color Palette & Roles

### Primary Brand
- **Pinterest Red** (`#e60023`): Primary CTA, brand accent — bold, confident red
- **Green 700** (`#103c25`): `--base-color-green-700`, success/nature accent
- **Green 700 Hover** (`#0b2819`): `--base-color-hover-green-700`, pressed green

### Text
- **Plum Black** (`#211922`): Primary text — warm near-black with plum undertone
- **Black** (`#000000`): Secondary text, button text
- **Olive Gray** (`#62625b`): Secondary descriptions, muted text
- **Warm Silver** (`#91918c`): `--comp-button-color-text-transparent-disabled`, disabled text, input borders
- **White** (`#ffffff`): Text on dark/colored surfaces

### Interactive
- **Focus Blue** (`#435ee5`): `--comp-button-color-border-focus-outer-transparent`, focus rings
- **Performance Purple** (`#6845ab`): `--sema-color-hover-icon-performance-plus`, performance features
- **Recommendation Purple** (`#7e238b`): `--sema-color-hover-text-recommendation`, AI recommendation
- **Link Blue** (`#2b48d4`): Link text color
- **Facebook Blue** (`#0866ff`): `--facebook-background-color`, social login
- **Pressed Blue** (`#617bff`): `--base-color-pressed-blue-200`, pressed state

### Surface & Border
- **Sand Gray** (`#e5e5e0`): Secondary button background — warm, craft-like
- **Warm Light** (`#e0e0d9`): Circular button backgrounds, badges
- **Warm Wash** (`hsla(60, 20%, 98%, 0.5)`): `--comp-badge-color-background-wash-light`, subtle warm badge bg
- **Fog** (`#f6f6f3`): Light surface (at 50% opacity)
- **Border Disabled** (`#c8c8c1`): `--sema-color-border-disabled`, disabled borders
- **Hover Gray** (`#bcbcb3`): `--base-color-hover-grayscale-150`, hover border
- **Dark Surface** (`#33332e`): Dark section backgrounds

### Semantic
- **Error Red** (`#9e0a0a`): Checkbox/form error states

## 3. Typography Rules

### Font Family
- **Primary**: `Pin Sans`, fallbacks: `-apple-system, system-ui, Segoe UI, Roboto, Oxygen-Sans, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, Helvetica, ヒラギノ角ゴ Pro W3, メイリオ, Meiryo, ＭＳ Ｐゴシック, Arial`

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Display Hero | Pin Sans | 70px (4.38rem) | 600 | normal | normal | Maximum impact |
| Section Heading | Pin Sans | 28px (1.75rem) | 700 | normal | -1.2px | Negative tracking |
| Body | Pin Sans | 16px (1.00rem) | 400 | 1.40 | normal | Standard reading |
| Caption Bold | Pin Sans | 14px (0.88rem) | 700 | normal | normal | Strong metadata |
| Caption | Pin Sans | 12px (0.75rem) | 400–500 | 1.50 | normal | Small text, tags |
| Button | Pin Sans | 12px (0.75rem) | 400 | normal | normal | Button labels |

### Principles
- **Compact type scale**: The range is 12px–70px with a dramatic jump — most functional text is 12–16px, creating a dense, app-like information hierarchy.
- **Warm weight distribution**: 600–700 for headings, 400–500 for body. No ultra-light weights — the type always feels substantial.
- **Negative tracking on headings**: -1.2px on 28px headings creates cozy, intimate section titles.
- **Single font family**: Pin Sans handles everything — no secondary display or monospace font detected.

## 4. Component Stylings

### Buttons

**Primary Red**
- Background: `#e60023` (Pinterest Red)
- Text: `#000000` (black — unusual choice for contrast on red)
- Padding: 6px 14px
- Radius: 16px (generously rounded, not pill)
- Border: `2px solid rgba(255, 255, 255, 0)` (transparent)
- Focus: semantic border + outline via CSS variables

**Secondary Sand**
- Background: `#e5e5e0` (warm sand gray)
- Text: `#000000`
- Padding: 6px 14px
- Radius: 16px
- Focus: same semantic border system

**Circular Action**
- Background: `#e0e0d9` (warm light)
- Text: `#211922` (plum black)
- Radius: 50% (circle)
- Use: Pin actions, navigation controls

**Ghost / Transparent**
- Background: transparent
- Text: `#000000`
- No border
- Use: Tertiary actions

### Cards & Containers
- Photography-first pin cards with generous radius (12px–20px)
- No traditional box-shadow on most cards
- White or warm fog backgrounds
- 8px white thick border on some image containers

### Inputs
- Email input: white background, `1px solid #91918c` border, 16px radius, 11px 15px padding
- Focus: semantic border + outline system via CSS variables

### Navigation
- Clean header on white or warm background
- Pinterest logo + search bar centered
- Pin Sans 16px for nav links
- Pinterest Red accents for active states

### Image Treatment
- Pin-style masonry grid (signature Pinterest layout)
- Rounded corners: 12px–20px on images
- Photography as primary content — every pin is an image
- Thick white borders (8px) on featured image containers

## 5. Layout Principles

### Spacing System
- Base unit: 8px
- Scale: 4px, 6px, 7px, 8px, 10px, 11px, 12px, 16px, 18px, 20px, 22px, 24px, 32px, 80px, 100px
- Large jumps: 32px → 80px → 100px for section spacing

### Grid & Container
- Masonry grid for pin content (signature layout)
- Centered content sections with generous max-width
- Full-width dark footer
- Search bar as primary navigation element

### Whitespace Philosophy
- **Inspiration density**: The masonry grid packs pins tightly — the content density IS the value proposition. Whitespace exists between sections, not within the grid.
- **Breathing above, density below**: Hero/feature sections get generous padding; the pin grid is compact and immersive.

### Border Radius Scale
- Standard (12px): Small cards, links
- Button (16px): Buttons, inputs, medium cards
- Comfortable (20px): Feature cards
- Large (28px): Large containers
- Section (32px): Tab elements, large panels
- Hero (40px): Hero containers, large feature blocks
- Circle (50%): Action buttons, tab indicators

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (Level 0) | No shadow | Default — pins rely on content, not shadow |
| Subtle (Level 1) | Minimal shadow (from tokens) | Elevated overlays, dropdowns |
| Focus (Accessibility) | `--sema-color-border-focus-outer-default` ring | Focus states |

**Shadow Philosophy**: Pinterest uses minimal shadows. The masonry grid relies on content (photography) to create visual interest rather than elevation effects. Depth comes from the warmth of surface colors and the generous rounding of containers.

## 7. Do's and Don'ts

### Do
- Use warm neutrals (`#e5e5e0`, `#e0e0d9`, `#91918c`) — the warm olive/sand tone is the identity
- Apply Pinterest Red (`#e60023`) only for primary CTAs — it's bold and singular
- Use Pin Sans exclusively — one font for everything
- Apply generous border-radius: 16px for buttons/inputs, 20px+ for cards
- Keep the masonry grid dense — content density is the value
- Use warm badge backgrounds (`hsla(60,20%,98%,.5)`) for subtle warm washes
- Use `#211922` (plum black) for primary text — it's warmer than pure black

### Don't
- Don't use cool gray neutrals — always warm/olive-toned
- Don't use pure black (`#000000`) as primary text — use plum black (`#211922`)
- Don't use pill-shaped buttons — 16px radius is rounded but not pill
- Don't add heavy shadows — Pinterest is flat by design, depth from content
- Don't use small border-radius (<12px) on cards — the generous rounding is core
- Don't introduce additional brand colors — red + warm neutrals is the complete palette
- Don't use thin font weights — Pin Sans at 400 minimum

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile | <576px | Single column, compact layout |
| Mobile Large | 576–768px | 2-column pin grid |
| Tablet | 768–890px | Expanded grid |
| Desktop Small | 890–1312px | Standard masonry grid |
| Desktop | 1312–1440px | Full layout |
| Large Desktop | 1440–1680px | Expanded grid columns |
| Ultra-wide | >1680px | Maximum grid density |

### Collapsing Strategy
- Pin grid: 5+ columns → 3 → 2 → 1
- Navigation: search bar + icons → simplified mobile nav
- Feature sections: side-by-side → stacked
- Hero: 70px → scales down proportionally
- Footer: dark multi-column → stacked

## 9. Agent Prompt Guide

### Quick Color Reference
- Brand: Pinterest Red (`#e60023`)
- Background: White (`#ffffff`)
- Text: Plum Black (`#211922`)
- Secondary text: Olive Gray (`#62625b`)
- Button surface: Sand Gray (`#e5e5e0`)
- Border: Warm Silver (`#91918c`)
- Focus: Focus Blue (`#435ee5`)

### Example Component Prompts
- "Create a hero: white background. Headline at 70px Pin Sans weight 600, plum black (#211922). Red CTA button (#e60023, 16px radius, 6px 14px padding). Secondary sand button (#e5e5e0, 16px radius)."
- "Design a pin card: white background, 16px radius, no shadow. Photography fills top, 16px Pin Sans weight 400 description below in #62625b."
- "Build a circular action button: #e0e0d9 background, 50% radius, #211922 icon."
- "Create an input field: white background, 1px solid #91918c, 16px radius, 11px 15px padding. Focus: blue outline via semantic tokens."
- "Design the dark footer: #33332e background. Pinterest script logo in white. 12px Pin Sans links in #91918c."

### Iteration Guide
1. Warm neutrals everywhere — olive/sand grays, never cool steel
2. Pinterest Red for CTAs only — bold and singular
3. 16px radius on buttons/inputs, 20px+ on cards — generous but not pill
4. Pin Sans is the only font — compact at 12px for UI, 70px for display
5. Photography carries the design — the UI stays warm and minimal
6. Plum black (#211922) for text — warmer than pure black
