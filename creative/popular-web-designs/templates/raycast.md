# Design System: Raycast


> **Hermes Agent — Implementation Notes**
>
> The original site uses proprietary fonts. For self-contained HTML output, use these CDN substitutes:
> - **Primary:** `Inter` | **Mono:** `Geist Mono`
> - **Font stack (CSS):** `font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;`
> - **Mono stack (CSS):** `font-family: 'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;`
> ```html
> <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
> ```
> Use `write_file` to create HTML, serve via `generative-widgets` skill (cloudflared tunnel).
> Verify visual accuracy with `browser_vision` after generating.

## 1. Visual Theme & Atmosphere

Raycast's marketing site feels like the dark interior of a precision instrument — a Swiss watch case carved from obsidian. The background isn't just dark, it's an almost-black blue-tint (`#07080a`) that creates a sense of being inside a macOS native application rather than a website. Every surface, every border, every shadow is calibrated to evoke the feeling of a high-performance desktop utility: fast, minimal, trustworthy.

The signature move is the layered shadow system borrowed from macOS window chrome: multi-layer box-shadows with inset highlights that simulate physical depth, as if cards and buttons are actual pressed or raised glass elements on a dark desk. Combined with Raycast Red (`#FF6363`) — deployed almost exclusively in the hero's iconic diagonal stripe pattern — the palette creates a brand that reads as "powerful tool with personality." The red doesn't dominate; it punctuates.

Inter is used everywhere — headings, body, buttons, captions — with extensive OpenType features (`calt`, `kern`, `liga`, `ss03`) creating a consistent, readable typographic voice. The positive letter-spacing (0.2px–0.4px on body text) is unusual for a dark UI and gives the text an airy, breathable quality that counterbalances the dense, dark surfaces. GeistMono appears for code elements, reinforcing the developer-tool identity.

**Key Characteristics:**
- Near-black blue-tinted background (`#07080a`) — not pure black, subtly blue-shifted
- macOS-native shadow system with multi-layer inset highlights simulating physical depth
- Raycast Red (`#FF6363`) as a punctuation color — hero stripes, not pervasive
- Inter with positive letter-spacing (0.2px) for an airy, readable dark-mode experience
- Radix UI component primitives powering the interaction layer
- Subtle rgba white borders (0.06–0.1 opacity) for containment on dark surfaces
- Keyboard shortcut styling with gradient key caps and heavy shadows

## 2. Color Palette & Roles

### Primary
- **Near-Black Blue** (`#07080a`): Primary page background — the foundational void with a subtle blue-cold undertone
- **Pure White** (`#ffffff`): Primary heading text, high-emphasis elements
- **Raycast Red** (`#FF6363` / `hsl(0, 100%, 69%)`): Brand accent — hero stripes, danger states, critical highlights

### Secondary & Accent
- **Raycast Blue** (`hsl(202, 100%, 67%)` / ~`#55b3ff`): Interactive accent — links, focus states, selected items
- **Raycast Green** (`hsl(151, 59%, 59%)` / ~`#5fc992`): Success states, positive indicators
- **Raycast Yellow** (`hsl(43, 100%, 60%)` / ~`#ffbc33`): Warning accents, highlights
- **Blue Transparent** (`hsla(202, 100%, 67%, 0.15)`): Blue tint overlay for interactive surfaces
- **Red Transparent** (`hsla(0, 100%, 69%, 0.15)`): Red tint overlay for danger/error surfaces

### Surface & Background
- **Deep Background** (`#07080a`): Page canvas, the darkest surface
- **Surface 100** (`#101111`): Elevated surface, card backgrounds
- **Key Start** (`#121212`): Keyboard key gradient start
- **Key End** (`#0d0d0d`): Keyboard key gradient end
- **Card Surface** (`#1b1c1e`): Badge backgrounds, tag fills, elevated containers
- **Button Foreground** (`#18191a`): Dark surface for button text on light backgrounds

