# Design System: Supabase


> **Hermes Agent — Implementation Notes**
>
> The original site uses proprietary fonts. For self-contained HTML output, use these CDN substitutes:
> - **Primary:** `Inter` | **Mono:** `Source Code Pro`
> - **Font stack (CSS):** `font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;`
> - **Mono stack (CSS):** `font-family: 'Source Code Pro', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;`
> ```html
> <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Source+Code+Pro:wght@400;500&display=swap" rel="stylesheet">
> ```
> Use `write_file` to create HTML, serve via `generative-widgets` skill (cloudflared tunnel).
> Verify visual accuracy with `browser_vision` after generating.

## 1. Visual Theme & Atmosphere

Supabase's website is a dark-mode-native developer platform that channels the aesthetic of a premium code editor — deep black backgrounds (`#0f0f0f`, `#171717`) with emerald green accents (`#3ecf8e`, `#00c573`) that reference the brand's open-source, PostgreSQL-green identity. The design system feels like it was born in a terminal window and evolved into a sophisticated marketing surface without losing its developer soul.

The typography is built on "Circular" — a geometric sans-serif with rounded terminals that softens the technical edge. At 72px with a 1.00 line-height, the hero text is compressed to its absolute minimum vertical space, creating dense, impactful statements that waste nothing. The monospace companion (Source Code Pro) appears sparingly for uppercase technical labels with 1.2px letter-spacing, creating the "developer console" markers that connect the marketing site to the product experience.

What makes Supabase distinctive is its sophisticated HSL-based color token system. Rather than flat hex values, Supabase uses HSL with alpha channels for nearly every color (`--colors-crimson4`, `--colors-purple5`, `--colors-slateA12`), enabling a nuanced layering system where colors interact through transparency. This creates depth through translucency — borders at `rgba(46, 46, 46)`, surfaces at `rgba(41, 41, 41, 0.84)`, and accents at partial opacity all blend with the dark background to create a rich, dimensional palette from minimal color ingredients.

The green accent (`#3ecf8e`) appears selectively — in the Supabase logo, in link colors (`#00c573`), and in border highlights (`rgba(62, 207, 142, 0.3)`) — always as a signal of "this is Supabase" rather than as a decorative element. Pill-shaped buttons (9999px radius) for primary CTAs contrast with standard 6px radius for secondary elements, creating a clear visual hierarchy of importance.

**Key Characteristics:**
- Dark-mode-native: near-black backgrounds (`#0f0f0f`, `#171717`) — never pure black
- Emerald green brand accent (`#3ecf8e`, `#00c573`) used sparingly as identity marker
- Circular font — geometric sans-serif with rounded terminals
- Source Code Pro for uppercase technical labels (1.2px letter-spacing)
- HSL-based color token system with alpha channels for translucent layering
- Pill buttons (9999px) for primary CTAs, 6px radius for secondary
- Neutral gray scale from `#171717` through `#898989` to `#fafafa`
- Border system using dark grays (`#2e2e2e`, `#363636`, `#393939`)
- Minimal shadows — depth through border contrast and transparency
- Radix color primitives (crimson, purple, violet, indigo, yellow, tomato, orange, slate)

## 2. Color Palette & Roles

### Brand
- **Supabase Green** (`#3ecf8e`): Primary brand color, logo, accent borders
- **Green Link** (`#00c573`): Interactive green for links and actions
- **Green Border** (`rgba(62, 207, 142, 0.3)`): Subtle green border accent

### Neutral Scale (Dark Mode)
- **Near Black** (`#0f0f0f`): Primary button background, deepest surface
- **Dark** (`#171717`): Page background, primary canvas
- **Dark Border** (`#242424`): Horizontal rule, section dividers
- **Border Dark** (`#2e2e2e`): Card borders, tab borders
- **Mid Border** (`#363636`): Button borders, dividers
- **Border Light** (`#393939`): Secondary borders
- **Charcoal** (`#434343`): Tertiary borders, dark accents
- **Dark Gray** (`#4d4d4d`): Heavy secondary text
- **Mid Gray** (`#898989`): Muted text, link color
- **Light Gray** (`#b4b4b4`): Secondary link text
- **Near White** (`#efefef`): Light border, subtle surface
- **Off White** (`#fafafa`): Primary text, button text

