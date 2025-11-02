/**
 * Foundation: Borders & Strokes
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
  title: 'Borders & Strokes Foundations',
  description:
    'Learn how to implement a consistent system of borders and strokes for visual separation, component boundaries, and accessibility. Understand border tokenization, usage patterns, and implementation best practices.',
  slug: 'borders',
  canonicalUrl: 'https://darianrosebrook.com/blueprints/foundations/borders',
  published_at: new Date().toISOString(),
  modified_at: new Date().toISOString(),
  image: 'https://darianrosebrook.com/darianrosebrook.jpg',
  keywords:
    'borders, strokes, dividers, visual separation, tokens, accessibility',
  learning: {
    learning_level: 'foundation',
    role_relevance: ['design', 'engineering', 'a11y'],
    prerequisites: ['tokens', 'color'],
    next_units: ['radius', 'elevation'],
    assessment_required: false,
    estimated_reading_time: 11,
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
    expertise: ['Borders', 'Visual Separation', 'Design Tokens'],
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
    title: 'Why Borders Matter',
    order: 3,
    content: (
      <>
        <p>
          Borders and strokes define boundaries, create visual separation, and
          establish component hierarchy. When systematized properly, borders
          serve multiple critical functions:
        </p>
        <ul>
          <li>
            <strong>Visual Separation:</strong> Borders create clear boundaries
            between elements, improving scan-ability and reducing visual noise
          </li>
          <li>
            <strong>Component Boundaries:</strong> Borders define the edges of
            components, making them recognizable as distinct units
          </li>
          <li>
            <strong>Hierarchy Indication:</strong> Border weight and style
            communicate importance and relationships between elements
          </li>
          <li>
            <strong>State Communication:</strong> Borders indicate interactive
            states (focus, error, disabled) and provide visual feedback
          </li>
          <li>
            <strong>Accessibility:</strong> Visible borders ensure interactive
            elements are clearly identified, especially for users with visual
            impairments
          </li>
        </ul>
        <p>
          A well-designed border system treats borders as structured design
          materials with consistent rules, rather than arbitrary visual
          elements. This enables clarity, maintainability, and accessibility
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
        <h3>Border Width Scales</h3>
        <p>
          Borders must scale consistently across different contexts. Our system
          uses a standardized width scale:
        </p>
        <ul>
          <li>
            <strong>Hairline (1px):</strong> Default border width for most
            components, subtle separation
          </li>
          <li>
            <strong>Thick (2px):</strong> Emphasized borders, focus states,
            important separations
          </li>
        </ul>
        <p>
          Keeping the border width scale minimal ensures visual consistency
          while providing enough variation for different use cases.
        </p>

        <h3>Border Styles</h3>
        <p>Border styles communicate different meanings and use cases:</p>
        <ul>
          <li>
            <strong>Solid:</strong> Default style for most borders, creates
            clear separation
          </li>
          <li>
            <strong>Dashed:</strong> Indicates temporary or optional boundaries,
            often used for drag-and-drop zones
          </li>
          <li>
            <strong>Dotted:</strong> Less common, used for subtle separation or
            decorative purposes
          </li>
        </ul>
        <p>
          Border styles should be used consistently to communicate meaning
          rather than purely for aesthetic variation.
        </p>

        <h3>Border Color Tokenization</h3>
        <p>Border colors are tokenized for consistency and theming:</p>
        <pre>
          <code>{`// Core border tokens: primitive values
{
  "shape": {
    "border": {
      "width": {
        "hairline": { "$type": "borderWidth", "$value": "1px" },
        "thick": { "$type": "borderWidth", "$value": "2px" }
      },
      "style": {
        "solid": { "$type": "borderStyle", "$value": "solid" },
        "dashed": { "$type": "borderStyle", "$value": "dashed" }
      }
    }
  }
}

// Semantic border color tokens
{
  "semantic": {
    "color": {
      "border": {
        "default": "{color.palette.neutral.300}",
        "subtle": "{color.palette.neutral.200}",
        "bold": "{color.palette.neutral.400}",
        "disabled": "{color.palette.neutral.200}",
        "focus": "{color.palette.brand.500}",
        "error": "{color.palette.red.500}",
        "success": "{color.palette.green.500}"
      }
    }
  }
}`}</code>
        </pre>

        <h3>Border Radius Integration</h3>
        <p>
          Borders work in conjunction with border radius to create rounded
          corners:
        </p>
        <ul>
          <li>
            <strong>Consistent radius:</strong> Border radius should align with
            the border width to ensure smooth corners
          </li>
          <li>
            <strong>Usage patterns:</strong> Different components use different
            border radius values (buttons, cards, inputs)
          </li>
          <li>
            <strong>Visual harmony:</strong> Border radius and border width
            should work together to create cohesive visual appearance
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'system-roles',
    id: 'system-roles',
    title: 'System Roles: How Borders Shape System Success',
    order: 5,
    content: (
      <>
        <h3>Accessibility Impact</h3>
        <p>Borders must be visible and meet accessibility requirements:</p>
        <ul>
          <li>
            <strong>Contrast ratios:</strong> Borders must meet WCAG contrast
            ratios (3:1) against adjacent surfaces
          </li>
          <li>
            <strong>Visible borders:</strong> Interactive elements must have
            visible borders, especially inputs and buttons
          </li>
          <li>
            <strong>Focus indicators:</strong> Focus borders must be clearly
            visible and meet contrast requirements
          </li>
          <li>
            <strong>Not color-only:</strong> Borders should not rely solely on
            color to convey meaning—pair with other visual cues
          </li>
        </ul>
        <p>
          Accessible borders ensure all users can identify and interact with
          elements, regardless of visual abilities.
        </p>

        <h3>Visual Clarity Impact</h3>
        <p>Consistent borders reduce visual noise and improve clarity:</p>
        <ul>
          <li>
            <strong>Reduced noise:</strong> Subtle borders create separation
            without overwhelming the interface
          </li>
          <li>
            <strong>Clear boundaries:</strong> Borders help users understand
            component boundaries and relationships
          </li>
          <li>
            <strong>Hierarchy:</strong> Border weight and style communicate
            importance and relationships
          </li>
        </ul>
        <p>
          Visual clarity reduces cognitive load and makes interfaces easier to
          scan and understand.
        </p>

        <h3>Consistency Impact</h3>
        <p>Unified border rules create visual consistency:</p>
        <ul>
          <li>
            <strong>Predictable appearance:</strong> Consistent border weights
            create predictable visual patterns
          </li>
          <li>
            <strong>Maintainability:</strong> Tokenized borders enable
            system-wide updates through token changes
          </li>
          <li>
            <strong>Scalability:</strong> A limited border scale prevents design
            drift and maintains consistency at scale
          </li>
        </ul>
        <p>
          Consistency ensures borders enhance rather than distract from the
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
          Borders bridge design intent and code implementation. Let's examine
          how border systems translate from design specifications to working
          code.
        </p>

        <h3>Border Token Structure</h3>
        <p>
          Border tokens follow the same layered architecture as other design
          tokens:
        </p>
        <pre>
          <code>{`// Core border tokens: primitive values
{
  "shape": {
    "border": {
      "width": {
        "hairline": { "$type": "borderWidth", "$value": "1px" },
        "thick": { "$type": "borderWidth", "$value": "2px" }
      },
      "style": {
        "solid": { "$type": "borderStyle", "$value": "solid" },
        "dashed": { "$type": "borderStyle", "$value": "dashed" }
      }
    }
  }
}

// Semantic border tokens: contextual usage
{
  "semantic": {
    "color": {
      "border": {
        "default": "{color.palette.neutral.300}",
        "subtle": "{color.palette.neutral.200}",
        "focus": "{color.palette.brand.500}"
      }
    }
  },
  "shape": {
    "control": {
      "border": {
        "defaultWidth": "{shape.border.width.hairline}",
        "defaultStyle": "{shape.border.style.solid}",
        "focusWidth": "{shape.border.width.thick}"
      }
    }
  }
}`}</code>
        </pre>

        <h3>Border Usage in CSS</h3>
        <p>Borders are applied using CSS variables generated from tokens:</p>
        <pre>
          <code>{`// Generated CSS variables
:root {
  --shape-border-width-hairline: 1px;
  --shape-border-width-thick: 2px;
  --shape-border-style-solid: solid;
  --semantic-color-border-default: var(--color-palette-neutral-300);
  --semantic-color-border-focus: var(--color-palette-brand-500);
}

// Component SCSS uses border variables
.input {
  border-width: var(--shape-control-border-defaultWidth);
  border-style: var(--shape-control-border-defaultStyle);
  border-color: var(--semantic-color-border-default);
}

.input:focus {
  border-width: var(--shape-control-border-focusWidth);
  border-color: var(--semantic-color-border-focus);
}

.divider {
  border-top: var(--shape-border-width-hairline) 
              var(--shape-border-style-solid) 
              var(--semantic-color-border-subtle);
}`}</code>
        </pre>

        <h3>Border Patterns: Dividers</h3>
        <p>Dividers use borders to create visual separation:</p>
        <pre>
          <code>{`// Divider component with border tokens
.divider {
  border-top: var(--shape-border-width-hairline) 
              var(--shape-border-style-solid) 
              var(--semantic-color-border-subtle);
  margin: var(--semantic-spacing-gap-default) 0;
}

.divider--vertical {
  border-top: none;
  border-left: var(--shape-border-width-hairline) 
               var(--shape-border-style-solid) 
               var(--semantic-color-border-subtle);
  margin: 0 var(--semantic-spacing-gap-default);
  height: 100%;
}

// Usage
<div className="card">
  <div className="card-header">Title</div>
  <div className="divider"></div>
  <div className="card-body">Content</div>
</div>`}</code>
        </pre>

        <h3>Border States: Input Focus</h3>
        <p>Borders communicate interactive states:</p>
        <pre>
          <code>{`// Input with border states
.input {
  border-width: var(--shape-control-border-defaultWidth);
  border-style: var(--shape-control-border-defaultStyle);
  border-color: var(--semantic-color-border-default);
  transition: border-color 0.2s ease;
}

.input:hover {
  border-color: var(--semantic-color-border-bold);
}

.input:focus {
  border-width: var(--shape-control-border-focusWidth);
  border-color: var(--semantic-color-border-focus);
  outline: none;
}

.input:disabled {
  border-color: var(--semantic-color-border-disabled);
  opacity: 0.5;
}

.input--error {
  border-color: var(--semantic-color-border-error);
}`}</code>
        </pre>

        <h3>Border with Radius</h3>
        <p>Borders combine with border radius for rounded corners:</p>
        <pre>
          <code>{`// Button with border and radius
.button {
  border-width: var(--shape-control-border-defaultWidth);
  border-style: var(--shape-control-border-defaultStyle);
  border-color: var(--semantic-color-border-default);
  border-radius: var(--shape-control-radius-default);
  padding: var(--semantic-spacing-padding-button);
}

.button--pill {
  border-radius: var(--shape-control-radius-pill);
}

// Card with border and radius
.card {
  border: var(--shape-border-width-hairline) 
          var(--shape-border-style-solid) 
          var(--semantic-color-border-default);
  border-radius: var(--shape-radius-medium);
  padding: var(--semantic-spacing-padding-container);
}`}</code>
        </pre>

        <h3>Real-World Impact</h3>
        <p>
          A well-tokenized border system ensures consistency between design and
          code. When designers specify border widths in Figma, those same widths
          appear in code through tokens. When border styles need to change,
          updating tokens updates all components automatically. This is border
          system as infrastructure: built-in consistency, not manual styling.
        </p>
        <p>
          Understanding border tokens helps practitioners create interfaces with
          clear visual separation, maintain accessibility standards, and enable
          system-wide border updates through token changes.
        </p>
      </>
    ),
  },
  {
    type: 'applied-example',
    id: 'applied-example',
    title: 'Applied Example: Building a Divider System',
    order: 7,
    content: (
      <>
        <p>
          Let's build a divider system using border tokens, demonstrating proper
          border usage:
        </p>

        <h3>Step 1: Define Border Tokens</h3>
        <p>Start with core border tokens for width and style:</p>
        <pre>
          <code>{`// core/shape.tokens.json
{
  "shape": {
    "border": {
      "width": {
        "hairline": { "$type": "borderWidth", "$value": "1px" },
        "thick": { "$type": "borderWidth", "$value": "2px" }
      },
      "style": {
        "solid": { "$type": "borderStyle", "$value": "solid" },
        "dashed": { "$type": "borderStyle", "$value": "dashed" }
      }
    }
  }
}`}</code>
        </pre>

        <h3>Step 2: Create Semantic Border Tokens</h3>
        <p>Define semantic tokens for border colors:</p>
        <pre>
          <code>{`// semantic/color.tokens.json
{
  "semantic": {
    "color": {
      "border": {
        "default": "{color.palette.neutral.300}",
        "subtle": "{color.palette.neutral.200}",
        "bold": "{color.palette.neutral.400}"
      }
    }
  }
}`}</code>
        </pre>

        <h3>Step 3: Implement Divider Component</h3>
        <p>Build a Divider component using border tokens:</p>
        <pre>
          <code>{`// Divider component
.divider {
  border-top: var(--shape-border-width-hairline) 
              var(--shape-border-style-solid) 
              var(--semantic-color-border-subtle);
  margin: var(--semantic-spacing-gap-default) 0;
  border-left: none;
  border-right: none;
  border-bottom: none;
}

.divider--vertical {
  border-top: none;
  border-left: var(--shape-border-width-hairline) 
               var(--shape-border-style-solid) 
               var(--semantic-color-border-subtle);
  border-right: none;
  border-bottom: none;
  margin: 0 var(--semantic-spacing-gap-default);
  height: 100%;
}

.divider--bold {
  border-top-width: var(--shape-border-width-thick);
  border-top-color: var(--semantic-color-border-default);
}

.divider--dashed {
  border-top-style: var(--shape-border-style-dashed);
}

// Usage
<div className="card">
  <div className="card-header">Title</div>
  <div className="divider"></div>
  <div className="card-body">Content</div>
  <div className="divider divider--bold"></div>
  <div className="card-footer">Footer</div>
</div>`}</code>
        </pre>

        <h3>Benefits of This Approach</h3>
        <ul>
          <li>
            <strong>Consistency:</strong> All dividers use the same border
            tokens
          </li>
          <li>
            <strong>Accessibility:</strong> Borders meet contrast requirements
            through semantic color tokens
          </li>
          <li>
            <strong>Maintainability:</strong> Changing border styles updates all
            dividers system-wide
          </li>
          <li>
            <strong>Flexibility:</strong> Variants (bold, dashed) can be created
            through token combinations
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
        <p>Border systems face several common challenges:</p>

        <h4>Over-Use of Borders</h4>
        <p>Excessive borders can create visual noise and clutter:</p>
        <ul>
          <li>
            <strong>Problem:</strong> Too many borders compete for attention and
            reduce visual hierarchy
          </li>
          <li>
            <strong>Solution:</strong> Use borders sparingly, prefer spacing and
            background color for separation when possible
          </li>
          <li>
            <strong>Guideline:</strong> Remove borders if spacing or background
            color can provide sufficient separation
          </li>
        </ul>

        <h4>Contrast Issues</h4>
        <p>Borders must meet accessibility contrast requirements:</p>
        <ul>
          <li>
            <strong>Problem:</strong> Subtle borders may not meet WCAG contrast
            ratios (3:1)
          </li>
          <li>
            <strong>Solution:</strong> Use semantic color tokens that are
            validated for contrast, test borders against backgrounds
          </li>
          <li>
            <strong>Requirement:</strong> Interactive elements must have clearly
            visible borders
          </li>
        </ul>

        <h4>Responsive Border Scaling</h4>
        <p>Borders may need to scale across different screen sizes:</p>
        <ul>
          <li>
            <strong>Challenge:</strong> 1px borders can appear too thin on
            high-density displays
          </li>
          <li>
            <strong>Approach:</strong> Consider device pixel ratio for border
            rendering, use CSS transforms for crisp borders
          </li>
          <li>
            <strong>Tradeoff:</strong> Scalable borders may require device
            detection or CSS media queries
          </li>
        </ul>

        <h3>Tradeoffs</h3>
        <p>Border system design involves several tradeoffs:</p>

        <h4>Width Scale: Minimal vs. Comprehensive</h4>
        <ul>
          <li>
            <strong>Minimal scale:</strong> Fewer options (1px, 2px), easier to
            maintain, but may limit expression
          </li>
          <li>
            <strong>Comprehensive scale:</strong> More options (0.5px, 1px,
            1.5px, 2px, 3px), more flexibility, but harder to maintain
            consistency
          </li>
        </ul>

        <h4>Border vs. Shadow</h4>
        <ul>
          <li>
            <strong>Borders:</strong> Clear separation, accessible, but can
            create visual noise
          </li>
          <li>
            <strong>Shadows:</strong> Subtle separation, modern aesthetic, but
            may not meet accessibility requirements alone
          </li>
          <li>
            <strong>Best practice:</strong> Use borders for functional
            separation, shadows for elevation
          </li>
        </ul>

        <h4>Visible vs. Hidden Borders</h4>
        <ul>
          <li>
            <strong>Visible borders:</strong> Clear boundaries, accessible, but
            can create visual clutter
          </li>
          <li>
            <strong>Hidden borders:</strong> Cleaner appearance, but may reduce
            accessibility and clarity
          </li>
          <li>
            <strong>Guideline:</strong> Always show borders on interactive
            elements, consider hiding decorative borders
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
        <p>Continue learning about borders and related foundations:</p>
        <ul>
          <li>
            <Link href="/blueprints/foundations/tokens">Design Tokens</Link>:
            How tokens structure border systems
          </li>
          <li>
            <Link href="/blueprints/foundations/color">Color</Link>: How border
            colors integrate with the color system
          </li>
          <li>
            <Link href="/blueprints/foundations/radius">Radius</Link>: How
            borders work with border radius
          </li>
          <li>
            <Link href="/blueprints/foundations/elevation">Elevation</Link>:
            When to use borders vs. shadows
          </li>
          <li>
            <Link href="/blueprints/foundations/accessibility/philosophy">
              Accessibility Philosophy
            </Link>
            : Accessibility-first approach to borders
          </li>
        </ul>
        <p>
          Related glossary terms:{' '}
          <Link href="/blueprints/glossary#border">Border</Link>,{' '}
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
      description: 'How tokens structure border systems',
      type: 'foundation',
    },
    {
      slug: 'color',
      title: 'Color',
      description: 'How border colors integrate with color system',
      type: 'foundation',
    },
    {
      slug: 'radius',
      title: 'Radius',
      description: 'How borders work with border radius',
      type: 'foundation',
    },
  ],
  components: [],
  glossary: ['border', 'accessibility', 'tokens'],
};

// Add verification checklist
content.verificationChecklist = [
  {
    id: 'border-width-tokens',
    label: 'Border width tokens defined',
    description: 'Core border width tokens are defined',
    required: true,
  },
  {
    id: 'border-style-tokens',
    label: 'Border style tokens defined',
    description: 'Border style tokens (solid, dashed) are defined',
    required: true,
  },
  {
    id: 'border-contrast',
    label: 'Contrast requirements met',
    description: 'Borders meet WCAG contrast ratios (3:1)',
    required: true,
  },
  {
    id: 'border-interactive-elements',
    label: 'Interactive elements have borders',
    description:
      'All interactive elements have visible borders for accessibility',
    required: true,
  },
];

// Add assessment prompts
content.assessmentPrompts = [
  {
    question:
      'When should you use borders versus spacing or background color for visual separation? Provide examples.',
    type: 'reflection',
  },
  {
    question:
      'Explain how border tokens enable both visual consistency and accessibility. Provide a concrete example.',
    type: 'application',
  },
  {
    question:
      'What are the tradeoffs between minimal and comprehensive border width scales? When would you choose each approach?',
    type: 'reflection',
  },
];

export const metadata = generateFoundationMetadata(pageMetadata);

export default function BordersFoundationPage() {
  return <FoundationPage content={content} />;
}
