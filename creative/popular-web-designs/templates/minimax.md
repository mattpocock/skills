# Design System: MiniMax


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

MiniMax's website is a clean, product-showcase platform for a Chinese AI technology company that bridges consumer-friendly appeal with technical credibility. The design language is predominantly white-space-driven with a light, airy feel — pure white backgrounds (`#ffffff`) dominate, letting colorful product cards and AI model illustrations serve as the visual anchors. The overall aesthetic sits at the intersection of Apple's product marketing clarity and a playful, rounded design language that makes AI technology feel approachable.

The typography system is notably multi-font: DM Sans serves as the primary UI workhorse, Outfit handles display headings with geometric elegance, Poppins appears for mid-tier headings, and Roboto handles data-heavy contexts. This variety reflects a brand in rapid growth — each font serves a distinct communicative purpose rather than competing for attention. The hero heading at 80px weight 500 in both DM Sans and Outfit with a tight 1.10 line-height creates a bold but not aggressive opening statement.

What makes MiniMax distinctive is its pill-button geometry (9999px radius) for navigation and primary actions, combined with softer 8px–24px radiused cards for product showcases. The product cards themselves are richly colorful — vibrant gradients in pink, purple, orange, and blue — creating a "gallery of AI capabilities" feel. Against the white canvas, these colorful cards pop like app icons on a phone home screen, making each AI model/product feel like a self-contained creative tool.

**Key Characteristics:**
- White-dominant layout with colorful product card accents
- Multi-font system: DM Sans (UI), Outfit (display), Poppins (mid-tier), Roboto (data)
- Pill buttons (9999px radius) for primary navigation and CTAs
- Generous rounded cards (20px–24px radius) for product showcases
- Brand blue spectrum: from `#1456f0` (brand-6) through `#3b82f6` (primary-500) to `#60a5fa` (light)
- Brand pink (`#ea5ec1`) as secondary accent
- Near-black text (`#222222`, `#18181b`) on white backgrounds
- Purple-tinted shadows (`rgba(44, 30, 116, 0.16)`) creating subtle brand-colored depth
- Dark footer section (`#181e25`) with product/company links

## 2. Color Palette & Roles

### Brand Primary
- **Brand Blue** (`#1456f0`): `--brand-6`, primary brand identity color
- **Sky Blue** (`#3daeff`): `--col-brand00`, lighter brand variant for accents
- **Brand Pink** (`#ea5ec1`): `--col-brand02`, secondary brand accent

### Blue Scale (Primary)
- **Primary 200** (`#bfdbfe`): `--color-primary-200`, light blue backgrounds
- **Primary Light** (`#60a5fa`): `--color-primary-light`, active states, highlights
- **Primary 500** (`#3b82f6`): `--color-primary-500`, standard blue actions
- **Primary 600** (`#2563eb`): `--color-primary-600`, hover states
- **Primary 700** (`#1d4ed8`): `--color-primary-700`, pressed/active states
- **Brand Deep** (`#17437d`): `--brand-3`, deep blue for emphasis

### Text Colors
- **Near Black** (`#222222`): `--col-text00`, primary text
- **Dark** (`#18181b`): Button text, headings
- **Charcoal** (`#181e25`): Dark surface text, footer background
- **Dark Gray** (`#45515e`): `--col-text04`, secondary text
- **Mid Gray** (`#8e8e93`): Tertiary text, muted labels
- **Light Gray** (`#5f5f5f`): `--brand-2`, helper text

### Surface & Background
- **Pure White** (`#ffffff`): `--col-bg13`, primary background
- **Light Gray** (`#f0f0f0`): Secondary button backgrounds
- **Glass White** (`hsla(0, 0%, 100%, 0.4)`): `--fill-bg-white`, frosted glass overlay
- **Border Light** (`#f2f3f5`): Subtle section dividers
- **Border Gray** (`#e5e7eb`): Component borders

### Semantic
- **Success Background** (`#e8ffea`): `--success-bg`, positive state backgrounds

### Shadows
- **Standard** (`rgba(0, 0, 0, 0.08) 0px 4px 6px`): Default card shadow
- **Soft Glow** (`rgba(0, 0, 0, 0.08) 0px 0px 22.576px`): Ambient soft shadow
- **Brand Purple** (`rgba(44, 30, 116, 0.16) 0px 0px 15px`): Brand-tinted glow
- **Brand Purple Offset** (`rgba(44, 30, 116, 0.11) 6.5px 2px 17.5px`): Directional brand glow
- **Card Elevation** (`rgba(36, 36, 36, 0.08) 0px 12px 16px -4px`): Lifted card shadow

## 3. Typography Rules

### Font Families
- **Primary UI**: `DM Sans`, with fallbacks: `Helvetica Neue, Helvetica, Arial`
- **Display**: `Outfit`, with fallbacks: `Helvetica Neue, Helvetica, Arial`
- **Mid-tier**: `Poppins`
- **Data/Technical**: `Roboto`, with fallbacks: `Helvetica Neue, Helvetica, Arial`

### Hierarchy

