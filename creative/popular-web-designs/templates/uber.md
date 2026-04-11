# Design System: Uber


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

Uber's design language is a masterclass in confident minimalism -- a black-and-white universe where every pixel serves a purpose and nothing decorates without earning its place. The entire experience is built on a stark duality: jet black (`#000000`) and pure white (`#ffffff`), with virtually no mid-tone grays diluting the message. This isn't the sterile minimalism of a startup that hasn't finished designing -- it's the deliberate restraint of a brand so established it can afford to whisper.

The signature typeface, UberMove, is a proprietary geometric sans-serif with a distinctly square, engineered quality. Headlines in UberMove Bold at 52px carry the weight of a billboard -- authoritative, direct, unapologetic. The companion face UberMoveText handles body copy and buttons with a slightly softer, more readable character at medium weight (500). Together, they create a typographic system that feels like a transit map: clear, efficient, built for scanning at speed.

What makes Uber's design truly distinctive is its use of full-bleed photography and illustration paired with pill-shaped interactive elements (999px border-radius). Navigation chips, CTA buttons, and category selectors all share this capsule shape, creating a tactile, thumb-friendly interface language that's unmistakably Uber. The illustrations -- warm, slightly stylized scenes of drivers, riders, and cityscapes -- inject humanity into what could otherwise be a cold, monochrome system. The site alternates between white content sections and a full-black footer, with card-based layouts using the gentlest possible shadows (rgba(0,0,0,0.12-0.16)) to create subtle lift without breaking the flat aesthetic.

**Key Characteristics:**
- Pure black-and-white foundation with virtually no mid-tone grays in the UI chrome
- UberMove (headlines) + UberMoveText (body/UI) -- proprietary geometric sans-serif family
- Pill-shaped everything: buttons, chips, nav items all use 999px border-radius
- Warm, human illustrations contrasting the stark monochrome interface
- Card-based layout with whisper-soft shadows (0.12-0.16 opacity)
- 8px spacing grid with compact, information-dense layouts
- Bold photography integrated as full-bleed hero backgrounds
- Black footer anchoring the page with a dark, high-contrast environment

## 2. Color Palette & Roles

### Primary
- **Uber Black** (`#000000`): The defining brand color -- used for primary buttons, headlines, navigation text, and the footer. Not "near-black" or "off-black," but true, uncompromising black.
- **Pure White** (`#ffffff`): The primary surface color and inverse text. Used for page backgrounds, card surfaces, and text on black elements.

### Interactive & Button States
- **Hover Gray** (`#e2e2e2`): White button hover state -- a clean, cool light gray that provides clear feedback without warmth.
- **Hover Light** (`#f3f3f3`): Subtle hover for elevated white buttons -- barely-there gray for gentle interaction feedback.
- **Chip Gray** (`#efefef`): Background for secondary/filter buttons and navigation chips -- a neutral, ultra-light gray.

### Text & Content
- **Body Gray** (`#4b4b4b`): Secondary text and footer links -- a true mid-gray with no warm or cool bias.
- **Muted Gray** (`#afafaf`): Tertiary text, de-emphasized footer links, and placeholder content.

### Borders & Separation
- **Border Black** (`#000000`): Thin 1px borders for structural containment -- used sparingly on dividers and form containers.

### Shadows & Depth
- **Shadow Light** (`rgba(0, 0, 0, 0.12)`): Standard card elevation -- a featherweight lift for content cards.
- **Shadow Medium** (`rgba(0, 0, 0, 0.16)`): Slightly stronger elevation for floating action buttons and overlays.
- **Button Press** (`rgba(0, 0, 0, 0.08)`): Inset shadow for active/pressed states on secondary buttons.

### Link States
- **Default Link Blue** (`#0000ee`): Standard browser blue for text links with underline -- used in body content.
- **Link White** (`#ffffff`): Links on dark surfaces -- used in footer and dark sections.
- **Link Black** (`#000000`): Links on light surfaces with underline decoration.

### Gradient System
- Uber's design is **entirely gradient-free**. The black/white duality and flat color blocks create all visual hierarchy. No gradients appear anywhere in the system -- every surface is a solid color, every transition is a hard edge or a shadow.

## 3. Typography Rules

### Font Family
- **Headline / Display**: `UberMove`, with fallbacks: `UberMoveText, system-ui, Helvetica Neue, Helvetica, Arial, sans-serif`
- **Body / UI**: `UberMoveText`, with fallbacks: `system-ui, Helvetica Neue, Helvetica, Arial, sans-serif`

*Note: UberMove and UberMoveText are proprietary typefaces. For external implementations, use `system-ui` or Inter as the closest available substitute. The geometric, square-proportioned character of UberMove can be approximated with Inter or DM Sans.*

