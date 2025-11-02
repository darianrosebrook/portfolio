/**
 * Foundation: Atomic vs Semantic Tokens
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
  title: 'Atomic vs Semantic Tokens',
  description:
    'Explore the differences and balance between atomic (raw value) and semantic (purpose-driven) tokens. Understand when to use each approach and how hybrid systems enable maintainability.',
  slug: 'atomic-vs-semantic',
  canonicalUrl:
    'https://darianrosebrook.com/blueprints/foundations/meta/atomic-vs-semantic',
  keywords:
    'atomic tokens, semantic tokens, token architecture, maintainability, refactoring',
  learning: {
    learning_level: 'foundation',
    role_relevance: ['design', 'engineering', 'governance'],
    prerequisites: ['tokens'],
    next_units: ['core-vs-semantic', 'token-naming'],
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
    expertise: ['Token Architecture', 'System Design', 'Refactoring'],
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
    title: 'Why Atomic vs Semantic Matters',
    order: 3,
    content: (
      <>
        <p>
          The choice between atomic and semantic tokens fundamentally shapes
          your design system's maintainability, refactor safety, and
          scalability. Understanding this distinction is crucial for building
          systems that endure:
        </p>
        <ul>
          <li>
            <strong>Token Maintainability:</strong> Atomic tokens are easier to
            understand but harder to refactor; semantic tokens are harder to
            understand but safer to refactor
          </li>
          <li>
            <strong>Refactor Safety:</strong> Semantic tokens protect components
            from value changes—change the token value, not component code
          </li>
          <li>
            <strong>System Scalability:</strong> Hybrid systems balance
            flexibility with maintainability, enabling systems to scale
          </li>
          <li>
            <strong>Team Understanding:</strong> Token naming choices affect how
            teams discover and use tokens
          </li>
          <li>
            <strong>Theming Enablement:</strong> Semantic tokens enable
            multi-brand and theme systems through aliasing
          </li>
        </ul>
        <p>
          A well-designed token system balances atomic and semantic approaches,
          using each where it provides the most value. This balance determines
          whether your system scales gracefully or collapses under exceptions.
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
        <h3>Atomic Tokens: Raw Values</h3>
        <p>
          Atomic tokens (also called "primitive" or "core" tokens) contain raw
          values without semantic meaning:
        </p>
        <ul>
          <li>
            <strong>What they are:</strong> Direct values like{' '}
            <code>#3b82f6</code>, <code>16px</code>, <code>200ms</code>
          </li>
          <li>
            <strong>Naming:</strong> Describe the value itself, not its purpose
            (e.g., <code>blue.500</code>, <code>spacing.04</code>)
          </li>
          <li>
            <strong>Stability:</strong> These values rarely change—they're the
            physics of your system
          </li>
          <li>
            <strong>Use cases:</strong> Foundation layer, palette ramps, spacing
            scales, motion durations
          </li>
        </ul>
        <pre>
          <code>{`// Atomic tokens: raw values
{
  "color": {
    "blue": {
      "500": { "$type": "color", "$value": "#3b82f6" },
      "600": { "$type": "color", "$value": "#2563eb" }
    }
  },
  "spacing": {
    "size": {
      "04": { "$type": "dimension", "$value": "8px" },
      "06": { "$type": "dimension", "$value": "16px" }
    }
  }
}`}</code>
        </pre>

        <h3>Semantic Tokens: Purpose-Driven</h3>
        <p>Semantic tokens alias atomic tokens with purpose-driven names:</p>
        <ul>
          <li>
            <strong>What they are:</strong> References to atomic tokens that
            describe purpose (e.g., <code>foreground.primary</code>,{' '}
            <code>padding.container</code>)
          </li>
          <li>
            <strong>Naming:</strong> Describe purpose and context, not values
            (e.g., <code>text.primary</code>, <code>background.surface</code>)
          </li>
          <li>
            <strong>Stability:</strong> Names are stable, but referenced values
            can change
          </li>
          <li>
            <strong>Use cases:</strong> Theming layer, component usage, brand
            expression
          </li>
        </ul>
        <pre>
          <code>{`// Semantic tokens: purpose-driven aliases
{
  "semantic": {
    "color": {
      "foreground": {
        "primary": { "$type": "color", "$value": "{color.blue.600}" },
        "secondary": { "$type": "color", "$value": "{color.gray.600}" }
      },
      "background": {
        "surface": { "$type": "color", "$value": "{color.white}" }
      }
    },
    "spacing": {
      "padding": {
        "container": { "$type": "dimension", "$value": "{spacing.size.06}" }
      }
    }
  }
}`}</code>
        </pre>

        <h3>The Fundamental Difference</h3>
        <p>
          Atomic tokens answer "what value?" Semantic tokens answer "what
          purpose?"
        </p>
        <ul>
          <li>
            <strong>Atomic:</strong> <code>blue.500</code> = "The color blue at
            level 500"
          </li>
          <li>
            <strong>Semantic:</strong> <code>foreground.primary</code> = "The
            primary text color" (which happens to be blue.600)
          </li>
        </ul>
        <p>
          This distinction enables refactoring: changing{' '}
          <code>foreground.primary</code> to reference a different blue value
          updates all components automatically, without touching component code.
        </p>

        <h3>Hybrid Systems</h3>
        <p>Most mature systems use both atomic and semantic tokens:</p>
        <ul>
          <li>
            <strong>Atomic layer:</strong> Stable primitives that rarely change
          </li>
          <li>
            <strong>Semantic layer:</strong> Purpose-driven aliases that enable
            theming
          </li>
          <li>
            <strong>Component layer:</strong> Component-specific tokens that
            reference semantic tokens
          </li>
        </ul>
        <p>
          Hybrid systems balance flexibility with maintainability, enabling both
          direct value access and semantic abstraction.
        </p>
      </>
    ),
  },
  {
    type: 'system-roles',
    id: 'system-roles',
    title: 'System Roles: How Atomic vs Semantic Shapes System Success',
    order: 5,
    content: (
      <>
        <h3>Maintainability Impact</h3>
        <p>Token architecture directly affects maintainability:</p>
        <ul>
          <li>
            <strong>Atomic tokens:</strong> Easy to understand (blue.500 is
            clearly blue), but changing values requires updating all consuming
            components
          </li>
          <li>
            <strong>Semantic tokens:</strong> Harder to discover (what color is
            foreground.primary?), but changing values updates all components
            automatically
          </li>
          <li>
            <strong>Hybrid approach:</strong> Best of both worlds—atomic for
            clarity, semantic for refactoring
          </li>
        </ul>
        <p>
          The right balance reduces maintenance overhead while maintaining
          system clarity.
        </p>

        <h3>Refactor Safety Impact</h3>
        <p>Semantic tokens protect components from refactoring:</p>
        <ul>
          <li>
            <strong>Brand changes:</strong> Changing brand colors updates all
            components through semantic tokens without component changes
          </li>
          <li>
            <strong>Theme support:</strong> Supporting dark mode requires only
            semantic token updates, not component changes
          </li>
          <li>
            <strong>Value adjustments:</strong> Tweaking spacing or colors
            updates system-wide through semantic aliases
          </li>
        </ul>
        <p>
          Refactor safety enables rapid iteration while maintaining consistency.
        </p>

        <h3>Scalability Impact</h3>
        <p>Token architecture determines system scalability:</p>
        <ul>
          <li>
            <strong>Atomic-only:</strong> Simple to understand, but hard to
            scale—every brand change requires component updates
          </li>
          <li>
            <strong>Semantic-only:</strong> Scales well, but hard to
            discover—teams struggle to find appropriate tokens
          </li>
          <li>
            <strong>Hybrid:</strong> Scales gracefully—atomic for flexibility,
            semantic for governance
          </li>
        </ul>
        <p>Scalable systems balance direct access with semantic abstraction.</p>
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
          The atomic vs semantic distinction plays out differently in design
          tools versus code. Understanding this helps teams work effectively
          across both domains.
        </p>

        <h3>Atomic Tokens in Design Tools</h3>
        <p>Design tools naturally work with atomic tokens:</p>
        <pre>
          <code>{`// Figma: Designers work with atomic values
Color Style: "Blue 500" = #3b82f6
Spacing: "8px" (direct value)

// These become atomic tokens
{
  "color.blue.500": "#3b82f6",
  "spacing.size.04": "8px"
}`}</code>
        </pre>

        <h3>Semantic Tokens in Code</h3>
        <p>Code benefits from semantic tokens:</p>
        <pre>
          <code>{`// Code: Developers use semantic tokens
.button {
  color: var(--semantic-color-foreground-primary);
  padding: var(--semantic-spacing-padding-button);
}

// Semantic tokens alias atomic tokens
{
  "semantic": {
    "color": {
      "foreground": {
        "primary": "{color.blue.600}"
      }
    },
    "spacing": {
      "padding": {
        "button": "{spacing.size.04}"
      }
    }
  }
}`}</code>
        </pre>

        <h3>Refactoring Example</h3>
        <p>Semantic tokens enable safe refactoring:</p>
        <pre>
          <code>{`// Before: foreground.primary references blue.600
{
  "semantic": {
    "color": {
      "foreground": {
        "primary": "{color.blue.600}"  // #2563eb
      }
    }
  }
}

// After: Change to blue.700 for darker text
{
  "semantic": {
    "color": {
      "foreground": {
        "primary": "{color.blue.700}"  // #1d4ed8
      }
    }
  }
}

// All components using foreground.primary update automatically
// No component code changes required!
.button {
  color: var(--semantic-color-foreground-primary);
  // Now uses blue.700 instead of blue.600
}`}</code>
        </pre>

        <h3>Migration Strategy</h3>
        <p>Migrating from atomic-only to semantic-first:</p>
        <pre>
          <code>{`// Step 1: Create semantic tokens that alias atomic tokens
{
  "semantic": {
    "color": {
      "foreground": {
        "primary": "{color.blue.600}"
      }
    }
  }
}

// Step 2: Update components to use semantic tokens
// Before:
.button {
  color: var(--color-blue-600);
}

// After:
.button {
  color: var(--semantic-color-foreground-primary);
}

// Step 3: Now you can change semantic tokens without touching components
// Benefits:
// - Component code stays stable
// - Design changes propagate automatically
// - Theme support becomes possible`}</code>
        </pre>

        <h3>Real-World Impact</h3>
        <p>
          A well-balanced atomic/semantic system enables both rapid iteration
          and long-term maintainability. Designers work with atomic values in
          Figma, which become atomic tokens. Developers use semantic tokens in
          code, which reference atomic tokens. When design needs to change,
          updating semantic tokens updates all components automatically. This is
          token architecture as infrastructure: built-in refactor safety, not
          manual updates.
        </p>
        <p>
          Understanding the atomic vs semantic distinction helps practitioners
          build systems that scale gracefully, refactor safely, and maintain
          clarity over time.
        </p>
      </>
    ),
  },
  {
    type: 'applied-example',
    id: 'applied-example',
    title: 'Applied Example: Migrating from Atomic-Only to Hybrid',
    order: 7,
    content: (
      <>
        <p>
          Let's migrate a system from atomic-only tokens to a hybrid
          atomic/semantic approach:
        </p>

        <h3>Step 1: Assess Current State</h3>
        <p>Evaluate existing token usage:</p>
        <pre>
          <code>{`// Current: Atomic-only tokens
{
  "color": {
    "blue": {
      "500": "#3b82f6",
      "600": "#2563eb"
    }
  }
}

// Components directly use atomic tokens
.button {
  color: var(--color-blue-600);
  background: var(--color-white);
}`}</code>
        </pre>

        <h3>Step 2: Create Semantic Layer</h3>
        <p>Build semantic tokens that alias atomic tokens:</p>
        <pre>
          <code>{`// Create semantic tokens
{
  "semantic": {
    "color": {
      "foreground": {
        "primary": "{color.blue.600}",
        "onPrimary": "{color.white}"
      },
      "background": {
        "surface": "{color.white}",
        "primary": "{color.blue.600}"
      }
    }
  }
}`}</code>
        </pre>

        <h3>Step 3: Update Components Gradually</h3>
        <p>Migrate components to semantic tokens:</p>
        <pre>
          <code>{`// Before: Atomic tokens
.button {
  color: var(--color-blue-600);
  background: var(--color-white);
}

// After: Semantic tokens
.button {
  color: var(--semantic-color-foreground-primary);
  background: var(--semantic-color-background-surface);
}

// Benefits:
// - Components become theme-aware
// - Brand changes update automatically
// - Dark mode support becomes possible`}</code>
        </pre>

        <h3>Step 4: Enable Theming</h3>
        <p>Use semantic tokens for theme support:</p>
        <pre>
          <code>{`// Semantic tokens with theme support
{
  "semantic": {
    "color": {
      "foreground": {
        "primary": {
          "$value": "{color.blue.600}",
          "$extensions": {
            "design": {
              "paths": {
                "light": "{color.blue.600}",
                "dark": "{color.blue.400}"
              }
            }
          }
        }
      }
    }
  }
}

// Components automatically adapt to theme
.button {
  color: var(--semantic-color-foreground-primary);
  // Uses blue.600 in light mode, blue.400 in dark mode
}`}</code>
        </pre>

        <h3>Benefits of This Approach</h3>
        <ul>
          <li>
            <strong>Refactor safety:</strong> Changing semantic tokens updates
            all components
          </li>
          <li>
            <strong>Theming:</strong> Semantic tokens enable multi-theme support
          </li>
          <li>
            <strong>Maintainability:</strong> Clear separation between atomic
            and semantic layers
          </li>
          <li>
            <strong>Scalability:</strong> System can evolve without breaking
            components
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
        <p>Token architecture decisions face several challenges:</p>

        <h4>Over-Abstraction</h4>
        <p>Too many semantic layers can reduce clarity:</p>
        <ul>
          <li>
            <strong>Problem:</strong> Deep semantic hierarchies make tokens hard
            to discover and understand
          </li>
          <li>
            <strong>Solution:</strong> Limit semantic depth, provide clear
            documentation, use atomic tokens when appropriate
          </li>
          <li>
            <strong>Guideline:</strong> If a semantic token doesn't enable
            refactoring or theming, consider using atomic tokens directly
          </li>
        </ul>

        <h4>Migration Complexity</h4>
        <p>Migrating from atomic-only to semantic-first requires effort:</p>
        <ul>
          <li>
            <strong>Problem:</strong> Updating all components to use semantic
            tokens is time-consuming
          </li>
          <li>
            <strong>Solution:</strong> Migrate gradually, start with high-impact
            tokens, provide migration tooling
          </li>
          <li>
            <strong>Approach:</strong> Create semantic tokens alongside atomic
            tokens, migrate components incrementally
          </li>
        </ul>

        <h4>Performance: Deep Reference Chains</h4>
        <p>Deep token references can impact performance:</p>
        <ul>
          <li>
            <strong>Challenge:</strong> Long reference chains (semantic → atomic
            → value) increase lookup time
          </li>
          <li>
            <strong>Approach:</strong> Pre-resolve references at build time,
            flatten token structure for production
          </li>
          <li>
            <strong>Tradeoff:</strong> Build-time complexity vs. runtime
            performance
          </li>
        </ul>

        <h3>Tradeoffs</h3>
        <p>Token architecture involves several tradeoffs:</p>

        <h4>Atomic-Only vs. Semantic-First</h4>
        <ul>
          <li>
            <strong>Atomic-only:</strong> Simple, direct, but hard to refactor
            and theme
          </li>
          <li>
            <strong>Semantic-first:</strong> Refactor-safe, themeable, but
            harder to discover and understand
          </li>
          <li>
            <strong>Best practice:</strong> Hybrid approach—atomic for
            primitives, semantic for usage
          </li>
        </ul>

        <h4>Flexibility vs. Constraints</h4>
        <ul>
          <li>
            <strong>More atomic tokens:</strong> More flexibility, but less
            refactor safety
          </li>
          <li>
            <strong>More semantic tokens:</strong> More constraints, but better
            refactor safety
          </li>
          <li>
            <strong>Best practice:</strong> Use semantic tokens where
            refactoring matters, atomic tokens where flexibility matters
          </li>
        </ul>

        <h4>Discoverability vs. Precision</h4>
        <ul>
          <li>
            <strong>Atomic tokens:</strong> Easy to discover (blue.500), but
            less precise about usage
          </li>
          <li>
            <strong>Semantic tokens:</strong> Harder to discover, but precise
            about purpose
          </li>
          <li>
            <strong>Best practice:</strong> Provide both layers with clear
            documentation
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
        <p>Continue learning about token architecture:</p>
        <ul>
          <li>
            <Link href="/blueprints/foundations/tokens">Design Tokens</Link>:
            Foundation of token systems
          </li>
          <li>
            <Link href="/blueprints/foundations/tokens/core-vs-semantic">
              Core vs Semantic Tokens
            </Link>
            : How core and semantic tokens work together
          </li>
          <li>
            <Link href="/blueprints/foundations/meta/token-naming">
              Token Naming
            </Link>
            : Naming conventions for atomic and semantic tokens
          </li>
          <li>
            <Link href="/blueprints/foundations/meta/theming">
              Theming Strategies
            </Link>
            : How semantic tokens enable theming
          </li>
        </ul>
        <p>
          Related glossary terms:{' '}
          <Link href="/blueprints/glossary#tokens">Design Tokens</Link>,{' '}
          <Link href="/blueprints/glossary#refactoring">Refactoring</Link>,{' '}
          <Link href="/blueprints/glossary#theming">Theming</Link>
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
      slug: 'core-vs-semantic',
      title: 'Core vs Semantic Tokens',
      description: 'How core and semantic tokens work together',
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
  glossary: ['tokens', 'refactoring', 'theming'],
};

// Add verification checklist
content.verificationChecklist = [
  {
    id: 'atomic-tokens-defined',
    label: 'Atomic tokens defined',
    description: 'Core atomic tokens (primitives) are defined',
    required: true,
  },
  {
    id: 'semantic-tokens-defined',
    label: 'Semantic tokens defined',
    description: 'Semantic tokens alias atomic tokens',
    required: true,
  },
  {
    id: 'token-architecture-balanced',
    label: 'Token architecture balanced',
    description: 'System balances atomic and semantic tokens appropriately',
    required: true,
  },
  {
    id: 'refactor-safety',
    label: 'Refactor safety enabled',
    description: 'Semantic tokens enable refactoring without component changes',
    required: true,
  },
];

// Add assessment prompts
content.assessmentPrompts = [
  {
    question:
      'When should you create a semantic token versus using an atomic token directly? Provide examples.',
    type: 'reflection',
  },
  {
    question:
      'Explain how semantic tokens enable refactor safety. Provide a concrete example of refactoring enabled by semantic tokens.',
    type: 'application',
  },
  {
    question:
      'What are the tradeoffs between atomic-only and semantic-first token systems? When would you choose each approach?',
    type: 'reflection',
  },
];

export const metadata = generateFoundationMetadata(pageMetadata);

export default function AtomicVsSemanticPage() {
  return <FoundationPage content={content} />;
}
