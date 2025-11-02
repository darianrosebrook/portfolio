/**
 * Foundation: Accessibility Tooling
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
  title: 'Accessibility Tooling',
  description:
    'Explore tools like axe-core, Lighthouse, and Figma plugins for testing, validating, and enforcing accessibility. Learn how to integrate accessibility tooling into your workflow.',
  slug: 'tooling',
  canonicalUrl:
    'https://darianrosebrook.com/blueprints/foundations/accessibility/tooling',
  published_at: new Date().toISOString(),
  modified_at: new Date().toISOString(),
  image: 'https://darianrosebrook.com/darianrosebrook.jpg',
  keywords:
    'accessibility tooling, axe-core, Lighthouse, Figma plugins, testing, validation, automation',
  learning: {
    learning_level: 'foundation',
    role_relevance: ['design', 'engineering', 'a11y', 'qa'],
    prerequisites: ['accessibility', 'standards', 'assistive-tech'],
    next_units: ['tokens', 'standards'],
    assessment_required: false,
    estimated_reading_time: 15,
  },
  governance: {
    canonical_version: 'WCAG 2.1 AA',
    alignment_status: 'aligned',
    last_review_date: new Date().toISOString(),
    next_review_date: new Date(
      Date.now() + 90 * 24 * 60 * 60 * 1000
    ).toISOString(),
  },
  author: {
    name: 'Darian Rosebrook',
    role: 'Staff Design Technologist, Design Systems Architect',
    expertise: ['Accessibility Tooling', 'Testing', 'Automation', 'WCAG'],
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
    title: 'Why Accessibility Tooling Matters',
    order: 3,
    content: (
      <>
        <p>
          The right tools can help you maintain and improve accessibility
          throughout your development process. Accessibility tooling enables
          automated testing, real-time validation, and consistent enforcement of
          accessibility standards.
        </p>
        <p>Accessibility tooling serves multiple critical functions:</p>
        <ul>
          <li>
            <strong>Automated Testing:</strong> Tools catch accessibility issues
            automatically, reducing manual testing effort
          </li>
          <li>
            <strong>Early Detection:</strong> Tools identify issues during
            development, not in production
          </li>
          <li>
            <strong>Consistency:</strong> Tools enforce accessibility standards
            consistently across teams
          </li>
          <li>
            <strong>Education:</strong> Tools teach teams about accessibility
            issues and solutions
          </li>
          <li>
            <strong>Compliance:</strong> Tools help ensure WCAG compliance and
            legal protection
          </li>
        </ul>
        <p>
          A well-tooled accessibility workflow ensures accessibility is
          maintained throughout the development process, not just at the end.
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
        <h3>Automated Testing Tools</h3>
        <p>Automated testing tools catch many accessibility issues:</p>
        <ul>
          <li>
            <strong>axe-core:</strong> Industry-standard accessibility testing
            engine
          </li>
          <li>
            <strong>Lighthouse:</strong> Google's auditing tool with
            accessibility scoring
          </li>
          <li>
            <strong>Pa11y:</strong> Command-line accessibility testing tool
          </li>
          <li>
            <strong>WAVE:</strong> Web accessibility evaluation tool
          </li>
        </ul>
        <pre>
          <code>{`// axe-core integration
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('Button has no accessibility violations', async () => {
  const { container } = render(<Button>Click me</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

// Lighthouse CLI
lighthouse https://example.com --only-categories=accessibility`}</code>
        </pre>

        <h3>Design Tool Plugins</h3>
        <p>Design tool plugins validate accessibility during design:</p>
        <ul>
          <li>
            <strong>Stark:</strong> Figma plugin for contrast checking and color
            blindness simulation
          </li>
          <li>
            <strong>Able:</strong> Figma plugin for accessibility annotations
          </li>
          <li>
            <strong>Contrast:</strong> Figma plugin for WCAG contrast checking
          </li>
          <li>
            <strong>Accessibility Annotations:</strong> Plugins for documenting
            accessibility requirements
          </li>
        </ul>
        <p>
          Design tool plugins catch accessibility issues before code is written.
        </p>

        <h3>Browser Extensions</h3>
        <p>Browser extensions provide real-time accessibility checking:</p>
        <ul>
          <li>
            <strong>axe DevTools:</strong> Browser extension for axe-core
            testing
          </li>
          <li>
            <strong>WAVE:</strong> Browser extension for accessibility
            evaluation
          </li>
          <li>
            <strong>Lighthouse:</strong> Built into Chrome DevTools
          </li>
          <li>
            <strong>Accessibility Insights:</strong> Microsoft's accessibility
            testing tool
          </li>
        </ul>
        <p>
          Browser extensions enable quick accessibility checks during
          development.
        </p>

        <h3>CI/CD Integration</h3>
        <p>CI/CD integration ensures accessibility throughout development:</p>
        <ul>
          <li>
            <strong>Pre-commit hooks:</strong> Run accessibility tests before
            commits
          </li>
          <li>
            <strong>Pull request checks:</strong> Validate accessibility in PRs
          </li>
          <li>
            <strong>Automated reports:</strong> Generate accessibility reports
            automatically
          </li>
          <li>
            <strong>Threshold enforcement:</strong> Fail builds on accessibility
            violations
          </li>
        </ul>
        <pre>
          <code>{`// GitHub Actions workflow
name: Accessibility Testing

on: [pull_request]

jobs:
  accessibility:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: npm ci
      - name: Run accessibility tests
        run: npm run test:a11y
      - name: Run Lighthouse CI
        run: npm run lighthouse:ci`}</code>
        </pre>

        <h3>Manual Testing Tools</h3>
        <p>Manual testing tools complement automated testing:</p>
        <ul>
          <li>
            <strong>Screen readers:</strong> VoiceOver (macOS), NVDA (Windows),
            JAWS (Windows)
          </li>
          <li>
            <strong>Keyboard testing:</strong> Tab through interfaces, test
            keyboard shortcuts
          </li>
          <li>
            <strong>Zoom testing:</strong> Test at 200% zoom for readability
          </li>
          <li>
            <strong>Color blindness simulators:</strong> Test color perception
            issues
          </li>
        </ul>
        <p>Manual testing catches issues that automated tools miss.</p>
      </>
    ),
  },
  {
    type: 'system-roles',
    id: 'system-roles',
    title: 'System Roles: How Tooling Shapes System Success',
    order: 5,
    content: (
      <>
        <h3>Quality Impact</h3>
        <p>Accessibility tooling improves quality:</p>
        <ul>
          <li>
            <strong>Issue detection:</strong> Tools catch issues early in
            development
          </li>
          <li>
            <strong>Consistency:</strong> Tools enforce standards consistently
          </li>
          <li>
            <strong>Coverage:</strong> Tools test more comprehensively than
            manual testing alone
          </li>
        </ul>
        <p>Quality systems use tooling to maintain accessibility standards.</p>

        <h3>Efficiency Impact</h3>
        <p>Tooling improves efficiency:</p>
        <ul>
          <li>
            <strong>Automation:</strong> Reduces manual testing effort
          </li>
          <li>
            <strong>Early detection:</strong> Catches issues before production
          </li>
          <li>
            <strong>Education:</strong> Tools teach teams about accessibility
          </li>
        </ul>
        <p>Efficient workflows use tooling to scale accessibility efforts.</p>

        <h3>Compliance Impact</h3>
        <p>Tooling enables compliance:</p>
        <ul>
          <li>
            <strong>Documentation:</strong> Tools provide compliance reports
          </li>
          <li>
            <strong>Validation:</strong> Tools validate against WCAG standards
          </li>
          <li>
            <strong>Audit trails:</strong> Tools create audit trails for
            compliance
          </li>
        </ul>
        <p>
          Compliant systems use tooling to demonstrate accessibility compliance.
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
          Accessibility tooling bridges design intent and code implementation.
          Let's examine how tools work across the design-to-code workflow.
        </p>

        <h3>Design: Figma Plugins</h3>
        <p>Design tools use plugins for accessibility validation:</p>
        <pre>
          <code>{`// Stark plugin in Figma
1. Select text layer
2. Select background layer
3. Stark shows contrast ratio: 12.6:1 (WCAG AAA)
4. Stark shows color blindness simulation
5. Designer adjusts if needed

// Contrast plugin
1. Select colors
2. Plugin validates: Passes WCAG AA
3. Plugin suggests improvements if needed`}</code>
        </pre>

        <h3>Code: Automated Testing</h3>
        <p>Code uses automated testing tools:</p>
        <pre>
          <code>{`// Jest with axe-core
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Button', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(
      <Button aria-label="Submit form">Submit</Button>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

// Test output
✓ Button has no accessibility violations
  No violations found`}</code>
        </pre>

        <h3>Code: Lighthouse CI</h3>
        <p>Lighthouse CI validates accessibility in CI/CD:</p>
        <pre>
          <code>{`// .lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000'],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:accessibility': ['error', { minScore: 0.9 }],
      },
    },
  },
};

// CI/CD integration
npm run lighthouse:ci
// Fails if accessibility score < 0.9`}</code>
        </pre>

        <h3>Code: ESLint Accessibility Rules</h3>
        <p>ESLint rules catch accessibility issues in code:</p>
        <pre>
          <code>{`// eslint-plugin-jsx-a11y
{
  "rules": {
    "jsx-a11y/alt-text": "error",
    "jsx-a11y/aria-props": "error",
    "jsx-a11y/aria-proptypes": "error",
    "jsx-a11y/aria-unsupported-elements": "error",
    "jsx-a11y/click-events-have-key-events": "error",
    "jsx-a11y/heading-has-content": "error",
    "jsx-a11y/img-redundant-alt": "error",
    "jsx-a11y/no-access-key": "error"
  }
}

// Catches issues like:
// ❌ <img src="photo.jpg" />
// ✓ <img src="photo.jpg" alt="Description" />`}</code>
        </pre>

        <h3>Real-World Impact</h3>
        <p>
          A well-tooled accessibility workflow ensures accessibility throughout
          development. Design tools validate accessibility during design. Code
          tools catch issues during development. CI/CD tools prevent
          regressions. Manual testing tools validate real-world usage. When
          tools are integrated throughout the workflow, accessibility becomes a
          natural part of development, not an afterthought.
        </p>
        <p>
          Understanding accessibility tooling helps practitioners create
          workflows that maintain accessibility standards efficiently and
          consistently.
        </p>
      </>
    ),
  },
  {
    type: 'applied-example',
    id: 'applied-example',
    title: 'Applied Example: Building an Accessibility Testing Workflow',
    order: 7,
    content: (
      <>
        <p>Let's build a comprehensive accessibility testing workflow:</p>

        <h3>Step 1: Setup Automated Testing</h3>
        <p>Install and configure testing tools:</p>
        <pre>
          <code>{`// Install dependencies
npm install --save-dev jest-axe @testing-library/react

// Setup Jest with axe
// jest.setup.js
import { toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

// Component test
import { axe, toHaveNoViolations } from 'jest-axe';

test('Button has no accessibility violations', async () => {
  const { container } = render(<Button>Click me</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});`}</code>
        </pre>

        <h3>Step 2: Configure ESLint Rules</h3>
        <p>Add accessibility linting rules:</p>
        <pre>
          <code>{`// Install eslint-plugin-jsx-a11y
npm install --save-dev eslint-plugin-jsx-a11y

// .eslintrc.js
module.exports = {
  plugins: ['jsx-a11y'],
  rules: {
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/aria-props': 'error',
    'jsx-a11y/click-events-have-key-events': 'error',
    'jsx-a11y/heading-has-content': 'error',
  },
};

// Catches issues during development`}</code>
        </pre>

        <h3>Step 3: Setup Lighthouse CI</h3>
        <p>Configure Lighthouse for CI/CD:</p>
        <pre>
          <code>{`// .lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000'],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:accessibility': ['error', { minScore: 0.9 }],
      },
    },
  },
};

// package.json
{
  "scripts": {
    "lighthouse:ci": "lhci autorun"
  }
}`}</code>
        </pre>

        <h3>Step 4: Create GitHub Actions Workflow</h3>
        <p>Add accessibility checks to CI/CD:</p>
        <pre>
          <code>{`// .github/workflows/accessibility.yml
name: Accessibility Testing

on: [pull_request]

jobs:
  accessibility:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: npm ci
      - name: Run accessibility tests
        run: npm run test:a11y
      - name: Run Lighthouse CI
        run: npm run lighthouse:ci
      - name: Run ESLint
        run: npm run lint:a11y`}</code>
        </pre>

        <h3>Benefits of This Approach</h3>
        <ul>
          <li>
            <strong>Early detection:</strong> Issues caught during development
          </li>
          <li>
            <strong>Consistency:</strong> Standards enforced automatically
          </li>
          <li>
            <strong>Documentation:</strong> Reports provide compliance evidence
          </li>
          <li>
            <strong>Education:</strong> Tools teach teams about accessibility
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
        <p>Accessibility tooling faces several challenges:</p>

        <h4>False Positives</h4>
        <p>Tools can report false positives:</p>
        <ul>
          <li>
            <strong>Problem:</strong> Tools flag issues that aren't actually
            problems
          </li>
          <li>
            <strong>Solution:</strong> Review flagged issues, configure tools
            appropriately, document exceptions
          </li>
          <li>
            <strong>Guideline:</strong> Use tools as guides, not absolute
            authorities
          </li>
        </ul>

        <h4>Coverage Limitations</h4>
        <p>Automated tools don't catch everything:</p>
        <ul>
          <li>
            <strong>Challenge:</strong> Tools miss context-dependent issues
          </li>
          <li>
            <strong>Approach:</strong> Combine automated and manual testing, use
            multiple tools
          </li>
          <li>
            <strong>Tradeoff:</strong> Automation vs. comprehensive coverage
          </li>
        </ul>

        <h4>Tool Maintenance</h4>
        <p>Tools require maintenance and updates:</p>
        <ul>
          <li>
            <strong>Challenge:</strong> Tools need updates, configuration
            changes
          </li>
          <li>
            <strong>Approach:</strong> Regular updates, version pinning,
            documentation
          </li>
          <li>
            <strong>Tradeoff:</strong> Tool maintenance vs. accessibility
            coverage
          </li>
        </ul>

        <h3>Tradeoffs</h3>
        <p>Accessibility tooling involves several tradeoffs:</p>

        <h4>Automated vs. Manual Testing</h4>
        <ul>
          <li>
            <strong>Automated testing:</strong> Fast, consistent, but misses
            context
          </li>
          <li>
            <strong>Manual testing:</strong> Comprehensive, context-aware, but
            time-consuming
          </li>
          <li>
            <strong>Best practice:</strong> Use both—automated for regression,
            manual for validation
          </li>
        </ul>

        <h4>Tool Coverage vs. Speed</h4>
        <ul>
          <li>
            <strong>Comprehensive tools:</strong> More thorough, but slower
          </li>
          <li>
            <strong>Fast tools:</strong> Quick feedback, but less comprehensive
          </li>
          <li>
            <strong>Best practice:</strong> Use fast tools for development,
            comprehensive tools for CI/CD
          </li>
        </ul>

        <h4>Strict vs. Lenient Rules</h4>
        <ul>
          <li>
            <strong>Strict rules:</strong> Catches more issues, but may have
            false positives
          </li>
          <li>
            <strong>Lenient rules:</strong> Fewer false positives, but may miss
            issues
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
        <p>Continue learning about accessibility tooling:</p>
        <ul>
          <li>
            <Link href="/blueprints/foundations/accessibility/philosophy">
              Accessibility Philosophy
            </Link>
            : Foundational thinking about accessibility
          </li>
          <li>
            <Link href="/blueprints/foundations/accessibility/standards">
              Accessibility Standards
            </Link>
            : WCAG guidelines and principles
          </li>
          <li>
            <Link href="/blueprints/foundations/accessibility/assistive-tech">
              Assistive Technology Support
            </Link>
            : How to support assistive technologies
          </li>
          <li>
            <Link href="/blueprints/foundations/accessibility/tokens">
              Token-Level Accessibility
            </Link>
            : How tokens support accessibility
          </li>
        </ul>
        <p>
          Related glossary terms:{' '}
          <Link href="/blueprints/glossary#accessibility">Accessibility</Link>,{' '}
          <Link href="/blueprints/glossary#testing">Testing</Link>,{' '}
          <Link href="/blueprints/glossary#tooling">Tooling</Link>
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
      slug: 'accessibility',
      title: 'Accessibility Philosophy',
      description: 'Foundational thinking about accessibility',
      type: 'foundation',
    },
    {
      slug: 'standards',
      title: 'Accessibility Standards',
      description: 'WCAG guidelines and principles',
      type: 'foundation',
    },
    {
      slug: 'assistive-tech',
      title: 'Assistive Technology Support',
      description: 'How to support assistive technologies',
      type: 'foundation',
    },
  ],
  components: [],
  glossary: ['accessibility', 'testing', 'tooling'],
};

// Add verification checklist
content.verificationChecklist = [
  {
    id: 'automated-testing-setup',
    label: 'Automated testing setup',
    description: 'Automated accessibility testing tools configured',
    required: true,
  },
  {
    id: 'design-tool-plugins',
    label: 'Design tool plugins',
    description: 'Accessibility plugins installed in design tools',
    required: false,
  },
  {
    id: 'ci-cd-integration',
    label: 'CI/CD integration',
    description: 'Accessibility checks integrated into CI/CD pipeline',
    required: true,
  },
  {
    id: 'linting-rules',
    label: 'Linting rules configured',
    description: 'ESLint accessibility rules configured',
    required: true,
  },
];

// Add assessment prompts
content.assessmentPrompts = [
  {
    question:
      'How do automated and manual accessibility testing complement each other? Provide examples.',
    type: 'reflection',
  },
  {
    question:
      'Explain how to integrate accessibility tooling into CI/CD. Provide a concrete example.',
    type: 'application',
  },
  {
    question:
      'What are the tradeoffs between strict and lenient accessibility rules? How do you balance them?',
    type: 'reflection',
  },
];

export const metadata = generateFoundationMetadata(pageMetadata);

export default function AccessibilityToolingPage() {
  return <FoundationPage content={content} />;
}