### Hierarchy

| Role | Font | Size | Weight | Line Height | Notes |
|------|------|------|--------|-------------|-------|
| Display / Hero | UberMove | 52px (3.25rem) | 700 | 1.23 (tight) | Maximum impact, billboard presence |
| Section Heading | UberMove | 36px (2.25rem) | 700 | 1.22 (tight) | Major section anchors |
| Card Title | UberMove | 32px (2rem) | 700 | 1.25 (tight) | Card and feature headings |
| Sub-heading | UberMove | 24px (1.5rem) | 700 | 1.33 | Secondary section headers |
| Small Heading | UberMove | 20px (1.25rem) | 700 | 1.40 | Compact headings, list titles |
| Nav / UI Large | UberMoveText | 18px (1.13rem) | 500 | 1.33 | Navigation links, prominent UI text |
| Body / Button | UberMoveText | 16px (1rem) | 400-500 | 1.25-1.50 | Standard body text, button labels |
| Caption | UberMoveText | 14px (0.88rem) | 400-500 | 1.14-1.43 | Metadata, descriptions, small links |
| Micro | UberMoveText | 12px (0.75rem) | 400 | 1.67 (relaxed) | Fine print, legal text |

### Principles
- **Bold headlines, medium body**: UberMove headings are exclusively weight 700 (bold) -- every headline hits with billboard force. UberMoveText body and UI text uses 400-500, creating a clear visual hierarchy through weight contrast.
- **Tight heading line-heights**: All headlines use line-heights between 1.22-1.40 -- compact and punchy, designed for scanning rather than reading.
- **Functional typography**: There is no decorative type treatment anywhere. No letter-spacing, no text-transform, no ornamental sizing. Every text element serves a direct communication purpose.
- **Two fonts, strict roles**: UberMove is exclusively for headings. UberMoveText is exclusively for body, buttons, links, and UI. The boundary is never crossed.

## 4. Component Stylings

### Buttons

**Primary Black (CTA)**
- Background: Uber Black (`#000000`)
- Text: Pure White (`#ffffff`)
- Padding: 10px 12px
- Radius: 999px (full pill)
- Outline: none
- Focus: inset ring `rgb(255,255,255) 0px 0px 0px 2px`
- The primary action button -- bold, high-contrast, unmissable

**Secondary White**
- Background: Pure White (`#ffffff`)
- Text: Uber Black (`#000000`)
- Padding: 10px 12px
- Radius: 999px (full pill)
- Hover: background shifts to Hover Gray (`#e2e2e2`)
- Focus: background shifts to Hover Gray, inset ring appears
- Used on dark surfaces or as a secondary action alongside Primary Black

**Chip / Filter**
- Background: Chip Gray (`#efefef`)
- Text: Uber Black (`#000000`)
- Padding: 14px 16px
- Radius: 999px (full pill)
- Active: inset shadow `rgba(0,0,0,0.08)`
- Navigation chips, category selectors, filter toggles

**Floating Action**
- Background: Pure White (`#ffffff`)
- Text: Uber Black (`#000000`)
- Padding: 14px
- Radius: 999px (full pill)
- Shadow: `rgba(0,0,0,0.16) 0px 2px 8px 0px`
- Transform: `translateY(2px)` slight offset
- Hover: background shifts to `#f3f3f3`
- Map controls, scroll-to-top, floating CTAs

### Cards & Containers
- Background: Pure White (`#ffffff`) on white pages; no distinct card background differentiation
- Border: none by default -- cards are defined by shadow, not stroke
- Radius: 8px for standard content cards; 12px for featured/promoted cards
- Shadow: `rgba(0,0,0,0.12) 0px 4px 16px 0px` for standard lift
- Cards are content-dense with minimal internal padding
- Image-led cards use full-bleed imagery with text overlay or below

### Inputs & Forms
- Text: Uber Black (`#000000`)
- Background: Pure White (`#ffffff`)
- Border: 1px solid Black (`#000000`) -- the only place visible borders appear prominently
- Radius: 8px
- Padding: standard comfortable spacing
- Focus: no extracted custom focus state -- relies on standard browser focus ring

### Navigation
- Sticky top navigation with white background
- Logo: Uber wordmark/icon at 24x24px in black
- Links: UberMoveText at 14-18px, weight 500, in Uber Black
- Pill-shaped nav chips with Chip Gray (`#efefef`) background for category navigation ("Ride", "Drive", "Business", "Uber Eats")
- Menu toggle: circular button with 50% border-radius
- Mobile: hamburger menu pattern

