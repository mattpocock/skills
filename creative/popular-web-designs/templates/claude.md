# Design System: Claude (Anthropic)


> **Hermes Agent — Implementation Notes**
>
> The original site uses proprietary fonts. For self-contained HTML output, use these CDN substitutes:
> - **Primary:** `Inter` | **Mono:** `JetBrains Mono`
> - **Font stack (CSS):** `font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;`
> - **Mono stack (CSS):** `font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;`
> ```html
> <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
> ```
> Use `write_file` to create HTML, serve via `generative-widgets` skill (cloudflared tunnel).
> Verify visual accuracy with `browser_vision` after generating.

## 1. Visual Theme & Atmosphere

Claude's interface is a literary salon reimagined as a product page — warm, unhurried, and quietly intellectual. The entire experience is built on a parchment-toned canvas (`#f5f4ed`) that deliberately evokes the feeling of high-quality paper rather than a digital surface. Where most AI product pages lean into cold, futuristic aesthetics, Claude's design radiates human warmth, as if the AI itself has good taste in interior design.

The signature move is the custom Anthropic Serif typeface — a medium-weight serif with generous proportions that gives every headline the gravitas of a book title. Combined with organic, hand-drawn-feeling illustrations in terracotta (`#c96442`), black, and muted green, the visual language says "thoughtful companion" rather than "powerful tool." The serif headlines breathe at tight-but-comfortable line-heights (1.10–1.30), creating a cadence that feels more like reading an essay than scanning a product page.

What makes Claude's design truly distinctive is its warm neutral palette. Every gray has a yellow-brown undertone (`#5e5d59`, `#87867f`, `#4d4c48`) — there are no cool blue-grays anywhere. Borders are cream-tinted (`#f0eee6`, `#e8e6dc`), shadows use warm transparent blacks, and even the darkest surfaces (`#141413`, `#30302e`) carry a barely perceptible olive warmth. This chromatic consistency creates a space that feels lived-in and trustworthy.

**Key Characteristics:**
- Warm parchment canvas (`#f5f4ed`) evoking premium paper, not screens
- Custom Anthropic type family: Serif for headlines, Sans for UI, Mono for code
- Terracotta brand accent (`#c96442`) — warm, earthy, deliberately un-tech
- Exclusively warm-toned neutrals — every gray has a yellow-brown undertone
- Organic, editorial illustrations replacing typical tech iconography
- Ring-based shadow system (`0px 0px 0px 1px`) creating border-like depth without visible borders
- Magazine-like pacing with generous section spacing and serif-driven hierarchy

## 2. Color Palette & Roles

### Primary
- **Anthropic Near Black** (`#141413`): The primary text color and dark-theme surface — not pure black but a warm, almost olive-tinted dark that's gentler on the eyes. The warmest "black" in any major tech brand.
- **Terracotta Brand** (`#c96442`): The core brand color — a burnt orange-brown used for primary CTA buttons, brand moments, and the signature accent. Deliberately earthy and un-tech.
- **Coral Accent** (`#d97757`): A lighter, warmer variant of the brand color used for text accents, links on dark surfaces, and secondary emphasis.

### Secondary & Accent
- **Error Crimson** (`#b53333`): A deep, warm red for error states — serious without being alarming.
- **Focus Blue** (`#3898ec`): Standard blue for input focus rings — the only cool color in the entire system, used purely for accessibility.

### Surface & Background
- **Parchment** (`#f5f4ed`): The primary page background — a warm cream with a yellow-green tint that feels like aged paper. The emotional foundation of the entire design.
- **Ivory** (`#faf9f5`): The lightest surface — used for cards and elevated containers on the Parchment background. Barely distinguishable but creates subtle layering.
- **Pure White** (`#ffffff`): Reserved for specific button surfaces and maximum-contrast elements.
- **Warm Sand** (`#e8e6dc`): Button backgrounds and prominent interactive surfaces — a noticeably warm light gray.
- **Dark Surface** (`#30302e`): Dark-theme containers, nav borders, and elevated dark elements — warm charcoal.
- **Deep Dark** (`#141413`): Dark-theme page background and primary dark surface.