### Radix Color Tokens (HSL-based)
- **Slate Scale**: `--colors-slate5` through `--colors-slateA12` — neutral progression
- **Purple**: `--colors-purple4`, `--colors-purple5`, `--colors-purpleA7` — accent spectrum
- **Violet**: `--colors-violet10` (`hsl(251, 63.2%, 63.2%)`) — vibrant accent
- **Crimson**: `--colors-crimson4`, `--colors-crimsonA9` — warm accent / alert
- **Indigo**: `--colors-indigoA2` — subtle blue wash
- **Yellow**: `--colors-yellowA7` — attention/warning
- **Tomato**: `--colors-tomatoA4` — error accent
- **Orange**: `--colors-orange6` — warm accent

### Surface & Overlay
- **Glass Dark** (`rgba(41, 41, 41, 0.84)`): Translucent dark overlay
- **Slate Alpha** (`hsla(210, 87.8%, 16.1%, 0.031)`): Ultra-subtle blue wash
- **Fixed Scale Alpha** (`hsla(200, 90.3%, 93.4%, 0.109)`): Light frost overlay

### Shadows
- Supabase uses **almost no shadows** in its dark theme. Depth is created through border contrast and surface color differences rather than box-shadows. Focus states use `rgba(0, 0, 0, 0.1) 0px 4px 12px` — minimal, functional.

## 3. Typography Rules

### Font Families
- **Primary**: `Circular`, with fallbacks: `custom-font, Helvetica Neue, Helvetica, Arial`
- **Monospace**: `Source Code Pro`, with fallbacks: `Office Code Pro, Menlo`

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Display Hero | Circular | 72px (4.50rem) | 400 | 1.00 (tight) | normal | Maximum density, zero waste |
| Section Heading | Circular | 36px (2.25rem) | 400 | 1.25 (tight) | normal | Feature section titles |
| Card Title | Circular | 24px (1.50rem) | 400 | 1.33 | -0.16px | Slight negative tracking |
| Sub-heading | Circular | 18px (1.13rem) | 400 | 1.56 | normal | Secondary headings |
| Body | Circular | 16px (1.00rem) | 400 | 1.50 | normal | Standard body text |
| Nav Link | Circular | 14px (0.88rem) | 500 | 1.00–1.43 | normal | Navigation items |
| Button | Circular | 14px (0.88rem) | 500 | 1.14 (tight) | normal | Button labels |
| Caption | Circular | 14px (0.88rem) | 400–500 | 1.43 | normal | Metadata, tags |
| Small | Circular | 12px (0.75rem) | 400 | 1.33 | normal | Fine print, footer links |
| Code Label | Source Code Pro | 12px (0.75rem) | 400 | 1.33 | 1.2px | `text-transform: uppercase` |

### Principles
- **Weight restraint**: Nearly all text uses weight 400 (regular/book). Weight 500 appears only for navigation links and button labels. There is no bold (700) in the detected system — hierarchy is created through size, not weight.
- **1.00 hero line-height**: The hero text is compressed to absolute zero leading. This is the defining typographic gesture — text that feels like a terminal command: dense, efficient, no wasted vertical space.
- **Negative tracking on cards**: Card titles use -0.16px letter-spacing, a subtle tightening that differentiates them from body text without being obvious.
- **Monospace as ritual**: Source Code Pro in uppercase with 1.2px letter-spacing is the "developer console" voice — used sparingly for technical labels that connect to the product experience.
- **Geometric personality**: Circular's rounded terminals create warmth in what could otherwise be a cold, technical interface. The font is the humanizing element.