### Neutrals & Text
- **Near White** (`#f9f9f9` / `hsl(240, 11%, 96%)`): Primary body text, high-emphasis content
- **Light Gray** (`#cecece` / `#cdcdce`): Secondary body text, descriptions
- **Silver** (`#c0c0c0`): Tertiary text, subdued labels
- **Medium Gray** (`#9c9c9d`): Link default color, secondary navigation
- **Dim Gray** (`#6a6b6c`): Disabled text, low-emphasis labels
- **Dark Gray** (`#434345`): Muted borders, inactive navigation links
- **Border** (`hsl(195, 5%, 15%)` / ~`#252829`): Standard border color for cards and dividers
- **Dark Border** (`#2f3031`): Separator lines, table borders

### Semantic & Accent
- **Error Red** (`hsl(0, 100%, 69%)`): Error states, destructive actions
- **Success Green** (`hsl(151, 59%, 59%)`): Success confirmations, positive states
- **Warning Yellow** (`hsl(43, 100%, 60%)`): Warnings, attention-needed states
- **Info Blue** (`hsl(202, 100%, 67%)`): Informational highlights, links

### Gradient System
- **Keyboard Key Gradient**: Linear gradient from `#121212` (top) to `#0d0d0d` (bottom) — simulates physical key depth
- **Warm Glow**: `rgba(215, 201, 175, 0.05)` radial spread — subtle warm ambient glow behind featured elements

## 3. Typography Rules

### Font Family
- **Primary**: `Inter` — humanist sans-serif, used everywhere. Fallbacks: `Inter Fallback`, system sans-serif
- **System**: `SF Pro Text` — Apple system font for select macOS-native UI elements. Fallbacks: `SF Pro Icons`, `Inter`, `Inter Fallback`
- **Monospace**: `GeistMono` — Vercel's monospace font for code elements. Fallbacks: `ui-monospace`, `SFMono-Regular`, `Roboto Mono`, `Menlo`, `Monaco`
- **OpenType features**: `calt`, `kern`, `liga`, `ss03` enabled globally; `ss02`, `ss08` on display text; `liga` disabled (`"liga" 0`) on hero headings

### Hierarchy

| Role | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|--------|-------------|----------------|-------|
| Display Hero | 64px | 600 | 1.10 | 0px | OpenType: liga 0, ss02, ss08 |
| Section Display | 56px | 400 | 1.17 | 0.2px | OpenType: calt, kern, liga, ss03 |
| Section Heading | 24px | 500 | normal | 0.2px | OpenType: calt, kern, liga, ss03 |
| Card Heading | 22px | 400 | 1.15 | 0px | OpenType: calt, kern, liga, ss03 |
| Sub-heading | 20px | 500 | 1.60 | 0.2px | Relaxed line-height for readability |
| Body Large | 18px | 400 | 1.15 | 0.2px | OpenType: calt, kern, liga, ss03 |
| Body | 16px | 500 | 1.60 | 0.2px | Primary body text, relaxed rhythm |
| Body Tight | 16px | 400 | 1.15 | 0.1px | UI labels, compact contexts |
| Button | 16px | 600 | 1.15 | 0.3px | Semibold, slightly wider tracking |
| Nav Link | 16px | 500 | 1.40 | 0.3px | Links in navigation |
| Caption | 14px | 500 | 1.14 | 0.2px | Small labels, metadata |
| Caption Bold | 14px | 600 | 1.40 | 0px | Emphasized captions |
| Small | 12px | 600 | 1.33 | 0px | Badges, tags, micro-labels |
| Small Link | 12px | 400 | 1.50 | 0.4px | Footer links, fine print |
| Code | 14px (GeistMono) | 500 | 1.60 | 0.3px | Code blocks, technical content |
| Code Small | 12px (GeistMono) | 400 | 1.60 | 0.2px | Inline code, terminal output |

### Principles
- **Positive tracking on dark**: Unlike most dark UIs that use tight or neutral letter-spacing, Raycast applies +0.2px to +0.4px — creating an airy, readable feel that compensates for the dark background
- **Weight 500 as baseline**: Most body text uses medium weight (500), not regular (400) — subtle extra heft improves legibility on dark surfaces
- **Display restraint**: Hero text at 64px/600 is confident but not oversized — Raycast avoids typographic spectacle in favor of functional elegance
- **OpenType everywhere**: `ss03` (stylistic set 3) is enabled globally across Inter, giving the typeface a slightly more geometric, tool-like quality

