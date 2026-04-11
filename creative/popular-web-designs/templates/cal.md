# Design System: Cal.com


> **Hermes Agent — Implementation Notes**
>
> The original site uses proprietary fonts. For self-contained HTML output, use these CDN substitutes:
> - **Primary:** `Inter` | **Mono:** `Roboto Mono`
> - **Font stack (CSS):** `font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;`
> - **Mono stack (CSS):** `font-family: 'Roboto Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;`
> ```html
> <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Roboto+Mono:wght@400;500;700&display=swap" rel="stylesheet">
> ```
> Use `write_file` to create HTML, serve via `generative-widgets` skill (cloudflared tunnel).
> Verify visual accuracy with `browser_vision` after generating.

## 1. Visual Theme & Atmosphere

Cal.com's website is a masterclass in monochromatic restraint — a grayscale world where boldness comes not from color but from the sheer confidence of black text on white space. Inspired by Uber's minimal aesthetic, the palette is deliberately stripped of hue: near-black headings (`#242424`), mid-gray secondary text (`#898989`), and pure white surfaces. Color is treated as a foreign substance — when it appears (a rare blue link, a green trust badge), it feels like a controlled accent in an otherwise black-and-white photograph.

Cal Sans, the brand's custom geometric display typeface designed by Mark Davis, is the visual centerpiece. Letters are intentionally spaced extremely close at large sizes, creating dense, architectural headlines that feel like they're carved into the page. At 64px and 48px, Cal Sans headings sit at weight 600 with a tight 1.10 line-height — confident, compressed, and immediately recognizable. For body text, the system switches to Inter, providing "rock-solid" readability that complements Cal Sans's display personality. The typography pairing creates a clear division: Cal Sans speaks, Inter explains.

The elevation system is notably sophisticated for a minimal site — 11 shadow definitions create a nuanced depth hierarchy using multi-layered shadows that combine ring borders (`0px 0px 0px 1px`), soft diffused shadows, and inset highlights. This shadow-first approach to depth (rather than border-first) gives surfaces a subtle three-dimensionality that feels modern and polished. Built on Framer with a border-radius scale from 2px to 9999px (pill), Cal.com balances geometric precision with soft, rounded interactive elements.

