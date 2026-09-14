/**
 * Foundation Meta: System vs Style
 * The separation doctrine: the system is the set of questions and
 * contracts that survive any rebrand; style is the layer of chosen
 * answers that rebranding swaps. Confusing them is how brands break
 * systems and systems suffocate brands.
 */

import type {
  FoundationPageMetadata,
  FoundationSection,
} from '@/types/foundationContent';
import { generateFoundationMetadata } from '@/utils/metadata/foundationMetadata';
import { createFoundationContent } from '../../_lib/contentBuilder';
import { FoundationPage } from '../../_lib/pageWrapper';

const pageMetadata: FoundationPageMetadata = {
  title: 'System vs Style',
  description:
    'Separate foundational system logic from brand style layers: the system is the questions, contracts, and derived answers that persist across rebrands; style is the chosen, themeable answers. The test is what a rebrand is allowed to touch.',
  slug: 'meta/system-vs-style',
  canonicalUrl:
    'https://darianrosebrook.com/blueprints/foundations/meta/system-vs-style',
  published_at: new Date().toISOString(),
  modified_at: new Date().toISOString(),
  image: 'https://darianrosebrook.com/darianrosebrook.jpg',
  keywords: 'system logic, brand style, theming, rebrand, separation',
  learning: {
    learning_level: 'intermediate',
    role_relevance: ['design', 'engineering', 'governance'],
    prerequisites: ['tokens'],
    next_units: ['color', 'motion'],
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
    expertise: ['Design Systems', 'Brand Systems', 'Governance'],
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
          Every design system serves two masters that pull apart under pressure.
          The <strong>system</strong> master wants consistency, contracts, and
          the ability to change once and have it land everywhere. The{' '}
          <strong>style</strong> master wants identity—this brand, this feeling,
          this quarter&apos;s campaign. Teams that fuse the two get the worst of
          both: rebrands that are archaeological digs through component code,
          and brand moments that quietly fork the system because &quot;the
          system can&apos;t do that.&quot;
        </p>
        <p>
          The separation doctrine is one sentence:{' '}
          <strong>
            the system is the questions and the contracts; style is the chosen
            answers.
          </strong>{' '}
          The questions—what is our text color role, our touch-target floor, our
          elevation meaning table—survive every rebrand. The answers—red accent
          or teal, tight or spacious, sharp or soft—are data the system
          resolves, never logic it contains.
        </p>
        <p>
          This page covers the doctrine as this repository practices it. The
          mechanical layer underneath (cascade, brands, density) is the theming
          page&apos;s territory; what belongs here is the judgment: which
          decisions are system property, which are style property, and who is
          allowed to change each.
        </p>
      </>
    ),
  },
  {
    type: 'core-concepts',
    id: 'core-concepts',
    title: 'Core Concepts: The Two Ledgers',
    order: 4,
    content: (
      <>
        <h3>The System Ledger: What Persists</h3>
        <p>
          System property is everything a rebrand must not need to touch—and it
          is larger than teams assume, because most of it is invisible:
        </p>
        <ul>
          <li>
            <strong>The question set:</strong> the semantic roles themselves.
            &quot;Foreground-primary exists&quot; is system; &quot;it resolves
            to red.500&quot; is style.
          </li>
          <li>
            <strong>Derived answers:</strong> the contrast-anchored ramp
            structure, the 44px target floor, the frame-quantized duration
            scale, reduced-motion handling, reflow behavior. Constraints with
            citations—rebrands inherit them whole.
          </li>
          <li>
            <strong>Contracts:</strong> the reference directions (component →
            semantic → core), the naming grammar, the values-not-structure
            theming boundary, the consumption tiering. These are the API; style
            is a caller.
          </li>
          <li>
            <strong>Process:</strong> the validators, the lints, the audit
            ledgers. The machinery that keeps claims checkable is system
            property regardless of whose logo is on it.
          </li>
        </ul>

        <h3>The Style Ledger: What Swaps</h3>
        <p>
          Style property is small by design—small enough to review in one
          sitting, which is what makes rebrands cheap:
        </p>
        <ul>
          <li>
            <strong>Identity values:</strong> the accent family per brand (ten
            three-field files from red to sunset), the radius personality
            mapping, the stroke weight, the easing character choices.
          </li>
          <li>
            <strong>Mode aesthetics:</strong> which neutral step a border
            becomes in dark mode, whether shadows gain hairlines—the judgment
            calls encoded once per theme.
          </li>
          <li>
            <strong>Defaults:</strong> each brand&apos;s bundled density, the
            default mode follow-or-pin behavior.
          </li>
        </ul>
        <p>
          The test for the style ledger is the rebrand test:{' '}
          <em>could a new brand be expressed by editing only this ledger?</em>{' '}
          In this system the answer is a three-field file plus a build—the
          eleventh-brand example from the theming page. When the answer is
          &quot;no, we&apos;d also need to touch components,&quot; the finding
          is always a system defect: a chosen value that leaked into logic.
        </p>

        <h3>The Boundary Is Provenance, Again</h3>
        <p>
          The two ledgers are the atomic-vs-semantic distinction promoted to
          governance:{' '}
          <strong>
            derived answers are system property; chosen answers are style
            property.
          </strong>{' '}
          That is why the boundary holds under pressure—it is not a foldering
          convention but a fact about where each value comes from. A derived
          value in the style ledger is an uncited constraint waiting to be
          violated by a rebrand; a chosen value in the system ledger is a
          preference with contractual force it did not earn.
        </p>

        <h3>Brand Moments Without System Forks</h3>
        <p>
          The hard case is always the campaign page that &quot;needs to break
          the rules.&quot; The doctrine&apos;s answer is composition, not
          escape: a brand moment composes system primitives under style data—it
          may pin <code>brand.primary.500</code> to a campaign hex and re-derive
          the ramp (the color page&apos;s escape hatch), but it keeps the roles,
          the floors, and the contracts. What it may not do is fork a component
          or hardcode around the cascade, because forks do not expire when
          campaigns do.
        </p>
      </>
    ),
  },
  {
    type: 'system-roles',
    id: 'system-roles',
    title: 'System Roles: Who May Change What',
    order: 5,
    content: (
      <>
        <h3>Design Impact</h3>
        <p>
          Designers own the style ledger and owe the system its format: every
          identity decision arrives as theme data (mappings, brand fields), not
          as component edits. The portfolio of a system designer is a style
          ledger a stranger could apply.
        </p>
        <h3>Engineering Impact</h3>
        <p>
          Engineers own the system ledger&apos;s integrity: contract reviews,
          lint upkeep, and declining &quot;just this once&quot; forks—each fork
          is permanent square footage the brand can no longer repaint.
        </p>
        <h3>Governance Impact</h3>
        <p>
          Governance owns the boundary disputes, and the decision rule is
          provenance: when a change&apos;s value is derived, it enters the
          system ledger with its citation; when chosen, it enters the style
          ledger with its theme home. &quot;It&apos;s just a small change&quot;
          is not a ledger.
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
          In the design tool, the two ledgers appear as two kinds of library
          content: system content (variables&apos; structure, the role names,
          the component library) that the brand team may not edit, and style
          content (mode mappings, brand collections) that only they may. The
          separation is enforceable in library permissions—which is the point of
          having the doctrine at all: it must be enforceable somewhere.
        </p>
      </>
    ),
    codeContent: (
      <>
        <p>
          In code, the same boundary is visible in what a brand change&apos;s
          diff touches:
        </p>
        <pre>
          <code>{`// A rebrand diff — style ledger only:
 brands/aurora.tokens.json          // +3 fields
 app/designTokens.scss              // regenerated: 2 additive blocks

// It must NOT contain:
 ui/components/**                   // component forks
 app/**/page.tsx                    // hardcoded campaign values
 utils/designTokens/generators/**   // transform changes

// If it does, the finding is a leak: chosen value in system logic.
// Route it back: value → brand data; structure → system review.`}</code>
        </pre>
      </>
    ),
  },
  {
    type: 'applied-example',
    id: 'applied-example',
    title: 'Applied Example: The Rebrand Audit',
    order: 7,
    content: (
      <>
        <p>
          Run the doctrine as an audit on a real fear: leadership announces a
          rebrand in six weeks. Three moves:
        </p>
        <ol>
          <li>
            <strong>Take the rebrand test now:</strong> try expressing an
            arbitrary new brand by editing only brand files and semantic
            mappings. Every place that resists is a defect list—each resistance
            is a chosen value living in system clothes, and six weeks is enough
            time to route it home if you start with the list rather than the
            announcement.
          </li>
          <li>
            <strong>Size the style ledger:</strong> count what a brand actually
            decides here—accent, density default, mode aesthetics. If the honest
            count is creeping toward component-level decisions, the system is
            under-providing roles, and the fix is more system (a new role), not
            more fork.
          </li>
          <li>
            <strong>Re-run the derived audits on the new answers:</strong> the
            contrast ledger and target floors apply to the new accent with zero
            renegotiation—that is what makes them system property. A rebrand
            that fails WCAG under its new colors fails the doctrine, not just
            the audit.
          </li>
        </ol>
        <p>
          Six weeks later, the rebrand lands as a pull request of brand files
          and regenerated artifacts, reviewed in an afternoon. The system never
          noticed; that is the doctrine working.
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
            <strong>Strict separation vs brand flexibility:</strong> the
            doctrine makes some brand desires expensive (a layout that ignores
            the grid, say) by design. The pressure valve is composition under
            style data—constrained, expiring naturally—not forks.
          </li>
          <li>
            <strong>System ledger size vs style freedom:</strong> more system
            means less per-brand discretion. The balance point is provenance:
            everything derivable joins the system; everything else is owed a
            theme home.
          </li>
          <li>
            <strong>Enforcement vs convention:</strong> library permissions and
            the reference lint enforce cheaply today; naming and tiering
            conventions rely on review. The doctrine&apos;s rule: every
            convention that keeps getting violated is a missing enforcement.
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'system-vs-style-pitfalls',
    title: 'Common Pitfalls & Failure Modes',
    order: 8.5,
    content: (
      <>
        <h3>1. The permanent campaign fork</h3>
        <pre>
          <code>{`// ❌ Ships fast, expires never
<LaunchHero> /* bespoke styles, no tokens */ </LaunchHero>

// ✅ Composition under style data
<LaunchHero> /* system primitives + pinned brand ramp */ </LaunchHero>`}</code>
        </pre>
        <h3>2. Style decisions with contractual force</h3>
        <p>
          A brand hex hardcoded in a component is a style decision wearing
          system armor—no theme can reach it. Every hardcode is a future
          rebrand&apos;s archaeology site.
        </p>
        <h3>3. System answers defended as brand</h3>
        <p>
          &quot;Our brand doesn&apos;t need 44px targets&quot; is not a brand
          statement; the floor is derived. The system-legal move is changing the
          visual size, not the target.
        </p>
        <h3>4. Ledgers nobody owns</h3>
        <p>
          When neither designers nor engineers can say which ledger a value
          lives in, both ledgers are fiction. The audit from the applied example
          is the periodic cure.
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
            <strong>Theming Strategies</strong> — the mechanical layers this
            doctrine governs (<code>/blueprints/foundations/meta/theming</code>)
          </li>
          <li>
            <strong>Atomic vs Semantic</strong> — the provenance procedure
            behind the boundary (
            <code>/blueprints/foundations/meta/atomic-vs-semantic</code>)
          </li>
          <li>
            <strong>Philosophy of Design Systems</strong> — the systems-thinking
            frame (<code>/blueprints/foundations/philosophy</code>)
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
    id: 'rebrand-test',
    label: 'A new brand is expressible by editing style data only',
    description: 'Brand files + semantic mappings; no component or logic edits',
    required: true,
  },
  {
    id: 'derived-are-system',
    label: 'Every derived value lives in the system ledger with its citation',
    description: 'Constraints are inherited whole by rebrands',
    required: true,
  },
  {
    id: 'chosen-have-homes',
    label: 'Every chosen value has a theme-data home',
    description: 'No preference wields contractual force',
    required: true,
  },
  {
    id: 'no-permanent-forks',
    label: 'Brand moments compose primitives instead of forking',
    description: 'Forks outlive campaigns; composition expires with them',
    required: false,
  },
];

content.assessmentPrompts = [
  {
    question:
      'Pick a product you know and run the rebrand test mentally: list the first five places that would resist an arbitrary new brand. For each, name the ledger it belongs in and the routing repair.',
    type: 'application',
  },
  {
    question:
      'A campaign team argues their launch page "is basically a different product" and deserves a fork. Steelman their case, then describe the composition-based alternative and what it costs them.',
    type: 'reflection',
  },
];

content.crossReferences = {
  concepts: [
    {
      slug: 'philosophy',
      title: 'Philosophy of Design Systems',
      description: 'The systems-thinking frame the doctrine operationalizes',
      type: 'foundation',
    },
    {
      slug: 'color',
      title: 'Color Foundations',
      description: 'The ramp escape hatch that lets brands re-derive legally',
      type: 'foundation',
    },
    {
      slug: 'tokens',
      title: 'Design Tokens',
      description: 'The layer architecture both ledgers live in',
      type: 'foundation',
    },
  ],
  components: [],
  glossary: ['16', '22', '04'],
};

export const metadata = generateFoundationMetadata(pageMetadata);

export default function MetaSystemVsStylePage() {
  return <FoundationPage content={content} />;
}
