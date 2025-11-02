/**
 * Foundation: Radius & Shape
 * Enhanced with educational template structure
 */

import type {
  FoundationPageMetadata,
  FoundationSection,
} from '@/types/foundationContent';
import { generateFoundationMetadata } from '@/utils/metadata/foundationMetadata';
import Link from 'next/link';
import { createFoundationContent } from '../_lib/contentBuilder';
import { FoundationPage } from '../_lib/pageWrapper';

const pageMetadata: FoundationPageMetadata = {
  title: 'Radius & Shape Foundations',
  description:
    'Learn how to create a consistent system of border radius and shapes for brand identity, usability, and accessibility. Understand radius scales, usage patterns, and implementation best practices.',
  slug: 'radius',
  canonicalUrl: 'https://darianrosebrook.com/blueprints/foundations/radius',
  published_at: new Date().toISOString(),
  modified_at: new Date().toISOString(),
  image: 'https://darianrosebrook.com/darianrosebrook.jpg',
  keywords:
    'radius, border-radius, shape, brand identity, tokens, accessibility',
  learning: {
    learning_level: 'foundation',
    role_relevance: ['design', 'engineering', 'a11y'],
    prerequisites: ['tokens', 'borders'],
    next_units: ['borders', 'icons'],
    assessment_required: false,
    estimated_reading_time: 10,
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
    expertise: ['Radius Systems', 'Brand Identity', 'Design Tokens'],
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
    title: 'Why Radius Matters',
    order: 3,
    content: (
      <>
        <p>
          Border radius and shape tokens define the visual personality of your
          interface. They influence brand identity, usability, and
          accessibility. When systematized properly, radius serves multiple
          critical functions:
        </p>
        <ul>
          <li>
            <strong>Brand Identity:</strong> Radius values contribute to brand
            personality—from sharp and modern to soft and friendly
          </li>
          <li>
            <strong>Visual Hierarchy:</strong> Different radius values can
            indicate component types and importance
          </li>
          <li>
            <strong>Interactivity Indication:</strong> Rounded corners often
            suggest interactive elements like buttons and cards
          </li>
          <li>
            <strong>Visual Consistency:</strong> Consistent radius values create
            visual harmony across the interface
          </li>
          <li>
            <strong>Accessibility:</strong> Appropriate radius values improve
            usability without relying solely on shape for meaning
          </li>
        </ul>
        <p>
          A well-designed radius system treats shape as a structured design
          material with consistent rules, rather than arbitrary visual elements.
          This enables brand expression, maintainability, and accessibility
          across the entire design system.
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
        <h3>Radius Scales</h3>
        <p>
          Border radius values are organized into scales that create consistent
          rounding. Our system uses a progressive scale:
        </p>
        <ul>
          <li>
            <strong>Extra Small (2px):</strong> Subtle rounding for small
            elements
          </li>
          <li>
            <strong>Small (4px):</strong> Default radius for most components
          </li>
          <li>
            <strong>Medium (6px):</strong> Moderate rounding for cards and
            panels
          </li>
          <li>
            <strong>Large (8px):</strong> Prominent rounding for emphasized
            elements
          </li>
          <li>
            <strong>Extra Large (16px):</strong> Significant rounding for hero
            sections
          </li>
          <li>
            <strong>Full (9999px):</strong> Pill shape for buttons and badges
          </li>
        </ul>
        <p>
          Keeping the radius scale limited ensures visual consistency while
          providing enough variation for different use cases.
        </p>

        <h3>Usage Patterns</h3>
        <p>Different components use different radius values:</p>
        <ul>
          <li>
            <strong>Buttons:</strong> Medium radius (6px) or pill shape for
            primary actions
          </li>
          <li>
            <strong>Cards:</strong> Medium to large radius (6-8px) for visual
            interest
          </li>
          <li>
            <strong>Inputs:</strong> Small radius (4px) for subtle rounding
          </li>
          <li>
            <strong>Badges:</strong> Pill shape (full) for compact elements
          </li>
          <li>
            <strong>Modals:</strong> Large radius (8-16px) for emphasis
          </li>
        </ul>
        <p>
          Consistent usage patterns help users recognize component types through
          shape alone.
        </p>

        <h3>Radius Tokenization</h3>
        <p>
          Radius tokens follow the same layered architecture as other design
          tokens:
        </p>
        <pre>
          <code>{`// Core radius tokens: primitive values
{
  "shape": {
    "radius": {
      "none": { "$type": "borderRadius", "$value": "0" },
      "01": { "$type": "borderRadius", "$value": "2px" },
      "02": { "$type": "borderRadius", "$value": "4px" },
      "medium": { "$type": "borderRadius", "$value": "6px" },
      "03": { "$type": "borderRadius", "$value": "8px" },
      "04": { "$type": "borderRadius", "$value": "16px" },
      "05": { "$type": "borderRadius", "$value": "32px" },
      "full": { "$type": "borderRadius", "$value": "9999px" }
    }
  }
}

// Semantic radius tokens: contextual usage
{
  "semantic": {
    "shape": {
      "radius": {
        "extraSmall": "{shape.radius.01}",
        "small": "{shape.radius.02}",
        "medium": "{shape.radius.03}",
        "large": "{shape.radius.04}",
        "extraLarge": "{shape.radius.05}",
        "full": "{shape.radius.full}",
        "default": "{shape.radius.02}"
      },
      "control": {
        "radius": {
          "default": "{shape.radius.medium}",
          "pill": "{shape.radius.full}"
        }
      }
    }
  }
}`}</code>
        </pre>

        <h3>Brand Personality</h3>
        <p>Radius values contribute to brand personality:</p>
        <ul>
          <li>
            <strong>Sharp/Modern:</strong> Minimal radius (0-4px) conveys
            precision and professionalism
          </li>
          <li>
            <strong>Friendly/Accessible:</strong> Moderate radius (4-8px)
            conveys approachability
          </li>
          <li>
            <strong>Playful/Expressive:</strong> Large radius (8-16px) conveys
            creativity and fun
          </li>
        </ul>
        <p>
          Choose radius values that align with your brand personality while
          maintaining usability.
        </p>
      </>
    ),
  },
  {
    type: 'system-roles',
    id: 'system-roles',
    title: 'System Roles: How Radius Shapes System Success',
    order: 5,
    content: (
      <>
        <h3>Accessibility Impact</h3>
        <p>Radius must not rely solely on shape for accessibility:</p>
        <ul>
          <li>
            <strong>Shape-only indicators:</strong> Avoid using radius alone to
            indicate interactivity or status
          </li>
          <li>
            <strong>Visual cues:</strong> Pair radius with other visual cues
            (color, borders, shadows) for clear indication
          </li>
          <li>
            <strong>Touch targets:</strong> Rounded corners don't affect touch
            target size requirements
          </li>
          <li>
            <strong>Screen readers:</strong> Radius doesn't convey meaning to
            screen readers—use semantic HTML and ARIA
          </li>
        </ul>
        <p>
          Accessible radius ensures all users can interact with elements,
          regardless of visual abilities.
        </p>

        <h3>Brand Identity Impact</h3>
        <p>Consistent radius creates brand recognition:</p>
        <ul>
          <li>
            <strong>Visual consistency:</strong> Unified radius values create
            cohesive brand expression
          </li>
          <li>
            <strong>Personality:</strong> Radius values contribute to brand
            personality and emotional connection
          </li>
          <li>
            <strong>Differentiation:</strong> Unique radius values help brands
            stand out visually
          </li>
        </ul>
        <p>
          Brand identity through radius helps users recognize and remember your
          product.
        </p>

        <h3>Consistency Impact</h3>
        <p>Unified radius rules create visual consistency:</p>
        <ul>
          <li>
            <strong>Predictable appearance:</strong> Consistent radius values
            create predictable visual patterns
          </li>
          <li>
            <strong>Maintainability:</strong> Tokenized radius enables
            system-wide updates through token changes
          </li>
          <li>
            <strong>Scalability:</strong> A limited radius scale prevents design
            drift and maintains consistency at scale
          </li>
        </ul>
        <p>
          Consistency ensures radius enhances rather than distracts from the
          interface, creating a cohesive user experience.
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
          Radius bridges design intent and code implementation. Let's examine
          how radius systems translate from design specifications to working
          code.
        </p>

        <h3>Radius Token Structure</h3>
        <p>
          Radius tokens follow the same layered architecture as other design
          tokens:
        </p>
        <pre>
          <code>{`// Core radius tokens: primitive values
{
  "shape": {
    "radius": {
      "none": { "$type": "borderRadius", "$value": "0" },
      "01": { "$type": "borderRadius", "$value": "2px" },
      "02": { "$type": "borderRadius", "$value": "4px" },
      "medium": { "$type": "borderRadius", "$value": "6px" },
      "03": { "$type": "borderRadius", "$value": "8px" },
      "04": { "$type": "borderRadius", "$value": "16px" },
      "full": { "$type": "borderRadius", "$value": "9999px" }
    }
  }
}

// Semantic radius tokens: contextual usage
{
  "semantic": {
    "shape": {
      "radius": {
        "small": "{shape.radius.02}",
        "medium": "{shape.radius.03}",
        "large": "{shape.radius.04}",
        "full": "{shape.radius.full}"
      },
      "control": {
        "radius": {
          "default": "{shape.radius.medium}",
          "pill": "{shape.radius.full}"
        }
      }
    }
  }
}`}</code>
        </pre>

        <h3>Radius in CSS</h3>
        <p>Radius is applied using CSS variables generated from tokens:</p>
        <pre>
          <code>{`// Generated CSS variables
:root {
  --shape-radius-none: 0;
  --shape-radius-01: 2px;
  --shape-radius-02: 4px;
  --shape-radius-medium: 6px;
  --shape-radius-03: 8px;
  --shape-radius-04: 16px;
  --shape-radius-full: 9999px;
  --semantic-shape-radius-small: var(--shape-radius-02);
  --semantic-shape-radius-medium: var(--shape-radius-03);
  --semantic-shape-control-radius-default: var(--shape-radius-medium);
  --semantic-shape-control-radius-pill: var(--shape-radius-full);
}

// Component SCSS uses radius variables
.button {
  border-radius: var(--semantic-shape-control-radius-default);
}

.button--pill {
  border-radius: var(--semantic-shape-control-radius-pill);
}

.card {
  border-radius: var(--semantic-shape-radius-medium);
}

.input {
  border-radius: var(--semantic-shape-radius-small);
}`}</code>
        </pre>

        <h3>Radius Patterns: Buttons</h3>
        <p>Buttons use radius to indicate interactivity:</p>
        <pre>
          <code>{`// Button with radius tokens
.button {
  border-radius: var(--semantic-shape-control-radius-default);
  padding: var(--semantic-spacing-padding-button);
}

.button--pill {
  border-radius: var(--semantic-shape-control-radius-pill);
}

.button--sharp {
  border-radius: var(--shape-radius-none);
}`}</code>
        </pre>

        <h3>Radius Patterns: Cards</h3>
        <p>Cards use radius for visual interest:</p>
        <pre>
          <code>{`// Card with radius tokens
.card {
  border-radius: var(--semantic-shape-radius-medium);
  padding: var(--semantic-spacing-padding-container);
  box-shadow: var(--semantic-elevation-surface-raised);
}

.card--large {
  border-radius: var(--semantic-shape-radius-large);
}`}</code>
        </pre>

        <h3>Radius States: Interactive Elements</h3>
        <p>Radius remains consistent across states:</p>
        <pre>
          <code>{`// Button with consistent radius across states
.button {
  border-radius: var(--semantic-shape-control-radius-default);
  transition: background-color 0.2s ease;
}

.button:hover {
  background-color: var(--semantic-color-background-hover);
  // Radius stays the same
}

.button:active {
  background-color: var(--semantic-color-background-active);
  // Radius stays the same
}

.button:focus {
  outline: 2px solid var(--semantic-color-border-focus);
  outline-offset: 2px;
  // Radius stays the same
}`}</code>
        </pre>

        <h3>Real-World Impact</h3>
        <p>
          A well-tokenized radius system ensures consistency between design and
          code. When designers specify radius values in Figma, those same values
          appear in code through tokens. When radius needs to change, updating
          tokens updates all components automatically. This is radius system as
          infrastructure: built-in consistency, not manual styling.
        </p>
        <p>
          Understanding radius tokens helps practitioners create interfaces with
          consistent brand expression, maintain usability standards, and enable
          system-wide radius updates through token changes.
        </p>
      </>
    ),
  },
  {
    type: 'applied-example',
    id: 'applied-example',
    title: 'Applied Example: Building a Unified Radius System',
    order: 7,
    content: (
      <>
        <p>
          Let's build a unified radius system using radius tokens, demonstrating
          proper radius usage:
        </p>

        <h3>Step 1: Define Radius Tokens</h3>
        <p>Start with core radius tokens for the scale:</p>
        <pre>
          <code>{`// core/shape.tokens.json
{
  "shape": {
    "radius": {
      "none": { "$type": "borderRadius", "$value": "0" },
      "01": { "$type": "borderRadius", "$value": "2px" },
      "02": { "$type": "borderRadius", "$value": "4px" },
      "medium": { "$type": "borderRadius", "$value": "6px" },
      "03": { "$type": "borderRadius", "$value": "8px" },
      "04": { "$type": "borderRadius", "$value": "16px" },
      "full": { "$type": "borderRadius", "$value": "9999px" }
    }
  }
}`}</code>
        </pre>

        <h3>Step 2: Create Semantic Radius Tokens</h3>
        <p>Define semantic tokens for contextual usage:</p>
        <pre>
          <code>{`// semantic/shape.tokens.json
{
  "semantic": {
    "shape": {
      "radius": {
        "small": "{shape.radius.02}",
        "medium": "{shape.radius.03}",
        "large": "{shape.radius.04}",
        "full": "{shape.radius.full}"
      },
      "control": {
        "radius": {
          "default": "{shape.radius.medium}",
          "pill": "{shape.radius.full}"
        }
      }
    }
  }
}`}</code>
        </pre>

        <h3>Step 3: Apply Radius to Components</h3>
        <p>Use radius tokens in components:</p>
        <pre>
          <code>{`// Button component
.button {
  border-radius: var(--semantic-shape-control-radius-default);
}

.button--pill {
  border-radius: var(--semantic-shape-control-radius-pill);
}

// Card component
.card {
  border-radius: var(--semantic-shape-radius-medium);
}

// Input component
.input {
  border-radius: var(--semantic-shape-radius-small);
}

// Badge component
.badge {
  border-radius: var(--semantic-shape-radius-full);
}`}</code>
        </pre>

        <h3>Benefits of This Approach</h3>
        <ul>
          <li>
            <strong>Consistency:</strong> All components use the same radius
            tokens
          </li>
          <li>
            <strong>Brand identity:</strong> Radius values contribute to brand
            personality
          </li>
          <li>
            <strong>Maintainability:</strong> Changing radius updates all
            components system-wide
          </li>
          <li>
            <strong>Accessibility:</strong> Radius is paired with other visual
            cues for clear indication
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'constraints-tradeoffs',
    title: 'Constraints & Tradeoffs',
    order: 8,
    content: (
      <>
        <h3>Common Challenges</h3>
        <p>Radius systems face several common challenges:</p>

        <h4>Over-Rounding</h4>
        <p>Excessive radius can reduce usability:</p>
        <ul>
          <li>
            <strong>Problem:</strong> Too much rounding can make interfaces feel
            childish or unprofessional
          </li>
          <li>
            <strong>Solution:</strong> Use moderate radius values, reserve large
            radius for specific use cases
          </li>
          <li>
            <strong>Guideline:</strong> Keep radius proportional to element size
          </li>
        </ul>

        <h4>Accessibility: Shape-Only Indicators</h4>
        <p>Radius cannot be the sole indicator of interactivity:</p>
        <ul>
          <li>
            <strong>Problem:</strong> Users may not recognize rounded corners as
            interactive cues
          </li>
          <li>
            <strong>Solution:</strong> Pair radius with other visual cues
            (color, borders, shadows, hover states)
          </li>
          <li>
            <strong>Requirement:</strong> Interactive elements must have
            multiple visual indicators
          </li>
        </ul>

        <h4>Performance: Large Radius Values</h4>
        <p>Very large radius values can impact rendering:</p>
        <ul>
          <li>
            <strong>Challenge:</strong> Large radius values require more
            computation for rendering
          </li>
          <li>
            <strong>Approach:</strong> Use reasonable radius values, avoid
            extremely large values except for pill shapes
          </li>
          <li>
            <strong>Tradeoff:</strong> Visual expression vs. performance
            considerations
          </li>
        </ul>

        <h3>Tradeoffs</h3>
        <p>Radius system design involves several tradeoffs:</p>

        <h4>Minimal vs. Expressive Radius</h4>
        <ul>
          <li>
            <strong>Minimal radius:</strong> Modern, professional, but may feel
            cold or sterile
          </li>
          <li>
            <strong>Expressive radius:</strong> Friendly, approachable, but may
            feel less professional
          </li>
          <li>
            <strong>Best practice:</strong> Choose radius values that align with
            brand personality while maintaining usability
          </li>
        </ul>

        <h4>Consistent vs. Varied Radius</h4>
        <ul>
          <li>
            <strong>Consistent radius:</strong> Unified appearance, easier to
            maintain, but may limit expression
          </li>
          <li>
            <strong>Varied radius:</strong> More expressive, better hierarchy,
            but harder to maintain consistency
          </li>
          <li>
            <strong>Best practice:</strong> Use consistent radius within
            component types, vary across component types
          </li>
        </ul>

        <h4>Sharp vs. Rounded</h4>
        <ul>
          <li>
            <strong>Sharp corners:</strong> Modern, precise, but may feel harsh
          </li>
          <li>
            <strong>Rounded corners:</strong> Friendly, approachable, but may
            feel less serious
          </li>
          <li>
            <strong>Best practice:</strong> Use moderate rounding for balance
            between modern and friendly
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'additional-resources',
    id: 'additional-resources',
    title: 'Additional Resources',
    order: 9,
    content: (
      <>
        <p>Continue learning about radius and related foundations:</p>
        <ul>
          <li>
            <Link href="/blueprints/foundations/tokens">Design Tokens</Link>:
            How tokens structure radius systems
          </li>
          <li>
            <Link href="/blueprints/foundations/borders">Borders</Link>: How
            radius works with borders
          </li>
          <li>
            <Link href="/blueprints/foundations/icons">Icons</Link>: How radius
            integrates with icon systems
          </li>
          <li>
            <Link href="/blueprints/foundations/accessibility/philosophy">
              Accessibility Philosophy
            </Link>
            : Accessibility-first approach to radius
          </li>
        </ul>
        <p>
          Related glossary terms:{' '}
          <Link href="/blueprints/glossary#radius">Radius</Link>,{' '}
          <Link href="/blueprints/glossary#brand">Brand Identity</Link>,{' '}
          <Link href="/blueprints/glossary#tokens">Design Tokens</Link>
        </p>
      </>
    ),
  },
];

const content = createFoundationContent(pageMetadata, sections);

// Add cross-references
content.crossReferences = {
  concepts: [
    {
      slug: 'tokens',
      title: 'Design Tokens',
      description: 'How tokens structure radius systems',
      type: 'foundation',
    },
    {
      slug: 'borders',
      title: 'Borders',
      description: 'How radius works with borders',
      type: 'foundation',
    },
    {
      slug: 'icons',
      title: 'Icons',
      description: 'How radius integrates with icon systems',
      type: 'foundation',
    },
  ],
  components: [],
  glossary: ['radius', 'brand', 'tokens'],
};

// Add verification checklist
content.verificationChecklist = [
  {
    id: 'radius-scale-tokens',
    label: 'Radius scale tokens defined',
    description: 'Core radius scale tokens are defined',
    required: true,
  },
  {
    id: 'radius-semantic-tokens',
    label: 'Semantic radius tokens defined',
    description: 'Semantic radius tokens for contextual usage are defined',
    required: true,
  },
  {
    id: 'radius-accessibility',
    label: 'Accessibility requirements met',
    description:
      'Radius is paired with other visual cues (color, borders) for clear indication',
    required: true,
  },
  {
    id: 'radius-brand-consistency',
    label: 'Brand consistency maintained',
    description:
      'Radius values align with brand personality while maintaining usability',
    required: true,
  },
];

// Add assessment prompts
content.assessmentPrompts = [
  {
    question:
      'When should you use different radius values for different component types? Provide examples.',
    type: 'reflection',
  },
  {
    question:
      'Explain how radius tokens enable both brand expression and consistency. Provide a concrete example.',
    type: 'application',
  },
  {
    question:
      'What are the tradeoffs between minimal and expressive radius values? How do they affect brand perception?',
    type: 'reflection',
  },
];

export const metadata = generateFoundationMetadata(pageMetadata);

export default function RadiusFoundationPage() {
  return <FoundationPage content={content} />;
}
