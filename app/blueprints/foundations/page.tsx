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