### Neutrals & Text
- **Charcoal Warm** (`#4d4c48`): Button text on light warm surfaces — the go-to dark-on-light text.
- **Olive Gray** (`#5e5d59`): Secondary body text — a distinctly warm medium-dark gray.
- **Stone Gray** (`#87867f`): Tertiary text, footnotes, and de-emphasized metadata.
- **Dark Warm** (`#3d3d3a`): Dark text links and emphasized secondary text.
- **Warm Silver** (`#b0aea5`): Text on dark surfaces — a warm, parchment-tinted light gray.

### Semantic & Accent
- **Border Cream** (`#f0eee6`): Standard light-theme border — barely visible warm cream, creating the gentlest possible containment.
- **Border Warm** (`#e8e6dc`): Prominent borders, section dividers, and emphasized containment on light surfaces.
- **Border Dark** (`#30302e`): Standard border on dark surfaces — maintains the warm tone.
- **Ring Warm** (`#d1cfc5`): Shadow ring color for button hover/focus states.
- **Ring Subtle** (`#dedc01`): Secondary ring variant for lighter interactive surfaces.
- **Ring Deep** (`#c2c0b6`): Deeper ring for active/pressed states.

### Gradient System
- Claude's design is **gradient-free** in the traditional sense. Depth and visual richness come from the interplay of warm surface tones, organic illustrations, and light/dark section alternation. The warm palette itself creates a "gradient" effect as the eye moves through cream → sand → stone → charcoal → black sections.

## 3. Typography Rules

### Font Family
- **Headline**: `Anthropic Serif`, with fallback: `Georgia`
- **Body / UI**: `Anthropic Sans`, with fallback: `Arial`
- **Code**: `Anthropic Mono`, with fallback: `Arial`

*Note: These are custom typefaces. For external implementations, Georgia serves as the serif substitute and system-ui/Inter as the sans substitute.*

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Display / Hero | Anthropic Serif | 64px (4rem) | 500 | 1.10 (tight) | normal | Maximum impact, book-title presence |
| Section Heading | Anthropic Serif | 52px (3.25rem) | 500 | 1.20 (tight) | normal | Feature section anchors |
| Sub-heading Large | Anthropic Serif | 36–36.8px (~2.3rem) | 500 | 1.30 | normal | Secondary section markers |
| Sub-heading | Anthropic Serif | 32px (2rem) | 500 | 1.10 (tight) | normal | Card titles, feature names |
| Sub-heading Small | Anthropic Serif | 25–25.6px (~1.6rem) | 500 | 1.20 | normal | Smaller section titles |
| Feature Title | Anthropic Serif | 20.8px (1.3rem) | 500 | 1.20 | normal | Small feature headings |
| Body Serif | Anthropic Serif | 17px (1.06rem) | 400 | 1.60 (relaxed) | normal | Serif body text (editorial passages) |
| Body Large | Anthropic Sans | 20px (1.25rem) | 400 | 1.60 (relaxed) | normal | Intro paragraphs |
| Body / Nav | Anthropic Sans | 17px (1.06rem) | 400–500 | 1.00–1.60 | normal | Navigation links, UI text |
| Body Standard | Anthropic Sans | 16px (1rem) | 400–500 | 1.25–1.60 | normal | Standard body, button text |
| Body Small | Anthropic Sans | 15px (0.94rem) | 400–500 | 1.00–1.60 | normal | Compact body text |
| Caption | Anthropic Sans | 14px (0.88rem) | 400 | 1.43 | normal | Metadata, descriptions |
| Label | Anthropic Sans | 12px (0.75rem) | 400–500 | 1.25–1.60 | 0.12px | Badges, small labels |
| Overline | Anthropic Sans | 10px (0.63rem) | 400 | 1.60 | 0.5px | Uppercase overline labels |
| Micro | Anthropic Sans | 9.6px (0.6rem) | 400 | 1.60 | 0.096px | Smallest text |
| Code | Anthropic Mono | 15px (0.94rem) | 400 | 1.60 | -0.32px | Inline code, terminal |

