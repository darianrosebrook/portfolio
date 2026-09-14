/**
 * Foundation Accessibility: Token-Level Accessibility
 * Where constraints get teeth: the tokens and validators that make
 * contrast, motion sensitivity, legibility spacing, and focus states
 * structural defaults instead of remembered obligations.
 */

import type {
  FoundationPageMetadata,
  FoundationSection,
} from '@/types/foundationContent';
import { generateFoundationMetadata } from '@/utils/metadata/foundationMetadata';
import { createFoundationContent } from '../../_lib/contentBuilder';
import { FoundationPage } from '../../_lib/pageWrapper';

const pageMetadata: FoundationPageMetadata = {
  title: 'Token-Level Accessibility',
  description:
    'Build accessibility from the tokens up: contrast pairs validated per mode, motion safety as a dual CSS-and-script contract, legibility and touch-target floors in the dimension tokens, and focus as a composed, tokenized ring.',
  slug: 'accessibility/tokens',
  canonicalUrl:
    'https://darianrosebrook.com/blueprints/foundations/accessibility/tokens',
  published_at: new Date().toISOString(),
  modified_at: new Date().toISOString(),
  image: 'https://darianrosebrook.com/darianrosebrook.jpg',
  keywords: 'accessibility tokens, contrast, focus, reduced motion, targets',
  learning: {
    learning_level: 'intermediate',
    role_relevance: ['design', 'engineering', 'a11y'],
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
    expertise: ['Design Systems', 'Accessibility', 'Tokens'],
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
          A constraint in a document is guidance; the same constraint in a token
          is a default. That single promotion is the difference between a system
          that asks its users to remember accessibility and one whose ordinary
          use
          <em> produces</em> it. This page is the inventory of that promotion
          across the four constraint families—contrast, motion sensitivity,
          legibility spacing, and focus—each with its token home and the check
          that keeps it true.
        </p>
        <p>
          The pattern to watch for in every family is the same three-part shape:
          the <strong>floor</strong> (a number with a citation), the{' '}
          <strong>token</strong> (the floor as data, so consumers reference a
          name, not a memory), and the <strong>validator</strong> (the claim,
          checked mechanically). Where any part is missing, the page says
          so—those gaps are the track&apos;s remaining work.
        </p>
      </>
    ),
  },
  {
    type: 'core-concepts',
    id: 'core-concepts',
    title: 'Core Concepts: Four Families, One Shape',
    order: 4,
    content: (
      <>
        <h3>Family 1: Contrast</h3>
        <p>
          The floor is WCAG&apos;s ratios (AA 4.5:1 body, 3:1 UI and large text;
          AAA 7:1/4.5:1), held as <code>WCAG_LEVELS</code> in{' '}
          <code>utils/accessibility/tokenValidator.ts</code> beside{' '}
          <code>validateColorPair</code>. The tokens are the semantic{' '}
          <em>pairs</em>—<code>foreground.primary</code> over{' '}
          <code>background.primary</code> is a declared, mode-aware combination,
          not a coincidence of usage. And the ramps underneath are keyed so the
          common answers arrive correct: <code>500</code> at ≈4.9:1 on white
          clears body-text AA by construction; <code>400</code> at ≈3.2:1
          brackets the UI floor.
        </p>
        <pre>
          <code>{`// The pair discipline, in one example
"foreground.secondary": {
  "$value": "{color.palette.neutral.600}",         // light
  "$extensions": {
    "design.paths.dark": "{color.palette.neutral.300}"
  }
}
// light: #555 on #fff → 7.45:1 (AAA)
// dark:  #aeaeae on #000 → 9.47:1 (AAA)
// The pair is the claim; the validator walks it per mode.`}</code>
        </pre>
        <p>
          The rule the tokens encode: <strong>pair roles, not colors</strong>. A
          foreground role with an enumerated set of legal backgrounds is
          checkable; a foreground role meeting arbitrary hexes is a wish.
        </p>

        <h3>Family 2: Motion Sensitivity</h3>
        <p>
          The floor is SC 2.3.3: motion triggered by interaction must be
          suppressible. The tokens are the motion system&apos;s—the duration
          scale, the composite interactions, and above all the{' '}
          <strong>one signal</strong> reduced motion rides:{' '}
          <code>prefers-reduced-motion</code> blocks in CSS (dozens of
          components ship them) plus the <code>ReducedMotionContext</code> for
          scripted motion, combining the media query with a localStorage{' '}
          <code>reduce-motion</code> override so both worlds read one source of
          truth. The validator here is review plus the e2e walks—this
          family&apos;s check is the weakest of the four, and saying so is part
          of the inventory.
        </p>

        <h3>Family 3: Legibility Spacing and Targets</h3>
        <p>
          The floors are dimensional: <code>dimension.tapTargetMin</code> 44px
          (SC 2.5.5), <code>dimension.actionMinHeight</code> 36px for controls,
          and the spacing scale&apos;s minimums for readable rhythm. The tokens
          make the floor the easy path—control sizes <em>compose from</em> the
          scale (<code>control.size.md.height = spacing.size.08</code>, 32px
          visual with hit-area extension to 44), so the legal target is a token
          reference away. The check is e2e bounding-box assertions at the small
          viewport—the mobile walk the navigation suite already performs.
        </p>

        <h3>Family 4: Focus</h3>
        <p>
          Focus is the family most systems leave untokenized—and the one where
          tokens pay fastest, because focus styling drifts per-component within
          one sprint. Here it is a composed semantic token:
        </p>
        <pre>
          <code>{`// ui/designTokens/semantic/focus.tokens.json
"focus": {
  "ring": {
    "$type": "composition",
    "$value": {
      "border": {
        "width": "{interaction.focus.ringWidth}",  // 2px
        "style": "solid",
        "color": "{color.palette.red.500}"
      },
      "offset": "{interaction.focus.ringOffset}",  // 2px
      "opacity": "{interaction.focus.ringOpacity}" // 0.5
    }
  },
  "ringOffset": { "$value": "{spacing.size.02}" }
}`}</code>
        </pre>
        <p>
          Read what the composition buys: one ring, defined once, inheriting the
          accent ramp (it re-themes with brands automatically), offsetting from
          the element edge by a spacing step so it survives adjacent borders,
          and pairing with the shape system so focused pills get pill-shaped
          rings. The width pairs with <code>control.border.focusWidth</code>—the
          emphasis step—so focus is the border machinery one notch louder, not a
          separate invention per component.
        </p>

        <h3>The Inventory Discipline</h3>
        <p>
          Four families, four states of health: contrast is encoded and
          validated; targets are encoded and e2e checked; motion is encoded with
          a soft check; focus is encoded with review as its check. The
          page&apos;s table is deliberately that honest—an accessibility roadmap
          is the list of cells not yet able to say &quot;validated.&quot;
        </p>
      </>
    ),
  },
  {
    type: 'system-roles',
    id: 'system-roles',
    title: 'System Roles: Owning Each Family',
    order: 5,
    content: (
      <>
        <h3>Design Impact</h3>
        <p>
          Designers own the pair judgments (which foregrounds are legal over
          which backgrounds) and the focus visibility choices (offset, weight)
          within the floors. The tokens turn each judgment into a named default.
        </p>
        <h3>Engineering Impact</h3>
        <p>
          Engineers own the validators&apos; upkeep and the honest-check
          upgrades: motion needs its automated guarantee (a reduced-motion e2e
          assertion is the obvious next cell to fill).
        </p>
        <h3>Accessibility Impact</h3>
        <p>
          The a11y function owns the inventory review—quarterly, the
          table&apos;s gaps get named, prioritized, and assigned a check. The
          inventory is the roadmap; the roadmap is the inventory.
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
          Design-side, the families appear as the material&apos;s shape:
          palettes with threshold-bracketing ramps, size scales with legal
          floors, a focus style drawn once in the library and applied
          everywhere. A designer cannot easily make an inaccessible pair{' '}
          <em>without noticing</em>—the checker flags it while the color is
          still a decision.
        </p>
      </>
    ),
    codeContent: (
      <>
        <p>Code-side, consuming the families is deliberately boring:</p>
        <pre>
          <code>{`/* Contrast: consume the pair, never the parts */
.bodyText { color: var(--semantic-color-foreground-primary); }

/* Targets: visual size from the scale, legality from the floor */
.iconButton { width: 32px; height: 32px; position: relative; }
.iconButton::after { content:''; position:absolute;
  inset: calc((var(--core-dimension-tap-target-min, 44px) - 100%) / 2); }

/* Focus: the composed ring, never bespoke */
.button:focus-visible {
  outline: var(--semantic-focus-ring, 2px solid rgba(217, 41, 43, 0.5));
  outline-offset: var(--semantic-focus-ring-offset, 2px);
}

/* Motion: reduced honored by the one signal — CSS and script */
@media (prefers-reduced-motion: reduce) {
  .button { transition-duration: 1ms; }
}`}</code>
        </pre>
      </>
    ),
  },
  {
    type: 'applied-example',
    id: 'applied-example',
    title: 'Applied Example: Filling the Motion Cell',
    order: 7,
    content: (
      <>
        <p>
          Take the inventory&apos;s weakest cell—motion&apos;s check—and fill it
          the system way:
        </p>
        <ol>
          <li>
            <strong>State the claim:</strong> every component that animates
            honors <code>prefers-reduced-motion: reduce</code> by removing
            travel, keeping fades.
          </li>
          <li>
            <strong>Find the enumerable surface:</strong> the components with{' '}
            <code>transition</code> or <code>animation</code> in their CSS—a
            grep, not a survey.
          </li>
          <li>
            <strong>Write the check:</strong> an e2e pass that emulates the
            media query, opens each animated-pattern page, and asserts computed
            transition durations collapse to the reduced values.
          </li>
          <li>
            <strong>Update the inventory:</strong> the motion cell reads
            &quot;encoded and validated&quot;—and the next weakest cell gets its
            name called.
          </li>
        </ol>
        <p>
          The pattern is the point: every accessibility check this system has
          was added exactly this way—claim, surface, check, inventory.
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
            <strong>Pair enumeration vs usage freedom:</strong> declared pairs
            are checkable but must be grown as surfaces multiply; free-form
            usage is flexible and unverifiable. The system grows pairs
            deliberately, per new surface family.
          </li>
          <li>
            <strong>Focus composition vs customization:</strong> one ring
            prevents drift and removes per-product expression; the
            offset/opacity knobs exist for the legitimate variance, and anything
            beyond them is a system conversation.
          </li>
          <li>
            <strong>Soft checks vs no checks:</strong> review-only families fail
            silently; naming them in the inventory with their weak state is the
            honest middle until the check exists.
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'a11y-tokens-pitfalls',
    title: 'Common Pitfalls & Failure Modes',
    order: 8.5,
    content: (
      <>
        <h3>1. Unpaired foregrounds</h3>
        <pre>
          <code>{`/* Bad: Legal over what, exactly? */
.muted { color: var(--semantic-color-foreground-secondary); }
/* Good: The pair list exists; new surfaces add pairs, not hope */`}</code>
        </pre>
        <h3>2. Bespoke focus rings</h3>
        <pre>
          <code>{`/* Bad: Component four's own opinion */
.card:focus { outline: 3px dashed rebeccapurple; }
/* Good: The composed ring */
.card:focus-visible { outline: var(--semantic-focus-ring); }`}</code>
        </pre>
        <h3>3. Shrinking below the floor &quot;just for density&quot;</h3>
        <p>
          Tight density rescales spacing, never targets—the floor is orthogonal
          to density by design.
        </p>
        <h3>4. One-signal drift</h3>
        <p>
          Scripted motion reading only the media query (or only localStorage)
          forks the signal; CSS and script must disagree about nothing.
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
            <strong>Color Foundations</strong> — the ramps and pairs underneath
            the contrast family (<code>/blueprints/foundations/color</code>)
          </li>
          <li>
            <strong>Motion &amp; Duration</strong> — the reduced motion contract
            in full (<code>/blueprints/foundations/motion</code>)
          </li>
          <li>
            <strong>The sources</strong> —{' '}
            <code>utils/accessibility/tokenValidator.ts</code>,{' '}
            <code>semantic/focus.tokens.json</code>,{' '}
            <code>core/dimension.tokens.json</code>,{' '}
            <code>context/ReducedMotionContext.tsx</code>
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
    id: 'pairs-declared',
    label: 'Foreground roles enumerate their legal backgrounds',
    description: 'Pairs, not coincidences; per mode',
    required: true,
  },
  {
    id: 'floors-referenced',
    label: 'Target and control sizes reference the dimension floors',
    description: 'tapTargetMin 44px / actionMinHeight 36px as data',
    required: true,
  },
  {
    id: 'focus-composed',
    label: 'Focus styling consumes the composed ring token',
    description: 'One ring; offset and width from tokens',
    required: true,
  },
  {
    id: 'inventory-honest',
    label: 'Each family states its check status honestly',
    description: 'Encoded / validated / review-only — no wishful cells',
    required: false,
  },
];

content.assessmentPrompts = [
  {
    question:
      'Build the four-family inventory for a system you touch. Which cells are encoded, which validated, which review-only—and what is the cheapest next cell to promote?',
    type: 'application',
  },
  {
    question:
      'The focus ring composes the accent color at 0.5 opacity with a 2px offset. Argue for and against accent-colored focus versus a dedicated high-contrast focus color, citing what the composition buys and what it risks.',
    type: 'reflection',
  },
];

content.crossReferences = {
  concepts: [
    {
      slug: 'accessibility',
      title: 'Accessibility as System Infrastructure',
      description: 'The track landing this inventory serves',
      type: 'foundation',
    },
    {
      slug: 'color',
      title: 'Color Foundations',
      description: 'The ramp keying that makes common pairs correct',
      type: 'foundation',
    },
    {
      slug: 'spacing',
      title: 'Spacing & Sizing Foundations',
      description: 'The scale and floors the target family builds on',
      type: 'foundation',
    },
  ],
  components: [],
  glossary: ['01', '02', '25'],
};

export const metadata = generateFoundationMetadata(pageMetadata);

export default function FoundationsAccessibilityTokensPage() {
  return <FoundationPage content={content} />;
}
