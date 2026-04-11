# Design System: Resend


> **Hermes Agent — Implementation Notes**
>
> The original site uses proprietary fonts. For self-contained HTML output, use these CDN substitutes:
> - **Primary:** `Geist` | **Mono:** `Geist Mono`
> - **Font stack (CSS):** `font-family: 'Geist', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;`
> - **Mono stack (CSS):** `font-family: 'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;`
> ```html
> <link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
> ```
> Use `write_file` to create HTML, serve via `generative-widgets` skill (cloudflared tunnel).
> Verify visual accuracy with `browser_vision` after generating.

## 1. Visual Theme & Atmosphere

Resend's website is a dark, cinematic canvas that treats email infrastructure like a luxury product. The entire page is draped in pure black (`#000000`) with text that glows in near-white (`#f0f0f0`), creating a theater-like experience where content performs on a void stage. This isn't the typical developer-tool darkness — it's the controlled darkness of a photography gallery, where every element is lit with intention and nothing competes for attention.

The typography system is the star of the show. Three carefully chosen typefaces create a hierarchy that feels both editorial and technical: Domaine Display (a Klim Type Foundry serif) appears at massive 96px for hero headlines with barely-there line-height (1.00) and negative tracking (-0.96px), creating display text that feels like a magazine cover. ABC Favorit (by Dinamo) handles section headings with an even more aggressive letter-spacing (-2.8px at 56px), giving a compressed, engineered quality to mid-tier text. Inter takes over for body and UI, providing the clean readability that lets the display fonts shine. Commit Mono rounds out the family for code blocks.

What makes Resend distinctive is its icy, blue-tinted border system. Instead of neutral gray borders, Resend uses `rgba(214, 235, 253, 0.19)` — a frosty, slightly blue-tinted line at 19% opacity that gives every container and divider a cold, crystalline quality against the black background. Combined with pill-shaped buttons (9999px radius), multi-color accent system (orange, green, blue, yellow, red — each with its own CSS variable scale), and OpenType stylistic sets (`"ss01"`, `"ss03"`, `"ss04"`, `"ss11"`), the result is a design system that feels premium, precise, and quietly confident.

**Key Characteristics:**
- Pure black background with near-white (`#f0f0f0`) text — theatrical, gallery-like darkness
- Three-font hierarchy: Domaine Display (serif hero), ABC Favorit (geometric sections), Inter (body/UI)
- Icy blue-tinted borders: `rgba(214, 235, 253, 0.19)` — every border has a cold, crystalline shimmer
- Multi-color accent system: orange, green, blue, yellow, red — each with numbered CSS variable scales
- Pill-shaped buttons and tags (9999px radius) with transparent backgrounds
- OpenType stylistic sets (`"ss01"`, `"ss03"`, `"ss04"`, `"ss11"`) on display fonts
- Commit Mono for code — monospace as a design element, not an afterthought
- Whisper-level shadows using blue-tinted ring: `rgba(176, 199, 217, 0.145) 0px 0px 0px 1px`

## 2. Color Palette & Roles

### Primary
- **Void Black** (`#000000`): Page background, the defining canvas color (95% opacity via `--color-black-12`)
- **Near White** (`#f0f0f0`): Primary text, button text, high-contrast elements
- **Pure White** (`#ffffff`): `--color-white`, maximum emphasis text, link highlights

### Accent Scale — Orange
- **Orange 4** (`#ff5900`): `--color-orange-4`, at 22% opacity — subtle warm glow
- **Orange 10** (`#ff801f`): `--color-orange-10`, primary orange accent — warm, energetic
- **Orange 11** (`#ffa057`): `--color-orange-11`, lighter orange for secondary use

### Accent Scale — Green
- **Green 3** (`#22ff99`): `--color-green-3`, at 12% opacity — faint emerald wash
- **Green 4** (`#11ff99`): `--color-green-4`, at 18% opacity — success indicator glow

