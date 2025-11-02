/**
 * Foundation: Code Tooling
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
  title: 'Code Tooling',
  description:
    'Discover code-side tools like Style Dictionary, token generators, and accessibility linters for robust design system implementation. Learn build processes, validation, and type generation.',
  slug: 'code',
  canonicalUrl:
    'https://darianrosebrook.com/blueprints/foundations/tooling/code',
  published_at: new Date().toISOString(),
  modified_at: new Date().toISOString(),
  image: 'https://darianrosebrook.com/darianrosebrook.jpg',
  keywords:
    'code tooling, token generators, build processes, validation, type generation, Style Dictionary',
  learning: {
    learning_level: 'foundation',
    role_relevance: ['engineering', 'governance'],
    prerequisites: ['tokens', 'design'],
    next_units: ['automation'],
    assessment_required: false,
    estimated_reading_time: 15,
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
    expertise: [
      'Build Tools',
      'Token Generation',
      'Type Systems',
      'Validation',
    ],
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
    title: 'Why Code Tooling Matters',
    order: 3,
    content: (
      <>
        <p>
          Code tooling ensures your design tokens and components are implemented
          consistently and efficiently. When properly configured, code tools
          automate token generation, validation, and distribution, reducing
          manual effort and preventing errors.
        </p>
        <p>Code tooling serves multiple critical functions:</p>
        <ul>
          <li>
            <strong>Token Generation:</strong> Build processes transform tokens
            into CSS variables, TypeScript types, and platform-specific formats
          </li>
          <li>
            <strong>Validation:</strong> Tools validate token structure,
            references, and accessibility compliance
          </li>
          <li>
            <strong>Type Safety:</strong> TypeScript type generation ensures
            type-safe token usage
          </li>
          <li>
            <strong>Distribution:</strong> Tools distribute tokens across
            platforms (web, iOS, Android)
          </li>
          <li>
            <strong>Performance:</strong> Build-time generation enables
            optimized runtime performance
          </li>
        </ul>
        <p>
          A well-tooled code workflow ensures tokens are implemented correctly,
          consistently, and efficiently across all platforms.
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
        <h3>Token Build Pipeline</h3>
        <p>Token build pipelines transform tokens into usable formats:</p>
        <ul>
          <li>
            <strong>Composition:</strong> Merge core and semantic tokens into
            unified structure
          </li>
          <li>
            <strong>Resolution:</strong> Resolve token references to actual
            values
          </li>
          <li>
            <strong>Transformation:</strong> Transform tokens into platform
            formats (CSS, TypeScript, JSON)
          </li>
          <li>
            <strong>Validation:</strong> Validate token structure and
            constraints
          </li>
        </ul>
        <pre>
          <code>{`// Build pipeline steps
1. Compose: Merge core + semantic tokens
2. Resolve: Resolve references ({core.color.blue.600})
3. Transform: Generate CSS variables, TypeScript types
4. Validate: Check structure, references, accessibility
5. Output: Write generated files

// Example: tokens:build script
npm run tokens:build
→ Composes tokens
→ Generates CSS variables
→ Generates TypeScript types
→ Validates all tokens`}</code>
        </pre>

        <h3>CSS Variable Generation</h3>
        <p>CSS variable generation creates runtime token access:</p>
        <ul>
          <li>
            <strong>Format conversion:</strong> Convert token paths to CSS
            variable names
          </li>
          <li>
            <strong>Value resolution:</strong> Resolve token references to
            actual values
          </li>
          <li>
            <strong>Theme support:</strong> Generate variables for light/dark
            themes
          </li>
          <li>
            <strong>Optimization:</strong> Optimize variable structure for
            performance
          </li>
        </ul>
        <pre>
          <code>{`// Token JSON
{
  "semantic": {
    "color": {
      "foreground": {
        "primary": { "$value": "{core.color.palette.neutral.900}" }
      }
    }
  }
}

// Generated CSS
:root {
  --semantic-color-foreground-primary: var(--core-color-palette-neutral-900);
}

// Components use variables
.button {
  color: var(--semantic-color-foreground-primary);
}`}</code>
        </pre>

        <h3>TypeScript Type Generation</h3>
        <p>Type generation enables type-safe token usage:</p>
        <ul>
          <li>
            <strong>Token paths:</strong> Generate union types for all token
            paths
          </li>
          <li>
            <strong>Token values:</strong> Generate types for token values
          </li>
          <li>
            <strong>Validation:</strong> TypeScript validates token usage at
            compile time
          </li>
        </ul>
        <pre>
          <code>{`// Generated TypeScript types
type TokenPath =
  | 'semantic.color.foreground.primary'
  | 'semantic.color.foreground.secondary'
  | 'semantic.color.background.surface';

function getToken(path: TokenPath): string {
  // Implementation
}

// Type-safe token access
const color = getToken('semantic.color.foreground.primary'); // ✓
const invalid = getToken('invalid.path'); // ❌ TypeScript error`}</code>
        </pre>

        <h3>Token Validation</h3>
        <p>Validation ensures token correctness:</p>
        <ul>
          <li>
            <strong>Structure validation:</strong> Validate token structure
            against schema
          </li>
          <li>
            <strong>Reference validation:</strong> Ensure all references resolve
          </li>
          <li>
            <strong>Accessibility validation:</strong> Validate contrast ratios
            and accessibility constraints
          </li>
          <li>
            <strong>Naming validation:</strong> Ensure naming conventions are
            followed
          </li>
        </ul>
        <pre>
          <code>{`// Validation checks
1. Structure: Tokens match schema
2. References: All references resolve
3. Contrast: Color combinations meet WCAG
4. Naming: Follows naming conventions

// Validation errors
❌ Reference "{semantic.color.invalid}" not found
❌ Contrast ratio 2.5:1 fails WCAG AA (minimum 4.5:1)
❌ Token name "color-primary" doesn't follow convention`}</code>
        </pre>

        <h3>Platform Distribution</h3>
        <p>Platform distribution enables multi-platform support:</p>
        <ul>
          <li>
            <strong>Web:</strong> CSS variables, SCSS variables
          </li>
          <li>
            <strong>iOS:</strong> Swift enums, Asset catalogs
          </li>
          <li>
            <strong>Android:</strong> XML resources, Kotlin objects
          </li>
          <li>
            <strong>Design tools:</strong> Figma variables, Token Studio format
          </li>
        </ul>
        <p>
          Platform distribution ensures consistent tokens across all platforms.
        </p>
      </>
    ),
  },
  {
    type: 'system-roles',
    id: 'system-roles',
    title: 'System Roles: How Code Tooling Shapes System Success',
    order: 5,
    content: (
      <>
        <h3>Consistency Impact</h3>
        <p>Code tooling ensures consistency:</p>
        <ul>
          <li>
            <strong>Automated generation:</strong> Tokens generated consistently
            across all platforms
          </li>
          <li>
            <strong>Validation:</strong> Tools prevent inconsistent token usage
          </li>
          <li>
            <strong>Type safety:</strong> TypeScript types prevent token misuse
          </li>
        </ul>
        <p>
          Consistent systems use tooling to maintain token integrity across
          platforms.
        </p>

        <h3>Efficiency Impact</h3>
        <p>Code tooling improves efficiency:</p>
        <ul>
          <li>
            <strong>Automation:</strong> Reduces manual token conversion effort
          </li>
          <li>
            <strong>Early detection:</strong> Validation catches issues during
            build
          </li>
          <li>
            <strong>Multi-platform:</strong> Single source generates multiple
            formats
          </li>
        </ul>
        <p>Efficient workflows use tooling to scale token distribution.</p>

        <h3>Quality Impact</h3>
        <p>Code tooling improves quality:</p>
        <ul>
          <li>
            <strong>Validation:</strong> Tools catch errors before production
          </li>
          <li>
            <strong>Type safety:</strong> TypeScript prevents runtime errors
          </li>
          <li>
            <strong>Accessibility:</strong> Validation ensures accessibility
            compliance
          </li>
        </ul>
        <p>
          Quality systems use tooling to maintain standards throughout codebase.
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
          Code tooling bridges design intent and code implementation. Let's
          examine how tokens flow from JSON to working code.
        </p>

        <h3>Input: Token JSON Files</h3>
        <p>Token JSON files define tokens:</p>
        <pre>
          <code>{`// core/color.tokens.json
{
  "core": {
    "color": {
      "palette": {
        "blue": {
          "600": { "$type": "color", "$value": "#2563EB" }
        }
      }
    }
  }
}

// semantic/color.tokens.json
{
  "semantic": {
    "color": {
      "foreground": {
        "primary": {
          "$type": "color",
          "$value": "{core.color.palette.blue.600}"
        }
      }
    }
  }
}`}</code>
        </pre>

        <h3>Build Process: Composition</h3>
        <p>Build process composes tokens:</p>
        <pre>
          <code>{`// Build step 1: Compose tokens
npm run tokens:compose

// Merges core and semantic tokens
// Resolves references
// Outputs unified token file

// Output: designTokens.json
{
  "core": { ... },
  "semantic": { ... }
}`}</code>
        </pre>

        <h3>Build Process: CSS Generation</h3>
        <p>Build process generates CSS variables:</p>
        <pre>
          <code>{`// Build step 2: Generate CSS
npm run tokens:global

// Transforms tokens to CSS variables
// Outputs: styles/designTokens.css

:root {
  --core-color-palette-blue-600: #2563EB;
  --semantic-color-foreground-primary: var(--core-color-palette-blue-600);
}

// Components use variables
.button {
  color: var(--semantic-color-foreground-primary);
}`}</code>
        </pre>

        <h3>Build Process: Type Generation</h3>
        <p>Build process generates TypeScript types:</p>
        <pre>
          <code>{`// Build step 3: Generate types
npm run tokens:types

// Generates TypeScript types
// Outputs: types/designTokens.ts

export type TokenPath =
  | 'core.color.palette.blue.600'
  | 'semantic.color.foreground.primary';

export function getToken(path: TokenPath): string {
  // Implementation
}

// Type-safe usage
const color = getToken('semantic.color.foreground.primary'); // ✓`}</code>
        </pre>

        <h3>Build Process: Validation</h3>
        <p>Build process validates tokens:</p>
        <pre>
          <code>{`// Build step 4: Validate tokens
npm run tokens:validate

// Validates:
// - Token structure
// - Reference resolution
// - Contrast ratios
// - Naming conventions

// Errors prevent build completion
❌ Reference "{semantic.color.invalid}" not found
❌ Contrast ratio fails WCAG AA
✓ All tokens valid`}</code>
        </pre>

        <h3>Real-World Impact</h3>
        <p>
          A well-implemented code tooling workflow ensures tokens are
          implemented correctly and consistently. Token JSON files define
          tokens. Build processes transform tokens into CSS variables and
          TypeScript types. Validation ensures token correctness. When tools are
          integrated effectively, token changes flow automatically from JSON to
          code, maintaining consistency across all platforms.
        </p>
        <p>
          Understanding code tooling helps practitioners create workflows that
          maintain token integrity and enable efficient multi-platform
          distribution.
        </p>
      </>
    ),
  },
  {
    type: 'applied-example',
    id: 'applied-example',
    title: 'Applied Example: Building a Token Build Pipeline',
    order: 7,
    content: (
      <>
        <p>Let's build a token build pipeline from JSON to code:</p>

        <h3>Step 1: Define Token JSON Files</h3>
        <p>Create token JSON files:</p>
        <pre>
          <code>{`// core/color.tokens.json
{
  "core": {
    "color": {
      "palette": {
        "blue": {
          "600": { "$type": "color", "$value": "#2563EB" }
        }
      }
    }
  }
}

// semantic/color.tokens.json
{
  "semantic": {
    "color": {
      "foreground": {
        "primary": {
          "$type": "color",
          "$value": "{core.color.palette.blue.600}"
        }
      }
    }
  }
}`}</code>
        </pre>

        <h3>Step 2: Create Build Scripts</h3>
        <p>Create build scripts in package.json:</p>
        <pre>
          <code>{`// package.json
{
  "scripts": {
    "tokens:build": "tsx utils/designTokens/runners/build.ts",
    "tokens:compose": "tsx utils/designTokens/generators/compose.ts",
    "tokens:global": "tsx utils/designTokens/generators/global.ts",
    "tokens:types": "tsx utils/designTokens/generators/types.ts",
    "tokens:validate": "node utils/designTokens/validators/validateTokens.mjs"
  }
}

// Build pipeline
npm run tokens:build
→ Composes tokens
→ Generates CSS variables
→ Generates TypeScript types
→ Validates all tokens`}</code>
        </pre>

        <h3>Step 3: Generate CSS Variables</h3>
        <p>Generate CSS variables from tokens:</p>
        <pre>
          <code>{`// Generated CSS: styles/designTokens.css
:root {
  --core-color-palette-blue-600: #2563EB;
  --semantic-color-foreground-primary: var(--core-color-palette-blue-600);
}

// Components use variables
.button {
  color: var(--semantic-color-foreground-primary);
}`}</code>
        </pre>

        <h3>Step 4: Generate TypeScript Types</h3>
        <p>Generate TypeScript types from tokens:</p>
        <pre>
          <code>{`// Generated types: types/designTokens.ts
export type TokenPath =
  | 'core.color.palette.blue.600'
  | 'semantic.color.foreground.primary';

export function getToken(path: TokenPath): string {
  // Implementation resolves token path to CSS variable
  return \`var(--\${path.replace(/\\./g, '-')})\`;
}

// Type-safe usage
const color = getToken('semantic.color.foreground.primary'); // ✓`}</code>
        </pre>

        <h3>Step 5: Validate Tokens</h3>
        <p>Validate tokens during build:</p>
        <pre>
          <code>{`// Validation checks
npm run tokens:validate

// Validates:
// ✓ Token structure matches schema
// ✓ All references resolve
// ✓ Contrast ratios meet WCAG AA
// ✓ Naming conventions followed

// Build fails if validation fails`}</code>
        </pre>

        <h3>Benefits of This Approach</h3>
        <ul>
          <li>
            <strong>Consistency:</strong> Tokens generated consistently across
            all formats
          </li>
          <li>
            <strong>Type safety:</strong> TypeScript types prevent token misuse
          </li>
          <li>
            <strong>Validation:</strong> Errors caught during build
          </li>
          <li>
            <strong>Efficiency:</strong> Automated generation reduces manual
            effort
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
        <p>Code tooling faces several challenges:</p>

        <h4>Build Complexity</h4>
        <p>Build processes can become complex:</p>
        <ul>
          <li>
            <strong>Problem:</strong> Many build steps increase complexity
          </li>
          <li>
            <strong>Solution:</strong> Use build runners, document pipeline,
            provide clear error messages
          </li>
          <li>
            <strong>Guideline:</strong> Keep build steps focused and composable
          </li>
        </ul>

        <h4>Platform Differences</h4>
        <p>Different platforms require different formats:</p>
        <ul>
          <li>
            <strong>Challenge:</strong> CSS, TypeScript, iOS, Android formats
            differ
          </li>
          <li>
            <strong>Approach:</strong> Use format transformers, maintain
            platform-specific generators
          </li>
          <li>
            <strong>Tradeoff:</strong> Platform support vs. build complexity
          </li>
        </ul>

        <h4>Incremental Builds</h4>
        <p>Incremental builds require careful tracking:</p>
        <ul>
          <li>
            <strong>Challenge:</strong> Determining which files changed and need
            regeneration
          </li>
          <li>
            <strong>Approach:</strong> Track file modification times, use
            dependency graphs
          </li>
          <li>
            <strong>Tradeoff:</strong> Build speed vs. accuracy
          </li>
        </ul>

        <h3>Tradeoffs</h3>
        <p>Code tooling involves several tradeoffs:</p>

        <h4>Build Speed vs. Accuracy</h4>
        <ul>
          <li>
            <strong>Fast builds:</strong> Incremental builds, but may miss
            changes
          </li>
          <li>
            <strong>Accurate builds:</strong> Full rebuilds, but slower
          </li>
          <li>
            <strong>Best practice:</strong> Use incremental builds for
            development, full rebuilds for CI/CD
          </li>
        </ul>

        <h4>Type Generation vs. Runtime</h4>
        <ul>
          <li>
            <strong>Type generation:</strong> Build-time types, but requires
            build step
          </li>
          <li>
            <strong>Runtime types:</strong> No build step, but less type safety
          </li>
          <li>
            <strong>Best practice:</strong> Use build-time types for type-safe
            token access
          </li>
        </ul>

        <h4>Validation: Strict vs. Lenient</h4>
        <ul>
          <li>
            <strong>Strict validation:</strong> Catches more issues, but may
            have false positives
          </li>
          <li>
            <strong>Lenient validation:</strong> Fewer false positives, but may
            miss issues
          </li>
          <li>
            <strong>Best practice:</strong> Start strict, adjust based on team
            feedback
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
        <p>Continue learning about code tooling:</p>
        <ul>
          <li>
            <Link href="/blueprints/foundations/tokens">Design Tokens</Link>:
            Foundation of token systems
          </li>
          <li>
            <Link href="/blueprints/foundations/tooling/design">
              Design Tooling
            </Link>
            : Design-side tooling
          </li>
          <li>
            <Link href="/blueprints/foundations/tooling/automation">
              Automation & CI/CD
            </Link>
            : Automated build workflows
          </li>
          <li>
            <Link href="/blueprints/foundations/accessibility/tooling">
              Accessibility Tooling
            </Link>
            : Accessibility validation tools
          </li>
        </ul>
        <p>
          Related glossary terms:{' '}
          <Link href="/blueprints/glossary#tokens">Design Tokens</Link>,{' '}
          <Link href="/blueprints/glossary#build">Build Process</Link>,{' '}
          <Link href="/blueprints/glossary#validation">Validation</Link>
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
      slug: 'design',
      title: 'Design Tooling',
      description: 'Design-side tooling',
      type: 'foundation',
    },
    {
      slug: 'automation',
      title: 'Automation & CI/CD',
      description: 'Automated build workflows',
      type: 'foundation',
    },
  ],
  components: [],
  glossary: ['tokens', 'build', 'validation'],
};

// Add verification checklist
content.verificationChecklist = [
  {
    id: 'build-pipeline-configured',
    label: 'Build pipeline configured',
    description: 'Token build pipeline configured and working',
    required: true,
  },
  {
    id: 'css-generation-setup',
    label: 'CSS generation setup',
    description: 'CSS variable generation configured',
    required: true,
  },
  {
    id: 'type-generation-setup',
    label: 'Type generation setup',
    description: 'TypeScript type generation configured',
    required: false,
  },
  {
    id: 'validation-configured',
    label: 'Validation configured',
    description: 'Token validation configured in build process',
    required: true,
  },
];

// Add assessment prompts
content.assessmentPrompts = [
  {
    question:
      'How do build processes ensure token consistency across platforms? Provide examples.',
    type: 'reflection',
  },
  {
    question:
      'Explain how TypeScript type generation enables type-safe token usage. Provide a concrete example.',
    type: 'application',
  },
  {
    question:
      'What are the tradeoffs between incremental and full builds? When would you choose each approach?',
    type: 'reflection',
  },
];

export const metadata = generateFoundationMetadata(pageMetadata);

export default function CodeToolingPage() {
  return <FoundationPage content={content} />;
}