## 4. Component Stylings

### Buttons

**Primary Pill (Dark)**
- Background: `#0f0f0f`
- Text: `#fafafa`
- Padding: 8px 32px
- Radius: 9999px (full pill)
- Border: `1px solid #fafafa` (white border on dark)
- Focus shadow: `rgba(0, 0, 0, 0.1) 0px 4px 12px`
- Use: Primary CTA ("Start your project")

**Secondary Pill (Dark, Muted)**
- Background: `#0f0f0f`
- Text: `#fafafa`
- Padding: 8px 32px
- Radius: 9999px
- Border: `1px solid #2e2e2e` (dark border)
- Opacity: 0.8
- Use: Secondary CTA alongside primary

**Ghost Button**
- Background: transparent
- Text: `#fafafa`
- Padding: 8px
- Radius: 6px
- Border: `1px solid transparent`
- Use: Tertiary actions, icon buttons

### Cards & Containers
- Background: dark surfaces (`#171717` or slightly lighter)
- Border: `1px solid #2e2e2e` or `#363636`
- Radius: 8px–16px
- No visible shadows — borders define edges
- Internal padding: 16px–24px

### Tabs
- Border: `1px solid #2e2e2e`
- Radius: 9999px (pill tabs)
- Active: green accent or lighter surface
- Inactive: dark, muted

### Links
- **Green**: `#00c573` — Supabase-branded links
- **Primary Light**: `#fafafa` — standard links on dark
- **Secondary**: `#b4b4b4` — muted links
- **Muted**: `#898989` — tertiary links, footer

### Navigation
- Dark background matching page (`#171717`)
- Supabase logo with green icon
- Circular 14px weight 500 for nav links
- Clean horizontal layout with product dropdown
- Green "Start your project" CTA pill button
- Sticky header behavior

## 5. Layout Principles

### Spacing System
- Base unit: 8px
- Scale: 1px, 4px, 6px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 90px, 96px, 128px
- Notable large jumps: 48px → 90px → 96px → 128px for major section spacing

### Grid & Container
- Centered content with generous max-width
- Full-width dark sections with constrained inner content
- Feature grids: icon-based grids with consistent card sizes
- Logo grids for "Trusted by" sections
- Footer: multi-column on dark background

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile | <600px | Single column, stacked layout |
| Desktop | >600px | Multi-column grids, expanded layout |

*Note: Supabase uses a notably minimal breakpoint system — primarily a single 600px breakpoint, suggesting a mobile-first approach with progressive enhancement.*

### Whitespace Philosophy
- **Dramatic section spacing**: 90px–128px between major sections creates a cinematic pacing — each section is its own scene in the dark void.
- **Dense content blocks**: Within sections, spacing is tight (16px–24px), creating concentrated information clusters.
- **Border-defined space**: Instead of whitespace + shadows for separation, Supabase uses thin borders on dark backgrounds — separation through line, not gap.

### Border Radius Scale
- Standard (6px): Ghost buttons, small elements
- Comfortable (8px): Cards, containers
- Medium (11px–12px): Mid-size panels
- Large (16px): Feature cards, major containers
- Pill (9999px): Primary buttons, tab indicators

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (Level 0) | No shadow, border `#2e2e2e` | Default state, most surfaces |
| Subtle Border (Level 1) | Border `#363636` or `#393939` | Interactive elements, hover |
| Focus (Level 2) | `rgba(0, 0, 0, 0.1) 0px 4px 12px` | Focus states only |
| Green Accent (Level 3) | Border `rgba(62, 207, 142, 0.3)` | Brand-highlighted elements |

**Shadow Philosophy**: Supabase deliberately avoids shadows. In a dark-mode-native design, shadows are nearly invisible and serve no purpose. Instead, depth is communicated through a sophisticated border hierarchy — from `#242424` (barely visible) through `#2e2e2e` (standard) to `#393939` (prominent). The green accent border (`rgba(62, 207, 142, 0.3)`) at 30% opacity is the "elevated" state — the brand color itself becomes the depth signal.

