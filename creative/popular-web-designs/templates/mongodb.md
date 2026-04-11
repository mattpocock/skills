# Design System: MongoDB


> **Hermes Agent — Implementation Notes**
>
> The original site uses proprietary fonts. For self-contained HTML output, use these CDN substitutes:
> - **Primary:** `Inter` | **Mono:** `Source Code Pro`
> - **Font stack (CSS):** `font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;`
> - **Mono stack (CSS):** `font-family: 'Source Code Pro', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;`
> ```html
> <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Source+Code+Pro:wght@400;500;600&display=swap" rel="stylesheet">
> ```
> Use `write_file` to create HTML, serve via `generative-widgets` skill (cloudflared tunnel).
> Verify visual accuracy with `browser_vision` after generating.

## 1. Visual Theme & Atmosphere

MongoDB's website is a deep-forest-meets-terminal experience — a design system rooted in the darkest teal-black (`#001e2b`) that evokes both the density of a database and the depth of a forest canopy. Against this near-black canvas, a striking neon green (`#00ed64`) pulses as the brand accent — bright enough to feel electric, organic enough to feel alive. This isn't the cold neon of cyberpunk; it's the bioluminescent green of something growing in the dark.

The typography system is architecturally ambitious: MongoDB Value Serif for massive hero headlines (96px) creates an editorial, authoritative presence — serif type at database-company scale is a bold choice that says "we're not just another tech company." Euclid Circular A handles the heavy lifting of body and UI text with an unusually wide weight range (300–700), while Source Code Pro serves as the code and label font with distinctive uppercase treatments featuring very wide letter-spacing (1px–3px). This three-font system creates a hierarchy that spans editorial elegance → geometric professionalism → engineering precision.

What makes MongoDB distinctive is its dual-mode design: a dark hero/feature section world (`#001e2b` with neon green accents) and a light content world (white with teal-gray borders `#b8c4c2`). The transition between these modes creates dramatic contrast. The shadow system uses teal-tinted dark shadows (`rgba(0, 30, 43, 0.12)`) that maintain the forest-dark atmosphere even on light surfaces. Buttons use pill shapes (100px–999px radius) with MongoDB Green borders (`#00684a`), and the entire component system references the LeafyGreen design system.

**Key Characteristics:**
- Deep teal-black backgrounds (`#001e2b`) — forest-dark, not space-dark
- Neon MongoDB Green (`#00ed64`) as the singular brand accent — electric and organic
- MongoDB Value Serif for hero headlines — editorial authority at tech scale
- Euclid Circular A for body with weight 300 (light) as a distinctive body weight
- Source Code Pro with wide uppercase letter-spacing (1px–3px) for technical labels
- Teal-tinted shadows: `rgba(0, 30, 43, 0.12)` — shadows carry the forest color
- Dual-mode: dark teal hero sections + light white content sections
- Pill buttons (100px radius) with green borders (`#00684a`)
- Link Blue (`#006cfa`) and hover transition to `#3860be`

## 2. Color Palette & Roles

### Primary Brand
- **Forest Black** (`#001e2b`): Primary dark background — the deepest teal-black
- **MongoDB Green** (`#00ed64`): Primary brand accent — neon green for highlights, underlines, gradients
- **Dark Green** (`#00684a`): Button borders, link text on light — muted green for functional use

### Interactive
- **Action Blue** (`#006cfa`): Secondary accent — links, interactive highlights
- **Hover Blue** (`#3860be`): All link hover states transition to this blue
- **Teal Active** (`#1eaedb`): Button hover background — bright teal

### Neutral Scale
- **Deep Teal** (`#1c2d38`): Dark button backgrounds, secondary dark surfaces
- **Teal Gray** (`#3d4f58`): Dark borders on dark surfaces
- **Dark Slate** (`#21313c`): Dark link text variant
- **Cool Gray** (`#5c6c75`): Muted text on dark, secondary button text
- **Silver Teal** (`#b8c4c2`): Borders on light surfaces, dividers
- **Light Input** (`#e8edeb`): Input text on dark surfaces
- **Pure White** (`#ffffff`): Light section background, button text on dark
- **Black** (`#000000`): Text on light surfaces, darkest elements

