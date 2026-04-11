# Design System: Zapier


> **Hermes Agent — Implementation Notes**
>
> The original site uses proprietary fonts. For self-contained HTML output, use these CDN substitutes:
> - **Primary:** `Inter` | **Mono:** `system monospace stack`
> - **Font stack (CSS):** `font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;`
> - **Mono stack (CSS):** `font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;`
> ```html
> <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
> ```
> Use `write_file` to create HTML, serve via `generative-widgets` skill (cloudflared tunnel).
> Verify visual accuracy with `browser_vision` after generating.

## 1. Visual Theme & Atmosphere

Zapier's website radiates warm, approachable professionalism. It rejects the cold monochrome minimalism of developer tools in favor of a cream-tinted canvas (`#fffefb`) that feels like unbleached paper -- the digital equivalent of a well-organized notebook. The near-black (`#201515`) text has a faint reddish-brown warmth, creating an atmosphere more human than mechanical. This is automation designed to feel effortless, not technical.

The typographic system is a deliberate interplay of two distinct personalities. **Degular Display** -- a geometric, wide-set display face -- handles hero-scale headlines at 56-80px with medium weight (500) and extraordinarily tight line-heights (0.90), creating headlines that compress vertically like stacked blocks. **Inter** serves as the workhorse for everything else, from section headings to body text and navigation, with fallbacks to Helvetica and Arial. **GT Alpina**, an elegant thin-weight serif with aggressive negative letter-spacing (-1.6px to -1.92px), makes occasional appearances for softer editorial moments. This three-font system gives Zapier the ability to shift register -- from bold and punchy (Degular) to clean and functional (Inter) to refined and literary (GT Alpina).

The brand's signature orange (`#ff4f00`) is unmistakable -- a vivid, saturated red-orange that sits precisely between traffic-cone urgency and sunset warmth. It's used sparingly but decisively: primary CTA buttons, active state underlines, and accent borders. Against the warm cream background, this orange creates a color relationship that feels energetic without being aggressive.

**Key Characteristics:**
- Warm cream canvas (`#fffefb`) instead of pure white -- organic, paper-like warmth
- Near-black with reddish undertone (`#201515`) -- text that breathes rather than dominates
- Degular Display for hero headlines at 0.90 line-height -- compressed, impactful, modern
- Inter as the universal UI font across all functional typography
- GT Alpina for editorial accents -- thin-weight serif with extreme negative tracking
- Zapier Orange (`#ff4f00`) as the single accent -- vivid, warm, sparingly applied
- Warm neutral palette: borders (`#c5c0b1`), muted text (`#939084`), surface tints (`#eceae3`)
- 8px base spacing system with generous padding on CTAs (20px 24px)
- Border-forward design: `1px solid` borders in warm grays define structure over shadows

## 2. Color Palette & Roles

### Primary
- **Zapier Black** (`#201515`): Primary text, headings, dark button backgrounds. A warm near-black with reddish undertones -- never cold.
- **Cream White** (`#fffefb`): Page background, card surfaces, light button fills. Not pure white; the yellowish warmth is intentional.
- **Off-White** (`#fffdf9`): Secondary background surface, subtle alternate tint. Nearly indistinguishable from cream white but creates depth.

### Brand Accent
- **Zapier Orange** (`#ff4f00`): Primary CTA buttons, active underline indicators, accent borders. The signature color -- vivid and warm.

### Neutral Scale
- **Dark Charcoal** (`#36342e`): Secondary text, footer text, border color for strong dividers. A warm dark gray-brown with 70% opacity variant.
- **Warm Gray** (`#939084`): Tertiary text, muted labels, timestamp-style content. Mid-range with greenish-warm undertone.
- **Sand** (`#c5c0b1`): Primary border color, hover state backgrounds, divider lines. The backbone of Zapier's structural elements.
- **Light Sand** (`#eceae3`): Secondary button backgrounds, light borders, subtle card surfaces.
- **Mid Warm** (`#b5b2aa`): Alternate border tone, used on specific span elements.