### Accent Scale — Blue
- **Blue 4** (`#0075ff`): `--color-blue-4`, at 34% opacity — medium blue accent
- **Blue 5** (`#0081fd`): `--color-blue-5`, at 42% opacity — stronger blue
- **Blue 10** (`#3b9eff`): `--color-blue-10`, bright blue — links, interactive elements

### Accent Scale — Other
- **Yellow 9** (`#ffc53d`): `--color-yellow-9`, warm gold for warnings or highlights
- **Red 5** (`#ff2047`): `--color-red-5`, at 34% opacity — error states, destructive actions

### Neutral Scale
- **Silver** (`#a1a4a5`): Secondary text, muted links, descriptions
- **Dark Gray** (`#464a4d`): Tertiary text, de-emphasized content
- **Mid Gray** (`#5c5c5c`): Hover states, subtle emphasis
- **Medium Gray** (`#494949`): Quaternary text
- **Light Gray** (`#f8f8f8`): Light mode surface (if applicable)
- **Border Gray** (`#eaeaea`): Light context borders
- **Edge Gray** (`#ececec`): Subtle borders on light surfaces
- **Mist Gray** (`#dedfdf`): Light dividers
- **Soft Gray** (`#e5e6e6`): Alternate light border

### Surface & Overlay
- **Frost Primary** (`#fcfdff`): Primary color token (slight blue tint, 94% opacity)
- **White Hover** (`rgba(255, 255, 255, 0.28)`): Button hover state on dark
- **White 60%** (`oklab(0.999994 ... / 0.577)`): Semi-transparent white for muted text
- **White 64%** (`oklab(0.999994 ... / 0.642)`): Slightly brighter semi-transparent white

### Borders & Shadows
- **Frost Border** (`rgba(214, 235, 253, 0.19)`): The signature — icy blue-tinted borders at 19% opacity
- **Frost Border Alt** (`rgba(217, 237, 254, 0.145)`): Slightly lighter variant for list items
- **Ring Shadow** (`rgba(176, 199, 217, 0.145) 0px 0px 0px 1px`): Blue-tinted shadow-as-border
- **Focus Ring** (`rgb(0, 0, 0) 0px 0px 0px 8px`): Heavy black focus ring
- **Subtle Shadow** (`rgba(0, 0, 0, 0.1) 0px 1px 3px, rgba(0, 0, 0, 0.1) 0px 1px 2px -1px`): Minimal card elevation

## 3. Typography Rules