| Role | Font | Size | Weight | Line Height | Notes |
|------|------|------|--------|-------------|-------|
| Display Hero | DM Sans / Outfit | 80px (5.00rem) | 500 | 1.10 (tight) | Hero headlines |
| Section Heading | Outfit | 31px (1.94rem) | 600 | 1.50 | Feature section titles |
| Section Heading Alt | Roboto / DM Sans | 32px (2.00rem) | 600 | 0.88 (tight) | Compact headers |
| Card Title | Outfit | 28px (1.75rem) | 500–600 | 1.71 (relaxed) | Product card headings |
| Sub-heading | Poppins | 24px (1.50rem) | 500 | 1.50 | Mid-tier headings |
| Feature Label | Poppins | 18px (1.13rem) | 500 | 1.50 | Feature names |
| Body Large | DM Sans | 20px (1.25rem) | 500 | 1.50 | Emphasized body |
| Body | DM Sans | 16px (1.00rem) | 400–500 | 1.50 | Standard body text |
| Body Bold | DM Sans | 16px (1.00rem) | 700 | 1.50 | Strong emphasis |
| Nav/Link | DM Sans | 14px (0.88rem) | 400–500 | 1.50 | Navigation, links |
| Button Small | DM Sans | 13px (0.81rem) | 600 | 1.50 | Compact buttons |
| Caption | DM Sans / Poppins | 13px (0.81rem) | 400 | 1.70 (relaxed) | Metadata |
| Small Label | DM Sans | 12px (0.75rem) | 500–600 | 1.25–1.50 | Tags, badges |
| Micro | DM Sans / Outfit | 10px (0.63rem) | 400–500 | 1.50–1.80 | Tiny annotations |

### Principles
- **Multi-font purpose**: DM Sans = UI workhorse (body, nav, buttons); Outfit = geometric display (headings, product names); Poppins = friendly mid-tier (sub-headings, features); Roboto = technical/data contexts.
- **Universal 1.50 line-height**: The overwhelming majority of text uses 1.50 line-height, creating a consistent reading rhythm regardless of font or size. Exceptions: display (1.10 tight) and some captions (1.70 relaxed).
- **Weight 500 as default emphasis**: Most headings use 500 (medium) rather than bold, creating a modern, approachable tone. 600 for section titles, 700 reserved for strong emphasis.
- **Compact hierarchy**: The size scale jumps from 80px display straight to 28–32px section, then 16–20px body — a deliberate compression that keeps the visual hierarchy feeling efficient.

## 4. Component Stylings

### Buttons

**Pill Primary Dark**
- Background: `#181e25`
- Text: `#ffffff`
- Padding: 11px 20px
- Radius: 8px
- Use: Primary CTA ("Get Started", "Learn More")

**Pill Nav**
- Background: `rgba(0, 0, 0, 0.05)` (subtle tint)
- Text: `#18181b`
- Radius: 9999px (full pill)
- Use: Navigation tabs, filter toggles

**Pill White**
- Background: `#ffffff`
- Text: `rgba(24, 30, 37, 0.8)`
- Radius: 9999px
- Opacity: 0.5 (default state)
- Use: Secondary nav, inactive tabs

**Secondary Light**
- Background: `#f0f0f0`
- Text: `#333333`
- Padding: 11px 20px
- Radius: 8px
- Use: Secondary actions

### Product Cards
- Background: Vibrant gradients (pink/purple/orange/blue)
- Radius: 20px–24px (generous rounding)
- Shadow: `rgba(44, 30, 116, 0.16) 0px 0px 15px` (brand purple glow)
- Content: Product name, model version, descriptive text
- Each card has its own color palette matching the product identity

### AI Product Cards (Matrix)
- Background: white with subtle shadow
- Radius: 13px–16px
- Shadow: `rgba(0, 0, 0, 0.08) 0px 4px 6px`
- Icon/illustration centered above product name
- Product name in DM Sans 14–16px weight 500

### Links
- **Primary**: `#18181b` or `#181e25`, underline on dark text
- **Secondary**: `#8e8e93`, muted for less emphasis
- **On Dark**: `rgba(255, 255, 255, 0.8)` for footer and dark sections

### Navigation
- Clean horizontal nav on white background
- MiniMax logo left-aligned (red accent in logo)
- DM Sans 14px weight 500 for nav items
- Pill-shaped active indicators (9999px radius)
- "Login" text link, minimal right-side actions
- Sticky header behavior

## 5. Layout Principles

### Spacing System
- Base unit: 8px
- Scale: 1px, 2px, 4px, 6px, 8px, 10px, 11px, 14px, 16px, 24px, 32px, 40px, 50px, 64px, 80px

### Grid & Container
- Max content width centered on page
- Product card grids: horizontal scroll or 3–4 column layout
- Full-width white sections with contained content
- Dark footer at full-width

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile | <768px | Single column, stacked cards |
| Tablet | 768–1024px | 2-column grids |
| Desktop | >1024px | Full layout, horizontal card scrolls |

### Whitespace Philosophy
- **Gallery spacing**: Products are presented like gallery items with generous white space between cards, letting each AI model breathe as its own showcase.
- **Section rhythm**: Large vertical gaps (64px–80px) between major sections create distinct "chapters" of content.
- **Card breathing**: Product cards use internal padding of 16px–24px with ample whitespace around text.