### Image Treatment
- Warm, hand-illustrated scenes (not photographs for feature sections)
- Illustration style: slightly stylized people, warm color palette within illustrations, contemporary vibe
- Hero sections use bold photography or illustration as full-width backgrounds
- QR codes for app download CTAs
- All imagery uses standard 8px or 12px border-radius when contained in cards

### Distinctive Components

**Category Pill Navigation**
- Horizontal row of pill-shaped buttons for top-level navigation ("Ride", "Drive", "Business", "Uber Eats", "About")
- Each pill: Chip Gray background, black text, 999px radius
- Active state indicated by black background with white text (inversion)

**Hero with Dual Action**
- Split hero: text/CTA on left, map/illustration on right
- Two input fields side by side for pickup/destination
- "See prices" CTA button in black pill

**Plan-Ahead Cards**
- Cards promoting features like "Uber Reserve" and trip planning
- Illustration-heavy with warm, human-centric imagery
- Black CTA buttons with white text at bottom

## 5. Layout Principles

### Spacing System
- Base unit: 8px
- Scale: 4px, 6px, 8px, 10px, 12px, 14px, 16px, 18px, 20px, 24px, 32px
- Button padding: 10px 12px (compact) or 14px 16px (comfortable)
- Card internal padding: approximately 24-32px
- Section vertical spacing: generous but efficient -- approximately 64-96px between major sections

### Grid & Container
- Max container width: approximately 1136px, centered
- Hero: split layout with text left, visual right
- Feature sections: 2-column card grids or full-width single-column
- Footer: multi-column link grid on black background
- Full-width sections extending to viewport edges

### Whitespace Philosophy
- **Efficient, not airy**: Uber's whitespace is functional -- enough to separate, never enough to feel empty. This is transit-system spacing: compact, clear, purpose-driven.
- **Content-dense cards**: Cards pack information tightly with minimal internal spacing, relying on shadow and radius to define boundaries.
- **Section breathing room**: Major sections get generous vertical spacing, but within sections, elements are closely grouped.

### Border Radius Scale
- Sharp (0px): No square corners used in interactive elements
- Standard (8px): Content cards, input fields, listboxes
- Comfortable (12px): Featured cards, larger containers, link cards
- Full Pill (999px): All buttons, chips, navigation items, pills
- Circle (50%): Avatar images, icon containers, circular controls

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (Level 0) | No shadow, solid background | Page background, inline content, text sections |
| Subtle (Level 1) | `rgba(0,0,0,0.12) 0px 4px 16px` | Standard content cards, feature blocks |
| Medium (Level 2) | `rgba(0,0,0,0.16) 0px 4px 16px` | Elevated cards, overlay elements |
| Floating (Level 3) | `rgba(0,0,0,0.16) 0px 2px 8px` + translateY(2px) | Floating action buttons, map controls |
| Pressed (Level 4) | `rgba(0,0,0,0.08) inset` (999px spread) | Active/pressed button states |
| Focus Ring | `rgb(255,255,255) 0px 0px 0px 2px inset` | Keyboard focus indicators |

**Shadow Philosophy**: Uber uses shadow purely as a structural tool, never decoratively. Shadows are always black at very low opacity (0.08-0.16), creating the bare minimum lift needed to separate content layers. The blur radii are moderate (8-16px) -- enough to feel natural but never dramatic. There are no colored shadows, no layered shadow stacks, and no ambient glow effects. Depth is communicated more through the black/white section contrast than through shadow elevation.

## 7. Do's and Don'ts

### Do
- Use true black (`#000000`) and pure white (`#ffffff`) as the primary palette -- the stark contrast IS Uber
- Use 999px border-radius for all buttons, chips, and pill-shaped navigation elements
- Keep all headings in UberMove Bold (700) for billboard-level impact
- Use whisper-soft shadows (0.12-0.16 opacity) for card elevation -- barely visible
- Maintain the compact, information-dense layout style -- Uber prioritizes efficiency over airiness
- Use warm, human-centric illustrations to soften the monochrome interface
- Apply 8px radius for content cards and 12px for featured containers
- Use UberMoveText at weight 500 for navigation and prominent UI text
- Pair black primary buttons with white secondary buttons for dual-action layouts