### Font Families
- **Display Serif**: `domaine` (Domaine Display by Klim Type Foundry) — hero headlines
- **Display Sans**: `aBCFavorit` (ABC Favorit by Dinamo), fallbacks: `ui-sans-serif, system-ui` — section headings
- **Body / UI**: `inter`, fallbacks: `ui-sans-serif, system-ui` — body text, buttons, navigation
- **Monospace**: `commitMono`, fallbacks: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas`
- **Secondary**: `Helvetica` — fallback for specific UI contexts
- **System**: `-apple-system, system-ui, Segoe UI, Roboto` — embedded content

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Display Hero | domaine | 96px (6.00rem) | 400 | 1.00 (tight) | -0.96px | `"ss01", "ss04", "ss11"` |
| Display Hero Mobile | domaine | 76.8px (4.80rem) | 400 | 1.00 (tight) | -0.768px | Scaled for mobile |
| Section Heading | aBCFavorit | 56px (3.50rem) | 400 | 1.20 (tight) | -2.8px | `"ss01", "ss04", "ss11"` |
| Sub-heading | aBCFavorit | 20px (1.25rem) | 400 | 1.30 (tight) | normal | `"ss01", "ss04", "ss11"` |
| Sub-heading Compact | aBCFavorit | 16px (1.00rem) | 400 | 1.50 | -0.8px | `"ss01", "ss04", "ss11"` |
| Feature Title | inter | 24px (1.50rem) | 500 | 1.50 | normal | Section sub-headings |
| Body Large | inter | 18px (1.13rem) | 400 | 1.50 | normal | Introductions |
| Body | inter | 16px (1.00rem) | 400 | 1.50 | normal | Standard body text |
| Body Semibold | inter | 16px (1.00rem) | 600 | 1.50 | normal | Emphasis, active states |
| Nav Link | aBCFavorit | 14px (0.88rem) | 500 | 1.43 | 0.35px | `"ss01", "ss03", "ss04"` — positive tracking |
| Button / Link | inter | 14px (0.88rem) | 500–600 | 1.43 | normal | Buttons, nav, CTAs |
| Caption | inter | 14px (0.88rem) | 400 | 1.60 (relaxed) | normal | Descriptions |
| Helvetica Caption | Helvetica | 14px (0.88rem) | 400–600 | 1.00–1.71 | normal | UI elements |
| Small | inter | 12px (0.75rem) | 400–500 | 1.33 | normal | Tags, meta, fine print |
| Small Uppercase | inter | 12px (0.75rem) | 500 | 1.33 | normal | `text-transform: uppercase` |
| Small Capitalize | inter | 12px (0.75rem) | 500 | 1.33 | normal | `text-transform: capitalize` |
| Code Body | commitMono | 16px (1.00rem) | 400 | 1.50 | normal | Code blocks |
| Code Small | commitMono | 14px (0.88rem) | 400 | 1.43 | normal | Inline code |
| Code Tiny | commitMono | 12px (0.75rem) | 400 | 1.33 | normal | Small code labels |
| Heading (Helvetica) | Helvetica | 24px (1.50rem) | 400 | 1.40 | normal | Alternate heading context |

### Principles
- **Three-font editorial hierarchy**: Domaine Display (serif, hero), ABC Favorit (geometric sans, sections), Inter (readable body). Each font has a strict role — they never cross lanes.
- **Aggressive negative tracking on display**: Domaine at -0.96px, ABC Favorit at -2.8px. The display type feels compressed, urgent, and designed — like a magazine masthead.
- **Positive tracking on nav**: ABC Favorit nav links use +0.35px letter-spacing — the only positive tracking in the system. This creates airy, spaced-out navigation text that contrasts with the compressed headings.
- **OpenType as identity**: The `"ss01"`, `"ss03"`, `"ss04"`, `"ss11"` stylistic sets are enabled on all ABC Favorit and Domaine text, activating alternate glyphs that give Resend's typography its unique character.
- **Commit Mono as design element**: The monospace font isn't hidden in code blocks — it's used prominently for code examples and technical content, treated as a first-class visual element.

## 4. Component Stylings

### Buttons

**Primary Transparent Pill**
- Background: transparent
- Text: `#f0f0f0`
- Padding: 5px 12px
- Radius: 9999px (full pill)
- Border: `1px solid rgba(214, 235, 253, 0.19)` (frost border)
- Hover: background `rgba(255, 255, 255, 0.28)` (white glass)
- Use: Primary CTA on dark backgrounds

**White Solid Pill**
- Background: `#ffffff`
- Text: `#000000`
- Padding: 5px 12px
- Radius: 9999px
- Use: High-contrast CTA ("Get started")

**Ghost Button**
- Background: transparent
- Text: `#f0f0f0`
- Radius: 4px
- No border
- Hover: subtle background tint
- Use: Secondary actions, tab items

### Cards & Containers
- Background: transparent or very subtle dark tint
- Border: `1px solid rgba(214, 235, 253, 0.19)` (frost border)
- Radius: 16px (standard cards), 24px (large sections/panels)
- Shadow: `rgba(176, 199, 217, 0.145) 0px 0px 0px 1px` (ring shadow)
- Dark product screenshots and code demos as card content
- No traditional box-shadow elevation

### Inputs & Forms
- Text: `#f0f0f0` on dark, `#000000` on light
- Radius: 4px
- Focus: shadow-based ring
- Minimal styling — inherits dark theme

### Navigation
- Sticky dark header with frost border bottom: `1px solid rgba(214, 235, 253, 0.19)`
- "Resend" wordmark left-aligned
- ABC Favorit 14px weight 500 with +0.35px tracking for nav links
- Pill CTAs right-aligned
- Mobile: hamburger collapse