## 7. Do's and Don'ts

### Do
- Use near-black backgrounds (`#0f0f0f`, `#171717`) — depth comes from the gray border hierarchy
- Apply Supabase green (`#3ecf8e`, `#00c573`) sparingly — it's an identity marker, not a decoration
- Use Circular at weight 400 for nearly everything — 500 only for buttons and nav
- Set hero text to 1.00 line-height — the zero-leading is the typographic signature
- Create depth through border color differences (`#242424` → `#2e2e2e` → `#363636`)
- Use pill shape (9999px) exclusively for primary CTAs and tabs
- Employ HSL-based colors with alpha for translucent layering effects
- Use Source Code Pro uppercase labels for developer-context markers

### Don't
- Don't add box-shadows — they're invisible on dark backgrounds and break the border-defined depth system
- Don't use bold (700) text weight — the system uses 400 and 500 only
- Don't apply green to backgrounds or large surfaces — it's for borders, links, and small accents
- Don't use warm colors (crimson, orange) as primary design elements — they exist as semantic tokens for states
- Don't increase hero line-height above 1.00 — the density is intentional
- Don't use large border radius (16px+) on buttons — pills (9999px) or standard (6px), nothing in between
- Don't lighten the background above `#171717` for primary surfaces — the darkness is structural
- Don't forget the translucent borders — `rgba` border colors are the layering mechanism

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile | <600px | Single column, stacked features, condensed nav |
| Desktop | >600px | Multi-column grids, full nav, expanded sections |

### Collapsing Strategy
- Hero: 72px → scales down proportionally
- Feature grids: multi-column → single column stacked
- Logo row: horizontal → wrapped grid
- Navigation: full → hamburger
- Section spacing: 90–128px → 48–64px
- Buttons: inline → full-width stacked

## 9. Agent Prompt Guide

### Quick Color Reference
- Background: `#0f0f0f` (button), `#171717` (page)
- Text: `#fafafa` (primary), `#b4b4b4` (secondary), `#898989` (muted)
- Brand green: `#3ecf8e` (brand), `#00c573` (links)
- Borders: `#242424` (subtle), `#2e2e2e` (standard), `#363636` (prominent)
- Green border: `rgba(62, 207, 142, 0.3)` (accent)

### Example Component Prompts
- "Create a hero section on #171717 background. Headline at 72px Circular weight 400, line-height 1.00, #fafafa text. Sub-text at 16px Circular weight 400, line-height 1.50, #b4b4b4. Pill CTA button (#0f0f0f bg, #fafafa text, 9999px radius, 8px 32px padding, 1px solid #fafafa border)."
- "Design a feature card: #171717 background, 1px solid #2e2e2e border, 16px radius. Title at 24px Circular weight 400, letter-spacing -0.16px. Body at 14px weight 400, #898989 text."
- "Build navigation bar: #171717 background. Circular 14px weight 500 for links, #fafafa text. Supabase logo with green icon left-aligned. Green pill CTA 'Start your project' right-aligned."
- "Create a technical label: Source Code Pro 12px, uppercase, letter-spacing 1.2px, #898989 text."
- "Design a framework logo grid: 6-column layout on dark, grayscale logos at 60% opacity, 1px solid #2e2e2e border between sections."

### Iteration Guide
1. Start with #171717 background — everything is dark-mode-native
2. Green is the brand identity marker — use it for links, logo, and accent borders only
3. Depth comes from borders (#242424 → #2e2e2e → #363636), not shadows
4. Weight 400 is the default for everything — 500 only for interactive elements
5. Hero line-height of 1.00 is the signature typographic move
6. Pill (9999px) for primary actions, 6px for secondary, 8-16px for cards
7. HSL with alpha channels creates the sophisticated translucent layering