### Interactive
- **Orange CTA** (`#ff4f00`): Primary action buttons and active tab underlines.
- **Dark CTA** (`#201515`): Secondary dark buttons with sand hover state.
- **Light CTA** (`#eceae3`): Tertiary/ghost buttons with sand hover.
- **Link Default** (`#201515`): Standard link color, matching body text.
- **Hover Underline**: Links remove `text-decoration: underline` on hover (inverse pattern).

### Overlay & Surface
- **Semi-transparent Dark** (`rgba(45, 45, 46, 0.5)`): Overlay button variant, backdrop-like elements.
- **Pill Surface** (`#fffefb`): White pill buttons with sand borders.

### Shadows & Depth
- **Inset Underline** (`rgb(255, 79, 0) 0px -4px 0px 0px inset`): Active tab indicator -- orange underline using inset box-shadow.
- **Hover Underline** (`rgb(197, 192, 177) 0px -4px 0px 0px inset`): Inactive tab hover -- sand-colored underline.

## 3. Typography Rules

### Font Families
- **Display**: `Degular Display` -- wide geometric display face for hero headlines
- **Primary**: `Inter`, with fallbacks: `Helvetica, Arial`
- **Editorial**: `GT Alpina` -- thin-weight serif for editorial moments
- **System**: `Arial` -- fallback for form elements and system UI

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Display Hero XL | Degular Display | 80px (5.00rem) | 500 | 0.90 (tight) | normal | Maximum impact, compressed block |
| Display Hero | Degular Display | 56px (3.50rem) | 500 | 0.90-1.10 (tight) | 0-1.12px | Primary hero headlines |
| Display Hero SM | Degular Display | 40px (2.50rem) | 500 | 0.90 (tight) | normal | Smaller hero variant |
| Display Button | Degular Display | 24px (1.50rem) | 600 | 1.00 (tight) | 1px | Large CTA button text |
| Section Heading | Inter | 48px (3.00rem) | 500 | 1.04 (tight) | normal | Major section titles |
| Editorial Heading | GT Alpina | 48px (3.00rem) | 250 | normal | -1.92px | Thin editorial headlines |
| Editorial Sub | GT Alpina | 40px (2.50rem) | 300 | 1.08 (tight) | -1.6px | Editorial subheadings |
| Sub-heading LG | Inter | 36px (2.25rem) | 500 | normal | -1px | Large sub-sections |
| Sub-heading | Inter | 32px (2.00rem) | 400 | 1.25 (tight) | normal | Standard sub-sections |
| Sub-heading MD | Inter | 28px (1.75rem) | 500 | normal | normal | Medium sub-headings |
| Card Title | Inter | 24px (1.50rem) | 600 | normal | -0.48px | Card headings |
| Body Large | Inter | 20px (1.25rem) | 400-500 | 1.00-1.20 (tight) | -0.2px | Feature descriptions |
| Body Emphasis | Inter | 18px (1.13rem) | 600 | 1.00 (tight) | normal | Emphasized body text |
| Body | Inter | 16px (1.00rem) | 400-500 | 1.20-1.25 | -0.16px | Standard reading text |
| Body Semibold | Inter | 16px (1.00rem) | 600 | 1.16 (tight) | normal | Strong labels |
| Button | Inter | 16px (1.00rem) | 600 | normal | normal | Standard buttons |
| Button SM | Inter | 14px (0.88rem) | 600 | normal | normal | Small buttons |
| Caption | Inter | 14px (0.88rem) | 500 | 1.25-1.43 | normal | Labels, metadata |
| Caption Upper | Inter | 14px (0.88rem) | 600 | normal | 0.5px | Uppercase section labels |
| Micro | Inter | 12px (0.75rem) | 600 | 0.90-1.33 | 0.5px | Tiny labels, often uppercase |
| Micro SM | Inter | 13px (0.81rem) | 500 | 1.00-1.54 | normal | Small metadata text |

