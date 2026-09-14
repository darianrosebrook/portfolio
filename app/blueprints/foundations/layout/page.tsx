/**
 * Foundation: Layout
 * How tokenized containers, breakpoints, and flow patterns give structure
 * to responsive design without per-screen improvisation.
 */

import type {
  FoundationPageMetadata,
  FoundationSection,
} from '@/types/foundationContent';
import { generateFoundationMetadata } from '@/utils/metadata/foundationMetadata';
import { createFoundationContent } from '../_lib/contentBuilder';
import { FoundationPage } from '../_lib/pageWrapper';

const pageMetadata: FoundationPageMetadata = {
  title: 'Layout Foundations',
  description:
    'Structure responsive interfaces with tokenized containers, breakpoint scales, and flow patterns: how width, reading measure, and adaptation points become system decisions instead of per-screen guesses.',
  slug: 'layout',
  canonicalUrl: 'https://darianrosebrook.com/blueprints/foundations/layout',
  published_at: new Date().toISOString(),
  modified_at: new Date().toISOString(),
  image: 'https://darianrosebrook.com/darianrosebrook.jpg',
  keywords: 'layout, containers, breakpoints, responsive design, flow',
  learning: {
    learning_level: 'foundation',
    role_relevance: ['design', 'engineering'],
    prerequisites: ['tokens', 'spacing'],
    next_units: ['grid', 'icons'],
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
    expertise: ['Design Systems', 'Layout', 'Responsive Design'],
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
          Layout is where design systems quietly die. Color and typography
          degrade gracefully when improvised; layout does not—every ad-hoc
          container width and magic breakpoint compounds into a product that
          behaves differently at every size, and no one can predict where it
          breaks. Tokenizing layout means the interface&apos;s structural
          decisions—how wide content may grow, where adaptation happens, how
          flows re-order—have names, owners, and review.
        </p>
        <p>
          The second reason is harder to see: layout tokens encode
          <em>usability research</em>, not just taste. The width where a line of
          body text stops being comfortable, the viewport where a two-pane
          workspace stops working, the measure that keeps reading
          effortless—these are findings. When they live in tokens, the product
          inherits them everywhere; when they live in per-screen CSS, every new
          screen re-runs the experiment with worse data.
        </p>
        <p>
          This page covers layout as structured in this repository:{' '}
          <code>layout.container</code> widths, the{' '}
          <code>dimension.breakpoint</code> scale, control sizing composed from
          spacing, and the flow patterns that hold it together.
        </p>
      </>
    ),
  },
  {
    type: 'core-concepts',
    id: 'core-concepts',
    title: 'Core Concepts: Containers, Breakpoints, Measure, Flow',
    order: 4,
    content: (
      <>
        <h3>Containers Set the Walls</h3>
        <p>
          The core layer defines five content widths in{' '}
          <code>ui/designTokens/core/layout.tokens.json</code>:
        </p>
        <pre>
          <code>{`// layout.container (values)
sm: 640px   md: 768px   lg: 1024px   xl: 1280px   xxl: 1536px`}</code>
        </pre>
        <p>
          A container token answers one question:{' '}
          <em>how wide may content grow here?</em> Pages pick a container the
          way components pick a variant—by content type, not by viewport greed.
          Long-form reading wants a narrow container; data tables want a wide
          one; dashboards want the widest. The token exists so that
          &quot;article width&quot; is one decision made once, not a{' '}
          <code>max-width</code> re-chosen per page.
        </p>

        <h3>Breakpoints Mark Adaptation Points</h3>
        <p>
          Breakpoints are a different scale with a different job—where the
          <em>structure</em> changes—and they live in{' '}
          <code>dimension.tokens.json</code>:
        </p>
        <pre>
          <code>{`// dimension.breakpoint (values)
sm: 640px   md: 768px   lg: 1024px   xl: 1440px
xxl: 1536px  xxxl: 1920px`}</code>
        </pre>
        <p>
          Note the deliberate asymmetry: <code>breakpoint.xl</code> is 1440px
          while <code>container.xl</code> is 1280px. They are not misaligned by
          accident—containers cap content width at a readable measure, while
          breakpoints fire structural changes at viewport widths where layouts
          actually need to reorganize. Collapsing them into one scale is the
          classic error: it forces reading widths to jump whenever structure
          does. Two scales, two jobs.
        </p>
        <p>
          The working rule for both: breakpoints are mobile-first{' '}
          <code>min-width</code> boundaries, and a layout that needs more than
          three of them is usually doing the wrong kind of adapting—discrete
          jumps where continuous flow would serve better.
        </p>

        <h3>Measure Is a Reading Constraint</h3>
        <p>
          Between container and breakpoint sits the typographic concern that
          justifies both: line length. Comfortable reading measure is roughly
          45–75 characters; the container scale&apos;s values keep body text
          inside that range at each step when paired with the typography scale.
          This is why container widths are system decisions—squeeze the measure
          and comprehension drops measurably; stretch it and eye return-saccades
          fatigue the reader. A container token is a usability floor expressed
          as a width.
        </p>

        <h3>Controls Compose from Spacing</h3>
        <p>
          Layout&apos;s smallest unit—the control—gets its structure from the
          spacing scale, not its own numbers. The semantic layer composes it
          explicitly through <code>control.size</code>:
        </p>
        <pre>
          <code>{`// ui/designTokens/semantic/control.tokens.json (excerpt)
"control": {
  "size": {
    "sm": { "height": "{spacing.size.07}",      /* 24px */
           "paddingX": "{spacing.size.03}",
           "paddingY": "{spacing.size.02}" },
    "md": { "height": "{spacing.size.08}",      /* 32px */
           "paddingX": "{spacing.size.04}",
           "paddingY": "{spacing.size.03}" },
    "lg": { "height": "{spacing.size.09}",      /* 48px */
           "paddingX": "{spacing.size.06}" }
  }
}`}</code>
        </pre>
        <p>
          Control heights are spacing steps (24/32/48), which is why rows of
          controls align with the gaps around them: everything is arithmetic on
          one scale. The 48px large control also pairs with the accessibility
          floor—<code>tapTargetMin</code> at 44px fits inside it without
          pseudo-element extension.
        </p>

        <h3>Flow Over Position</h3>
        <p>
          The system&apos;s layout defaults are flow-based: block flow, flex
          row/column, and CSS grid—never absolute positioning for document
          content. Flow layouts reflow at breakpoints by changing{' '}
          <em>direction and wrapping</em>, not by re-specifying coordinates.
          That constraint is what makes a tokenized system responsive at all: a
          layout expressed as flow plus container plus a few breakpoint
          overrides adapts continuously between the discrete adaptation points.
        </p>
      </>
    ),
  },
  {
    type: 'system-roles',
    id: 'system-roles',
    title: 'System Roles: Where Layout Decisions Land',
    order: 5,
    content: (
      <>
        <h3>Design Impact</h3>
        <p>
          Designers own the container choice per content type and the
          re-organization at each breakpoint—the wireframe-level decisions of
          what stacks, what wraps, what hides. The Figma counterpart is
          auto-layout with the same scale values, so a frame&apos;s constraints
          and the CSS that implements them are the same statement.
        </p>
        <h3>Engineering Impact</h3>
        <p>
          Engineers own the plumbing: container utilities reading{' '}
          <code>layout.container.*</code>, media and container queries keyed to{' '}
          <code>dimension.breakpoint.*</code>, and the discipline that new
          structural CSS lands as flow changes, not coordinate overrides.
        </p>
        <h3>Accessibility Impact</h3>
        <p>
          Accessibility owns the reflow guarantee: at 400% zoom (a 320px
          effective viewport), content must reflow to a single column without
          horizontal scrolling—WCAG 1.4.10. Breakpoints and containers make that
          testable: if the layout only works above 768px, the token scale has
          been bypassed somewhere.
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
          In the design tool, layout tokens appear as named frame widths and
          constraint sets: article frames at the reading container, table frames
          at the wide one, and auto-layout gaps drawn from the spacing scale.
          The designer-facing rule mirrors code: pick a container by content
          type, let frames fill it, and express responsive behavior as re-flow
          constraints rather than re-positioned copies per breakpoint.
        </p>
        <p>
          The review question that keeps the two sides synchronized: &quot;which
          container is this?&quot;—the same shape as &quot;which token is this
          color?&quot; A layout that cannot name its container is a layout the
          system cannot vouch for.
        </p>
      </>
    ),
    codeContent: (
      <>
        <p>
          In code, containers and breakpoints emit as core custom properties and
          are consumed through media queries and container queries:
        </p>
        <pre>
          <code>{`/* Generated: --core-layout-container-lg: 1024px; etc. */

.page {
  width: 100%;
  max-width: var(--core-layout-container-lg, 1024px);
  margin-inline: auto;
  padding-inline: var(--core-spacing-size-06, 16px);
}

/* Structural adaptation at the tokenized points, mobile-first */
.sidebarLayout { display: grid; gap: var(--core-spacing-size-07); }

@media (width >= var(--core-dimension-breakpoint-lg, 1024px)) {
  .sidebarLayout {
    grid-template-columns: 240px 1fr;
    gap: var(--core-spacing-size-08);
  }
}`}</code>
        </pre>
        <p>
          Container queries take the pattern one step further—components that
          adapt to their <em>container</em> rather than the viewport stop caring
          where they are dropped:
        </p>
        <pre>
          <code>{`.cardHost { container-type: inline-size; }

/* The card reflows by its own width, not the screen's */
.card { display: grid; gap: var(--core-spacing-size-04); }

@container (width >= 480px) {
  .card { grid-template-columns: auto 1fr; }
}`}</code>
        </pre>
      </>
    ),
  },
  {
    type: 'applied-example',
    id: 'applied-example',
    title: 'Applied Example: An Article Page That Reflows',
    order: 7,
    content: (
      <>
        <p>
          Ship one layout end to end: an article page with a title, body, and a
          related-links rail.
        </p>
        <ol>
          <li>
            <strong>Pick the container by content:</strong> long-form reading →
            the reading container ( <code>layout.container.md</code>, 768px
            keeps body text in measure). Not the viewport, not the widest wall
            available.
          </li>
          <li>
            <strong>Flow first:</strong> title, body, and rail all in block flow
            with spacing-scale gaps. On small screens this is already the
            correct layout—nothing to override.
          </li>
          <li>
            <strong>One structural breakpoint:</strong> at{' '}
            <code>dimension.breakpoint.lg</code> (1024px), the rail moves beside
            the body as a two-column grid. The article&apos;s reading column
            keeps its measure because the grid&apos;s content column, not the
            container, caps the prose width.
          </li>
          <li>
            <strong>Prove reflow:</strong> at 320px effective width the page is
            single-column, no horizontal scroll—WCAG 1.4.10 holds because every
            structural rule was a flow change.
          </li>
          <li>
            <strong>Reuse check:</strong> the same rail component dropped into a
            dashboard (wide container) adapts via its own container query,
            untouched.
          </li>
        </ol>
        <p>
          The whole page is three token references, one breakpoint, and flow.
          That is what a layout system buys: pages assembled from decisions
          already made.
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
            <strong>Fixed container steps vs fluid width:</strong> five
            container widths are predictable and readable but never perfectly
            fill odd viewports; fully fluid layouts fill everything and control
            nothing. The compromise here is fluid-below, capped-above: content
            is 100% wide until its container token caps it.
          </li>
          <li>
            <strong>Six breakpoints vs component-driven adaptation:</strong>{' '}
            page-level breakpoints are simple and coarse; container queries are
            precise but shift testing burden onto every host context. The system
            uses both deliberately: breakpoints for page structure, container
            queries inside components.
          </li>
          <li>
            <strong>Two width scales vs one:</strong> keeping containers and
            breakpoints separate doubles the vocabulary but lets reading measure
            and structural change vary independently—the 1280/1440 xl divergence
            is a feature.
          </li>
          <li>
            <strong>Flow discipline vs pixel control:</strong> refusing absolute
            positioning sacrifices pixel-perfect art direction for reflow
            guarantees. Escapes exist (decorative overlays) but are content-free
            by rule.
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'layout-pitfalls',
    title: 'Common Pitfalls & Failure Modes',
    order: 8.5,
    content: (
      <>
        <h3>1. Magic viewport numbers</h3>
        <pre>
          <code>{`/* Bad: A breakpoint nobody approved */
@media (width >= 1180px) { ... }

/* Good: The tokenized scale */
@media (width >= var(--core-dimension-breakpoint-xl, 1440px)) { ... }`}</code>
        </pre>
        <p>
          Off-scale breakpoints fragment testing: every magic number is a size
          nobody checked for reflow, zoom, or overlap.
        </p>
        <h3>2. Container greed</h3>
        <pre>
          <code>{`/* Bad: Everything stretches to the viewport */
.article { max-width: 100%; }

/* Good: Content type picks the container */
.article { max-width: var(--core-layout-container-md, 768px); }`}</code>
        </pre>
        <h3>3. Positioning document content</h3>
        <pre>
          <code>{`/* Bad: Coordinates for content */
.heroTitle { position: absolute; top: 120px; left: 60px; }

/* Good: Flow + spacing; overlays stay decorative */
.heroStack { display: grid; gap: var(--core-spacing-size-06); }`}</code>
        </pre>
        <h3>4. Re-specifying layouts per breakpoint</h3>
        <p>
          When each breakpoint rewrites the layout instead of adjusting flow,
          every size is a new layout to test and drift is guaranteed. The repair
          is the same as color&apos;s: express the layout once in flow, adapt
          with the minimum override.
        </p>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'layout-health-metrics',
    title: 'Layout System Health Metrics',
    order: 8.75,
    content: (
      <>
        <p>
          Layout health is auditable from the stylesheets alone—no rendering
          required for the first two signals:
        </p>

        <h3>Signal 1: Breakpoint discipline</h3>
        <ul>
          <li>
            <strong>Healthy:</strong> every <code>@media</code> width condition
            references a tokenized breakpoint; a grep for <code>@media</code>{' '}
            plus raw pixel values returns only the token fallbacks.
          </li>
          <li>
            <strong>Warning:</strong> one or two magic numbers survive
            (&quot;the 1180px hero&quot;), each an untested size that will
            surprise a future viewport.
          </li>
          <li>
            <strong>Critical:</strong> media queries outnumber token
            references—the layout re-specifies itself per size, and each query
            is a layout nobody reviews.
          </li>
        </ul>

        <h3>Signal 2: Flow integrity</h3>
        <ul>
          <li>
            <strong>Healthy:</strong> document content is positioned by flow and
            grid only; absolute positioning appears exclusively in decorative
            overlays and the hit-area pseudo-elements.
          </li>
          <li>
            <strong>Warning:</strong> coordinate patches accumulate on one
            screen—each an apology for a flow that almost worked.
          </li>
          <li>
            <strong>Critical:</strong> content blocks with hard coordinates; the
            reflow guarantee is already broken, and zoom mode is the next place
            it will be discovered.
          </li>
        </ul>

        <h3>Signal 3: Reflow proof</h3>
        <ul>
          <li>
            <strong>Healthy:</strong> the e2e walk at 320px effective width
            shows single-column, no horizontal scroll, on every template; the
            WCAG 1.4.10 guarantee is a test, not a hope.
          </li>
          <li>
            <strong>Warning:</strong> reflow holds on marketing pages but fails
            in app surfaces (tables, toolbars)— exactly where density tempts
            shortcuts.
          </li>
          <li>
            <strong>Critical:</strong> any horizontally scrolling content at the
            floor width—an immediate defect with a criterion number attached.
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'layout-migration',
    title: 'Migration Strategy: From Positioning to Flow',
    order: 8.9,
    content: (
      <>
        <p>
          Layout migrations change behavior more visibly than spacing ones, so
          the strategy front-loads safety:
        </p>
        <ol>
          <li>
            <strong>Inventory the coordinates:</strong> every{' '}
            <code>position: absolute/fixed</code> on content, every fixed width
            on text containers, every magic media query. Tag each: decorative
            (keep), hit-area (keep), content (migrate).
          </li>
          <li>
            <strong>Rebuild in flow beside the original:</strong> for each
            migrated screen, construct the flow/grid version behind a flag;
            screenshot-diff against the original at the tokenized
            breakpoints—rebuilding in place and &quot;fixing later&quot; is how
            layouts regress silently.
          </li>
          <li>
            <strong>Adopt the two-scale rule:</strong> containers by content
            type (the named widths), structure changes only at tokenized
            breakpoints; the audit from step 1 tells you which magic numbers
            were secretly each of these.
          </li>
          <li>
            <strong>Prove reflow before cutover:</strong> the 320px walk on the
            new version is the exit criterion—a migration that ships without
            reflow proof has traded visible drift for invisible exclusion.
          </li>
          <li>
            <strong>Flip the flag per surface:</strong> each screen&apos;s
            cutover is independently revertible; the coordinate version is
            deleted only when its surface has been stable through a review
            cycle.
          </li>
        </ol>
      </>
    ),
  },
  {
    type: 'applied-example',
    id: 'layout-case-studies',
    title: 'Real-World Case Studies',
    order: 8.98,
    content: (
      <>
        <h3>Case 1: The landing page that couldn&apos;t zoom</h3>
        <p>
          A hero built on absolute coordinates looked flawless at 1440px and
          shattered at 400% browser zoom—the three-column text became a
          20px-wide strip. The rebuild was the flow version this page teaches:
          grid with a measure-capped column, one structural breakpoint,
          container queries for the reusable badge row. The visual result was
          pixel-similar at every designed size and reflowed below them; the
          accessibility finding closed with the commit.
        </p>
        <h3>Case 2: The two scales that got merged</h3>
        <p>
          A team &quot;simplified&quot; by pointing <code>container.xl</code> at
          the breakpoint value (1440px) so one number ruled both. Within a
          quarter, reading pages showed 90-character lines—the container was
          following structure instead of measure, exactly the collapse the
          two-scale rule exists to prevent. The restore was one value; the
          lesson was the rule&apos;s rationale surviving contact with a real
          codebase.
        </p>
        <h3>Case 3: The sidebar that hid from keyboards</h3>
        <p>
          A visually-ordered layout (sidebar first) was built by re-ordering the
          DOM to match a sketch; screen reader users got navigation before
          content on every page, and the e2e reading-order check flagged the
          divergence. Grid placement restored the correct DOM order with the
          same pixels—styling reclaimed its job from structure.
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
            <strong>Grid Systems</strong> — columns and gutters built on these
            containers and breakpoints (
            <code>/blueprints/foundations/grid</code>)
          </li>
          <li>
            <strong>Spacing &amp; Sizing</strong> — the scale that control sizes
            and gaps compose from (<code>/blueprints/foundations/spacing</code>)
          </li>
          <li>
            <strong>WCAG 1.4.10 reflow</strong> — the 320px reflow requirement (
            <code>https://www.w3.org/WAI/WCAG21/Understanding/reflow.html</code>
            )
          </li>
          <li>
            <strong>The sources</strong> —{' '}
            <code>ui/designTokens/core/layout.tokens.json</code>,{' '}
            <code>ui/designTokens/core/dimension.tokens.json</code>,{' '}
            <code>ui/designTokens/semantic/control.tokens.json</code>
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
    id: 'container-named',
    label: 'Every page layout names its container token',
    description: 'Content type chooses the width, not viewport greed',
    required: true,
  },
  {
    id: 'breakpoints-tokenized',
    label: 'Media queries use only tokenized breakpoints',
    description: 'No magic viewport numbers in styles',
    required: true,
  },
  {
    id: 'reflow-holds',
    label: 'Content reflows to one column at 320px effective width',
    description: 'WCAG 1.4.10; flow-based structure makes it testable',
    required: true,
  },
  {
    id: 'flow-first',
    label: 'Document content is positioned by flow, not coordinates',
    description: 'Absolute positioning is reserved for decorative overlays',
    required: false,
  },
];

content.assessmentPrompts = [
  {
    question:
      'A marketing page wants full-bleed imagery with a fixed 1200px text column, and the team proposes adding a 1200px breakpoint. What does the container scale say instead, and why are the two scales allowed to disagree at xl?',
    type: 'application',
  },
  {
    question:
      'Your component works in the dashboard but breaks when reused in the article sidebar. Which layout mechanism was likely missing, and how would the tokenized system have prevented it?',
    type: 'reflection',
  },
  {
    question:
      'Audit one screen against the three health signals. Which signal degrades first in your codebase, and what does that predict about the first zoom-mode complaint you will receive?',
    type: 'reflection',
  },
];

content.crossReferences = {
  concepts: [
    {
      slug: 'spacing',
      title: 'Spacing & Sizing Foundations',
      description: 'The scale that control sizes and layout gaps compose from',
      type: 'foundation',
    },
    {
      slug: 'grid',
      title: 'Grid Systems',
      description:
        'Column structures built on these containers and breakpoints',
      type: 'foundation',
    },
    {
      slug: 'tokens',
      title: 'Design Tokens',
      description: 'The architecture the layout and dimension scales live in',
      type: 'foundation',
    },
  ],
  components: [],
  glossary: ['21', '19', '12'],
};

export const metadata = generateFoundationMetadata(pageMetadata);

export default function LayoutPage() {
  return <FoundationPage content={content} />;
}
