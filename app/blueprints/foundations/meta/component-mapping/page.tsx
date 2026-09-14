/**
 * Foundation Meta: Component Mapping
 * How token-to-anatomy mapping makes token usage intuitive: every
 * component part declares which tokens it consumes, in a contract the
 * docs, the lints, and the CSS all read from — so "which token does
 * this part use?" is a lookup, never an investigation.
 */

import type {
  FoundationPageMetadata,
  FoundationSection,
} from '@/types/foundationContent';
import { generateFoundationMetadata } from '@/utils/metadata/foundationMetadata';
import { createFoundationContent } from '../../_lib/contentBuilder';
import { FoundationPage } from '../../_lib/pageWrapper';

const pageMetadata: FoundationPageMetadata = {
  title: 'Component Token Mapping',
  description:
    'Map tokens to component anatomy so design decisions translate visibly to implementation: per-slot token contracts with resolution targets and fallbacks, scoped CSS emission, anatomy tables generated from the same source, and the discipline that keeps every part answerable.',
  slug: 'meta/component-mapping',
  canonicalUrl:
    'https://darianrosebrook.com/blueprints/foundations/meta/component-mapping',
  published_at: new Date().toISOString(),
  modified_at: new Date().toISOString(),
  image: 'https://darianrosebrook.com/darianrosebrook.jpg',
  keywords: 'component tokens, anatomy, slots, contracts, mapping',
  learning: {
    learning_level: 'intermediate',
    role_relevance: ['design', 'engineering'],
    prerequisites: ['tokens'],
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
    expertise: ['Design Systems', 'Component Architecture', 'Tokens'],
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
          The most common question in any design system slack channel is
          a variant of &quot;which token do I use here?&quot; Teams
          that answer it with tribal knowledge get slower forever:
          every onboarding, every review, every incident re-asks it.
          The question becomes cheap exactly when the component itself
          carries the answer—when each anatomical part declares the
          tokens it consumes, in a form people <em>and</em> tooling can
          read.
        </p>
        <p>
          That declaration is what a component contract is. In this
          repository, every component ships a{' '}
          <code>&lt;Name&gt;.contract.json</code> next to its code:
          its anatomy (slots and their selectors), its variants and
          states, its accessibility facts, and—central to this page—
          its <strong>per-slot token map</strong>: which token each
          part consumes, what it resolves to, which CSS property it
          feeds, and the fallback that keeps the part renderable. The
          documentation&apos;s anatomy tables are generated from these
          files; nothing is hand-synced.
        </p>
        <p>
          The payoff is symmetrical. Designers see where each decision
          lands (this role, this part); engineers see what each part
          owes (this token, this fallback); and the system sees its
          own coverage—which parts consume which layers, and where a
          component is reaching past its contract.
        </p>
      </>
    ),
  },
  {
    type: 'core-concepts',
    id: 'core-concepts',
    title: 'Core Concepts: Slots, Bindings, Emission, Generation',
    order: 4,
    content: (
      <>
        <h3>Anatomy First: Parts Have Addresses</h3>
        <p>
          A component&apos;s anatomy is its named parts—slots—with a
          DOM address for each. The Icon contract is the smallest real
          example:
        </p>
        <pre>
          <code>{`// ui/components/Icon/Icon.contract.json (excerpt)
{
  "name": "Icon",
  "layer": "primitive",
  "anatomy": ["root"],
  "slots": {
    "root": { "required": true, "selector": "[data-slot=\\"icon\\"]" }
  },
  "a11y": { "role": "generic", "labeling": [], "keyboard": [] }
}`}</code>
        </pre>
        <p>
          Compound components have richer trees—Tabs declares root,
          list, tab, and panel slots, each with its selector—and the
          discipline is the same: <strong>if a part matters enough to
          style, it matters enough to name and address.</strong> The{' '}
          <code>data-slot</code> attribute is how the contract&apos;s
          selector and the rendered DOM stay honest with each other.
        </p>

        <h3>The Token Map: Bindings Per Slot</h3>
        <p>
          Inside each slot, the contract enumerates its token
          bindings—the actual mapping this page is named for:
        </p>
        <pre>
          <code>{`// Icon.contract.json — tokens for the root slot
"tokens": {
  "root": {
    "icon.color.foreground.default": {
      "resolvesTo": "semantic.color.foreground.primary",
      "fallback": "#141414",
      "property": "color",
      "layer": "semantic"
    },
    "icon.size.padding.default": {
      "resolvesTo": "core.spacing.size.01",
      "fallback": "1px",
      "property": "padding",
      "layer": "core"
    }
  }
}`}</code>
        </pre>
        <p>
          Read one binding as a complete sentence:{' '}
          <em>the icon&apos;s default foreground color is the semantic
          foreground-primary token, feeding the color property, with a
          #141414 fallback if the sheet is missing.</em> Four fields,
          and every question a consumer or reviewer asks is answered:
          what it consumes (<code>resolvesTo</code>), what breaks
          first (<code>fallback</code>), where it lands (
          <code>property</code>), and which layer it lives in (
          <code>layer</code>)—so a component reaching for a{' '}
          <code>core</code> binding directly is visible in its own
          contract, not just in a lint run.
        </p>
        <p>
          These bindings scale with anatomy: Alert&apos;s contract
          carries fifty, AlertNotice fifty-seven—every region, state,
          and adornment of those components is bound, which is why
          their theming behavior is predictable without reading their
          CSS.
        </p>

        <h3>Emission: The Scoped Wrap</h3>
        <p>
          The build turns bindings into the scoped CSS tier you have
          met throughout the foundations—a{' '}
          <code>&lt;Name&gt;.tokens.css</code> per component, scoped
          by <code>[data-ds-component]</code> and prefixed{' '}
          <code>--ds-&lt;name&gt;-*</code>:
        </p>
        <pre>
          <code>{`/* Generated from Card.tokens.json — prefix + references */
[data-ds-component='Card'] {
  --ds-card-color-background-default:
    var(--semantic-color-background-primary, #ffffff);
  --ds-card-color-background-hover:
    var(--semantic-color-background-secondary);
  --ds-card-color-foreground-link:
    var(--semantic-color-foreground-link);
}`}</code>
        </pre>
        <p>
          The mapping thus has three synchronized representations:
          JSON contract (source), scoped CSS (runtime), and the
          component&apos;s own styles consuming only{' '}
          <code>--ds-*</code> names. One source of truth, two
          projections—and a mismatch between them is a build defect,
          not a documentation drift.
        </p>

        <h3>Generation: Docs From the Same Source</h3>
        <p>
          Because the map is data, the documentation is generated: the
          component-standards anatomy tables (
          <code>AnatomyTable</code> over{' '}
          <code>generateAnatomy</code>) read the same contracts and
          render parts, slots, and tokens as real table rows. A new
          binding appears in the docs the next time they build; a
          removed one disappears. Documentation that cannot drift is
          the quiet superpower of mapping-as-data.
        </p>
      </>
    ),
  },
  {
    type: 'system-roles',
    id: 'system-roles',
    title: 'System Roles: Who Maintains the Map',
    order: 5,
    content: (
      <>
        <h3>Design Impact</h3>
        <p>
          Designers read the map to see their decisions land: the
          border role they renamed shows up (or fails to) in the
          contracts that consume it. The map is also the review
          surface for coverage—&quot;this state has no binding&quot;
          is visible before it becomes &quot;this state looks wrong in
          dark mode.&quot;
        </p>
        <h3>Engineering Impact</h3>
        <p>
          Engineers keep the three representations synchronized by
          keeping one source: bindings land in the contract, the build
          emits the CSS, and component styles never hardcode what a
          binding already carries. The contract file is reviewed like
          code because it is code.
        </p>
        <h3>Governance Impact</h3>
        <p>
          Governance reads the aggregate: which components bind to
          which layers, where core-layer bindings cluster (a smell
          worth a conversation), and whether new semantics are being
          adopted or bypassed. The map turns &quot;is the system being
          used?&quot; from a feeling into a query.
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
          On the design side, the map appears as the component
          library&apos;s own structure: each component variant&apos;s
          layers named for the parts (matching slots), painted only
          with the variables the contract binds. A designer inspecting
          the library&apos;s Card sees background-default as a
          variable—because that is what the engineer&apos;s Card
          consumes. The shared vocabulary is not aspirational; it is
          generated from one file.
        </p>
      </>
    ),
    codeContent: (
      <>
        <p>
          In code, adding a binding is the complete change—and its
          paper trail:
        </p>
        <pre>
          <code>{`// 1. Bind in the contract (source of truth)
"tokens": { "root": {
  "icon.elevation.dragging.default": {
    "resolvesTo": "semantic.elevation.surface.dragging",
    "fallback": "0px 3px 6px rgba(0, 0, 0, 0.14)",
    "property": "box-shadow",
    "layer": "semantic"
  } } }

// 2. Build — the scoped tier appears
[data-ds-component='Icon'] {
  --ds-icon-elevation-dragging-default:
    var(--semantic-elevation-surface-dragging,
        0px 3px 6px rgba(0, 0, 0, 0.14));
}

// 3. Consume — the component style uses only its own name
.iconDragging { box-shadow: var(--ds-icon-elevation-dragging-default); }

// 4. Docs — AnatomyTable renders the new row next build,
//    and the reference lint verifies the resolution direction.`}</code>
        </pre>
      </>
    ),
  },
  {
    type: 'applied-example',
    id: 'applied-example',
    title: 'Applied Example: Answering "Which Token Do I Use?"',
    order: 7,
    content: (
      <>
        <p>
          A product engineer asks: &quot;I&apos;m building a status
          chip inside a Card—what color do I use?&quot; Show the map
          answering:
        </p>
        <ol>
          <li>
            <strong>Find the nearest part:</strong> the chip is not a
            new anatomy problem—Badge&apos;s contract already binds
            status surfaces. Read its bindings:{' '}
            <code>badge.background.success</code> resolves to{' '}
            <code>semantic.color.background.successSubtle</code> with
            an <code>onSuccessSubtle</code> foreground pair.
          </li>
          <li>
            <strong>Prefer the component over the raw pair:</strong>{' '}
            the mapping says the system&apos;s decided answer to
            &quot;status chip&quot; is <em>Badge</em>—consuming the
            pair directly re-opens pairing decisions (which fg goes
            with which bg) the component already made.
          </li>
          <li>
            <strong>If it must be custom, bind it:</strong> a truly
            novel part gets a slot and a binding in its own
            contract—not a one-off hex. The next person with this
            question finds the answer in the same place you just
            did.
          </li>
          <li>
            <strong>Close the loop:</strong> the anatomy docs the
            engineer was reading were generated from those same
            contracts—the question was already answered; the map just
            had to be where the question was asked.
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
            <strong>Binding granularity vs contract weight:</strong>{' '}
            every binding is reviewable, generated, and documented—but
            fifty-binding contracts cost more to read than a CSS file.
            The count tracks real anatomy; the cure for bloat is
            simpler components, not sparser maps.
          </li>
          <li>
            <strong>Core-layer bindings:</strong> the schema permits
            binding core tokens directly (Icon&apos;s padding), and
            primitives are the honest case—general components should
            prefer semantic resolutions so themes can reach them.
          </li>
          <li>
            <strong>Generated docs vs curated docs:</strong>{' '}
            generation guarantees accuracy and surrenders narrative;
            the working split is generated structure with a thin
            authored layer on top, never the reverse.
          </li>
          <li>
            <strong>Fallback maintenance:</strong> each literal
            fallback is tracked drift risk; the same change must
            update token and fallback or the resilience story lies
            quietly.
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'mapping-pitfalls',
    title: 'Common Pitfalls & Failure Modes',
    order: 8.5,
    content: (
      <>
        <h3>1. Unmapped parts</h3>
        <pre>
          <code>{`// ❌ A styled region with no slot, no binding
.extraRow { background: #f5f5f5; }
// ✅ Name it, bind it, and the question answers itself forever`}</code>
        </pre>
        <h3>2. Contracts drifting from CSS</h3>
        <p>
          Hand-edited token CSS that the contract does not declare
          (or vice versa) makes the map lie. The build is the only
          writer of the scoped tier; the contract is the only source
          of the build.
        </p>
        <h3>3. Consuming past the map</h3>
        <pre>
          <code>{`/* ❌ The chip bypasses Badge's decided pairing */
.chip { color: var(--semantic-color-foreground-success); }

/* ✅ Consume the component, or bind a proper pair */`}</code>
        </pre>
        <h3>4. Bindings without fallbacks</h3>
        <p>
          A binding that omits its fallback removes the
          render-without-stylesheet guarantee and the runtime
          observability point in one omission.
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
            <strong>Component anatomy standards</strong> — the tables
            generated from these contracts (
            <code>/blueprints/component-standards/anatomy</code>)
          </li>
          <li>
            <strong>Component architecture</strong> — the layering the
            map hangs on (
            <code>/blueprints/foundations/component-architecture</code>
            )
          </li>
          <li>
            <strong>Token naming</strong> — how bound names stay
            legible (
            <code>/blueprints/foundations/meta/token-naming</code>)
          </li>
          <li>
            <strong>The sources</strong> — any{' '}
            <code>ui/components/*/[Name].contract.json</code> (start
            with Icon, then Alert for a fifty-binding example)
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
    id: 'parts-named',
    label: 'Every styled part is a named slot with a selector',
    description: 'If it matters enough to style, it matters enough to address',
    required: true,
  },
  {
    id: 'bindings-declared',
    label: 'Every part declares its token bindings in the contract',
    description: 'resolvesTo, fallback, property, layer — four fields, one sentence',
    required: true,
  },
  {
    id: 'one-source',
    label: 'Contract is the single source; CSS and docs generate from it',
    description: 'No hand-synced duplicates of the map',
    required: true,
  },
  {
    id: 'consumed-via-ds',
    label: 'Component styles consume only their --ds-* names',
    description: 'The scoped tier is the only door to the layers below',
    required: false,
  },
];

content.assessmentPrompts = [
  {
    question:
      'Open any component you own and list its styled regions. Which ones have slots and bindings, and which are unmapped? Write the binding sentences for one unmapped region.',
    type: 'application',
  },
  {
    question:
      'The Icon contract binds core.spacing.size.01 directly. When is a core-layer binding the honest choice, and what does its visibility in the contract buy that a hidden hex never could?',
    type: 'reflection',
  },
];

content.crossReferences = {
  concepts: [
    {
      slug: 'component-architecture',
      title: 'Component Architecture',
      description: 'The slot and layering model the map annotates',
      type: 'foundation',
    },
    {
      slug: 'tokens',
      title: 'Design Tokens',
      description: 'The layers the bindings resolve through',
      type: 'foundation',
    },
    {
      slug: 'color',
      title: 'Color Foundations',
      description: 'The pair discipline bindings preserve (fg/bg couples)',
      type: 'foundation',
    },
  ],
  components: [],
  glossary: ['03', '05', '02'],
};

export const metadata = generateFoundationMetadata(pageMetadata);

export default function MetaComponentMappingPage() {
  return <FoundationPage content={content} />;
}
