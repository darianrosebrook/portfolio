/**
 * Foundation Meta: Atomic vs Semantic Tokens
 * The layer doctrine as a decision procedure: every token answers a
 * question, the answer's provenance decides its layer, and the balance
 * between decided-enough and menu-overload is a designed property —
 * not an accident of accumulation.
 */

import type {
  FoundationPageMetadata,
  FoundationSection,
} from '@/types/foundationContent';
import { generateFoundationMetadata } from '@/utils/metadata/foundationMetadata';
import { createFoundationContent } from '../../_lib/contentBuilder';
import { FoundationPage } from '../../_lib/pageWrapper';

const pageMetadata: FoundationPageMetadata = {
  title: 'Atomic vs Semantic Tokens',
  description:
    'Raw value tokens versus purpose-driven roles, decided by provenance: constraint-derived answers (accessibility, perception, composition) live one layer, brand choices live another — and granularity is floored by what anyone could ever perceive.',
  slug: 'meta/atomic-vs-semantic',
  canonicalUrl:
    'https://darianrosebrook.com/blueprints/foundations/meta/atomic-vs-semantic',
  published_at: new Date().toISOString(),
  modified_at: new Date().toISOString(),
  image: 'https://darianrosebrook.com/darianrosebrook.jpg',
  keywords: 'atomic tokens, semantic tokens, layers, provenance, granularity',
  learning: {
    learning_level: 'intermediate',
    role_relevance: ['design', 'engineering'],
    prerequisites: ['tokens'],
    next_units: ['color', 'motion'],
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
    expertise: ['Design Systems', 'Token Architecture', 'Accessibility'],
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
          &quot;When do I make an atomic token, and when do I make a semantic
          one?&quot; is the question that decides whether a token system
          compounds or collapses. Teams that answer it by feel accumulate both
          failure modes: vocabularies too raw to theme (everything references{' '}
          <code>blue.600</code>, dark mode becomes a rewrite) and vocabularies
          too baroque to choose from (a takeout menu of sixty near-identical
          roles, where every screen is a fresh negotiation).
        </p>
        <p>
          The working answer is a decision procedure, not a vibe:
          <strong> every token answers a question</strong> (&quot;what is our
          decision for X?&quot;), and the <em>provenance of the answer</em>{' '}
          decides the layer. Some answers are determined by
          constraints—accessibility floors, perceptual thresholds, composition
          rules—and those are derived, documented, and wrong-able. Others are
          brand choices—defensible, themeable, and meaningless to argue about on
          the merits. Confusing the two is how systems get both brittle and
          bloated: derived values locked in as if they were taste, and taste
          defended as if it were physics.
        </p>
        <p>
          This page turns that procedure into checks you can run on any token,
          using this repository&apos;s scales as the worked evidence.
        </p>
      </>
    ),
  },
  {
    type: 'core-concepts',
    id: 'core-concepts',
    title: 'Core Concepts: Provenance, Granularity, Availability',
    order: 4,
    content: (
      <>
        <h3>Provenance: Derived or Chosen?</h3>
        <p>
          Interrogate any token with one question:{' '}
          <em>
            could a sufficiently careful analysis have computed this value from
            requirements?
          </em>{' '}
          If yes, it is <strong>derived</strong> and belongs with the machinery
          that derives it. If no—if the value is one defensible pick among
          many—it is <strong>chosen</strong> and belongs where choices are
          centralized and swapped.
        </p>
        <p>
          The derived set in this repository is larger than most teams expect,
          and that is the system&apos;s quiet strength:
        </p>
        <ul>
          <li>
            <strong>Accessibility floors:</strong> <code>tapTargetMin</code>{' '}
            44px, <code>actionMinHeight</code> 36px, the 4.5:1/3:1/7:1
            thresholds, the 320px reflow point, reduced-motion handling. These
            are not opinions; a violation is a defect.
          </li>
          <li>
            <strong>Perceptual derivations:</strong> the color ramps
            (contrast-keyed at 1.15:1, luminance-uniform, shared per-level
            targets), the frame-quantized durations, the one-frame stagger
            floor. Wrong values are perceptually indistinguishable noise.
          </li>
          <li>
            <strong>Composition rules:</strong> control heights from spacing
            steps, icon sizes aligned to the same scale, nesting radius
            step-downs, depth numbers that order with shadow levels.
          </li>
        </ul>
        <p>
          And the chosen set is equally specific: the accent family per brand,
          the radius personality, the 1.5px stroke weight, the easing
          characters, the breakpoint stops. None of these can be argued from
          requirements—but all of them are <em>localized</em>: one field in a
          brand file, one semantic mapping, one slot in the generator&apos;s
          anchors. The layer boundary exists precisely so that changing a chosen
          value never requires touching a derived one.
        </p>

        <h3>The Test That Separates Them</h3>
        <pre>
          <code>{`// Ask of any token:
// 1. What question does it answer? ("What is our decision for ___?")
// 2. Who could re-derive the value, and from what?
//    - From WCAG / perception / composition  → derived (core or a rule)
//    - From brand identity / a decision      → chosen (brand/theme data)
// 3. What breaks if the value changes?
//    - A validator, an audit, a physical law → it was derived
//    - Nothing; it just looks different      → it was chosen

// Worked: feedback.border.warning = orange.700 (light) / orange.300 (dark)
//   The hue family is chosen (warning ≈ orange, by convention).
//   The 700/300 split is derived (contrast parity per mode).
//   Both facts live in one token — that is normal, and the layer
//   boundary is at the reference, not inside the value.`}</code>
        </pre>

        <h3>Granularity: The Perceptual Floor</h3>
        <p>
          How fine should a scale be? Fine enough that adjacent steps are
          distinguishable—no finer. A just-noticeable difference for quantities
          like duration and size is roughly 15%: adjacent scale steps closer
          than that are two names for one answer, and two names for one answer
          is where drift breeds (teams pick by name aesthetics; reviewers cannot
          arbitrate because nothing looks different).
        </p>
        <p>
          Audit this system&apos;s scales against that floor and the verdicts
          are instructive. Spacing passes cleanly—every adjacent step is 33–100%
          apart. Icons (20–33%) pass. The
          <em> composite</em> durations consumers actually see
          (83/100/167/250/333ms) pass at 20–67%. The raw duration scale does
          not: 150/167ms, 300/333ms, 600/667ms sit at ~11%, and{' '}
          <code>medium</code>/<code>medium1</code> are both 250ms—name-only
          distinctions, kept tolerable only because the consumption tier never
          offers them.
        </p>

        <h3>Availability: The Tier That Choosers See</h3>
        <p>
          The takeout-menu problem is solved at the consumption layer, not the
          storage layer. Raw scales can afford breadth (sixteen durations, nine
          color families) precisely because choosers are offered the{' '}
          <em>semantic</em> tier: a handful of roles and composites, each with a
          sentence-test name and a decided meaning. The rule for sizing that
          tier:
        </p>
        <ul>
          <li>
            Enough decided answers that new work is mostly
            <em> looking up</em> what the system already decided—the arbitrary
            decisions become outliers.
          </li>
          <li>
            Few enough that choosing is not itself a project—if two roles theme
            the same, fail the same, and compose the same, they are one role.
          </li>
        </ul>
        <p>
          In practice this system&apos;s working menu is small: seven motion
          composites, a dozen color role groups, three border roles, six radius
          roles. Everything else is either storage (core) or wrapping (component
          tokens)—and the layering makes each tier&apos;s size a separate,
          deliberate decision.
        </p>

        <h3>Atomic Is a Storage Word, Semantic Is a Job Word</h3>
        <p>
          The naming asymmetry is the tell: atomic tokens are named for what
          they <em>are</em> (a family, a step, a frame count); semantic tokens
          are named for what they <em>do</em> (the hover background of the
          primary action). When you catch a &quot;semantic&quot; token whose
          name is secretly atomic—<code>blueForButtons</code>—the layer boundary
          has leaked, and the refactor is usually to promote the intent into a
          proper role rather than to rename the color.
        </p>
      </>
    ),
  },
  {
    type: 'system-roles',
    id: 'system-roles',
    title: 'System Roles: Who Guards the Boundary',
    order: 5,
    content: (
      <>
        <h3>Design Impact</h3>
        <p>
          Designers own the question list: which decisions the system has
          decided, phrased as roles. A designer&apos;s comp that uses a color no
          role answers for is either a new role (does it theme or fail
          differently?) or off-system (absorb it). The provenance questions keep
          the role list honest.
        </p>
        <h3>Engineering Impact</h3>
        <p>
          Engineers own the reference directions and the tiering: semantic
          references core, components reference semantic, and nothing offers raw
          scale values to product code. The reference linter is the mechanical
          guard; the code review question &quot;which composite/role is
          this?&quot; is the human one.
        </p>
        <h3>Accessibility Impact</h3>
        <p>
          Accessibility owns the derived floor&apos;s authority: when a derived
          value conflicts with a chosen one, derived wins where users are
          affected (contrast over brand hex, targets over sleekness) and the
          choice re-routes (another family, another step) rather than the
          constraint bending.
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
          The design tool mirrors the tiers as variable structure: collections
          hold the atomic scales (storage), modes and styles hold the semantic
          roles (the menu designers actually pick from). A designer choosing
          from raw palettes inside a comp is the design-side equivalent of a
          component consuming <code>--core-*</code>—technically possible,
          structurally wrong, and the review catch is identical: &quot;which
          role is this?&quot;
        </p>
      </>
    ),
    codeContent: (
      <>
        <p>
          In code, the boundary is the reference direction—and the one place it
          is legal to cross:
        </p>
        <pre>
          <code>{`// Legal: semantic → core (the alias resolves upward)
"feedback.border.warning": {
  "$value": "{color.palette.orange.700}",          // chosen family,
  "$extensions": {                                  // derived split
    "design.paths.light": "{color.palette.orange.700}",
    "design.paths.dark":  "{color.palette.orange.300}"
  }
}

// Legal: component → semantic (the scoped wrap)
--ds-text-field-border-warning:
  var(--semantic-color-feedback-border-warning, #824500);

// Illegal both directions it can fail:
.card { background: var(--core-color-palette-blue-600); }
//                        ^ component reaching past its contract
"core.something": { "$value": "{semantic.color.foreground.primary}" }
//                       ^ core depending on a job word — inversion`}</code>
        </pre>
      </>
    ),
  },
  {
    type: 'applied-example',
    id: 'applied-example',
    title: 'Applied Example: Auditing a Token With the Procedure',
    order: 7,
    content: (
      <>
        <p>
          Someone proposes <code>spacing.size.18</code>—an 18px step
          &quot;between 16 and 24.&quot; Run the full procedure:
        </p>
        <ol>
          <li>
            <strong>Question:</strong> &quot;what is our decision for
            medium-plus gaps?&quot;—vague already. Good sign the proposal is
            symptom, not need.
          </li>
          <li>
            <strong>Provenance:</strong> is 18px derivable? No constraint yields
            it—not a target multiple, not a perceptual anchor. It is chosen; and
            chosen values that are just other steps belong to <em>density</em>,
            which already exists as an axis with slots for exactly this.
          </li>
          <li>
            <strong>Granularity:</strong> 16→18 is +12.5%—below the perceptual
            floor. Two names, one answer: the classic drift seed.
          </li>
          <li>
            <strong>Availability:</strong> the consumption tier offers semantic
            spacing and density modes; an 18px literal widens nothing that a
            density switch doesn&apos;t already decide.
          </li>
          <li>
            <strong>Verdict:</strong> reject the step; route the need —if the
            real complaint is &quot;default feels cramped in tables,&quot; that
            is a density or role conversation with a name that will survive the
            next refactor.
          </li>
        </ol>
        <p>
          Five checks, two minutes, and the vocabulary stayed tight while the
          actual need got named. That is the procedure earning its keep.
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
            <strong>Derived-heavy vs chosen-heavy systems:</strong> deriving
            everything you can (contrast-keyed ramps, frame quantization)
            front-loads rigor and pays off in audits; it also makes &quot;just
            change the value&quot; harder, which is the point and occasionally
            the friction.
          </li>
          <li>
            <strong>Raw breadth vs consumption tightness:</strong> broad storage
            with a narrow menu gives coverage and guardrails, but only if the
            tiering is enforced—breadth that leaks to choosers is a menu with no
            floor.
          </li>
          <li>
            <strong>Perceptual floors vs engineering quantization:</strong>{' '}
            frame-clean values and perceptually-distinguishable steps collide at
            ~11%; perception must win at the vocabulary layer because nobody
            sees a frame boundary.
          </li>
          <li>
            <strong>Splitting roles vs merging them:</strong> every split
            multiplies theme and audit surface; the merge rule (same theming,
            same failure, same composition ⇒ one role) is deliberately
            conservative.
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'layer-pitfalls',
    title: 'Common Pitfalls & Failure Modes',
    order: 8.5,
    content: (
      <>
        <h3>1. Semantic tokens wearing atomic names</h3>
        <pre>
          <code>{`// Bad: A job word costume over a value
--semantic-color-blue-for-links: #0a65fe;
// Good: The role owns the job; the value resolves upward
--semantic-color-foreground-link: var(--core-color-palette-brand-primary-600);`}</code>
        </pre>
        <h3>2. Derived values defended as taste</h3>
        <p>
          &quot;We chose 3:1 for borders&quot; is not a choice; it is WCAG
          1.4.11. Treating derived floors as negotiable style produces audit
          findings at the worst possible time. The fix is moving the number next
          to its citation.
        </p>
        <h3>3. Chosen values hardened as physics</h3>
        <p>
          The inverse: defending a brand hex or a 1.5px stroke as if it were
          accessibility. The cost is rebrands that touch derived layers—and the
          fix is routing every choice through theme data so changing it is a
          mapping edit.
        </p>
        <h3>4. Sub-perceptual vocabulary</h3>
        <pre>
          <code>{`// Bad: +12.5% apart — two names, one answer
size.06: 16px   size.065: 18px   size.07: 24px`}</code>
        </pre>
        <h3>5. Menu leakage</h3>
        <p>
          Product code consuming <code>--core-*</code> directly re-opens every
          decision the semantic tier closed. The reference linter exists for
          exactly this; a codebase that disables it has chosen drift.
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
            <strong>Core vs Semantic deep-dive</strong> — the layer mechanics
            worked end to end (
            <code>/blueprints/foundations/tokens/core-vs-semantic</code>)
          </li>
          <li>
            <strong>Token Naming &amp; Hierarchy</strong> — how the layers stay
            legible (<code>/blueprints/foundations/meta/token-naming</code>)
          </li>
          <li>
            <strong>Color Foundations</strong> — the contrast-keyed ramp
            derivation in full (<code>/blueprints/foundations/color</code>)
          </li>
          <li>
            <strong>Motion &amp; Duration</strong> — the JND audit and tiering
            that keeps the duration menu clean (
            <code>/blueprints/foundations/motion</code>)
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
    id: 'provenance-known',
    label: 'Every token can state its provenance',
    description:
      'Derived (cited constraint) or chosen (theme data) — no ambiguity',
    required: true,
  },
  {
    id: 'reference-direction',
    label: 'References flow one way: component → semantic → core',
    description: 'Inversions and reach-ins fail the reference lint',
    required: true,
  },
  {
    id: 'perceptual-floor',
    label: 'Adjacent scale steps clear the ~15% distinguishability floor',
    description:
      'Below it, collapse or re-derive — two names cannot share an answer',
    required: true,
  },
  {
    id: 'menu-sized',
    label: 'The consumption tier is small enough to choose from',
    description: 'Roles split only when they theme or fail differently',
    required: false,
  },
];

content.assessmentPrompts = [
  {
    question:
      'Take five tokens from any system you touch and classify each as derived or chosen, with the citation or the theme-data home for each. Which one was hardest to classify, and what does that difficulty tell you?',
    type: 'application',
  },
  {
    question:
      'A stakeholder asks for "just one more gray." Walk the procedure — question, provenance, granularity, availability — and describe the two system-legal answers that are not a new gray.',
    type: 'reflection',
  },
];

content.crossReferences = {
  concepts: [
    {
      slug: 'tokens',
      title: 'Design Tokens',
      description: 'The layer architecture this doctrine governs',
      type: 'foundation',
    },
    {
      slug: 'color',
      title: 'Color Foundations',
      description: 'The contrast-keyed ramps as derived-scale evidence',
      type: 'foundation',
    },
    {
      slug: 'motion',
      title: 'Motion & Duration Foundations',
      description: 'The JND audit and composite tiering as worked examples',
      type: 'foundation',
    },
  ],
  components: [],
  glossary: ['02', '18', '34'],
};

export const metadata = generateFoundationMetadata(pageMetadata);

export default function MetaAtomicVsSemanticPage() {
  return <FoundationPage content={content} />;
}