### Shadows
- **Forest Shadow** (`rgba(0, 30, 43, 0.12) 0px 26px 44px, rgba(0, 0, 0, 0.13) 0px 7px 13px`): Primary card elevation — teal-tinted
- **Standard Shadow** (`rgba(0, 0, 0, 0.15) 0px 3px 20px`): General elevation
- **Subtle Shadow** (`rgba(0, 0, 0, 0.1) 0px 2px 4px`): Light card lift

## 3. Typography Rules

### Font Families
- **Display Serif**: `MongoDB Value Serif` — editorial hero headlines
- **Body / UI**: `Euclid Circular A` — geometric sans-serif workhorse
- **Code / Labels**: `Source Code Pro` — monospace with uppercase label treatments
- **Fallbacks**: `Akzidenz-Grotesk Std` (with CJK: Noto Sans KR/SC/JP), `Times`, `Arial`, `system-ui`

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Display Hero | MongoDB Value Serif | 96px (6.00rem) | 400 | 1.20 (tight) | normal | Serif authority |
| Display Secondary | MongoDB Value Serif | 64px (4.00rem) | 400 | 1.00 (tight) | normal | Serif sub-hero |
| Section Heading | Euclid Circular A | 36px (2.25rem) | 500 | 1.33 | normal | Geometric precision |
| Sub-heading | Euclid Circular A | 24px (1.50rem) | 500 | 1.33 | normal | Feature titles |
| Body Large | Euclid Circular A | 20px (1.25rem) | 400 | 1.60 (relaxed) | normal | Introductions |
| Body | Euclid Circular A | 18px (1.13rem) | 400 | 1.33 | normal | Standard body |
| Body Light | Euclid Circular A | 16px (1.00rem) | 300 | 1.50–2.00 | normal | Light-weight reading text |
| Nav / UI | Euclid Circular A | 16px (1.00rem) | 500 | 1.00–1.88 | 0.16px | Navigation, emphasized |
| Body Bold | Euclid Circular A | 15px (0.94rem) | 700 | 1.50 | normal | Strong emphasis |
| Button | Euclid Circular A | 13.5px–16px | 500–700 | 1.00 | 0.135px–0.9px | CTA labels |
| Caption | Euclid Circular A | 14px (0.88rem) | 400 | 1.71 (relaxed) | normal | Metadata |
| Small | Euclid Circular A | 11px (0.69rem) | 600 | 1.82 (relaxed) | 0.2px | Tags, annotations |
| Code Heading | Source Code Pro | 40px (2.50rem) | 400 | 1.60 (relaxed) | normal | Code showcase titles |
| Code Body | Source Code Pro | 16px (1.00rem) | 400 | 1.50 | normal | Code blocks |
| Code Label | Source Code Pro | 14px (0.88rem) | 400–500 | 1.14 (tight) | 1px–2px | `text-transform: uppercase` |
| Code Micro | Source Code Pro | 9px (0.56rem) | 600 | 2.67 (relaxed) | 2.5px | `text-transform: uppercase` |

### Principles
- **Serif for authority**: MongoDB Value Serif at hero scale creates an editorial presence unusual in tech — it communicates that MongoDB is an institution, not a startup.
- **Weight 300 as body default**: Euclid Circular A uses light (300) for body text, creating an airy reading experience that contrasts with the dense, dark backgrounds.
- **Wide-tracked monospace labels**: Source Code Pro uppercase at 1px–3px letter-spacing creates technical signposts that feel like database field labels — systematic, structured, classified.
- **Four-weight range**: 300 (light body) → 400 (standard) → 500 (UI/nav) → 700 (bold CTA) — a wider range than most systems, enabling fine-grained hierarchy.

## 4. Component Stylings

### Buttons

**Primary Green (Dark Surface)**
- Background: `#00684a` (muted MongoDB green)
- Text: `#000000`
- Radius: 50% (circular) or 100px (pill)
- Border: `1px solid #00684a`
- Shadow: `rgba(0,0,0,0.06) 0px 1px 6px`
- Hover: scale 1.1
- Active: scale 0.85