### Principles
- **Serif for authority, sans for utility**: Anthropic Serif carries all headline content with medium weight (500), giving every heading the gravitas of a published title. Anthropic Sans handles all functional UI text — buttons, labels, navigation — with quiet efficiency.
- **Single weight for serifs**: All Anthropic Serif headings use weight 500 — no bold, no light. This creates a consistent "voice" across all headline sizes, as if the same author wrote every heading.
- **Relaxed body line-height**: Most body text uses 1.60 line-height — significantly more generous than typical tech sites (1.4–1.5). This creates a reading experience closer to a book than a dashboard.
- **Tight-but-not-compressed headings**: Line-heights of 1.10–1.30 for headings are tight but never claustrophobic. The serif letterforms need breathing room that sans-serif fonts don't.
- **Micro letter-spacing on labels**: Small sans text (12px and below) uses deliberate letter-spacing (0.12px–0.5px) to maintain readability at tiny sizes.

## 4. Component Stylings

### Buttons

**Warm Sand (Secondary)**
- Background: Warm Sand (`#e8e6dc`)
- Text: Charcoal Warm (`#4d4c48`)
- Padding: 0px 12px 0px 8px (asymmetric — icon-first layout)
- Radius: comfortably rounded (8px)
- Shadow: ring-based (`#e8e6dc 0px 0px 0px 0px, #d1cfc5 0px 0px 0px 1px`)
- The workhorse button — warm, unassuming, clearly interactive

**White Surface**
- Background: Pure White (`#ffffff`)
- Text: Anthropic Near Black (`#141413`)
- Padding: 8px 16px 8px 12px
- Radius: generously rounded (12px)
- Hover: shifts to secondary background color
- Clean, elevated button for light surfaces

**Dark Charcoal**
- Background: Dark Surface (`#30302e`)
- Text: Ivory (`#faf9f5`)
- Padding: 0px 12px 0px 8px
- Radius: comfortably rounded (8px)
- Shadow: ring-based (`#30302e 0px 0px 0px 0px, ring 0px 0px 0px 1px`)
- The inverted variant for dark-on-light emphasis

**Brand Terracotta**
- Background: Terracotta Brand (`#c96442`)
- Text: Ivory (`#faf9f5`)
- Radius: 8–12px
- Shadow: ring-based (`#c96442 0px 0px 0px 0px, #c96442 0px 0px 0px 1px`)
- The primary CTA — the only button with chromatic color

**Dark Primary**
- Background: Anthropic Near Black (`#141413`)
- Text: Warm Silver (`#b0aea5`)
- Padding: 9.6px 16.8px
- Radius: generously rounded (12px)
- Border: thin solid Dark Surface (`1px solid #30302e`)
- Used on dark theme surfaces

### Cards & Containers
- Background: Ivory (`#faf9f5`) or Pure White (`#ffffff`) on light surfaces; Dark Surface (`#30302e`) on dark
- Border: thin solid Border Cream (`1px solid #f0eee6`) on light; `1px solid #30302e` on dark
- Radius: comfortably rounded (8px) for standard cards; generously rounded (16px) for featured; very rounded (32px) for hero containers and embedded media
- Shadow: whisper-soft (`rgba(0,0,0,0.05) 0px 4px 24px`) for elevated content
- Ring shadow: `0px 0px 0px 1px` patterns for interactive card states
- Section borders: `1px 0px 0px` (top-only) for list item separators

### Inputs & Forms
- Text: Anthropic Near Black (`#141413`)
- Padding: 1.6px 12px (very compact vertical)
- Border: standard warm borders
- Focus: ring with Focus Blue (`#3898ec`) border-color — the only cool color moment
- Radius: generously rounded (12px)

### Navigation
- Sticky top nav with warm background
- Logo: Claude wordmark in Anthropic Near Black
- Links: mix of Near Black (`#141413`), Olive Gray (`#5e5d59`), and Dark Warm (`#3d3d3a`)
- Nav border: `1px solid #30302e` (dark) or `1px solid #f0eee6` (light)
- CTA: Terracotta Brand button or White Surface button
- Hover: text shifts to foreground-primary, no decoration

### Image Treatment
- Product screenshots showing the Claude chat interface
- Generous border-radius on media (16–32px)
- Embedded video players with rounded corners
- Dark UI screenshots provide contrast against warm light canvas
- Organic, hand-drawn illustrations for conceptual sections

### Distinctive Components

**Model Comparison Cards**
- Opus 4.5, Sonnet 4.5, Haiku 4.5 presented in a clean card grid
- Each model gets a bordered card with name, description, and capability badges
- Border Warm (`#e8e6dc`) separation between items

