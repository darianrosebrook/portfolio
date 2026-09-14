/**
 * Foundation: Grid Systems
 * How tokenized columns, gutters, and breakpoints turn grid layout from
 * a per-page scaffold into a shared structural rhythm.
 */

import type {
  FoundationPageMetadata,
  FoundationSection,
} from '@/types/foundationContent';
import { generateFoundationMetadata } from '@/utils/metadata/foundationMetadata';
import { createFoundationContent } from '../_lib/contentBuilder';
import { FoundationPage } from '../_lib/pageWrapper';

const pageMetadata: FoundationPageMetadata = {
  title: 'Grid System Foundations',
  description:
    'Organize layouts with predictable flow and alignment: column structures on tokenized containers and breakpoints, gutters from the spacing scale, and the fluid-grid habits that keep dense layouts readable and reflowable.',
  slug: 'grid',
  canonicalUrl: 'https://darianrosebrook.com/blueprints/foundations/grid',
  published_at: new Date().toISOString(),
  modified_at: new Date().toISOString(),
  image: 'https://darianrosebrook.com/darianrosebrook.jpg',
  keywords: 'grid systems, columns, gutters, css grid, alignment',
  learning: {
    learning_level: 'foundation',
    role_relevance: ['design', 'engineering'],
    prerequisites: ['tokens', 'layout'],
    next_units: ['motion', 'color'],
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
    expertise: ['Design Systems', 'Layout', 'Grids'],
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
          A grid is a promise about alignment: everything on this page
          shares an invisible structure, so the eye can scan along lines
          it never sees. Break the promise—columns that almost line up,
          gutters that vary by a few pixels—and the cost is real:
          scanning gets harder, density gets noisy, and users cannot
          tell deliberate grouping from accident.
        </p>
        <p>
          Grids are also where design tools and code drift fastest,
          because everyone agrees grids matter and everyone implements
          them alone. The system answer is the same as every other
          foundation: columns counted in a shared convention, gutters
          and margins from the spacing scale, adaptation at the
          tokenized breakpoints. The grid is not a scaffold you redraw
          per screen; it is a rhythm you reference.
        </p>
        <p>
          This page covers grid as composed here—there is no separate
          grid token file, and that is the lesson: a good grid is{' '}
          <em>composed</em> from the layout, dimension, and spacing
          tokens you have already met.
        </p>
      </>
    ),
  },
  {
    type: 'core-concepts',
    id: 'core-concepts',
    title: 'Core Concepts: Columns, Gutters, Margins, Behavior',
    order: 4,
    content: (
      <>
        <h3>A Column Convention, Not a Column File</h3>
        <p>
          The system&apos;s grid is a <strong>12-column fluid grid</strong>{' '}
          inside the tokenized containers, dropping to simpler counts on
          small screens:
        </p>
        <pre>
          <code>{`// Column convention (composed, not stored)
//                columns   container cap            at breakpoint
phones           4         fluid, full-bleed        < md 768
tablets          8         layout.container.sm 640  >= md 768
desktop          12        layout.container.lg 1024 >= lg 1024
wide desktop     12        layout.container.xl 1280 >= xl 1440`}</code>
        </pre>
        <p>
          Twelve divides by 2, 3, 4, and 6, which is why it survived
          every framework war: halves, thirds, quarters, and sixths all
          land on column boundaries. The smaller counts exist because a
          12-column grid on a phone produces slivers—columns narrower
          than their gutters are structure with no meaning.
        </p>

        <h3>Gutters and Margins Come from the Spacing Scale</h3>
        <p>
          Gutters are spacing decisions and use the scale from the
          spacing foundation: <code>spacing.size.04</code> (8px) on
          phones, <code>size.06</code> (16px) from tablet up, stepping
          to <code>size.07</code> (24px) for wide desktops. Page margins
          use the same steps (16px mobile, 32px from{' '}
          <code>lg</code>—the same two-value rule the layout foundation
          set for page gutters). The consequence worth internalizing:
          <strong> the grid&apos;s vertical rhythm and the
          component&apos;s internal rhythm are the same scale</strong>,
          so cards snap to gutters without translation arithmetic.
        </p>

        <h3>Fluid Inside, Discrete At the Edges</h3>
        <p>
          Columns are fluid—<code>1fr</code> all the way to their
          container cap—while the structure changes only at the six
          tokenized <code>dimension.breakpoint</code> steps (640, 768,
          1024, 1440, 1536, 1920). This is the layout foundation&apos;s
          rule applied to grids: continuous behavior between a small
          number of named adaptation points. A grid that re-specifies
          itself at every breakpoint is four layouts wearing one
          class name.
        </p>

        <h3>Subgrids and the Alignment Promise</h3>
        <p>
          Nested content keeps the promise with CSS subgrid: a card
          whose internal rows align to the page grid&apos;s rows, so a
          row of cards with different title lengths still aligns their
          actions. Where subgrid support is unavailable, the fallback is
          the old craft rule—equal-height flex items with pinned
          footers—because the alignment promise predates the property
          that makes it free.
        </p>

        <h3>When Not to Grid</h3>
        <p>
          Grids are for <em>regular</em> structure—repeated items,
          tabular relationships, aligned regions. Editorial layouts,
          reading flows, and exploratory spaces want the container and
          flow discipline from the layout foundation instead. Forcing a
          12-column grid onto an essay produces margins with no job.
        </p>
      </>
    ),
  },
  {
    type: 'system-roles',
    id: 'system-roles',
    title: 'System Roles: Where Grid Decisions Land',
    order: 5,
    content: (
      <>
        <h3>Design Impact</h3>
        <p>
          Designers own the column spans and the density judgment: what
          spans 12 vs 8 vs 6, when a 2-up becomes a 3-up, and how much
          gutter a given content weight needs. The Figma counterpart is
          layout grids with the same column counts and spacing-scale
          gutters, applied to frames rather than drawn per screen.
        </p>
        <h3>Engineering Impact</h3>
        <p>
          Engineers own the implementation contract: CSS Grid with{' '}
          <code>repeat(12, 1fr)</code> and spacing-scale gaps, spans via
          utility or scoped classes, subgrid where alignment demands
          it—and no resurrected float or percentage-padding skeletons
          from earlier CSS eras.
        </p>
        <h3>Accessibility Impact</h3>
        <p>
          Accessibility owns reading order and reflow: DOM order equals
          visual order (grids make re-ordering seductive and screen
          readers follow the DOM), and the 320px single-column reflow
          guarantee from the layout foundation applies to every grid
          layout. A grid that only works at 12 columns is a zoom-mode
          failure.
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
          In the design tool, the grid shows up as frame-level layout
          grids—4/8/12 columns by breakpoint, gutters typed from the
          spacing scale—and components drawn to snap. The comp-review
          vocabulary is span-based: &quot;this is an 8-span with a 4-span
          aside&quot; is a sentence both sides can implement, because
          spans are arithmetic on shared structure.
        </p>
        <p>
          The design-side trap to name in review: elements that are{' '}
          <em>almost</em> on the grid—offset by half a gutter, sized to
          the wrong fraction. Either it is on the structure or it is
          floating decoration; &quot;close&quot; is the drift that kills
          the promise.
        </p>
      </>
    ),
    codeContent: (
      <>
        <p>
          In code, the grid is three token references and one CSS Grid
          declaration:
        </p>
        <pre>
          <code>{`/* The system grid, composed from existing tokens */
.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--core-spacing-size-04, 8px);   /* phone gutter */
  padding-inline: var(--core-spacing-size-06, 16px);
}

@media (width >= var(--core-dimension-breakpoint-md, 768px)) {
  .grid {
    grid-template-columns: repeat(8, 1fr);
    gap: var(--core-spacing-size-06, 16px);
  }
}

@media (width >= var(--core-dimension-breakpoint-lg, 1024px)) {
  .grid {
    grid-template-columns: repeat(12, 1fr);
    gap: var(--core-spacing-size-06, 16px);
    max-width: var(--core-layout-container-lg, 1024px);
    margin-inline: auto;
  }
}

/* Spans are the only per-layout decision */
.span-8 { grid-column: span 8; }
.span-6 { grid-column: span 6; }`}</code>
        </pre>
        <p>And the alignment promise, kept with subgrid:</p>
        <pre>
          <code>{`.cards { display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--core-spacing-size-06, 16px); }

.card { display: grid;
  grid-template-rows: subgrid;      /* card rows align across cards */
  grid-row: span 3; }               /* title / body / actions */`}</code>
        </pre>
      </>
    ),
  },
  {
    type: 'applied-example',
    id: 'applied-example',
    title: 'Applied Example: A Search Results Page',
    order: 7,
    content: (
      <>
        <p>
          Compose a grid-heavy page—search results with filters—entirely
          from shared structure:
        </p>
        <ol>
          <li>
            <strong>Structural grid:</strong> at <code>lg</code>, a
            12-column grid with the filters as a 3-span and results as a
            9-span, 16px gutter. Below <code>md</code>, filters collapse
            into a disclosure above a 4-column result grid.
          </li>
          <li>
            <strong>Card grid inside the 9-span:</strong>{' '}
            <code>auto-fill</code> with <code>minmax(280px, 1fr)</code>{' '}
            so card count follows available width without new
            breakpoints—the card grid adapts continuously inside the
            discrete structural one.
          </li>
          <li>
            <strong>Alignment via subgrid:</strong> three-row cards
            (title, snippet, metadata) share rows, so actions align
            regardless of snippet length.
          </li>
          <li>
            <strong>Reading order:</strong> filters come after the
            results in the DOM and are placed visually with grid
            placement—screen reader users hit results first, which is
            the correct priority, and the visual order is a styling
            fact, not a DOM fact.
          </li>
          <li>
            <strong>Reflow proof:</strong> at 320px everything is one
            column, filters collapsed, cards full-width—the same
            guarantee every layout in the system carries.
          </li>
        </ol>
        <p>
          Zero new values; one convention; every number already named in
          a token file. That is what composing a foundation means.
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
            <strong>Fixed column counts vs fluid spans:</strong> 4/8/12
            is coarse; fully fluid spans adapt more but stop being a
            shared language—no one can say what spans what. The system
            takes discrete structure with fluid inside.
          </li>
          <li>
            <strong>Shared gutters vs per-context gutters:</strong> one
            gutter scale keeps card gaps and page margins rhyming; teams
            that want airier section spacing should step the spacing
            token, not fork the grid.
          </li>
          <li>
            <strong>Grid placement vs DOM order:</strong> visual
            re-ordering is free with grid and costs accessibility if the
            DOM disagrees; the rule (DOM = reading order) makes the
            flexibility safe.
          </li>
          <li>
            <strong>Subgrid vs fallbacks:</strong> subgrid buys perfect
            cross-card alignment where supported; the flex fallback is
            more code for less guarantee. Choose per how much the
            alignment promise matters to the pattern.
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'grid-pitfalls',
    title: 'Common Pitfalls & Failure Modes',
    order: 8.5,
    content: (
      <>
        <h3>1. Off-grid offsets</h3>
        <pre>
          <code>{`/* ❌ Half-gutter drift breaks the alignment promise */
.card { margin-left: 8px; }
/* ✅ On the structure or in a named gutter */`}</code>
        </pre>
        <h3>2. Breakpoint-per-layout grids</h3>
        <pre>
          <code>{`/* ❌ A new grid definition at every query */
@media (width >= 900px) { .grid { grid-template-columns: repeat(10, 1fr); } }
/* ✅ The tokenized steps only; fluid inside */`}</code>
        </pre>
        <h3>3. Sliver columns on small screens</h3>
        <pre>
          <code>{`/* ❌ 12 columns on a phone */
.phoneGrid { grid-template-columns: repeat(12, 1fr); }
/* ✅ Column count steps down with the viewport */
.phoneGrid { grid-template-columns: repeat(4, 1fr); }`}</code>
        </pre>
        <h3>4. DOM order diverging from visual order</h3>
        <pre>
          <code>{`/* ❌ Pretty for eyes, scrambled for screen readers */
.results { order: 2; } .filters { order: 1; }
/* ✅ DOM carries reading order; grid placement is styling */`}</code>
        </pre>
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
            <strong>Layout</strong> — containers, measure, and the
            breakpoint scale this grid composes (
            <code>/blueprints/foundations/layout</code>)
          </li>
          <li>
            <strong>Spacing &amp; Sizing</strong> — where the gutters
            come from (<code>/blueprints/foundations/spacing</code>)
          </li>
          <li>
            <strong>CSS Grid Layout (MDN)</strong> — the platform
            features this system uses (
            <code>https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout</code>
            )
          </li>
          <li>
            <strong>The sources</strong> —{' '}
            <code>ui/designTokens/core/layout.tokens.json</code>,{' '}
            <code>ui/designTokens/core/dimension.tokens.json</code>,{' '}
            <code>ui/designTokens/core/spacing.tokens.json</code>
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
    id: 'tokenized-structure',
    label: 'Grids compose only tokenized breakpoints, containers, and gutters',
    description: 'No magic viewport numbers or literal gutters',
    required: true,
  },
  {
    id: 'column-convention',
    label: 'Column counts follow the 4/8/12 convention',
    description: 'Structure is discrete; behavior is fluid inside it',
    required: true,
  },
  {
    id: 'dom-order',
    label: 'DOM order equals reading order',
    description: 'Grid placement is styling, never information architecture',
    required: true,
  },
  {
    id: 'reflow-single-column',
    label: 'Grid layouts reflow to one column at 320px',
    description: 'The zoom and reflow guarantee extends to grids',
    required: false,
  },
];

content.assessmentPrompts = [
  {
    question:
      'Design a 3-up feature grid that must become 2-up on tablets and 1-up on phones. Write the spans, the breakpoints you would touch, and why auto-fill might remove one of those queries entirely.',
    type: 'application',
  },
  {
    question:
      'A teammate "fixed" misaligned cards by nudging one with a negative margin. What promise did the grid make, what did the nudge break, and what is the structural repair?',
    type: 'reflection',
  },
];

content.crossReferences = {
  concepts: [
    {
      slug: 'layout',
      title: 'Layout Foundations',
      description: 'Containers and breakpoints this grid composes from',
      type: 'foundation',
    },
    {
      slug: 'spacing',
      title: 'Spacing & Sizing Foundations',
      description: 'The scale the gutters and margins come from',
      type: 'foundation',
    },
    {
      slug: 'tokens',
      title: 'Design Tokens',
      description: 'The architecture all grid inputs live in',
      type: 'foundation',
    },
  ],
  components: [],
  glossary: ['12', '21', '19'],
};

export const metadata = generateFoundationMetadata(pageMetadata);

export default function GridPage() {
  return <FoundationPage content={content} />;
}