### Border Radius Scale
- Minimal (4px): Small tags, micro badges
- Standard (8px): Buttons, small cards
- Comfortable (11px–13px): Medium cards, panels
- Generous (16px–20px): Large product cards
- Large (22px–24px): Hero product cards, major containers
- Pill (30px–32px): Badge pills, rounded panels
- Full (9999px): Buttons, nav tabs

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (Level 0) | No shadow | White background, text blocks |
| Subtle (Level 1) | `rgba(0, 0, 0, 0.08) 0px 4px 6px` | Standard cards, containers |
| Ambient (Level 2) | `rgba(0, 0, 0, 0.08) 0px 0px 22.576px` | Soft glow around elements |
| Brand Glow (Level 3) | `rgba(44, 30, 116, 0.16) 0px 0px 15px` | Featured product cards |
| Elevated (Level 4) | `rgba(36, 36, 36, 0.08) 0px 12px 16px -4px` | Lifted cards, hover states |

**Shadow Philosophy**: MiniMax uses a distinctive purple-tinted shadow (`rgba(44, 30, 116, ...)`) for featured elements, creating a subtle brand-color glow that connects the shadow system to the blue brand identity. Standard shadows use neutral black but at low opacity (0.08), keeping everything feeling light and airy. The directional shadow variant (6.5px offset) adds dimensional interest to hero product cards.

## 7. Do's and Don'ts

### Do
- Use white as the dominant background — let product cards provide the color
- Apply pill radius (9999px) for navigation tabs and toggle buttons
- Use generous border radius (20px–24px) for product showcase cards
- Employ the purple-tinted shadow for featured/hero product cards
- Keep body text at DM Sans weight 400–500 — heavier weights for buttons only
- Use Outfit for display headings, DM Sans for everything functional
- Maintain the universal 1.50 line-height across body text
- Let colorful product illustrations/gradients serve as the primary visual interest

### Don't
- Don't add colored backgrounds to main content sections — white is structural
- Don't use sharp corners (0–4px radius) on product cards — the rounded aesthetic is core
- Don't apply the brand pink (`#ea5ec1`) to text or buttons — it's for logo and decorative accents only
- Don't mix more than one display font per section (Outfit OR Poppins, not both)
- Don't use weight 700 for headings — 500–600 is the range, 700 is reserved for strong emphasis in body text
- Don't darken shadows beyond 0.16 opacity — the light, airy feel requires restraint
- Don't use Roboto for headings — it's the data/technical context font only

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile | <768px | Single column, stacked product cards, hamburger nav |
| Tablet | 768–1024px | 2-column product grids, condensed spacing |
| Desktop | >1024px | Full horizontal card layouts, expanded spacing |

### Collapsing Strategy
- Hero: 80px → responsive scaling to ~40px on mobile
- Product card grid: horizontal scroll → 2-column → single column stacked
- Navigation: horizontal → hamburger menu
- Footer: multi-column → stacked sections
- Spacing: 64–80px gaps → 32–40px on mobile

## 9. Agent Prompt Guide

### Quick Color Reference
- Background: `#ffffff` (primary), `#181e25` (dark/footer)
- Text: `#222222` (primary), `#45515e` (secondary), `#8e8e93` (muted)
- Brand Blue: `#1456f0` (brand), `#3b82f6` (primary-500), `#2563eb` (hover)
- Brand Pink: `#ea5ec1` (accent only)
- Borders: `#e5e7eb`, `#f2f3f5`

### Example Component Prompts
- "Create a hero section on white background. Headline at 80px Outfit weight 500, line-height 1.10, near-black (#222222) text. Sub-text at 16px DM Sans weight 400, line-height 1.50, #45515e. Dark CTA button (#181e25, 8px radius, 11px 20px padding, white text)."
- "Design a product card grid: white cards with 20px border-radius, shadow rgba(44,30,116,0.16) 0px 0px 15px. Product name at 28px Outfit weight 600. Internal gradient background for the product illustration area."
- "Build navigation bar: white background, DM Sans 14px weight 500 for links, #18181b text. Pill-shaped active tab (9999px radius, rgba(0,0,0,0.05) background). MiniMax logo left-aligned."
- "Create an AI product matrix: 4-column grid of cards with 13px radius, subtle shadow rgba(0,0,0,0.08) 0px 4px 6px. Centered icon above product name in DM Sans 16px weight 500."
- "Design footer on dark (#181e25) background. Product links in DM Sans 14px, rgba(255,255,255,0.8). Multi-column layout."

### Iteration Guide
1. Start with white — color comes from product cards and illustrations only
2. Pill buttons (9999px) for nav/tabs, standard radius (8px) for CTA buttons
3. Purple-tinted shadows for featured cards, neutral shadows for everything else
4. DM Sans handles 70% of text — Outfit is display-only, Poppins is mid-tier only
5. Keep weights moderate (500–600 for headings) — the brand tone is confident but approachable
6. Large radius cards (20–24px) for products, smaller radius (8–13px) for UI elements
