/**
 * Foundation: Spacing & Layout Systems
 * Enhanced with educational template structure
 */

import type {
  FoundationPageMetadata,
  FoundationSection,
} from '@/types/foundationContent';
import { generateFoundationMetadata } from '@/utils/metadata/foundationMetadata';
import { createFoundationContent } from '../_lib/contentBuilder';
import { FoundationPage } from '../_lib/pageWrapper';

const pageMetadata: FoundationPageMetadata = {
  title: 'Spacing & Layout Systems',
  description:
    'Learn how to create modular spacing systems and responsive layouts that ensure consistent, accessible, and scalable interfaces across different screen sizes.',
  slug: 'spacing',
  canonicalUrl: 'https://darianrosebrook.com/blueprints/foundations/spacing',
  published_at: new Date().toISOString(),
  modified_at: new Date().toISOString(),
  image: 'https://darianrosebrook.com/darianrosebrook.jpg',
  keywords: 'spacing, layout, grid, responsive design, rhythm',
  learning: {
    learning_level: 'foundation',
    role_relevance: ['design', 'engineering'],
    prerequisites: ['tokens'],
    next_units: ['layout'],
    assessment_required: false,
    estimated_reading_time: 14,
  },
  governance: {
    canonical_version: 'System v1',
    alignment_status: 'aligned',
    last_review_date: new Date().toISOString(),
    next_review_date: new Date(
      Date.now() + 90 * 24 * 60 * 60 * 1000
    ).toISOString(),
  },
  author: {
    name: 'Darian Rosebrook',
    role: 'Staff Design Technologist, Design Systems Architect',
    expertise: ['Spacing Systems', 'Layout', 'Responsive Design'],
    profileUrl: 'https://darianrosebrook.com',
    imageUrl: 'https://darianrosebrook.com/darianrosebrook.jpg',
  },
};