### Principles
- **Three-font system, clear roles**: Degular Display commands attention at hero scale only. Inter handles everything functional. GT Alpina adds editorial warmth sparingly.
- **Compressed display**: Degular at 0.90 line-height creates vertically compressed headline blocks that feel modern and architectural.
- **Weight as hierarchy signal**: Inter uses 400 (reading), 500 (navigation/emphasis), 600 (headings/CTAs). Degular uses 500 (display) and 600 (buttons).
- **Uppercase for labels**: Section labels (like "01 / Colors") and small categorization use `text-transform: uppercase` with 0.5px letter-spacing.
- **Negative tracking for elegance**: GT Alpina uses -1.6px to -1.92px letter-spacing for its thin-weight editorial headlines.

## 4. Component Stylings

### Buttons

**Primary Orange**
- Background: `#ff4f00`
- Text: `#fffefb`
- Padding: 8px 16px
- Radius: 4px
- Border: `1px solid #ff4f00`
- Use: Primary CTA ("Start free with email", "Sign up free")

**Primary Dark**
- Background: `#201515`
- Text: `#fffefb`
- Padding: 20px 24px
- Radius: 8px
- Border: `1px solid #201515`
- Hover: background shifts to `#c5c0b1`, text to `#201515`
- Use: Large secondary CTA buttons

**Light / Ghost**
- Background: `#eceae3`
- Text: `#36342e`
- Padding: 20px 24px
- Radius: 8px
- Border: `1px solid #c5c0b1`
- Hover: background shifts to `#c5c0b1`, text to `#201515`
- Use: Tertiary actions, filter buttons

**Pill Button**
- Background: `#fffefb`
- Text: `#36342e`
- Padding: 0px 16px
- Radius: 20px
- Border: `1px solid #c5c0b1`
- Use: Tag-like selections, filter pills

**Overlay Semi-transparent**
- Background: `rgba(45, 45, 46, 0.5)`
- Text: `#fffefb`
- Radius: 20px
- Hover: background becomes fully opaque `#2d2d2e`
- Use: Video play buttons, floating actions

**Tab / Navigation (Inset Shadow)**
- Background: transparent
- Text: `#201515`
- Padding: 12px 16px
- Shadow: `rgb(255, 79, 0) 0px -4px 0px 0px inset` (active orange underline)
- Hover shadow: `rgb(197, 192, 177) 0px -4px 0px 0px inset` (sand underline)
- Use: Horizontal tab navigation

### Cards & Containers
- Background: `#fffefb`
- Border: `1px solid #c5c0b1` (warm sand border)
- Radius: 5px (standard), 8px (featured)
- No shadow elevation by default -- borders define containment
- Hover: subtle border color intensification

### Inputs & Forms
- Background: `#fffefb`
- Text: `#201515`
- Border: `1px solid #c5c0b1`
- Radius: 5px
- Focus: border color shifts to `#ff4f00` (orange)
- Placeholder: `#939084`

### Navigation
- Clean horizontal nav on cream background
- Zapier logotype left-aligned, 104x28px
- Links: Inter 16px weight 500, `#201515` text
- CTA: Orange button ("Start free with email")
- Tab navigation uses inset box-shadow underline technique
- Mobile: hamburger collapse

### Image Treatment
- Product screenshots with `1px solid #c5c0b1` border
- Rounded corners: 5-8px
- Dashboard/workflow screenshots prominent in feature sections
- Light gradient backgrounds behind hero content

### Distinctive Components

**Workflow Integration Cards**
- Display connected app icons in pairs
- Arrow or connection indicator between apps
- Sand border containment
- Inter weight 500 for app names

**Stat Counter**
- Large display number using Inter 48px weight 500
- Muted description below in `#36342e`
- Used for social proof metrics

**Social Proof Icons**
- Circular icon buttons: 14px radius
- Sand border: `1px solid #c5c0b1`
- Used for social media follow links in footer

## 5. Layout Principles

### Spacing System
- Base unit: 8px
- Scale: 1px, 4px, 6px, 8px, 10px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 56px, 64px, 72px
- CTA buttons use generous padding: 20px 24px for large, 8px 16px for standard
- Section padding: 64px-80px vertical

