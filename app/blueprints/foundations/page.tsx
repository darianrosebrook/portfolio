import Link from 'next/link';
import styles from './page.module.scss';

/**
 * Metadata for the /blueprints/foundations page.
 * @type {import('next').Metadata}
 */
export const metadata = {
  title: 'Design System Foundations | Darian Rosebrook',
  description:
    'A comprehensive guide to the atomic building blocks of design systems—color, typography, spacing, layout, icons, and more—for scalable, accessible products.',
  openGraph: {
    title: 'Design System Foundations | Darian Rosebrook',
    description:
      'A comprehensive guide to the atomic building blocks of design systems—color, typography, spacing, layout, icons, and more—for scalable, accessible products.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Design System Foundations | Darian Rosebrook',
    description:
      'A comprehensive guide to the atomic building blocks of design systems—color, typography, spacing, layout, icons, and more—for scalable, accessible products.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
};

const foundations = [
  {
    title: 'Design Tokens',
    desc: 'The contract between design and code. Learn how core primitives and semantic roles work together, how we validate and generate outputs, and how tokens drive accessibility and theming.',
    href: '/blueprints/foundations/tokens',
  },
  {
    title: 'Color',
    desc: 'Establishes brand identity, provides hierarchy, and supports contrast across light and dark themes. You&apos;ll learn how to define semantic and functional color tokens, evaluate contrast accessibility using WCAG and APCA, and implement color theming across platforms.',
    href: '/blueprints/foundations/color',
  },
  {
    title: 'Typography',
    desc: 'Typography communicates tone, hierarchy, and clarity. Explore how to define typographic scales, apply system font stacks, manage line height and letter spacing, and ensure readable text across screen sizes and user preferences.',
    href: '/blueprints/foundations/typography',
  },
  {
    title: 'Spacing & Sizing',
    desc: 'A consistent rhythm of space supports layout clarity and legibility. Learn how to define a modular spacing scale, use sizing tokens for components, and build layouts that respect accessibility requirements like minimum touch targets.',
    href: '/blueprints/foundations/spacing',
  },
  {
    title: 'Layout',
    desc: 'The structure that guides responsive design and visual organization. Understand how to create grid systems, define breakpoints, and structure containers and flows that adapt across screen sizes while preserving usability.',
    href: '/blueprints/foundations/layout',
  },
  {
    title: 'Icons',
    desc: 'Icons offer fast recognition and visual language support. Learn about icon sizing, stroke styles, accessibility alternatives like ARIA labels, and how to systematize icons for consistency in size, alignment, and usage.',
    href: '/blueprints/foundations/icons',
  },
  {
    title: 'Elevation & Shadows',
    desc: 'Visual layering helps users distinguish between surfaces and understand interactions. This section covers shadow tokens, elevation ramps, and how to provide depth cues that are both accessible and performant across platforms.',
    href: '/blueprints/foundations/elevation',
  },
  {
    title: 'Radius & Shape',
    desc: 'Shape tokens define the visual personality of your interface. Explore how to create consistent border-radius scales, apply shapes meaningfully to interactive components, and align visual identity across a system.',
    href: '/blueprints/foundations/radius',
  },
  {
    title: 'Motion & Duration',
    desc: 'Motion provides continuity and feedback. You&apos;ll learn to define motion tokens (duration, easing), support prefers-reduced-motion, and create accessible animations that reinforce user interaction rather than distract.',
    href: '/blueprints/foundations/motion',
  },
  {
    title: 'Grid Systems',
    desc: 'Grid systems help organize layouts with predictable flow and alignment. This section introduces column structures, gutter sizing, spacing alignment, and how to adapt grids responsively while maintaining accessibility.',
    href: '/blueprints/foundations/grid',
  },
  {
    title: 'Borders & Strokes',
    desc: 'Borders frame and delineate components. Learn how to apply tokenized border styles and widths, ensure contrast and visibility, and support semantic distinctions (e.g. input focus or warning states).',
    href: '/blueprints/foundations/borders',
  },
];

const metaFoundations = [
  {
    title: 'Token Naming & Hierarchy',
    desc: 'Understand how to structure your tokens into core, semantic, and component-level layers to ensure clarity, reuse, and scalability across platforms and themes.',
    href: '/blueprints/foundations/meta/token-naming',
  },
  {
    title: 'Theming Strategies',
    desc: 'Learn techniques for supporting dark mode, brand variations, and context-aware styling using alias tokens, layered tokens, and theme inheritance.',
    href: '/blueprints/foundations/meta/theming',
  },
  {
    title: 'Atomic vs Semantic Tokens',
    desc: 'Explore the difference between raw value tokens and purpose-driven semantic tokens to create a balance between flexibility and clarity.',
    href: '/blueprints/foundations/meta/atomic-vs-semantic',
  },
  {
    title: 'System vs Style',
    desc: 'Distinguish between foundational system logic and brand style layers, helping your design system scale while preserving identity.',
    href: '/blueprints/foundations/meta/system-vs-style',
  },
  {
    title: 'Component Mapping',
    desc: 'Map tokens to component anatomy to make token usage more intuitive and help teams understand how design decisions translate to implementation.',
    href: '/blueprints/foundations/meta/component-mapping',
  },
];

const toolingFoundations = [
  {
    title: 'Design Tooling',
    desc: 'Explore tools like Token Studio, Figma variables, and contrast checking plugins that help define, test, and maintain design-side foundations.',
    href: '/blueprints/foundations/tooling/design',
  },
  {
    title: 'Code Tooling',
    desc: 'Integrate tokens into code using tools like Style Dictionary, Tailwind token syncing, and accessibility linters like eslint-plugin-jsx-a11y.',
    href: '/blueprints/foundations/tooling/code',
  },
  {
    title: 'Automation & CI/CD',
    desc: 'Automate token distribution, theme switching, and documentation updates using GitHub Actions, custom pipelines, and preview deployments.',
    href: '/blueprints/foundations/tooling/automation',
  },
];

const accessibilityFoundations = [
  {
    title: 'Standards & Principles',
    desc: 'Learn how WCAG 2.1+, APCA, and the POUR model shape accessible design. Understand how these principles apply throughout your system.',
    href: '/blueprints/foundations/accessibility/standards',
  },
  {
    title: 'Token-Level Accessibility',
    desc: 'Build accessible systems from the ground up using tokens for color contrast, motion sensitivity, spacing for legibility, and focus states.',
    href: '/blueprints/foundations/accessibility/tokens',
  },
  {
    title: 'Assistive Tech Support',
    desc: 'Support screen readers and other assistive tools with proper semantics, ARIA usage, and keyboard navigation considerations.',
    href: '/blueprints/foundations/accessibility/assistive-tech',
  },
  {
    title: 'Accessibility Tooling',
    desc: 'Use tools like axe-core, Lighthouse, and Figma plugins to test, validate, and enforce accessibility at every stage of your workflow.',
    href: '/blueprints/foundations/accessibility/tooling',
  },
  {
    title: 'Philosophy & Practice',
    desc: 'Frame accessibility as a design constraint that enhances decision-making and expands the usability of your product for everyone.',
    href: '/blueprints/foundations/accessibility/philosophy',
  },
];

export default function FoundationsPage() {
  return (
    <>
      <section className="content">
        <h1>Design System Foundations</h1>
        <p>
          Every great design system begins with strong foundations. These core
          elements are the building blocks that enable teams to create
          consistent, accessible, and scalable products that authentically
          represent your brand while meeting the diverse needs of your users.
        </p>
        <p>
          This comprehensive guide is designed for both designers and developers
          who are looking to create their own design system from the ground up.
          Rather than simply providing pre-built components, we focus on the
          underlying principles, considerations, and best practices that inform
          thoughtful design decisions.
        </p>
        <p>
          By mastering these foundations, you&apos;ll gain the knowledge to
          build a system that&apos;s not just a collection of UI elements, but a
          cohesive framework that embodies your product&apos;s unique identity
          while ensuring accessibility, consistency, and scalability across
          platforms.
        </p>
      </section>

      <section className="content">
        <h2>Foundations → Philosophy of Design Systems</h2>
        <p>
          <strong>Level</strong>: Foundation
          <strong>Audience</strong>: All design system contributors (design,
          engineering, PM, accessibility)
          <strong>Purpose</strong>: Establish shared mental models for how
          design systems function as socio-technical infrastructure in
          organizations that build digital products at scale.
        </p>
        <hr />
        <h2>Why This Matters</h2>
        <p>
          Digital products are continuously changing ecosystems. New
          technologies emerge, teams reorganize, brand strategies evolve,
          accessibility regulations expand, and user needs shift. In this
          environment, <strong>consistency is not a static goal</strong>—it is a
          continuously maintained state requiring mechanisms that scale.
        </p>
        <p>Design systems are those mechanisms.</p>
        <p>
          A design system provides <strong>structural integrity</strong> to
          product development: a shared visual and interaction language, an
          agreed set of platform-specific behaviors, and rigorous technical
          implementations that uphold accessibility, performance, and
          resilience. It transforms design from an{' '}
          <strong>artifact-driven activity</strong> into a{' '}
          <strong>systems-driven discipline</strong>, where decisions propagate
          predictably and beneficially across an entire ecosystem.
        </p>
        <p>
          This page defines the philosophical foundation: why design systems
          exist and what principles sustain them.
        </p>
        <hr />
        <h2>Core Concepts</h2>
        <h3>1. A Design System Is Socio-Technical Infrastructure</h3>
        <p>
          It connects <strong>human practice</strong> with{' '}
          <strong>technical implementation</strong>:
        </p>
        <table>
          <thead>
            <tr>
              <th>Social Layer</th>
              <th>Technical Layer</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Governance decisions</td>
              <td>Token transformation pipelines</td>
            </tr>
            <tr>
              <td>Design rules and guidelines</td>
              <td>Reusable components and accessibility hooks</td>
            </tr>
            <tr>
              <td>Organizational alignment</td>
              <td>Release automation and CI gates</td>
            </tr>
            <tr>
              <td>Shared understanding of intent</td>
              <td>Platform-native code delivering that intent</td>
            </tr>
          </tbody>
        </table>
        <p>
          Both layers must evolve in harmony. When only the code is maintained,
          the system becomes a <strong>library</strong>. When only documentation
          is maintained, it becomes <strong>aspirational</strong>. A true design
          system is <strong>operational</strong>.
        </p>
        <hr />
        <h3>2. Design Systems Are Opinionated</h3>
        <p>
          “Every decision is a design decision”—systems make decisions{' '}
          <strong>on behalf of teams</strong>:
        </p>
        <ul>
          <li>Default focus ring presence and style</li>
          <li>Minimum tap target size</li>
          <li>Contrast ratios and color semantics</li>
          <li>Motion duration, easing, and thresholds</li>
          <li>Slot architecture and allowed variants</li>
          <li>Keyboard navigation patterns</li>
        </ul>
        <p>
          Opinionation reduces{' '}
          <strong>design and engineering cognitive load</strong>, and increases{' '}
          <strong>ethical consistency</strong>—particularly in accessibility
          outcomes.
        </p>
        <hr />
        <h3>3. Design Systems Encode Organizational Strategy</h3>
        <p>
          The system expresses <strong>who we are</strong> and{' '}
          <strong>what we value</strong> operationally:
        </p>
        <ul>
          <li>Are we efficiency-driven? → fewer variants, stricter rules</li>
          <li>Are we brand-expressive? → token overlays and motion patterns</li>
          <li>Are we multi-product? → composition over inheritance</li>
          <li>
            Are we accessibility-first? → guardrails built into primitives
          </li>
        </ul>
        <p>A system is a strategic artifact, not just a UX asset.</p>
        <hr />
        <h3>4. A Design System Is a Living Product</h3>
        <p>It has:</p>
        <ul>
          <li>
            <strong>Roadmaps</strong>
          </li>
          <li>
            <strong>Release cycles</strong>
          </li>
          <li>
            <strong>Adoption metrics</strong>
          </li>
          <li>
            <strong>Lifecycle management</strong>
          </li>
          <li>
            <strong>Debt management</strong>
          </li>
        </ul>
        <p>And like any product, it demands:</p>
        <ul>
          <li>Customer empathy (designers and engineers as users)</li>
          <li>Reliability (stable APIs)</li>
          <li>Clear communication (change logs, migration guides)</li>
        </ul>
        <p>
          Static systems erode. Operational systems{' '}
          <strong>continuously improve</strong>.
        </p>
        <hr />
        <h2>System Roles: What Design Systems Do in Practice</h2>
        <table>
          <thead>
            <tr>
              <th>Impact Area</th>
              <th>System Responsibility</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>Accessibility</strong>
              </td>
              <td>
                Enforce minimum standards by default; eliminate regressions
              </td>
            </tr>
            <tr>
              <td>
                <strong>Performance</strong>
              </td>
              <td>
                Provide optimized UI primitives and avoid wasteful patterns
              </td>
            </tr>
            <tr>
              <td>
                <strong>Brand integrity</strong>
              </td>
              <td>
                Maintain unity across products without stifling differentiation
              </td>
            </tr>
            <tr>
              <td>
                <strong>Velocity</strong>
              </td>
              <td>Reduce time spent reinventing UI primitives</td>
            </tr>
            <tr>
              <td>
                <strong>Quality</strong>
              </td>
              <td>Prevent inconsistent experiences and interaction failures</td>
            </tr>
            <tr>
              <td>
                <strong>Maintainability</strong>
              </td>
              <td>Centralize complexity in components built for reuse</td>
            </tr>
          </tbody>
        </table>
        <p>
          A system elevates the <strong>floors</strong>, while enabling teams to
          push the <strong>ceilings</strong>.
        </p>
        <hr />
        <h2>Design + Engineering Interplay (Dual-Track Literacy)</h2>
        <p>
          Design artifacts without technical translation create drift. Code
          without design rationale collapses into implementation anarchy.
        </p>
        <p>
          Operational design systems{' '}
          <strong>treat both artifacts as source of truth</strong>:
        </p>
        <ul>
          <li>
            Figma reflects <strong>intent and anatomy</strong>
          </li>
          <li>
            Code reflects{' '}
            <strong>constraints, behavior, and accessibility</strong>
          </li>
        </ul>
        <p>
          Design tokens, shared naming conventions, and synchronized governance{' '}
          <strong>bind the two</strong>.
        </p>
        <hr />
        <h2>Applied Example (Mini Case)</h2>
        <p>
          <strong>Scenario</strong>: Product teams repeatedly rebuild modal
          dialogs with custom animation behaviors, inconsistent closing
          interactions, and varying focus management.
        </p>
        <p>
          <strong>Without a system</strong>
          Teams optimize locally for speed → accessibility is compromised → UX
          becomes fragmented → QA burden increases → innovation slows because
          each team solves the same foundational problem.
        </p>
        <p>
          <strong>With a system</strong>
        </p>
        <ul>
          <li>
            Visual patterns: established modal anatomy (overlay, header, body,
            footer)
          </li>
          <li>
            Behavioral invariants: focus trap, escape key support, scroll
            locking
          </li>
          <li>
            Allowed variants: sizes, mobile responsiveness, brand overlays
          </li>
          <li>
            Automated tests: accessibility and performance checks baked in
          </li>
        </ul>
        <p>
          Innovation shifts <strong>upward</strong> in the stack—teams focus on
          the <strong>content</strong> and <strong>task flow</strong>, not
          rebuilding infrastructure.
        </p>
        <hr />
        <h2>Constraints and Trade-offs</h2>
        <p>Systems must navigate inherent tensions:</p>
        <table>
          <thead>
            <tr>
              <th>Tension</th>
              <th>Why It Matters</th>
              <th>Decision Indicator</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>Flexibility vs. Standardization</strong>
              </td>
              <td>Adapting to edge cases</td>
              <td>Variant explosion? Standardize</td>
            </tr>
            <tr>
              <td>
                <strong>Speed vs. Stability</strong>
              </td>
              <td>Supporting rapid iteration</td>
              <td>Versioning maturity required</td>
            </tr>
            <tr>
              <td>
                <strong>Brand expression vs. Usability</strong>
              </td>
              <td>Marketing vs. product coherence</td>
              <td>Brand overlay must preserve accessibility</td>
            </tr>
            <tr>
              <td>
                <strong>One-off needs vs. System health</strong>
              </td>
              <td>Avoiding bloat</td>
              <td>If &gt;2 teams need it → system candidate</td>
            </tr>
          </tbody>
        </table>
        <p>
          Healthy systems enforce{' '}
          <strong>constraints as creative boundaries</strong>.
        </p>
        <hr />
        <h2>Verification Checklist</h2>
        <p>
          When deciding whether a component, pattern, or token belongs in the
          system, ask:
        </p>
        <ol>
          <li>
            Does it <strong>scale</strong> across multiple products or contexts?
          </li>
          <li>
            Does it <strong>reduce cognitive or implementation burden</strong>?
          </li>
          <li>
            Does it <strong>improve accessibility and performance</strong> by
            default?
          </li>
          <li>Can it be governed with clear rules and lifecycles?</li>
          <li>
            Does it have <strong>a single clear semantic purpose</strong>?
          </li>
          <li>
            Will it remain <strong>relevant and maintainable</strong> over time?
          </li>
        </ol>
        <p>
          If the answer to #6 is uncertain → experiment outside the system
          first.
        </p>
        <hr />
        <h2>Cross-References and System Integration</h2>
        <p>Foundational Concepts Connected to This Page:</p>
        <ul>
          <li>
            <strong>Design Tokens</strong> → how strategic constraints become
            encoded
          </li>
          <li>
            <strong>Accessibility Infrastructure</strong> → ethical execution of
            UI at scale
          </li>
          <li>
            <strong>Spacing &amp; Layout Systems</strong> → invisible structure
            that creates harmony
          </li>
          <li>
            <strong>Component Architecture Basics</strong> → composable design
            patterns
          </li>
        </ul>
        <p>Blueprint examples driven by these principles:</p>
        <ul>
          <li>Modal</li>
          <li>Button</li>
          <li>Alert/Dialog</li>
          <li>Focus management utilities</li>
        </ul>
        <p>
          This page provides the conceptual architecture those pages implement.
        </p>
        <hr />
        <h2>Reflection &amp; Assessment Prompts</h2>
        <ol>
          <li>
            In your current design system experience, which layer is
            weaker—social or technical? Why?
          </li>
          <li>
            Where do you see <strong>opinionation</strong> providing meaningful
            efficiency or quality gains?
          </li>
          <li>
            Think of a recent UI decision—what would a{' '}
            <strong>design system version</strong> of that decision look like?
          </li>
          <li>
            Which tensions (flexibility vs. standardization, etc.) are most
            visible in your organization today?
          </li>
          <li>
            How might treating the system as a <strong>product</strong> change
            your team’s way of working?
          </li>
        </ol>
        <p>
          Encourage team discussions—philosophy becomes culture only when
          shared.
        </p>
        <hr />
        <h2>Additional Resources</h2>
        <ul>
          <li>
            <em>Designing Design Systems</em> — Alla Kholmatova
          </li>
          <li>
            <em>Atomic Design</em> — Brad Frost
          </li>
          <li>W3C WAI — Accessible Design Standards</li>
          <li>
            ACM CSCW — Research on socio-technical systems in organizations
          </li>
        </ul>
      </section>

      <section className="content">
        <h2>Core Foundations</h2>
        <p>
          These atomic elements form the basic building blocks of any design
          system. Each foundation is considered from multiple perspectives:
          visual design, accessibility, cross-platform compatibility, and
          practical implementation.
        </p>
        <div className={styles['foundation-grid']}>
          {foundations.map(({ title, desc, href }) => (
            <div key={title} className={styles['foundation-card']}>
              <h3>{title}</h3>
              <p>{desc}</p>
              <Link href={href}>Explore {title} →</Link>
            </div>
          ))}
        </div>
      </section>
      <section className="content">
        <h2>Meta Foundations</h2>
        <p>
          These concepts guide how foundational elements are structured,
          extended, and scaled. Meta foundations focus on naming, hierarchy, and
          system strategy to support consistent, long-term growth.
        </p>
        <div className={styles['foundation-grid']}>
          {metaFoundations.map(({ title, desc, href }) => (
            <div key={title} className={styles['foundation-card']}>
              <h3>{title}</h3>
              <p>{desc}</p>
              <Link href={href}>Explore {title} →</Link>
            </div>
          ))}
        </div>
      </section>

      <section className="content">
        <h2>Tooling in Context</h2>
        <p>
          A strong system is supported by powerful tooling that keeps tokens,
          themes, and component styling consistent between design and
          development. This section introduces tools that help automate, lint,
          and visualize your system.
        </p>
        <div className={styles['foundation-grid']}>
          {toolingFoundations.map(({ title, desc, href }) => (
            <div key={title} className={styles['foundation-card']}>
              <h3>{title}</h3>
              <p>{desc}</p>
              <Link href={href}>Explore {title} →</Link>
            </div>
          ))}
        </div>
      </section>

      <section className="content">
        <h2>Accessibility</h2>
        <p>
          Accessibility is a foundational principle, not a post-process
          checklist. Systems that are accessible by default are easier to scale,
          maintain, and test across platforms and user needs.
        </p>
        <p>
          This section covers global accessibility guidelines, token-level
          considerations, and practical tooling. Accessibility is also revisited
          within each individual foundation to reinforce its importance across
          every decision.
        </p>
        <div className={styles['foundation-grid']}>
          {accessibilityFoundations.map(({ title, desc, href }) => (
            <div key={title} className={styles['foundation-card']}>
              <h3>{title}</h3>
              <p>{desc}</p>
              <Link href={href}>Explore {title} →</Link>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
