/**
 * Foundation: Accessibility as System Infrastructure
 * The track landing: why accessibility is a property systems earn from
 * their architecture — encoded in tokens, contracts, and checks — with
 * paths into the standards, token-level, assistive-tech, tooling, and
 * philosophy pages.
 */

import type {
  FoundationPageMetadata,
  FoundationSection,
} from '@/types/foundationContent';
import { generateFoundationMetadata } from '@/utils/metadata/foundationMetadata';
import { createFoundationContent } from '../_lib/contentBuilder';
import { FoundationPage } from '../_lib/pageWrapper';

const pageMetadata: FoundationPageMetadata = {
  title: 'Accessibility as System Infrastructure',
  description:
    'Treat accessibility as infrastructure the system earns, not a checklist it passes: constraints encoded in tokens and contracts, verified by validators at build time, and sustained by an architecture where the accessible path is the default path.',
  slug: 'accessibility',
  canonicalUrl:
    'https://darianrosebrook.com/blueprints/foundations/accessibility',
  published_at: new Date().toISOString(),
  modified_at: new Date().toISOString(),
  image: 'https://darianrosebrook.com/darianrosebrook.jpg',
  keywords: 'accessibility, WCAG, design systems, infrastructure, a11y',
  learning: {
    learning_level: 'foundation',
    role_relevance: ['design', 'engineering', 'a11y', 'governance'],
    prerequisites: ['philosophy'],
    next_units: ['component-architecture', 'color'],
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
    expertise: ['Design Systems', 'Accessibility', 'Architecture'],
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
          The industry&apos;s default model of accessibility is the audit: build
          the product, then run the checklist, then fix what it finds. The model
          fails predictably because it makes accessibility a <em>terminal</em>{' '}
          process on a system whose every earlier decision already settled the
          outcome. You cannot audit your way to accessible products any more
          than you can inspect quality into manufactured goods—the capability
          has to be built into the process that produces them.
        </p>
        <p>
          The system&apos;s model is different in one specific way:
          accessibility constraints are encoded where the decisions are made.
          Contrast floors live in the token validator, so a failing pair cannot
          merge. Touch-target minimums live in the dimension tokens, so a
          cramped control is a token-layer question. Focus, semantics, and
          naming live in the component contracts, so a component that ships
          without them is visibly incomplete. Reduced motion lives in the motion
          system, so opting out is honored by CSS and script from the same
          signal.
        </p>
        <p>
          This page is the track&apos;s map. The five pages behind it cover the
          standards that define the constraints, the token-level encoding, the
          assistive technologies the constraints serve, the tooling that
          verifies them, and the philosophy that keeps all of it honest when
          deadlines argue.
        </p>
      </>
    ),
  },
  {
    type: 'core-concepts',
    id: 'core-concepts',
    title: 'Core Concepts: The Track in Five Moves',
    order: 4,
    content: (
      <>
        <h3>1. The Standards Are the Source of Constraints</h3>
        <p>
          WCAG 2.1 is the normative floor: perceivable, operable,
          understandable, robust. Its numeric thresholds—the 4.5:1 and 3:1
          contrast ratios, the 44px target guidance, the 320px reflow
          requirement, the animation-from-interactions criteria—are the derived
          values this system&apos;s tokens encode. Standards-first means every
          constraint in the system can name its citation, which is what makes it
          non-negotiable in review. (
          <code>/blueprints/foundations/accessibility/standards</code>)
        </p>

        <h3>2. Tokens Are Where Constraints Get Teeth</h3>
        <p>
          A constraint in a document is guidance; a constraint in a token is a
          default. The tap-target floor as <code>dimension.tapTargetMin</code>,
          contrast pairs as validator-enforced role combinations, motion safety
          as the reduced-motion contract, legibility spacing as scale
          minimums—each encoding moves the constraint from
          &quot;remembered&quot; to &quot;structural.&quot; (
          <code>/blueprints/foundations/accessibility/tokens</code>)
        </p>

        <h3>3. Assistive Technology Defines the Real Interface</h3>
        <p>
          Screen readers, keyboard-only navigation, switch access, voice
          control, magnification—these are consumers of the system&apos;s
          semantics, and their expectations are the actual contract.
          Meaningful-or-decorative for icons, DOM order equal to reading order,
          names on every control: the rules come from how AT consumes the tree,
          not from what looks organized. (
          <code>/blueprints/foundations/accessibility/assistive-tech</code>)
        </p>

        <h3>4. Tooling Makes Verification Continuous</h3>
        <p>
          jsx-a11y catches static markup sins at lint speed; axe-core audits
          rendered output in the component tests; the token validator checks
          numeric claims at build; Playwright walks real keyboard paths. Four
          layers, each cheaper than the incident it prevents. (
          <code>/blueprints/foundations/accessibility/tooling</code>)
        </p>

        <h3>5. Philosophy Keeps It Honest Under Pressure</h3>
        <p>
          Every accessibility practice fails at the same moment: the deadline.
          The philosophy page is the argument that survives that
          moment—accessibility as a design constraint that improves the product
          for everyone, and as a fairness obligation that does not scale down
          with the timeline. (
          <code>/blueprints/foundations/accessibility/philosophy</code>)
        </p>

        <h3>The Infrastructure Test</h3>
        <p>
          One question summarizes the track:{' '}
          <em>
            when this system is used lazily, does accessibility still hold?
          </em>{' '}
          A component author who references only tokens, ships the
          contract&apos;s slots and bindings, and passes the checks has produced
          accessible output—without having thought about accessibility at all.
          That is infrastructure: the good path is the path of least resistance.
          Every page in this track is about moving one more constraint across
          that line.
        </p>
      </>
    ),
  },
  {
    type: 'system-roles',
    id: 'system-roles',
    title: 'System Roles: Accessibility Across the Layers',
    order: 5,
    content: (
      <>
        <h3>Design Impact</h3>
        <p>
          Designers inherit the constraints as creative material: the floors are
          fixed, and the design work happens in the space they guarantee. The
          track&apos;s pages repeatedly show the same reversal—constraints
          adopted early become affordances, not restrictions.
        </p>
        <h3>Engineering Impact</h3>
        <p>
          Engineers inherit the encoding: the validators, the contract fields,
          the test layers. The obligation is maintenance—when a check rots or a
          contract field goes unused, the infrastructure claim quietly becomes
          false.
        </p>
        <h3>Governance Impact</h3>
        <p>
          Governance inherits the arbitration: when a derived constraint
          conflicts with a chosen preference, derived wins. That single rule,
          applied consistently, is most of what &quot;accessibility
          governance&quot; means in a tokenized system.
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
          On the design side, the infrastructure shows up as defaults that are
          already accessible: palettes whose ramps bracket the thresholds, size
          scales that respect targets, contrast plugins sharing the
          validator&apos;s math. The designer experiences accessibility less as
          a review stage and more as the shape of the material.
        </p>
      </>
    ),
    codeContent: (
      <>
        <p>
          On the code side, the same constraints as checks a lazy implementation
          cannot skip:
        </p>
        <pre>
          <code>{`// Token layer: the floor is data
--core-dimension-tap-target-min: 44px;

// Contract layer: semantics are fields, not best wishes
"a11y": { "role": "img", "labeling": ["aria-label"], "keyboard": [] }

// Lint layer: static sins fail fast
'jsx-a11y/alt-text': 'error'

// Test layer: rendered output audited (axe, wcag2a/wcag2aa)
// Build layer: pair ratios validated from token sources

// The lazy path — consume tokens, fill the contract, pass checks —
// is the accessible path. That is the entire engineering argument.`}</code>
        </pre>
      </>
    ),
  },
  {
    type: 'applied-example',
    id: 'applied-example',
    title: 'Applied Example: Following One Constraint Through the System',
    order: 7,
    content: (
      <>
        <p>
          Take a single constraint—body text contrast—and watch it ride the
          whole architecture:
        </p>
        <ol>
          <li>
            <strong>Standard:</strong> WCAG 2.1 SC 1.4.3, 4.5:1 for normal
            text—cited, not asserted.
          </li>
          <li>
            <strong>Ramp:</strong> the Adaptive-DS-Colors keying places{' '}
            <code>500</code> at ≈4.9:1 on white, so the &quot;which step for
            text&quot; question is answered by the scale itself.
          </li>
          <li>
            <strong>Role:</strong> <code>foreground.primary</code>/
            <code>secondary</code> resolve per mode—the pair is checkable, not
            vibes.
          </li>
          <li>
            <strong>Validator:</strong> <code>WCAG_LEVELS</code> +{' '}
            <code>validateColorPair</code> walk the declared pairs per mode at
            build time.
          </li>
          <li>
            <strong>Test:</strong> axe&apos;s <code>color-contrast</code> rule
            audits the rendered components in vitest.
          </li>
          <li>
            <strong>Outcome:</strong> a product engineer who never read SC 1.4.3
            ships text that passes it—because every layer below them already did
            the work.
          </li>
        </ol>
        <p>
          Six layers, one constraint, zero heroics. Multiply by the constraint
          set and you have this track&apos;s thesis in miniature.
        </p>
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
            <strong>Infrastructure vs audit:</strong> encoding costs engineering
            time now and pays on every change forever; auditing costs less now
            and compounds silently. Systems that cannot fund the encoding should
            at least fund the tracking of the debt honestly.
          </li>
          <li>
            <strong>Floors vs flexibility:</strong> hard minimums remove options
            (no 28px targets, ever) and buy the &quot;lazy path is safe&quot;
            property. The escape hatches that exist (visual size vs hit area)
            are designed, not discovered.
          </li>
          <li>
            <strong>Standards vintage:</strong> WCAG 2.1 is the enforceable
            floor; 2.2 and APCA are directions. Encoding 2.1 tightly while
            leaving room for the validators to learn new math is the posture
            this system takes.
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'accessibility-pitfalls',
    title: 'Common Pitfalls & Failure Modes',
    order: 8.5,
    content: (
      <>
        <h3>1. The audit as a stage</h3>
        <p>
          Late audits find late problems at late prices. The fix is not better
          audits but earlier encoding—every finding is a constraint looking for
          its token, contract, or check.
        </p>
        <h3>2. Passing checks, failing users</h3>
        <p>
          Automation covers the computable subset (contrast, names, tree
          structure); it cannot cover comprehension, task flow, or real screen
          reader behavior. Manual AT passes remain load-bearing—the tooling page
          covers the split.
        </p>
        <h3>3. Accessibility as one person&apos;s job</h3>
        <p>
          A specialist without structural authority becomes a bottleneck of
          rubber stamps. The infrastructure model distributes the work into the
          layers everyone already touches.
        </p>
        <h3>4. Retrofitting under deadline</h3>
        <p>
          The classic death spiral: skip the constraints, miss the audit,
          promise to fix later. Later has the same deadline pressure plus
          rework. The track exists to make the cheap-early path visible.
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
            <strong>The track</strong> — standards, tokens, assistive-tech,
            tooling, and philosophy pages under{' '}
            <code>/blueprints/foundations/accessibility/</code>
          </li>
          <li>
            <strong>WCAG 2.1</strong> — the normative source (
            <code>https://www.w3.org/TR/WCAG21/</code>)
          </li>
          <li>
            <strong>Color Foundations</strong> — the contrast ledger this
            track&apos;s token page builds on (
            <code>/blueprints/foundations/color</code>)
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
    id: 'constraints-cited',
    label: 'Every accessibility constraint names its standard',
    description: 'Numeric thresholds carry their WCAG citations',
    required: true,
  },
  {
    id: 'encoded-not-remembered',
    label: 'Constraints live in tokens, contracts, or checks',
    description: 'Structural, not documentation',
    required: true,
  },
  {
    id: 'lazy-path-safe',
    label: 'The default implementation path is accessible',
    description: 'Consume tokens, fill the contract, pass the checks',
    required: true,
  },
  {
    id: 'at-passes-scheduled',
    label: 'Manual assistive technology passes remain scheduled',
    description: 'Automation covers the computable subset only',
    required: false,
  },
];

content.assessmentPrompts = [
  {
    question:
      'Pick one accessibility failure you have shipped or witnessed. Which layer—token, contract, check, or culture—should have caught it, and what would the encoding look like?',
    type: 'application',
  },
  {
    question:
      'The infrastructure test asks whether lazy use of the system is still accessible. Where does your current system fail that test most often, and what does the failure pattern have in common?',
    type: 'reflection',
  },
];

content.crossReferences = {
  concepts: [
    {
      slug: 'philosophy',
      title: 'Philosophy of Design Systems',
      description: 'The systems frame accessibility-as-infrastructure extends',
      type: 'foundation',
    },
    {
      slug: 'color',
      title: 'Color Foundations',
      description: 'The contrast computation and per-mode pair ledger',
      type: 'foundation',
    },
    {
      slug: 'tokens',
      title: 'Design Tokens',
      description: 'The layer where constraints get structural teeth',
      type: 'foundation',
    },
  ],
  components: [],
  glossary: ['01', '29', '27'],
};

export const metadata = generateFoundationMetadata(pageMetadata);

export default function AccessibilityPage() {
  return <FoundationPage content={content} />;
}