### Grid & Container
- Max content width: approximately 1200px
- Hero: centered single-column with large top padding
- Feature sections: 2-3 column grids for integration cards
- Full-width sand-bordered dividers between sections
- Footer: multi-column dark background (`#201515`)

### Whitespace Philosophy
- **Warm breathing room**: Generous vertical spacing between sections (64px-80px), but content areas are relatively dense -- Zapier packs information efficiently within its cream canvas.
- **Architectural compression**: Degular Display headlines at 0.90 line-height compress vertically, contrasting with the open spacing around them.
- **Section rhythm**: Cream background throughout, with sections separated by sand-colored borders rather than background color changes.

### Border Radius Scale
- Tight (3px): Small inline spans
- Standard (4px): Buttons (orange CTA), tags, small elements
- Content (5px): Cards, links, general containers
- Comfortable (8px): Featured cards, large buttons, tabs
- Social (14px): Social icon buttons, pill-like elements
- Pill (20px): Play buttons, large pill buttons, floating actions

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (Level 0) | No shadow | Page background, text blocks |
| Bordered (Level 1) | `1px solid #c5c0b1` | Standard cards, containers, inputs |
| Strong Border (Level 1b) | `1px solid #36342e` | Dark dividers, emphasized sections |
| Active Tab (Level 2) | `rgb(255, 79, 0) 0px -4px 0px 0px inset` | Active tab underline (orange) |
| Hover Tab (Level 2b) | `rgb(197, 192, 177) 0px -4px 0px 0px inset` | Hover tab underline (sand) |
| Focus (Accessibility) | `1px solid #ff4f00` outline | Focus ring on interactive elements |

**Shadow Philosophy**: Zapier deliberately avoids traditional shadow-based elevation. Structure is defined almost entirely through borders -- warm sand (`#c5c0b1`) borders for standard containment, dark charcoal (`#36342e`) borders for emphasis. The only shadow-like technique is the inset box-shadow used for tab underlines, where a `0px -4px 0px 0px inset` shadow creates a bottom-bar indicator. This border-first approach keeps the design grounded and tangible rather than floating.

### Decorative Depth
- Orange inset underline on active tabs creates visual "weight" at the bottom of elements
- Sand hover underlines provide preview states without layout shifts
- No background gradients in main content -- the cream canvas is consistent
- Footer uses full dark background (`#201515`) for contrast reversal

## 7. Do's and Don'ts

### Do
- Use Degular Display exclusively for hero-scale headlines (40px+) with 0.90 line-height for compressed impact
- Use Inter for all functional UI -- navigation, body text, buttons, labels
- Apply warm cream (`#fffefb`) as the background, never pure white
- Use `#201515` for text, never pure black -- the reddish warmth matters
- Keep Zapier Orange (`#ff4f00`) reserved for primary CTAs and active state indicators
- Use sand (`#c5c0b1`) borders as the primary structural element instead of shadows
- Apply generous button padding (20px 24px) for large CTAs to match Zapier's spacious button style
- Use inset box-shadow underlines for tab navigation rather than border-bottom
- Apply uppercase with 0.5px letter-spacing for section labels and micro-categorization

### Don't
- Don't use Degular Display for body text or UI elements -- it's display-only
- Don't use pure white (`#ffffff`) or pure black (`#000000`) -- Zapier's palette is warm-shifted
- Don't apply box-shadow elevation to cards -- use borders instead
- Don't scatter Zapier Orange across the UI -- it's reserved for CTAs and active states
- Don't use tight padding on large CTA buttons -- Zapier's buttons are deliberately spacious
- Don't ignore the warm neutral system -- borders should be `#c5c0b1`, not gray
- Don't use GT Alpina for functional UI -- it's an editorial accent at thin weights only
- Don't apply positive letter-spacing to GT Alpina -- it uses aggressive negative tracking (-1.6px to -1.92px)
- Don't use rounded pill shapes (9999px) for primary buttons -- pills are for tags and social icons

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile Small | <450px | Tight single column, reduced hero text |
| Mobile | 450-600px | Standard mobile, stacked layout |
| Mobile Large | 600-640px | Slight horizontal breathing room |
| Tablet Small | 640-680px | 2-column grids begin |
| Tablet | 680-768px | Card grids expand |
| Tablet Large | 768-991px | Full card grids, expanded padding |
| Desktop Small | 991-1024px | Desktop layout initiates |
| Desktop | 1024-1280px | Full layout, maximum content width |
| Large Desktop | >1280px | Centered with generous margins |

