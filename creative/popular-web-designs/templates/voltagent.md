# Design System: VoltAgent


> **Hermes Agent — Implementation Notes**
>
> The original site uses proprietary fonts. For self-contained HTML output, use these CDN substitutes:
> - **Primary:** `system-ui` | **Mono:** `JetBrains Mono`
> - **Font stack (CSS):** `font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;`
> - **Mono stack (CSS):** `font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;`
> ```html
> <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
> ```
> Use `write_file` to create HTML, serve via `generative-widgets` skill (cloudflared tunnel).
> Verify visual accuracy with `browser_vision` after generating.

## 1. Visual Theme & Atmosphere

VoltAgent's interface is a deep-space command terminal for the AI age — a developer-facing darkness built on near-pure-black surfaces (`#050507`) where the only interruption is the electric pulse of emerald green energy. The entire experience evokes the feeling of staring into a high-powered IDE at 2am: dark, focused, and alive with purpose. This is not a friendly SaaS landing page — it's an engineering platform that announces itself through code snippets, architectural diagrams, and raw technical confidence.

The green accent (`#00d992`) is used with surgical precision — it glows from headlines, borders, and interactive elements like a circuit board carrying a signal. Against the carbon-black canvas, this green reads as "power on" — a deliberate visual metaphor for an AI agent engineering platform. The supporting palette is built entirely from warm-neutral grays (`#3d3a39`, `#8b949e`, `#b8b3b0`) that soften the darkness without introducing color noise, creating a cockpit-like warmth that pure blue-grays would lack.

Typography leans on the system font stack for headings — achieving maximum rendering speed and native-feeling authority — while Inter carries the body and UI text with geometric precision. Code blocks use SFMono-Regular, the same font developers see in their terminals, reinforcing the tool's credibility at every scroll.

**Key Characteristics:**
- Carbon-black canvas (`#050507`) with warm-gray border containment (`#3d3a39`) — not cold or sterile
- Single-accent identity: Emerald Signal Green (`#00d992`) as the sole chromatic energy source
- Dual-typography system: system-ui for authoritative headings, Inter for precise UI/body text, SFMono for code credibility
- Ultra-tight heading line-heights (1.0–1.11) creating dense, compressed power blocks
- Warm neutral palette (`#3d3a39`, `#8b949e`, `#b8b3b0`) that prevents the dark theme from feeling clinical
- Developer-terminal aesthetic where code snippets ARE the hero content
- Green glow effects (`drop-shadow`, border accents) that make UI elements feel electrically alive

## 2. Color Palette & Roles

### Primary
- **Emerald Signal Green** (`#00d992`): The core brand energy — used for accent borders, glow effects, and the highest-signal interactive moments. This is the "power-on" indicator of the entire interface.
- **VoltAgent Mint** (`#2fd6a1`): The button-text variant of the brand green — slightly warmer and more readable than pure Signal Green, used specifically for CTA text on dark surfaces.
- **Tailwind Emerald** (`#10b981`): The ecosystem-standard green used at low opacity (30%) for subtle background tints and link defaults. Bridges VoltAgent's custom palette with Tailwind's utility classes.

### Secondary & Accent
- **Soft Purple** (`#818cf8`): A cool indigo-violet used sparingly for secondary categorization, code syntax highlights, and visual variety without competing with green.
- **Cobalt Primary** (`#306cce`): Docusaurus primary dark — used in documentation contexts for links and interactive focus states.
- **Deep Cobalt** (`#2554a0`): The darkest primary shade, reserved for pressed/active states in documentation UI.
- **Ring Blue** (`#3b82f6`): Tailwind's ring color at 50% opacity — visible only during keyboard focus for accessibility compliance.

### Surface & Background
- **Abyss Black** (`#050507`): The landing page canvas — a near-pure black with the faintest warm undertone, darker than most "dark themes" for maximum contrast with green accents.
- **Carbon Surface** (`#101010`): The primary card and button background — one shade lighter than Abyss, creating a barely perceptible elevation layer. Used across all contained surfaces.
- **Warm Charcoal Border** (`#3d3a39`): The signature containment color — not a cold gray but a warm, almost brownish dark tone that prevents borders from feeling harsh against the black canvas.

