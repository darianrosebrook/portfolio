import Link from 'next/link';

export const metadata = {
  title: 'Designing with Layers | Component Standards',
  description:
    'A systems approach to components: primitives → compounds → composers → assemblies, with meta-patterns and case studies.',
  keywords: [
    'Design System',
    'Layered Components',
    'Primitives',
    'Compounds',
    'Composers',
    'Assemblies',
  ],
};

export default function Page() {
  return (
    <section>
      <article className="content">
        <h1>Designing with Layers: A Systems Approach to Components</h1>
        <p>
          When design systems first take root, they begin with components:
          buttons, inputs, icons, toggles. The goal is consistency, but
          consistency alone doesn’t explain why complexity creeps in. Over time,
          you notice the neat catalog breaks down: forms behave differently
          across contexts, toolbars overflow with actions, editors sprout
          feature walk-throughs, and pagination mutates with ellipses and
          compact modes.
        </p>
        <p>
          The problem isn’t that your system is &quot;messy.&quot; The problem
          is that you’re seeing composition at work. Complexity in digital
          interfaces rarely comes from primitives themselves—it emerges when
          small parts are combined, orchestrated, and pushed against application
          workflows.
        </p>
        <p>
          To build systems that endure, you need a lens that helps you
          anticipate this layering before it manifests in code. That’s what the
          layered component methodology provides: a way to classify, compose,
          and govern components across four levels of scale.
        </p>
        <h2>The Four Layers of Components</h2>
        <h3>
          1.{' '}
          <Link href="/blueprints/component-standards/component-complexity/primitives">
            Primitives
          </Link>
        </h3>
        <p>
          Primitives are the ground floor: irreducible building blocks like
          buttons, text inputs, checkboxes, icons, and typographic elements.
          Their goals are stability, accessibility, and consistency. They should
          be as &quot;boring&quot; as possible.
        </p>
        <p> Examples: </p>
        <ul>
          <li>Button, Input, Checkbox, Icon</li>
        </ul>
        <p>Work of the system:</p>
        <ul>
          <li>naming, tokens, accessibility patterns</li>
        </ul>
        <p>Pitfalls:</p>
        <ul>
          <li>
            bloated props, reinventing label or error logic inside each input
          </li>
        </ul>
        <p>
          <Link href="/blueprints/component-standards/component-complexity/primitives">
            → Deep dive into Primitives
          </Link>
        </p>

        <h3>
          2.{' '}
          <Link href="/blueprints/component-standards/component-complexity/compound">
            Compounds
          </Link>
        </h3>
        <p>
          Compounds bundle{' '}
          <Link href="/blueprints/component-standards/component-complexity/primitives">
            primitives
          </Link>{' '}
          into predictable, reusable groupings. They codify conventions and
          reduce repeated decision-making.
        </p>
        <p>Examples:</p>
        <ul>
          <li>TextField (input + label + error), TableRow, Card</li>
        </ul>
        <p>Work of the system:</p>
        <ul>
          <li>defining which sub-parts exist, providing safe variations</li>
        </ul>
        <p>Pitfalls:</p>
        <ul>
          <li>
            &quot;mega-props&quot; that attempt to account for every variation
          </li>
        </ul>
        <p>
          <Link href="/blueprints/component-standards/component-complexity/compound">
            → Deep dive into Compounds
          </Link>
        </p>

        <h3>
          3.{' '}
          <Link href="/blueprints/component-standards/component-complexity/composer">
            Composers
          </Link>
        </h3>
        <p>
          Composers orchestrate state, interaction, and context across multiple
          children. This is where systems meet complexity: modals, toolbars,
          message composers, pagination. They often contain{' '}
          <Link href="/blueprints/component-standards/component-complexity/compound">
            compounds
          </Link>{' '}
          and{' '}
          <Link href="/blueprints/component-standards/component-complexity/primitives">
            primitives
          </Link>
          .
        </p>
        <p>Examples:</p>
        <ul>
          <li>
            Modal, Form Field (with label/error orchestration), Toolbar,
            Pagination, Rich Text Editor
          </li>
        </ul>
        <p>Work of the system:</p>
        <ul>
          <li>
            governing orchestration, exposing slots, avoiding prop explosion
          </li>
        </ul>
        <p>Pitfalls:</p>
        <ul>
          <li>
            burying orchestration in ad-hoc props instead of a clear context
            model
          </li>
        </ul>
        <p>
          <Link href="/blueprints/component-standards/component-complexity/composer">
            → Deep dive into Composers
          </Link>
        </p>

        <h3>
          4.{' '}
          <Link href="/blueprints/component-standards/component-complexity/assemblies">
            Assemblies
          </Link>
        </h3>
        <p>
          Assemblies are application-specific flows encoded as components. They
          aren&apos;t universal system primitives; they&apos;re product
          constructs that use the system's{' '}
          <Link href="/blueprints/component-standards/component-complexity/primitives">
            primitives
          </Link>
          ,{' '}
          <Link href="/blueprints/component-standards/component-complexity/compound">
            compounds
          </Link>
          , and{' '}
          <Link href="/blueprints/component-standards/component-complexity/composer">
            composers
          </Link>
          .
        </p>
        <p>Examples:</p>
        <ul>
          <li>Checkout Flow, Project Board, Analytics Dashboard</li>
        </ul>
        <p>Work of the system:</p>
        <ul>
          <li>provide the building blocks; assemblies live at the app layer</li>
        </ul>
        <p>Pitfalls:</p>
        <ul>
          <li>
            accidentally &quot;baking in&quot; assemblies as universal
            components, which ossifies the system which ossifies the system
          </li>
        </ul>
        <p>
          <Link href="/blueprints/component-standards/component-complexity/assemblies">
            → Deep dive into Assemblies
          </Link>
        </p>

        <h3>Meta-Patterns Across All Layers</h3>
        <p>Regardless of layer, three meta-patterns ensure scalability:</p>
        <ul>
          <li>
            Slotting & Substitution: anticipate replaceable regions (children,
            slots, render props).
          </li>
          <li>
            Headless Abstractions: separate logic (hooks, providers) from
            presentation (styled components).
          </li>
          <li>
            Contextual Orchestration: treat composers as state providers, not
            just visual containers.
          </li>
        </ul>
        <p>
          These aren&apos;t just coding tricks—they&apos;re governance
          strategies. They help a design system resist collapse under
          exceptions.
        </p>
        <h3>Designing with Layers: A Systems Approach to Components</h3>
        <p>(excerpt with added section)</p>
        <h3>Why Composition Matters</h3>
        <p>
          Design systems cannot anticipate every product problem, every variant,
          or every edge case. If they try, they either collapse under prop bloat
          (&quot;yet another boolean for yet another exception&quot;) or grind
          to a halt as every new request funnels through the system team. Both
          outcomes slow teams and erode trust.
        </p>
        <p>
          Composition is the release valve. By leaning into patterns like
          compound components in React, or slotting and substitution at the
          system layer, you give product teams a way to:
        </p>
        <ul>
          <li>
            Use the system a la carte: pull in primitives and compounds without
            committing to a rigid, monolithic API.
          </li>
          <li>
            Insert what they need: slot in custom behavior, add a
            product-specific sub-control, or override presentation while still
            sitting inside the system&apos;s orchestrator.
          </li>
          <li>
            Omit what they don&apos;t: drop optional slots or props that
            aren&apos;t relevant, without violating conventions.
          </li>
          <li>
            Stay unblocked: product timelines aren&apos;t gated by triage
            queues; teams compose from known parts and keep shipping.
          </li>
          <li>
            Adhere where possible: because orchestration is handled by the
            composer (Field, Toolbar, Pagination), the accessibility, ARIA, and
            state management rules are inherited &quot;for free.&quot;
          </li>
        </ul>
        <p>
          This is why composition is a governance strategy, not just a coding
          trick. It creates a continuum: the system team defines boundaries and
          patterns, and product teams compose solutions inside those boundaries
          without waiting for new one-off components.
        </p>
        <h3>Case Studies in Complexity</h3>
        <p>One-Time Passcode Input (Compound → Composer)</p>
        <p>
          What seems like &quot;just six inputs&quot; quickly becomes a
          coordination problem: auto-advancing focus, backspacing, accessibility
          for screen readers. By elevating the &quot;field state&quot; to a
          composer with shared context, you allow each input cell to remain
          simple while the container manages orchestration.
        </p>
        <p>Coachmarks & Product Walkthroughs (Composer)</p>
        <p>
          Onboarding experiences often break system rules because they&apos;re
          built in isolation. A coachmark composer integrates with your Popover
          primitive, tracks step state, and ensures consistent keyboard
          navigation and focus management. This prevents ad-hoc, inaccessible
          walkthroughs.
        </p>
        <p>Skeletons & Spinners (Primitives with Nuance)</p>
        <p>
          Loading indicators are &quot;simple,&quot; but their nuances matter:
          skeletons must respect the shape of the eventual content (text vs
          media vs datavis), and spinners must scale with container context. By
          treating them as tokenized primitives with animation policies, you
          avoid teams inventing divergent loaders.
        </p>
        <p>Form Fields (Composer)</p>
        <p>
          Every control needs a label and error messaging. Instead of
          duplicating logic in each input, a Field composer provides a context:
          labels associate automatically, error messages announce via ARIA, and
          useFieldControl() ensures consistency across text, select, and
          checkbox controls. This is orchestration as governance.
        </p>
        <p>Toolbars & Filter Action Bars (Composer)</p>
        <p>
          Toolbars fail when they&apos;re just a row of buttons. The system
          approach: actions are registered with priorities, measured with
          ResizeObserver, and overflowed into a “More” menu. The composer
          orchestrates roving tabindex and ARIA roles, keeping unknown sets of
          actions consistent with app conventions.
        </p>
        <p>Pagination (Composer)</p>
        <p>
          Pagination looks trivial until totals grow. The composer governs page
          windows, ellipses insertion, compact breakpoints, and cursor mode (for
          unknown totals). By making layout policy explicit, you prevent every
          product from reinventing &quot;pagination rules.&quot;
        </p>
        <p>Rich Text Editor (Composer with Plugins)</p>
        <p>
          The richest example of orchestration: schema, commands, plugins, and
          UI slots (toolbar, bubble, slash, mentions). By isolating the engine
          (ProseMirror, Slate, Lexical) behind a stable API, you give your
          system resilience to vendor shifts. Complexity here is not
          eliminated—it&apos;s governed.
        </p>
        <h3>Why This Matters</h3>
        <p>
          For junior designers, the natural unit of thinking is the screen: what
          needs to be drawn to make this flow work? For system designers, the
          unit shifts to grammar: what are the rules of combination, and how do
          we prepare for emergent complexity?
        </p>
        <ul>
          <li>Primitives demand standards.</li>
          <li>Compounds demand conventions.</li>
          <li>Composers demand orchestration.</li>
          <li>Assemblies demand boundaries.</li>
        </ul>
        <p>Compounds demand conventions.</p>
        <p>Composers demand orchestration.</p>
        <p>Assemblies demand boundaries.</p>
        <p>
          When you apply this layered lens, your system stops being a library of
          parts and becomes a language for products.
        </p>
        <h3>Composition Makes Complexity Manageable</h3>
        <p>
          Complexity is inevitable. The goal isn&apos;t to eliminate it, but to
          channel it into structures that remain legible, maintainable, and
          extensible. Composition makes that channel possible. A button is
          stable. A field is orchestrated. A toolbar overflows gracefully. A
          rich text editor governs the chaos of paste and plugins. And
          crucially: when product teams need something new, they don&apos;t need
          to break the system—they compose with it.
        </p>
        <p>
          By recognizing components not as flat things, but as layered patterns,
          you prepare your system for growth. You teach teams not only what to
          build, but how to think about building—and that&apos;s the difference
          between a component library and a true design system.
        </p>
        <p>
          That&apos;s how a design system grows from a catalog of parts into a
          library for products.
        </p>
      </article>
    </section>
  );
}