### Touch Targets
- Large CTA buttons: 20px 24px padding (comfortable 60px+ height)
- Standard buttons: 8px 16px padding
- Navigation links: 16px weight 500 with adequate spacing
- Social icons: 14px radius circular buttons
- Tab items: 12px 16px padding

### Collapsing Strategy
- Hero: Degular 80px display scales to 40-56px on smaller screens
- Navigation: horizontal links + CTA collapse to hamburger menu
- Feature cards: 3-column grid to 2-column to single-column stacked
- Integration workflow illustrations: maintain aspect ratio, may simplify
- Footer: multi-column dark section collapses to stacked
- Section spacing: 64-80px reduces to 40-48px on mobile

### Image Behavior
- Product screenshots maintain sand border treatment at all sizes
- Integration app icons maintain fixed sizes within responsive containers
- Hero illustrations scale proportionally
- Full-width sections maintain edge-to-edge treatment

## 9. Agent Prompt Guide

### Quick Color Reference
- Primary CTA: Zapier Orange (`#ff4f00`)
- Background: Cream White (`#fffefb`)
- Heading text: Zapier Black (`#201515`)
- Body text: Dark Charcoal (`#36342e`)
- Border: Sand (`#c5c0b1`)
- Secondary surface: Light Sand (`#eceae3`)
- Muted text: Warm Gray (`#939084`)

### Example Component Prompts
- "Create a hero section on cream background (`#fffefb`). Headline at 56px Degular Display weight 500, line-height 0.90, color `#201515`. Subtitle at 20px Inter weight 400, line-height 1.20, color `#36342e`. Orange CTA button (`#ff4f00`, 4px radius, 8px 16px padding, white text) and dark button (`#201515`, 8px radius, 20px 24px padding, white text)."
- "Design a card: cream background (`#fffefb`), `1px solid #c5c0b1` border, 5px radius. Title at 24px Inter weight 600, letter-spacing -0.48px, `#201515`. Body at 16px weight 400, `#36342e`. No box-shadow."
- "Build a tab navigation: transparent background. Inter 16px weight 500, `#201515` text. Active tab: `box-shadow: rgb(255, 79, 0) 0px -4px 0px 0px inset`. Hover: `box-shadow: rgb(197, 192, 177) 0px -4px 0px 0px inset`. Padding 12px 16px."
- "Create navigation: cream sticky header (`#fffefb`). Inter 16px weight 500 for links, `#201515` text. Orange pill CTA 'Start free with email' right-aligned (`#ff4f00`, 4px radius, 8px 16px padding)."
- "Design a footer with dark background (`#201515`). Text `#fffefb`. Links in `#c5c0b1` with hover to `#fffefb`. Multi-column layout. Social icons as 14px-radius circles with sand borders."

### Iteration Guide
1. Always use warm cream (`#fffefb`) background, never pure white -- the warmth defines Zapier
2. Borders (`1px solid #c5c0b1`) are the structural backbone -- avoid shadow elevation
3. Zapier Orange (`#ff4f00`) is the only accent color; everything else is warm neutrals
4. Three fonts, strict roles: Degular Display (hero), Inter (UI), GT Alpina (editorial)
5. Large CTA buttons need generous padding (20px 24px) -- Zapier buttons feel spacious
6. Tab navigation uses inset box-shadow underlines, not border-bottom
7. Text is always warm: `#201515` for dark, `#36342e` for body, `#939084` for muted
8. Uppercase labels at 12-14px with 0.5px letter-spacing for section categorization