### Neutrals & Text
- **Snow White** (`#f2f2f2`): The primary text color on dark surfaces — not pure white (`#ffffff`) but a softened, eye-friendly off-white. The most-used color on the site (1008 instances).
- **Pure White** (`#ffffff`): Reserved for the highest-emphasis moments — ghost button text and maximum-contrast headings. Used at low opacity (5%) for subtle overlay effects.
- **Warm Parchment** (`#b8b3b0`): Secondary body text — a warm light gray with a slight pinkish undertone that reads as "paper" against the dark canvas.
- **Steel Slate** (`#8b949e`): Tertiary text, metadata, timestamps, and de-emphasized content. A cool blue-gray that provides clear hierarchy below Warm Parchment.
- **Fog Gray** (`#bdbdbd`): Footer links and supporting navigation text — brightens on hover to Pure White.
- **Mist Gray** (`#dcdcdc`): Slightly brighter than Fog, used for secondary link text that transitions to bright green on hover.
- **Near White** (`#eeeeee`): Highest-contrast secondary text, one step below Snow White.

### Semantic & Accent
- **Success Emerald** (`#008b00`): Deep green for success states and positive confirmations in documentation contexts.
- **Success Light** (`#80d280`): Soft pastel green for success backgrounds and subtle positive indicators.
- **Warning Amber** (`#ffba00`): Bright amber for warning alerts and caution states.
- **Warning Pale** (`#ffdd80`): Softened amber for warning background fills.
- **Danger Coral** (`#fb565b`): Vivid red for error states and destructive action warnings.
- **Danger Rose** (`#fd9c9f`): Softened coral-pink for error backgrounds.
- **Info Teal** (`#4cb3d4`): Cool teal-blue for informational callouts and tip admonitions.
- **Dashed Border Slate** (`#4f5d75` at 40%): A muted blue-gray used exclusively for decorative dashed borders in workflow diagrams.

### Gradient System
- **Green Signal Glow**: `drop-shadow(0 0 2px #00d992)` animating to `drop-shadow(0 0 8px #00d992)` — creates a pulsing "electric charge" effect on the VoltAgent bolt logo and interactive elements. The glow expands and contracts like a heartbeat.
- **Warm Ambient Haze**: `rgba(92, 88, 85, 0.2) 0px 0px 15px` — a warm-toned diffused shadow that creates a soft atmospheric glow around elevated cards, visible at the edges without sharp boundaries.
- **Deep Dramatic Elevation**: `rgba(0, 0, 0, 0.7) 0px 20px 60px` with `rgba(148, 163, 184, 0.1) 0px 0px 0px 1px inset` — a heavy, dramatic downward shadow paired with a faint inset slate ring for the most prominent floating elements.

## 3. Typography Rules

### Font Family
- **Primary (Headings)**: `system-ui`, with fallbacks: `-apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica, Arial, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol`
- **Secondary (Body/UI)**: `Inter`, with fallbacks inheriting from system-ui stack. OpenType features: `"calt", "rlig"` (contextual alternates and required ligatures)
- **Monospace (Code)**: `SFMono-Regular`, with fallbacks: `Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace`

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Display / Hero | system-ui | 60px (3.75rem) | 400 | 1.00 (tight) | -0.65px | Maximum impact, compressed blocks |
| Section Heading | system-ui | 36px (2.25rem) | 400 | 1.11 (tight) | -0.9px | Tightest letter-spacing in the system |
| Sub-heading | system-ui | 24px (1.50rem) | 700 | 1.33 | -0.6px | Bold weight for emphasis at this size |
| Sub-heading Light | system-ui / Inter | 24px (1.50rem) | 300–400 | 1.33 | -0.6px | Light weight variant for softer hierarchy |
| Overline | system-ui | 20px (1.25rem) | 600 | 1.40 | 0.5px | Uppercase transform, positive letter-spacing |
| Feature Title | Inter | 20px (1.25rem) | 500–600 | 1.40 | normal | Card headings, feature names |
| Overline Small | Inter | 18px (1.13rem) | 600 | 1.56 | 0.45px | Uppercase section labels |
| Body / Button | Inter | 16px (1.00rem) | 400–600 | 1.50–1.65 | normal | Standard text, nav links, buttons |
| Nav Link | Inter | 14.45px (0.90rem) | 500 | 1.65 | normal | Navigation-specific sizing |
| Caption / Label | Inter | 14px (0.88rem) | 400–600 | 1.43–1.65 | normal | Descriptions, metadata, badge text |
| Tag / Overline Tiny | system-ui | 14px (0.88rem) | 600 | 1.43 | 2.52px | Widest letter-spacing — reserved for uppercase tags |
| Micro | Inter | 12px (0.75rem) | 400–500 | 1.33 | normal | Smallest sans-serif text |
| Code Body | SFMono-Regular | 13–14px | 400–686 | 1.23–1.43 | normal | Inline code, terminal output, variable weight for syntax |
| Code Small | SFMono-Regular | 11–12px | 400 | 1.33–1.45 | normal | Tiny code references, line numbers |
| Code Button | monospace | 13px (0.81rem) | 700 | 1.65 | normal | Copy-to-clipboard button labels |