**Dark Teal Button**
- Background: `#1c2d38`
- Text: `#5c6c75`
- Radius: 100px (pill)
- Border: `1px solid #3d4f58`
- Hover: background `#1eaedb`, text white, translateX(5px)

**Outlined Button (Light Surface)**
- Background: transparent
- Text: `#001e2b`
- Border: `1px solid #b8c4c2`
- Radius: 4px–8px
- Hover: background tint

### Cards & Containers
- Light mode: white background with `1px solid #b8c4c2` border
- Dark mode: `#001e2b` or `#1c2d38` background with `1px solid #3d4f58`
- Radius: 16px (standard), 24px (medium), 48px (large/hero)
- Shadow: `rgba(0,30,43,0.12) 0px 26px 44px` (forest-tinted)
- Image containers: 30px–32px radius

### Inputs & Forms
- Textarea: text `#e8edeb`, padding 12px 12px 12px 8px
- Borders: `1px solid #b8c4c2` on light, `1px solid #3d4f58` on dark
- Input radius: 4px

### Navigation
- Dark header on forest-black background
- Euclid Circular A 16px weight 500 for nav links
- MongoDB logo (leaf icon + wordmark) left-aligned
- Green CTA pill buttons right-aligned
- Mega-menu dropdowns with product categories

### Image Treatment
- Dashboard screenshots on dark backgrounds
- Green-accented UI elements in screenshots
- 30px–32px radius on image containers
- Full-width dark sections for product showcases

### Distinctive Components

**Neon Green Accent Underlines**
- `0px 2px 2px 0px solid #00ed64` — bottom + right border creating accent underlines
- Used on feature headings and highlighted text
- Also appears as `#006cfa` (blue) variant

**Source Code Label System**
- 14px uppercase Source Code Pro with 1px–2px letter-spacing
- Used as section category markers above headings
- Creates a "database field label" aesthetic

## 5. Layout Principles

### Spacing System
- Base unit: 8px
- Scale: 1px, 4px, 7px, 8px, 10px, 12px, 14px, 15px, 16px, 18px, 20px, 24px, 32px

### Grid & Container
- Max content width centered
- Dark hero section with contained content
- Light content sections below
- Card grids: 2–3 columns
- Full-width dark footer

### Whitespace Philosophy
- **Dramatic mode transitions**: The shift from dark teal sections to white content creates built-in visual breathing through contrast, not just space.
- **Generous dark sections**: Dark hero and feature areas use extra vertical padding (80px+) to let the forest-dark background breathe.
- **Compact light sections**: White content areas are denser, with tighter card grids and less vertical spacing.

### Border Radius Scale
- Minimal (1px–2px): Small spans, badges
- Subtle (4px): Inputs, small buttons
- Standard (8px): Cards, links
- Card (16px): Standard cards, containers
- Toggle (20px): Switch elements
- Large (24px): Large panels
- Image (30px–32px): Image containers
- Hero (48px): Hero cards
- Pill (100px–999px): Buttons, navigation pills
- Full (9999px): Maximum pill

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (Level 0) | No shadow | Default surfaces |
| Subtle (Level 1) | `rgba(0,0,0,0.1) 0px 2px 4px` | Light card lift |
| Standard (Level 2) | `rgba(0,0,0,0.15) 0px 3px 9px` | Standard cards |
| Prominent (Level 3) | `rgba(0,0,0,0.15) 0px 3px 20px` | Elevated panels |
| Forest (Level 4) | `rgba(0,30,43,0.12) 0px 26px 44px, rgba(0,0,0,0.13) 0px 7px 13px` | Hero cards — teal-tinted |

**Shadow Philosophy**: MongoDB's shadow system is unique in that the primary elevation shadow uses `rgba(0, 30, 43, 0.12)` — a teal-tinted shadow that carries the forest-dark brand color into the depth system. This means even on white surfaces, shadows feel like they belong to the MongoDB color world rather than being generic neutral black.

## 7. Do's and Don'ts

