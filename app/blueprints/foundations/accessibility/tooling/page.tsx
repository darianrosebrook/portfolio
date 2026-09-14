/**
 * Foundation Accessibility: Accessibility Tooling
 * The automation layer and its honest boundary: jsx-a11y at lint,
 * axe-core in component tests, the token validator at build, e2e
 * keyboard walks — and the manual passes that remain irreplaceable.
 */

import type {
  FoundationPageMetadata,
  FoundationSection,
} from '@/types/foundationContent';
import { generateFoundationMetadata } from '@/utils/metadata/foundationMetadata';
import { createFoundationContent } from '../../_lib/contentBuilder';
import { FoundationPage } from '../../_lib/pageWrapper';

const pageMetadata: FoundationPageMetadata = {
  title: 'Accessibility Tooling',
  description:
    'Test, validate, and enforce accessibility at every stage: jsx-a11y errors at lint speed, axe-core auditing rendered components in vitest, token-level pair validation at build, keyboard-driven e2e walks — plus the manual checks automation cannot replace.',
  slug: 'accessibility/tooling',
  canonicalUrl:
    'https://darianrosebrook.com/blueprints/foundations/accessibility/tooling',
  published_at: new Date().toISOString(),
  modified_at: new Date().toISOString(),
  image: 'https://darianrosebrook.com/darianrosebrook.jpg',
  keywords: 'axe-core, jest-axe, jsx-a11y, lighthouse, testing',
  learning: {
    learning_level: 'foundation',
    role_relevance: ['engineering', 'a11y'],
    prerequisites: ['philosophy'],
    next_units: ['motion', 'color'],
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
    expertise: ['Design Systems', 'Accessibility', 'Testing'],
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
    title: 'Why This Matters',
    order: 3,
    content: (
      <>
        <p>
          Accessibility has more good tooling than almost any other quality
          property—and more ways to use it badly. The failure mode is always the
          same: running one tool, late, as a gate, and calling the absence of
          its findings &quot;accessible.&quot; The tools are excellent at their
          slices and silent about everything else; using them well means knowing
          both the slice and the silence.
        </p>
        <p>
          This system runs four automated layers, each positioned where its cost
          is lowest: static markup rules at lint speed, rendered-tree audits
          inside component tests, numeric claims at build time, and real
          keyboard operation in the e2e suite. This page covers what each layer
          sees, what none of them see, and how the manual pass completes the
          picture.
        </p>
      </>
    ),
  },
  {
    type: 'core-concepts',
    id: 'core-concepts',
    title: 'Core Concepts: Four Layers and Their Blind Spots',
    order: 4,
    content: (
      <>
        <h3>Layer 1: jsx-a11y at Lint Speed</h3>
        <p>
          Static rules over markup, in seconds, on every commit. This repo
          registers the plugin through <code>next/core-web-vitals</code> and
          promotes key rules to hard errors:
        </p>
        <pre>
          <code>{`// eslint.config.mjs (excerpt)
'jsx-a11y/alt-text': 'error',
'jsx-a11y/anchor-has-content': 'error',
'jsx-a11y/anchor-is-valid': 'error',`}</code>
        </pre>
        <p>
          <strong>Sees:</strong> missing alt, empty anchors, invalid hrefs,
          obviously wrong ARIA attributes—the mechanical sins.
          <strong> Blind to:</strong> everything runtime—rendered contrast,
          focus behavior, announcement quality. A file can lint clean and be
          unusable.
        </p>

        <h3>Layer 2: axe-core in the Component Tests</h3>
        <p>
          The rendered tree, audited where components are already tested. The
          vitest setup wires jest-axe with a deliberate tag selection:
        </p>
        <pre>
          <code>{`// test/setup.ts (behavior)
expect.extend(toHaveNoViolations);
// axe configured with tags: ['wcag2a', 'wcag2aa', 'best-practice']
// (color-contrast promoted to error only at the AAA level,
//  because the pair ledger already enforces AA at the token layer)`}</code>
        </pre>
        <p>
          <strong>Sees:</strong> name/role/value problems in real DOM, landmark
          structure, contrast of rendered combinations.
          <strong> Blind to:</strong> keyboard interaction sequences (it
          inspects state, not journeys), screen reader behavior beyond the tree,
          and anything behind interactions the test does not drive.
        </p>

        <h3>Layer 3: The Token Validator at Build</h3>
        <p>
          The numeric claims—contrast pairs, per mode—checked at the source
          rather than the screen: <code>WCAG_LEVELS</code> +{' '}
          <code>validateColorPair</code> walk the declared pairs. This is the
          cheapest layer of all (the data is tiny) and the only one that catches
          a failing pair <em>before</em> any component renders it.
        </p>
        <p>
          <strong>Sees:</strong> declared numeric claims.
          <strong> Blind to:</strong> usage—every combination that was never
          declared (which is why the pair ledger discipline from the tokens page
          is this layer&apos;s precondition, not its product).
        </p>

        <h3>Layer 4: Keyboard-Driven E2E</h3>
        <p>
          The Playwright suite operates the product the way a keyboard user
          does: tabbing through navigation, clicking prerequisite links,
          asserting landmarks and focus visibility, walking the mobile viewport.
          It is the only layer that catches focus-trap failures, tab-order
          absurdities, and reflow breakage in context.
        </p>
        <p>
          <strong>Sees:</strong> real interaction behavior, real viewports.
          <strong> Blind to:</strong> what it is not written to walk—coverage is
          per-pattern and grows only as patterns gain walks.
        </p>

        <h3>The Honest Boundary</h3>
        <p>
          All four layers share one silence:{' '}
          <strong>none of them experiences the product</strong>. Comprehension,
          announcement quality, task flow, and real screen reader behavior under
          real browsing habits remain human checks with tools—VoiceOver or NVDA,
          run per pattern on a schedule (the assistive-tech page&apos;s
          protocol). The maturity marker is not more automation; it is knowing
          exactly where the automation stops and the pass begins.
        </p>
      </>
    ),
  },
  {
    type: 'system-roles',
    id: 'system-roles',
    title: 'System Roles: Who Runs What',
    order: 5,
    content: (
      <>
        <h3>Engineering Impact</h3>
        <p>
          Engineers own the layers&apos; wiring and health: rules promoted to
          errors stay errors, axe tags stay deliberate, e2e walks grow with
          patterns. A disabled rule is a policy decision, made in config with a
          comment—not in code, silently.
        </p>
        <h3>Accessibility Impact</h3>
        <p>
          The a11y function owns the boundary map: what each layer covers, where
          the manual schedule picks up, and the periodic audit that the layers
          still say what they claim to.
        </p>
        <h3>Design Impact</h3>
        <p>
          Design-side checkers (contrast plugins) calibrate to the same numbers
          as Layer 3—one answer across the design/code line, so findings are
          routing decisions rather than disputes.
        </p>
      </>
    ),
  },
  {
    type: 'design-code-interplay',
    id: 'design-code-interplay',
    title: 'Design & Code Interplay',
    order: 6,
    content: null,
    designContent: (
      <>
        <p>
          The design side sees the tooling as shared instruments: the same WCAG
          numbers in the plugin and the validator, the same floors in the size
          scales and the e2e asserts. When both sides trust one number, a
          finding is never an argument about the number—it is a routing question
          about the layer that missed it.
        </p>
      </>
    ),
    codeContent: (
      <>
        <p>The four layers, as one component&apos;s journey:</p>
        <pre>
          <code>{`// Layer 1 — the JSX lints clean (alt, anchors, ARIA sanity)
<Icon icon={faSearch} label="Search" />

// Layer 2 — the render audit passes
expect(await axe(container)).toHaveNoViolations();

// Layer 3 — the pair it renders was validated at build:
//   foreground.primary on background.primary → 18.4:1 (light)

// Layer 4 — the e2e tab walks reach and operate it,
//   and the focus ring is visible on :focus-visible

// What no layer saw: whether "Search" is the right name.
// That is the pass.`}</code>
        </pre>
      </>
    ),
  },
  {
    type: 'applied-example',
    id: 'applied-example',
    title: 'Applied Example: Routing a Finding to Its Layer',
    order: 7,
    content: (
      <>
        <p>
          A user reports: &quot;the filter panel is unusable with a screen
          reader.&quot; Route it:
        </p>
        <ol>
          <li>
            <strong>Reproduce with the tree:</strong> VoiceOver walk transcribes
            the announcements—headings missing, controls announced as
            &quot;group, group&quot;.
          </li>
          <li>
            <strong>Ask which layer should have caught each line:</strong>{' '}
            unnamed buttons → Layer 2 (axe names rule) or Layer 1 (jsx-a11y);
            missing landmarks → Layer 2; tab trap in the panel → a Layer 4 walk
            that does not exist yet.
          </li>
          <li>
            <strong>Fix at the component, encode at the layer:</strong> the
            filter gains names and landmarks; the axe assertion joins its test;
            the e2e gains the panel walk—so this specific finding becomes
            unrepeatable, not just fixed.
          </li>
          <li>
            <strong>Log the gap honestly:</strong> the findings that no layer
            could catch (announcement phrasing) stay on the manual
            schedule—tracked, not pretended away.
          </li>
        </ol>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'constraints-tradeoffs',
    title: 'Constraints & Trade-offs',
    order: 8,
    content: (
      <>
        <ul>
          <li>
            <strong>Layer breadth vs depth:</strong> four cheap layers beat one
            deep one—the failure classes differ, and the cheap layers run
            constantly.
          </li>
          <li>
            <strong>Error vs warning promotion:</strong> every rule promoted to
            error removes discretion and adds friction; demoted rules reacquire
            silence. The ledger of placements is policy worth reviewing.
          </li>
          <li>
            <strong>Automation trust vs manual reality:</strong> green boards
            breed the belief that accessibility is solved; the boundary map
            exists to keep the conversation honest inside the confidence.
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'a11y-tooling-pitfalls',
    title: 'Common Pitfalls & Failure Modes',
    order: 8.5,
    content: (
      <>
        <h3>1. The single-tool audit</h3>
        <p>
          Running one scanner and shipping its absence of findings. Each
          layer&apos;s blind spot list is the argument for the other three.
        </p>
        <h3>2. Silent rule demotion</h3>
        <pre>
          <code>{`// Bad: Per-file suppression, forever
/* eslint-disable jsx-a11y/... */
// Good: Config-level policy with a comment and an expiry review`}</code>
        </pre>
        <h3>3. Testing the happy render only</h3>
        <p>
          axe on the default state misses the opened dialog, the errored form,
          the loading skeleton—audit the states users actually suffer in.
        </p>
        <h3>4. Scores as goals</h3>
        <p>
          Lighthouse scores are directional, gameable, and viewport-specific.
          Targets belong to criteria and patterns; scores are diagnostics.
        </p>
      </>
    ),
  },
  {
    type: 'verification-checklist',
    id: 'verification-checklist',
    title: 'Verification Checklist',
    order: 9,
    content: null,
  },
  {
    type: 'additional-resources',
    id: 'additional-resources',
    title: 'Additional Resources',
    order: 9.5,
    content: (
      <>
        <ul>
          <li>
            <strong>Assistive Technology Support</strong> — the manual protocol
            this layering serves (
            <code>/blueprints/foundations/accessibility/assistive-tech</code>)
          </li>
          <li>
            <strong>Automation &amp; CI/CD</strong> — where each layer runs (
            <code>/blueprints/foundations/tooling/automation</code>)
          </li>
          <li>
            <strong>axe-core</strong> — the rule engine and its documentation of
            what it cannot check (
            <code>https://github.com/dequelabs/axe-core</code>)
          </li>
          <li>
            <strong>The sources</strong> — <code>test/setup.ts</code>,{' '}
            <code>eslint.config.mjs</code>,{' '}
            <code>utils/accessibility/tokenValidator.ts</code>,{' '}
            <code>test/e2e/foundationNavigation.spec.ts</code>
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'cross-references',
    id: 'cross-references',
    title: 'Related Concepts',
    order: 10,
    content: null,
  },
  {
    type: 'assessment-prompt',
    id: 'assessment-prompt',
    title: 'Reflection Questions',
    order: 11,
    content: null,
  },
];

const content = createFoundationContent(pageMetadata, sections);

content.verificationChecklist = [
  {
    id: 'layers-live',
    label: 'All four layers run somewhere on every change',
    description: 'Lint, rendered audit, build validation, keyboard e2e',
    required: true,
  },
  {
    id: 'states-audited',
    label: 'Component audits cover interactive states, not just default',
    description: 'Dialogs open, forms errored, loading rendered',
    required: true,
  },
  {
    id: 'boundary-mapped',
    label: 'The manual boundary is documented and scheduled',
    description: 'What automation cannot see is tracked, not assumed',
    required: true,
  },
  {
    id: 'suppressions-visible',
    label: 'Rule suppressions live in config with rationale',
    description: 'Never per-file, never silent',
    required: false,
  },
];

content.assessmentPrompts = [
  {
    question:
      'Write the blind-spot table for your current tooling: what each layer you run can see, and one real defect class from your history that fell in a gap.',
    type: 'application',
  },
  {
    question:
      'A dashboard shows 100 axe-clean components and one screen-reader complaint. Argue what the 100 proves, what it does not, and what you would change first.',
    type: 'reflection',
  },
];

content.crossReferences = {
  concepts: [
    {
      slug: 'accessibility',
      title: 'Accessibility as System Infrastructure',
      description: 'The track landing this layering completes',
      type: 'foundation',
    },
    {
      slug: 'tokens',
      title: 'Design Tokens',
      description: 'The layer whose validator is Layer 3',
      type: 'foundation',
    },
    {
      slug: 'motion',
      title: 'Motion & Duration Foundations',
      description: 'The reduced-motion contract the e2e walks protect',
      type: 'foundation',
    },
  ],
  components: [],
  glossary: ['27', '01', '20'],
};

export const metadata = generateFoundationMetadata(pageMetadata);

export default function AccessibilityToolingPage() {
  return <FoundationPage content={content} />;
}
