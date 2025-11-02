/**
 * Foundation: Token Naming & Hierarchy
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
  title: 'Token Naming & Hierarchy',
  description:
    'Learn how to structure and name design tokens for clarity, scalability, and cross-platform consistency. Understand naming conventions, hierarchy patterns, and discoverability strategies.',
  slug: 'token-naming',
  canonicalUrl:
    'https://darianrosebrook.com/blueprints/foundations/meta/token-naming',
  published_at: new Date().toISOString(),
  modified_at: new Date().toISOString(),
  image: 'https://darianrosebrook.com/darianrosebrook.jpg',
  keywords:
    'token naming, hierarchy, naming conventions, discoverability, API design',
  learning: {
    learning_level: 'foundation',
    role_relevance: ['design', 'engineering', 'governance'],
    prerequisites: ['tokens', 'atomic-vs-semantic'],
    next_units: ['component-mapping', 'theming'],
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
    expertise: ['Token Architecture', 'API Design', 'Naming Conventions'],
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
    title: 'Why Token Naming Matters',
    order: 3,
    content: (
      <>
        <p>
          A well-structured token naming system is crucial for maintaining
          clarity and scalability in your design system. Names are API
          design—good names communicate intent and make discovery easy. When
          systematized properly, token naming serves multiple critical
          functions:
        </p>
        <ul>
          <li>
            <strong>Discoverability:</strong> Clear naming helps teams find
            appropriate tokens quickly
          </li>
          <li>
            <strong>Intent Communication:</strong> Well-named tokens communicate
            purpose, not just value
          </li>
          <li>
            <strong>Scalability:</strong> Consistent naming conventions enable
            systems to scale without confusion
          </li>
          <li>
            <strong>Maintainability:</strong> Clear hierarchy makes tokens
            easier to understand and update
          </li>
          <li>
            <strong>Cross-Platform Consistency:</strong> Consistent naming works
            across platforms and tools
          </li>
        </ul>
        <p>
          A well-designed token naming system treats names as infrastructure
          that enables rather than restricts usage. It provides clarity that
          helps teams work effectively across design and code.
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
        <h3>Layer Prefixes</h3>
        <p>Always prefix tokens with their layer:</p>
        <ul>
          <li>
            <strong>Core:</strong> <code>core.color.palette.blue.600</code>
          </li>
          <li>
            <strong>Semantic:</strong>{' '}
            <code>semantic.color.foreground.primary</code>
          </li>
          <li>
            <strong>Component:</strong>{' '}
            <code>components.button.primary.background</code>
          </li>
        </ul>
        <p>
          Layer prefixes make token purpose immediately clear and enable proper
          tooling support.
        </p>

        <h3>Purpose Over Implementation</h3>
        <p>Describe purpose, not implementation:</p>
        <ul>
          <li>
            <strong>Good:</strong> <code>foreground.primary</code> - describes
            purpose
          </li>
          <li>
            <strong>Bad:</strong> <code>blue.500</code> - describes value
          </li>
          <li>
            <strong>Good:</strong> <code>spacing.padding.container</code> -
            describes context
          </li>
          <li>
            <strong>Bad:</strong> <code>spacing.16</code> - describes value
          </li>
        </ul>
        <p>
          Purpose-driven names enable refactoring and theming without breaking
          components.
        </p>

        <h3>Hierarchy Patterns</h3>
        <p>Consistent hierarchy patterns create predictable structure:</p>
        <pre>
          <code>{`// Color tokens
{layer}.color.{category}.{role}.{variant?}

Examples:
- core.color.palette.brand.primary.500
- semantic.color.foreground.primary
- semantic.color.background.danger-strong
- semantic.color.border.focus

// Spacing tokens
{layer}.spacing.{category}.{context}

Examples:
- core.spacing.size.04
- semantic.spacing.padding.container
- semantic.spacing.margin.section

// Elevation tokens
{layer}.elevation.{surface}.{level}

Examples:
- semantic.elevation.surface.raised
- semantic.elevation.surface.overlay`}</code>
        </pre>

        <h3>Naming Conventions</h3>
        <p>Consistent conventions improve discoverability:</p>
        <ul>
          <li>
            <strong>Nouns for tokens:</strong> <code>foreground</code>,{' '}
            <code>background</code>, <code>border</code>
          </li>
          <li>
            <strong>Verbs for utilities:</strong> <code>getToken</code>,{' '}
            <code>resolveReference</code>
          </li>
          <li>
            <strong>American spelling:</strong> Use <code>color</code> not{' '}
            <code>colour</code>
          </li>
          <li>
            <strong>Kebab-case in JSON:</strong> Use{' '}
            <code>foreground-primary</code>
            in file paths
          </li>
          <li>
            <strong>CamelCase in code:</strong> Use{' '}
            <code>foregroundPrimary</code> in variable names
          </li>
        </ul>
        <p>
          Consistent conventions reduce cognitive load and enable tooling
          support.
        </p>

        <h3>Hierarchy Depth</h3>
        <p>Keep hierarchy depth consistent:</p>
        <ul>
          <li>
            <strong>Core tokens:</strong> 3-4 levels{' '}
            <code>core.color.palette.blue.600</code>
          </li>
          <li>
            <strong>Semantic tokens:</strong> 3-4 levels{' '}
            <code>semantic.color.foreground.primary</code>
          </li>
          <li>
            <strong>Component tokens:</strong> 4-5 levels{' '}
            <code>components.button.primary.background.default</code>
          </li>
        </ul>
        <p>
          Consistent depth prevents confusion and enables predictable tooling.
        </p>
      </>
    ),
  },
  {
    type: 'system-roles',
    id: 'system-roles',
    title: 'System Roles: How Token Naming Shapes System Success',
    order: 5,
    content: (
      <>
        <h3>Discoverability Impact</h3>
        <p>Clear naming improves discoverability:</p>
        <ul>
          <li>
            <strong>Searchability:</strong> Well-named tokens are easier to find
            in documentation and tools
          </li>
          <li>
            <strong>Pattern recognition:</strong> Consistent naming helps teams
            recognize patterns across token types
          </li>
          <li>
            <strong>Onboarding:</strong> Clear naming accelerates onboarding for
            new team members
          </li>
        </ul>
        <p>
          Discoverable tokens reduce time-to-productivity and improve token
          usage.
        </p>

        <h3>Maintainability Impact</h3>
        <p>Consistent naming improves maintainability:</p>
        <ul>
          <li>
            <strong>Change clarity:</strong> Clear hierarchy makes it obvious
            where changes should occur
          </li>
          <li>
            <strong>Refactoring safety:</strong> Purpose-driven names enable
            safe refactoring
          </li>
          <li>
            <strong>Documentation:</strong> Self-documenting names reduce need
            for external documentation
          </li>
        </ul>
        <p>
          Maintainable naming enables systems to evolve without breaking
          components.
        </p>

        <h3>Scalability Impact</h3>
        <p>Consistent naming enables scalability:</p>
        <ul>
          <li>
            <strong>Predictable structure:</strong> Consistent hierarchy enables
            tooling and automation
          </li>
          <li>
            <strong>Pattern reuse:</strong> Clear patterns enable teams to
            create new tokens following existing conventions
          </li>
          <li>
            <strong>Governance:</strong> Consistent naming enables automated
            validation and governance
          </li>
        </ul>
        <p>
          Scalable naming enables systems to grow without becoming unmanageable.
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
          Token naming bridges design intent and code implementation. Let's
          examine how naming conventions translate from design specifications to
          working code.
        </p>

        <h3>Design: Token Names in Figma</h3>
        <p>Design tools use token names for organization:</p>
        <pre>
          <code>{`// Figma: Token names organize variables
Color Styles:
  semantic.color.foreground.primary
  semantic.color.foreground.secondary
  semantic.color.background.surface

Spacing Styles:
  semantic.spacing.padding.container
  semantic.spacing.padding.button
  semantic.spacing.gap.default`}</code>
        </pre>

        <h3>Code: Token Names in JSON</h3>
        <p>Token files use consistent naming:</p>
        <pre>
          <code>{`// semantic/color.tokens.json
{
  "semantic": {
    "color": {
      "foreground": {
        "primary": {
          "$type": "color",
          "$value": "{core.color.palette.neutral.900}"
        },
        "secondary": {
          "$type": "color",
          "$value": "{core.color.palette.neutral.600}"
        }
      },
      "background": {
        "surface": {
          "$type": "color",
          "$value": "{core.color.palette.neutral.100}"
        }
      }
    }
  }
}`}</code>
        </pre>

        <h3>Code: Generated CSS Variables</h3>
        <p>Token names generate CSS variable names:</p>
        <pre>
          <code>{`// Generated CSS variables
:root {
  --semantic-color-foreground-primary: var(--core-color-palette-neutral-900);
  --semantic-color-foreground-secondary: var(--core-color-palette-neutral-600);
  --semantic-color-background-surface: var(--core-color-palette-neutral-100);
}

// Conversion rules:
// - Dots become hyphens
// - CamelCase becomes kebab-case
// - Layer prefix preserved`}</code>
        </pre>

        <h3>Code: TypeScript Types</h3>
        <p>Token names generate TypeScript types:</p>
        <pre>
          <code>{`// Generated TypeScript types
type TokenPath =
  | 'semantic.color.foreground.primary'
  | 'semantic.color.foreground.secondary'
  | 'semantic.color.background.surface';

// Usage
const foregroundColor = getToken('semantic.color.foreground.primary');`}</code>
        </pre>

        <h3>Real-World Impact</h3>
        <p>
          A well-named token system ensures consistency between design and code.
          Designers use token names in Figma that match token names in code.
          When tokens need to change, clear naming makes it obvious what to
          update. When new tokens are needed, consistent naming conventions
          guide creation. This is token naming as infrastructure: built-in
          clarity, not manual alignment.
        </p>
        <p>
          Understanding token naming conventions helps practitioners create
          systems with discoverable tokens, maintainable structure, and scalable
          architecture.
        </p>
      </>
    ),
  },
  {
    type: 'applied-example',
    id: 'applied-example',
    title: 'Applied Example: Building a Token Naming System',
    order: 7,
    content: (
      <>
        <p>Let's build a token naming system following best practices:</p>

        <h3>Step 1: Define Layer Prefixes</h3>
        <p>Establish clear layer prefixes:</p>
        <pre>
          <code>{`// Layer prefixes
core.          // Core primitives
semantic.      // Semantic aliases
components.    // Component-specific tokens

// Always prefix with layer
✅ core.color.palette.blue.600
✅ semantic.color.foreground.primary
❌ color.palette.blue.600  // Missing layer prefix`}</code>
        </pre>

        <h3>Step 2: Establish Hierarchy Patterns</h3>
        <p>Create consistent hierarchy patterns:</p>
        <pre>
          <code>{`// Color hierarchy
{layer}.color.{category}.{role}.{variant?}

Examples:
- core.color.palette.brand.primary.500
- semantic.color.foreground.primary
- semantic.color.background.danger-strong

// Spacing hierarchy
{layer}.spacing.{category}.{context}

Examples:
- core.spacing.size.04
- semantic.spacing.padding.container
- semantic.spacing.margin.section

// Elevation hierarchy
{layer}.elevation.{surface}.{level}

Examples:
- semantic.elevation.surface.raised
- semantic.elevation.surface.overlay`}</code>
        </pre>

        <h3>Step 3: Use Purpose-Driven Names</h3>
        <p>Name tokens by purpose, not value:</p>
        <pre>
          <code>{`// Good: Purpose-driven
semantic.color.foreground.primary     // What it's for
semantic.spacing.padding.container    // Where it's used
semantic.elevation.surface.raised     // What it represents

// Bad: Value-driven
semantic.color.blue.500               // What value it is
semantic.spacing.16                   // What size it is
semantic.elevation.shadow.2           // What shadow it is`}</code>
        </pre>

        <h3>Step 4: Maintain Consistent Depth</h3>
        <p>Keep hierarchy depth consistent:</p>
        <pre>
          <code>{`// Consistent depth
core.color.palette.blue.600          // 4 levels
semantic.color.foreground.primary     // 4 levels
components.button.primary.background // 4 levels

// Avoid inconsistent depth
❌ core.color.blue                    // Too shallow
❌ semantic.color.foreground.primary.text.default // Too deep`}</code>
        </pre>

        <h3>Benefits of This Approach</h3>
        <ul>
          <li>
            <strong>Discoverability:</strong> Teams can find tokens quickly
          </li>
          <li>
            <strong>Maintainability:</strong> Clear structure makes updates
            obvious
          </li>
          <li>
            <strong>Scalability:</strong> Consistent patterns enable growth
          </li>
          <li>
            <strong>Tooling:</strong> Predictable structure enables automation
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
        <p>Token naming faces several challenges:</p>

        <h4>Over-Specificity</h4>
        <p>Too specific names can limit reuse:</p>
        <ul>
          <li>
            <strong>Problem:</strong> Names like{' '}
            <code>button.primary.background</code> limit reuse
          </li>
          <li>
            <strong>Solution:</strong> Use semantic names like{' '}
            <code>action.background.primary</code> that can be reused
          </li>
          <li>
            <strong>Guideline:</strong> Name by purpose, not by component
          </li>
        </ul>

        <h4>Under-Specificity</h4>
        <p>Too generic names can cause confusion:</p>
        <ul>
          <li>
            <strong>Problem:</strong> Names like <code>color.primary</code> lack
            context
          </li>
          <li>
            <strong>Solution:</strong> Use specific names like{' '}
            <code>foreground.primary</code> or <code>background.primary</code>
          </li>
          <li>
            <strong>Guideline:</strong> Include enough context to be clear
          </li>
        </ul>

        <h4>Migration Complexity</h4>
        <p>Renaming tokens requires careful migration:</p>
        <ul>
          <li>
            <strong>Challenge:</strong> Renaming tokens requires updating all
            references
          </li>
          <li>
            <strong>Approach:</strong> Use aliases during migration, update
            references gradually
          </li>
          <li>
            <strong>Tradeoff:</strong> Migration effort vs. naming clarity
          </li>
        </ul>

        <h3>Tradeoffs</h3>
        <p>Token naming involves several tradeoffs:</p>

        <h4>Brevity vs. Clarity</h4>
        <ul>
          <li>
            <strong>Brevity:</strong> Shorter names are easier to type, but less
            clear
          </li>
          <li>
            <strong>Clarity:</strong> Longer names are clearer, but harder to
            type
          </li>
          <li>
            <strong>Best practice:</strong> Favor clarity over brevity—use
            descriptive names
          </li>
        </ul>

        <h4>Hierarchy Depth</h4>
        <ul>
          <li>
            <strong>Shallow hierarchy:</strong> Easier to remember, but less
            organization
          </li>
          <li>
            <strong>Deep hierarchy:</strong> Better organization, but harder to
            remember
          </li>
          <li>
            <strong>Best practice:</strong> Use 3-4 levels consistently
          </li>
        </ul>

        <h4>Specificity vs. Reusability</h4>
        <ul>
          <li>
            <strong>Specific:</strong> Clear purpose, but limited reuse
          </li>
          <li>
            <strong>Reusable:</strong> Broad applicability, but less clear
            purpose
          </li>
          <li>
            <strong>Best practice:</strong> Balance—specific enough to be clear,
            general enough to be reusable
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
        <p>Continue learning about token naming:</p>
        <ul>
          <li>
            <Link href="/blueprints/foundations/tokens">Design Tokens</Link>:
            Foundation of token systems
          </li>
          <li>
            <Link href="/blueprints/foundations/tokens/token-naming">
              Token Naming Implementation
            </Link>
            : Implementation details of token naming
          </li>
          <li>
            <Link href="/blueprints/foundations/meta/atomic-vs-semantic">
              Atomic vs Semantic Tokens
            </Link>
            : How token architecture supports naming
          </li>
          <li>
            <Link href="/blueprints/foundations/meta/component-mapping">
              Component Mapping
            </Link>
            : How tokens map to component anatomy
          </li>
        </ul>
        <p>
          Related glossary terms:{' '}
          <Link href="/blueprints/glossary#tokens">Design Tokens</Link>,{' '}
          <Link href="/blueprints/glossary#naming">Naming Conventions</Link>,{' '}
          <Link href="/blueprints/glossary#hierarchy">Hierarchy</Link>
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
      slug: 'token-naming',
      title: 'Token Naming Implementation',
      description: 'Implementation details of token naming',
      type: 'foundation',
    },
    {
      slug: 'atomic-vs-semantic',
      title: 'Atomic vs Semantic Tokens',
      description: 'How token architecture supports naming',
      type: 'foundation',
    },
  ],
  components: [],
  glossary: ['tokens', 'naming', 'hierarchy'],
};

// Add verification checklist
content.verificationChecklist = [
  {
    id: 'layer-prefixes-defined',
    label: 'Layer prefixes defined',
    description:
      'All tokens are prefixed with layer (core, semantic, components)',
    required: true,
  },
  {
    id: 'hierarchy-patterns-established',
    label: 'Hierarchy patterns established',
    description:
      'Consistent hierarchy patterns are established for each token type',
    required: true,
  },
  {
    id: 'purpose-driven-naming',
    label: 'Purpose-driven naming',
    description: 'Tokens are named by purpose, not by value',
    required: true,
  },
  {
    id: 'consistent-depth',
    label: 'Consistent depth',
    description: 'Token hierarchy depth is consistent across token types',
    required: true,
  },
];

// Add assessment prompts
content.assessmentPrompts = [
  {
    question:
      'When should you create a component-specific token versus using a semantic token? Provide examples.',
    type: 'reflection',
  },
  {
    question:
      'Explain how token naming conventions enable discoverability and maintainability. Provide a concrete example.',
    type: 'application',
  },
  {
    question:
      'What are the tradeoffs between brevity and clarity in token naming? How do you balance them?',
    type: 'reflection',
  },
];

export const metadata = generateFoundationMetadata(pageMetadata);

export default function TokenNamingPage() {
  return <FoundationPage content={content} />;
}