### Image Treatment
- Product screenshots and code demos dominate content sections
- Dark-themed screenshots on dark background — seamless integration
- Rounded corners: 12px–16px on images
- Full-width sections with subtle gradient overlays

### Distinctive Components

**Tab Navigation**
- Horizontal tabs with subtle selection indicator
- Tab items: 8px radius
- Active state with subtle background differentiation

**Code Preview Panels**
- Dark code blocks using Commit Mono
- Frost borders (`rgba(214, 235, 253, 0.19)`)
- Syntax-highlighted with multi-color accent tokens (orange, blue, green, yellow)

**Multi-color Accent Badges**
- Each product feature has its own accent color from the CSS variable scale
- Badges use the accent color at low opacity (12–42%) for background, full opacity for text

## 5. Layout Principles

### Spacing System
- Base unit: 8px
- Scale: 1px, 2px, 4px, 5px, 6px, 7px, 8px, 10px, 12px, 16px, 20px, 24px, 30px, 32px, 40px

### Grid & Container
- Centered content with generous max-width
- Full-width black sections with contained inner content
- Single-column hero, expanding to feature grids below
- Code preview panels as full-width or contained showcases

### Whitespace Philosophy
- **Cinematic black space**: The black background IS the whitespace. Generous vertical spacing (80px–120px+) between sections creates a scroll-through-darkness experience where each section emerges like a scene.
- **Tight content, vast surrounds**: Text blocks and cards are compact internally, but float in vast dark space — creating isolated "islands" of content.
- **Typography-led rhythm**: The massive display fonts (96px) create their own vertical rhythm — each headline is a visual event that anchors the surrounding space.

### Border Radius Scale
- Sharp (4px): Buttons (ghost), inputs, small interactive elements
- Subtle (6px): Menu panels, navigation items
- Standard (8px): Tabs, content blocks
- Comfortable (10px): Accent elements
- Card (12px): Clipboard buttons, medium containers
- Large (16px): Feature cards, images, main buttons
- Section (24px): Large panels, section containers
- Pill (9999px): Primary CTAs, tags, badges

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (Level 0) | No shadow, transparent background | Default — most elements on dark void |
| Ring (Level 1) | `rgba(176, 199, 217, 0.145) 0px 0px 0px 1px` | Shadow-as-border for cards, containers |
| Frost Border (Level 1b) | `1px solid rgba(214, 235, 253, 0.19)` | Explicit borders — buttons, dividers, tabs |
| Subtle (Level 2) | `rgba(0, 0, 0, 0.1) 0px 1px 3px, rgba(0, 0, 0, 0.1) 0px 1px 2px -1px` | Light card elevation |
| Focus (Level 3) | `rgb(0, 0, 0) 0px 0px 0px 8px` | Heavy black focus ring — accessibility |

**Shadow Philosophy**: Resend barely uses shadows at all. On a pure black background, traditional shadows are invisible — you can't cast a shadow into the void. Instead, Resend creates depth through its signature frost borders (`rgba(214, 235, 253, 0.19)`) — thin, icy blue-tinted lines that catch light against the darkness. This creates a "glass panel floating in space" aesthetic where borders are the primary depth mechanism.

### Decorative Depth
- Subtle warm gradient glows behind hero content (orange/amber tints)
- Product screenshots create visual depth through their own internal UI
- No gradient backgrounds — depth comes from border luminance and content contrast

## 7. Do's and Don'ts

### Do
- Use pure black (`#000000`) as the page background — the void is the canvas
- Apply frost borders (`rgba(214, 235, 253, 0.19)`) for all structural lines — they're the blue-tinted signature
- Use Domaine Display ONLY for hero headings (96px), ABC Favorit for section headings, Inter for everything else
- Enable OpenType `"ss01"`, `"ss04"`, `"ss11"` on Domaine and ABC Favorit text
- Apply pill radius (9999px) to primary CTAs and tags
- Use the multi-color accent scale (orange/green/blue/yellow/red) with opacity variants for context-specific highlighting
- Keep shadows at ring level (`0px 0px 0px 1px`) — on black, traditional shadows don't work
- Use +0.35px letter-spacing on ABC Favorit nav links — the only positive tracking

