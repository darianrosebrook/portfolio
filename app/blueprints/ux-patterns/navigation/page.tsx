/**
 * UX Pattern: Navigation
 * Wayfinding as a system contract: tabs with their ARIA triad,
 * breadcrumbs as hierarchy made visible, the current-location rule,
 * skip links, and navigation that never exists only in the picture.
 */

import type {
  FoundationPageMetadata,
  FoundationSection,
} from '@/types/foundationContent';
import { generateFoundationMetadata } from '@/utils/metadata/foundationMetadata';
import { createFoundationContent } from '../../foundations/_lib/contentBuilder';
import { FoundationPage } from '../../foundations/_lib/pageWrapper';

const pageMetadata: FoundationPageMetadata = {
  title: 'Navigation Patterns',
  description:
    'Design wayfinding users can trust: tabs with the tablist/tab/tabpanel triad, breadcrumbs that expose hierarchy, an unambiguous current-location rule, skip links for keyboard travelers, and navigation that lives in the DOM, not the screenshot.',
  slug: 'navigation',
  canonicalUrl: 'https://darianrosebrook.com/blueprints/ux-patterns/navigation',
  published_at: new Date().toISOString(),
  modified_at: new Date().toISOString(),
  image: 'https://darianrosebrook.com/darianrosebrook.jpg',
  keywords: 'navigation, tabs, breadcrumbs, wayfinding, skip links',
  learning: {
    learning_level: 'intermediate',
    role_relevance: ['design', 'engineering', 'a11y'],
    prerequisites: ['tokens'],
    next_units: ['dialogs', 'feedback'],
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
    expertise: ['Design Systems', 'Navigation', 'Accessibility'],
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
          Navigation is the interface&apos;s promise about geography:{' '}
          <em>
            you are here, that is there, and this is how the places connect.
          </em>{' '}
          Users metabolize that promise in seconds and then stop thinking about
          it—until a pattern breaks it. The tab that navigates like a link but
          looks like a control. The breadcrumb that names a hierarchy the URL
          disagrees with. The highlighted item that means &quot;where you
          are&quot; on one screen and &quot;where your pointer is&quot; on the
          next.
        </p>
        <p>
          The system treats navigation as a small set of contracts—each declared
          in the component contracts (<code>Tabs</code>,{' '}
          <code>Breadcrumbs</code>, <code>Links</code>) and each testable in the
          accessibility tree, because navigation that only exists visually is
          geography for sighted pointer users and fog for everyone else.
        </p>
      </>
    ),
  },
  {
    type: 'core-concepts',
    id: 'core-concepts',
    title: 'Core Concepts: Tabs, Breadcrumbs, Location, Escape',
    order: 4,
    content: (
      <>
        <h3>Tabs: The ARIA Triad</h3>
        <p>
          Tabs are the most-implemented, most-mangled navigation pattern. The
          contract is a triad— <code>tablist</code>, <code>tab</code>,{' '}
          <code>tabpanel</code>—with wiring between them:
        </p>
        <pre>
          <code>{`<!-- The triad, wired -->
<div role="tablist" aria-label="View">
  <button role="tab" aria-selected="true"
          aria-controls="overview-panel" id="overview-tab">
    Overview
  </button>
  <button role="tab" aria-selected="false"
          aria-controls="history-panel" id="history-tab">
    History
  </button>
</div>
<div role="tabpanel" id="overview-panel"
     aria-labelledby="overview-tab" tabindex="0">…</div>

// Wiring: tab→panel (aria-controls), panel→tab (aria-labelledby),
// state: aria-selected. Keyboard: arrows move BETWEEN tabs,
// Tab moves INTO the panel. The Tabs contract declares all of it.`}</code>
        </pre>
        <p>
          The behavioral rule that separates implementations:
          <strong> tab selection moves with arrow keys, not Tab</strong>—Tab is
          for leaving the widget. And activation follows focus (selection on
          arrow) or precedes it (selection on Enter) by declared convention; the
          system follows the ARIA Authoring Practices&apos; automatic activation
          for small lists, manual for long ones where scrolling past entries
          would be punitive.
        </p>

        <h3>Breadcrumbs: Hierarchy Made Visible</h3>
        <p>
          A breadcrumb is a contract about structure: the trail names the
          ancestors of the current page, in order, with the current page last
          and unlinked. The tree contract:{' '}
          <code>nav aria-label=&quot;Breadcrumb&quot;</code> (parallel navs must
          disambiguate for screen reader rosters), an ordered list, separators
          as decoration (aria-hidden—the screen reader hears the list, not the
          slashes). The deep rule:{' '}
          <em>the trail must match the URL&apos;s truth</em>. A breadcrumb
          invented for wayfinding charm that disagrees with where pages actually
          live is a lie users can click.
        </p>

        <h3>The Current-Location Rule</h3>
        <p>
          Exactly one navigation state means &quot;you are here&quot;:{' '}
          <code>aria-current=&quot;page&quot;</code> for page-level nav,{' '}
          <code>aria-current=&quot;true&quot;</code> for within-page position.
          It is announced by screen readers, styled by the system&apos;s state
          tokens, and— critically—
          <strong>not confused with hover or focus</strong>, which answer
          different questions (&quot;where is your pointer&quot;, &quot;where is
          your keyboard&quot;). Three states, three meanings, one rule each; the
          visual system encodes them at different intensities precisely so the
          channels never collide.
        </p>

        <h3>Skip Links and the Keyboard Traveler</h3>
        <p>
          Every page with repeated chrome owes the keyboard a way past it: the
          skip link, first in the DOM, visible on focus, jumping to main content
          with a real target. This repository&apos;s education template ships
          one— <code>Skip to main content</code> anchored to{' '}
          <code>#main-content</code>—because a keyboard user tabbing through
          thirty nav links on every page is a wayfinding tax sighted pointer
          users never pay.
        </p>
      </>
    ),
  },
  {
    type: 'system-roles',
    id: 'system-roles',
    title: 'System Roles: Owning the Geography',
    order: 5,
    content: (
      <>
        <h3>Design Impact</h3>
        <p>
          Designers own the map truth: information architecture that matches the
          trail, one current-location convention, and nav density decisions (how
          many destinations before grouping).
        </p>
        <h3>Engineering Impact</h3>
        <p>
          Engineers own the wiring: the triad&apos;s attributes, arrow-key
          behavior, <code>aria-current</code> maintained by the router not by
          hand, and parallel navs labeled for the roster.
        </p>
        <h3>Accessibility Impact</h3>
        <p>
          The a11y function owns the roster test: navigating by landmarks and
          nav lists must produce a usable map with no sighted assistance—name,
          order, current.
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
          The design side of navigation is the annotated map: every destination,
          the current-state styling at each level, and the trail&apos;s
          agreement with the IA. The two-hour audit that pays for itself: walk
          the product&apos;s nav states and mark each highlighted item with
          which question it answers—pointer, keyboard, or location. Collisions
          found here are fixed in tokens, not in screenshots.
        </p>
      </>
    ),
    codeContent: (
      <>
        <p>The contracts, as the router maintains them:</p>
        <pre>
          <code>{`// Current location is derived, never hand-set
const isActive = (href) => pathname.startsWith(href);

<Links NavLink href="/blueprints" aria-current={isActive('/blueprints')
  ? 'page' : undefined}>Blueprints</Links>

// The skip link, first in DOM, visible on focus
<a href="#main-content" className={styles.skipLink}>
  Skip to main content
</a>

// Parallel navs disambiguate for the roster
<nav aria-label="Breadcrumb">…</nav>
<nav aria-label="Prerequisites">…</nav>`}</code>
        </pre>
      </>
    ),
  },
  {
    type: 'applied-example',
    id: 'applied-example',
    title: 'Applied Example: A Three-Level Wayfinding System',
    order: 7,
    content: (
      <>
        <p>Assemble the full stack for a documentation area:</p>
        <ol>
          <li>
            <strong>Global nav:</strong> five destinations,{' '}
            <code>aria-current</code> on the active area, the state token
            styling it—density kept low enough that scanning beats remembering.
          </li>
          <li>
            <strong>Breadcrumb:</strong> area → section → page, matching the
            URLs exactly, current page unlinked, separators decorative.
          </li>
          <li>
            <strong>Section tabs:</strong> the ARIA triad wired per the
            contract, arrow-key selection, panels labelled back to their tabs.
          </li>
          <li>
            <strong>Skip link</strong> first in the DOM past the chrome;
            keyboard path to content in one Enter.
          </li>
          <li>
            <strong>Verify:</strong> the roster pass—landmarks plus nav labels
            produce the whole map by listening; the e2e walk asserts{' '}
            <code>aria-current</code> matches the route on every page.
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
            <strong>Nav breadth vs depth:</strong> flat navs scan faster and cap
            out (~7 destinations); grouped navs scale and cost a level of
            thought. The split follows the IA, not the header height.
          </li>
          <li>
            <strong>Automatic vs manual tab activation:</strong> automatic is
            faster for short lists and hostile for long ones; the contract
            declares which and why.
          </li>
          <li>
            <strong>Persistent vs contextual nav:</strong> persistent nav
            preserves orientation and consumes space; contextual (command
            palettes, menus) inverts both. Mature products mix deliberately.
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'navigation-pitfalls',
    title: 'Common Pitfalls & Failure Modes',
    order: 8.5,
    content: (
      <>
        <h3>1. The unwired triad</h3>
        <pre>
          <code>{`<!-- ❌ Roles without the relationships -->
<div role="tab">Overview</div>
<div>…content…</div>
<!-- ✅ aria-controls in, aria-labelledby back, aria-selected true -->`}</code>
        </pre>
        <h3>2. Current-location collisions</h3>
        <p>
          Hover styling at the same intensity as the active item makes
          &quot;here&quot; and &quot;considering&quot; synonyms. Separate
          channels, separate intensities.
        </p>
        <h3>3. The dishonest breadcrumb</h3>
        <p>
          A trail that flatters the IA instead of reflecting the URLs. Fix the
          geography or fix the trail—never let them disagree.
        </p>
        <h3>4. Screenshot navigation</h3>
        <p>
          Menus built in canvas that never made it into the DOM. The roster pass
          finds these in minutes: the map is missing, not the pixels.
        </p>
        <h3>5. Unlabeled parallel navs</h3>
        <p>
          Three <code>nav</code> elements all announcing
          &quot;navigation&quot;—the roster becomes noise. Label every one.
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
            <strong>ARIA APG tabs pattern</strong> — the reference behavior (
            <code>https://www.w3.org/WAI/ARIA/apg/patterns/tabs/</code>)
          </li>
          <li>
            <strong>Grid systems</strong> — the layouts navs organize (
            <code>/blueprints/foundations/grid</code>)
          </li>
          <li>
            <strong>Dialogs &amp; overlays</strong> — the other way surfaces
            move (<code>/blueprints/ux-patterns/dialogs</code>)
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
    id: 'triad-wired',
    label: 'Tabs ship the full triad with wiring both directions',
    description: 'tablist/tab/tabpanel; controls and labelledby; selected',
    required: true,
  },
  {
    id: 'one-current',
    label: 'Exactly one state means current location',
    description: 'aria-current maintained by routing, styled distinctly',
    required: true,
  },
  {
    id: 'trail-honest',
    label: 'Breadcrumbs match the real URL hierarchy',
    description: 'Current page last and unlinked',
    required: true,
  },
  {
    id: 'keyboard-past-chrome',
    label: 'Skip links carry keyboard users past repeated chrome',
    description: 'First in DOM, visible on focus, real target',
    required: false,
  },
];

content.assessmentPrompts = [
  {
    question:
      'Run the roster pass on a product you use: landmarks and nav labels only, no visuals. Could you navigate? Write the missing labels and the collision you found.',
    type: 'application',
  },
  {
    question:
      'Your analytics show users open the command palette even for two-hop navigation the nav supports. What is the nav failing to promise, and which contract would you change first?',
    type: 'reflection',
  },
];

content.crossReferences = {
  concepts: [
    {
      slug: 'accessibility',
      title: 'Accessibility as System Infrastructure',
      description: 'The tree-level wiring navigation lives or dies by',
      type: 'foundation',
    },
    {
      slug: 'layout',
      title: 'Layout Foundations',
      description: 'The flow and order rules navs ride on',
      type: 'foundation',
    },
    {
      slug: 'motion',
      title: 'Motion & Duration Foundations',
      description: 'The hover/enter composites behind nav feedback',
      type: 'foundation',
    },
  ],
  components: [],
  glossary: ['12', '19', '38'],
};

export const metadata = generateFoundationMetadata(pageMetadata);

export default function NavigationPage() {
  return <FoundationPage content={content} />;
}
