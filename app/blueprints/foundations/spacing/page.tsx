/**
 * Foundation: Spacing & Sizing
 * How a modular spacing scale, density mapping, and minimum-target tokens
 * turn whitespace from a per-screen improvisation into a system rhythm.
 */

import type {
  FoundationPageMetadata,
  FoundationSection,
} from '@/types/foundationContent';
import { generateFoundationMetadata } from '@/utils/metadata/foundationMetadata';
import { createFoundationContent } from '../_lib/contentBuilder';
import { FoundationPage } from '../_lib/pageWrapper';

const pageMetadata: FoundationPageMetadata = {
  title: 'Spacing & Sizing Foundations',
  description:
    'Build layout rhythm you can trust: a modular spacing scale, density modes that rescale an entire product, sizing tokens for components, and the accessibility floors—44px touch targets—that spacing must never violate.',
  slug: 'spacing',
  canonicalUrl: 'https://darianrosebrook.com/blueprints/foundations/spacing',
  published_at: new Date().toISOString(),
  modified_at: new Date().toISOString(),
  image: 'https://darianrosebrook.com/darianrosebrook.jpg',
  keywords: 'spacing scale, sizing, density, touch targets, layout rhythm',
  learning: {
    learning_level: 'foundation',
    role_relevance: ['design', 'engineering'],
    prerequisites: ['tokens'],
    next_units: ['layout', 'grid'],
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
    expertise: ['Design Systems', 'Layout', 'Accessibility'],
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
          Whitespace is the cheapest material a designer has, and the most
          commonly squandered. When every screen invents its own margins, users
          experience the product as subtly untrustworthy—nothing lines up,
          nothing rhymes, and scanning costs more effort than it should. A
          spacing scale replaces those thousands of micro-decisions with eleven
          numbers everyone shares.
        </p>
        <p>
          Spacing also carries accessibility obligations in a way that is easy
          to miss: it governs whether controls are large enough to tap, whether
          text has the breathing room to stay legible, and whether related
          things read as related. And unlike color, spacing has a second
          dimension most systems skip—<em>density</em>—the ability to rescale an
          entire interface for a data-dense console or a spacious marketing page
          without redesigning either.
        </p>
        <p>
          This page covers the spacing system as built in this repository: the
          modular size scale in{' '}
          <code>ui/designTokens/core/spacing.tokens.json</code>, the density
          mapping that makes semantic spacing resizable per brand and mode, and
          the minimum-dimension tokens that keep touch targets legal.
        </p>
      </>
    ),
  },
  {
    type: 'core-concepts',
    id: 'core-concepts',
    title: 'Core Concepts: Scale, Density, and Floors',
    order: 4,
    content: (
      <>
        <h3>A Modular Scale, Not a Ruler</h3>
        <p>
          The core scale defines eleven steps, <code>spacing.size.00</code>{' '}
          through <code>spacing.size.10</code>:
        </p>
        <pre>
          <code>{`// ui/designTokens/core/spacing.tokens.json (values)
size.00 = 0px    size.04 = 8px    size.08 = 32px
size.01 = 1px    size.05 = 12px   size.09 = 48px
size.02 = 2px    size.06 = 16px   size.10 = 64px
size.03 = 4px    size.07 = 24px`}</code>
        </pre>
        <p>
          The shape is deliberate: two hairline steps (1px, 2px) for borders and
          dividers, then a roughly geometric climb from 4px that keeps every
          step at least +4 and never more than ×2 apart. That last property is
          what makes the scale composable—if 16px is right for card padding and
          24px for section gaps, the jump reads as intentional hierarchy rather
          than a different system. A linear scale (2, 4, 6, 8…) can&apos;t do
          that; by step seven its steps are perceptually identical, and by step
          twelve they are uselessly far apart.
        </p>
        <p>
          In CSS the scale emits as custom properties—{' '}
          <code>--core-spacing-size-04: 8px</code> and siblings—and component
          styles reference them (or their scoped aliases) rather than literals.
        </p>

        <h3>Density: The Second Axis</h3>
        <p>
          A single scale answers &quot;how much space?&quot; but not &quot;how
          tight is this product?&quot; That is density&apos;s job. The core
          layer defines four density scales—<code>tight</code>,{' '}
          <code>compact</code>, <code>default</code>, and <code>spacious</code>
          —each a complete set of slots (<code>xs…2xl</code>) at different
          magnitudes:
        </p>
        <pre>
          <code>{`// density slot values per scale (xs  sm  md  lg  xl  2xl)
tight:      2   4   6   8  12  16
compact:    4   8  12  16  20  24
default:    8  16  24  32  40  48
spacious:  12  20  32  40  56  64`}</code>
        </pre>
        <p>
          Semantic spacing references these scales, not the raw sizes:{' '}
          <code>spacing.semantic.stack</code> is{' '}
          <code>{`{spacing.density.default.sm}`}</code>—16px today, and 4px
          automatically in a tight-density brand. This is the mechanism behind
          the <code>density</code> cascade layer you can see in the generated
          stylesheet: the ocean brand ships <code>spacious</code>, midnight
          ships <code>tight</code>, and every component that went through
          semantic spacing rescales without a single edit. Components that
          hardcoded <code>size.05</code> stay fixed and quietly break the
          density story.
        </p>

        <h3>Minimum Targets Are Not Opinions</h3>
        <p>
          Two dimension tokens set floors that spacing must respect rather than
          tune: <code>dimension.tapTargetMin</code> is <strong>44px</strong>—the
          WCAG 2.5.5 / 2.1-style minimum for pointer targets—and{' '}
          <code>dimension.actionMinHeight</code> is <strong>36px</strong> for
          primary action controls. The pattern these enable: a compact icon
          button can be visually 32px (the icon size plus padding) while its hit
          area extends to 44px via padding or a pseudo-element. The visual size
          lives in spacing tokens; the <em>legal</em> size lives in the
          dimension floors; and a component that violates the floor to look
          sleeker is shipping an accessibility defect, not a style choice.
        </p>

        <h3>Sizing Components from the Scale</h3>
        <p>
          Component dimensions come from the same scale rather than their own
          numbers: a Badge&apos;s height is a scale step, a Card&apos;s padding
          is a scale step, and control heights align to{' '}
          <code>actionMinHeight</code> plus padding steps. The payoff is
          alignment: when paddings, gaps, and heights are all scale multiples,
          text baselines line up across adjacent components without anyone
          trying to make them.
        </p>
      </>
    ),
  },
  {
    type: 'system-roles',
    id: 'system-roles',
    title: 'System Roles: Where Spacing Decisions Land',
    order: 5,
    content: (
      <>
        <h3>Design Impact</h3>
        <p>
          Designers own rhythm—the choice of which steps mean what. A durable
          convention assigns each step a role: 4/8px for inside-component gaps,
          12/16px for related-content grouping, 24px for separation between
          groups, 48/64px for page-level sections. The rule of thumb is{' '}
          <strong>proximity encodes relationship</strong>: things 8px apart read
          as one thing; things 48px apart read as different things; nothing in
          between reads as uncertain.
        </p>
        <h3>Engineering Impact</h3>
        <p>
          Engineers own the plumbing: gap properties referencing scale
          variables, container queries and breakpoints consuming the scale (see
          Layout), and the lint discipline that keeps literals out of styles.
          The mechanical win of the scale is that vertical rhythm becomes
          arithmetic—stacks of scale steps land on scale steps.
        </p>
        <h3>Accessibility Impact</h3>
        <p>
          Accessibility owns the floors and the side effects: targets at or
          above 44px, adjacent controls separated enough to prevent mis-taps,
          and text line height left to the typography tokens rather than
          compressed for density&apos;s sake. Density modes get audited against
          the same floors—tight does not mean below the minimum.
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
          In the design tool, the spacing system appears as a named set of
          styles a designer applies instead of dragging: 4 and 8 for
          in-component, 12 and 16 for grouping, 24 for sections&apos; inner
          rhythm, 48 and 64 for page sections. The Figma side of density is
          mode-paired like color—each semantic spacing style has four density
          variants—so a designer can preview the tight brand by switching a
          mode, not by re-spacing the file.
        </p>
        <p>
          The checklist mentality travels with it: a design review that asks
          &quot;which step is this gap?&quot; catches drift before it reaches
          code, exactly the way asking &quot;which token is this color?&quot;
          does for color.
        </p>
      </>
    ),
    codeContent: (
      <>
        <p>
          In code, the scale emits as core custom properties and components
          consume scoped aliases; density rides the cascade layer:
        </p>
        <pre>
          <code>{`/* Generated: app/designTokens.scss */
@layer core, semantic, theme, brand, density;

@layer core {
  :root {
    --core-spacing-size-03: 4px;
    --core-spacing-size-04: 8px;
    --core-spacing-size-06: 16px;
  }
}

/* Semantic spacing references density, not raw sizes */
@layer semantic {
  :root {
    --semantic-spacing-stack:
      var(--core-spacing-density-default-sm); /* 16px */
  }
}

/* A dense brand rescales everything that went semantic */
@layer density {
  [data-density='tight'] {
    --semantic-spacing-stack:
      var(--core-spacing-density-tight-sm); /* 4px */
  }
}`}</code>
        </pre>
        <p>And the touch-target floor as a component pattern:</p>
        <pre>
          <code>{`/* Visual size from the scale; legal size from the floor */
.iconButton {
  width: var(--ds-icon-button-size, 32px);
  height: var(--ds-icon-button-size, 32px);
  /* hit area grows without changing the visual box */
  position: relative;
}
.iconButton::after {
  content: '';
  position: absolute;
  inset: calc((var(--core-dimension-tap-target-min, 44px) - 100%) / 2);
}`}</code>
        </pre>
      </>
    ),
  },
  {
    type: 'applied-example',
    id: 'applied-example',
    title: 'Applied Example: Spacing a Card List Screen',
    order: 7,
    content: (
      <>
        <p>
          Take a plain screen—a page of cards with a heading—and make every
          spacing decision once, with the system:
        </p>
        <ol>
          <li>
            <strong>Page gutter:</strong> <code>size.06</code> (16px) on mobile,
            stepping to <code>size.08</code> (32px) at the medium breakpoint—the
            only two responsive spacing decisions the screen makes; everything
            else is constant.
          </li>
          <li>
            <strong>Section separation:</strong> heading block to card list is{' '}
            <code>size.07</code> (24px)—same-group distance, because the heading
            describes the list.
          </li>
          <li>
            <strong>Card internal rhythm:</strong> padding <code>size.05</code>{' '}
            (12px) in tight contexts, <code>size.06</code> (16px) default;
            title-to-body gap <code>size.03</code> (4px)—inside-component scale.
          </li>
          <li>
            <strong>Card-to-card gap:</strong> the stack gap—semantic{' '}
            <code>spacing.semantic.stack</code>, which is density-mapped—so a
            dense dashboard variant tightens the list automatically.
          </li>
          <li>
            <strong>Floors check:</strong> the card&apos;s ghost action has a
            32px visual box; its hit area extends to 44px via the pseudo-element
            pattern. Nothing on the screen is below <code>tapTargetMin</code>.
          </li>
        </ol>
        <p>
          Five decisions, all scale references, one density-aware gap, two
          floors respected. The screen now matches every other screen that made
          the same five decisions the same way—which is the entire point.
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
            <strong>Eleven steps vs freedom:</strong> a fixed scale removes the
            13px option, which is the point—the 13px was always a rounding
            error. Escape hatch: a new step with review, not an inline literal.
          </li>
          <li>
            <strong>Density-aware vs predictable components:</strong> when gaps
            are density-mapped, a component&apos;s look varies by brand. That is
            the feature; the cost is that visual regression tests must run per
            density, not once.
          </li>
          <li>
            <strong>Floors vs sleekness:</strong> 44px targets look chunky next
            to 24px typography. The resolution is separating visual size from
            hit area—not quietly shrinking the target.
          </li>
          <li>
            <strong>One scale for padding and gaps:</strong> sharing the scale
            keeps arithmetic aligned but means the &quot;gap scale&quot; and
            &quot;padding scale&quot; can never drift apart. Teams that want
            independent scales usually want density, which already exists here.
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'spacing-pitfalls',
    title: 'Common Pitfalls & Failure Modes',
    order: 8.5,
    content: (
      <>
        <h3>1. The one-off literal</h3>
        <pre>
          <code>{`/* ❌ */
.card { padding: 14px; }
/* ✅ */
.card { padding: var(--ds-card-space-padding, 12px); }`}</code>
        </pre>
        <p>
          14px is 12px plus a hunch. Every literal re-opens the decision the
          scale closed.
        </p>
        <h3>2. Hardcoding density-mapped gaps</h3>
        <pre>
          <code>{`/* ❌ Opted out of density silently */
.list { gap: var(--core-spacing-size-06); }
/* ✅ Rides the density mode */
.list { gap: var(--semantic-spacing-stack); }`}</code>
        </pre>
        <h3>3. Shrinking targets to save space</h3>
        <pre>
          <code>{`/* ❌ 28px target in a dense table row */
.rowAction { width: 28px; height: 28px; }
/* ✅ Small visual, legal hit area */
.rowAction { width: 28px; height: 28px; position: relative; }
.rowAction::after { content:''; position:absolute;
  inset: calc((44px - 100%) / 2); }`}</code>
        </pre>
        <h3>4. Meaning-free step choice</h3>
        <p>
          When 20px and 24px both exist in a screen with no role difference, the
          scale has become a palette instead of a rhythm. The repair is
          assigning steps to meanings (component / group / section) and
          reviewing against the assignment.
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
            <strong>Layout</strong> — how the spacing scale meets containers and
            flow (<code>/blueprints/foundations/layout</code>)
          </li>
          <li>
            <strong>Grid Systems</strong> — columns and gutters on the same
            scale (<code>/blueprints/foundations/grid</code>)
          </li>
          <li>
            <strong>WCAG 2.5.5 target size</strong> — the normative basis for{' '}
            <code>tapTargetMin</code> (
            <code>
              https://www.w3.org/WAI/WCAG21/Understanding/target-size.html
            </code>
            )
          </li>
          <li>
            <strong>The sources</strong> —{' '}
            <code>ui/designTokens/core/spacing.tokens.json</code>,{' '}
            <code>ui/designTokens/core/dimension.tokens.json</code>,{' '}
            <code>ui/designTokens/semantic/spacing.tokens.json</code>
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
    id: 'scale-only',
    label: 'Spacing in styles references the scale or semantic spacing',
    description: 'No literal px paddings, margins, or gaps in rules',
    required: true,
  },
  {
    id: 'density-aware',
    label: 'Inter-component gaps ride density-mapped semantic tokens',
    description: 'Density modes rescale the product without edits',
    required: true,
  },
  {
    id: 'targets-legal',
    label: 'Pointer targets meet the 44px floor',
    description: 'Visual size and hit area are separated where needed',
    required: true,
  },
  {
    id: 'steps-meaningful',
    label: 'Step choices encode proximity semantics',
    description: 'Component / group / section each own distinct steps',
    required: false,
  },
];

content.assessmentPrompts = [
  {
    question:
      'A dashboard team wants everything 20% tighter. Walk through what changes when density mode switches to compact, what does not, and which bugs that asymmetry predicts.',
    type: 'application',
  },
  {
    question:
      'A designer complains the 11-step scale is limiting and requests a 20px step. What questions decide whether this is a scale gap, a density need, or drift?',
    type: 'reflection',
  },
];

content.crossReferences = {
  concepts: [
    {
      slug: 'tokens',
      title: 'Design Tokens',
      description:
        'The architecture the spacing scale and density layers live in',
      type: 'foundation',
    },
    {
      slug: 'color',
      title: 'Color Foundations',
      description: 'The sibling page: ramps, roles, and per-mode resolution',
      type: 'foundation',
    },
    {
      slug: 'layout',
      title: 'Layout',
      description:
        'Containers, flow, and breakpoints consuming the spacing scale',
      type: 'foundation',
    },
  ],
  components: [],
  glossary: ['06', '12', '19'],
};

export const metadata = generateFoundationMetadata(pageMetadata);

export default function SpacingPage() {
  return <FoundationPage content={content} />;
}