const sections: FoundationSection[] = [
  {
    type: 'meta-header',
    id: 'meta-header',
    order: 1,
    content: null,
  },
  {
    type: 'alignment-notice',
    id: 'alignment-notice',
    order: 2,
    content: null,
  },
  {
    type: 'why-matters',
    id: 'why-matters',
    title: 'Why Spacing Matters',
    order: 3,
    content: (
      <>
        <p>
          Consistent spacing creates visual rhythm and hierarchy in your
          interface. Spacing serves multiple critical functions:
        </p>
        <ul>
          <li>
            <strong>Visual Rhythm:</strong> Creates predictable patterns that
            guide the eye and improve scan-ability
          </li>
          <li>
            <strong>Hierarchy:</strong> Establishes relationships between
            elements through proximity and separation
          </li>
          <li>
            <strong>Readability:</strong> Provides breathing room for text and
            content, reducing cognitive load
          </li>
          <li>
            <strong>Touch Targets:</strong> Ensures interactive elements are
            appropriately sized for accessibility
          </li>
          <li>
            <strong>Consistency:</strong> Reduces decision fatigue by providing
            a limited set of spacing values
          </li>
        </ul>
        <p>
          A well-designed spacing system treats space as a design material with
          its own vocabulary, rather than arbitrary pixel values chosen ad-hoc.
        </p>
      </>
    ),
  },
  {
    type: 'core-concepts',
    id: 'core-concepts',
    title: 'Core Concepts',
    order: 4,
    content: (
      <>
        <h3>Modular Spacing Scales</h3>
        <p>
          Most design systems use a modular scale based on a base unit. The
          8-point grid is the most widely adopted:
        </p>
        <ul>
          <li>8px (1× base)</li>
          <li>16px (2× base)</li>
          <li>24px (3× base)</li>
          <li>32px (4× base)</li>
          <li>48px (6× base)</li>
          <li>64px (8× base)</li>
        </ul>
        <p>
          <strong>Why 8px?</strong> 8px is divisible by 2 and 4, making it easy
          to align elements. It scales cleanly across screen densities (1x, 2x,
          3x).
        </p>

        <h3>Core vs Semantic Spacing Tokens</h3>
        <p>
          Similar to color tokens, spacing follows a two-layer architecture:
        </p>
        <ul>
          <li>
            <strong>Core tokens:</strong> Raw values like{' '}
            <code>spacing.size.04</code> (8px), <code>spacing.size.06</code>{' '}
            (16px)
          </li>
          <li>
            <strong>Semantic tokens:</strong> Purpose-driven names like{' '}
            <code>padding.container</code>, <code>margin.section</code>,{' '}
            <code>gap.stack</code>
          </li>
        </ul>
        <p>
          Semantic tokens alias core values, describing <em>where</em> and{' '}
          <em>why</em> spacing is used rather than <em>how much</em>.
        </p>

        <h3>Responsive Layout Principles</h3>
        <p>Layout systems must adapt to different screen sizes:</p>
        <ul>
          <li>
            <strong>Mobile-first:</strong> Start with mobile constraints,
            enhance for larger screens
          </li>
          <li>
            <strong>Breakpoints:</strong> Defined viewport widths where layout
            adjusts
          </li>
          <li>
            <strong>Fluid scaling:</strong> Use relative units (rem, %, vw) for
            responsive behavior
          </li>
          <li>
            <strong>Container queries:</strong> Adapt based on component size,
            not just viewport
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'system-roles',
    id: 'system-roles',
    title: 'System Roles: How Spacing Shapes System Success',
    order: 5,
    content: (
      <>
        <h3>Accessibility Impact</h3>
        <p>
          Spacing tokens encode accessibility requirements. Minimum touch target
          sizes (44×44px) are built into dimension tokens. Sufficient spacing
          between interactive elements prevents accidental activation. These
          constraints ensure accessibility by design.
        </p>

        <h3>Visual Consistency Impact</h3>
        <p>
          A limited spacing scale creates visual consistency. When teams use the
          same spacing values throughout the interface, users develop spatial
          memory that makes navigation faster and more intuitive.
        </p>

        <h3>Maintainability Impact</h3>
        <p>
          Semantic spacing tokens make layouts easier to maintain. Changing{' '}
          <code>padding.container</code> updates all containers system-wide.
          This enables rapid iteration while maintaining consistency.
        </p>
      </>
    ),
  },
  {
    type: 'design-code-interplay',
    id: 'design-code-interplay',
    title: 'Design & Code Interplay',
    order: 6,
    content: (
      <>
        <p>
          Spacing bridges design and code. Let's examine how spacing tokens
          transform from design intent to actual layout code.
        </p>

        <h3>Spacing Token Structure</h3>
        <p>
          Spacing tokens follow the same layered architecture as color tokens:
          core → semantic → component. Here's how they're structured:
        </p>

        <pre>
          <code>{`// Core spacing tokens: primitive values
{
  "core": {
    "spacing": {
      "size": {
        "01": "2px",
        "02": "4px",
        "03": "6px",
        "04": "8px",
        "05": "12px",
        "06": "16px",
        "07": "24px",
        "08": "32px"
      }
    }
  }
}

// Semantic spacing tokens: purpose-driven aliases
{
  "semantic": {
    "spacing": {
      "gap": {
        "tight": "{core.spacing.size.02}",
        "default": "{core.spacing.size.04}",
        "loose": "{core.spacing.size.06}"
      },
      "padding": {
        "container": "{core.spacing.size.06}",
        "section": "{core.spacing.size.07}"
      },
      "margin": {
        "section": "{core.spacing.size.07}"
      }
    }
  }
}

// Component spacing tokens: component anatomy
{
  "prefix": "button",
  "tokens": {
    "size": {
      "gap": {
        "default": "{core.spacing.size.04}",
        "small": "{core.spacing.size.03}"
      },
      "padding": {
        "small": "{core.spacing.size.03}",
        "large": "{core.spacing.size.05}"
      }
    }
  }
}`}</code>
        </pre>

        <h3>Spacing in CSS: Variables and Utilities</h3>
        <p>
          Spacing tokens become CSS variables that components use. Here's how
          they're applied:
        </p>

        <pre>
          <code>{`// Generated CSS variables
:root {
  --semantic-spacing-gap-default: var(--core-spacing-size-04);
  --semantic-spacing-padding-container: var(--core-spacing-size-06);
  --button-size-gap-default: var(--core-spacing-size-04);
  --button-size-padding-small: var(--core-spacing-size-03);
}

// Component SCSS uses spacing variables
.button {
  display: inline-flex;
  gap: var(--button-size-gap-default);
  padding: var(--button-size-padding-small) var(--button-size-padding-small);
}

.card {
  padding: var(--semantic-spacing-padding-container);
  margin-bottom: var(--semantic-spacing-margin-section);
}

.card-header {
  margin-bottom: var(--semantic-spacing-gap-stack);
}`}</code>
        </pre>

        <h3>Responsive Spacing Strategies</h3>
        <p>
          Spacing tokens enable responsive layouts through media queries and
          container queries:
        </p>

        <pre>
          <code>{`// Responsive spacing with media queries
.card {
  padding: var(--semantic-spacing-padding-container);
  
  @media (min-width: 768px) {
    padding: var(--semantic-spacing-padding-container-large);
  }
}

// Container-based spacing
.stack {
  gap: var(--semantic-spacing-gap-default);
  
  @container (min-width: 400px) {
    gap: var(--semantic-spacing-gap-loose);
  }
}

// Using CSS custom properties for dynamic spacing
.layout {
  --spacing-gap: var(--semantic-spacing-gap-default);
  
  @media (min-width: 768px) {
    --spacing-gap: var(--semantic-spacing-gap-loose);
  }
  
  gap: var(--spacing-gap);
}`}</code>
        </pre>

        <h3>Spacing Utilities: Composition Patterns</h3>
        <p>
          Spacing utilities provide consistent spacing patterns across
          components:
        </p>

        <pre>
          <code>{`// Utility classes for common spacing patterns
.stack {
  display: flex;
  flex-direction: column;
  gap: var(--semantic-spacing-gap-stack);
}

.inline {
  display: flex;
  flex-direction: row;
  gap: var(--semantic-spacing-gap-inline);
}

.container {
  padding: var(--semantic-spacing-padding-container);
}

// Usage in components:
<div className="stack">
  <Card />
  <Card />
  <Card />
</div>

// Consistent spacing without manual margin management`}</code>
        </pre>

        <h3>Card Component: Spacing in Practice</h3>
        <p>
          The Card component demonstrates how spacing tokens create consistent
          rhythm:
        </p>

        <pre>
          <code>{`// Card component with spacing tokens
.card {
  padding: var(--semantic-spacing-padding-container);
  margin-bottom: var(--semantic-spacing-margin-section);
}

.card-header {
  margin-bottom: var(--semantic-spacing-gap-stack);
  
  .card-title {
    margin-bottom: var(--semantic-spacing-gap-tight);
  }
}

.card-body {
  margin-bottom: var(--semantic-spacing-gap-default);
}

.card-footer {
  margin-top: var(--semantic-spacing-gap-default);
  padding-top: var(--semantic-spacing-gap-default);
  border-top: 1px solid var(--semantic-color-border-light);
}

// Benefits:
// - Consistent spacing across all cards
// - Easy to adjust spacing globally
// - Self-documenting code (semantic names)
// - Responsive through token changes`}</code>
        </pre>

        <h3>Spacing Scale: Visual Rhythm</h3>
        <p>
          The spacing scale creates visual rhythm. Understanding the scale helps
          you choose appropriate tokens:
        </p>

        <pre>
          <code>{`// Spacing scale creates visual hierarchy
// Small gaps: Related elements
gap: var(--core-spacing-size-02); // 4px - Tight, related items

// Default gaps: Standard relationships
gap: var(--core-spacing-size-04); // 8px - Standard spacing

// Large gaps: Sections and groups
gap: var(--core-spacing-size-06); // 16px - Section separation

// Extra large: Major sections
gap: var(--core-spacing-size-08); // 32px - Page sections

// Rule of thumb:
// - Use smaller gaps for related elements
// - Use larger gaps for distinct sections
// - Maintain consistent gaps within the same level
// - Increase gaps as you move up the hierarchy`}</code>
        </pre>

        <h3>Real-World Impact</h3>
        <p>
          Spacing tokens ensure visual consistency across the entire system.
          When a designer specifies spacing in Figma, that same spacing appears
          in code. When spacing needs to change, updating tokens updates all
          components automatically. This is spacing as infrastructure: built-in
          consistency, not manual alignment.
        </p>

        <p>
          Understanding spacing tokens helps practitioners create layouts with
          consistent rhythm, maintain visual hierarchy, and enable system-wide
          spacing updates through token changes.
        </p>
      </>
    ),
  },
  {
    type: 'applied-example',
    id: 'applied-example',
    title: 'Applied Example: Building a Card Component with Spacing Tokens',
    order: 7,
    content: (
      <>
        <p>
          Let's build a card component using spacing tokens, demonstrating the
          spacing system in action:
        </p>

        <h3>Step 1: Analyze Spacing Needs</h3>
        <p>Identify all spacing requirements for the card:</p>
        <ul>
          <li>
            <strong>Internal padding:</strong> Space inside card around content
          </li>
          <li>
            <strong>External margin:</strong> Space between cards
          </li>
          <li>
            <strong>Header spacing:</strong> Space below card header
          </li>
          <li>
            <strong>Content gaps:</strong> Space between content sections
          </li>
          <li>
            <strong>Footer spacing:</strong> Space above card footer
          </li>
        </ul>

        <h3>Step 2: Map to Spacing Tokens</h3>
        <p>Identify which semantic tokens describe these spacing needs:</p>
        <pre>
          <code>{`// Map spacing needs to semantic tokens:
// Internal padding → semantic.spacing.padding.container
// External margin → semantic.spacing.margin.section
// Header spacing → semantic.spacing.gap.stack
// Content gaps → semantic.spacing.gap.default
// Footer spacing → semantic.spacing.gap.stack`}</code>
        </pre>

        <h3>Step 3: Start with Basic Card Structure</h3>
        <p>Build the card with spacing tokens:</p>
        <pre>
          <code>{`// ✅ Step 1: Card container with semantic spacing
.card {
  /* Internal padding: space inside card */
  padding: var(--semantic-spacing-padding-container);
  
  /* External margin: space between cards */
  margin-bottom: var(--semantic-spacing-margin-section);
  
  background: var(--semantic-color-background-primary);
  border-radius: var(--semantic-shape-radius-medium);
  box-shadow: var(--semantic-shadow-card);
}

// Benefits:
// - Self-documenting: spacing purpose is clear
// - Consistent: all cards use same spacing
// - Maintainable: change token, update all cards`}</code>
        </pre>

        <h3>Step 4: Add Header Spacing</h3>
        <p>Use semantic tokens for header spacing:</p>
        <pre>
          <code>{`// ✅ Step 2: Card header with semantic spacing
.card-header {
  /* Stack spacing: vertical spacing between related elements */
  margin-bottom: var(--semantic-spacing-gap-stack);
  
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  margin: 0; /* Remove default margin */
  font-size: var(--semantic-typography-size-heading);
  font-weight: var(--semantic-typography-weight-bold);
}

// Benefits:
// - Semantic gap-stack indicates vertical relationship
// - Consistent header spacing across all cards
// - Clear visual hierarchy`}</code>
        </pre>

        <h3>Step 5: Handle Content Spacing</h3>
        <p>Use tokens for content gaps:</p>
        <pre>
          <code>{`// ✅ Step 3: Content sections with semantic spacing
.card-content {
  /* Default gap: standard spacing between content */
  margin-bottom: var(--semantic-spacing-gap-default);
}

.card-content:last-child {
  margin-bottom: 0; /* Remove margin from last element */
}

// For multiple content sections:
.card-content + .card-content {
  margin-top: var(--semantic-spacing-gap-default);
}

// Benefits:
// - Consistent content spacing
// - Semantic tokens describe purpose
// - Easy to adjust globally`}</code>
        </pre>

        <h3>Step 6: Add Footer Spacing</h3>
        <p>Use stack spacing for footer separation:</p>
        <pre>
          <code>{`// ✅ Step 4: Card footer with semantic spacing
.card-footer {
  /* Stack spacing: separates footer from content */
  margin-top: var(--semantic-spacing-gap-stack);
  padding-top: var(--semantic-spacing-gap-stack);
  border-top: 1px solid var(--semantic-color-border-default);
  
  display: flex;
  justify-content: flex-end;
  gap: var(--semantic-spacing-gap-tight);
}

// Benefits:
// - Clear separation between content and footer
// - Consistent footer spacing across cards
// - Semantic gap-stack indicates vertical relationship`}</code>
        </pre>

        <h3>Step 7: Responsive Spacing</h3>
        <p>Adapt spacing for different screen sizes:</p>
        <pre>
          <code>{`// ✅ Step 5: Responsive spacing tokens
.card {
  padding: var(--semantic-spacing-padding-container);
  margin-bottom: var(--semantic-spacing-margin-section);
  
  @media (min-width: 768px) {
    /* Larger spacing on desktop */
    padding: var(--semantic-spacing-padding-container-large);
    margin-bottom: var(--semantic-spacing-margin-section-large);
  }
  
  @media (min-width: 1024px) {
    /* Even larger spacing on large screens */
    padding: var(--semantic-spacing-padding-container-xl);
  }
}

// Benefits:
// - Appropriate spacing per screen size
// - Semantic tokens adapt to context
// - Maintains visual rhythm across breakpoints`}</code>
        </pre>

        <h3>Step 8: Complete Card Component</h3>
        <p>Final card component with all spacing tokens:</p>
        <pre>
          <code>{`// ✅ Complete card component with spacing tokens
.card {
  /* Container spacing */
  padding: var(--semantic-spacing-padding-container);
  margin-bottom: var(--semantic-spacing-margin-section);
  
  /* Styling */
  background: var(--semantic-color-background-primary);
  border-radius: var(--semantic-shape-radius-medium);
  box-shadow: var(--semantic-shadow-card);
  
  /* Responsive spacing */
  @media (min-width: 768px) {
    padding: var(--semantic-spacing-padding-container-large);
    margin-bottom: var(--semantic-spacing-margin-section-large);
  }
}

.card-header {
  margin-bottom: var(--semantic-spacing-gap-stack);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-content {
  margin-bottom: var(--semantic-spacing-gap-default);
}

.card-content:last-child {
  margin-bottom: 0;
}

.card-footer {
  margin-top: var(--semantic-spacing-gap-stack);
  padding-top: var(--semantic-spacing-gap-stack);
  border-top: 1px solid var(--semantic-color-border-default);
  display: flex;
  gap: var(--semantic-spacing-gap-tight);
}

// Benefits:
// - All spacing uses semantic tokens
// - Self-documenting code
// - System-wide updates possible
// - Responsive spacing handled
// - Consistent visual rhythm`}</code>
        </pre>

        <h3>Real-World Impact</h3>
        <p>This spacing implementation demonstrates:</p>
        <ul>
          <li>
            <strong>Semantic clarity:</strong> Spacing tokens describe purpose,
            not values
          </li>
          <li>
            <strong>Consistency:</strong> All cards use same spacing values
          </li>
          <li>
            <strong>Maintainability:</strong> Change tokens, update all cards
            automatically
          </li>
          <li>
            <strong>Responsive design:</strong> Spacing adapts to screen size
            through semantic tokens
          </li>
          <li>
            <strong>Visual rhythm:</strong> Consistent spacing creates
            harmonious layouts
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'constraints-tradeoffs',
    title: 'Constraints & Trade-offs',
    order: 8,
    content: (
      <>
        <p>Spacing systems involve tradeoffs:</p>
        <ul>
          <li>
            <strong>Granularity vs. Simplicity:</strong> More spacing values
            provide flexibility but increase cognitive load. Fewer values are
            simpler but may require compromises.
          </li>
          <li>
            <strong>Semantic vs. Direct:</strong> Semantic tokens require
            learning but provide flexibility. Direct values are immediate but
            lock in assumptions.
          </li>
          <li>
            <strong>Grid vs. Fluid:</strong> Grid systems provide structure but
            can feel rigid. Fluid systems feel natural but require more
            discipline.
          </li>
        </ul>
        <p>
          The key is finding the right level of structure for your system's
          needs.
        </p>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'spacing-anti-patterns',
    title: 'Spacing Anti-Patterns & Inconsistency',
    order: 8.5,
    content: (
      <>
        <p>
          Understanding spacing anti-patterns helps avoid common mistakes that
          create visual inconsistency:
        </p>

        <h3>1. Magic Numbers</h3>
        <p>
          <strong>The Problem:</strong> Using hardcoded spacing values instead
          of tokens.
        </p>
        <pre>
          <code>{`// ❌ Anti-pattern: magic numbers
.card {
  padding: 16px;
  margin-bottom: 24px;
}

.header {
  padding: 12px;
  margin-bottom: 20px;
}

// Problems:
// - Inconsistent spacing values
// - Hard to maintain globally
// - No relationship to system
// - Breaks visual rhythm

// ✅ Correct: spacing tokens
.card {
  padding: var(--semantic-spacing-padding-container);
  margin-bottom: var(--semantic-spacing-margin-section);
}

.header {
  padding: var(--semantic-spacing-padding-medium);
  margin-bottom: var(--semantic-spacing-gap-stack);
}

// Benefits:
// - Consistent spacing values
// - System-wide updates possible
// - Clear relationship to system
// - Maintains visual rhythm`}</code>
        </pre>

        <h3>2. Inconsistent Spacing Scale</h3>
        <p>
          <strong>The Problem:</strong> Mixing different spacing scales or
          breaking the rhythm.
        </p>
        <pre>
          <code>{`// ❌ Anti-pattern: inconsistent scale
// Mixing 8px, 10px, 12px, 15px, 16px, 24px
.card {
  padding: 15px;      /* Not in scale */
  margin: 10px;       /* Not in scale */
  gap: 12px;         /* Not in scale */
}

// Problems:
// - No clear rhythm
// - Hard to predict spacing
// - Visual inconsistency
// - Breaks system harmony

// ✅ Correct: consistent spacing scale
// 8px base unit: 8, 16, 24, 32, 40, 48...
.card {
  padding: var(--core-spacing-size-06);  /* 16px */
  margin: var(--core-spacing-size-04);   /* 8px */
  gap: var(--core-spacing-size-06);      /* 16px */
}

// Benefits:
// - Clear visual rhythm
// - Predictable spacing
// - Visual consistency
// - System harmony`}</code>
        </pre>

        <h3>3. Wrong Spacing for Context</h3>
        <p>
          <strong>The Problem:</strong> Using inappropriate spacing values for
          the context.
        </p>
        <pre>
          <code>{`// ❌ Anti-pattern: wrong spacing for context
// Using large spacing for tight relationships
.field-group {
  gap: var(--semantic-spacing-gap-section);  /* Too large */
}

.field {
  padding: var(--semantic-spacing-padding-section);  /* Too large */
}

// Problems:
// - Elements feel disconnected
// - Wrong visual hierarchy
// - Poor UX
// - Breaks relationships

// ✅ Correct: appropriate spacing for context
// Tight relationships: small gaps
.field-group {
  gap: var(--semantic-spacing-gap-tight);
}

.field {
  padding: var(--semantic-spacing-padding-container);
}

// Benefits:
// - Elements feel related
// - Correct visual hierarchy
// - Better UX
// - Clear relationships`}</code>
        </pre>

        <h3>4. Mixing Margin and Padding</h3>
        <p>
          <strong>The Problem:</strong> Using margin and padding inconsistently,
          creating unpredictable spacing.
        </p>
        <pre>
          <code>{`// ❌ Anti-pattern: mixing margin/padding inconsistently
.card {
  padding: var(--semantic-spacing-padding-container);
  margin-bottom: var(--semantic-spacing-padding-container);  /* Wrong! */
}

.list-item {
  padding: var(--semantic-spacing-padding-container);
  margin-bottom: var(--semantic-spacing-margin-section);  /* Inconsistent */
}

// Problems:
// - Unpredictable spacing
// - Hard to reason about
// - Inconsistent patterns
// - Breaks expectations

// ✅ Correct: consistent margin/padding usage
// Padding: internal spacing
.card {
  padding: var(--semantic-spacing-padding-container);
}

// Margin: external spacing between elements
.card {
  margin-bottom: var(--semantic-spacing-margin-section);
}

// Benefits:
// - Predictable spacing
// - Easy to reason about
// - Consistent patterns
// - Clear expectations`}</code>
        </pre>

        <h3>5. Responsive Spacing Failures</h3>
        <p>
          <strong>The Problem:</strong> Not adapting spacing for different
          screen sizes.
        </p>
        <pre>
          <code>{`// ❌ Anti-pattern: fixed spacing everywhere
.card {
  padding: var(--semantic-spacing-padding-container);
  margin-bottom: var(--semantic-spacing-margin-section);
}

// Problems:
// - Too much spacing on mobile
// - Too little spacing on desktop
// - Poor responsive experience
// - No adaptation

// ✅ Correct: responsive spacing
.card {
  padding: var(--semantic-spacing-padding-container);
  margin-bottom: var(--semantic-spacing-margin-section);
  
  @media (min-width: 768px) {
    padding: var(--semantic-spacing-padding-container-large);
    margin-bottom: var(--semantic-spacing-margin-section-large);
  }
}

// Benefits:
// - Appropriate spacing per screen
// - Better responsive experience
// - Adaptive spacing
// - Improved UX`}</code>
        </pre>

        <h3>6. Missing Spacing Utilities</h3>
        <p>
          <strong>The Problem:</strong> Not providing spacing utilities for
          common patterns.
        </p>
        <pre>
          <code>{`// ❌ Anti-pattern: manual spacing everywhere
<div style={{ marginBottom: '16px' }}>
  <Card />
</div>
<div style={{ marginBottom: '16px' }}>
  <Card />
</div>

// Problems:
// - Manual spacing management
// - Inconsistent values
// - Hard to maintain
// - No reusable patterns

// ✅ Correct: spacing utilities
<div className="stack">
  <Card />
  <Card />
  <Card />
</div>

// .stack utility:
.stack {
  display: flex;
  flex-direction: column;
  gap: var(--semantic-spacing-gap-stack);
}

// Benefits:
// - Reusable spacing patterns
// - Consistent values
// - Easy to maintain
// - Clear intent`}</code>
        </pre>

        <h3>Warning Signs</h3>
        <p>Watch for these indicators of spacing problems:</p>
        <ul>
          <li>
            <strong>Magic numbers:</strong> Hardcoded spacing values indicate
            missing token system
          </li>
          <li>
            <strong>Inconsistent scale:</strong> Mixing different spacing values
            indicates lack of rhythm
          </li>
          <li>
            <strong>Wrong context:</strong> Large gaps for related elements
            indicate poor spacing choices
          </li>
          <li>
            <strong>Margin/padding confusion:</strong> Using margin and padding
            inconsistently indicates unclear patterns
          </li>
          <li>
            <strong>No responsive adaptation:</strong> Fixed spacing across all
            screen sizes indicates missing responsive strategy
          </li>
          <li>
            <strong>Manual spacing everywhere:</strong> No spacing utilities
            indicate missing abstraction layer
          </li>
        </ul>

        <h3>Recovery Strategies</h3>
        <p>If you recognize these patterns, here's how to recover:</p>
        <ul>
          <li>
            <strong>Establish spacing scale:</strong> Define a consistent base
            unit (e.g., 8px) and build scale from it
          </li>
          <li>
            <strong>Replace magic numbers:</strong> Audit codebase for hardcoded
            values and replace with tokens
          </li>
          <li>
            <strong>Create spacing utilities:</strong> Build reusable utilities
            for common spacing patterns
          </li>
          <li>
            <strong>Document spacing patterns:</strong> Create guidelines for
            when to use padding vs. margin
          </li>
          <li>
            <strong>Add responsive spacing:</strong> Implement responsive
            spacing strategies for different screen sizes
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'spacing-health-metrics',
    title: 'Warning Signs & Spacing System Health',
    order: 8.75,
    content: (
      <>
        <p>Monitor spacing system health to maintain visual consistency:</p>

        <h3>Consistency Metrics</h3>
        <p>
          <strong>Token Usage Rate:</strong> Percentage of spacing using tokens
          vs. hardcoded values.
        </p>
        <ul>
          <li>
            <strong>Healthy:</strong> {'>'}95% token usage—almost all spacing
            uses tokens
          </li>
          <li>
            <strong>Warning:</strong> 85-95% usage—some hardcoded values
          </li>
          <li>
            <strong>Critical:</strong> {'<'}85% usage—spacing system not adopted
          </li>
        </ul>

        <p>
          <strong>Scale Adherence:</strong> Percentage of spacing values
          following the scale (e.g., 8px grid).
        </p>
        <ul>
          <li>
            <strong>Healthy:</strong> {'>'}95% adherence—consistent scale
          </li>
          <li>
            <strong>Warning:</strong> 85-95% adherence—some off-scale values
          </li>
          <li>
            <strong>Critical:</strong> {'<'}85% adherence—no consistent scale
          </li>
        </ul>

        <h3>Quality Metrics</h3>
        <p>
          <strong>Magic Numbers:</strong> Number of hardcoded spacing values.
        </p>
        <ul>
          <li>
            <strong>Healthy:</strong> Zero—all spacing uses tokens
          </li>
          <li>
            <strong>Warning:</strong> 1-5 magic numbers—some hardcoded values
          </li>
          <li>
            <strong>Critical:</strong> {'>'}5 magic numbers—token system not
            working
          </li>
        </ul>

        <p>
          <strong>Semantic Coverage:</strong> Percentage of spacing using
          semantic tokens vs. core tokens.
        </p>
        <ul>
          <li>
            <strong>Healthy:</strong> {'>'}80% semantic—most spacing uses
            semantic layer
          </li>
          <li>
            <strong>Warning:</strong> 60-80% semantic—some direct core usage
          </li>
          <li>
            <strong>Critical:</strong> {'<'}60% semantic—missing semantic layer
          </li>
        </ul>

        <h3>Responsive Metrics</h3>
        <p>
          <strong>Responsive Adaptation:</strong> Percentage of spacing adapting
          to screen size.
        </p>
        <ul>
          <li>
            <strong>Healthy:</strong> {'>'}70% responsive—most spacing adapts
          </li>
          <li>
            <strong>Warning:</strong> 50-70% responsive—some fixed spacing
          </li>
          <li>
            <strong>Critical:</strong> {'<'}50% responsive—poor responsive
            design
          </li>
        </ul>

        <h3>Early Warning Signs</h3>
        <p>Watch for these indicators of spacing problems:</p>
        <ul>
          <li>
            <strong>Increasing magic numbers:</strong> More hardcoded values
            indicates token adoption failure
          </li>
          <li>
            <strong>Inconsistent spacing:</strong> Same contexts using different
            spacing indicates missing patterns
          </li>
          <li>
            <strong>Scale violations:</strong> Values not in spacing scale
            indicate missing governance
          </li>
          <li>
            <strong>Poor responsive behavior:</strong> Spacing not adapting to
            screen size indicates missing responsive strategy
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'spacing-migration-strategies',
    title: 'Spacing Migration & Evolution Strategies',
    order: 8.9,
    content: (
      <>
        <p>
          Migrating spacing requires systematic approaches to maintain visual
          consistency:
        </p>

        <h3>Hardcoded Values → Tokens</h3>
        <p>Migrate hardcoded spacing to tokens:</p>
        <ol>
          <li>
            <strong>Audit:</strong> Find all hardcoded spacing values (margin,
            padding, gap)
          </li>
          <li>
            <strong>Map to scale:</strong> Identify which spacing scale values
            match
          </li>
          <li>
            <strong>Create semantic tokens:</strong> Define semantic spacing
            tokens (container, section, stack, etc.)
          </li>
          <li>
            <strong>Replace incrementally:</strong> Update components one at a
            time
          </li>
          <li>
            <strong>Verify visual:</strong> Ensure no visual regressions
          </li>
        </ol>

        <h3>Magic Numbers → Semantic Tokens</h3>
        <p>Replace magic numbers with semantic tokens:</p>
        <pre>
          <code>{`// Before: Magic numbers everywhere
.card {
  padding: 16px;
  margin-bottom: 24px;
}

.header {
  padding: 12px;
  margin-bottom: 20px;
}

// After: Semantic tokens
.card {
  padding: var(--semantic-spacing-padding-container);
  margin-bottom: var(--semantic-spacing-margin-section);
}

.header {
  padding: var(--semantic-spacing-padding-medium);
  margin-bottom: var(--semantic-spacing-gap-stack);
}

// Benefits:
// - Self-documenting code
// - Consistent spacing
// - Easy to update globally
// - Clear spacing relationships`}</code>
        </pre>

        <h3>Responsive Spacing Migration</h3>
        <p>Migrate to responsive spacing tokens:</p>
        <pre>
          <code>{`// Before: Fixed spacing
.card {
  padding: 16px;
  margin-bottom: 24px;
}

// After: Responsive spacing tokens
.card {
  padding: var(--semantic-spacing-padding-container);
  margin-bottom: var(--semantic-spacing-margin-section);
  
  @media (min-width: 768px) {
    padding: var(--semantic-spacing-padding-container-large);
    margin-bottom: var(--semantic-spacing-margin-section-large);
  }
}

// Or use CSS custom properties with responsive values:
:root {
  --semantic-spacing-padding-container: 16px;
  --semantic-spacing-margin-section: 24px;
}

@media (min-width: 768px) {
  :root {
    --semantic-spacing-padding-container: 24px;
    --semantic-spacing-margin-section: 32px;
  }
}

// Components automatically adapt to responsive values`}</code>
        </pre>

        <h3>Spacing Scale Evolution</h3>
        <p>Evolve spacing scale without breaking components:</p>
        <ul>
          <li>
            <strong>Add new values:</strong> Extend scale with new tokens
          </li>
          <li>
            <strong>Deprecate old:</strong> Mark old tokens as deprecated
          </li>
          <li>
            <strong>Migrate gradually:</strong> Update components incrementally
          </li>
          <li>
            <strong>Validate:</strong> Ensure visual consistency after changes
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'applied-example',
    id: 'spacing-case-studies',
    title: 'Real-World Spacing Case Studies',
    order: 8.98,
    content: (
      <>
        <p>These case studies demonstrate spacing system improvements:</p>

        <h3>Case Study 1: Magic Numbers Elimination</h3>
        <p>
          <strong>Challenge:</strong> Codebase had 300+ hardcoded spacing
          values, making visual consistency impossible.
        </p>
        <p>
          <strong>Process:</strong>
        </p>
        <ol>
          <li>Audited all spacing values (margin, padding, gap)</li>
          <li>Identified spacing scale (8px grid)</li>
          <li>
            Created semantic spacing tokens (container, section, stack, tight)
          </li>
          <li>Migrated components incrementally</li>
          <li>Added linting rule to prevent new magic numbers</li>
        </ol>
        <p>
          <strong>Results:</strong>
        </p>
        <ul>
          <li>Magic numbers: 300+ → 0</li>
          <li>Visual consistency improved dramatically</li>
          <li>Spacing changes became system-wide (update token, update all)</li>
          <li>New components automatically use consistent spacing</li>
        </ul>

        <h3>Case Study 2: Responsive Spacing Migration</h3>
        <p>
          <strong>Challenge:</strong> Spacing was fixed, causing poor UX on
          mobile devices.
        </p>
        <p>
          <strong>Process:</strong>
        </p>
        <ol>
          <li>Defined responsive spacing tokens (mobile, tablet, desktop)</li>
          <li>Updated spacing system to support responsive values</li>
          <li>Migrated components to use responsive tokens</li>
          <li>Tested across breakpoints</li>
        </ol>
        <p>
          <strong>Results:</strong>
        </p>
        <ul>
          <li>Mobile UX improved (appropriate spacing for screen size)</li>
          <li>Responsive spacing: 0% → 90% of components</li>
          <li>User complaints about mobile spacing: 20/month → 0/month</li>
          <li>Design system became truly responsive</li>
        </ul>

        <h3>Case Study 3: Spacing Scale Standardization</h3>
        <p>
          <strong>Challenge:</strong> Different teams used different spacing
          values (8px, 10px, 12px, 16px, 20px, 24px), breaking visual rhythm.
        </p>
        <p>
          <strong>Process:</strong>
        </p>
        <ol>
          <li>
            Defined standard spacing scale (8px grid: 4, 8, 12, 16, 24, 32, 48,
            64)
          </li>
          <li>Created semantic tokens that map to scale</li>
          <li>Migrated all components to use scale values</li>
          <li>Added validation to enforce scale adherence</li>
        </ol>
        <p>
          <strong>Results:</strong>
        </p>
        <ul>
          <li>Spacing scale adherence: 40% → 98%</li>
          <li>Visual rhythm restored across product</li>
          <li>Designers and developers aligned on spacing</li>
          <li>System became more cohesive and professional</li>
        </ul>
      </>
    ),
  },
  {
    type: 'assessment-prompt',
    id: 'assessment-prompt',
    title: 'Reflection Questions',
    order: 11,
    content: null,
  },
];

const content = createFoundationContent(pageMetadata, sections);

// Add verification checklist
content.verificationChecklist = [
  {
    id: 'spacing-scale',
    label: 'I use a consistent spacing scale (e.g., 8px grid)',
    description: 'Consistent spacing values',
    required: true,
  },
  {
    id: 'semantic-spacing',
    label: 'I use semantic spacing tokens that describe purpose',
    description: 'Purpose-driven spacing',
    required: true,
  },
  {
    id: 'touch-targets',
    label: 'I ensure touch targets meet minimum size requirements (44×44px)',
    description: 'Accessible touch targets',
    required: true,
  },
  {
    id: 'responsive-spacing',
    label: 'I adapt spacing for different screen sizes appropriately',
    description: 'Responsive spacing',
    required: false,
  },
];

// Add assessment prompts
content.assessmentPrompts = [
  {
    question:
      'When should you create a new semantic spacing token versus reusing an existing one? What factors influence this decision?',
    type: 'reflection',
  },
  {
    question:
      'Explain how spacing tokens enable both visual consistency and system-wide updates. Provide a concrete example.',
    type: 'application',
  },
];

// Add cross-references
content.crossReferences = {
  concepts: [
    {
      slug: 'tokens',
      title: 'Design Tokens',
      description: 'How tokens structure spacing systems',
      type: 'foundation',
    },
    {
      slug: 'layout',
      title: 'Layout Foundations',
      description: 'How spacing integrates with layout systems',
      type: 'foundation',
    },
  ],
  components: [],
  glossary: ['spacing', 'grid', 'rhythm'],
};

export const metadata = generateFoundationMetadata(pageMetadata);

export default function SpacingFoundationPage() {
  return <FoundationPage content={content} />;
}