## 4. Component Stylings

### Buttons
- **Primary Pill**: Transparent background, white text, pill shape (86px radius), multi-layer inset shadow (`rgba(255, 255, 255, 0.1) 0px 1px 0px 0px inset`). Hover: opacity 0.6
- **Secondary Button**: Transparent background, white text, 6px radius, `1px solid rgba(255, 255, 255, 0.1)` border, subtle drop shadow (`rgba(0, 0, 0, 0.03) 0px 7px 3px`). Hover: opacity 0.6
- **Ghost Button**: No background or border, gray text (`#6a6b6c`), 86px radius, same inset shadow. Hover: opacity 0.6, text brightens to white
- **CTA (Download)**: Semi-transparent white background (`hsla(0, 0%, 100%, 0.815)`), dark text (`#18191a`), pill shape. Hover: full white background (`hsl(0, 0%, 100%)`)
- **Transition**: All buttons use opacity transition for hover rather than background-color change — a signature Raycast interaction pattern

### Cards & Containers
- **Standard Card**: `#101111` surface, `1px solid rgba(255, 255, 255, 0.06)` border, 12px–16px border-radius
- **Elevated Card**: Ring shadow `rgb(27, 28, 30) 0px 0px 0px 1px` outer + `rgb(7, 8, 10) 0px 0px 0px 1px inset` inner — creates a double-ring containment
- **Feature Card**: 16px–20px border-radius, subtle warm glow (`rgba(215, 201, 175, 0.05) 0px 0px 20px 5px`) behind hero elements
- **Hover**: Cards brighten slightly via border opacity increase or subtle shadow enhancement

### Inputs & Forms
- Dark input fields with `#07080a` background, `1px solid rgba(255, 255, 255, 0.08)` border, 8px border-radius
- Focus state: Border brightens, blue glow (`hsla(202, 100%, 67%, 0.15)`) ring appears
- Text: `#f9f9f9` input color, `#6a6b6c` placeholder
- Labels: `#9c9c9d` at 14px weight 500

### Navigation
- **Top nav**: Dark background blending with page, white text links at 16px weight 500
- **Nav links**: Gray text (`#9c9c9d`) → white on hover, underline decoration on hover
- **CTA button**: Semi-transparent white pill at nav end
- **Mobile**: Collapses to hamburger, maintains dark theme
- **Sticky**: Nav fixed at top with subtle border separator

### Image Treatment
- **Product screenshots**: macOS window chrome style — rounded corners (12px), deep shadows simulating floating windows
- **Full-bleed sections**: Dark screenshots blend seamlessly into the dark background
- **Hero illustration**: Diagonal stripe pattern in Raycast Red — abstract, geometric, brand-defining
- **App UI embeds**: Showing actual Raycast command palette and extensions — product as content

### Keyboard Shortcut Keys
- **Key cap styling**: Gradient background (`#121212` → `#0d0d0d`), heavy multi-layer shadow (`rgba(0, 0, 0, 0.4) 0px 1.5px 0.5px 2.5px` + inset shadows), creating realistic physical key appearance
- Border-radius: 4px–6px for individual keys

### Badges & Tags
- **Neutral badge**: `#1b1c1e` background, white text, 6px radius, 14px font at weight 500, `0px 6px` padding
- Compact, pill-like treatment for categorization

## 5. Layout Principles

### Spacing System
- **Base unit**: 8px
- **Scale**: 1px, 2px, 3px, 4px, 8px, 10px, 12px, 16px, 20px, 24px, 32px, 40px
- **Section padding**: 80px–120px vertical between major sections
- **Card padding**: 16px–32px internal spacing
- **Component gaps**: 8px–16px between related elements