### Principles
- **System-native authority**: Display headings use system-ui rather than a custom web font — this means the largest text renders instantly (no FOIT/FOUT) and inherits the operating system's native personality. On macOS it's SF Pro, on Windows it's Segoe UI. The design accepts this variability as a feature, not a bug.
- **Tight compression creates density**: Hero line-heights are extremely compressed (1.0) with negative letter-spacing (-0.65px to -0.9px), creating text blocks that feel like dense technical specifications rather than airy marketing copy.
- **Weight gradient, not weight contrast**: The system uses a gentle 300→400→500→600→700 weight progression. Bold (700) is reserved for sub-headings and code-button emphasis. Most body text lives at 400–500, creating subtle rather than dramatic hierarchy.
- **Uppercase is earned and wide**: When uppercase appears, it's always paired with generous letter-spacing (0.45px–2.52px), transforming dense words into spaced-out overline labels. This treatment is never applied to headings.
- **OpenType by default**: Both system-ui and Inter enable `"calt"` and `"rlig"` features, ensuring contextual character adjustments and ligature rendering throughout.

## 4. Component Stylings

### Buttons

**Ghost / Outline (Standard)**
- Background: transparent
- Text: Pure White (`#ffffff`)
- Padding: comfortable (12px 16px)
- Border: thin solid Warm Charcoal (`1px solid #3d3a39`)
- Radius: comfortably rounded (6px)
- Hover: background darkens to `rgba(0, 0, 0, 0.2)`, opacity drops to 0.4
- Outline: subtle green tint (`rgba(33, 196, 93, 0.5)`)
- The default interactive element — unassuming but clearly clickable

**Primary Green CTA**
- Background: Carbon Surface (`#101010`)
- Text: VoltAgent Mint (`#2fd6a1`)
- Padding: comfortable (12px 16px)
- Border: none visible (outline-based focus indicator)
- Outline: VoltAgent Mint (`rgb(47, 214, 161)`)
- Hover: same darkening behavior as Ghost
- The "powered on" button — green text on dark surface reads as an active terminal command

**Tertiary / Emphasized Container Button**
- Background: Carbon Surface (`#101010`)
- Text: Snow White (`#f2f2f2`)
- Padding: generous (20px all sides)
- Border: thick solid Warm Charcoal (`3px solid #3d3a39`)
- Radius: comfortably rounded (8px)
- A card-like button treatment for larger interactive surfaces (code copy blocks, feature CTAs)

### Cards & Containers
- Background: Carbon Surface (`#101010`) — one shade lighter than the page canvas
- Border: `1px solid #3d3a39` (Warm Charcoal) for standard containment; `2px solid #00d992` for highlighted/active cards
- Radius: comfortably rounded (8px) for content cards; subtly rounded (4–6px) for smaller inline containers
- Shadow Level 1: Warm Ambient Haze (`rgba(92, 88, 85, 0.2) 0px 0px 15px`) for standard elevation
- Shadow Level 2: Deep Dramatic (`rgba(0, 0, 0, 0.7) 0px 20px 60px` + `rgba(148, 163, 184, 0.1) 0px 0px 0px 1px inset`) for hero/feature showcase cards
- Hover behavior: likely border color shift toward green accent or subtle opacity increase
- Dashed variant: `1px dashed rgba(79, 93, 117, 0.4)` for workflow/diagram containers — visually distinct from solid-border content cards

### Inputs & Forms
- No explicit input token data extracted — the site is landing-page focused with minimal form UI
- The npm install command (`npm create voltagent-app@latest`) is presented as a code block rather than an input field
- Inferred style: Carbon Surface background, Warm Charcoal border, VoltAgent Mint focus ring, Snow White text