### Don't
- Don't lighten the background above `#000000` — the pure black void is non-negotiable
- Don't use neutral gray borders — all borders must have the frost blue tint
- Don't apply Domaine Display to body text — it's a display-only serif
- Don't mix accent colors in the same component — each feature gets one accent color
- Don't use box-shadow for elevation on the dark background — use frost borders instead
- Don't skip the OpenType stylistic sets — they define the typographic character
- Don't use negative letter-spacing on nav links — ABC Favorit nav uses positive +0.35px
- Don't make buttons opaque on dark — transparency with frost border is the pattern

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile Small | <480px | Single column, tight padding, 76.8px hero |
| Mobile | 480–600px | Standard mobile, stacked layout |
| Desktop | >600px | Full layout, 96px hero, expanded sections |

*Note: Resend uses a minimal breakpoint system — only 480px and 600px detected. The design is desktop-first with a clean mobile collapse.*

### Touch Targets
- Pill buttons: adequate padding (5px 12px minimum)
- Tab items: 8px radius with comfortable hit areas
- Navigation links spaced with 0.35px tracking for visual separation

### Collapsing Strategy
- Hero: Domaine 96px → 76.8px on mobile
- Navigation: horizontal → hamburger
- Feature sections: side-by-side → stacked
- Code panels: maintain width, horizontal scroll if needed
- Spacing compresses proportionally

### Image Behavior
- Product screenshots maintain aspect ratio
- Dark screenshots blend seamlessly with dark background at all sizes
- Rounded corners (12px–16px) maintained across breakpoints

## 9. Agent Prompt Guide

### Quick Color Reference
- Background: Void Black (`#000000`)
- Primary text: Near White (`#f0f0f0`)
- Secondary text: Silver (`#a1a4a5`)
- Border: Frost Border (`rgba(214, 235, 253, 0.19)`)
- Orange accent: `#ff801f`
- Green accent: `#11ff99` (at 18% opacity)
- Blue accent: `#3b9eff`
- Focus ring: `rgb(0, 0, 0) 0px 0px 0px 8px`

### Example Component Prompts
- "Create a hero section on pure black (#000000) background. Headline at 96px Domaine Display weight 400, line-height 1.00, letter-spacing -0.96px, near-white (#f0f0f0) text, OpenType 'ss01 ss04 ss11'. Subtitle at 20px ABC Favorit weight 400, line-height 1.30. Two pill buttons: white solid (#ffffff, 9999px radius) and transparent with frost border (rgba(214,235,253,0.19))."
- "Design a navigation bar: dark background with frost border bottom (1px solid rgba(214,235,253,0.19)). Nav links at 14px ABC Favorit weight 500, letter-spacing +0.35px, OpenType 'ss01 ss03 ss04'. White pill CTA right-aligned."
- "Build a feature card: transparent background, frost border (rgba(214,235,253,0.19)), 16px radius. Title at 56px ABC Favorit weight 400, letter-spacing -2.8px. Body at 16px Inter weight 400, #a1a4a5 text."
- "Create a code block using Commit Mono 16px on dark background. Frost border container (24px radius). Syntax colors: orange (#ff801f), blue (#3b9eff), green (#11ff99), yellow (#ffc53d)."
- "Design an accent badge: background #ff5900 at 22% opacity, text #ffa057, 9999px radius, 12px Inter weight 500."

### Iteration Guide
1. Start with pure black — everything floats in the void
2. Frost borders (`rgba(214, 235, 253, 0.19)`) are the universal structural element — not gray, not neutral
3. Three fonts, three roles: Domaine (hero), ABC Favorit (sections), Inter (body) — never cross
4. OpenType stylistic sets are mandatory on display fonts — they define the character
5. Multi-color accents at low opacity (12–42%) for backgrounds, full opacity for text
6. Pill shape (9999px) for CTAs and badges, standard radius (4px–16px) for containers
7. No shadows — use frost borders for depth against the void
