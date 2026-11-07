---
name: RottyM Architectural Engineering
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45474c'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cc'
  surface-tint: '#585e6f'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#151b2a'
  on-primary-container: '#7d8496'
  inverse-primary: '#c0c6da'
  secondary: '#006398'
  on-secondary: '#ffffff'
  secondary-container: '#5bb8fe'
  on-secondary-container: '#00476e'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#001f26'
  on-tertiary-container: '#0090a9'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce2f6'
  primary-fixed-dim: '#c0c6da'
  on-primary-fixed: '#151b2a'
  on-primary-fixed-variant: '#404757'
  secondary-fixed: '#cce5ff'
  secondary-fixed-dim: '#93ccff'
  on-secondary-fixed: '#001d31'
  on-secondary-fixed-variant: '#004b73'
  tertiary-fixed: '#acedff'
  tertiary-fixed-dim: '#4cd7f6'
  on-tertiary-fixed: '#001f26'
  on-tertiary-fixed-variant: '#004e5c'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display:
    fontFamily: Space Grotesk
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 64px
    letterSpacing: -0.03em
  display-mobile:
    fontFamily: Space Grotesk
    fontSize: 38px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  code-badge:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  code-inline:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.06em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 3rem
  margin-mobile: 1.25rem
  space-xs: 0.375rem
  space-sm: 0.75rem
  space-md: 1.25rem
  space-lg: 2rem
  space-xl: 3.5rem
---

## Brand & Style
This design system defines a high-precision, technical aesthetic tailored for elite full-stack and AI software engineering portfolios. It rejects generic flat minimalism in favor of an **architectural engineering aesthetic**: crisp, structurally sound, hyper-legible, and engineered down to the pixel. 

The emotional impact communicates unyielding competence, velocity, and mathematical rigor. Surfaces feel physical yet weightless, like blueprint vellum suspended over clean industrial workspace tables. High-density information layouts pair with expansive negative space, signaling senior-level authority and deep systems comprehension.

## Colors
The palette leverages a deep contrast hierarchy built upon off-white technical substrates.

- **Obsidian Ink (`#0B1220`)**: The primary structural anchor. Used for primary interactive triggers, dominant header typographies, and heavy contrasting borders.
- **Cobalt Azure (`#0284C7`)**: Secondary tone delivering decisive engineering focus. Forms the base of gradient linear tracks, active states, and focused data highlights.
- **Electric Cyan (`#06B6D4`)**: Tertiary vibrancy token. Used in gradient spans, live pulse indicators, terminal caret states, and hover accents.
- **Slate Neutral (`#64748B`)**: Modulates supporting documentation, metadata, captions, and inactive structural indicators.

### Surface Tokens & Atmosphere
- **Canvas Base**: Slate-tinted architectural field (`#F8FAFC` transitioning smoothly into `#F1F5F9`).
- **Elevated Planar Cards**: Solid crystalline white (`#FFFFFF`) with ultra-fine wireframe boundaries (`rgba(15, 23, 42, 0.08)`).
- **Subtle Glow Accents**: Under-surface radial gradients of `rgba(6, 182, 212, 0.06)` combined with micro grid coordinate meshes (`rgba(148, 163, 184, 0.15)` at 24px intervals).

## Typography
The typographical hierarchy balances industrial tech authority with fluid editorial elegance:

- **Display & Headlines (`Space Grotesk`)**: Geometric, calculated, and high-impact. Headings must feature strict optical kerning and tight negative tracking (`-0.02em` to `-0.03em`) to reinforce precision engineering.
- **Body & Prose (`Plus Jakarta Sans`)**: Clean, human, highly legible grotesque sans that prevents eye fatigue across deep technical case studies and architectural breakdowns.
- **Terminal, Badges & Micro-Data (`JetBrains Mono`)**: Strict tabular spacing used for framework labels, execution latency stats, commit hashes, and algorithmic notations.

## Layout & Spacing
The layout follows a disciplined 12-column fluid grid system bounded at a maximum container width of `1280px` to maintain strict optical sightlines.

