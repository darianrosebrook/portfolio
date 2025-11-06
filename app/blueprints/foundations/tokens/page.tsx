import Link from 'next/link';
import styles from './page.module.scss';

export const metadata = {
  title: 'Design Tokens Foundations | Darian Rosebrook',
  description:
    'An educational primer on design tokens: what they are, what they promise, and how to build future-proofed, large-scale systems.',
  openGraph: {
    title: 'Design Tokens Foundations | Darian Rosebrook',
    description:
      'An educational primer on design tokens: what they are, what they promise, and how to build future-proofed, large-scale systems.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Design Tokens Foundations | Darian Rosebrook',
    description:
      'An educational primer on design tokens: what they are, what they promise, and how to build future-proofed, large-scale systems.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
};

const sections = [
  {
    title: 'DTCG 1.0 Structured Formats',
    desc: 'How we use DTCG 1.0 specification with structured values: color objects, dimension units, and composite tokens.',
    href: '/blueprints/foundations/tokens/dtcg-formats',
  },
  {
    title: 'Core vs Semantic',
    desc: 'How primitives in core.* power purpose-driven semantic.* roles. Why aliases, not copies, improve scale and theming.',
    href: '/blueprints/foundations/tokens/core-vs-semantic',
  },
  {
    title: 'Token Naming & Hierarchy',
    desc: 'Conventions for namespacing, depth, and stability. How we avoid collisions and enable discoverability.',
    href: '/blueprints/foundations/tokens/token-naming',
  },
  {
    title: 'Multi-Brand Theming',
    desc: 'How structured tokens enable brand switching, platform variants, and scalable theming across products.',
    href: '/blueprints/foundations/tokens/theming',
  },
  {
    title: 'Resolver Module',
    desc: 'DTCG 1.0 Resolver Module for context-aware token resolution with sets, modifiers, and resolution orders.',
    href: '/blueprints/foundations/tokens/resolver-module',
  },
  {
    title: 'Schema & Validation',
    desc: 'DTCG 1.0 JSON Schema for IntelliSense and AJV validation with structured value enforcement.',
    href: '/blueprints/foundations/tokens/schema-validation',
  },
  {
    title: 'Build Outputs',
    desc: 'What we generate: composed JSON, global CSS vars, component SCSS, and TypeScript token path types.',
    href: '/blueprints/foundations/tokens/build-outputs',
  },
  {
    title: 'Accessibility by Default',
    desc: 'Contrast, motion preferences, target sizes—how tokens encode a11y constraints early.',
    href: '/blueprints/foundations/tokens/accessibility',
  },
];

export default function TokensFoundationPage() {
  return (
    <section className="content">
      <h1>Design Tokens Foundations</h1>

      <p>
        Design tokens are more than variables. They are the language that allows
        designers and developers to describe decisions in a way that scales
        across time, platforms, and brands. Our implementation follows the
        <strong>
          W3C Design Tokens Community Group (DTCG) 1.0 specification
        </strong>
        , using structured object formats instead of simple strings. When a
        system reaches a certain level of maturity, repeating decisions—what
        shade of neutral to use, what radius applies to a control, how long a
        motion easing should last—becomes a liability. Tokens transform those
        repeating decisions into a durable vocabulary. They are not the design
        itself, but the encoded reference points from which design can be
        consistently rebuilt, audited, and evolved.
      </p>

      <p>
        We treat tokens as a contract. That contract binds our design
        intentions, our accessibility standards, and our engineering
        implementation together. It means that when a designer specifies
        <code> semantic.color.foreground.primary </code>, they are not picking a
        hex value, they are invoking a decision about hierarchy, contrast, and
        brand expression that has already been vetted. The token itself is not
        static: it can be remapped to a different palette entry, or tuned for
        light and dark modes, but its role and intent remain constant.
      </p>

      <h2>Why Tokens Matter</h2>
      <p>
        At their best, tokens are design memory. They capture past agreements so
        that every new contributor does not have to renegotiate basic choices.
        They also create an explicit surface for governance: when the system
        grows, we can ask whether a token still serves its purpose, whether its
        role is overloaded, or whether a new token is required. This provides
        a&nbsp;check against entropy. Rather than drifting into a patchwork of
        arbitrary overrides, the system evolves deliberately, with every token a
        stake in the ground for future reflection.
      </p>

      <p>
        The alternative—hard-coding values directly in components or styles—is
        not just inefficient, it fractures coherence. Without tokens, a change
        to a brand color or a type ramp requires hunting down dozens of places
        where the same decision was repeated. With tokens, a single alias change
        cascades predictably across the system. What tokens offer, then, is not
        just efficiency but a structural guarantee of consistency.
      </p>

      <h2>DTCG 1.0 Structured Values</h2>
      <p>
        Unlike traditional CSS variables, our tokens use the DTCG 1.0
        specification's structured value format. Colors are objects with{' '}
        <code>colorSpace</code> and
        <code>components</code>, dimensions have explicit <code>value</code> and
        <code>unit</code> properties, and composite tokens like typography and
        borders reference these structured primitives. This approach enables:
      </p>
      <ul>
        <li>
          <strong>Type safety</strong> through structured validation
        </li>
        <li>
          <strong>Platform flexibility</strong> with format-aware transforms
        </li>
        <li>
          <strong>Brand scalability</strong> through semantic aliasing
        </li>
        <li>
          <strong>Tool interoperability</strong> with DTCG-compliant tooling
        </li>
      </ul>

      <h2>The Layered Model</h2>
      <p>
        Our philosophy of tokens follows a layered approach. Each layer has a
        different degree of stability and serves a different audience:
      </p>
      <p>
        The <strong>core layer</strong> contains primitives—the building blocks
        like palette scales, spacing increments, type ramps, and motion
        durations. These rarely change across brands or products; they are the
        physics of our system. Core tokens use DTCG 1.0 structured formats:
        colors with color spaces, dimensions with explicit units, and base
        typography scales.
      </p>
      <p>
        On top of this sits the <strong>semantic layer</strong>. Here tokens are
        given roles: foreground and background colors, states like danger or
        success, control sizes, or motion behaviors for interaction. This is the
        theming surface, where core values are aliased into meaningful roles.
        This layer is where brands diverge, where accessibility constraints are
        enforced, and where most product designers interact with the system.
        Semantic tokens can override values for different themes while
        maintaining consistent structure.
      </p>
      <p>
        Finally, there is an optional <strong>component layer</strong>. Here
        tokens are applied to anatomy—button backgrounds, card shadows, input
        borders. These tokens alias back to semantic roles but give component
        teams a stable handle for customization without breaking the semantic
        contract. This layer is what connects design tokens directly to the
        day-to-day authoring of UI components.
      </p>

      <h2>Authoring as Practice</h2>
      <p>
        Creating tokens is not only a technical activity but a philosophical
        one. Each new token forces us to answer: is this a primitive, a role, or
        an implementation detail? Does it belong at the core, semantic, or
        component layer? Naming becomes a design act, shaping how discoverable
        and understandable the system will be for others. Aliases are favored
        over duplication, because a single value of truth strengthens the
        contract. Validation ensures that types are respected and references
        resolve correctly. Authoring tokens is thus less about writing JSON and
        more about capturing intent with precision.
      </p>

      <p>
        Our tooling supports this practice with schema validation, lint rules,
        and automated build outputs. When a token is added or modified, it flows
        through a pipeline that validates its type, checks it against
        accessibility requirements, and generates outputs for consumption in
        CSS, SCSS, and TypeScript. The result is not just a registry of values
        but an enforceable system that prevents drift and encodes standards at
        the lowest level of the stack.
      </p>

      <h2>From Tokens to Runtime</h2>
      <p>
        Tokens move from authored intent to runtime application through a
        well-defined lifecycle. Designers and developers author them in core and
        semantic files. Validation ensures they are coherent. Composition
        generates stable artifacts: CSS variables that power runtime theming,
        SCSS modules scoped to components, and type-safe token paths for
        engineering. At runtime, components reference variables rather than
        values. The effect is that a design decision made once propagates
        globally, is enforceable through CI, and remains auditable as the system
        evolves.
      </p>

      <h2>Future-Proofing the System</h2>
      <p>
        Our goal is not simply to have tokens, but to have a token system that
        can withstand the pressures of scale: multiple brands, accessibility
        audits, new platforms, and evolving aesthetic directions. We achieve
        this by treating tokens as stable contracts, by validating them through
        schema and CI, and by authoring them with care. This makes the system
        resilient to both expansion and change. When the system is challenged—
        by a new theme, a new mode, or a new platform—we can adapt without
        breaking. Tokens are our guarantee that the design system remains
        coherent no matter how complex it becomes.
      </p>

      <h2>Deep Dives</h2>
      <p>
        The following topics extend this primer into more specialized guidance:
      </p>
      <div className={styles.grid}>
        {sections.map(({ title, desc, href }) => (
          <div key={title} className={styles.card}>
            <h3>{title}</h3>
            <p>{desc}</p>
            <Link href={href}>Read more →</Link>
          </div>
        ))}
      </div>
    </section>
  );
}