**Organic Illustrations**
- Hand-drawn-feeling vector illustrations in terracotta, black, and muted green
- Abstract, conceptual rather than literal product diagrams
- The primary visual personality — no other AI company uses this style

**Dark/Light Section Alternation**
- The page alternates between Parchment light and Near Black dark sections
- Creates a reading rhythm like chapters in a book
- Each section feels like a distinct environment

## 5. Layout Principles

### Spacing System
- Base unit: 8px
- Scale: 3px, 4px, 6px, 8px, 10px, 12px, 16px, 20px, 24px, 30px
- Button padding: asymmetric (0px 12px 0px 8px) or balanced (8px 16px)
- Card internal padding: approximately 24–32px
- Section vertical spacing: generous (estimated 80–120px between major sections)

### Grid & Container
- Max container width: approximately 1200px, centered
- Hero: centered with editorial layout
- Feature sections: single-column or 2–3 column card grids
- Model comparison: clean 3-column grid
- Full-width dark sections breaking the container for emphasis

### Whitespace Philosophy
- **Editorial pacing**: Each section breathes like a magazine spread — generous top/bottom margins create natural reading pauses.
- **Serif-driven rhythm**: The serif headings establish a literary cadence that demands more whitespace than sans-serif designs.
- **Content island approach**: Sections alternate between light and dark environments, creating distinct "rooms" for each message.

### Border Radius Scale
- Sharp (4px): Minimal inline elements
- Subtly rounded (6–7.5px): Small buttons, secondary interactive elements
- Comfortably rounded (8–8.5px): Standard buttons, cards, containers
- Generously rounded (12px): Primary buttons, input fields, nav elements
- Very rounded (16px): Featured containers, video players, tab lists
- Highly rounded (24px): Tag-like elements, highlighted containers
- Maximum rounded (32px): Hero containers, embedded media, large cards

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (Level 0) | No shadow, no border | Parchment background, inline text |
| Contained (Level 1) | `1px solid #f0eee6` (light) or `1px solid #30302e` (dark) | Standard cards, sections |
| Ring (Level 2) | `0px 0px 0px 1px` ring shadows using warm grays | Interactive cards, buttons, hover states |
| Whisper (Level 3) | `rgba(0,0,0,0.05) 0px 4px 24px` | Elevated feature cards, product screenshots |
| Inset (Level 4) | `inset 0px 0px 0px 1px` at 15% opacity | Active/pressed button states |

**Shadow Philosophy**: Claude communicates depth through **warm-toned ring shadows** rather than traditional drop shadows. The signature `0px 0px 0px 1px` pattern creates a border-like halo that's softer than an actual border — it's a shadow pretending to be a border, or a border that's technically a shadow. When drop shadows do appear, they're extremely soft (0.05 opacity, 24px blur) — barely visible lifts that suggest floating rather than casting.

### Decorative Depth
- **Light/Dark alternation**: The most dramatic depth effect comes from alternating between Parchment (`#f5f4ed`) and Near Black (`#141413`) sections — entire sections shift elevation by changing the ambient light level.
- **Warm ring halos**: Button and card interactions use ring shadows that match the warm palette — never cool-toned or generic gray.

## 7. Do's and Don'ts

### Do
- Use Parchment (`#f5f4ed`) as the primary light background — the warm cream tone IS the Claude personality
- Use Anthropic Serif at weight 500 for all headlines — the single-weight consistency is intentional
- Use Terracotta Brand (`#c96442`) only for primary CTAs and the highest-signal brand moments
- Keep all neutrals warm-toned — every gray should have a yellow-brown undertone
- Use ring shadows (`0px 0px 0px 1px`) for interactive element states instead of drop shadows
- Maintain the editorial serif/sans hierarchy — serif for content headlines, sans for UI
- Use generous body line-height (1.60) for a literary reading experience
- Alternate between light and dark sections to create chapter-like page rhythm
- Apply generous border-radius (12–32px) for a soft, approachable feel