### Navigation
- Sticky top nav bar on Abyss Black canvas
- Logo: VoltAgent bolt icon with animated green glow (`drop-shadow` cycling 2px–8px)
- Nav structure: Logo → Product dropdown → Use Cases dropdown → Resources dropdown → GitHub stars badge → Docs CTA
- Link text: Snow White (`#f2f2f2`) at 14–16px Inter, weight 500
- Hover: links transition to green variants (`#00c182` or `#00ffaa`)
- GitHub badge: social proof element integrated directly into nav
- Mobile: collapses to hamburger menu, single-column vertical layout

### Image Treatment
- Dark-themed product screenshots and architectural diagrams dominate
- Code blocks are treated as primary visual content — syntax-highlighted with SFMono-Regular
- Agent workflow visualizations appear as interactive node graphs with green connection lines
- Decorative dot-pattern backgrounds appear behind hero sections
- Full-bleed within card containers, respecting 8px radius rounding

### Distinctive Components

**npm Install Command Block**
- A prominent code snippet (`npm create voltagent-app@latest`) styled as a copyable command
- SFMono-Regular on Carbon Surface with a copy-to-clipboard button
- Functions as the primary CTA — "install first, read later" developer psychology

**Company Logo Marquee**
- Horizontal scrolling strip of developer/company logos
- Infinite animation (`scrollLeft`/`scrollRight`, 25–80s durations)
- Pauses on hover and for users with reduced-motion preferences
- Demonstrates ecosystem adoption without cluttering the layout

**Feature Section Cards**
- Large cards combining code examples with descriptive text
- Left: code snippet with syntax highlighting; Right: feature description
- Green accent border (`2px solid #00d992`) on highlighted/active features
- Internal padding: generous (24–32px estimated)

**Agent Flow Diagrams**
- Interactive node-graph visualizations showing agent coordination
- Connection lines use VoltAgent green variants
- Nodes styled as mini-cards within the Warm Charcoal border system

**Community / GitHub Section**
- Large GitHub icon as the visual anchor
- Star count and contributor metrics prominently displayed
- Warm social proof: Discord, X, Reddit, LinkedIn, YouTube links in footer

## 5. Layout Principles

### Spacing System
- Base unit: 8px
- Scale: 2px, 4px, 5px, 6px, 6.4px, 8px, 12px, 16px, 20px, 24px, 28px, 32px, 40px, 48px, 64px
- Button padding: 12px 16px (standard), 20px (container-button)
- Card internal padding: approximately 24–32px
- Section vertical spacing: generous (estimated 64–96px between major sections)
- Component gap: 16–24px between sibling cards/elements

### Grid & Container
- Max container width: approximately 1280–1440px, centered
- Hero: centered single-column with maximum breathing room
- Feature sections: alternating asymmetric layouts (code left / text right, then reversed)
- Logo marquee: full-width horizontal scroll, breaking the container constraint
- Card grids: 2–3 column for feature showcases
- Integration grid: responsive multi-column for partner/integration icons

### Whitespace Philosophy
- **Cinematic breathing room between sections**: Massive vertical gaps create a "scroll-through-chapters" experience — each section feels like a new scene.
- **Dense within components**: Cards and code blocks are internally compact, with tight line-heights and controlled padding. Information is concentrated, not spread thin.
- **Border-defined separation**: Rather than relying solely on whitespace, VoltAgent uses the Warm Charcoal border system (`#3d3a39`) to delineate content zones. The border IS the whitespace signal.
- **Hero-first hierarchy**: The top of the page commands the most space — the "AI Agent Engineering Platform" headline and npm command get maximum vertical runway before the first content section appears.

### Border Radius Scale
- Nearly squared (4px): Small inline elements, SVG containers, code spans — the sharpest treatment, conveying technical precision
- Subtly rounded (6px): Buttons, links, clipboard actions — the workhorse radius for interactive elements
- Code-specific (6.4px): Code blocks, `pre` elements, clipboard copy targets — a deliberate micro-distinction from standard 6px
- Comfortably rounded (8px): Content cards, feature containers, emphasized buttons — the standard containment radius
- Pill-shaped (9999px): Tags, badges, status indicators, pill-shaped navigation elements — the roundest treatment for small categorical labels

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (Level 0) | No shadow, no border | Page background (`#050507`), inline text |
| Contained (Level 1) | `1px solid #3d3a39`, no shadow | Standard cards, nav bar, code blocks |
| Emphasized (Level 2) | `3px solid #3d3a39`, no shadow | Large interactive buttons, emphasized containers |
| Accent (Level 3) | `2px solid #00d992`, no shadow | Active/highlighted feature cards, selected states |
| Ambient Glow (Level 4) | `rgba(92, 88, 85, 0.2) 0px 0px 15px` | Elevated cards, hover states, soft atmospheric lift |
| Dramatic Float (Level 5) | `rgba(0, 0, 0, 0.7) 0px 20px 60px` + `rgba(148, 163, 184, 0.1) 1px inset` | Hero feature showcase, modals, maximum-elevation content |