**Key Characteristics:**
- Purely grayscale brand palette — no brand colors, boldness through monochrome
- Cal Sans custom geometric display font with extremely tight default letter-spacing
- Multi-layered shadow system (11 definitions) with ring borders + diffused shadows + inset highlights
- Cal Sans for headings, Inter for body — clean typographic division
- Wide border-radius scale from 2px to 9999px (pill) — versatile rounding
- White canvas with near-black (#242424) text — maximum contrast, zero decoration
- Product screenshots as primary visual content — the scheduling UI sells itself
- Built on Framer platform

## 2. Color Palette & Roles

### Primary
- **Charcoal** (`#242424`): Primary heading and button text — Cal.com's signature near-black, warmer than pure black
- **Midnight** (`#111111`): Deepest text/overlay color — used at 50% opacity for subtle overlays
- **White** (`#ffffff`): Primary background and surface — the dominant canvas

### Secondary & Accent
- **Link Blue** (`#0099ff`): In-text links with underline decoration — the only blue in the system, reserved strictly for hyperlinks
- **Focus Ring** (`#3b82f6` at 50% opacity): Keyboard focus indicator — accessibility-only, invisible in normal interaction
- **Default Link** (`#0000ee`): Browser-default link color on some elements — unmodified, signaling openness

### Surface & Background
- **Pure White** (`#ffffff`): Primary page background and card surfaces
- **Light Gray** (approx `#f5f5f5`): Subtle section differentiation — barely visible tint
- **Mid Gray** (`#898989`): Secondary text, descriptions, and muted labels

### Neutrals & Text
- **Charcoal** (`#242424`): Headlines, buttons, primary UI text
- **Midnight** (`#111111`): Deep black for high-contrast links and nav text
- **Mid Gray** (`#898989`): Descriptions, secondary labels, muted content
- **Pure Black** (`#000000`): Certain link text elements
- **Border Gray** (approx `rgba(34, 42, 53, 0.08–0.10)`): Shadow-based borders using ring shadows instead of CSS borders

### Semantic & Accent
- Cal.com is deliberately colorless for brand elements — "a grayscale brand to emphasise on boldness and professionalism"
- Product UI screenshots show color (blues, greens in the scheduling interface), but the marketing site itself stays monochrome
- The philosophy mirrors Uber's approach: let the content carry color, the frame stays neutral

### Gradient System
- No gradients on the marketing site — the design is fully flat and monochrome
- Depth is achieved entirely through shadows, not color transitions

## 3. Typography Rules

### Font Family
- **Display**: `Cal Sans` — custom geometric sans-serif by Mark Davis. Open-source, available on Google Fonts and GitHub. Extremely tight default letter-spacing designed for large headlines. Has 6 character variants (Cc, j, t, u, 0, 1)
- **Body**: `Inter` — "rock-solid" standard body font. Fallback: `Inter Placeholder`
- **UI Light**: `Cal Sans UI Variable Light` — light-weight variant (300) for softer UI text with -0.2px letter-spacing
- **UI Medium**: `Cal Sans UI Medium` — medium-weight variant (500) for emphasized captions
- **Mono**: `Roboto Mono` — for code blocks and technical content
- **Tertiary**: `Matter Regular` / `Matter SemiBold` / `Matter Medium` — additional body fonts for specific contexts

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Display Hero | Cal Sans | 64px | 600 | 1.10 | 0px | Maximum impact, tight default spacing |
| Section Heading | Cal Sans | 48px | 600 | 1.10 | 0px | Large section titles |
| Feature Heading | Cal Sans | 24px | 600 | 1.30 | 0px | Feature block headlines |
| Sub-heading | Cal Sans | 20px | 600 | 1.20 | +0.2px | Positive spacing for readability at smaller size |
| Sub-heading Alt | Cal Sans | 20px | 600 | 1.50 | 0px | Relaxed line-height variant |
| Card Title | Cal Sans | 16px | 600 | 1.10 | 0px | Smallest Cal Sans usage |
| Caption Label | Cal Sans | 12px | 600 | 1.50 | 0px | Small labels in Cal Sans |
| Body Light | Cal Sans UI Light | 18px | 300 | 1.30 | -0.2px | Light-weight body intro text |
| Body Light Standard | Cal Sans UI Light | 16px | 300 | 1.50 | -0.2px | Light-weight body text |
| Caption Light | Cal Sans UI Light | 14px | 300 | 1.40–1.50 | -0.2 to -0.28px | Light captions and descriptions |
| UI Label | Inter | 16px | 600 | 1.00 | 0px | UI buttons and nav labels |
| Caption Inter | Inter | 14px | 500 | 1.14 | 0px | Small UI text |
| Micro | Inter | 12px | 500 | 1.00 | 0px | Smallest Inter text |
| Code | Roboto Mono | 14px | 600 | 1.00 | 0px | Code snippets, technical text |
| Body Matter | Matter Regular | 14px | 400 | 1.14 | 0px | Alternate body text (product UI) |

### Principles
- **Cal Sans at large, Inter at small**: Cal Sans is exclusively for headings and display — never for body text. The system enforces this division strictly
- **Tight by default, space when small**: Cal Sans letters are "intentionally spaced to be extremely close" at large sizes. At 20px and below, positive letter-spacing (+0.2px) must be applied to prevent cramming
- **Weight 300 body variant**: Cal Sans UI Variable Light at 300 weight creates an elegant, airy body text that contrasts with the dense 600-weight headlines
- **Weight 600 dominance**: Nearly all Cal Sans usage is at weight 600 (semi-bold) — the font was designed to perform at this weight
- **Negative tracking on light text**: Cal Sans UI Light uses -0.2px to -0.28px letter-spacing, subtly tightening the already-compact letterforms

## 4. Component Stylings

### Buttons
- **Dark Primary**: `#242424` (or `#1e1f23`) background, white text, 6–8px radius. Hover: opacity reduction to 0.7. The signature CTA — maximally dark on white
- **White/Ghost**: White background with shadow-ring border, dark text. Uses the multi-layered shadow system for subtle elevation
- **Pill**: 9999px radius for rounded pill-shaped actions and badges
- **Compact**: 4px padding, small text — utility actions within product UI
- **Inset highlight**: Some buttons feature `rgba(255, 255, 255, 0.15) 0px 2px 0px inset` — a subtle inner-top highlight creating a 3D pressed effect

### Cards & Containers
- **Shadow Card**: White background, multi-layered shadow — `rgba(19, 19, 22, 0.7) 0px 1px 5px -4px, rgba(34, 42, 53, 0.08) 0px 0px 0px 1px, rgba(34, 42, 53, 0.05) 0px 4px 8px 0px`. The ring shadow (0px 0px 0px 1px) acts as a shadow-border
- **Product UI Cards**: Screenshots of the scheduling interface displayed in card containers with shadow elevation
- **Radius**: 8px for standard cards, 12px for larger containers, 16px for prominent sections
- **Hover**: Likely subtle shadow deepening or scale transform

### Inputs & Forms
- **Select dropdown**: White background, `#000000` text, 1px solid `rgb(118, 118, 118)` border
- **Focus**: Uses Framer's focus outline system (`--framer-focus-outline`)
- **Text input**: 8px radius, standard border treatment
- **Minimal form presence**: The marketing site prioritizes CTA buttons over complex forms

### Navigation
- **Top nav**: White/transparent background, Cal Sans links at near-black
- **Nav text**: `#111111` (Midnight) for primary links, `#000000` for emphasis
- **CTA button**: Dark Primary in the nav — high contrast call-to-action
- **Mobile**: Collapses to hamburger with simplified navigation
- **Sticky**: Fixed on scroll

### Image Treatment
- **Product screenshots**: Large scheduling UI screenshots — the product is the primary visual
- **Trust logos**: Grayscale company logos in a horizontal trust bar
- **Aspect ratios**: Wide landscape for product UI screenshots
- **No decorative imagery**: No illustrations, photos, or abstract graphics — pure product + typography

## 5. Layout Principles

### Spacing System
- **Base unit**: 8px
- **Scale**: 1px, 2px, 3px, 4px, 6px, 8px, 12px, 16px, 20px, 24px, 28px, 80px, 96px
- **Section padding**: 80px–96px vertical between major sections (generous)
- **Card padding**: 12px–24px internal
- **Component gaps**: 4px–8px between related elements
- **Notable jump**: From 28px to 80px — a deliberate gap emphasizing the section-level spacing tier

### Grid & Container
- **Max width**: ~1200px content container, centered
- **Column patterns**: Full-width hero, centered text blocks, 2-3 column feature grids
- **Feature showcase**: Product screenshots flanked by description text
- **Breakpoints**: 98px, 640px, 768px, 810px, 1024px, 1199px — Framer-generated

### Whitespace Philosophy
- **Lavish section spacing**: 80px–96px between sections creates a breathable, premium feel
- **Product-first content**: Screenshots dominate the visual space — minimal surrounding decoration
- **Centered headlines**: Cal Sans headings centered with generous margins above and below

### Border Radius Scale
- **2px**: Subtle rounding on inline elements
- **4px**: Small UI components
- **6px–7px**: Buttons, small cards, images
- **8px**: Standard interactive elements — buttons, inputs, images
- **12px**: Medium containers — links, larger cards, images
- **16px**: Large section containers
- **29px**: Special rounded elements
- **100px**: Large rounding — nearly circular on small elements
- **1000px**: Very large rounding
- **9999px**: Full pill shape — badges, links

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Level 0 (Flat) | No shadow | Page canvas, basic text containers |
| Level 1 (Inset) | `rgba(0,0,0,0.16) 0px 1px 1.9px 0px inset` | Pressed/recessed elements, input wells |
| Level 2 (Ring + Soft) | `rgba(19,19,22,0.7) 0px 1px 5px -4px, rgba(34,42,53,0.08) 0px 0px 0px 1px, rgba(34,42,53,0.05) 0px 4px 8px` | Cards, containers — the workhorse shadow |
| Level 3 (Ring + Soft Alt) | `rgba(36,36,36,0.7) 0px 1px 5px -4px, rgba(36,36,36,0.05) 0px 4px 8px` | Alt card elevation without ring border |
| Level 4 (Inset Highlight) | `rgba(255,255,255,0.15) 0px 2px 0px inset` or `rgb(255,255,255) 0px 2px 0px inset` | Button inner highlight — 3D pressed effect |
| Level 5 (Soft Only) | `rgba(34,42,53,0.05) 0px 4px 8px` | Subtle ambient shadow |

### Shadow Philosophy
Cal.com's shadow system is the most sophisticated element of the design — 11 shadow definitions using a multi-layered compositing technique:
- **Ring borders**: `0px 0px 0px 1px` shadows act as borders, avoiding CSS `border` entirely. This creates hairline containment without affecting layout
- **Diffused soft shadows**: `0px 4px 8px` at 5% opacity add gentle ambient depth
- **Sharp contact shadows**: `0px 1px 5px -4px` at 70% opacity create tight bottom-edge shadows for grounding
- **Inset highlights**: White inset shadows at the top of buttons create a subtle 3D bevel
- Shadows are composed in comma-separated stacks — each surface gets 2-3 layered shadow definitions working together

### Decorative Depth
- No gradients or glow effects
- All depth comes from the sophisticated shadow compositing system
- The overall effect is subtle but precise — surfaces feel like physical cards sitting on a table

## 7. Do's and Don'ts

### Do
- Use Cal Sans exclusively for headings (24px+) and never for body text — it's a display font with tight default spacing
- Apply positive letter-spacing (+0.2px) when using Cal Sans below 24px — the font cramps at small sizes without it
- Maintain the grayscale palette — boldness comes from contrast, not color
- Use the multi-layered shadow system for card elevation — ring shadow + diffused shadow + contact shadow
- Keep backgrounds pure white — the monochrome philosophy requires a clean canvas
- Use Inter for all body text at weight 300–600 — it's the reliable counterpart to Cal Sans's display personality
- Let product screenshots be the visual content — no illustrations, no decorative graphics
- Apply generous section spacing (80px–96px) — the breathing room is essential to the premium feel

### Don't
- Use Cal Sans for body text or text below 16px — it wasn't designed for extended reading
- Add brand colors — Cal.com is intentionally grayscale, color is reserved for links and UI states only
- Use CSS borders when shadows can achieve the same containment — the ring-shadow technique is the system's approach
- Apply negative letter-spacing to Cal Sans at small sizes — it needs positive spacing (+0.2px) below 24px
- Create heavy, dark shadows — Cal.com's shadows are subtle (5% opacity diffused) with sharp contact edges
- Use illustrations, abstract graphics, or decorative elements — the visual language is typography + product UI only
- Mix Cal Sans weights — the font is designed for weight 600, other weights break the intended character
- Reduce section spacing below 48px — the generous whitespace is core to the premium monochrome aesthetic

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile | <640px | Single column, hero text ~36px, stacked features, hamburger nav |
| Tablet Small | 640px–768px | 2-column begins for some elements |
| Tablet | 768px–810px | Layout adjustments, fuller grid |
| Tablet Large | 810px–1024px | Multi-column feature grids |
| Desktop | 1024px–1199px | Full layout, expanded navigation |
| Large Desktop | >1199px | Max-width container, centered content |

### Touch Targets
- Buttons: 8px radius with comfortable padding (10px+ vertical)
- Nav links: Dark text with adequate spacing
- Mobile CTAs: Full-width dark buttons for easy thumb access
- Pill badges: 9999px radius creates large, tappable targets

### Collapsing Strategy
- **Navigation**: Full horizontal nav → hamburger on mobile
- **Hero**: 64px Cal Sans display → ~36px on mobile
- **Feature grids**: Multi-column → 2-column → single stacked column
- **Product screenshots**: Scale within containers, maintaining aspect ratios
- **Section spacing**: Reduces from 80px–96px to ~48px on mobile

### Image Behavior
- Product screenshots scale responsively
- Trust logos reflow to multi-row grid on mobile
- No art direction changes — same compositions at all sizes
- Images use 7px–12px border-radius for consistent rounded corners

## 9. Agent Prompt Guide

### Quick Color Reference
- Primary Text: Charcoal (`#242424`)
- Deep Text: Midnight (`#111111`)
- Secondary Text: Mid Gray (`#898989`)
- Background: Pure White (`#ffffff`)
- Link: Link Blue (`#0099ff`)
- CTA Button: Charcoal (`#242424`) bg, white text
- Shadow Border: `rgba(34, 42, 53, 0.08)` ring

### Example Component Prompts
- "Create a hero section with white background, 64px Cal Sans heading at weight 600, line-height 1.10, #242424 text, centered layout with a dark CTA button (#242424, 8px radius, white text)"
- "Design a scheduling card with white background, multi-layered shadow (0px 1px 5px -4px rgba(19,19,22,0.7), 0px 0px 0px 1px rgba(34,42,53,0.08), 0px 4px 8px rgba(34,42,53,0.05)), 12px radius"
- "Build a navigation bar with white background, Inter links at 14px weight 500 in #111111, a dark CTA button (#242424), sticky positioning"
- "Create a trust bar with grayscale company logos, horizontally centered, 16px gap between logos, on white background"
- "Design a feature section with 48px Cal Sans heading (weight 600, #242424), 16px Inter body text (weight 300, #898989, line-height 1.50), and a product screenshot with 12px radius and the card shadow"

### Iteration Guide
When refining existing screens generated with this design system:
1. Verify headings use Cal Sans at weight 600, body uses Inter — never mix them
2. Check that the palette is purely grayscale — if you see brand colors, remove them
3. Ensure card elevation uses the multi-layered shadow stack, not CSS borders
4. Confirm section spacing is generous (80px+) — if sections feel cramped, add more space
5. The overall tone should feel like a clean, professional scheduling tool — monochrome confidence without any decorative flourishes