### Don't
- Don't use cool blue-grays anywhere — the palette is exclusively warm-toned
- Don't use bold (700+) weight on Anthropic Serif — weight 500 is the ceiling for serifs
- Don't introduce saturated colors beyond Terracotta — the palette is deliberately muted
- Don't use sharp corners (< 6px radius) on buttons or cards — softness is core to the identity
- Don't apply heavy drop shadows — depth comes from ring shadows and background color shifts
- Don't use pure white (`#ffffff`) as a page background — Parchment (`#f5f4ed`) or Ivory (`#faf9f5`) are always warmer
- Don't use geometric/tech-style illustrations — Claude's illustrations are organic and hand-drawn-feeling
- Don't reduce body line-height below 1.40 — the generous spacing supports the editorial personality
- Don't use monospace fonts for non-code content — Anthropic Mono is strictly for code
- Don't mix in sans-serif for headlines — the serif/sans split is the typographic identity

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Small Mobile | <479px | Minimum layout, stacked everything, compact typography |
| Mobile | 479–640px | Single column, hamburger nav, reduced heading sizes |
| Large Mobile | 640–767px | Slightly wider content area |
| Tablet | 768–991px | 2-column grids begin, condensed nav |
| Desktop | 992px+ | Full multi-column layout, expanded nav, maximum hero typography (64px) |

### Touch Targets
- Buttons use generous padding (8–16px vertical minimum)
- Navigation links adequately spaced for thumb navigation
- Card surfaces serve as large touch targets
- Minimum recommended: 44x44px

### Collapsing Strategy
- **Navigation**: Full horizontal nav collapses to hamburger on mobile
- **Feature sections**: Multi-column → stacked single column
- **Hero text**: 64px → 36px → ~25px progressive scaling
- **Model cards**: 3-column → stacked vertical
- **Section padding**: Reduces proportionally but maintains editorial rhythm
- **Illustrations**: Scale proportionally, maintain aspect ratios

### Image Behavior
- Product screenshots scale proportionally within rounded containers
- Illustrations maintain quality at all sizes
- Video embeds maintain 16:9 aspect ratio with rounded corners
- No art direction changes between breakpoints

## 9. Agent Prompt Guide

### Quick Color Reference
- Brand CTA: "Terracotta Brand (#c96442)"
- Page Background: "Parchment (#f5f4ed)"
- Card Surface: "Ivory (#faf9f5)"
- Primary Text: "Anthropic Near Black (#141413)"
- Secondary Text: "Olive Gray (#5e5d59)"
- Tertiary Text: "Stone Gray (#87867f)"
- Borders (light): "Border Cream (#f0eee6)"
- Dark Surface: "Dark Surface (#30302e)"

### Example Component Prompts
- "Create a hero section on Parchment (#f5f4ed) with a headline at 64px Anthropic Serif weight 500, line-height 1.10. Use Anthropic Near Black (#141413) text. Add a subtitle in Olive Gray (#5e5d59) at 20px Anthropic Sans with 1.60 line-height. Place a Terracotta Brand (#c96442) CTA button with Ivory text, 12px radius."
- "Design a feature card on Ivory (#faf9f5) with a 1px solid Border Cream (#f0eee6) border and comfortably rounded corners (8px). Title in Anthropic Serif at 25px weight 500, description in Olive Gray (#5e5d59) at 16px Anthropic Sans. Add a whisper shadow (rgba(0,0,0,0.05) 0px 4px 24px)."
- "Build a dark section on Anthropic Near Black (#141413) with Ivory (#faf9f5) headline text in Anthropic Serif at 52px weight 500. Use Warm Silver (#b0aea5) for body text. Borders in Dark Surface (#30302e)."
- "Create a button in Warm Sand (#e8e6dc) with Charcoal Warm (#4d4c48) text, 8px radius, and a ring shadow (0px 0px 0px 1px #d1cfc5). Padding: 0px 12px 0px 8px."
- "Design a model comparison grid with three cards on Ivory surfaces. Each card gets a Border Warm (#e8e6dc) top border, model name in Anthropic Serif at 25px, and description in Olive Gray at 15px Anthropic Sans."

### Iteration Guide
1. Focus on ONE component at a time
2. Reference specific color names — "use Olive Gray (#5e5d59)" not "make it gray"
3. Always specify warm-toned variants — no cool grays
4. Describe serif vs sans usage explicitly — "Anthropic Serif for the heading, Anthropic Sans for the label"
5. For shadows, use "ring shadow (0px 0px 0px 1px)" or "whisper shadow" — never generic "drop shadow"
6. Specify the warm background — "on Parchment (#f5f4ed)" or "on Near Black (#141413)"
7. Keep illustrations organic and conceptual — describe "hand-drawn-feeling" style