- **Desktop (1024px+)**: 12 columns, 1.5rem gutters, and 3rem side margins. Structural cards align directly to column intersections.
- **Tablet (768px - 1023px)**: 8 columns, 1.25rem gutters, 2rem margins. Complex metrics dashboards collapse from 4 columns to 2.
- **Mobile (< 768px)**: 4 columns, 1rem gutters, 1.25rem safe canvas margins. Horizontal navigation switches to a floating bottom/top architectural panel.
- **Spatial Rhythm**: Internal component padding adheres strictly to `space-sm` and `space-md`, while section separation defaults to `space-xl` to emphasize high-end spatial breathing room.

## Elevation & Depth
Elevation is constructed via microscopic perimeter definition coupled with multi-layered, ultra-diffused atmospheric shadows rather than heavy elevation blurs.

- **Level 0 (Canvas Base)**: `#F8FAFC` with an optional subtle SVG coordinate grid background (`24px x 24px` pattern using `stroke="rgba(148,163,184,0.12)"`).
- **Level 1 (Structural Cards)**: Pure white surface (`#FFFFFF`) with an explicit structural outline of `1px solid rgba(15, 23, 42, 0.08)`. Shadow stack: `0 1px 3px rgba(15, 23, 42, 0.03), 0 8px 24px -4px rgba(15, 23, 42, 0.06)`.
- **Level 2 (Hovered Cards & Interactive Panels)**: Outlines shift to `rgba(2, 132, 199, 0.3)`. Shadow stack expands to `0 12px 32px -6px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(2, 132, 199, 0.15)`.
- **Level 3 (Floating Controls & Navigation)**: Glassmorphic translucent membrane. `background: rgba(255, 255, 255, 0.8)`, `backdrop-filter: blur(16px)`, with a crisp lower border of `1px solid rgba(15, 23, 42, 0.06)` and drop shadow `0 10px 30px -10px rgba(15, 23, 42, 0.05)`.

## Shapes
Geometry uses clean, controlled radii (`roundedness: 2`, base radius `0.5rem / 8px`). 

- **Cards and Major Containers**: `rounded-lg` (`1rem / 16px`) for structural framing.
- **Badges, Pills, and Nav Bars**: Pill structures (`9999px`) are reserved exclusively for terminal micro-badges, primary status capsules, and floating nav enclosures to contrast against architectural grid blocks.
- **Buttons and Inputs**: Standard `0.5rem / 8px` roundedness to preserve functional, tactile sharpness.

## Components

### Buttons
- **Primary Action (Dark Obsidian)**: Background `#0B1220`, text `#FFFFFF`, border `1px solid #0B1220`. On hover, transform subtly with `-1px` Y-axis translation, glow shadow `0 8px 20px -4px rgba(11, 18, 32, 0.35)`, and an accent right-chevron or icon highlighted in Electric Cyan (`#06B6D4`).
- **Secondary Action (Tactile White)**: Background `#FFFFFF`, text `#0F172A`, border `1px solid rgba(15, 23, 42, 0.12)`, shadow `0 1px 2px rgba(15, 23, 42, 0.05)`. Hover transition: border color shifts to `#0284C7`, text shifts to `#0284C7`.

### Terminal Badges & Chips
- Monospace tags for tech stacks (`React`, `Go`, `PyTorch`, `PostgreSQL`).
- Styled with `bg-sky-50`, `border border-sky-200`, `text-sky-800`. Font set to `code-badge`. Micro dot indicators inside badges pulse with vibrant `#0284C7` or `#06B6D4`.

### Header & Navigation
- Translucent floating capsule bar anchored at screen top with `space-md` margin.
- RottyM wordmark: `Space Grotesk` Bold with cyan terminal dot accent (`RottyM.`).
- Navigation links in muted slate (`#64748B`), transitioning to obsidian (`#0B1220`) on hover with subtle bottom highlight indicator.
- Trailing CTA: Compact pill contact button with deep dark background and integrated availability pulse.

### Metric & Architecture Cards
- Pure white fill, delicate structural borders, and inner padding of `space-md` to `space-lg`.
- Performance comparison component: Split layout highlighting legacy bottlenecks versus modern architectural performance (featuring gradient text highlight `#0369A1` to `#06B6D4`).

### Form Elements & Text Inputs
- Inputs feature crisp `#FFFFFF` backgrounds, `1px solid rgba(15, 23, 42, 0.12)` borders, and monospaced contextual placeholders.
- Focus state: Ring glow in `rgba(2, 132, 199, 0.2)` with a border shift to `#0284C7`.