/**
 * Foundation: Borders & Strokes
 * How tokenized widths, styles, and border color roles frame components
 * with consistency — and how the same tokens carry focus, warning, and
 * per-mode visibility contracts.
 */

import type {
  FoundationPageMetadata,
  FoundationSection,
} from '@/types/foundationContent';
import { generateFoundationMetadata } from '@/utils/metadata/foundationMetadata';
import { createFoundationContent } from '../_lib/contentBuilder';
import { FoundationPage } from '../_lib/pageWrapper';

const pageMetadata: FoundationPageMetadata = {
  title: 'Border & Stroke Foundations',
  description:
    'Frame and delineate with tokens: hairline and thick widths, three stroke styles, semantic border color roles with per-mode resolution, and the non-text contrast contract that keeps meaningful borders visible.',
  slug: 'borders',
  canonicalUrl: 'https://darianrosebrook.com/blueprints/foundations/borders',
  published_at: new Date().toISOString(),
  modified_at: new Date().toISOString(),
  image: 'https://darianrosebrook.com/darianrosebrook.jpg',
  keywords: 'borders, strokes, hairline, focus ring, contrast, WCAG 1.4.11',
  learning: {
    learning_level: 'foundation',
    role_relevance: ['design', 'engineering', 'a11y'],
    prerequisites: ['tokens'],
    next_units: ['radius', 'elevation'],
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
    expertise: ['Design Systems', 'Visual Design', 'Accessibility'],
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
          Borders are the quietest workhorse in the visual system. They
          delineate regions, signal interactivity, separate data, and carry
          focus—and because they are quiet, their drift is invisible until the
          interface feels made of parts that do not know each other: a 1px card
          beside a 2px input beside a borderless chip, each fine, together
          noise.
        </p>
        <p>
          Borders also carry one of the hardest accessibility contracts in the
          system. WCAG 1.4.11 requires <em>non-text contrast</em>: if a border
          is the only thing distinguishing a control or state, it must hit 3:1
          against its adjacent colors. A perfectly on-brand hairline that
          vanishes on tinted surfaces is not a style problem—it is a compliance
          defect, and it is per-mode: the pair that passes in light can fail in
          dark.
        </p>
        <p>
          This page covers the border system as built here: widths and styles in{' '}
          <code>shape.border</code>, semantic defaults in the control tokens,
          and the border color roles in the semantic color layer.
        </p>
      </>
    ),
  },
  {
    type: 'core-concepts',
    id: 'core-concepts',
    title: 'Core Concepts: Widths, Styles, Roles, Contrast',
    order: 4,
    content: (
      <>
        <h3>Two Widths, Three Styles</h3>
        <p>
          The core layer in <code>ui/designTokens/core/shape.tokens.json</code>{' '}
          keeps the vocabulary deliberately tiny:
        </p>
        <pre>
          <code>{`// shape.border (values)
width:  hairline: 1px    thick: 2px
style:  solid | dashed | dotted`}</code>
        </pre>
        <p>
          Two widths because borders have exactly two jobs: separate (
          <code>hairline</code>) and emphasize (<code>thick</code>). The moment
          a system adds a 1.5px &quot;just between&quot; width, every border
          becomes a negotiation. Three styles because each is semantic:{' '}
          <code>solid</code> is structure, <code>dashed</code> is impermanence
          (placeholders, drag targets, unsaved state), <code>dotted</code> is
          abbreviation (truncation hints, abstracted content). A dashed input
          border is not a style choice; it is a sentence about that input.
        </p>

        <h3>Semantic Defaults and the Focus Width</h3>
        <p>
          The semantic control layer composes the core pieces into the contract
          components actually consume:
        </p>
        <pre>
          <code>{`// ui/designTokens/semantic/shape.tokens.json (excerpt)
"control": {
  "border": {
    "defaultWidth": { "$value": "{shape.border.width.hairline}" },
    "defaultStyle": { "$value": "{shape.border.style.solid}" },
    "focusWidth":   { "$value": "{shape.border.width.thick}" }
  }
}`}</code>
        </pre>
        <p>
          Note the pairing rule hiding in <code>focusWidth</code>: focus
          emphasis is a <em>width step</em>, not a color invention—the focus
          ring is the same border machinery at <code>thick</code> (2px) in the
          focus color role. Components that invent a 3px focus border have
          forked the emphasis scale for everyone else.
        </p>

        <h3>Border Colors Are Semantic Roles</h3>
        <p>
          Border <em>color</em> lives in the semantic color layer with its own
          role ladder, resolved per mode like every color role:
        </p>
        <pre>
          <code>{`// ui/designTokens/semantic/color.tokens.json (excerpt)
"border": {
  "default": { light: neutral.300, dark: neutral.600 },
  "subtle":  { light: neutral.200, dark: neutral.700 },
  "bold":    { light: neutral.400, dark: neutral.500 }
}`}</code>
        </pre>
        <p>
          The inversion is the dark-mode lesson from the color foundation
          applied to lines: on light surfaces the default border is the{' '}
          <em>lighter</em> step (300) and on dark surfaces the{' '}
          <em>darker-numbered</em> neutral (600, which is lighter in
          value—naming follows the ramp, visibility follows the mode). Three
          roles cover the real range: <code>subtle</code> for internal divisions
          that must recede, <code>default</code> for component edges,{' '}
          <code>bold</code> for emphasis and active structure. Feedback borders
          (warning, error) come from the <code>feedback</code> color group—the
          same ramp-position discipline as their text and background siblings.
        </p>

        <h3>The 3:1 Non-Text Contrast Contract</h3>
        <p>
          When a border is the only visual signal of a boundary, state, or
          component edge, WCAG 1.4.11 requires 3:1 against the colors on both
          sides. Two practical consequences: a <code>border.subtle</code> role
          used to delineate an interactive control is probably a defect—subtle
          exists for divisions that carry no information; and every
          border-as-signal pair is a <em>per-mode</em> claim, the same as text
          contrast. The validator discipline from the color foundation extends
          directly: enumerate the pairs, check both modes, fail loudly.
        </p>

        <h3>Borders vs the Alternatives</h3>
        <ul>
          <li>
            <strong>Border vs elevation:</strong> a shadow says
            &quot;above&quot;; a border says &quot;edge.&quot; Cards that need
            separation but not height want a border or a surface step, not a
            whisper shadow.
          </li>
          <li>
            <strong>Border vs surface steps:</strong> dark modes favor
            surface-color steps over lines—the color system&apos;s{' '}
            <code>background.secondary</code> separates without any stroke at
            all.
          </li>
          <li>
            <strong>Border vs spacing:</strong> when a gap can separate as well
            as a line, prefer the gap—whitespace separates without adding visual
            weight.
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'system-roles',
    id: 'system-roles',
    title: 'System Roles: Where Border Decisions Land',
    order: 5,
    content: (
      <>
        <h3>Design Impact</h3>
        <p>
          Designers own the semantics of the line: which edges exist, which role
          each carries, and where whitespace replaces stroke entirely. The
          comp-review question is &quot;which border role is this?&quot;—an
          unnamed line is an unspecifiable one.
        </p>
        <h3>Engineering Impact</h3>
        <p>
          Engineers own consumption hygiene: widths and styles through the
          semantic control contract, colors through border roles, and the focus
          pairing (thick width + focus color) not forked per component.
        </p>
        <h3>Accessibility Impact</h3>
        <p>
          Accessibility owns the 3:1 ledger: the enumerated list of
          border-as-signal pairs, checked per mode, with <code>subtle</code>{' '}
          banned from carrying meaning alone. The ledger is boring and is the
          difference between auditable and hoped-for.
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
          In the design tool, the border system appears as three stroke styles
          (the vocabulary) and the role ladder as named colors: designs specify
          lines by role, never by raw swatch. The two-width discipline reads as
          a library constraint—strokes snap to 1 or 2—and the dashed/dotted
          semantics appear in the component specs that use them (placeholder
          fields, drop zones) rather than as free stylistic choice.
        </p>
        <p>
          The dark-mode comp obligation from elevation applies here too:
          bordered components are drawn in both modes, because border visibility
          inverts across the modes and the fix is a role remap, not a local
          tweak.
        </p>
      </>
    ),
    codeContent: (
      <>
        <p>
          In code, the contract is three custom properties and the focus
          pairing:
        </p>
        <pre>
          <code>{`/* Generated: app/designTokens.scss */
@layer core {
  :root {
    --core-shape-border-width-hairline: 1px;
    --core-shape-border-width-thick: 2px;
  }
}

/* Component consumption: role, width, style — all semantic */
[data-ds-component='TextField'] {
  --ds-text-field-border-width:
    var(--semantic-control-border-default-width, 1px);
  --ds-text-field-border-color:
    var(--semantic-color-border-default, #aeaeae);
}

.textField {
  border: var(--ds-text-field-border-width)
          solid
          var(--ds-text-field-border-color);
}

/* Focus = the same machinery, one width step up, focus color */
.textField:focus-visible {
  border-width: var(--semantic-control-border-focus-width, 2px);
  border-color: var(--semantic-color-border-focus);
  outline: none; /* the border IS the indicator */
}

/* Semantic styles carry meaning, not decoration */
.dropzone { border-style: var(--core-shape-border-style-dashed); }`}</code>
        </pre>
      </>
    ),
  },
  {
    type: 'applied-example',
    id: 'applied-example',
    title: 'Applied Example: A Form Section, Framed Correctly',
    order: 7,
    content: (
      <>
        <p>
          Frame a form section—two inputs and a drop zone—using the whole border
          stack:
        </p>
        <ol>
          <li>
            <strong>Region edge:</strong> the section groups related inputs, so
            it is separated from its siblings by whitespace (
            <code>spacing.size.07</code>) and a <code>border.subtle</code>{' '}
            internal rule—division without emphasis.
          </li>
          <li>
            <strong>Input edges:</strong> each input is interactive, so its
            boundary is signal: <code>border.default</code> color at{' '}
            <code>defaultWidth</code> (hairline)—which passes 3:1 in both modes
            per the ledger.
          </li>
          <li>
            <strong>Focus:</strong> on focus, the same border steps to{' '}
            <code>focusWidth</code> (thick, 2px) in the focus color—the emphasis
            scale, not a new style. Keyboard users see the same indicator as
            pointer users&apos; hover, one step stronger.
          </li>
          <li>
            <strong>Drop zone:</strong> dashed hairline—the style says
            &quot;provisional target&quot;—in <code>border.default</code>, with
            the drag-over state switching to <code>border.bold</code> plus the
            feedback accent, still no new widths.
          </li>
          <li>
            <strong>Per-mode proof:</strong> dark mode shows the same section
            with its inverted role resolution; the 3:1 ledger entries for input
            edges and drop zone are re-checked, not assumed.
          </li>
        </ol>
        <p>
          One vocabulary, three semantics, zero new values. The form looks
          framed rather than boxed because every line that exists, exists for a
          stated reason.
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
            <strong>Two widths vs gradient of emphasis:</strong> a locked
            hairline/thick pair forces emphasis to be binary; systems that need
            finer gradation usually need the color role ladder (
            <code>subtle/default/bold</code>), not more widths.
          </li>
          <li>
            <strong>Subtle borders vs pure whitespace:</strong>{' '}
            <code>border.subtle</code> costs paint and visual texture where a
            spacing gap often separates as well; the system bias is
            whitespace-first, lines when structure must be explicit.
          </li>
          <li>
            <strong>Border indicators vs outlines:</strong> using the border as
            the focus indicator couples structure to state (a bordered component
            changes size by 1px on focus unless widths are swapped, not added);
            outline-based indicators avoid that but need their own radius
            pairing. Both are legitimate—the system requires picking one per
            component class and staying consistent.
          </li>
          <li>
            <strong>3:1 floor vs brand hairlines:</strong> brand palettes
            sometimes mandate a barely-visible edge; the contract wins where the
            border carries meaning, and the brand adjust where it is decoration.
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'border-pitfalls',
    title: 'Common Pitfalls & Failure Modes',
    order: 8.5,
    content: (
      <>
        <h3>1. Invented widths</h3>
        <pre>
          <code>{`/* Bad: A third width nobody approved */
.card { border: 1.5px solid #ddd; }
/* Good: The emphasis scale */
.card { border: var(--semantic-control-border-default-width) solid
              var(--semantic-color-border-default); }`}</code>
        </pre>
        <h3>2. Meaning carried by subtle borders</h3>
        <pre>
          <code>{`/* Bad — An interactive control delineated below the 3:1 floor */
.chip { border: 1px solid var(--semantic-color-border-subtle); }
/* Good: Signal borders use the default role or bolder */`}</code>
        </pre>
        <h3>3. Style as decoration</h3>
        <pre>
          <code>{`/* Bad: Dashed because it looked nice */
.panel { border-style: dashed; }
/* Good: Dashed means something — provisional, droppable, placeholder */`}</code>
        </pre>
        <h3>4. Light-mode-only border checks</h3>
        <p>
          The pair that passes 3:1 on white routinely fails on the dark surface
          it also ships on. The ledger is per-mode or it is not a ledger.
        </p>
        <h3>5. Border-color literals</h3>
        <pre>
          <code>{`/* Bad */
.divider { border-top: 1px solid #e5e5e5; }
/* Good */
.divider { border-top: var(--semantic-control-border-default-width)
           solid var(--semantic-color-border-subtle); }`}</code>
        </pre>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'borders-health-metrics',
    title: 'Border System Health Metrics',
    order: 8.75,
    content: (
      <>
        <h3>Signal 1: Vocabulary exclusivity</h3>
        <ul>
          <li>
            <strong>Healthy:</strong> every border resolves through the semantic
            width/style/color contracts; a grep for <code>border:</code>{' '}
            literals in product CSS returns only fallbacks.
          </li>
          <li>
            <strong>Warning:</strong> a 1.5px survivor—the &quot;between&quot;
            width—circulates in one area, negotiating against the two-width
            discipline.
          </li>
          <li>
            <strong>Critical:</strong> arbitrary widths and hex borders are
            common; emphasis no longer has a scale and mode resolution is luck.
          </li>
        </ul>

        <h3>Signal 2: Contrast ledger completeness</h3>
        <ul>
          <li>
            <strong>Healthy:</strong> every border-as-signal pair appears in the
            3:1 ledger, checked per mode;
            <code>subtle</code> appears only for divisions.
          </li>
          <li>
            <strong>Warning:</strong> the ledger covers light mode; dark-mode
            entries are &quot;assumed from the role mapping&quot;—assumed is the
            warning word.
          </li>
          <li>
            <strong>Critical:</strong> a signal border below 3:1 in any mode—an
            invisible boundary shipping as a visible one.
          </li>
        </ul>

        <h3>Signal 3: Style semantics</h3>
        <ul>
          <li>
            <strong>Healthy:</strong> dashed appears exactly where things are
            provisional (drop zones, placeholders); dotted where abbreviated.
          </li>
          <li>
            <strong>Warning:</strong> one decorative dashed panel—style drifting
            from meaning, and the next contributor cannot read the convention
            from the code.
          </li>
          <li>
            <strong>Critical:</strong> styles are aesthetic choices; the
            semantics are gone and the vocabulary no longer says anything.
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'borders-migration',
    title: 'Migration Strategy: Collecting the Lines',
    order: 8.9,
    content: (
      <>
        <ol>
          <li>
            <strong>Inventory the borders:</strong> every width, style, and
            color literal with its surface. Dedupe; most products find dozens of
            literal lines serving three roles.
          </li>
          <li>
            <strong>Snap to the vocabulary:</strong> widths to hairline/thick,
            styles to their semantics, colors to the role
            ladder—nearest-tolerance snapping with literals surviving as scoped
            fallbacks.
          </li>
          <li>
            <strong>Reclassify the boundaries:</strong> each line answers
            &quot;edge, division, or decoration?&quot;—whitespace replaces
            decoration, <code>subtle</code> takes divisions,{' '}
            <code>default</code>+ takes edges that carry meaning.
          </li>
          <li>
            <strong>Complete the ledger:</strong> every signal-bearing border
            enters the per-mode 3:1 check; the audit that follows is the point.
          </li>
        </ol>
      </>
    ),
  },
  {
    type: 'applied-example',
    id: 'borders-case-studies',
    title: 'Real-World Case Studies',
    order: 8.98,
    content: (
      <>
        <h3>Case 1: The invisible input in dark mode</h3>
        <p>
          A tinted input edge cleared 3:1 on white and vanished on the dark
          surface—users tapped guesswork. The ledger entry (input edge, both
          modes) failed exactly where assumption had lived; the role remap to{' '}
          <code>default</code> restored legibility with one reference.
        </p>
        <h3>Case 2: The 1.5px compromise</h3>
        <p>
          A designer wanted &quot;bolder than 1, subtler than 2&quot; and
          shipped 1.5px on one component. Within a month three more surfaces
          negotiated their own widths. The rollback to the emphasis scale—thick
          width, <code>bold</code> color role—restored the binary that review
          could actually police.
        </p>
        <h3>Case 3: The dashed everything</h3>
        <p>
          A prototype&apos;s drop-zone styling leaked into production panels
          because it &quot;looked technical.&quot; The style-semantics audit
          traced dashed to its three legitimate homes and reverted the rest—the
          vocabulary saying what it means again.
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
            <strong>Color Foundations</strong> — the role ladder and per-mode
            resolution border colors live in (
            <code>/blueprints/foundations/color</code>)
          </li>
          <li>
            <strong>Radius &amp; Shape</strong> — the corners these strokes wrap
            (<code>/blueprints/foundations/radius</code>)
          </li>
          <li>
            <strong>WCAG 1.4.11 non-text contrast</strong> — the 3:1 contract
            for meaningful borders (
            <code>
              https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html
            </code>
            )
          </li>
          <li>
            <strong>The sources</strong> —{' '}
            <code>ui/designTokens/core/shape.tokens.json</code>,{' '}
            <code>ui/designTokens/semantic/shape.tokens.json</code>,{' '}
            <code>ui/designTokens/semantic/color.tokens.json</code>
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
    id: 'two-widths',
    label: 'Border widths use only hairline and thick',
    description: 'Emphasis is binary; gradation comes from color roles',
    required: true,
  },
  {
    id: 'roles-not-literals',
    label: 'Border colors come from semantic border roles',
    description: 'No hex literals; per-mode resolution included',
    required: true,
  },
  {
    id: 'contrast-ledger',
    label: 'Border-as-signal pairs meet 3:1 in every mode',
    description: 'WCAG 1.4.11; subtle never carries meaning alone',
    required: true,
  },
  {
    id: 'style-semantics',
    label: 'Dashed and dotted borders carry their meanings',
    description: 'Provisional/droppable/truncated — not decoration',
    required: false,
  },
];

content.assessmentPrompts = [
  {
    question:
      'Write the 3:1 ledger for a search interface: list every border that carries meaning, its adjacent colors per mode, and which role each should use. Which entries are at risk?',
    type: 'application',
  },
  {
    question:
      'A teammate replaced a focus border with a box-shadow "because the 1px jump looked janky." What contract did the shadow break, and what are the two system-legal repairs?',
    type: 'reflection',
  },
];

content.crossReferences = {
  concepts: [
    {
      slug: 'color',
      title: 'Color Foundations',
      description: 'The semantic role ladder border colors resolve through',
      type: 'foundation',
    },
    {
      slug: 'radius',
      title: 'Radius & Shape',
      description: 'The corner scale these strokes wrap',
      type: 'foundation',
    },
    {
      slug: 'elevation',
      title: 'Elevation & Shadows',
      description: 'When to separate with height instead of a line',
      type: 'foundation',
    },
  ],
  components: [],
  glossary: ['01', '02', '42'],
};

export const metadata = generateFoundationMetadata(pageMetadata);

export default function BordersPage() {
  return <FoundationPage content={content} />;
}
