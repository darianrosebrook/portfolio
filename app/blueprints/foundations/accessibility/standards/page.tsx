/**
 * Foundation Accessibility: Standards & Principles
 * The normative sources and how they become system constraints: WCAG
 * 2.1's POUR principles and numeric thresholds, ARIA's role in the
 * semantics layer, and where the standards are heading (APCA, 2.2) —
 * each mapped to the token, contract, or check that encodes it here.
 */

import type {
  FoundationPageMetadata,
  FoundationSection,
} from '@/types/foundationContent';
import { generateFoundationMetadata } from '@/utils/metadata/foundationMetadata';
import { createFoundationContent } from '../../_lib/contentBuilder';
import { FoundationPage } from '../../_lib/pageWrapper';

const pageMetadata: FoundationPageMetadata = {
  title: 'Accessibility Standards & Principles',
  description:
    'How WCAG 2.1, the POUR principles, and WAI-ARIA shape accessible design systems: the numeric thresholds this repo encodes in tokens and validators, the criteria that govern structure and motion, and the honest posture toward what standards do not yet cover.',
  slug: 'accessibility/standards',
  canonicalUrl:
    'https://darianrosebrook.com/blueprints/foundations/accessibility/standards',
  published_at: new Date().toISOString(),
  modified_at: new Date().toISOString(),
  image: 'https://darianrosebrook.com/darianrosebrook.jpg',
  keywords: 'WCAG, POUR, ARIA, standards, conformance',
  learning: {
    learning_level: 'foundation',
    role_relevance: ['design', 'engineering', 'a11y'],
    prerequisites: ['philosophy'],
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
    expertise: ['Design Systems', 'Accessibility', 'Standards'],
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
          Standards are what make accessibility arguments end. Without them,
          every threshold is a preference and every exclusion is a trade-off
          someone can defend. With them, &quot;the text must clear 4.5:1&quot;
          is not a position to negotiate but a fact to encode—and the entire
          architecture of this system (validators, tokens, contracts) exists to
          turn those facts into defaults.
        </p>
        <p>
          Standards also carry a second, subtler value: they are
          <em>learned ignorance</em>—distilled findings about what fails for
          whom, written by people who studied the failures so you do not
          rediscover them in production. Knowing which criterion teaches which
          lesson turns compliance from paperwork into curriculum.
        </p>
        <p>
          This page maps the standards onto the system: each principle and
          threshold, and the specific place here that encodes it—because a
          standard a system cannot point to its own implementation of is a
          standard it is quoting, not following.
        </p>
      </>
    ),
  },
  {
    type: 'core-concepts',
    id: 'core-concepts',
    title: 'Core Concepts: POUR, Thresholds, Semantics, Directions',
    order: 4,
    content: (
      <>
        <h3>POUR: The Four Principles</h3>
        <p>
          WCAG organizes all criteria under four principles—content must be{' '}
          <strong>P</strong>erceivable, <strong>O</strong>perable,{' '}
          <strong>U</strong>nderstandable, and <strong>R</strong>obust—and the
          principles do real work as a debugging taxonomy:
        </p>
        <ul>
          <li>
            <strong>Perceivable:</strong> information and UI components must be
            presentable to users&apos; senses. The home of contrast, text
            alternatives, captions, and reflow.
          </li>
          <li>
            <strong>Operable:</strong> every interaction must work by multiple
            means. The home of keyboard access, target sizes, motion
            sensitivity, and timing.
          </li>
          <li>
            <strong>Understandable:</strong> content and operation must be
            comprehensible. The home of readable text, predictable behavior, and
            input assistance.
          </li>
          <li>
            <strong>Robust:</strong> content must survive interpretation by a
            wide range of user agents—
            <em>the assistive-technology principle</em>, and the reason
            semantics are a foundations concern rather than a
            component-by-component courtesy.
          </li>
        </ul>
        <p>
          The taxonomy&apos;s practical use: when something fails, POUR names
          the failure class before the fix does. A dialog that cannot be closed
          by keyboard is not a &quot;bug &quot;—it is an operability failure
          with a criteria number.
        </p>

        <h3>The Numeric Thresholds, Encoded</h3>
        <p>
          The criteria this system computes live as constants and tokens—each
          with its citation:
        </p>
        <pre>
          <code>{`// utils/accessibility/tokenValidator.ts — WCAG_LEVELS
AA_NORMAL: 4.5   // SC 1.4.3 — body text
AA_LARGE:  3.0   // SC 1.4.3 — large text; SC 1.4.11 — UI parts
AAA_NORMAL: 7.0  // enhanced contrast
AAA_LARGE:  4.5

// Encoded elsewhere in this repo:
dimension.tapTargetMin: 44px    // SC 2.5.5 (AAA) / 2.5.8 (2.2, AA)
dimension.actionMinHeight: 36px // control height floor
320px reflow                     // SC 1.4.10 — reflow
prefers-reduced-motion          // SC 2.3.3 — animation from
                                //   interactions (the motion
                                //   system's dual contract)`}</code>
        </pre>
        <p>
          Conformance levels matter for what they make negotiable:
          <strong> A</strong> is the must-not-ship-without floor,{' '}
          <strong>AAA</strong> is aspiration where achievable (and provably
          impossible for some criteria—WCAG says so itself). The system posture:
          encode AA as hard gates, treat AAA as a target where the physics
          permits (the secondary-text pair clears AAA at ≈7.5:1; the accent as
          text does not, and the color page says so honestly).
        </p>

        <h3>ARIA: The Semantics Layer</h3>
        <p>
          WAI-ARIA is not HTML-plus-decorations; it is a vocabulary for
          expressing semantics HTML cannot. The design system&apos;s stake in it
          is Robustness: AT consumes a name/role/value tree, and components are
          where that tree is either well-formed or broken. The contract files
          carry the obligation as fields—<code>a11y.role</code>,{' '}
          <code>labeling</code>, <code>keyboard</code>, <code>apgPattern</code>
          —so a component&apos;s semantic surface is declared, reviewable, and
          testable, not folklore in its JSX.
        </p>
        <p>
          The first rule of ARIA governs usage throughout: prefer the native
          element (<code>button</code> over <code>role=&quot;button&quot;</code>
          ), and reach for ARIA only where native semantics cannot express the
          pattern. The Icon component&apos;s binary—labeled{' '}
          <code>role=&quot;img&quot;</code> or hidden <code>aria-hidden</code>
          —is the smallest possible example of correct usage.
        </p>

        <h3>Where Standards Are Heading</h3>
        <ul>
          <li>
            <strong>APCA</strong> (part of WCAG 2.2&apos;s future and beyond)
            models perceptual contrast better than WCAG 2.1&apos;s relative
            luminance—especially on dark surfaces. This repo computes 2.1 ratios
            today and says so; the validator is where the math will change when
            the standard does.
          </li>
          <li>
            <strong>WCAG 2.2</strong> adds focus appearance (SC 2.4.11), dragging
            movements (2.5.7), and target size at AA (2.5.8, 24px)—the last a
            loosened cousin of the 44px this system enforces, which remains the
            safer default.
          </li>
        </ul>
        <p>
          The posture toward all of it: standards are the floor that learns.
          Encode them tightly enough to be enforced, loosely enough to be
          updated—the constants are data, the citations are comments, and the
          validators are the only code that has to change.
        </p>
      </>
    ),
  },
  {
    type: 'system-roles',
    id: 'system-roles',
    title: 'System Roles: Who Answers to the Standard',
    order: 5,
    content: (
      <>
        <h3>Design Impact</h3>
        <p>
          Designers inherit POUR as a review taxonomy and the thresholds as
          brief data: which pairs clear AA, which targets clear the floor, per
          mode. The design-side checkers compute the same numbers the validator
          does.
        </p>
        <h3>Engineering Impact</h3>
        <p>
          Engineers inherit the encoding duty: every threshold either has a home
          (constant, token, check) or is on the unencoded list. The standards
          page is the map of homes.
        </p>
        <h3>Governance Impact</h3>
        <p>
          Governance inherits conformance claims: what level, for which parts,
          with what evidence—and the honesty rule that a claim without a check
          behind it is marketing.
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
          The design side experiences standards as the shape of the material:
          ramps that bracket thresholds, size scales with legal floors, motion
          vocabulary with reduction built in. The brief cites the criterion
          numbers because the material already does.
        </p>
      </>
    ),
    codeContent: (
      <>
        <p>
          The code side maps each criterion to its enforcement point—this table
          is the page in miniature:
        </p>
        <pre>
          <code>{`SC 1.4.3  contrast        → WCAG_LEVELS + validateColorPair
SC 1.4.10 reflow          → layout tokens; e2e at 375px/320px
SC 1.4.11 non-text 3:1    → border role ladder + pair ledger
SC 2.1.1  keyboard        → contract a11y.keyboard + e2e walks
SC 2.5.5/2.5.8 targets    → dimension.tapTargetMin (44px)
SC 2.3.3  animation       → prefers-reduced-motion blocks +
                            ReducedMotionContext (one signal)
SC 4.1.2  name/role/value → contract a11y fields + axe in tests

// Nothing in this table is aspiration; each line names a file.`}</code>
        </pre>
      </>
    ),
  },
  {
    type: 'applied-example',
    id: 'applied-example',
    title: 'Applied Example: Encoding a New Criterion',
    order: 7,
    content: (
      <>
        <p>
          The team adopts WCAG 2.2&apos;s focus-appearance guidance (2.4.11):
          focus indicators must be large enough and contrastive enough to see.
          Walk the encoding:
        </p>
        <ol>
          <li>
            <strong>Extract the computable parts:</strong> indicator area (≥ 2px
            perimeter equivalent) and 3:1 change against adjacent colors. Both
            are numbers; both are therefore encodable.
          </li>
          <li>
            <strong>Find the homes:</strong> the size pairs with{' '}
            <code>control.border.focusWidth</code> (already the thick 2px step);
            the contrast joins the border pair ledger with a <code>focus</code>{' '}
            role entry.
          </li>
          <li>
            <strong>Wire the check:</strong> the pair validator gains the
            focus-on-background pair per mode; the component contract&apos;s{' '}
            <code>a11y</code> block records the indicator expectation for
            interactive components.
          </li>
          <li>
            <strong>Update the map:</strong> this page&apos;s table gains its
            row—because the table is the accountability surface: a criterion
            without a row here is either inapplicable or unencoded, and readers
            deserve to know which.
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
            <strong>Strictness vs coverage:</strong> enforcing 44px (2.5.5,
            AAA-level in 2.1) exceeds the AA floor and buys the safe default;
            teams with hard density constraints may bind to 2.5.8&apos;s 24px
            knowingly.
          </li>
          <li>
            <strong>Current math vs future math:</strong> locking 2.1 luminance
            makes results stable and comparable; APCA is more predictive.
            Validator-as-single-point keeps the switch cheap when it is time.
          </li>
          <li>
            <strong>Conformance claims vs evidence:</strong> claiming a level
            requires the checks to exist and be green; otherwise the claim is a
            liability with a deadline.
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'standards-pitfalls',
    title: 'Common Pitfalls & Failure Modes',
    order: 8.5,
    content: (
      <>
        <h3>1. Standards as decoration</h3>
        <p>
          Citing WCAG in values documents while thresholds live nowhere in the
          build. The test is this page&apos;s table: criterion → file, or admit
          the gap.
        </p>
        <h3>2. Level shopping</h3>
        <p>
          Choosing the level per feature (AA here, aspiration there) quietly
          produces neither. Levels are set per product claim, and the exceptions
          are explicit.
        </p>
        <h3>3. ARIA as absolution</h3>
        <pre>
          <code>{`<!-- ❌ Roles stapled over broken semantics -->
<div role="button" onclick="…">Sign up</div>
<!-- ✅ The native element IS the semantics -->
<button>Sign up</button>`}</code>
        </pre>
        <h3>4. Freezing on the current standard</h3>
        <p>
          2.1-only systems age into their own exceptions. The constants-as-data
          posture (one file to change) is the hedge.
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
            <strong>WCAG 2.1</strong> — the normative text (
            <code>https://www.w3.org/TR/WCAG21/</code>)
          </li>
          <li>
            <strong>WAI-ARIA Authoring Practices</strong> — the pattern
            vocabulary the contracts reference (
            <code>https://www.w3.org/WAI/ARIA/apg/</code>)
          </li>
          <li>
            <strong>Token-level accessibility</strong> — where these thresholds
            live in the system (
            <code>/blueprints/foundations/accessibility/tokens</code>)
          </li>
          <li>
            <strong>The sources</strong> —{' '}
            <code>utils/accessibility/tokenValidator.ts</code>,{' '}
            <code>ui/designTokens/core/dimension.tokens.json</code>, any
            contract&apos;s <code>a11y</code> block
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
    id: 'thresholds-homed',
    label: 'Every applied threshold has a file that enforces it',
    description:
      'Criterion → constant, token, or check — or an honest gap entry',
    required: true,
  },
  {
    id: 'pour-taxonomy',
    label: 'Failures are classified by POUR before they are fixed',
    description: 'The principle names the class; the criterion names the bar',
    required: true,
  },
  {
    id: 'native-first',
    label: 'Native semantics come before ARIA everywhere',
    description: 'ARIA fills gaps HTML cannot express, never replaces it',
    required: true,
  },
  {
    id: 'level-claims-evidenced',
    label: 'Conformance claims cite the checks behind them',
    description: 'A claim without a check is marketing',
    required: false,
  },
];

content.assessmentPrompts = [
  {
    question:
      'Build the criterion → enforcement map for a system you touch, using this page\u2019s table shape. Which row is hardest to fill, and what does that difficulty mean?',
    type: 'application',
  },
  {
    question:
      'Your product claims AA conformance. What evidence would a skeptical auditor ask for, and which of it exists as a check versus as memory?',
    type: 'reflection',
  },
];

content.crossReferences = {
  concepts: [
    {
      slug: 'accessibility',
      title: 'Accessibility as System Infrastructure',
      description: 'The track landing this page grounds in standards',
      type: 'foundation',
    },
    {
      slug: 'color',
      title: 'Color Foundations',
      description: 'The contrast computation and per-mode pairs',
      type: 'foundation',
    },
    {
      slug: 'motion',
      title: 'Motion & Duration Foundations',
      description: 'The reduced-motion contract behind SC 2.3.3',
      type: 'foundation',
    },
  ],
  components: [],
  glossary: ['01', '42', '27'],
};

export const metadata = generateFoundationMetadata(pageMetadata);

export default function FoundationsAccessibilityStandardsPage() {
  return <FoundationPage content={content} />;
}
