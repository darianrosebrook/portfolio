/**
 * Foundation Accessibility: Philosophy & Practice
 * The argument that survives deadlines: accessibility as a fairness
 * obligation and a design constraint that improves the product — with
 * the practices that keep the argument load-bearing when the pressure
 * argues back.
 */

import type {
  FoundationPageMetadata,
  FoundationSection,
} from '@/types/foundationContent';
import { generateFoundationMetadata } from '@/utils/metadata/foundationMetadata';
import { createFoundationContent } from '../../_lib/contentBuilder';
import { FoundationPage } from '../../_lib/pageWrapper';

const pageMetadata: FoundationPageMetadata = {
  title: 'Accessibility Philosophy & Practice',
  description:
    'Frame accessibility as a design constraint that enhances decision-making: the fairness obligation that does not scale down, the curb-cut effects that benefit everyone, and the practices that hold when deadlines argue.',
  slug: 'accessibility/philosophy',
  canonicalUrl:
    'https://darianrosebrook.com/blueprints/foundations/accessibility/philosophy',
  published_at: new Date().toISOString(),
  modified_at: new Date().toISOString(),
  image: 'https://darianrosebrook.com/darianrosebrook.jpg',
  keywords: 'accessibility philosophy, constraints, curb cuts, fairness',
  learning: {
    learning_level: 'foundation',
    role_relevance: ['design', 'engineering', 'a11y', 'governance'],
    prerequisites: ['philosophy'],
    next_units: ['color', 'motion'],
    assessment_required: false,
    estimated_reading_time: 13,
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
    expertise: ['Design Systems', 'Accessibility', 'Philosophy'],
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
          Every accessibility practice fails at the same moment: the deadline.
          Not because teams stop believing in accessibility, but because belief
          is exactly what deadlines are designed to steamroll. A philosophy of
          accessibility that lives in conviction will lose to a roadmap every
          time; one that lives in the system&apos;s structure loses to nothing,
          because it does not need to win arguments—it needs only to be the
          default.
        </p>
        <p>
          This page is the argument underneath the track&apos;s mechanics: why
          accessibility is a fairness obligation that does not scale down with
          timeline, why treating it as a constraint improves the product for
          everyone, and what the practices look like when they are designed to
          survive pressure rather than merely to be correct.
        </p>
      </>
    ),
  },
  {
    type: 'core-concepts',
    id: 'core-concepts',
    title: 'Core Concepts: Fairness, Curb Cuts, Constraint, Defaults',
    order: 4,
    content: (
      <>
        <h3>The Fairness Frame</h3>
        <p>
          Disability is the only minority anyone can join at any moment—and most
          people will, temporarily or permanently, if they live long enough.
          Situations create it daily: a broken arm, a bright sun on a screen, a
          noisy commute, a first language that is not the interface&apos;s. The
          fairness claim is therefore not about a special population &quot;over
          there&quot;: an interface that only works for the currently-able,
          currently-quiet, currently-sighted is an interface that excludes its
          own users predictably.
        </p>
        <p>
          The practical consequence for systems work: fairness obligations are
          not features with priorities. They are constraints with citations. A
          login flow that fails a screen reader is not 80% done—it is broken,
          the way a bridge that holds 80% of its load is broken. Framing is
          everything: the moment accessibility is a feature, it is negotiable;
          the moment it is a constraint, it is design input.
        </p>

        <h3>The Curb-Cut Effect</h3>
        <p>
          Curb cuts were mandated for wheelchair users and became used by
          everyone—parents with strollers, travelers with luggage, delivery
          workers, runners. Interfaces reproduce this pattern relentlessly:
        </p>
        <ul>
          <li>
            Captions built for deaf users serve open-plan offices and noisy
            commutes.
          </li>
          <li>
            Sufficient contrast built for low vision serves glare, small
            screens, and aging eyes—everyone&apos;s eyes.
          </li>
          <li>
            Keyboard operability built for motor and vision differences becomes
            the power-user path and the test automation substrate (this
            repository&apos;s e2e suite is, structurally, a keyboard user).
          </li>
          <li>
            Reduced-motion support built for vestibular disorders serves every
            user who finds animation distracting.
          </li>
        </ul>
        <p>
          The philosophical point is precise: the constraint did not cost
          quality—it <em>revealed</em> it. The versions of these features that
          serve everyone are the well-made versions; the exclusionary versions
          were just the lazy ones. Curb cuts are not a tax on design; they are
          design done right, noticed.
        </p>

        <h3>Constraint as Creativity</h3>
        <p>
          The track&apos;s recurring reversal deserves its own articulation:
          constraints adopted early become creative material. The 44px target
          floor did not make buttons worse—it forced the visual-size/hit-area
          separation that made dense toolbars possible <em>and</em> legal. The
          reduced-motion contract did not drain the interface of life—it forced
          the fade-based motion vocabulary that reads as calm instead of cheap.
          The DOM-order rule did not constrain layout—it forced flow-based
          layouts that reflowed on every screen the design never anticipated.
        </p>
        <p>
          That is the philosophical center:{' '}
          <strong>
            a constraint internalized early is an affordance; the same
            constraint discovered late is a tax.
          </strong>{' '}
          The system&apos;s job, and this track&apos;s, is to move constraints
          across that line before product work meets them.
        </p>

        <h3>Defaults Over Intentions</h3>
        <p>
          The practice that operationalizes all of the above: accessibility
          outcomes should be <em>defaults</em>, not intentions. Not &quot;we
          intend to check contrast&quot; but a validator that fails the merge.
          Not &quot;designers should name icons&quot; but a component API where
          the label is the visible path. The philosophy page&apos;s unique
          burden is honesty about the gap: every default in this system was once
          an intention someone decided to encode, and the encoding is ongoing
          work, not a finished state.
        </p>
      </>
    ),
  },
  {
    type: 'system-roles',
    id: 'system-roles',
    title: 'System Roles: Philosophy in the Org Chart',
    order: 5,
    content: (
      <>
        <h3>Design Impact</h3>
        <p>
          Designers own the reframe: constraints as brief, not bondage. The
          craft claim is strong and true—the accessible version is usually the
          better-made version, and the portfolio proves it.
        </p>
        <h3>Engineering Impact</h3>
        <p>
          Engineers own the default-enforcement: every intention worth keeping
          is worth a check, a contract field, or a token. The honest question in
          review: <em>what keeps this true when I am not here?</em>
        </p>
        <h3>Governance Impact</h3>
        <p>
          Governance owns the non-negotiability: when schedule pressure proposes
          deferring a fairness constraint, the answer is structural—it is not in
          the gift of the sprint to defer. That is what citing standards,
          encoding floors, and wiring gates buys: the argument ends before it
          starts.
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
          The design-side philosophy shows up as briefs that state constraints
          as inputs: &quot;this surface must clear 3:1 per mode; here is the
          role ladder; the floors are fixed.&quot; Designers who receive
          constraints as material rather than verdicts produce the curb
          cuts—because they are the ones positioned to find the version of the
          idea that works within the guarantee.
        </p>
      </>
    ),
    codeContent: (
      <>
        <p>
          The code-side philosophy shows up as the answer to &quot;what keeps
          this true?&quot; for each claim:
        </p>
        <pre>
          <code>{`// Intention:   "contrast should pass AA"
// Encoding:    WCAG_LEVELS + validateColorPair in the build
// Keeps it true when: the team is rushed, the reviewer is new,
//                     the deadline is tomorrow

// Intention:   "icons should have labels when meaningful"
// Encoding:    Icon component API — label prop yields role=img;
//              omission yields aria-hidden; both branches reviewed
// Keeps it true when: nobody remembers the rule

// Philosophy's contribution: auditing which intentions remain
// unencoded — that list IS the accessibility roadmap.`}</code>
        </pre>
      </>
    ),
  },
  {
    type: 'applied-example',
    id: 'applied-example',
    title: 'Applied Example: The Deadline Conversation, Rewritten',
    order: 7,
    content: (
      <>
        <p>
          The scene every team knows: Friday, launch Monday, and QA files
          &quot;dialog unusable with keyboard.&quot; The old conversation is
          triage: how bad is it, who is affected, can it ship. The rewritten
          conversation has different furniture:
        </p>
        <ol>
          <li>
            <strong>Constraint, not feature:</strong> keyboard operability is SC
            2.1.1—a floor the dialog cannot be &quot;mostly&quot; above. The
            question was never &quot;ship or not&quot;; it was broken or fixed.
          </li>
          <li>
            <strong>Root cause, not heroics:</strong> the dialog component
            trapped focus because its contract never specified focus management.
            The fix lands in the component; the <em>finding</em> lands in the
            contract fields—next quarter&apos;s dialogs cannot have this bug
            because the contract now names the behavior.
          </li>
          <li>
            <strong>The default moves:</strong> the e2e suite gains a keyboard
            walk of every overlay. The conversation becomes unrepeatable—not
            because the team vowed harder, but because the check now exists.
          </li>
          <li>
            <strong>Curiosity over blame:</strong> what made the gap invisible
            until Friday? That answer—missing contract field, missing test,
            missing AT pass—routes the next constraint across the early line.
          </li>
        </ol>
        <p>
          Nothing in the rewritten conversation requires anyone to care more. It
          requires the system to make caring unnecessary. That is the whole
          philosophy.
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
            <strong>Perfection vs trajectory:</strong> full conformance is a
            horizon; the honest system states its current coverage and its
            encoding roadmap. Claiming done-ness you cannot verify is worse than
            measured partiality.
          </li>
          <li>
            <strong>Automation vs judgment:</strong> checks cover the computable
            subset; comprehension, flow, and real AT behavior need humans with
            tools and time. Budgeting both is the practice; substituting one for
            the other is the failure.
          </li>
          <li>
            <strong>Encode vs expedite:</strong> encoding always loses to
            expedite <em>this sprint</em> and always wins every sprint after.
            The philosophy&apos;s job is to lengthen the accounting period.
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'a11y-philosophy-pitfalls',
    title: 'Common Pitfalls & Failure Modes',
    order: 8.5,
    content: (
      <>
        <h3>1. Performative accessibility</h3>
        <p>
          The statement without the structure—values pages, training days,
          unchanged defaults. The test: name the check, contract, or token that
          keeps each stated value true.
        </p>
        <h3>2. Overlays as absolution</h3>
        <p>
          Third-party &quot;accessibility widgets&quot; that patch the DOM at
          runtime are widely documented as user-hostile to the AT users they
          claim to serve. The system posture: fix the source; never bolt on a
          persona of care.
        </p>
        <h3>3. The single advocate</h3>
        <p>
          When one person is the accessibility conscience, their vacation is the
          vulnerability. Encode their judgment into checks and contracts—the
          advocate&apos;s real job is to make themselves unnecessary.
        </p>
        <h3>4. Constraint theater</h3>
        <p>
          Citing WCAG for choices that are actually preference (&quot;the
          standard requires our blue&quot;) spends the credibility that real
          citations need. Provenance discipline—derived or chosen, honestly
          labeled—applies to a11y claims most of all.
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
            <strong>The track landing</strong> — the infrastructure frame this
            page argues for (<code>/blueprints/foundations/accessibility</code>)
          </li>
          <li>
            <strong>Accessibility standards</strong> — the citations constraints
            carry (<code>/blueprints/foundations/accessibility/standards</code>)
          </li>
          <li>
            <strong>Philosophy of Design Systems</strong> — the systems-thinking
            parent (<code>/blueprints/foundations/philosophy</code>)
          </li>
          <li>
            <strong>WAI&apos;s curbcut-adjacent case studies</strong> — how
            constraints compound (
            <code>https://www.w3.org/WAI/business-case/</code>)
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
    id: 'cited-constraints',
    label: 'Accessibility claims carry citations or are labeled preferences',
    description: 'Constraint theater spends credibility needed elsewhere',
    required: true,
  },
  {
    id: 'intentions-tracked',
    label: 'Unencoded intentions are listed as the roadmap',
    description: 'The gap list is honest and shrinking',
    required: true,
  },
  {
    id: 'deadline-conversation',
    label: 'Failures route to encoding, not only to fixes',
    description: 'Every incident ends in a check, contract, or token',
    required: true,
  },
  {
    id: 'no-single-advocate',
    label: 'No accessibility outcome depends on one person present',
    description: 'Judgment lives in structure, not attendance',
    required: false,
  },
];

content.assessmentPrompts = [
  {
    question:
      'Write the unencoded-intentions list for a system you know: every accessibility value the team holds that no check, contract, or token keeps true. Rank the top three by blast radius.',
    type: 'application',
  },
  {
    question:
      'Describe a time a constraint you resented later revealed itself as an affordance (a personal curb cut). What changed—your skill, the constraint, or your understanding of quality?',
    type: 'reflection',
  },
];

content.crossReferences = {
  concepts: [
    {
      slug: 'philosophy',
      title: 'Philosophy of Design Systems',
      description: 'The systems-thinking frame this page specializes',
      type: 'foundation',
    },
    {
      slug: 'tokens',
      title: 'Design Tokens',
      description: 'Where fairness constraints become defaults',
      type: 'foundation',
    },
    {
      slug: 'motion',
      title: 'Motion & Duration Foundations',
      description: 'The reduced-motion contract as constraint-as-affordance',
      type: 'foundation',
    },
  ],
  components: [],
  glossary: ['01', '16', '42'],
};

export const metadata = generateFoundationMetadata(pageMetadata);

export default function AccessibilityPhilosophyPage() {
  return <FoundationPage content={content} />;
}
