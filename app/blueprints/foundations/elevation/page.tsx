/**
 * Foundation: Elevation & Shadows
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
  title: 'Elevation & Shadows Foundations',
  description:
    'Learn how to create visual hierarchy and depth with consistent elevation and shadow systems. Understand shadow ramps, z-index systems, and accessibility considerations.',
  slug: 'elevation',
  canonicalUrl: 'https://darianrosebrook.com/blueprints/foundations/elevation',
  published_at: new Date().toISOString(),
  modified_at: new Date().toISOString(),
  image: 'https://darianrosebrook.com/darianrosebrook.jpg',
  keywords: 'elevation, shadows, depth, z-index, visual hierarchy, tokens',
  learning: {
    learning_level: 'foundation',
    role_relevance: ['design', 'engineering', 'a11y'],
    prerequisites: ['tokens', 'color'],
    next_units: ['borders', 'layout'],
    assessment_required: false,
    estimated_reading_time: 12,
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
    expertise: ['Elevation', 'Visual Hierarchy', 'Design Tokens'],
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
    title: 'Why Elevation Matters',
    order: 3,
    content: (
      <>
        <p>
          Elevation and shadows create visual hierarchy and depth in digital
          interfaces. They help users understand spatial relationships, indicate
          interactivity, and establish component layering. When systematized
          properly, elevation serves multiple critical functions:
        </p>
        <ul>
          <li>
            <strong>Visual Hierarchy:</strong> Shadows indicate which elements
            are elevated above others, creating clear visual layering
          </li>
          <li>
            <strong>Depth Perception:</strong> Elevation creates a sense of
            depth, making flat interfaces feel more dimensional and interactive
          </li>
          <li>
            <strong>Component Layering:</strong> Shadows communicate which
            surfaces are above others, essential for modals, dropdowns, and
            overlays
          </li>
          <li>
            <strong>Interactivity Indication:</strong> Elevated surfaces often
            indicate interactive elements like cards and buttons
          </li>
          <li>
            <strong>Focus Management:</strong> Elevation helps draw attention to
            important elements like modals and notifications
          </li>
        </ul>
        <p>
          A well-designed elevation system treats shadows as structured design
          materials with consistent rules, rather than arbitrary visual effects.
          This enables clarity, maintainability, and accessibility across the
          entire design system.
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
        <h3>Shadow Ramps</h3>
        <p>
          Shadows are organized into ramps—progressive scales that create
          consistent depth. Our system uses a two-level shadow ramp:
        </p>
        <ul>
          <li>
            <strong>Level 1:</strong> Subtle shadow for raised surfaces (cards,
            buttons)
            <pre>
              <code>{`0px 1px 3px rgba(0,0,0,0.12), 0px 1px 2px rgba(0,0,0,0.08)`}</code>
            </pre>
          </li>
          <li>
            <strong>Level 2:</strong> Stronger shadow for floating surfaces
            (modals, dropdowns)
            <pre>
              <code>{`0px 3px 6px rgba(0,0,0,0.14), 0px 2px 4px rgba(0,0,0,0.10)`}</code>
            </pre>
          </li>
        </ul>
        <p>
          Shadow ramps ensure consistent depth perception across all elevated
          elements.
        </p>

        <h3>Z-Index System</h3>
        <p>
          Z-index values organize layers in the stacking context. Our system
          uses a depth-based scale:
        </p>
        <ul>
          <li>
            <strong>Depth 0:</strong> Base layer (default stacking)
          </li>
          <li>
            <strong>Depth 1:</strong> Raised surfaces (8px z-index)
          </li>
          <li>
            <strong>Depth 2:</strong> Floating surfaces (16px z-index)
          </li>
          <li>
            <strong>Depth 3:</strong> Overlays (32px z-index)
          </li>
          <li>
            <strong>Depth 4:</strong> Modals (64px z-index)
          </li>
        </ul>
        <p>
          Consistent z-index values prevent stacking conflicts and ensure
          predictable layering.
        </p>

        <h3>Elevation Tokenization</h3>
        <p>
          Elevation tokens follow the same layered architecture as other design
          tokens:
        </p>
        <pre>
          <code>{`// Core elevation tokens: primitive shadow values
{
  "elevation": {
    "level": {
      "1": {
        "$type": "shadow",
        "$value": "0px 1px 3px rgba(0,0,0,0.12), 0px 1px 2px rgba(0,0,0,0.08)"
      },
      "2": {
        "$type": "shadow",
        "$value": "0px 3px 6px rgba(0,0,0,0.14), 0px 2px 4px rgba(0,0,0,0.10)"
      }
    },
    "depth": {
      "0": { "$type": "number", "$value": 0 },
      "1": { "$type": "number", "$value": 8 },
      "2": { "$type": "number", "$value": 16 },
      "3": { "$type": "number", "$value": 32 },
      "4": { "$type": "number", "$value": 64 }
    }
  }
}

// Semantic elevation tokens: contextual usage
{
  "semantic": {
    "elevation": {
      "default": "{elevation.level.1}",
      "surface": {
        "raised": "{elevation.level.1}",
        "floating": "{elevation.level.2}"
      }
    }
  }
}`}</code>
        </pre>

        <h3>Surface Stacking</h3>
        <p>Different surface types use different elevation levels:</p>
        <ul>
          <li>
            <strong>Base surfaces:</strong> No elevation (depth 0)
          </li>
          <li>
            <strong>Raised surfaces:</strong> Cards, panels (level 1, depth 1)
          </li>
          <li>
            <strong>Floating surfaces:</strong> Dropdowns, popovers (level 2,
            depth 2)
          </li>
          <li>
            <strong>Overlays:</strong> Modals, dialogs (level 2, depth 4)
          </li>
        </ul>
        <p>
          Consistent surface stacking ensures predictable layering across the
          interface.
        </p>
      </>
    ),
  },
  {
    type: 'system-roles',
    id: 'system-roles',
    title: 'System Roles: How Elevation Shapes System Success',
    order: 5,
    content: (
      <>
        <h3>Accessibility Impact</h3>
        <p>Elevation must not rely solely on shadows for accessibility:</p>
        <ul>
          <li>
            <strong>Visual cues:</strong> Shadows must be paired with other
            visual cues (color, borders) to indicate elevation
          </li>
          <li>
            <strong>Focus management:</strong> Elevated surfaces require proper
            focus management for keyboard navigation
          </li>
          <li>
            <strong>Screen readers:</strong> Elevation doesn't convey meaning to
            screen readers—use semantic HTML and ARIA
          </li>
          <li>
            <strong>High contrast:</strong> Shadows may not be visible in high
            contrast mode—ensure other visual indicators
          </li>
        </ul>
        <p>
          Accessible elevation ensures all users can understand spatial
          relationships, regardless of visual abilities.
        </p>

        <h3>Hierarchy Impact</h3>
        <p>Consistent elevation creates clear visual hierarchy:</p>
        <ul>
          <li>
            <strong>Importance:</strong> Elevated elements draw attention and
            indicate importance
          </li>
          <li>
            <strong>Relationships:</strong> Elevation communicates parent-child
            relationships between surfaces
          </li>
          <li>
            <strong>Focus:</strong> Higher elevation draws focus to interactive
            or important elements
          </li>
        </ul>
        <p>
          Visual hierarchy reduces cognitive load and makes interfaces easier to
          scan and understand.
        </p>

        <h3>Consistency Impact</h3>
        <p>Unified elevation rules create visual consistency:</p>
        <ul>
          <li>
            <strong>Predictable appearance:</strong> Consistent shadow ramps
            create predictable visual patterns
          </li>
          <li>
            <strong>Maintainability:</strong> Tokenized elevation enables
            system-wide updates through token changes
          </li>
          <li>
            <strong>Scalability:</strong> A limited elevation scale prevents
            design drift and maintains consistency at scale
          </li>
        </ul>
        <p>
          Consistency ensures elevation enhances rather than distracts from the
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
          Elevation bridges design intent and code implementation. Let's examine
          how elevation systems translate from design specifications to working
          code.
        </p>

        <h3>Elevation Token Structure</h3>
        <p>
          Elevation tokens follow the same layered architecture as other design
          tokens:
        </p>
        <pre>
          <code>{`// Core elevation tokens: primitive shadow values
{
  "elevation": {
    "level": {
      "1": {
        "$type": "shadow",
        "$value": "0px 1px 3px rgba(0,0,0,0.12), 0px 1px 2px rgba(0,0,0,0.08)"
      },
      "2": {
        "$type": "shadow",
        "$value": "0px 3px 6px rgba(0,0,0,0.14), 0px 2px 4px rgba(0,0,0,0.10)"
      }
    },
    "depth": {
      "0": { "$type": "number", "$value": 0 },
      "1": { "$type": "number", "$value": 8 },
      "2": { "$type": "number", "$value": 16 },
      "3": { "$type": "number", "$value": 32 },
      "4": { "$type": "number", "$value": 64 }
    }
  }
}

// Semantic elevation tokens: contextual usage
{
  "semantic": {
    "elevation": {
      "default": "{elevation.level.1}",
      "surface": {
        "raised": "{elevation.level.1}",
        "floating": "{elevation.level.2}"
      }
    }
  }
}`}</code>
        </pre>

        <h3>Elevation in CSS</h3>
        <p>Elevation is applied using CSS variables generated from tokens:</p>
        <pre>
          <code>{`// Generated CSS variables
:root {
  --elevation-level-1: 0px 1px 3px rgba(0,0,0,0.12), 0px 1px 2px rgba(0,0,0,0.08);
  --elevation-level-2: 0px 3px 6px rgba(0,0,0,0.14), 0px 2px 4px rgba(0,0,0,0.10);
  --elevation-depth-0: 0;
  --elevation-depth-1: 8;
  --elevation-depth-2: 16;
  --semantic-elevation-default: var(--elevation-level-1);
  --semantic-elevation-surface-raised: var(--elevation-level-1);
  --semantic-elevation-surface-floating: var(--elevation-level-2);
}

// Component SCSS uses elevation variables
.card {
  box-shadow: var(--semantic-elevation-surface-raised);
  z-index: var(--elevation-depth-1);
}

.modal {
  box-shadow: var(--semantic-elevation-surface-floating);
  z-index: var(--elevation-depth-4);
}`}</code>
        </pre>

        <h3>Elevation Patterns: Cards</h3>
        <p>Cards use elevation to indicate interactivity:</p>
        <pre>
          <code>{`// Card component with elevation
.card {
  box-shadow: var(--semantic-elevation-surface-raised);
  z-index: var(--elevation-depth-1);
  background: var(--semantic-color-background-surface);
  border-radius: var(--shape-radius-medium);
  padding: var(--semantic-spacing-padding-container);
}

.card:hover {
  box-shadow: var(--semantic-elevation-surface-floating);
  z-index: var(--elevation-depth-2);
  transition: box-shadow 0.2s ease;
}

.card:active {
  box-shadow: var(--semantic-elevation-surface-raised);
  transform: translateY(1px);
}`}</code>
        </pre>

        <h3>Elevation Patterns: Modals</h3>
        <p>Modals use higher elevation to appear above all content:</p>
        <pre>
          <code>{`// Modal component with elevation
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: var(--elevation-depth-3);
}

.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  box-shadow: var(--semantic-elevation-surface-floating);
  z-index: var(--elevation-depth-4);
  background: var(--semantic-color-background-surface);
  border-radius: var(--shape-radius-large);
  padding: var(--semantic-spacing-padding-container);
}`}</code>
        </pre>

        <h3>Elevation States: Interactive Elements</h3>
        <p>Elevation changes communicate interactive states:</p>
        <pre>
          <code>{`// Button with elevation states
.button {
  box-shadow: var(--semantic-elevation-surface-raised);
  z-index: var(--elevation-depth-1);
  transition: box-shadow 0.2s ease, transform 0.1s ease;
}

.button:hover {
  box-shadow: var(--semantic-elevation-surface-floating);
  z-index: var(--elevation-depth-2);
}

.button:active {
  box-shadow: var(--semantic-elevation-surface-raised);
  transform: translateY(1px);
}

.button:focus {
  box-shadow: var(--semantic-elevation-surface-floating);
  outline: 2px solid var(--semantic-color-border-focus);
  outline-offset: 2px;
}`}</code>
        </pre>

        <h3>Real-World Impact</h3>
        <p>
          A well-tokenized elevation system ensures consistency between design
          and code. When designers specify shadow values in Figma, those same
          shadows appear in code through tokens. When elevation needs to change,
          updating tokens updates all components automatically. This is
          elevation system as infrastructure: built-in consistency, not manual
          styling.
        </p>
        <p>
          Understanding elevation tokens helps practitioners create interfaces
          with clear visual hierarchy, maintain accessibility standards, and
          enable system-wide elevation updates through token changes.
        </p>
      </>
    ),
  },
  {
    type: 'applied-example',
    id: 'applied-example',
    title: 'Applied Example: Building a Modal System',
    order: 7,
    content: (
      <>
        <p>
          Let's build a modal system using elevation tokens, demonstrating
          proper elevation usage:
        </p>

        <h3>Step 1: Define Elevation Tokens</h3>
        <p>Start with core elevation tokens for shadows and z-index:</p>
        <pre>
          <code>{`// core/elevation.tokens.json
{
  "elevation": {
    "level": {
      "1": {
        "$type": "shadow",
        "$value": "0px 1px 3px rgba(0,0,0,0.12), 0px 1px 2px rgba(0,0,0,0.08)"
      },
      "2": {
        "$type": "shadow",
        "$value": "0px 3px 6px rgba(0,0,0,0.14), 0px 2px 4px rgba(0,0,0,0.10)"
      }
    },
    "depth": {
      "0": { "$type": "number", "$value": 0 },
      "1": { "$type": "number", "$value": 8 },
      "2": { "$type": "number", "$value": 16 },
      "3": { "$type": "number", "$value": 32 },
      "4": { "$type": "number", "$value": 64 }
    }
  }
}`}</code>
        </pre>

        <h3>Step 2: Create Semantic Elevation Tokens</h3>
        <p>Define semantic tokens for contextual elevation usage:</p>
        <pre>
          <code>{`// semantic/elevation.tokens.json
{
  "semantic": {
    "elevation": {
      "default": "{elevation.level.1}",
      "surface": {
        "raised": "{elevation.level.1}",
        "floating": "{elevation.level.2}"
      }
    }
  }
}`}</code>
        </pre>

        <h3>Step 3: Implement Modal Component</h3>
        <p>Build a Modal component using elevation tokens:</p>
        <pre>
          <code>{`// Modal component with elevation
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: var(--elevation-depth-3);
  backdrop-filter: blur(4px);
}

.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  box-shadow: var(--semantic-elevation-surface-floating);
  z-index: var(--elevation-depth-4);
  background: var(--semantic-color-background-surface);
  border-radius: var(--shape-radius-large);
  padding: var(--semantic-spacing-padding-container);
  max-width: 500px;
  width: 90%;
}

// Usage
<div className="modal-overlay">
  <div className="modal">
    <h2>Modal Title</h2>
    <p>Modal content</p>
  </div>
</div>`}</code>
        </pre>

        <h3>Benefits of This Approach</h3>
        <ul>
          <li>
            <strong>Consistency:</strong> All elevated elements use the same
            shadow tokens
          </li>
          <li>
            <strong>Accessibility:</strong> Elevation is paired with other
            visual cues (backdrop, focus management)
          </li>
          <li>
            <strong>Maintainability:</strong> Changing elevation updates all
            components system-wide
          </li>
          <li>
            <strong>Predictability:</strong> Z-index values prevent stacking
            conflicts
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
        <p>Elevation systems face several common challenges:</p>

        <h4>Performance Impact</h4>
        <p>Shadows can impact rendering performance:</p>
        <ul>
          <li>
            <strong>Problem:</strong> Multiple shadows and complex shadow
            effects can slow rendering
          </li>
          <li>
            <strong>Solution:</strong> Limit shadow complexity, use CSS
            transforms for elevation changes
          </li>
          <li>
            <strong>Guideline:</strong> Keep shadow definitions simple, avoid
            excessive blur or spread
          </li>
        </ul>

        <h4>Accessibility: Color-Only Indicators</h4>
        <p>Shadows cannot be the sole indicator of elevation:</p>
        <ul>
          <li>
            <strong>Problem:</strong> Shadows may not be visible in high
            contrast mode or for users with visual impairments
          </li>
          <li>
            <strong>Solution:</strong> Pair shadows with borders, background
            colors, or other visual cues
          </li>
          <li>
            <strong>Requirement:</strong> Elevated surfaces must have multiple
            visual indicators
          </li>
        </ul>

        <h4>Platform Differences</h4>
        <p>Shadows render differently across platforms:</p>
        <ul>
          <li>
            <strong>Challenge:</strong> iOS, Android, and web platforms render
            shadows differently
          </li>
          <li>
            <strong>Approach:</strong> Use platform-specific shadow tokens where
            needed, maintain consistent visual appearance
          </li>
          <li>
            <strong>Tradeoff:</strong> Platform-specific tokens add complexity
            but improve visual consistency
          </li>
        </ul>

        <h3>Tradeoffs</h3>
        <p>Elevation system design involves several tradeoffs:</p>

        <h4>Shadow Complexity: Simple vs. Detailed</h4>
        <ul>
          <li>
            <strong>Simple shadows:</strong> Single shadow, better performance,
            but may lack depth
          </li>
          <li>
            <strong>Detailed shadows:</strong> Multiple shadows, more realistic
            depth, but performance impact
          </li>
          <li>
            <strong>Best practice:</strong> Use 2-shadow approach for balance
            between depth and performance
          </li>
        </ul>

        <h4>Elevation Scale: Minimal vs. Comprehensive</h4>
        <ul>
          <li>
            <strong>Minimal scale:</strong> Fewer levels (2-3), easier to
            maintain, but may limit expression
          </li>
          <li>
            <strong>Comprehensive scale:</strong> More levels (5-8), more
            flexibility, but harder to maintain consistency
          </li>
          <li>
            <strong>Best practice:</strong> Start with 2-3 levels, add more only
            if needed
          </li>
        </ul>

        <h4>Shadows vs. Borders</h4>
        <ul>
          <li>
            <strong>Shadows:</strong> Subtle separation, modern aesthetic, but
            may not meet accessibility requirements alone
          </li>
          <li>
            <strong>Borders:</strong> Clear separation, accessible, but can
            create visual noise
          </li>
          <li>
            <strong>Best practice:</strong> Use shadows for elevation, borders
            for functional separation
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
        <p>Continue learning about elevation and related foundations:</p>
        <ul>
          <li>
            <Link href="/blueprints/foundations/tokens">Design Tokens</Link>:
            How tokens structure elevation systems
          </li>
          <li>
            <Link href="/blueprints/foundations/color">Color</Link>: How
            elevation integrates with color system
          </li>
          <li>
            <Link href="/blueprints/foundations/borders">Borders</Link>: When to
            use borders vs. shadows
          </li>
          <li>
            <Link href="/blueprints/foundations/layout">Layout</Link>: How
            elevation works with layout systems
          </li>
          <li>
            <Link href="/blueprints/foundations/accessibility/philosophy">
              Accessibility Philosophy
            </Link>
            : Accessibility-first approach to elevation
          </li>
        </ul>
        <p>
          Related glossary terms:{' '}
          <Link href="/blueprints/glossary#elevation">Elevation</Link>,{' '}
          <Link href="/blueprints/glossary#accessibility">Accessibility</Link>,{' '}
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
      description: 'How tokens structure elevation systems',
      type: 'foundation',
    },
    {
      slug: 'color',
      title: 'Color',
      description: 'How elevation integrates with color system',
      type: 'foundation',
    },
    {
      slug: 'borders',
      title: 'Borders',
      description: 'When to use borders vs. shadows',
      type: 'foundation',
    },
  ],
  components: [],
  glossary: ['elevation', 'accessibility', 'tokens'],
};

// Add verification checklist
content.verificationChecklist = [
  {
    id: 'elevation-shadow-tokens',
    label: 'Shadow tokens defined',
    description: 'Core elevation shadow tokens are defined',
    required: true,
  },
  {
    id: 'elevation-z-index-tokens',
    label: 'Z-index tokens defined',
    description: 'Elevation depth (z-index) tokens are defined',
    required: true,
  },
  {
    id: 'elevation-accessibility',
    label: 'Accessibility requirements met',
    description: 'Elevation is paired with other visual cues (borders, colors)',
    required: true,
  },
  {
    id: 'elevation-focus-management',
    label: 'Focus management implemented',
    description:
      'Elevated surfaces have proper focus management for keyboard navigation',
    required: true,
  },
];

// Add assessment prompts
content.assessmentPrompts = [
  {
    question:
      'When should you use shadows versus borders for visual separation? Provide examples.',
    type: 'reflection',
  },
  {
    question:
      'Explain how elevation tokens enable both visual hierarchy and accessibility. Provide a concrete example.',
    type: 'application',
  },
  {
    question:
      'What are the tradeoffs between minimal and comprehensive elevation scales? When would you choose each approach?',
    type: 'reflection',
  },
];

export const metadata = generateFoundationMetadata(pageMetadata);

export default function ElevationFoundationPage() {
  return <FoundationPage content={content} />;
}
