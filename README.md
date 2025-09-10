# Portfolio & Design System Playground

A working lab for how I practice design technology. I use this codebase—and the live site it powers—to test hypotheses about design systems, the design→code pipeline, and AI-augmented workflows. Rather than a static showcase of artifacts, this is a place where ideas are prototyped, instrumented, documented, and then promoted (or retired) based on evidence.

This document is your map: why this exists, how it’s organized, what questions I’m probing, and where to explore specific modules.

---

## Why this exists

Design systems succeed or fail on the seams—where design intent meets implementation reality. I run experiments here to answer questions like:

- Can we capture design intent as tokens, constraints, or invariants that survive translation across platforms?
- What documentation format actually changes behavior for designers and engineers (not just looks polished)?
- Which parts of the pipeline benefit from automation or AI augmentation without eroding craft, clarity, or ownership?
- How do we measure quality beyond “usage counts”: accessibility compliance, cognitive load, latency, maintainability, and change risk?

The site is the public surface; the repository is the instrumentation and scaffolding that makes the experiments repeatable.

---

## How this project is organized

At a glance:

```
app/                 # Next.js App Router routes, pages, and API endpoints
├── blueprints/      # Design system documentation and foundations
├── dashboard/       # Content management interface
├── work/           # Case studies and portfolio content
└── components/     # Component playground and examples

components/          # Design system components with token-based architecture
modules/            # Complex interactive modules and tools
context/            # React contexts for global state (interaction, motion, auth)
types/              # TypeScript definitions and contracts
utils/              # Utilities for tokens, geometry, color, and performance
public/             # Static assets, fonts, and images
```

Three main layers:

1. **App routes** (`app/`) — Public pages, documentation, dashboard, and API endpoints
2. **Design system** (`components/`) — Token-driven components with generated styles and documentation
3. **Interactive modules** (`modules/`) — Complex tools like the font inspector, rich text editor, and specialized UI components

Every significant module aims to include:

- a short **rationale** (the problem, constraints, and target behaviors),
- a **demo** (small, isolated, and interactive),
- a **contract** (props, events, tokens, and a11y expectations),
- and a path to **graduate** from experiment → standard.

---

## What to explore (key modules)

These modules represent different approaches to common design system challenges. Each has a specific purpose and current implementation status.

### 1) Font Inspector (`modules/FontInspector/`)

**Purpose:** Interactive tool for analyzing typography features and variable font properties.
**Current state:** Functional font analysis with glyph inspection, anatomy detection, and variable axis controls. Uses fontkit for font parsing and custom geometry utilities for feature detection.
**Where to look:** Typography foundations page demonstrates the tool in action.

### 2) Design Token System (`components/`, `utils/designTokens/`)

**Purpose:** Token-driven component architecture with automated CSS generation.
**Current state:** All components use `.tokens.json` files that generate `.tokens.generated.scss` stylesheets. Supports semantic tokens, theme variants, and component-specific overrides.
**Where to look:** Any component folder shows the token → CSS pipeline in action.

### 3) Blueprints Documentation (`app/blueprints/`)

**Purpose:** Comprehensive design system documentation covering foundations, patterns, and standards.
**Current state:** Multi-section documentation with interactive examples for color, typography, spacing, accessibility, and component standards.
**Where to look:** `/blueprints` route with nested foundation pages.

### 4) Rich Text Editor (`modules/Tiptap/`)

**Purpose:** Content editing system with custom extensions for design system documentation.
**Current state:** Tiptap-based editor with custom node types for details, code blocks, images, and table of contents. Used in dashboard for content management.
**Where to look:** Dashboard content editing interface.

### 5) Interactive Context System (`context/`)

**Purpose:** Global state management for user interactions, reduced motion preferences, and authentication.
**Current state:** React contexts for interaction tracking, motion preferences, and user sessions. Integrates with GSAP for animation control.
**Where to look:** Context providers in app layout and component motion behaviors.

### 6) Geometry & Color Utilities (`utils/`)

**Purpose:** Mathematical utilities for color manipulation, geometric calculations, and typography analysis.
**Current state:** Color space conversions, WCAG compliance checks, bezier curve analysis, and font feature detection algorithms.
**Where to look:** Color foundation pages and font inspector functionality.

> Each module is documented on the live site with working examples and source code references.

---

## Current experiments and questions

The codebase explores several hypotheses about design system implementation:

- **Token-driven architecture:** Can design tokens fully drive component styling without manual CSS overrides? Current implementation uses JSON tokens that generate SCSS variables automatically.
- **Interactive documentation:** Does embedding live components in documentation improve adoption? The blueprints system combines narrative docs with working examples.
- **Typography analysis:** Can programmatic font feature detection inform better typographic decisions? The font inspector extracts geometric properties to suggest optimal settings.
- **Motion accessibility:** How can reduced-motion preferences be respected system-wide without component-specific code paths? Context providers handle this globally.
- **Content-code integration:** Can rich text editing work seamlessly with component libraries? The Tiptap integration allows embedding live components in documentation.

These aren't fully proven concepts—they're working implementations being tested in a real project context.

---

## How experiments graduate

1. **Hypothesis:** a crisp claim with constraints.
2. **Prototype:** smallest viable demo that exercises the claim.
3. **Instrumentation:** logs, measurements, and a11y checks.
4. **Review:** document trade-offs, failure modes, and adoption risks.
5. **Promotion or retirement:** if it holds up, it becomes a “standard” with contracts and examples; otherwise it remains a reference.

---

## Stack (so you can run and inspect)

- **Framework:** Next.js 15 (App Router), TypeScript strict
- **Content & Auth:** Supabase (RLS), Tiptap for rich documentation
- **Styling:** CSS variables and SCSS, design tokens driving themes
- **Motion:** GSAP, reduced-motion aware patterns
- **Instrumentation:** Core Web Vitals, lightweight analytics

### Quick start

```bash
git clone https://github.com/darianrosebrook/portfolio.git
cd portfolio
npm install

cp .env.example .env.local
# Add Supabase credentials

npm run dev
```

---

## How to read this repository (by role)

- **Design systems architect:** Start with `/blueprints` for foundations documentation, then examine `components/` for token-driven architecture. Check `utils/designTokens/` for the generation pipeline.
- **Frontend engineer:** Compare any component's source code with its live demo on the site. Look at `.tokens.json` files and their generated `.scss` counterparts to understand the styling approach.
- **Design technologist:** Explore `modules/FontInspector/` for typography analysis tools, `modules/Tiptap/` for content editing, and `utils/` for mathematical utilities used in design calculations.
- **Hiring manager:** Browse the live site to see working examples, then check the source code to understand implementation approaches. The `/work` section shows case studies and project outcomes.

---

## What this demonstrates

- **Token-driven component architecture** where design decisions are encoded as data and automatically generate styles
- **Interactive documentation** that embeds live components alongside explanatory content
- **Mathematical approaches** to design problems like color accessibility, typography analysis, and geometric calculations
- **Integration patterns** between design tools (Figma), content management, and component libraries
- **Accessibility-first implementation** with reduced-motion support and WCAG compliance built into the foundation

Built and maintained by **Darian Rosebrook** — Staff Design Technologist focused on design systems, accessibility, and developer tooling. Live site: **[https://darianrosebrook.com](https://darianrosebrook.com)**.