### Grid & Container
- **Max width**: ~1200px container (breakpoint at 1204px), centered
- **Column patterns**: Single-column hero, 2–3 column feature grids, full-width showcase sections
- **App showcase**: Product UI presented in centered window frames

### Whitespace Philosophy
- **Dramatic negative space**: Sections float in vast dark void, creating cinematic pacing between features
- **Dense product, sparse marketing**: The product UI screenshots are information-dense, but the surrounding marketing copy uses minimal text with generous spacing
- **Vertical rhythm**: Consistent 24px–32px gaps between elements within sections

### Border Radius Scale
- **2px–3px**: Micro-elements, code spans, tiny indicators
- **4px–5px**: Keyboard keys, small interactive elements
- **6px**: Buttons, badges, tags — the workhorse radius
- **8px**: Input fields, inline components
- **9px–11px**: Images, medium containers
- **12px**: Standard cards, product screenshots
- **16px**: Large cards, feature sections
- **20px**: Hero cards, prominent containers
- **86px+**: Pill buttons, nav CTAs — full pill shape

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Level 0 (Void) | No shadow, `#07080a` surface | Page background |
| Level 1 (Subtle) | `rgba(0, 0, 0, 0.28) 0px 1.189px 2.377px` | Minimal lift, inline elements |
| Level 2 (Ring) | `rgb(27, 28, 30) 0px 0px 0px 1px` outer + `rgb(7, 8, 10) 0px 0px 0px 1px inset` inner | Card containment, double-ring technique |
| Level 3 (Button) | `rgba(255, 255, 255, 0.05) 0px 1px 0px 0px inset` + `rgba(255, 255, 255, 0.25) 0px 0px 0px 1px` + `rgba(0, 0, 0, 0.2) 0px -1px 0px 0px inset` | macOS-native button press — white highlight top, dark inset bottom |
| Level 4 (Key) | 5-layer shadow stack with inset press effects | Keyboard shortcut key caps — physical 3D appearance |
| Level 5 (Floating) | `rgba(0, 0, 0, 0.5) 0px 0px 0px 2px` + `rgba(255, 255, 255, 0.19) 0px 0px 14px` + insets | Command palette, floating panels — heavy depth with glow |

### Shadow Philosophy
Raycast's shadow system is the most macOS-native on the web. Multi-layer shadows combine:
- **Outer rings** for containment (replacing traditional borders)
- **Inset top highlights** (`rgba(255, 255, 255, 0.05–0.25)`) simulating light source from above
- **Inset bottom darks** (`rgba(0, 0, 0, 0.2)`) simulating shadow underneath
- The effect is physical: elements feel like glass or brushed metal, not flat rectangles

### Decorative Depth
- **Warm glow**: `rgba(215, 201, 175, 0.05) 0px 0px 20px 5px` behind featured elements — a subtle warm aura on the cold dark canvas
- **Blue info glow**: `rgba(0, 153, 255, 0.15)` for interactive state emphasis
- **Red danger glow**: `rgba(255, 99, 99, 0.15)` for error/destructive state emphasis

## 7. Do's and Don'ts

### Do
- Use `#07080a` (not pure black) as the background — the blue-cold tint is essential to the Raycast feel
- Apply positive letter-spacing (+0.2px) on body text — this is deliberately different from most dark UIs
- Use multi-layer shadows with inset highlights for interactive elements — the macOS-native depth is signature
- Keep Raycast Red (`#FF6363`) as punctuation, not pervasive — reserve it for hero moments and error states
- Use `rgba(255, 255, 255, 0.06)` borders for card containment — barely visible, structurally essential
- Apply weight 500 as the body text baseline — medium weight improves dark-mode legibility
- Use pill shapes (86px+ radius) for primary CTAs, rectangular shapes (6px–8px) for secondary actions
- Enable OpenType features `calt`, `kern`, `liga`, `ss03` on all Inter text
- Use opacity transitions (hover: opacity 0.6) for button interactions, not color changes

