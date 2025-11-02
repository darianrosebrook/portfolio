/**
 * Foundation: Automation & CI/CD
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
  title: 'Automation & CI/CD',
  description:
    'Learn how to automate token distribution, theme switching, and documentation updates for scalable, maintainable design systems. Understand CI/CD workflows, preview deployments, and validation pipelines.',
  slug: 'automation',
  canonicalUrl:
    'https://darianrosebrook.com/blueprints/foundations/tooling/automation',
  published_at: new Date().toISOString(),
  modified_at: new Date().toISOString(),
  image: 'https://darianrosebrook.com/darianrosebrook.jpg',
  keywords:
    'automation, CI/CD, GitHub Actions, token distribution, validation, preview deployments',
  learning: {
    learning_level: 'foundation',
    role_relevance: ['engineering', 'governance'],
    prerequisites: ['code', 'design'],
    next_units: [],
    assessment_required: false,
    estimated_reading_time: 16,
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
    expertise: ['CI/CD', 'Automation', 'GitHub Actions', 'Validation'],
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
    title: 'Why Automation & CI/CD Matters',
    order: 3,
    content: (
      <>
        <p>
          Automation ensures your design system remains consistent and
          up-to-date across all platforms. CI/CD workflows automate token
          distribution, validation, and documentation updates, reducing manual
          effort and preventing errors.
        </p>
        <p>Automation and CI/CD serve multiple critical functions:</p>
        <ul>
          <li>
            <strong>Token Distribution:</strong> Automated workflows distribute
            tokens across platforms automatically
          </li>
          <li>
            <strong>Validation:</strong> CI/CD validates tokens, components, and
            accessibility before merge
          </li>
          <li>
            <strong>Documentation Updates:</strong> Automated documentation
            generation keeps docs in sync
          </li>
          <li>
            <strong>Preview Deployments:</strong> Preview deployments enable
            visual review before merge
          </li>
          <li>
            <strong>Consistency:</strong> Automated workflows ensure consistent
            processes across teams
          </li>
        </ul>
        <p>
          A well-automated design system workflow ensures consistency, quality,
          and efficiency across all development processes.
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
        <h3>CI/CD Workflows</h3>
        <p>CI/CD workflows automate design system processes:</p>
        <ul>
          <li>
            <strong>Continuous Integration:</strong> Validate changes on every
            commit and pull request
          </li>
          <li>
            <strong>Continuous Deployment:</strong> Deploy changes automatically
            after validation
          </li>
          <li>
            <strong>Quality Gates:</strong> Prevent merges if validation fails
          </li>
          <li>
            <strong>Parallel Execution:</strong> Run validations in parallel for
            speed
          </li>
        </ul>
        <pre>
          <code>{`// GitHub Actions workflow
name: Design System Validation

on:
  pull_request:
    types: [opened, synchronize, reopened]
  push:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
      - name: Install dependencies
        run: npm ci
      - name: Build tokens
        run: npm run tokens:build
      - name: Validate tokens
        run: npm run tokens:validate
      - name: Run tests
        run: npm run test`}</code>
        </pre>

        <h3>Token Validation Pipeline</h3>
        <p>Token validation pipelines ensure token correctness:</p>
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
          <code>{`// Validation pipeline
1. Build tokens
   npm run tokens:build

2. Validate structure
   npm run tokens:validate

3. Validate references
   npm run tokens:inspect

4. Validate accessibility
   npm run tokens:validate -- --accessibility

// Fails build if validation fails`}</code>
        </pre>

        <h3>Preview Deployments</h3>
        <p>Preview deployments enable visual review:</p>
        <ul>
          <li>
            <strong>Per-PR deployments:</strong> Deploy each PR to preview
            environment
          </li>
          <li>
            <strong>Visual regression:</strong> Compare screenshots between
            versions
          </li>
          <li>
            <strong>Accessibility testing:</strong> Run accessibility tests on
            preview
          </li>
          <li>
            <strong>Performance testing:</strong> Run performance tests on
            preview
          </li>
        </ul>
        <pre>
          <code>{`// Preview deployment workflow
name: Preview Deployment

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  preview:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build
        run: npm run build
      - name: Deploy preview
        uses: netlify/action@v2
        with:
          publish-dir: .next
          production-deploy: false
      
      # Preview URL posted as PR comment`}</code>
        </pre>

        <h3>Documentation Automation</h3>
        <p>Documentation automation keeps docs in sync:</p>
        <ul>
          <li>
            <strong>Token documentation:</strong> Generate token docs from JSON
          </li>
          <li>
            <strong>Component documentation:</strong> Generate component docs
            from code
          </li>
          <li>
            <strong>API documentation:</strong> Generate API docs from
            TypeScript
          </li>
          <li>
            <strong>Changelog generation:</strong> Generate changelogs from git
            commits
          </li>
        </ul>
        <p>
          Automated documentation ensures docs stay current with code changes.
        </p>

        <h3>Multi-Platform Distribution</h3>
        <p>Multi-platform distribution automates token delivery:</p>
        <ul>
          <li>
            <strong>Package publishing:</strong> Publish token packages to npm
          </li>
          <li>
            <strong>Design tool sync:</strong> Sync tokens to Figma via API
          </li>
          <li>
            <strong>Platform exports:</strong> Generate platform-specific
            formats (iOS, Android)
          </li>
          <li>
            <strong>CDN distribution:</strong> Distribute tokens via CDN
          </li>
        </ul>
        <p>
          Multi-platform distribution ensures tokens reach all consumers
          automatically.
        </p>
      </>
    ),
  },
  {
    type: 'system-roles',
    id: 'system-roles',
    title: 'System Roles: How Automation Shapes System Success',
    order: 5,
    content: (
      <>
        <h3>Quality Impact</h3>
        <p>Automation improves quality:</p>
        <ul>
          <li>
            <strong>Early detection:</strong> Issues caught before merge
          </li>
          <li>
            <strong>Consistent validation:</strong> Same validation for all
            changes
          </li>
          <li>
            <strong>Prevent regressions:</strong> Automated tests prevent
            breaking changes
          </li>
        </ul>
        <p>
          Quality systems use automation to maintain standards throughout
          development.
        </p>

        <h3>Efficiency Impact</h3>
        <p>Automation improves efficiency:</p>
        <ul>
          <li>
            <strong>Reduced manual effort:</strong> Automation handles
            repetitive tasks
          </li>
          <li>
            <strong>Faster feedback:</strong> Automated checks provide immediate
            feedback
          </li>
          <li>
            <strong>Parallel execution:</strong> Multiple checks run
            simultaneously
          </li>
        </ul>
        <p>
          Efficient workflows use automation to scale design system operations.
        </p>

        <h3>Consistency Impact</h3>
        <p>Automation ensures consistency:</p>
        <ul>
          <li>
            <strong>Standardized processes:</strong> All changes go through same
            validation
          </li>
          <li>
            <strong>Reduced human error:</strong> Automation prevents manual
            mistakes
          </li>
          <li>
            <strong>Predictable outcomes:</strong> Automated processes produce
            consistent results
          </li>
        </ul>
        <p>
          Consistent systems use automation to enforce standards across all
          changes.
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
          Automation bridges design intent and code implementation. Let's
          examine how CI/CD workflows automate design system processes.
        </p>

        <h3>Pull Request: Token Validation</h3>
        <p>CI/CD validates tokens on every PR:</p>
        <pre>
          <code>{`// GitHub Actions: Token validation
name: Token Validation

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  validate-tokens:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
      - name: Install dependencies
        run: npm ci
      - name: Build tokens
        run: npm run tokens:build
      - name: Validate tokens
        run: npm run tokens:validate
      - name: Validate references
        run: npm run tokens:inspect

// PR comments show validation results
✓ Token structure valid
✓ All references resolve
✓ Contrast ratios meet WCAG AA`}</code>
        </pre>

        <h3>Pull Request: Component Validation</h3>
        <p>CI/CD validates components on every PR:</p>
        <pre>
          <code>{`// Component validation workflow
jobs:
  validate-components:
    runs-on: ubuntu-latest
    steps:
      - name: Validate components
        run: npm run validate:components
      
      - name: Run accessibility tests
        run: npm run test:a11y
      
      - name: Run visual regression tests
        run: npm run test:e2e

// Validates:
// - Component structure
// - Accessibility compliance
// - Visual consistency`}</code>
        </pre>

        <h3>Pull Request: Preview Deployment</h3>
        <p>CI/CD deploys previews for visual review:</p>
        <pre>
          <code>{`// Preview deployment workflow
jobs:
  preview:
    runs-on: ubuntu-latest
    steps:
      - name: Build application
        run: npm run build
      
      - name: Deploy preview
        uses: netlify/action@v2
        with:
          publish-dir: .next
          production-deploy: false
      
      - name: Comment PR
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              body: 'Preview: https://preview-123.netlify.app'
            })

// Preview URL posted as PR comment`}</code>
        </pre>

        <h3>Main Branch: Token Distribution</h3>
        <p>CI/CD distributes tokens on merge to main:</p>
        <pre>
          <code>{`// Token distribution workflow
on:
  push:
    branches: [main]

jobs:
  distribute-tokens:
    runs-on: ubuntu-latest
    steps:
      - name: Build tokens
        run: npm run tokens:build
      
      - name: Publish to npm
        run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: \${{ secrets.NPM_TOKEN }}
      
      - name: Sync to Figma
        run: npm run tokens:sync:figma
        env:
          FIGMA_TOKEN: \${{ secrets.FIGMA_TOKEN }}

// Tokens distributed automatically on merge`}</code>
        </pre>

        <h3>Real-World Impact</h3>
        <p>
          A well-automated CI/CD workflow ensures design system consistency and
          quality. Token validation prevents broken tokens. Component validation
          prevents accessibility regressions. Preview deployments enable visual
          review. Token distribution ensures all platforms stay in sync. When
          automation is integrated effectively, design system changes flow
          smoothly from development to production, maintaining quality and
          consistency throughout.
        </p>
        <p>
          Understanding automation and CI/CD helps practitioners create
          workflows that maintain design system quality and enable efficient
          multi-platform distribution.
        </p>
      </>
    ),
  },
  {
    type: 'applied-example',
    id: 'applied-example',
    title: 'Applied Example: Building a CI/CD Pipeline',
    order: 7,
    content: (
      <>
        <p>
          Let's build a comprehensive CI/CD pipeline for design system
          automation:
        </p>

        <h3>Step 1: Token Validation Workflow</h3>
        <p>Create workflow for token validation:</p>
        <pre>
          <code>{`// .github/workflows/tokens.yml
name: Token Validation

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install dependencies
        run: npm ci
      - name: Build tokens
        run: npm run tokens:build
      - name: Validate tokens
        run: npm run tokens:validate
      - name: Validate references
        run: npm run tokens:inspect`}</code>
        </pre>

        <h3>Step 2: Component Validation Workflow</h3>
        <p>Create workflow for component validation:</p>
        <pre>
          <code>{`// .github/workflows/components.yml
name: Component Validation

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
      - name: Install dependencies
        run: npm ci
      - name: Build tokens
        run: npm run tokens:build
      - name: Validate components
        run: npm run validate:components
      - name: Run accessibility tests
        run: npm run test:a11y`}</code>
        </pre>

        <h3>Step 3: Preview Deployment Workflow</h3>
        <p>Create workflow for preview deployments:</p>
        <pre>
          <code>{`// .github/workflows/preview.yml
name: Preview Deployment

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  preview:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
      - name: Install dependencies
        run: npm ci
      - name: Build tokens
        run: npm run tokens:build
      - name: Build application
        run: npm run build
      - name: Deploy preview
        uses: netlify/action@v2
        with:
          publish-dir: .next
          production-deploy: false`}</code>
        </pre>

        <h3>Step 4: Token Distribution Workflow</h3>
        <p>Create workflow for token distribution:</p>
        <pre>
          <code>{`// .github/workflows/distribute.yml
name: Token Distribution

on:
  push:
    branches: [main]
    paths:
      - 'ui/designTokens/**'

jobs:
  distribute:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
      - name: Install dependencies
        run: npm ci
      - name: Build tokens
        run: npm run tokens:build
      - name: Publish to npm
        run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: \${{ secrets.NPM_TOKEN }}
`}</code>
        </pre>

        <h3>Benefits of This Approach</h3>
        <ul>
          <li>
            <strong>Quality:</strong> Issues caught before merge
          </li>
          <li>
            <strong>Efficiency:</strong> Automated workflows reduce manual
            effort
          </li>
          <li>
            <strong>Consistency:</strong> All changes go through same validation
          </li>
          <li>
            <strong>Distribution:</strong> Tokens distributed automatically
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
        <p>Automation and CI/CD face several challenges:</p>

        <h4>Workflow Complexity</h4>
        <p>Complex workflows can be difficult to maintain:</p>
        <ul>
          <li>
            <strong>Problem:</strong> Many workflow steps increase complexity
          </li>
          <li>
            <strong>Solution:</strong> Use workflow templates, document
            workflows, provide clear error messages
          </li>
          <li>
            <strong>Guideline:</strong> Keep workflows focused and composable
          </li>
        </ul>

        <h4>CI/CD Costs</h4>
        <p>CI/CD workflows consume resources:</p>
        <ul>
          <li>
            <strong>Challenge:</strong> Long-running workflows increase costs
          </li>
          <li>
            <strong>Approach:</strong> Use incremental builds, cache
            dependencies, optimize workflows
          </li>
          <li>
            <strong>Tradeoff:</strong> Build speed vs. resource costs
          </li>
        </ul>

        <h4>False Positives</h4>
        <p>Automated validation can produce false positives:</p>
        <ul>
          <li>
            <strong>Challenge:</strong> Validation may flag issues that aren't
            problems
          </li>
          <li>
            <strong>Approach:</strong> Tune validation rules, document
            exceptions, provide context
          </li>
          <li>
            <strong>Tradeoff:</strong> Strict validation vs. developer
            experience
          </li>
        </ul>

        <h3>Tradeoffs</h3>
        <p>Automation and CI/CD involve several tradeoffs:</p>

        <h4>Validation: Strict vs. Lenient</h4>
        <ul>
          <li>
            <strong>Strict validation:</strong> Catches more issues, but may
            block legitimate changes
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

        <h4>Deployment: Automatic vs. Manual</h4>
        <ul>
          <li>
            <strong>Automatic deployment:</strong> Faster delivery, but less
            control
          </li>
          <li>
            <strong>Manual deployment:</strong> More control, but slower
            delivery
          </li>
          <li>
            <strong>Best practice:</strong> Automatic for previews, manual
            approval for production
          </li>
        </ul>

        <h4>Parallel vs. Sequential Execution</h4>
        <ul>
          <li>
            <strong>Parallel execution:</strong> Faster feedback, but more
            resource usage
          </li>
          <li>
            <strong>Sequential execution:</strong> Less resource usage, but
            slower feedback
          </li>
          <li>
            <strong>Best practice:</strong> Use parallel for independent checks,
            sequential for dependencies
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
        <p>Continue learning about automation and CI/CD:</p>
        <ul>
          <li>
            <Link href="/blueprints/foundations/tooling/design">
              Design Tooling
            </Link>
            : Design-side tooling
          </li>
          <li>
            <Link href="/blueprints/foundations/tooling/code">
              Code Tooling
            </Link>
            : Code-side tooling
          </li>
          <li>
            <Link href="/blueprints/foundations/tokens">Design Tokens</Link>:
            Foundation of token systems
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
          <Link href="/blueprints/glossary#automation">Automation</Link>,{' '}
          <Link href="/blueprints/glossary#ci-cd">CI/CD</Link>,{' '}
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
      slug: 'design',
      title: 'Design Tooling',
      description: 'Design-side tooling',
      type: 'foundation',
    },
    {
      slug: 'code',
      title: 'Code Tooling',
      description: 'Code-side tooling',
      type: 'foundation',
    },
    {
      slug: 'tokens',
      title: 'Design Tokens',
      description: 'Foundation of token systems',
      type: 'foundation',
    },
  ],
  components: [],
  glossary: ['automation', 'ci-cd', 'validation'],
};

// Add verification checklist
content.verificationChecklist = [
  {
    id: 'ci-cd-workflows-configured',
    label: 'CI/CD workflows configured',
    description:
      'CI/CD workflows configured for token and component validation',
    required: true,
  },
  {
    id: 'validation-pipeline-setup',
    label: 'Validation pipeline setup',
    description: 'Validation pipeline configured in CI/CD',
    required: true,
  },
  {
    id: 'preview-deployments-configured',
    label: 'Preview deployments configured',
    description: 'Preview deployments configured for PRs',
    required: false,
  },
  {
    id: 'token-distribution-automated',
    label: 'Token distribution automated',
    description: 'Token distribution automated on merge to main',
    required: true,
  },
];

// Add assessment prompts
content.assessmentPrompts = [
  {
    question:
      'How do CI/CD workflows ensure design system quality? Provide examples.',
    type: 'reflection',
  },
  {
    question:
      'Explain how preview deployments enable visual review. Provide a concrete example.',
    type: 'application',
  },
  {
    question:
      'What are the tradeoffs between strict and lenient validation in CI/CD? How do you balance them?',
    type: 'reflection',
  },
];

export const metadata = generateFoundationMetadata(pageMetadata);

export default function AutomationPage() {
  return <FoundationPage content={content} />;
}
