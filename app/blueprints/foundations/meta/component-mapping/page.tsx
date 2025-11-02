/**
 * Foundation: Component Mapping
 * Enhanced with educational template structure
 */

import type {
  FoundationPageMetadata,
  FoundationSection,
} from '@/types/foundationContent';
import { generateFoundationMetadata } from '@/utils/metadata/foundationMetadata';
import Link from 'next/link';
import { createFoundationContent } from '../../_lib/contentBuilder';
import { FoundationPage } from '../../_lib/pageWrapper';

const pageMetadata: FoundationPageMetadata = {
  title: 'Component Mapping',
  description:
    'Learn strategies for mapping design tokens to component anatomy for clear, maintainable, and scalable design systems. Understand visual token overlays, component-specific tokens, and documentation patterns.',
  slug: 'component-mapping',
  canonicalUrl:
    'https://darianrosebrook.com/blueprints/foundations/meta/component-mapping',
  published_at: new Date().toISOString(),
  modified_at: new Date().toISOString(),
  image: 'https://darianrosebrook.com/darianrosebrook.jpg',
  keywords:
    'component mapping, token mapping, anatomy, documentation, component tokens',
  learning: {
    learning_level: 'foundation',
    role_relevance: ['design', 'engineering', 'governance'],
    prerequisites: ['tokens', 'component-architecture'],
    next_units: ['token-naming', 'system-vs-style'],
    assessment_required: false,
    estimated_reading_time: 13,
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
    expertise: ['Component Architecture', 'Token Systems', 'Documentation'],
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
    title: 'Why Component Mapping Matters',
    order: 3,
    content: (
      <>
        <p>
          Mapping tokens to component anatomy makes token usage more intuitive
          and helps teams understand how design decisions translate to
          implementation. When systematized properly, component mapping serves
          multiple critical functions:
        </p>
        <ul>
          <li>
            <strong>Token Discoverability:</strong> Clear mappings help teams
            find the right tokens for component parts
          </li>
          <li>
            <strong>Design-Code Alignment:</strong> Visual token overlays show
            exactly which tokens apply to which parts
          </li>
          <li>
            <strong>Onboarding:</strong> Component mapping provides clear mental
            models for new team members
          </li>
          <li>
            <strong>Maintainability:</strong> Documented mappings make it easier
            to understand and update components
          </li>
          <li>
            <strong>Governance:</strong> Clear boundaries help enforce token
            usage and prevent design drift
          </li>
        </ul>
        <p>
          A well-mapped component system treats token mapping as documentation
          that enables rather than restricts creativity. It provides clarity
          that helps teams work effectively across design and code.
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
        <h3>Component Anatomy</h3>
        <p>
          Component anatomy breaks down components into their constituent parts:
        </p>
        <ul>
          <li>
            <strong>Root element:</strong> The outermost container
          </li>
          <li>
            <strong>Child elements:</strong> Internal parts (header, body,
            footer, icon, text)
          </li>
          <li>
            <strong>States:</strong> Different visual states (default, hover,
            active, disabled, focus)
          </li>
          <li>
            <strong>Variants:</strong> Different styles (primary, secondary,
            small, large)
          </li>
        </ul>
        <p>
          Understanding component anatomy helps map tokens to the right parts.
        </p>

        <h3>Visual Token Overlays</h3>
        <p>Visual token overlays show which tokens apply to which parts:</p>
        <ul>
          <li>
            <strong>Component diagram:</strong> Visual representation of
            component structure
          </li>
          <li>
            <strong>Token labels:</strong> Tokens mapped to specific parts
            (background, border, padding)
          </li>
          <li>
            <strong>State variations:</strong> How tokens change across states
          </li>
          <li>
            <strong>Variant variations:</strong> How tokens change across
            variants
          </li>
        </ul>
        <p>
          Visual overlays make token usage immediately clear without reading
          documentation.
        </p>

        <h3>Component-Specific Tokens</h3>
        <p>Component tokens map to component anatomy:</p>
        <pre>
          <code>{`// Button component tokens mapped to anatomy
{
  "prefix": "button",
  "tokens": {
    "color": {
      "background": {
        "default": "{semantic.color.action.background.primary.default}",
        "hover": "{semantic.interaction.background.hover}",
        "disabled": "{semantic.color.action.background.primary.disabled}"
      },
      "foreground": {
        "default": "{semantic.color.foreground.inverse}",
        "disabled": "{semantic.color.foreground.disabled}"
      }
    },
    "size": {
      "gap": {
        "default": "{core.spacing.size.04}",
        "small": "{core.spacing.size.03}"
      },
      "padding": {
        "small": "{core.spacing.size.03}",
        "large": "{core.spacing.size.05}"
      }
    },
    "shape": {
      "radius": {
        "default": "{semantic.shape.control.radius.default}"
      }
    }
  }
}`}</code>
        </pre>

        <h3>Mapping Strategies</h3>
        <p>Different mapping strategies serve different purposes:</p>
        <ul>
          <li>
            <strong>Direct mapping:</strong> Component tokens directly reference
            semantic tokens
          </li>
          <li>
            <strong>Layered mapping:</strong> Component tokens reference
            semantic tokens, which reference core tokens
          </li>
          <li>
            <strong>Overlay mapping:</strong> Visual diagrams show token
            assignments
          </li>
          <li>
            <strong>Documentation mapping:</strong> Written documentation
            describes token usage
          </li>
        </ul>
        <p>The best systems use multiple mapping strategies for clarity.</p>
      </>
    ),
  },
  {
    type: 'system-roles',
    id: 'system-roles',
    title: 'System Roles: How Component Mapping Shapes System Success',
    order: 5,
    content: (
      <>
        <h3>Onboarding Impact</h3>
        <p>Clear component mapping accelerates onboarding:</p>
        <ul>
          <li>
            <strong>Mental models:</strong> Visual mappings create clear mental
            models of component structure
          </li>
          <li>
            <strong>Token discovery:</strong> Mappings help teams find
            appropriate tokens quickly
          </li>
          <li>
            <strong>Pattern recognition:</strong> Consistent mappings help teams
            recognize patterns across components
          </li>
        </ul>
        <p>
          Effective onboarding reduces time-to-productivity for new team
          members.
        </p>

        <h3>Maintainability Impact</h3>
        <p>Documented mappings improve maintainability:</p>
        <ul>
          <li>
            <strong>Change impact:</strong> Clear mappings show which tokens
            affect which parts
          </li>
          <li>
            <strong>Update clarity:</strong> Mappings make it clear what needs
            to change when requirements change
          </li>
          <li>
            <strong>Debugging:</strong> Mappings help identify why components
            look or behave unexpectedly
          </li>
        </ul>
        <p>
          Maintainability ensures systems can evolve without breaking existing
          components.
        </p>

        <h3>Governance Impact</h3>
        <p>Clear mappings enable governance:</p>
        <ul>
          <li>
            <strong>Boundary enforcement:</strong> Mappings define clear
            boundaries for token usage
          </li>
          <li>
            <strong>Consistency checks:</strong> Mappings enable automated
            consistency checking
          </li>
          <li>
            <strong>Design drift prevention:</strong> Mappings prevent ad-hoc
            token usage
          </li>
        </ul>
        <p>Governance ensures systems maintain consistency at scale.</p>
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
          Component mapping bridges design intent and code implementation. Let's
          examine how mappings translate from design specifications to working
          code.
        </p>

        <h3>Design: Component Anatomy Diagram</h3>
        <p>Design tools show component anatomy with token overlays:</p>
        <pre>
          <code>{`// Button component anatomy in Figma
Button Component
├── Root Container
│   ├── Background: semantic.color.action.background.primary.default
│   ├── Border: semantic.color.border.default
│   ├── Border Radius: semantic.shape.control.radius.default
│   └── Padding: semantic.spacing.padding.button
├── Icon (optional)
│   ├── Size: icon.size.sm
│   └── Color: semantic.color.foreground.inverse
└── Text
    ├── Font: semantic.typography.font.button
    └── Color: semantic.color.foreground.inverse`}</code>
        </pre>

        <h3>Code: Component Token File</h3>
        <p>Component tokens map anatomy to tokens:</p>
        <pre>
          <code>{`// Button.tokens.json
{
  "prefix": "button",
  "tokens": {
    "color": {
      "background": {
        "default": "{semantic.color.action.background.primary.default}",
        "hover": "{semantic.interaction.background.hover}",
        "disabled": "{semantic.color.action.background.primary.disabled}"
      },
      "foreground": {
        "default": "{semantic.color.foreground.inverse}",
        "disabled": "{semantic.color.foreground.disabled}"
      }
    },
    "size": {
      "padding": {
        "small": "{core.spacing.size.03}",
        "default": "{core.spacing.size.04}",
        "large": "{core.spacing.size.05}"
      },
      "gap": {
        "default": "{core.spacing.size.04}"
      }
    },
    "shape": {
      "radius": {
        "default": "{semantic.shape.control.radius.default}"
      }
    }
  }
}`}</code>
        </pre>

        <h3>Code: Component Implementation</h3>
        <p>Component SCSS uses mapped tokens:</p>
        <pre>
          <code>{`// Button.module.scss
.button {
  // Background token mapped to root container
  background: var(--button-color-background-default);
  
  // Border token mapped to root container
  border: var(--shape-border-width-hairline) 
          var(--shape-border-style-solid) 
          var(--semantic-color-border-default);
  
  // Border radius token mapped to root container
  border-radius: var(--button-shape-radius-default);
  
  // Padding token mapped to root container
  padding: var(--button-size-padding-default);
  
  // Gap token mapped to flex container
  gap: var(--button-size-gap-default);
  
  // Foreground token mapped to text
  color: var(--button-color-foreground-default);
  
  &:hover {
    // Background token mapped to hover state
    background: var(--button-color-background-hover);
  }
  
  &:disabled {
    // Background and foreground tokens mapped to disabled state
    background: var(--button-color-background-disabled);
    color: var(--button-color-foreground-disabled);
  }
}`}</code>
        </pre>

        <h3>Documentation: Visual Token Overlay</h3>
        <p>Documentation shows token mapping visually:</p>
        <pre>
          <code>{`// Component documentation with token overlay
<Button>
  [Root Container]
    Background: button.color.background.default
    Border: semantic.color.border.default
    Radius: button.shape.radius.default
    Padding: button.size.padding.default
  
  [Icon Container] (optional)
    Size: icon.size.sm
    Color: button.color.foreground.default
  
  [Text]
    Font: semantic.typography.font.button
    Color: button.color.foreground.default
</Button>`}</code>
        </pre>

        <h3>Real-World Impact</h3>
        <p>
          A well-mapped component system ensures consistency between design and
          code. When designers specify tokens in Figma, those same tokens appear
          in code through component token files. When components need to change,
          mappings make it clear which tokens to update. This is component
          mapping as infrastructure: built-in clarity, not manual alignment.
        </p>
        <p>
          Understanding component mapping helps practitioners create systems
          with clear token usage, maintainable components, and effective
          governance.
        </p>
      </>
    ),
  },
  {
    type: 'applied-example',
    id: 'applied-example',
    title: 'Applied Example: Mapping Button Component',
    order: 7,
    content: (
      <>
        <p>Let's map a Button component from anatomy to tokens to code:</p>

        <h3>Step 1: Define Component Anatomy</h3>
        <p>Break down the Button into its parts:</p>
        <pre>
          <code>{`// Button anatomy
Button
├── Root Container
│   ├── Background (state: default, hover, disabled)
│   ├── Border (state: default, focus)
│   ├── Border Radius
│   └── Padding
├── Content Container (flex)
│   ├── Gap (between icon and text)
│   ├── Icon (optional)
│   └── Text
└── States
    ├── Default
    ├── Hover
    ├── Active
    ├── Disabled
    └── Focus`}</code>
        </pre>

        <h3>Step 2: Map Tokens to Anatomy</h3>
        <p>Create component tokens that map to each part:</p>
        <pre>
          <code>{`// Button.tokens.json
{
  "prefix": "button",
  "tokens": {
    "color": {
      "background": {
        "default": "{semantic.color.action.background.primary.default}",
        "hover": "{semantic.interaction.background.hover}",
        "disabled": "{semantic.color.action.background.primary.disabled}"
      },
      "foreground": {
        "default": "{semantic.color.foreground.inverse}",
        "disabled": "{semantic.color.foreground.disabled}"
      }
    },
    "size": {
      "padding": {
        "small": "{core.spacing.size.03}",
        "default": "{core.spacing.size.04}",
        "large": "{core.spacing.size.05}"
      },
      "gap": {
        "default": "{core.spacing.size.04}"
      }
    },
    "shape": {
      "radius": {
        "default": "{semantic.shape.control.radius.default}"
      }
    }
  }
}`}</code>
        </pre>

        <h3>Step 3: Generate Component SCSS</h3>
        <p>Token build process generates SCSS from tokens:</p>
        <pre>
          <code>{`// Generated Button.module.scss
:root {
  --button-color-background-default: var(--semantic-color-action-background-primary-default);
  --button-color-background-hover: var(--semantic-interaction-background-hover);
  --button-color-background-disabled: var(--semantic-color-action-background-primary-disabled);
  --button-color-foreground-default: var(--semantic-color-foreground-inverse);
  --button-color-foreground-disabled: var(--semantic-color-foreground-disabled);
  --button-size-padding-small: var(--core-spacing-size-03);
  --button-size-padding-default: var(--core-spacing-size-04);
  --button-size-padding-large: var(--core-spacing-size-05);
  --button-size-gap-default: var(--core-spacing-size-04);
  --button-shape-radius-default: var(--semantic-shape-control-radius-default);
}

.button {
  background: var(--button-color-background-default);
  color: var(--button-color-foreground-default);
  border-radius: var(--button-shape-radius-default);
  padding: var(--button-size-padding-default);
  gap: var(--button-size-gap-default);
  
  &:hover {
    background: var(--button-color-background-hover);
  }
  
  &:disabled {
    background: var(--button-color-background-disabled);
    color: var(--button-color-foreground-disabled);
  }
}`}</code>
        </pre>

        <h3>Step 4: Document Token Mapping</h3>
        <p>Create visual documentation showing token mapping:</p>
        <pre>
          <code>{`// Component documentation
Button Component

Anatomy:
  Root Container
    - Background: button.color.background.default
    - Border Radius: button.shape.radius.default
    - Padding: button.size.padding.default
  
  Content Container
    - Gap: button.size.gap.default
  
  States:
    - Hover: button.color.background.hover
    - Disabled: button.color.background.disabled`}</code>
        </pre>

        <h3>Benefits of This Approach</h3>
        <ul>
          <li>
            <strong>Clarity:</strong> Clear mapping from anatomy to tokens to
            code
          </li>
          <li>
            <strong>Maintainability:</strong> Easy to understand which tokens
            affect which parts
          </li>
          <li>
            <strong>Consistency:</strong> Consistent mapping patterns across all
            components
          </li>
          <li>
            <strong>Onboarding:</strong> New team members can understand token
            usage quickly
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
        <p>Component mapping faces several challenges:</p>

        <h4>Over-Mapping</h4>
        <p>Excessive mapping can create overhead:</p>
        <ul>
          <li>
            <strong>Problem:</strong> Mapping every small detail creates
            maintenance overhead
          </li>
          <li>
            <strong>Solution:</strong> Map only significant parts, group related
            mappings
          </li>
          <li>
            <strong>Guideline:</strong> Map parts that have multiple token
            assignments or are reused across variants
          </li>
        </ul>

        <h4>Maintenance Overhead</h4>
        <p>Keeping mappings up-to-date requires effort:</p>
        <ul>
          <li>
            <strong>Problem:</strong> Mappings can drift from actual
            implementation
          </li>
          <li>
            <strong>Solution:</strong> Generate mappings from code when
            possible, validate mappings in CI/CD
          </li>
          <li>
            <strong>Approach:</strong> Treat mappings as code, version control
            them
          </li>
        </ul>

        <h4>Documentation Drift</h4>
        <p>Documentation can become outdated:</p>
        <ul>
          <li>
            <strong>Challenge:</strong> Visual diagrams and documentation can
            drift from code
          </li>
          <li>
            <strong>Approach:</strong> Generate documentation from code, use
            visual regression testing
          </li>
          <li>
            <strong>Tradeoff:</strong> Automated documentation vs. manual
            curation
          </li>
        </ul>

        <h3>Tradeoffs</h3>
        <p>Component mapping involves several tradeoffs:</p>

        <h4>Detailed vs. High-Level Mapping</h4>
        <ul>
          <li>
            <strong>Detailed mapping:</strong> More precise, but harder to
            maintain
          </li>
          <li>
            <strong>High-level mapping:</strong> Easier to maintain, but less
            precise
          </li>
          <li>
            <strong>Best practice:</strong> Map significant parts in detail,
            group minor parts
          </li>
        </ul>

        <h4>Visual vs. Written Documentation</h4>
        <ul>
          <li>
            <strong>Visual documentation:</strong> More intuitive, but harder to
            keep synchronized
          </li>
          <li>
            <strong>Written documentation:</strong> Easier to maintain, but less
            intuitive
          </li>
          <li>
            <strong>Best practice:</strong> Use visual diagrams for overview,
            written docs for details
          </li>
        </ul>

        <h4>Automated vs. Manual Mapping</h4>
        <ul>
          <li>
            <strong>Automated mapping:</strong> Always accurate, but may miss
            nuances
          </li>
          <li>
            <strong>Manual mapping:</strong> More nuanced, but can drift from
            code
          </li>
          <li>
            <strong>Best practice:</strong> Generate mappings automatically,
            curate manually for clarity
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
        <p>Continue learning about component mapping:</p>
        <ul>
          <li>
            <Link href="/blueprints/foundations/tokens">Design Tokens</Link>:
            Foundation of token systems
          </li>
          <li>
            <Link href="/blueprints/foundations/component-architecture">
              Component Architecture
            </Link>
            : How component layers work
          </li>
          <li>
            <Link href="/blueprints/foundations/meta/token-naming">
              Token Naming
            </Link>
            : Naming conventions for component tokens
          </li>
          <li>
            <Link href="/blueprints/component-standards">
              Component Standards
            </Link>
            : Component documentation patterns
          </li>
        </ul>
        <p>
          Related glossary terms:{' '}
          <Link href="/blueprints/glossary#components">Components</Link>,{' '}
          <Link href="/blueprints/glossary#tokens">Design Tokens</Link>,{' '}
          <Link href="/blueprints/glossary#documentation">Documentation</Link>
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
      description: 'Foundation of token systems',
      type: 'foundation',
    },
    {
      slug: 'component-architecture',
      title: 'Component Architecture',
      description: 'How component layers work',
      type: 'foundation',
    },
    {
      slug: 'token-naming',
      title: 'Token Naming',
      description: 'Naming conventions for tokens',
      type: 'foundation',
    },
  ],
  components: [],
  glossary: ['components', 'tokens', 'documentation'],
};

// Add verification checklist
content.verificationChecklist = [
  {
    id: 'component-anatomy-defined',
    label: 'Component anatomy defined',
    description: 'Component parts are clearly identified',
    required: true,
  },
  {
    id: 'token-mapping-documented',
    label: 'Token mapping documented',
    description: 'Tokens are mapped to component parts',
    required: true,
  },
  {
    id: 'visual-overlays-created',
    label: 'Visual overlays created',
    description: 'Visual diagrams show token assignments',
    required: false,
  },
  {
    id: 'mapping-validation',
    label: 'Mapping validation',
    description: 'Mappings are validated against implementation',
    required: true,
  },
];

// Add assessment prompts
content.assessmentPrompts = [
  {
    question:
      'When should you create component-specific tokens versus using semantic tokens directly? Provide examples.',
    type: 'reflection',
  },
  {
    question:
      'Explain how component mapping enables both clarity and maintainability. Provide a concrete example.',
    type: 'application',
  },
  {
    question:
      'What are the tradeoffs between detailed and high-level component mapping? When would you choose each approach?',
    type: 'reflection',
  },
];

export const metadata = generateFoundationMetadata(pageMetadata);

export default function ComponentMappingPage() {
  return <FoundationPage content={content} />;
}
