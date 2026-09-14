/**
 * Foundation: Icons
 * How a tokenized icon system — one size scale, one stroke weight, and a
 * strict labeling contract — keeps a visual language recognizable and
 * its accessibility honest.
 */

import type {
  FoundationPageMetadata,
  FoundationSection,
} from '@/types/foundationContent';
import { generateFoundationMetadata } from '@/utils/metadata/foundationMetadata';
import { createFoundationContent } from '../_lib/contentBuilder';
import { FoundationPage } from '../_lib/pageWrapper';

const pageMetadata: FoundationPageMetadata = {
  title: 'Icon Foundations',
  description:
    'Systematize iconography: a four-step size scale aligned to the spacing rhythm, a single stroke weight, optical alignment, and the labeling contract that separates meaningful icons from decorative ones for assistive technology.',
  slug: 'icons',
  canonicalUrl: 'https://darianrosebrook.com/blueprints/foundations/icons',
  published_at: new Date().toISOString(),
  modified_at: new Date().toISOString(),
  image: 'https://darianrosebrook.com/darianrosebrook.jpg',
  keywords: 'icons, iconography, sizing, stroke, ARIA labels, accessibility',
  learning: {
    learning_level: 'foundation',
    role_relevance: ['design', 'engineering', 'a11y'],
    prerequisites: ['tokens'],
    next_units: ['elevation', 'radius'],
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
    expertise: ['Design Systems', 'Iconography', 'Accessibility'],
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
          Icons are the highest-frequency visual element in any interface and
          the fastest to decay. One designer ships 18px icons, another 20, a
          third 24—and within a quarter every screen uses all three. None of
          them is wrong; the <em>inconsistency</em> is wrong, because users read
          icon size, weight, and alignment as systematic signals whether
          designers intend it or not.
        </p>
        <p>
          Iconography also has an accessibility obligation that is routinely
          botched: an icon is either <em>meaningful</em>—it communicates
          something no adjacent text carries, and must be labeled for assistive
          technology—or <em>decorative</em>, and must be hidden from it. The
          failure modes are silent either way: unlabeled meaningful icons vanish
          for screen reader users; labeled decorative icons announce noise,
          reading a star glyph aloud next to the word Favorite.
        </p>
        <p>
          This page covers the icon system as built here: the{' '}
          <code>icon.size</code> scale and <code>icon.strokeWidth</code> in the
          core tokens, and the labeling contract implemented by the Icon
          component in <code>ui/components/Icon</code>.
        </p>
      </>
    ),
  },
  {
    type: 'core-concepts',
    id: 'core-concepts',
    title: 'Core Concepts: Scale, Stroke, Alignment, Meaning',
    order: 4,
    content: (
      <>
        <h3>Four Sizes, No Exceptions</h3>
        <p>
          The core scale in <code>ui/designTokens/core/icon.tokens.json</code>{' '}
          is four steps:
        </p>
        <pre>
          <code>{`// icon.size (values)
sm: 16px   md: 20px   lg: 24px   xl: 32px`}</code>
        </pre>
        <p>
          Four is enough and four is the point: <code>sm</code> is inline with
          body text, <code>md</code> the default for buttons and controls (the
          Icon component&apos;s 20px default), <code>lg</code> for navigation
          and list affordances, <code>xl</code> for feature moments. The values
          align with the spacing scale&apos;s neighbors (16, 24, 32 are{' '}
          <code>spacing.size.06/07/08</code>), which is why icons sit correctly
          in padded containers without bespoke alignment CSS.
        </p>

        <h3>One Stroke Weight</h3>
        <p>
          <code>icon.strokeWidth.default</code> is <strong>1.5px</strong>, and
          the word <em>default</em> in that name is doing honest work: it is the
          weight every custom-drawn icon ships at. Stroke consistency is what
          makes icons from different sources read as one family—two icons at the
          same size but different weights look like different typefaces. When an
          icon needs to feel bolder, the system answer is a filled variant or a
          heavier glyph from the set, not a locally bumped stroke.
        </p>

        <h3>Optical Alignment Beats Mathematical Alignment</h3>
        <p>
          Icons are drawn against their viewBox, but shapes read by their visual
          mass. A circle and a square at the same 20px box do not look the same
          size—the circle needs to overshoot slightly. The system&apos;s
          convention: icons are drawn on a consistent grid with a small safe
          area (roughly 10% padding inside the viewBox), and container alignment
          uses the box, not the ink. The payoff is that{' '}
          <code>align-items: center</code> just works across the whole set.
        </p>

        <h3>Meaningful or Decorative—Never Both</h3>
        <p>
          The accessibility contract is binary, and this repository&apos;s Icon
          component implements it directly:
        </p>
        <pre>
          <code>{`// ui/components/Icon/Icon.tsx (behavior)
const hasLabel = typeof label === 'string' && label.length > 0;

<span
  role={hasLabel ? 'img' : undefined}
  aria-label={hasLabel ? label : undefined}
  aria-hidden={hasLabel ? undefined : true}
>
  <svg aria-hidden="true" focusable="false">…</svg>
</span>`}</code>
        </pre>
        <p>
          Pass <code>label</code> and the icon becomes{' '}
          <code>role=&quot;img&quot;</code> with an accessible name—use this
          when the icon is the only carrier of meaning, like a stand-alone close
          button. Omit it and the icon is <code>aria-hidden</code>—correct for
          icons beside text that already says the thing. The important design of
          this API is that <strong>decorative is the default</strong>: in a
          well-composed interface most icons sit next to labels, and the safe
          default is silence.
        </p>
      </>
    ),
  },
  {
    type: 'system-roles',
    id: 'system-roles',
    title: 'System Roles: Where Icon Decisions Land',
    order: 5,
    content: (
      <>
        <h3>Design Impact</h3>
        <p>
          Designers own the glyph vocabulary—what concepts get icons, which
          style (this system uses a solid set via the FontAwesome kit plus
          custom SVG sprites), and the grid conventions that keep optical
          alignment. The review discipline is the same as color&apos;s: an icon
          in a comp must be able to name its size step and its meaning status.
        </p>
        <h3>Engineering Impact</h3>
        <p>
          Engineers own the contract: one Icon component, sizes passed from the
          scale, never a raw <code>&lt;svg&gt;</code> inline in product code
          where the labeling logic can be bypassed. The component keeps the
          rules in one place—hydration quirks, currentColor inheritance, and the
          ARIA branch included.
        </p>
        <h3>Accessibility Impact</h3>
        <p>
          Accessibility owns the naming quality: a label is a name
          (&quot;Close&quot;), not a description (&quot;gray x icon top
          right&quot;). Screen reader output is the review surface— hearing
          &quot;star, Favorite&quot; is a bug in the decorative direction;
          hearing nothing on a label-only icon button is a bug in the meaningful
          direction.
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
          In the design tool, the icon system appears as four named component
          sizes with the same names as the tokens, drawn on a shared grid with
          the 1.5px stroke as a library-wide style. The meaning-status decision
          shows up in the comp itself: a text-plus-icon pair is drawn knowing
          the icon will render decorative; a solo icon button is annotated with
          its accessible name, because in code that name is a required prop the
          designer is the only one qualified to write.
        </p>
        <p>
          That last point is the quiet win of treating labeling as design data:
          the accessible name never gets invented by whoever implements the
          ticket.
        </p>
      </>
    ),
    codeContent: (
      <>
        <p>
          In code, sizes flow from the scale into the one Icon component, and
          the ARIA contract is structural rather than per-usage:
        </p>
        <pre>
          <code>{`/* Meaningful: the icon IS the affordance */
<Icon icon={faXmark} label="Close" width={20} height={20} />
// → <span role="img" aria-label="Close">

/* Decorative: text carries the meaning */
<button>
  <Icon icon={faStar} width={16} height={16} />
  Favorite
</button>
// → <span aria-hidden="true"> + readable "Favorite" button`}</code>
        </pre>
        <p>
          Sizing from the scale in CSS-consuming contexts reads the emitted
          custom properties:
        </p>
        <pre>
          <code>{`.inlineIcon {
  width: var(--core-icon-size-sm, 16px);
  height: var(--core-icon-size-sm, 16px);
}

/* Icon color always inherits — currentColor, never a fill token */
.inlineIcon svg { fill: currentColor; }`}</code>
        </pre>
        <p>
          Note what is <em>not</em> in the icon tokens: color. Icons inherit{' '}
          <code>currentColor</code> so they follow the text semantic of their
          context—an icon in a destructive button is destructive-colored by
          construction, and dark mode needs no icon-specific work at all.
        </p>
      </>
    ),
  },
  {
    type: 'applied-example',
    id: 'applied-example',
    title: 'Applied Example: An Icon-Only Toolbar',
    order: 7,
    content: (
      <>
        <p>
          Ship the highest-risk icon pattern correctly: a toolbar of icon-only
          buttons, where every icon is meaningful by definition.
        </p>
        <ol>
          <li>
            <strong>Size from context:</strong> toolbar buttons are controls;{' '}
            <code>icon.size.md</code> (20px) inside a{' '}
            <code>control.size.sm</code> (24px) height, with the hit area
            extended to the 44px floor.
          </li>
          <li>
            <strong>Name every one:</strong> each Icon gets a <code>label</code>
            —&quot;Bold&quot;, &quot;Italic&quot;, &quot;Insert link&quot;.
            These names are also the <code>aria-label</code> of the button, and
            the tooltip copy is the same string: one name, three surfaces.
          </li>
          <li>
            <strong>State, not glyph-swapping:</strong> disabled and active
            states change color token and opacity, not the icon file—weight and
            shape stay constant so the toolbar reads as one system.
          </li>
          <li>
            <strong>Verify by ear:</strong> the acceptance test is a screen
            reader pass: the toolbar announces five buttons with five names and
            zero surprises. Visual review cannot catch this category of defect.
          </li>
        </ol>
        <p>
          The pattern generalizes: wherever an icon stands alone, the label is
          mandatory and the review is auditory; wherever an icon accompanies
          text, silence is mandatory and the review is visual.
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
            <strong>Four sizes vs free resizing:</strong> a locked scale removes
            18px and 28px, which will be requested. The answer is either a real
            usage gap (add a step with review) or drift (refuse)—and the
            scale&apos;s alignment with spacing steps is the tiebreaker.
          </li>
          <li>
            <strong>One stroke weight vs per-icon drama:</strong> marketing
            moments want heavier marks; product UI needs uniformity. The split
            here is set-based: product icons obey strokeWidth 1.5, brand marks
            are their own asset class outside the icon system.
          </li>
          <li>
            <strong>currentColor vs colored icons:</strong> inheriting color
            makes icons automatically theme-correct but cannot express
            multi-tone marks. Multi-tone needs fall to dedicated illustrations,
            not the icon set.
          </li>
          <li>
            <strong>Decorative default vs explicit-everything:</strong>{' '}
            defaulting to aria-hidden is safe for the common case and risks
            silence when someone builds a meaningful icon without a label. The
            mitigation is review discipline on icon-only patterns, where the
            rule inverts: label required.
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'icon-pitfalls',
    title: 'Common Pitfalls & Failure Modes',
    order: 8.5,
    content: (
      <>
        <h3>1. Arbitrary pixel sizes</h3>
        <pre>
          <code>{`/* ❌ */
<Icon icon={faStar} width={18} height={18} />
/* ✅ */
<Icon icon={faStar} width={20} height={20} /> /* icon.size.md */`}</code>
        </pre>
        <h3>2. Labeling decorative icons</h3>
        <pre>
          <code>{`/* ❌ Noise: announced twice */
<button><Icon icon={faStar} label="Favorite" /> Favorite</button>
/* ✅ */
<button><Icon icon={faStar} /> Favorite</button>`}</code>
        </pre>
        <h3>3. Unlabeled meaningful icons</h3>
        <pre>
          <code>{`/* ❌ A button with no accessible name */
<button><Icon icon={faXmark} /></button>
/* ✅ */
<button><Icon icon={faXmark} label="Close" /></button>`}</code>
        </pre>
        <h3>4. Bypassing the component</h3>
        <pre>
          <code>{`/* ❌ Raw SVG skips the ARIA contract and hydration care */
<svg width="20"><path d="…" /></svg>
/* ✅ One component owns the rules */
<Icon icon={faCheck} width={20} height={20} />`}</code>
        </pre>
        <h3>5. Fixing alignment with margins</h3>
        <pre>
          <code>{`/* ❌ Per-instance optical correction */
.icon { margin-top: -2px; }
/* ✅ Fix the glyph grid once; alignment comes free */`}</code>
        </pre>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'icons-health-metrics',
    title: 'Icon System Health Metrics',
    order: 8.75,
    content: (
      <>
        <h3>Signal 1: Size discipline</h3>
        <ul>
          <li>
            <strong>Healthy:</strong> icon width/height props carry only the
            four scale steps (16/20/24/32); a grep for other numbers in icon
            sizing returns nothing.
          </li>
          <li>
            <strong>Warning:</strong> a fifth size circulates in one area—the
            18px that &quot;looked better next to 16px text&quot;—and every
            future icon decision in that area now negotiates against it.
          </li>
          <li>
            <strong>Critical:</strong> arbitrary sizes are the norm; the scale
            is decorative, and cross-screen consistency is gone.
          </li>
        </ul>

        <h3>Signal 2: Labeling integrity</h3>
        <ul>
          <li>
            <strong>Healthy:</strong> every icon-only control passes a label;
            every text-adjacent icon omits one—the binary is applied, not
            assumed.
          </li>
          <li>
            <strong>Warning:</strong> label audits pass on new components but
            legacy screens ship unlabeled icon-only buttons that everyone has
            stopped seeing.
          </li>
          <li>
            <strong>Critical:</strong> icon-only controls without accessible
            names—silent for screen readers, and a WCAG 4.1.2 defect with every
            click.
          </li>
        </ul>

        <h3>Signal 3: Component fidelity</h3>
        <ul>
          <li>
            <strong>Healthy:</strong> product code renders icons only through
            the Icon component; raw <code>&lt;svg&gt;</code> appears in the
            component itself and nowhere downstream.
          </li>
          <li>
            <strong>Warning:</strong> a few inline SVGs bypass the ARIA
            branch—each one a place the labeling contract no longer applies.
          </li>
          <li>
            <strong>Critical:</strong> bypasses outnumber component usage; the
            contract is folklore now.
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'icons-migration',
    title: 'Migration Strategy: Wrangling an Icon Zoo',
    order: 8.9,
    content: (
      <>
        <ol>
          <li>
            <strong>Inventory the glyphs:</strong> every icon source (kit
            lookups, inline paths, sprite references), every size, every usage
            site. The dedupe is the payoff—most zoos run 3–4× duplicate concepts
            (&quot;close&quot; vs &quot;x&quot; vs &quot;dismiss&quot;).
          </li>
          <li>
            <strong>Pick the canonical set:</strong> one glyph per concept,
            chosen on grid fit and stroke consistency; the losers map to the
            winners in a codemod table.
          </li>
          <li>
            <strong>Snap sizes to the scale</strong> (16/20/24/32) with the
            nearest-step tolerance—18px to 20 is +11%, inside the JND; nobody
            will notice, which is the point.
          </li>
          <li>
            <strong>Route through the component:</strong> replace inline SVGs
            with <code>&lt;Icon&gt;</code> usages, labeling each by its new
            context&apos;s meaningful/decorative status—never migrating labels
            blindly.
          </li>
          <li>
            <strong>Retire the zoo:</strong> delete unmapped glyphs; an icon
            nobody migrated to was decoration wearing a name.
          </li>
        </ol>
      </>
    ),
  },
  {
    type: 'applied-example',
    id: 'icons-case-studies',
    title: 'Real-World Case Studies',
    order: 8.98,
    content: (
      <>
        <h3>Case 1: The toolbar that failed by ear</h3>
        <p>
          Five icon-only buttons passed visual review; the VoiceOver pass
          announced &quot;button… button… button…&quot;—the labels were never
          passed because the API made silence the default and nobody was
          listening. The fix was labels for all five; the prevention was the
          review rule: icon-only patterns are verified auditorily, always.
        </p>
        <h3>Case 2: The three closes</h3>
        <p>
          An audit found three distinct close glyphs (x, chevron, outline-x) at
          three sizes (18, 20, 22) across the product. The canonical-set
          migration collapsed them to one glyph at two sizes; the codemod table
          lives in the icon documentation so the fourth close never gets drawn.
        </p>
        <h3>Case 3: The icon that inherited color</h3>
        <p>
          A status icon was given its own fill token for a campaign—then broke
          in dark mode, then in the teal brand, then again inside a destructive
          button. Removing the fill and returning to <code>currentColor</code>{' '}
          made it correct everywhere at once: the context&apos;s semantics were
          always the right answer.
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
            <strong>Elevation &amp; Shadows</strong> — the other
            decorative-language system (
            <code>/blueprints/foundations/elevation</code>)
          </li>
          <li>
            <strong>Radius &amp; Shape</strong> — shape as personality (
            <code>/blueprints/foundations/radius</code>)
          </li>
          <li>
            <strong>WCAG 1.1.1 non-text content</strong> — the normative basis
            for icon labeling (
            <code>
              https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html
            </code>
            )
          </li>
          <li>
            <strong>The sources</strong> —{' '}
            <code>ui/designTokens/core/icon.tokens.json</code>,{' '}
            <code>ui/components/Icon/Icon.tsx</code> and its{' '}
            <code>Icon.contract.json</code>
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
    id: 'scale-sized',
    label: 'Icons use the four size steps only',
    description: 'sm 16 / md 20 / lg 24 / xl 32, aligned to spacing',
    required: true,
  },
  {
    id: 'one-component',
    label: 'All icons render through the Icon component',
    description: 'No raw inline SVG in product code',
    required: true,
  },
  {
    id: 'labeling-contract',
    label: 'Every icon is meaningfully labeled or hidden',
    description: 'Solo icons carry labels; paired icons stay decorative',
    required: true,
  },
  {
    id: 'current-color',
    label: 'Icon color inherits from text semantics',
    description: 'currentColor; no icon-specific color tokens',
    required: false,
  },
];

content.assessmentPrompts = [
  {
    question:
      'Audit any toolbar in a product you use: which icons are meaningful, which are decorative, and what does a screen reader actually announce for each? Write the corrected label list.',
    type: 'application',
  },
  {
    question:
      'A team requests an 18px icon size because 20 looks too big next to 16px text. What questions decide whether the scale is wrong or the composition is wrong?',
    type: 'reflection',
  },
  {
    question:
      'Run the labeling-integrity signal on one screen you own: list every icon, its meaningful/decorative status, and what a screen reader actually announces. Which entry surprised you?',
    type: 'reflection',
  },
];

content.crossReferences = {
  concepts: [
    {
      slug: 'tokens',
      title: 'Design Tokens',
      description: 'The architecture the icon size and stroke scales live in',
      type: 'foundation',
    },
    {
      slug: 'color',
      title: 'Color Foundations',
      description: 'Why icons inherit currentColor instead of owning colors',
      type: 'foundation',
    },
    {
      slug: 'spacing',
      title: 'Spacing & Sizing Foundations',
      description: 'The scale the icon steps align with for free alignment',
      type: 'foundation',
    },
  ],
  components: [],
  glossary: ['14', '42', '01'],
};

export const metadata = generateFoundationMetadata(pageMetadata);

export default function IconsPage() {
  return <FoundationPage content={content} />;
}
