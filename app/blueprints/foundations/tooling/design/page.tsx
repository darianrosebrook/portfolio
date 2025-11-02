/**
 * Foundation: Design Tooling
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
  title: 'Design Tooling',
  description:
    'Explore design-side tools like Token Studio, Figma variables, and plugins for building and maintaining design system foundations. Learn how to sync tokens between design and code.',
  slug: 'design',
  canonicalUrl:
    'https://darianrosebrook.com/blueprints/foundations/tooling/design',
  published_at: new Date().toISOString(),
  modified_at: new Date().toISOString(),
  image: 'https://darianrosebrook.com/darianrosebrook.jpg',
  keywords:
    'design tooling, Figma, Token Studio, design tokens, plugins, sync, variables',
  learning: {
    learning_level: 'foundation',
    role_relevance: ['design', 'engineering', 'governance'],
    prerequisites: ['tokens'],
    next_units: ['code', 'automation'],
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
    expertise: ['Design Tools', 'Figma', 'Token Management', 'Workflow'],
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
    title: 'Why Design Tooling Matters',
    order: 3,
    content: (
      <>
        <p>
          Design tooling bridges the gap between design and development,
          ensuring consistency and efficiency in your workflow. When properly
          configured, design tools enable designers to work with the same tokens
          that developers use in code, creating a single source of truth.
        </p>
        <p>Design tooling serves multiple critical functions:</p>
        <ul>
          <li>
            <strong>Token Management:</strong> Tools like Token Studio enable
            visual token editing and management
          </li>
          <li>
            <strong>Design-Code Sync:</strong> Synchronization tools keep design
            and code tokens aligned
          </li>
          <li>
            <strong>Accessibility Validation:</strong> Plugins validate contrast
            and accessibility during design
          </li>
          <li>
            <strong>Component Libraries:</strong> Figma libraries enable shared
            component usage
          </li>
          <li>
            <strong>Workflow Efficiency:</strong> Tools streamline design system
            workflows
          </li>
        </ul>
        <p>
          A well-tooled design workflow ensures designers and developers work
          from the same foundation, reducing misalignment and rework.
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
        <h3>Figma Variables</h3>
        <p>Figma variables provide native token support:</p>
        <ul>
          <li>
            <strong>Variable types:</strong> Color, number, string, boolean
          </li>
          <li>
            <strong>Modes:</strong> Support for light/dark themes, breakpoints
          </li>
          <li>
            <strong>Collections:</strong> Organize variables into logical groups
          </li>
          <li>
            <strong>Aliases:</strong> Reference other variables for semantic
            tokens
          </li>
        </ul>
        <pre>
          <code>{`// Figma variable structure
Variables Collection: "Core Colors"
  - Brand/500: #2563EB
  - Neutral/900: #111827

Variables Collection: "Semantic Colors"
  - Foreground/Primary: {Brand/500}
  - Background/Surface: {Neutral/50}

// Variables can be used in:
// - Fill colors
// - Text styles
// - Effects
// - Layout grids`}</code>
        </pre>

        <h3>Token Studio</h3>
        <p>Token Studio provides advanced token management:</p>
        <ul>
          <li>
            <strong>Visual editing:</strong> Edit tokens visually, not just JSON
          </li>
          <li>
            <strong>Sync with code:</strong> Sync tokens between design and code
            repositories
          </li>
          <li>
            <strong>Multi-platform:</strong> Export tokens for web, iOS, Android
          </li>
          <li>
            <strong>Version control:</strong> Track token changes over time
          </li>
        </ul>
        <pre>
          <code>{`// Token Studio workflow
1. Edit tokens in Token Studio UI
2. Tokens sync to Figma variables
3. Tokens sync to code repository
4. Build process generates CSS/SCSS
5. Components use generated tokens

// Benefits:
// - Single source of truth
// - Visual editing for designers
// - Code sync for developers
// - Version control integration`}</code>
        </pre>

        <h3>Accessibility Plugins</h3>
        <p>Figma plugins validate accessibility during design:</p>
        <ul>
          <li>
            <strong>Stark:</strong> Contrast checking, color blindness
            simulation
          </li>
          <li>
            <strong>Able:</strong> Accessibility annotations and documentation
          </li>
          <li>
            <strong>Contrast:</strong> WCAG contrast validation
          </li>
          <li>
            <strong>Accessibility Annotations:</strong> Document accessibility
            requirements
          </li>
        </ul>
        <p>Accessibility plugins catch issues before code is written.</p>

        <h3>Component Libraries</h3>
        <p>Figma libraries enable shared component usage:</p>
        <ul>
          <li>
            <strong>Component definitions:</strong> Define components once, use
            everywhere
          </li>
          <li>
            <strong>Variants:</strong> Manage component variants in libraries
          </li>
          <li>
            <strong>Properties:</strong> Component properties enable flexible
            usage
          </li>
          <li>
            <strong>Sync:</strong> Library updates sync to all files
          </li>
        </ul>
        <p>
          Component libraries ensure consistent component usage across design
          files.
        </p>

        <h3>Token Sync Workflows</h3>
        <p>Token sync workflows keep design and code aligned:</p>
        <ul>
          <li>
            <strong>Design-first:</strong> Tokens originate in design tools,
            sync to code
          </li>
          <li>
            <strong>Code-first:</strong> Tokens originate in code, sync to
            design tools
          </li>
          <li>
            <strong>Hybrid:</strong> Tokens managed in both, with sync
            validation
          </li>
        </ul>
        <p>Choose workflows based on team structure and preferences.</p>
      </>
    ),
  },
  {
    type: 'system-roles',
    id: 'system-roles',
    title: 'System Roles: How Design Tooling Shapes System Success',
    order: 5,
    content: (
      <>
        <h3>Consistency Impact</h3>
        <p>Design tooling ensures consistency:</p>
        <ul>
          <li>
            <strong>Single source of truth:</strong> Tokens shared between
            design and code
          </li>
          <li>
            <strong>Reduced misalignment:</strong> Design and code use same
            tokens
          </li>
          <li>
            <strong>Component reuse:</strong> Libraries enable consistent
            component usage
          </li>
        </ul>
        <p>
          Consistent systems use tooling to maintain alignment between design
          and code.
        </p>

        <h3>Efficiency Impact</h3>
        <p>Design tooling improves efficiency:</p>
        <ul>
          <li>
            <strong>Workflow automation:</strong> Tools automate repetitive
            tasks
          </li>
          <li>
            <strong>Early validation:</strong> Plugins catch issues during
            design
          </li>
          <li>
            <strong>Reduced rework:</strong> Sync prevents misalignment
          </li>
        </ul>
        <p>Efficient workflows use tooling to scale design system efforts.</p>

        <h3>Quality Impact</h3>
        <p>Design tooling improves quality:</p>
        <ul>
          <li>
            <strong>Accessibility validation:</strong> Plugins catch
            accessibility issues early
          </li>
          <li>
            <strong>Token validation:</strong> Tools validate token structure
            and usage
          </li>
          <li>
            <strong>Component consistency:</strong> Libraries ensure consistent
            component usage
          </li>
        </ul>
        <p>
          Quality systems use tooling to maintain standards throughout design
          workflow.
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
          Design tooling bridges design intent and code implementation. Let's
          examine how tokens flow between design tools and code.
        </p>

        <h3>Design: Token Creation in Figma</h3>
        <p>Designers create tokens in Figma:</p>
        <pre>
          <code>{`// Figma: Create variables
1. Open Variables panel
2. Create collection: "Core Colors"
3. Add variable: Brand/500 = #2563EB
4. Create collection: "Semantic Colors"
5. Add variable: Foreground/Primary = {Brand/500}

// Variables automatically available in:
// - Fill colors
// - Text styles
// - Effects
// - Layout grids`}</code>
        </pre>

        <h3>Design: Token Sync to Code</h3>
        <p>Tokens sync from Figma to code:</p>
        <pre>
          <code>{`// Token Studio: Sync tokens
1. Token Studio reads Figma variables
2. Tokens exported to JSON
3. JSON synced to code repository
4. Build process generates CSS variables

// Generated CSS
:root {
  --core-color-brand-500: #2563EB;
  --semantic-color-foreground-primary: var(--core-color-brand-500);
}

// Components use tokens
.button {
  color: var(--semantic-color-foreground-primary);
}`}</code>
        </pre>

        <h3>Code: Token Sync to Design</h3>
        <p>Tokens can sync from code to design:</p>
        <pre>
          <code>{`// Code-first workflow
1. Tokens defined in code: ui/designTokens/core/color.tokens.json
2. Build process generates Figma-compatible JSON
3. Token Studio imports tokens
4. Figma variables updated automatically

// Benefits:
// - Code is source of truth
// - Design tools stay in sync
// - Version control for tokens`}</code>
        </pre>

        <h3>Design: Accessibility Validation</h3>
        <p>Design tools validate accessibility:</p>
        <pre>
          <code>{`// Stark plugin workflow
1. Select text layer
2. Select background layer
3. Stark shows contrast ratio: 12.6:1 (WCAG AAA)
4. Stark shows color blindness simulation
5. Designer adjusts if needed

// Contrast plugin
1. Select colors
2. Plugin validates: Passes WCAG AA
3. Plugin suggests improvements if needed

// Issues caught before code is written`}</code>
        </pre>

        <h3>Real-World Impact</h3>
        <p>
          A well-tooled design workflow ensures consistency between design and
          code. Tokens created in Figma sync to code automatically. Tokens
          created in code sync to Figma automatically. Accessibility plugins
          catch issues during design. Component libraries ensure consistent
          usage. When tools are integrated effectively, design and code
          workflows reinforce each other, creating a single source of truth.
        </p>
        <p>
          Understanding design tooling helps practitioners create workflows that
          maintain consistency and efficiency across design and development
          teams.
        </p>
      </>
    ),
  },
  {
    type: 'applied-example',
    id: 'applied-example',
    title: 'Applied Example: Setting Up Token Sync Workflow',
    order: 7,
    content: (
      <>
        <p>Let's set up a token sync workflow between Figma and code:</p>

        <h3>Step 1: Configure Figma Variables</h3>
        <p>Create variables in Figma:</p>
        <pre>
          <code>{`// Figma: Create variable collections
Collections:
  - Core Colors
    - Brand/500: #2563EB
    - Neutral/900: #111827
  
  - Semantic Colors
    - Foreground/Primary: {Core Colors.Brand/500}
    - Background/Surface: {Core Colors.Neutral/50}

// Use variables in:
// - Component fills
// - Text styles
// - Effects`}</code>
        </pre>

        <h3>Step 2: Setup Token Studio</h3>
        <p>Configure Token Studio for sync:</p>
        <pre>
          <code>{`// Token Studio configuration
{
  "sync": {
    "figma": {
      "fileId": "abc123",
      "collections": ["Core Colors", "Semantic Colors"]
    },
    "code": {
      "repository": "github.com/org/repo",
      "path": "ui/designTokens",
      "format": "json"
    }
  }
}

// Token Studio syncs:
// - Figma → Code (design-first)
// - Code → Figma (code-first)
// - Bidirectional sync`}</code>
        </pre>

        <h3>Step 3: Setup Build Process</h3>
        <p>Configure build process to generate CSS:</p>
        <pre>
          <code>{`// Build process
1. Token Studio exports tokens to JSON
2. Build process reads JSON
3. Generates CSS variables
4. Components use CSS variables

// Generated CSS
:root {
  --core-color-brand-500: #2563EB;
  --semantic-color-foreground-primary: var(--core-color-brand-500);
}

// Components
.button {
  color: var(--semantic-color-foreground-primary);
}`}</code>
        </pre>

        <h3>Step 4: Install Accessibility Plugins</h3>
        <p>Install plugins for accessibility validation:</p>
        <pre>
          <code>{`// Figma plugins
1. Install Stark plugin
   - Contrast checking
   - Color blindness simulation
   
2. Install Contrast plugin
   - WCAG validation
   - Contrast ratio display

3. Use plugins during design
   - Validate contrast before finalizing
   - Check color blindness compatibility`}</code>
        </pre>

        <h3>Benefits of This Approach</h3>
        <ul>
          <li>
            <strong>Consistency:</strong> Design and code use same tokens
          </li>
          <li>
            <strong>Efficiency:</strong> Changes sync automatically
          </li>
          <li>
            <strong>Quality:</strong> Accessibility validated during design
          </li>
          <li>
            <strong>Workflow:</strong> Streamlined design-to-code process
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
        <p>Design tooling faces several challenges:</p>

        <h4>Sync Complexity</h4>
        <p>Token sync can be complex:</p>
        <ul>
          <li>
            <strong>Problem:</strong> Conflicts between design and code tokens
          </li>
          <li>
            <strong>Solution:</strong> Establish single source of truth, use
            conflict resolution strategies
          </li>
          <li>
            <strong>Guideline:</strong> Document sync workflow clearly
          </li>
        </ul>

        <h4>Tool Limitations</h4>
        <p>Design tools have limitations:</p>
        <ul>
          <li>
            <strong>Challenge:</strong> Figma variables don't support all token
            types
          </li>
          <li>
            <strong>Approach:</strong> Use Token Studio for advanced features,
            Figma for basic sync
          </li>
          <li>
            <strong>Tradeoff:</strong> Native support vs. advanced features
          </li>
        </ul>

        <h4>Workflow Adoption</h4>
        <p>Teams may resist new workflows:</p>
        <ul>
          <li>
            <strong>Challenge:</strong> Learning curve for new tools
          </li>
          <li>
            <strong>Approach:</strong> Provide training, start small, show
            benefits
          </li>
          <li>
            <strong>Tradeoff:</strong> Investment vs. long-term efficiency
          </li>
        </ul>

        <h3>Tradeoffs</h3>
        <p>Design tooling involves several tradeoffs:</p>

        <h4>Design-First vs. Code-First</h4>
        <ul>
          <li>
            <strong>Design-first:</strong> Designers control tokens, but may
            conflict with code needs
          </li>
          <li>
            <strong>Code-first:</strong> Developers control tokens, but
            designers may feel disconnected
          </li>
          <li>
            <strong>Best practice:</strong> Hybrid approach with clear ownership
          </li>
        </ul>

        <h4>Native Tools vs. Plugins</h4>
        <ul>
          <li>
            <strong>Native tools:</strong> Better integration, but limited
            features
          </li>
          <li>
            <strong>Plugins:</strong> More features, but may break with updates
          </li>
          <li>
            <strong>Best practice:</strong> Use native tools for core workflow,
            plugins for enhancements
          </li>
        </ul>

        <h4>Automation vs. Manual Control</h4>
        <ul>
          <li>
            <strong>Automation:</strong> More efficient, but less control
          </li>
          <li>
            <strong>Manual control:</strong> More control, but less efficient
          </li>
          <li>
            <strong>Best practice:</strong> Automate sync, manual review for
            changes
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
        <p>Continue learning about design tooling:</p>
        <ul>
          <li>
            <Link href="/blueprints/foundations/tokens">Design Tokens</Link>:
            Foundation of token systems
          </li>
          <li>
            <Link href="/blueprints/foundations/tooling/code">
              Code Tooling
            </Link>
            : Code-side tooling for tokens
          </li>
          <li>
            <Link href="/blueprints/foundations/tooling/automation">
              Automation & CI/CD
            </Link>
            : Automated token sync workflows
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
          <Link href="/blueprints/glossary#figma">Figma</Link>,{' '}
          <Link href="/blueprints/glossary#sync">Sync</Link>
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
      slug: 'code',
      title: 'Code Tooling',
      description: 'Code-side tooling for tokens',
      type: 'foundation',
    },
    {
      slug: 'automation',
      title: 'Automation & CI/CD',
      description: 'Automated token sync workflows',
      type: 'foundation',
    },
  ],
  components: [],
  glossary: ['tokens', 'figma', 'sync'],
};

// Add verification checklist
content.verificationChecklist = [
  {
    id: 'figma-variables-configured',
    label: 'Figma variables configured',
    description: 'Figma variables set up for token management',
    required: true,
  },
  {
    id: 'token-sync-setup',
    label: 'Token sync setup',
    description: 'Token sync workflow configured between design and code',
    required: true,
  },
  {
    id: 'accessibility-plugins-installed',
    label: 'Accessibility plugins installed',
    description: 'Accessibility plugins installed in design tools',
    required: false,
  },
  {
    id: 'component-libraries-setup',
    label: 'Component libraries setup',
    description: 'Figma component libraries configured',
    required: true,
  },
];

// Add assessment prompts
content.assessmentPrompts = [
  {
    question:
      'When should you use design-first vs. code-first token workflows? Provide examples.',
    type: 'reflection',
  },
  {
    question:
      'Explain how token sync workflows maintain consistency between design and code. Provide a concrete example.',
    type: 'application',
  },
  {
    question:
      'What are the tradeoffs between native design tools and plugins? How do you balance them?',
    type: 'reflection',
  },
];

export const metadata = generateFoundationMetadata(pageMetadata);

export default function DesignToolingPage() {
  return <FoundationPage content={content} />;
}