**Shadow Philosophy**: VoltAgent communicates depth primarily through **border weight and color**, not shadows. The standard `1px solid #3d3a39` border IS the elevation — adding a `3px` border weight or switching to green (`#00d992`) communicates importance more than adding shadow does. When shadows do appear, they're either warm and diffused (Level 4) or cinematic and dramatic (Level 5) — never medium or generic.

### Decorative Depth
- **Green Signal Glow**: The VoltAgent bolt logo pulses with a `drop-shadow` animation cycling between 2px and 8px blur radius in Emerald Signal Green. This is the most distinctive decorative element — it makes the logo feel "powered on."
- **Warm Charcoal Containment Lines**: The warm tone of `#3d3a39` borders creates a subtle visual warmth against the cool black, as if the cards are faintly heated from within.
- **Dashed Workflow Lines**: `1px dashed rgba(79, 93, 117, 0.4)` creates a blueprint-like aesthetic for architecture diagrams, visually distinct from solid content borders.

## 7. Do's and Don'ts

### Do
- Use Abyss Black (`#050507`) as the landing page background and Carbon Surface (`#101010`) for all contained elements — the two-shade dark system is essential
- Reserve Emerald Signal Green (`#00d992`) exclusively for high-signal moments: active borders, glow effects, and the most important interactive accents
- Use VoltAgent Mint (`#2fd6a1`) for button text on dark surfaces — it's more readable than pure Signal Green
- Keep heading line-heights compressed (1.0–1.11) with negative letter-spacing for dense, authoritative text blocks
- Use the warm gray palette (`#3d3a39`, `#8b949e`, `#b8b3b0`) for borders and secondary text — warmth prevents the dark theme from feeling sterile
- Present code snippets as primary content — they're hero elements, not supporting illustrations
- Use border weight (1px → 2px → 3px) and color shifts (`#3d3a39` → `#00d992`) to communicate depth and importance, rather than relying on shadows
- Pair system-ui for headings with Inter for body text — the speed/authority of native fonts combined with the precision of a geometric sans
- Use SFMono-Regular for all code content — it's the developer credibility signal
- Apply `"calt"` and `"rlig"` OpenType features across all text

### Don't
- Don't use bright or light backgrounds as primary surfaces — the entire identity lives on near-black
- Don't introduce warm colors (orange, red, yellow) as decorative accents — the palette is strictly green + warm neutrals on black. Warm colors are reserved for semantic states (warning, error) only
- Don't use Emerald Signal Green (`#00d992`) on large surfaces or as background fills — it's an accent, never a surface
- Don't increase heading line-heights beyond 1.33 — the compressed density is core to the engineering-platform identity
- Don't use heavy shadows generously — depth comes from border treatment, not box-shadow. Shadows are reserved for Level 4–5 elevation only
- Don't use pure white (`#ffffff`) as default body text — Snow White (`#f2f2f2`) is the standard. Pure white is reserved for maximum-emphasis headings and button text
- Don't mix in serif or decorative fonts — the entire system is geometric sans + monospace
- Don't use border-radius larger than 8px on content cards — 9999px (pill) is only for small tags and badges
- Don't skip the warm-gray border system — cards without `#3d3a39` borders lose their containment and float ambiguously on the dark canvas
- Don't animate aggressively — animations are slow and subtle (25–100s durations for marquee, gentle glow pulses). Fast motion contradicts the "engineering precision" atmosphere

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Small Mobile | <420px | Minimum layout, stacked everything, reduced hero text to ~24px |
| Mobile | 420–767px | Single column, hamburger nav, full-width cards, hero text ~36px |
| Tablet | 768–1024px | 2-column grids begin, condensed nav, medium hero text |
| Desktop | 1025–1440px | Full multi-column layout, expanded nav with dropdowns, large hero (60px) |
| Large Desktop | >1440px | Max-width container centered (est. 1280–1440px), generous horizontal margins |