### Do
- Use `#001e2b` (forest-black) for dark sections — not pure black
- Apply MongoDB Green (`#00ed64`) sparingly for maximum electric impact
- Use MongoDB Value Serif ONLY for hero/display headings — Euclid Circular A for everything else
- Apply Source Code Pro uppercase with wide tracking (1px–3px) for technical labels
- Use teal-tinted shadows (`rgba(0,30,43,0.12)`) for primary card elevation
- Maintain the dark/light section duality — dramatic contrast between modes
- Use weight 300 for body text — the light weight is the readable voice
- Apply pill radius (100px) to primary action buttons

### Don't
- Don't use pure black (`#000000`) for dark backgrounds — always use teal-black (`#001e2b`)
- Don't use MongoDB Green (`#00ed64`) on backgrounds — it's an accent for text, underlines, and small highlights
- Don't use standard gray shadows — always use teal-tinted (`rgba(0,30,43,...)`)
- Don't apply serif font to body text — MongoDB Value Serif is hero-only
- Don't use narrow letter-spacing on Source Code Pro labels — the wide tracking IS the identity
- Don't mix dark and light section treatments within the same section
- Don't use warm colors — the palette is strictly cool (teal, green, blue)
- Don't forget the green accent underlines — they're the signature decorative element

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile Small | <425px | Tight single column |
| Mobile | 425–768px | Standard mobile |
| Tablet | 768–1024px | 2-column grids begin |
| Desktop | 1024–1280px | Standard layout |
| Large Desktop | 1280–1440px | Expanded layout |
| Ultra-wide | >1440px | Maximum width, generous margins |

### Touch Targets
- Pill buttons with generous padding
- Navigation links at 16px with adequate spacing
- Card surfaces as full-area touch targets

### Collapsing Strategy
- Hero: MongoDB Value Serif 96px → 64px → scales further
- Navigation: horizontal mega-menu → hamburger
- Feature cards: multi-column → stacked
- Dark/light sections maintain their mode at all sizes
- Source Code Pro labels maintain uppercase treatment

### Image Behavior
- Dashboard screenshots scale proportionally
- Dark section backgrounds maintained full-width
- Image radius maintained across breakpoints

## 9. Agent Prompt Guide

### Quick Color Reference
- Dark background: Forest Black (`#001e2b`)
- Brand accent: MongoDB Green (`#00ed64`)
- Functional green: Dark Green (`#00684a`)
- Link blue: Action Blue (`#006cfa`)
- Text on light: Black (`#000000`)
- Text on dark: White (`#ffffff`) or Light Input (`#e8edeb`)
- Border light: Silver Teal (`#b8c4c2`)
- Border dark: Teal Gray (`#3d4f58`)

### Example Component Prompts
- "Create a hero on forest-black (#001e2b) background. Headline at 96px MongoDB Value Serif weight 400, line-height 1.20, white text with 'potential' highlighted in MongoDB Green (#00ed64). Subtitle at 18px Euclid Circular A weight 400. Green pill CTA (#00684a, 100px radius). Neon green gradient glow behind product screenshot."
- "Design a card on white background: 1px solid #b8c4c2 border, 16px radius, shadow rgba(0,30,43,0.12) 0px 26px 44px. Title at 24px Euclid Circular A weight 500. Body at 16px weight 300. Source Code Pro 14px uppercase label above title with 2px letter-spacing."
- "Build a dark section: #001e2b background, 1px solid #3d4f58 border on cards. White text. MongoDB Green (#00ed64) accent underlines on headings using bottom-border 2px solid."
- "Create technical label: Source Code Pro 14px, text-transform uppercase, letter-spacing 2px, weight 500, #00ed64 color on dark background."
- "Design a pill button: #1c2d38 background, 1px solid #3d4f58 border, 100px radius, #5c6c75 text. Hover: #1eaedb background, white text, translateX(5px)."

### Iteration Guide
1. Start with the mode decision: dark (#001e2b) for hero/features, white for content
2. MongoDB Green (#00ed64) is electric — use once per section for maximum impact
3. Serif headlines (MongoDB Value Serif) create the editorial authority — never use for body
4. Weight 300 body text creates the airy reading experience — don't default to 400
5. Source Code Pro uppercase with wide tracking for technical labels — the database voice
6. Teal-tinted shadows keep everything in the MongoDB color world
