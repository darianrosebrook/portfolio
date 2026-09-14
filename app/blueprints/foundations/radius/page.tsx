/**
 * Foundation: Radius & Shape
 * How a tokenized radius scale gives an interface its personality —
 * consistent corners that scale with size, semantic shape roles, and
 * the pill/regular distinction that keeps controls coherent.
 */

import type {
  FoundationPageMetadata,
  FoundationSection,
} from '@/types/foundationContent';
import { generateFoundationMetadata } from '@/utils/metadata/foundationMetadata';
import { createFoundationContent } from '../_lib/contentBuilder';
import { FoundationPage } from '../_lib/pageWrapper';

const pageMetadata: FoundationPageMetadata = {
  title: 'Radius & Shape Foundations',
  description:
    'Give your interface a consistent visual personality: a stepped radius scale, semantic shape roles for surfaces and controls, the pill-vs-regular contract, and how shape interacts with density, focus, and brand identity.',
  slug: 'radius',
  canonicalUrl: 'https://darianrosebrook.com/blueprints/foundations/radius',
  published_at: new Date().toISOString(),
  modified_at: new Date().toISOString(),
  image: 'https://darianrosebrook.com/darianrosebrook.jpg',
  keywords: 'border radius, shape tokens, corners, pill, visual identity',
  learning: {
    learning_level: 'foundation',
    role_relevance: ['design', 'engineering'],
    prerequisites: ['tokens'],
    next_units: ['borders', 'grid'],
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
    expertise: ['Design Systems', 'Visual Design', 'Tokens'],
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
          Shape is the foundation users perceive fastest and describe
          worst. Nobody articulates &quot;the corner radii are
          inconsistent&quot;; they say the product feels off, or cheap,
          or like two teams built it. A 4px input inside a 12px card on
          an 8px modal is exactly that—three shape languages in one
          screen, each defensible, together incoherent.
        </p>
        <p>
          Radius is also brand infrastructure. Sharp corners read
          technical and serious; generous curves read friendly and
          consumer. When shape lives in tokens, that personality dial is
          a mapping change—swap the semantic roles onto different scale
          steps and the whole product moves together. When shape lives
          in per-component CSS, rebranding means archaeology.
        </p>
        <p>
          This page covers the radius system as built here: the{' '}
          <code>shape.radius</code> scale in the core tokens, the
          semantic shape roles above it, and the control-level pill
          contract.
        </p>
      </>
    ),
  },
  {
    type: 'core-concepts',
    id: 'core-concepts',
    title: 'Core Concepts: The Scale, the Roles, the Contracts',
    order: 4,
    content: (
      <>
        <h3>An Eight-Step Scale with a Named Middle</h3>
        <p>
          The core scale in{' '}
          <code>ui/designTokens/core/shape.tokens.json</code>:
        </p>
        <pre>
          <code>{`// shape.radius (values)
none: 0px     01: 2px     02: 4px     medium: 6px
03: 8px       04: 16px    05: 32px    full: 9999px`}</code>
        </pre>
        <p>
          The climb is roughly doubling with intent: hairline (2) for
          chips and tags, control (4) for inputs and buttons, the named{' '}
          <code>medium</code> (6) as the workhorse control corner, up
          through 8 for cards and 16 for large surfaces, with{' '}
          <code>full</code> as the pill. Note that <code>medium</code>{' '}
          sits <em>between</em> 02 and 03 numerically—a named token
          inserted where the scale had a gap. It is a wart worth knowing:
          the scale&apos;s numbering is historical, the semantic names
          are the interface.
        </p>

        <h3>Semantic Roles Are the Interface</h3>
        <p>
          Consumers never touch the numbered steps. The semantic layer
          maps them to roles:
        </p>
        <pre>
          <code>{`// ui/designTokens/semantic/shape.tokens.json (excerpt)
"shape": {
  "radius": {
    "extraSmall": "{shape.radius.01}",   /* 2px  */
    "small":      "{shape.radius.02}",   /* 4px  */
    "default":    "{shape.radius.02}",   /* 4px  */
    "medium":     "{shape.radius.03}",   /* 8px  */
    "large":      "{shape.radius.04}",   /* 16px */
    "extraLarge": "{shape.radius.05}"    /* 32px */
  },
  "control": {
    "radius": {
      "default": "{shape.radius.medium}",  /* 6px */
      "pill":    "{shape.radius.full}"     /* 9999px */
    }
  }
}`}</code>
        </pre>
        <p>
          Read the two mappings as two different questions. Surface
          roles (<code>small</code>…<code>extraLarge</code>) answer
          &quot;how rounded is this container?&quot; and scale with the
          container—a badge takes <code>extraSmall</code>, a card takes{' '}
          <code>medium</code> or <code>large</code>. Control roles answer
          &quot;how rounded is this interactive element?&quot; and hold{' '}
          <em>constant</em> across sizes: every button is{' '}
          <code>control.radius.default</code> (6px) regardless of its
          width, which is why a row of differently-sized controls still
          reads as one family.
        </p>

        <h3>The Pill Contract</h3>
        <p>
          <code>full: 9999px</code> exists for one shape: the pill, where
          corner radius equals half the height. Expressed as a huge
          fixed value, it <em>always</em> equals half of any height up to
          ~20000px—the browser clamps. The contract is that pills are a
          deliberate variant (<code>control.radius.pill</code>) for
          filter chips, toggle tracks, and avatar frames—not a slider
          you tune. A 12px-radius button that &quot;looks sort of
          pill&quot; is drift; it is either 6 or it is a pill.
        </p>

        <h3>Shape Interacts With Everything</h3>
        <ul>
          <li>
            <strong>Focus rings:</strong> the focus outline follows the
            element&apos;s radius—the semantic{' '}
            <code>control.border.focusWidth</code> (the 2px{' '}
            <code>thick</code> width) pairs with the same corner value,
            so focused pills get pill-shaped rings for free.
          </li>
          <li>
            <strong>Elevation:</strong> shadows take the element&apos;s
            radius; a 16px card with an 8px shadow curve reads as
            mismatched weight.
          </li>
          <li>
            <strong>Density:</strong> tight-density layouts keep the same
            radii—shape is personality, not space, and rescaling it with
            density muddies both systems.
          </li>
          <li>
            <strong>Nesting:</strong> inner corners step{' '}
            <em>down</em> one role from their container (a 16px modal
            hosts 8px cards hosts 6px controls). Equal or ascending
            inner radii look like alignment errors.
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'system-roles',
    id: 'system-roles',
    title: 'System Roles: Where Shape Decisions Land',
    order: 5,
    content: (
      <>
        <h3>Design Impact</h3>
        <p>
          Designers own the personality dial—which semantic roles map to
          which steps—and the nesting ladder. The review question is{' '}
          &quot;which role is this corner?&quot; with the same discipline
          as color and spacing: a radius that cannot name its role is a
          radius the system cannot change.
        </p>
        <h3>Engineering Impact</h3>
        <p>
          Engineers own consumption hygiene: scoped component tokens
          resolving semantic roles (the Card contract ships{' '}
          <code>--ds-card-size-radius-medium</code> resolving a semantic
          shape value with a literal fallback), and the rule that radii
          never appear as literals in rules.
        </p>
        <h3>Brand Impact</h3>
        <p>
          Brand owns the extremes. A rebrand toward sharpness moves the
          semantic mapping down-scale in one file; toward softness, up.
          That is the entire cost of a shape rebrand when shape is
          tokenized—and a cross-codebase audit when it is not.
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
          In the design tool, shape tokens appear as corner-radius
          variables with the same role names, applied through component
          styles rather than per-frame tweaking. The comp-side contract
          that matters most: nested containers visibly step their radii
          down, and pills are drawn as true pills—not as
          approximately-round rectangles the implementer must guess
          about.
        </p>
        <p>
          Because radius is brand infrastructure, the design library
          keeps one shape mode per brand—same structure as the color
          brand layers—so previewing a softer brand is a mode switch,
          not a re-draw.
        </p>
      </>
    ),
    codeContent: (
      <>
        <p>
          In code, semantic roles emit as custom properties and
          components bind them through scoped contracts:
        </p>
        <pre>
          <code>{`/* Generated + component contract */
@layer core {
  :root {
    --core-shape-radius-04: 16px;
    --core-shape-radius-full: 9999px;
  }
}

[data-ds-component='Card'] {
  --ds-card-size-radius-medium:
    var(--semantic-shape-radius-large, 16px);
}

.card { border-radius: var(--ds-card-size-radius-medium); }

/* Controls hold constant shape across sizes */
.button  { border-radius: var(--semantic-control-radius-default, 6px); }
.chip    { border-radius: var(--semantic-control-radius-pill, 9999px); }

/* Focus follows shape automatically */
.button:focus-visible {
  outline: var(--semantic-control-border-focus-width, 2px) solid
           var(--semantic-color-border-focus);
  border-radius: inherit;
}`}</code>
        </pre>
      </>
    ),
  },
  {
    type: 'applied-example',
    id: 'applied-example',
    title: 'Applied Example: A Filter Bar, Shaped Coherently',
    order: 7,
    content: (
      <>
        <p>
          Ship a shape-heavy pattern: a filter bar with pill chips inside
          a card, above a data table.
        </p>
        <ol>
          <li>
            <strong>Assign by role, top-down:</strong> the card is a
            surface → <code>radius.medium</code> semantic (8px). The
            chips inside are controls and pills →{' '}
            <code>control.radius.pill</code>. The table below is
            sharp-cornered data → <code>radius.none</code> with hairline
            borders from the border system.
          </li>
          <li>
            <strong>Check the ladder:</strong> card 8 → chips pill (the
            exception that reads correctly because pills are absolute),
            and no nested element equals its container&apos;s radius.
          </li>
          <li>
            <strong>Interactions keep their shape:</strong> chip removal
            animates opacity and translate tokens, never the corner—a
            radius that animates reads as morphing, and morphing is
            motion-system vocabulary, not a filter chip&apos;s job.
          </li>
          <li>
            <strong>Focus shapes follow:</strong> tabbing through the
            chips shows pill-shaped focus rings (2px{' '}
            <code>focusWidth</code>) because the outline inherits the
            radius.
          </li>
          <li>
            <strong>Brand check:</strong> switching to a softer brand
            moves the semantic mapping; the bar&apos;s relationships
            survive because everything consumed roles.
          </li>
        </ol>
        <p>
          Five checks, zero new numbers. The bar looks like the rest of
          the product because it <em>is</em> the rest of the product,
          shape-wise.
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
            <strong>Fixed steps vs optical radius:</strong> huge
            surfaces technically want proportionally larger radii to look
            equal; a stepped scale accepts slight optical variance for
            predictability. Where it matters (hero cards), pick the next
            role—do not compute per-element.
          </li>
          <li>
            <strong>One control radius vs per-variant:</strong> holding
            6px for all controls costs expressiveness (no
            extra-round secondary buttons) and buys the strongest
            version of &quot;controls are one family.&quot;
          </li>
          <li>
            <strong>9999px trick vs explicit 50%:</strong> the huge-value
            pill cannot express elliptical or asymmetric corners; those
            rare cases fall to dedicated components, not the scale.
          </li>
          <li>
            <strong>Shape vs density decoupling:</strong> keeping radii
            constant across density modes preserves identity but means
            dense layouts carry rounded corners into tight spaces—the
            accepted cost, revisited only if clipping artifacts appear.
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'radius-pitfalls',
    title: 'Common Pitfalls & Failure Modes',
    order: 8.5,
    content: (
      <>
        <h3>1. Literal radii</h3>
        <pre>
          <code>{`/* ❌ */
.input { border-radius: 4px; }
/* ✅ */
.input { border-radius: var(--semantic-control-radius-default, 6px); }`}</code>
        </pre>
        <h3>2. Nesting without stepping</h3>
        <pre>
          <code>{`/* ❌ Card 8px hosting an 8px panel */
.panel { border-radius: var(--semantic-shape-radius-medium); }
/* ✅ Step down inside */
.panel { border-radius: var(--semantic-shape-radius-small); }`}</code>
        </pre>
        <h3>3. Almost-pills</h3>
        <pre>
          <code>{`/* ❌ Hand-tuned fake pill */
.tag { border-radius: 14px; }
/* ✅ Commit or don't */
.tag { border-radius: var(--semantic-control-radius-pill); }`}</code>
        </pre>
        <h3>4. Scaling radius with size</h3>
        <p>
          Corner radius that grows with an element&apos;s width (5% of
          width, say) destroys the constant-control contract and makes
          sibling controls disagree. Shape is a role, not a ratio.
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
            <strong>Borders &amp; Strokes</strong> — the lines that pair
            with these corners (
            <code>/blueprints/foundations/borders</code>)
          </li>
          <li>
            <strong>Elevation &amp; Shadows</strong> — shadows follow
            shape (<code>/blueprints/foundations/elevation</code>)
          </li>
          <li>
            <strong>The sources</strong> —{' '}
            <code>ui/designTokens/core/shape.tokens.json</code>,{' '}
            <code>ui/designTokens/semantic/shape.tokens.json</code>
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
    id: 'roles-only',
    label: 'Corners reference semantic shape roles',
    description: 'No literal radii in styles; scale steps stay internal',
    required: true,
  },
  {
    id: 'nesting-ladder',
    label: 'Nested corners step down from their container',
    description: 'Inner radii use the next-smaller role',
    required: true,
  },
  {
    id: 'constant-controls',
    label: 'Controls hold one radius across sizes',
    description: 'control.radius.default everywhere; pills are deliberate',
    required: true,
  },
  {
    id: 'focus-follows-shape',
    label: 'Focus rings inherit element shape',
    description: 'Outline radius matches corner radius',
    required: false,
  },
];

content.assessmentPrompts = [
  {
    question:
      'A brand refresh asks for a "friendlier" feel. Map exactly which semantic radius roles move, what stays fixed, and why controls should resist the change more than surfaces.',
    type: 'application',
  },
  {
    question:
      'You find a component using border-radius: 14px on a 28px-tall chip. Is this a pill expressed badly, or a new shape need? What evidence decides, and what is the repair in each case?',
    type: 'reflection',
  },
];

content.crossReferences = {
  concepts: [
    {
      slug: 'tokens',
      title: 'Design Tokens',
      description: 'The architecture the radius scale and roles live in',
      type: 'foundation',
    },
    {
      slug: 'borders',
      title: 'Borders & Strokes',
      description: 'The widths and styles that live on these corners',
      type: 'foundation',
    },
    {
      slug: 'elevation',
      title: 'Elevation & Shadows',
      description: 'Shadows take the shape of what casts them',
      type: 'foundation',
    },
  ],
  components: [],
  glossary: ['02', '16', '36'],
};

export const metadata = generateFoundationMetadata(pageMetadata);

export default function RadiusPage() {
  return <FoundationPage content={content} />;
}