*23 breakpoints detected in total, ranging from 360px to 1992px — indicating a fluid, heavily responsive grid system rather than fixed breakpoint snapping.*

### Touch Targets
- Buttons use comfortable padding (12px 16px minimum) ensuring adequate touch area
- Navigation links spaced with sufficient gap for thumb navigation
- Interactive card surfaces are large enough to serve as full touch targets
- Minimum recommended touch target: 44x44px

### Collapsing Strategy
- **Navigation**: Full horizontal nav with dropdowns collapses to hamburger menu on mobile
- **Feature grids**: 3-column → 2-column → single-column vertical stacking
- **Hero text**: 60px → 36px → 24px progressive scaling with maintained compression ratios
- **Logo marquee**: Adjusts scroll speed and item sizing; maintains infinite loop
- **Code blocks**: Horizontal scroll on smaller viewports rather than wrapping — preserving code readability
- **Section padding**: Reduces proportionally but maintains generous vertical rhythm between chapters
- **Cards**: Stack vertically on mobile with full-width treatment and maintained internal padding

### Image Behavior
- Dark-themed screenshots and diagrams scale proportionally within containers
- Agent flow diagrams simplify or scroll horizontally on narrow viewports
- Dot-pattern decorative backgrounds scale with viewport
- No visible art direction changes between breakpoints — same crops, proportional scaling
- Lazy loading for below-fold images (Docusaurus default behavior)

## 9. Agent Prompt Guide

### Quick Color Reference
- Brand Accent: "Emerald Signal Green (#00d992)"
- Button Text: "VoltAgent Mint (#2fd6a1)"
- Page Background: "Abyss Black (#050507)"
- Card Surface: "Carbon Surface (#101010)"
- Border / Containment: "Warm Charcoal (#3d3a39)"
- Primary Text: "Snow White (#f2f2f2)"
- Secondary Text: "Warm Parchment (#b8b3b0)"
- Tertiary Text: "Steel Slate (#8b949e)"

### Example Component Prompts
- "Create a feature card on Carbon Surface (#101010) with a 1px solid Warm Charcoal (#3d3a39) border, comfortably rounded corners (8px). Use Snow White (#f2f2f2) for the title in system-ui at 24px weight 700, and Warm Parchment (#b8b3b0) for the description in Inter at 16px. Add a subtle Warm Ambient shadow (rgba(92, 88, 85, 0.2) 0px 0px 15px)."
- "Design a ghost button with transparent background, Snow White (#f2f2f2) text in Inter at 16px, a 1px solid Warm Charcoal (#3d3a39) border, and subtly rounded corners (6px). Padding: 12px vertical, 16px horizontal. On hover, background shifts to rgba(0, 0, 0, 0.2)."
- "Build a hero section on Abyss Black (#050507) with a massive heading at 60px system-ui, line-height 1.0, letter-spacing -0.65px. The word 'Platform' should be colored in Emerald Signal Green (#00d992). Below the heading, place a code block showing 'npm create voltagent-app@latest' in SFMono-Regular at 14px on Carbon Surface (#101010) with a copy button."
- "Create a highlighted feature card using a 2px solid Emerald Signal Green (#00d992) border instead of the standard Warm Charcoal. Keep Carbon Surface background, comfortably rounded corners (8px), and include a code snippet on the left with feature description text on the right."
- "Design a navigation bar on Abyss Black (#050507) with the VoltAgent logo (bolt icon with animated green glow) on the left, nav links in Inter at 14px weight 500 in Snow White, and a green CTA button (Carbon Surface bg, VoltAgent Mint text) on the right. Add a 1px solid Warm Charcoal bottom border."

### Iteration Guide
When refining existing screens generated with this design system:
1. Focus on ONE component at a time
2. Reference specific color names and hex codes — "use Warm Parchment (#b8b3b0)" not "make it lighter"
3. Use border treatment to communicate elevation: "change the border to 2px solid Emerald Signal Green (#00d992)" for emphasis
4. Describe the desired "feel" alongside measurements — "compressed and authoritative heading at 36px with line-height 1.11 and -0.9px letter-spacing"
5. For glow effects, specify "Emerald Signal Green (#00d992) as a drop-shadow with 2–8px blur radius"
6. Always specify which font — system-ui for headings, Inter for body/UI, SFMono-Regular for code
7. Keep animations slow and subtle — marquee scrolls at 25–80s, glow pulses gently
