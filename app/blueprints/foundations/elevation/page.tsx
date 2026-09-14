/**
 * Foundation: Elevation & Shadows
 * How a tokenized elevation ramp gives interfaces honest depth cues —
 * shadows that mean hierarchy, not decoration, and degrade gracefully
 * in dark modes and reduced-motion contexts.
 */

import type {
  FoundationPageMetadata,
  FoundationSection,
} from '@/types/foundationContent';
import { generateFoundationMetadata } from '@/utils/metadata/foundationMetadata';
import { createFoundationContent } from '../_lib/contentBuilder';
import { FoundationPage } from '../_lib/pageWrapper';

const pageMetadata: FoundationPageMetadata = {
  title: 'Elevation & Shadow Foundations',
  description:
    'Design depth as a system: a calibrated shadow ramp, semantic surface roles, the z-axis contract between elevation and layering, and the dark-mode and performance realities that shadows carry with them.',
  slug: 'elevation',
  canonicalUrl: 'https://darianrosebrook.com/blueprints/foundations/elevation',
  published_at: new Date().toISOString(),
  modified_at: new Date().toISOString(),
  image: 'https://darianrosebrook.com/darianrosebrook.jpg',
  keywords: 'elevation, shadows, depth, z-index, layering, surfaces',
  learning: {
    learning_level: 'foundation',
    role_relevance: ['design', 'engineering'],
    prerequisites: ['tokens'],
    next_units: ['radius', 'borders'],
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
    expertise: ['Design Systems', 'Visual Design', 'Performance'],
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
          Elevation is the most misused depth cue in interface design. Shadows
          get added to make things &quot;pop&quot;, and within a year every card
          floats, every button hovers, and users can no longer read which
          surfaces are above which. Depth is a <em>communication channel</em>:
          it tells users what overlays what, what is attached to what, and what
          is interactive. Spent everywhere, it says nothing anywhere.
        </p>
        <p>
          The system answer is the same as color&apos;s: a small, calibrated
          ramp where each step means something, consumed through semantic
          surface roles. Elevation has two extra realities to manage that color
          does not—shadows are nearly invisible on dark surfaces (dark modes
          need alternative depth cues), and shadows are real render cost (blur
          radius is paint area, and layered shadows stack).
        </p>
        <p>
          This page covers the elevation system as built here: the{' '}
          <code>elevation.level</code> ramp in the core tokens, the semantic{' '}
          <code>surface</code> roles above it, and the{' '}
          <code>effect.backdropBlur</code> companions.
        </p>
      </>
    ),
  },
  {
    type: 'core-concepts',
    id: 'core-concepts',
    title: 'Core Concepts: The Ramp, the Roles, the Z-Axis',
    order: 4,
    content: (
      <>
        <h3>Four Levels, Zero to Three</h3>
        <p>
          The core ramp in{' '}
          <code>ui/designTokens/core/elevation.tokens.json</code> is four
          steps—flat to floating—and each is a complete shadow, not a number to
          scale:
        </p>
        <pre>
          <code>{`// elevation.level (values) — offsetX / offsetY / blur / color
level.0:  0px  0px   0px   (no shadow — flat with its surface)
level.1:  0px  1px   3px   rgba(0,0,0,0.12)  // resting card
level.2:  0px  3px   6px   rgba(0,0,0,0.14)  // raised/floating
level.3:  0px  8px  16px   rgba(0,0,0,0.18)  // modal overlay`}</code>
        </pre>
        <p>
          Read the ramp as a physics claim. Offset grows faster than blur, and
          opacity edges up as blur widens—soft light sources close to the
          surface. The consistency across steps is the point: a level-3 dialog
          and a level-1 card look like the same world at different heights, not
          like two design decisions.
        </p>
        <p>
          Alongside the levels sit the parts they were built from—
          <code>elevation.offset.y1/y2</code> (1px, 3px),{' '}
          <code>elevation.blur.sm/md</code> (3px, 6px),{' '}
          <code>elevation.spread.none</code>—and a parallel{' '}
          <code>elevation.depth.0–4</code> number scale for logical layering,
          which is how z-index decisions stay off the shadow ramp (more below).
        </p>

        <h3>Semantic Surfaces Name the Intent</h3>
        <p>
          The semantic layer maps levels to roles, exactly as color maps ramps
          to intent:
        </p>
        <pre>
          <code>{`// ui/designTokens/semantic/elevation.tokens.json (excerpt)
"elevation": {
  "none":     { "$value": "none" },          // explicitly removes shadow
  "default":  { "$value": "{elevation.level.1}" },
  "surface": {
    "raised":   { "$value": "{elevation.level.1}" },
    "floating": { "$value": "{elevation.level.2}" }
  },
  "depth":    { "$value": "{elevation.depth.0}" }
}`}</code>
        </pre>
        <p>
          Components consume <code>surface.raised</code> or{' '}
          <code>surface.floating</code>, never <code>level.2</code> directly.
          The payoff is the same as every semantic layer: when the design
          decision changes—floating surfaces gain a hairline border in dark
          mode, say—it changes in one place.
        </p>

        <h3>Elevation Is a Promise About the Z-Axis</h3>
        <p>
          A shadow claims &quot;I am above my surroundings.&quot; That claim has
          two halves that must agree: the visual shadow, and the stacking order
          (<code>z-index</code>) that makes overlapped rendering match. The
          system keeps them separate on purpose—
          <code>elevation.depth</code> numbers for stacking,{' '}
          <code>elevation.level</code> shadows for appearance—because they
          change at different rates, but the review rule is rigid:
          <strong>
            {' '}
            a surface&apos;s depth number must order with its shadow level
          </strong>
          . A level-3 modal shadow under a level-1 nav bar is a lie users can
          see.
        </p>

        <h3>Dark Mode and the Shadow Problem</h3>
        <p>
          Shadows are a light-mode artifact: on near-black surfaces,
          black-at-12% is invisible. The honest system response is not heavier
          shadows but <em>alternative depth cues</em> that the semantic layer
          can swap per mode—surface color steps (the{' '}
          <code>background.primary → secondary</code> ramp from the color
          system), hairline borders, and the <code>effect.backdropBlur</code>{' '}
          companions (4/8/12px) for surfaces that sit over content. Because
          components consume <code>surface.floating</code> rather than a raw
          shadow value, the dark-mode story can evolve without touching them.
        </p>
      </>
    ),
  },
  {
    type: 'system-roles',
    id: 'system-roles',
    title: 'System Roles: Where Elevation Decisions Land',
    order: 5,
    content: (
      <>
        <h3>Design Impact</h3>
        <p>
          Designers own the meaning table: which surfaces are flat, which are
          raised, which float. The discipline that keeps it honest is
          scarcity—elevation is for things that <em>must</em> read as above:
          overlays, popovers, dragged elements. A marketing card that wants a
          shadow for warmth wants a border or a surface step, not elevation.
        </p>
        <h3>Engineering Impact</h3>
        <p>
          Engineers own the z-axis agreement and the render cost: depth numbers
          that order with shadow levels, shadows referenced through scoped
          tokens, and awareness that blur radius is paint area—a full-screen
          level-3 blur behind every list row is a performance decision, not a
          style line.
        </p>
        <h3>Accessibility Impact</h3>
        <p>
          Accessibility owns the rule that elevation never carries information
          alone: depth supplements structure that semantics already express (a
          dialog is a dialog because of roles and focus trapping, not its
          shadow). Users with low vision or high-contrast modes may see no
          shadows at all—the interface must survive that.
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
          In the design tool, the elevation system appears as four named effects
          matching the levels exactly—same offsets, blurs, and opacities—with
          the surface roles as the styles components actually apply. The comp
          review question is &quot;which surface role is this?&quot; and the
          answer has to come from the meaning table, not from which shadow
          looked nice on the artboard.
        </p>
        <p>
          Dark-mode design files carry the second half of the contract: each
          elevated surface shown twice—once per mode—with its alternative cue
          visible. A surface that only works with its shadow is a dark-mode
          defect shipped in daylight.
        </p>
      </>
    ),
    codeContent: (
      <>
        <p>
          In code, the levels emit as complete shadow values and components
          consume their scoped aliases:
        </p>
        <pre>
          <code>{`/* Generated: app/designTokens.scss */
@layer core {
  :root {
    --core-elevation-level-1:
      0px 1px 3px rgba(0, 0, 0, 0.12);
    --core-elevation-level-2:
      0px 3px 6px rgba(0, 0, 0, 0.14);
    --core-elevation-level-3:
      0px 8px 16px rgba(0, 0, 0, 0.18);
  }
}

/* Component contract: semantic role, not raw level */
[data-ds-component='Card'] {
  --ds-card-shadow:
    var(--semantic-elevation-surface-raised,
        0px 1px 3px rgba(0, 0, 0, 0.12));
}

.card:hover {
  box-shadow: var(--ds-card-shadow);
}`}</code>
        </pre>
        <p>And the z-axis agreement as a reviewable pattern:</p>
        <pre>
          <code>{`/* Depth numbers order with shadow levels — always */
.nav    { z-index: calc(var(--core-elevation-depth-2) * 100); }
.popover { z-index: calc(var(--core-elevation-depth-3) * 100); }
.modal  { z-index: calc(var(--core-elevation-depth-4) * 100);
          box-shadow: var(--core-elevation-level-3); }

/* Elevation never animates layout — shadows transition cheaply */
@media (prefers-reduced-motion: reduce) {
  .card { transition: none; }
}`}</code>
        </pre>
      </>
    ),
  },
  {
    type: 'applied-example',
    id: 'applied-example',
    title: 'Applied Example: A Select Menu, Elevated Correctly',
    order: 7,
    content: (
      <>
        <p>
          Ship the classic elevation component—a select menu that opens over a
          form—using the whole stack:
        </p>
        <ol>
          <li>
            <strong>Assign the surface role:</strong> the open menu is{' '}
            <code>surface.floating</code> (level 2: 0/3/6 at 14%)—above the
            page, below a modal. The trigger itself stays flat; the control does
            not elevate, its <em>overlay</em> does.
          </li>
          <li>
            <strong>Match the stacking:</strong> the popover layer gets the{' '}
            <code>elevation.depth</code> number that orders above content and
            below modals, so overlap rendering and the shadow tell the same
            story.
          </li>
          <li>
            <strong>Dark mode alternative:</strong> in dark theme the
            menu&apos;s panel uses a background step plus hairline border as its
            primary cue; the level-2 shadow remains but does not carry the
            meaning alone.
          </li>
          <li>
            <strong>Enter with motion tokens, exit faster:</strong> the menu
            enters on <code>motion.interaction.enter</code> (medium1 +
            soft.enter) and exits on <code>motion.interaction.exit</code>{' '}
            (short3 + quick.exit), with the <code>prefers-reduced-motion</code>{' '}
            block fading only—no scale, no travel.
          </li>
          <li>
            <strong>Cost check:</strong> one blurred layer the size of the menu,
            not the viewport. Blur is paint area; menus are small; this is why
            the ramp tops out at 16px of blur.
          </li>
        </ol>
        <p>
          Note how many foundations one component touches—elevation, color
          surfaces, motion, depth—and how each contributed a named token instead
          of a local decision. That is the compounding return of tokenized
          foundations.
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
            <strong>Four levels vs expressive depth:</strong> dramatic hero
            moments may want shadows the ramp cannot say. The system answer is a
            new level with review—ramps grow by decision—never an ad-hoc{' '}
            <code>box-shadow</code> in a feature file.
          </li>
          <li>
            <strong>Shadows vs dark-mode legibility:</strong> the light-mode
            ramp is nearly invisible on dark surfaces; alternative cues (surface
            steps, borders) must be designed and audited per mode rather than
            assumed.
          </li>
          <li>
            <strong>Depth-as-numbers vs z-index literals:</strong> maintaining a
            parallel depth scale costs a little indirection and buys stack
            ordering that can be reviewed against shadow levels; raw{' '}
            <code>z-index: 9999</code> buys nothing but archaeology.
          </li>
          <li>
            <strong>Backdrop blur vs performance:</strong>{' '}
            <code>effect.backdropBlur</code> (4/8/12px) is a beautiful depth cue
            and one of the most expensive effects in the paint pipeline—budgeted
            by scale and placement, not applied as garnish.
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'elevation-pitfalls',
    title: 'Common Pitfalls & Failure Modes',
    order: 8.5,
    content: (
      <>
        <h3>1. Everything floats</h3>
        <pre>
          <code>{`/* ❌ Depth as decoration: the page whispers constantly */
.card, .badge, .button { box-shadow: var(--core-elevation-level-1); }
/* ✅ Elevation for overlays and detachment; borders for the rest */`}</code>
        </pre>
        <h3>2. Hand-tuned shadows</h3>
        <pre>
          <code>{`/* ❌ A fifth shadow nobody calibrated */
.popover { box-shadow: 0 2px 10px rgba(0,0,0,0.2); }
/* ✅ The ramp, through the semantic role */
.popover { box-shadow: var(--semantic-elevation-surface-floating); }`}</code>
        </pre>
        <h3>3. Shadows and stacking disagreeing</h3>
        <pre>
          <code>{`/* ❌ Level-3 shadow pinned under a level-1 bar */
.modal { box-shadow: var(--core-elevation-level-3); z-index: 10; }
.nav   { z-index: 100; }
/* ✅ Depth numbers order with shadow levels */`}</code>
        </pre>
        <h3>4. Depth as the only signal</h3>
        <p>
          If removing every shadow breaks the interface&apos;s meaning,
          elevation was carrying semantics alone. Dialogs are dialogs because of
          roles, focus, and interaction—shadows only corroborate.
        </p>
        <h3>5. Viewport-sized blur</h3>
        <pre>
          <code>{`/* ❌ Full-screen frost behind every list row */
.row::backdrop { backdrop-filter: var(--core-effect-backdrop-blur-lg); }
/* ✅ Blur scaled to the surface that needs it */`}</code>
        </pre>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'elevation-health-metrics',
    title: 'Elevation System Health Metrics',
    order: 8.75,
    content: (
      <>
        <h3>Signal 1: Ramp exclusivity</h3>
        <ul>
          <li>
            <strong>Healthy:</strong> every <code>box-shadow</code> in product
            CSS resolves through the ramp (via semantic surface roles or scoped
            contracts); a grep for <code>box-shadow</code> literals returns only
            fallbacks.
          </li>
          <li>
            <strong>Warning:</strong> one or two hand-tuned shadows—each a fifth
            level nobody calibrated, and a future dark-mode question with no
            answer.
          </li>
          <li>
            <strong>Critical:</strong> bespoke shadows outnumber ramp
            references; elevation no longer means anything and users are back to
            guessing what floats.
          </li>
        </ul>

        <h3>Signal 2: Depth agreement</h3>
        <ul>
          <li>
            <strong>Healthy:</strong> z-index values derive from the{' '}
            <code>elevation.depth</code> scale and order with the shadow levels;
            the overlay stack is reviewable as one table.
          </li>
          <li>
            <strong>Warning:</strong> a few <code>z-index: 999</code>{' '}
            escapes—archaeology waiting, each one hiding a disagreement between
            what is above and what looks above.
          </li>
          <li>
            <strong>Critical:</strong> stacking is managed by escalation (raise
            the number until it works); the shadow story and the stacking story
            are different products.
          </li>
        </ul>

        <h3>Signal 3: Dark-mode cue coverage</h3>
        <ul>
          <li>
            <strong>Healthy:</strong> every elevated surface has a per-mode
            depth cue beyond shadow (surface step or border), auditable by
            flipping modes on the overlay inventory.
          </li>
          <li>
            <strong>Warning:</strong> new overlays ship with light-mode-only
            cues—the debt is invisible until someone flips the theme with a
            dialog open.
          </li>
          <li>
            <strong>Critical:</strong> dark mode&apos;s overlays are
            indistinguishable from the page—depth carrying meaning that has
            silently vanished for a whole theme.
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'elevation-migration',
    title: 'Migration Strategy: Taming the Shadow Stack',
    order: 8.9,
    content: (
      <>
        <ol>
          <li>
            <strong>Inventory shadows and stacking:</strong> every{' '}
            <code>box-shadow</code>, every <code>z-index</code>, with the
            surface it belongs to. The inventory usually reveals three clusters
            of shadows pretending to be seven and a stacking story written by
            escalation.
          </li>
          <li>
            <strong>Map to the meaning table:</strong> each surface gets a
            role—flat, raised, floating, modal— and the shadow snaps to the ramp
            level that role names. Unmappable shadows were decoration; they
            become borders or surface steps.
          </li>
          <li>
            <strong>Re-derive stacking from depth tokens:</strong> replace raw
            z-indexes with the depth scale, largest for the topmost role; the
            table from step 1 becomes the review artifact that proves shadows
            and stacking agree.
          </li>
          <li>
            <strong>Add the dark-mode cue per overlay:</strong> migration is the
            moment each surface gains its per-mode alternative—the work is cheap
            once per surface and permanent.
          </li>
          <li>
            <strong>Sweep for literals:</strong> the box-shadow grep joins the
            per-directory lint as each area cleans, so the fifth shadow cannot
            quietly return.
          </li>
        </ol>
      </>
    ),
  },
  {
    type: 'applied-example',
    id: 'elevation-case-studies',
    title: 'Real-World Case Studies',
    order: 8.98,
    content: (
      <>
        <h3>Case 1: The modal under the navbar</h3>
        <p>
          A modal shadowed at level 3 rendered beneath the sticky nav&apos;s{' '}
          <code>z-index: 100</code>. Sighted users saw the dimmed page above
          their dialog&apos;s header—a depth lie in two channels at once. The
          depth- token re-derivation ordered stacking with shadows, and the bug
          class (overlay-under-chrome) stopped recurring because the review
          checks one table.
        </p>
        <h3>Case 2: The card that wanted to pop</h3>
        <p>
          Marketing asked for &quot;more presence&quot; on a card and got a
          hand-tuned shadow—then a second card got a different one. Six weeks
          later the grid was a weather system. The meaning-table review returned
          both cards to <code>surface.raised</code> and gave one of them a
          border instead: presence via a channel that meant presence.
        </p>
        <h3>Case 3: The dark theme that lost its dialogs</h3>
        <p>
          Dark-mode QA filed &quot;dialog invisible&quot;—the level-2 shadow had
          vanished against near-black, and nothing else distinguished the panel.
          The surface-step plus hairline cure took one semantic addition; the
          finding became the dark-mode cue coverage signal, auditable by
          flipping themes across the overlay inventory.
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
            <strong>Radius &amp; Shape</strong> — the other half of surface
            identity (<code>/blueprints/foundations/radius</code>)
          </li>
          <li>
            <strong>Motion &amp; Duration</strong> — the tokens elevated
            surfaces enter and exit with (
            <code>/blueprints/foundations/motion</code>)
          </li>
          <li>
            <strong>Material Design elevation guidance</strong> — the reference
            articulation of elevation as a z-axis system (
            <code>https://m3.material.io/styles/elevation/overview</code>)
          </li>
          <li>
            <strong>The sources</strong> —{' '}
            <code>ui/designTokens/core/elevation.tokens.json</code>,{' '}
            <code>ui/designTokens/semantic/elevation.tokens.json</code>,{' '}
            <code>ui/designTokens/core/effect.tokens.json</code>
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
    id: 'ramp-only',
    label: 'Shadows come from the elevation ramp via semantic roles',
    description: 'No hand-tuned box-shadow values in styles',
    required: true,
  },
  {
    id: 'z-agrees',
    label: 'Stacking order agrees with shadow levels',
    description: 'Depth numbers and shadows tell one story',
    required: true,
  },
  {
    id: 'dark-cues',
    label: 'Elevated surfaces have dark-mode depth cues beyond shadow',
    description: 'Surface steps and borders carry meaning per mode',
    required: true,
  },
  {
    id: 'depth-scarce',
    label: 'Elevation is reserved for overlays and detachment',
    description: 'Meaning table governs which surfaces float',
    required: false,
  },
];

content.assessmentPrompts = [
  {
    question:
      'Take any app you use daily and mentally strip every shadow: which structures break, and which were decorative? That inventory is an elevation meaning table — write one for a product you know.',
    type: 'application',
  },
  {
    question:
      'A designer proposes a "level 2.5" shadow for a hero card that must pop more than cards but less than modals. What does the system already offer that answers this without a new shadow?',
    type: 'reflection',
  },
  {
    question:
      'Flip to dark mode on a product you use and open its overlays. Which surfaces lose their depth, and which alternative cue would you give each?',
    type: 'reflection',
  },
];

content.crossReferences = {
  concepts: [
    {
      slug: 'tokens',
      title: 'Design Tokens',
      description:
        'The architecture the elevation ramp and depth scales live in',
      type: 'foundation',
    },
    {
      slug: 'color',
      title: 'Color Foundations',
      description: 'Surface color steps as dark-mode depth cues',
      type: 'foundation',
    },
    {
      slug: 'motion',
      title: 'Motion & Duration Foundations',
      description: 'The interaction composites elevated surfaces animate with',
      type: 'foundation',
    },
  ],
  components: [],
  glossary: ['13', '02', '25'],
};

export const metadata = generateFoundationMetadata(pageMetadata);

export default function ElevationPage() {
  return <FoundationPage content={content} />;
}