### Don't
- Use pure black (`#000000`) as the background — the blue tint differentiates Raycast from generic dark themes
- Apply negative letter-spacing on body text — Raycast deliberately uses positive spacing for readability
- Use Raycast Blue as the primary accent for everything — blue is for interactive/info, red is the brand color
- Create single-layer flat shadows — the multi-layer inset system is core to the macOS-native aesthetic
- Use regular weight (400) for body text when 500 is available — the extra weight prevents dark-mode text from feeling thin
- Mix warm and cool borders — stick to the cool gray (`hsl(195, 5%, 15%)`) border palette
- Apply heavy drop shadows without inset companions — shadows always come in pairs (outer + inset)
- Use decorative elements, gradients, or colorful backgrounds — the dark void is the stage, content is the performer

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile | <600px | Single column, stacked cards, hamburger nav, hero text reduces to ~40px |
| Small Tablet | 600px–768px | 2-column grid begins, nav partially visible |
| Tablet | 768px–1024px | 2–3 column features, nav expanding, screenshots scale |
| Desktop | 1024px–1200px | Full layout, all nav links visible, 64px hero display |
| Large Desktop | >1200px | Max-width container centered, generous side margins |

### Touch Targets
- Pill buttons: 86px radius with 20px padding — well above 44px minimum
- Secondary buttons: 8px padding minimum, but border provides visual target expansion
- Nav links: 16px text with surrounding padding for accessible touch targets

### Collapsing Strategy
- **Navigation**: Full horizontal nav → hamburger at mobile with slide-out menu
- **Hero**: 64px display → 48px → 36px across breakpoints
- **Feature grids**: 3-column → 2-column → single-column stack
- **Product screenshots**: Scale within containers, maintaining macOS window chrome proportions
- **Keyboard shortcut displays**: Simplify or hide on mobile where keyboard shortcuts are irrelevant

### Image Behavior
- Product screenshots scale responsively within fixed-ratio containers
- Hero diagonal stripe pattern scales proportionally
- macOS window chrome rounded corners maintained at all sizes
- No lazy-loading artifacts — images are critical to the product narrative

## 9. Agent Prompt Guide

### Quick Color Reference
- Primary Background: Near-Black Blue (`#07080a`)
- Primary Text: Near White (`#f9f9f9`)
- Brand Accent: Raycast Red (`#FF6363`)
- Interactive Blue: Raycast Blue (`hsl(202, 100%, 67%)` / ~`#55b3ff`)
- Secondary Text: Medium Gray (`#9c9c9d`)
- Card Surface: Surface 100 (`#101111`)
- Border: Dark Border (`hsl(195, 5%, 15%)` / ~`#252829`)

### Example Component Prompts
- "Create a hero section on #07080a background with 64px Inter heading (weight 600, line-height 1.1), near-white text (#f9f9f9), and a semi-transparent white pill CTA button (hsla(0,0%,100%,0.815), 86px radius, dark text #18191a)"
- "Design a feature card with #101111 background, 1px solid rgba(255,255,255,0.06) border, 16px border-radius, double-ring shadow (rgb(27,28,30) 0px 0px 0px 1px outer), 22px Inter heading, and #9c9c9d body text"
- "Build a navigation bar on dark background (#07080a), Inter links at 16px weight 500 in #9c9c9d, hover to white, and a translucent white pill button at the right end"
- "Create a keyboard shortcut display with key caps using gradient background (#121212→#0d0d0d), 5-layer shadow for physical depth, 4px radius, Inter 12px weight 600 text"
- "Design an alert card with #101111 surface, Raycast Red (#FF6363) left border accent, translucent red glow (hsla(0,100%,69%,0.15)), white heading, and #cecece description text"

### Iteration Guide
When refining existing screens generated with this design system:
1. Check the background is `#07080a` not pure black — the blue tint is critical
2. Verify letter-spacing is positive (+0.2px) on body text — negative spacing breaks the Raycast aesthetic
3. Ensure shadows have both outer and inset layers — single-layer shadows look flat and wrong
4. Confirm Inter has OpenType features `calt`, `kern`, `liga`, `ss03` enabled
5. Test that hover states use opacity transitions (0.6) not color swaps — this is a core interaction pattern