### Don't
- Don't introduce color into the UI chrome -- Uber's interface is strictly black, white, and gray
- Don't use rounded corners less than 999px on buttons -- the full-pill shape is a core identity element
- Don't apply heavy shadows or drop shadows with high opacity -- depth is whisper-subtle
- Don't use serif fonts anywhere -- Uber's typography is exclusively geometric sans-serif
- Don't create airy, spacious layouts with excessive whitespace -- Uber's density is intentional
- Don't use gradients or color overlays -- every surface is a flat, solid color
- Don't mix UberMove into body text or UberMoveText into headlines -- the hierarchy is strict
- Don't use decorative borders -- borders are functional (inputs, dividers) or absent entirely
- Don't soften the black/white contrast with off-whites or near-blacks -- the duality is deliberate

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile Small | 320px | Minimum layout, single column, stacked inputs, compact typography |
| Mobile | 600px | Standard mobile, stacked layout, hamburger nav |
| Tablet Small | 768px | Two-column grids begin, expanded card layouts |
| Tablet | 1119px | Full tablet layout, side-by-side hero content |
| Desktop Small | 1120px | Desktop grid activates, horizontal nav pills |
| Desktop | 1136px | Full desktop layout, maximum container width, split hero |

### Touch Targets
- All pill buttons: minimum 44px height (10-14px vertical padding + line-height)
- Navigation chips: generous 14px 16px padding for comfortable thumb tapping
- Circular controls (menu, close): 50% radius ensures large, easy-to-hit targets
- Card surfaces serve as full-area touch targets on mobile

### Collapsing Strategy
- **Navigation**: Horizontal pill nav collapses to hamburger menu with circular toggle
- **Hero**: Split layout (text + map/visual) stacks to single column -- text above, visual below
- **Input fields**: Side-by-side pickup/destination inputs stack vertically
- **Feature cards**: 2-column grid collapses to full-width stacked cards
- **Headings**: 52px display scales down through 36px, 32px, 24px, 20px
- **Footer**: Multi-column link grid collapses to accordion or stacked single column
- **Category pills**: Horizontal scroll with overflow on smaller screens

### Image Behavior
- Illustrations scale proportionally within their containers
- Hero imagery maintains aspect ratio, may crop on smaller screens
- QR code sections hide on mobile (app download shifts to direct store links)
- Card imagery maintains 8-12px border radius at all sizes

## 9. Agent Prompt Guide

### Quick Color Reference
- Primary Button: "Uber Black (#000000)"
- Page Background: "Pure White (#ffffff)"
- Button Text (on black): "Pure White (#ffffff)"
- Button Text (on white): "Uber Black (#000000)"
- Secondary Text: "Body Gray (#4b4b4b)"
- Tertiary Text: "Muted Gray (#afafaf)"
- Chip Background: "Chip Gray (#efefef)"
- Hover State: "Hover Gray (#e2e2e2)"
- Card Shadow: "rgba(0,0,0,0.12) 0px 4px 16px"
- Footer Background: "Uber Black (#000000)"

### Example Component Prompts
- "Create a hero section on Pure White (#ffffff) with a headline at 52px UberMove Bold (700), line-height 1.23. Use Uber Black (#000000) text. Add a subtitle in Body Gray (#4b4b4b) at 16px UberMoveText weight 400 with 1.50 line-height. Place an Uber Black (#000000) pill CTA button with Pure White text, 999px radius, padding 10px 12px."
- "Design a category navigation bar with horizontal pill buttons. Each pill: Chip Gray (#efefef) background, Uber Black (#000000) text, 14px 16px padding, 999px border-radius. Active pill inverts to Uber Black background with Pure White text. Use UberMoveText at 14px weight 500."
- "Build a feature card on Pure White (#ffffff) with 8px border-radius and shadow rgba(0,0,0,0.12) 0px 4px 16px. Title in UberMove at 24px weight 700, description in Body Gray (#4b4b4b) at 16px UberMoveText. Add a black pill CTA button at the bottom."
- "Create a dark footer on Uber Black (#000000) with Pure White (#ffffff) heading text in UberMove at 20px weight 700. Footer links in Muted Gray (#afafaf) at 14px UberMoveText. Links hover to Pure White. Multi-column grid layout."
- "Design a floating action button with Pure White (#ffffff) background, 999px radius, 14px padding, and shadow rgba(0,0,0,0.16) 0px 2px 8px. Hover shifts background to #f3f3f3. Use for scroll-to-top or map controls."

### Iteration Guide
1. Focus on ONE component at a time
2. Reference the strict black/white palette -- "use Uber Black (#000000)" not "make it dark"
3. Always specify 999px radius for buttons and pills -- this is non-negotiable for the Uber identity
4. Describe the font family explicitly -- "UberMove Bold for the heading, UberMoveText Medium for the label"
5. For shadows, use "whisper shadow (rgba(0,0,0,0.12) 0px 4px 16px)" -- never heavy drop shadows
6. Keep layouts compact and information-dense -- Uber is efficient, not airy
7. Illustrations should be warm and human -- describe "stylized people in warm tones" not abstract shapes
8. Pair black CTAs with white secondaries for balanced dual-action layouts
