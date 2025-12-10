import Link from 'next/link';
import styles from './page.module.scss';

export const metadata = {
  title: 'Designing with Layers | Component Standards',
  description:
    'A systems approach to components: primitives, compounds, composers, and assemblies. Learn how layered component architecture scales design systems.',
  keywords: [
    'Design System',
    'Component Architecture',
    'Layered Components',
    'Primitives',
    'Compounds',
    'Composers',
    'Assemblies',
  ],
};

export default function Page() {
  return (
    <section className="content">
      <article>
        <h1>Designing with Layers</h1>
        <p className={styles.lead}>
          A systems approach to component architecture that anticipates
          complexity before it manifests in code.
        </p>

        <h2>The Problem with Flat Component Libraries</h2>
        <p>
          When design systems first take root, they begin with components:
          buttons, inputs, icons, toggles. The goal is consistency, but
          consistency alone doesn&apos;t explain why complexity creeps in. Over
          time, you notice the neat catalog breaks down: forms behave
          differently across contexts, toolbars overflow with actions, editors
          sprout feature walk-throughs, and pagination mutates with ellipses and
          compact modes.
        </p>
        <p>
          The problem isn&apos;t that your system is &quot;messy.&quot; The
          problem is that you&apos;re seeing{' '}
          <strong>composition at work</strong>. Complexity in digital interfaces
          rarely comes from primitives themselves&mdash;it emerges when small
          parts are combined, orchestrated, and pushed against application
          workflows.
        </p>
        <p>
          To build systems that endure, you need a lens that helps you
          anticipate this layering before it manifests in code. That&apos;s what
          the layered component methodology provides: a way to classify,
          compose, and govern components across four levels of scale.
        </p>

        <h2>The Four Layers</h2>
        <p>
          Each layer represents a different level of complexity, responsibility,
          and governance. Understanding where a component belongs helps teams
          make better decisions about APIs, ownership, and extensibility.
        </p>

        <div className={styles.layerGrid}>
          <div className={styles.layerCard}>
            <span className={styles.layerNumber}>1</span>
            <h3>
              <Link href="/blueprints/component-standards/component-complexity/primitives">
                Primitives
              </Link>
            </h3>
            <p className={styles.layerTagline}>
              The boring building blocks that make everything else possible.
            </p>
            <p>
              Irreducible components like buttons, inputs, checkboxes, and
              icons. Their goals are stability, accessibility, and consistency.
              They should be as &quot;boring&quot; as possible.
            </p>
            <dl>
              <dt>Examples</dt>
              <dd>Button, Input, Checkbox, Icon, Typography</dd>
              <dt>Work of the System</dt>
              <dd>Naming, tokens, accessibility patterns</dd>
              <dt>Watch for</dt>
              <dd>Bloated props, reinventing label or error logic</dd>
            </dl>
            <hr />
            <Link
              href="/blueprints/component-standards/component-complexity/primitives"
              className={styles.layerLink}
            >
              Deep dive into Primitives
            </Link>
          </div>

          <div className={styles.layerCard}>
            <span className={styles.layerNumber}>2</span>
            <h3>
              <Link href="/blueprints/component-standards/component-complexity/compound">
                Compounds
              </Link>
            </h3>
            <p className={styles.layerTagline}>
              Blessed combinations with baked-in conventions.
            </p>
            <p>
              Compounds bundle primitives into predictable, reusable groupings.
              They codify conventions and reduce repeated decision-making across
              teams.
            </p>
            <dl>
              <dt>Examples</dt>
              <dd>TextField, Card, TableRow, Chip, Avatar</dd>
              <dt>Work of the System</dt>
              <dd>Defining which sub-parts exist, providing safe variations</dd>
              <dt>Watch for</dt>
              <dd>&quot;Mega-props&quot; that account for every variation</dd>
            </dl>
            <hr />
            <Link
              href="/blueprints/component-standards/component-complexity/compound"
              className={styles.layerLink}
            >
              Deep dive into Compounds
            </Link>
          </div>

          <div className={styles.layerCard}>
            <span className={styles.layerNumber}>3</span>
            <h3>
              <Link href="/blueprints/component-standards/component-complexity/composer">
                Composers
              </Link>
            </h3>
            <p className={styles.layerTagline}>
              Orchestration of state, interaction, and context.
            </p>
            <p>
              Composers orchestrate state, focus, and behavior across multiple
              children. This is where systems meet complexity: modals, toolbars,
              message composers, pagination.
            </p>
            <dl>
              <dt>Examples</dt>
              <dd>Modal, FormField, Toolbar, Pagination, Rich Text Editor</dd>
              <dt>Work of the System</dt>
              <dd>
                Governing orchestration, exposing slots, avoiding prop explosion
              </dd>
              <dt>Watch for</dt>
              <dd>Burying orchestration in ad-hoc props instead of context</dd>
            </dl>
            <hr />
            <Link
              href="/blueprints/component-standards/component-complexity/composer"
              className={styles.layerLink}
            >
              Deep dive into Composers
            </Link>
          </div>

          <div className={styles.layerCard}>
            <span className={styles.layerNumber}>4</span>
            <h3>
              <Link href="/blueprints/component-standards/component-complexity/assemblies">
                Assemblies
              </Link>
            </h3>
            <p className={styles.layerTagline}>
              Product-level flows that live outside the system.
            </p>
            <p>
              Assemblies are application-specific flows encoded as components.
              They aren&apos;t universal system primitives; they&apos;re product
              constructs that use the system&apos;s building blocks.
            </p>
            <dl>
              <dt>Examples</dt>
              <dd>Checkout Flow, Project Board, Analytics Dashboard</dd>
              <dt>Work of the System</dt>
              <dd>Provide building blocks; assemblies live at the app layer</dd>
              <dt>Watch for</dt>
              <dd>Accidentally &quot;baking in&quot; product-specific flows</dd>
            </dl>
            <hr />
            <Link
              href="/blueprints/component-standards/component-complexity/assemblies"
              className={styles.layerLink}
            >
              Deep dive into Assemblies
            </Link>
          </div>
        </div>

        <h2>Why Composition Matters</h2>
        <p>
          Design systems cannot anticipate every product problem, every variant,
          or every edge case. If they try, they either collapse under prop bloat
          (&quot;yet another boolean for yet another exception&quot;) or grind
          to a halt as every new request funnels through the system team. Both
          outcomes slow teams and erode trust.
        </p>
        <p>
          <strong>Composition is the release valve.</strong> By leaning into
          patterns like compound components, slotting, and substitution, you
          give product teams a way to:
        </p>
        <ul>
          <li>
            <strong>Use the system a la carte:</strong> Pull in primitives and
            compounds without committing to a rigid, monolithic API.
          </li>
          <li>
            <strong>Insert what they need:</strong> Slot in custom behavior, add
            a product-specific sub-control, or override presentation while still
            sitting inside the system&apos;s orchestrator.
          </li>
          <li>
            <strong>Omit what they don&apos;t:</strong> Drop optional slots or
            props that aren&apos;t relevant, without violating conventions.
          </li>
          <li>
            <strong>Stay unblocked:</strong> Product timelines aren&apos;t gated
            by triage queues; teams compose from known parts and keep shipping.
          </li>
          <li>
            <strong>Adhere where possible:</strong> Because orchestration is
            handled by composers, accessibility, ARIA, and state management
            rules are inherited &quot;for free.&quot;
          </li>
        </ul>
        <p>
          This is why composition is a <em>governance strategy</em>, not just a
          coding trick. It creates a continuum: the system team defines
          boundaries and patterns, and product teams compose solutions inside
          those boundaries without waiting for new one-off components.
        </p>

        <h2>Meta-Patterns Across All Layers</h2>
        <p>
          Regardless of layer, three meta-patterns ensure scalability and
          prevent system collapse under exceptions:
        </p>
        <dl>
          <dt>Slotting &amp; Substitution</dt>
          <dd>
            Anticipate replaceable regions (children, slots, render props). This
            allows product teams to customize without forking. The system
            defines the shape; teams fill in the content.
          </dd>
          <dt>Headless Abstractions</dt>
          <dd>
            Separate logic (hooks, providers) from presentation (styled
            components). This enables theming, testing, and platform-specific
            implementations without duplicating behavior.
          </dd>
          <dt>Contextual Orchestration</dt>
          <dd>
            Treat composers as state providers, not just visual containers.
            Context APIs share state between sub-parts without prop drilling,
            making complex interactions manageable.
          </dd>
        </dl>
        <p>
          These aren&apos;t just coding tricks&mdash;they&apos;re governance
          strategies. They help a design system resist collapse under
          exceptions.
        </p>

        <h2>Thinking in Layers</h2>
        <p>
          For junior designers, the natural unit of thinking is the{' '}
          <strong>screen</strong>: what needs to be drawn to make this flow
          work? For system designers, the unit shifts to{' '}
          <strong>grammar</strong>: what are the rules of combination, and how
          do we prepare for emergent complexity?
        </p>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Layer</th>
              <th>Demand</th>
              <th>Focus</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Primitives</td>
              <td>Standards</td>
              <td>Stability, tokens, accessibility</td>
            </tr>
            <tr>
              <td>Compounds</td>
              <td>Conventions</td>
              <td>Blessed combinations, consistent spacing</td>
            </tr>
            <tr>
              <td>Composers</td>
              <td>Orchestration</td>
              <td>State management, focus, context</td>
            </tr>
            <tr>
              <td>Assemblies</td>
              <td>Boundaries</td>
              <td>Product-specific flows, business logic</td>
            </tr>
          </tbody>
        </table>
        <p>
          When you apply this layered lens, your system stops being a library of
          parts and becomes a <strong>language for products</strong>.
        </p>

        <h2>Complexity is Inevitable. Chaos is Optional.</h2>
        <p>
          The goal isn&apos;t to eliminate complexity&mdash;it&apos;s to channel
          it into structures that remain legible, maintainable, and extensible.
          Composition makes that channel possible:
        </p>
        <ul>
          <li>A button is stable.</li>
          <li>A field is orchestrated.</li>
          <li>A toolbar overflows gracefully.</li>
          <li>A rich text editor governs the chaos of paste and plugins.</li>
        </ul>
        <p>
          And crucially: when product teams need something new, they don&apos;t
          need to break the system&mdash;they compose with it.
        </p>
        <p>
          By recognizing components not as flat things, but as layered patterns,
          you prepare your system for growth. You teach teams not only{' '}
          <em>what</em> to build, but <em>how</em> to think about
          building&mdash;and that&apos;s the difference between a component
          library and a true design system.
        </p>

        <h2>Start Exploring</h2>
        <nav className={styles.layerNav}>
          <Link
            href="/blueprints/component-standards/component-complexity/primitives"
            className={styles.layerNavLink}
          >
            <span className={styles.layerNavNumber}>1</span>
            <div>
              <span className={styles.layerNavTitle}>Primitives</span>
              <span className={styles.layerNavDesc}>The boring DNA</span>
            </div>
          </Link>
          <Link
            href="/blueprints/component-standards/component-complexity/compound"
            className={styles.layerNavLink}
          >
            <span className={styles.layerNavNumber}>2</span>
            <div>
              <span className={styles.layerNavTitle}>Compounds</span>
              <span className={styles.layerNavDesc}>Blessed bundles</span>
            </div>
          </Link>
          <Link
            href="/blueprints/component-standards/component-complexity/composer"
            className={styles.layerNavLink}
          >
            <span className={styles.layerNavNumber}>3</span>
            <div>
              <span className={styles.layerNavTitle}>Composers</span>
              <span className={styles.layerNavDesc}>Orchestrators</span>
            </div>
          </Link>
          <Link
            href="/blueprints/component-standards/component-complexity/assemblies"
            className={styles.layerNavLink}
          >
            <span className={styles.layerNavNumber}>4</span>
            <div>
              <span className={styles.layerNavTitle}>Assemblies</span>
              <span className={styles.layerNavDesc}>Product flows</span>
            </div>
          </Link>
        </nav>
      </article>
    </section>
  );
}
