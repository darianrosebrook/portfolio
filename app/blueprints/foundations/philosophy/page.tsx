/**
 * Foundation: Philosophy of Design Systems
 * The philosophical foundation that guides how we think about and build design systems
 */

import type {
  FoundationPageMetadata,
  FoundationSection,
} from '@/types/foundationContent';
import { generateFoundationMetadata } from '@/utils/metadata/foundationMetadata';
import { createFoundationContent } from '../_lib/contentBuilder';
import { FoundationPage } from '../_lib/pageWrapper';

const pageMetadata: FoundationPageMetadata = {
  title: 'Philosophy of Design Systems',
  description:
    'Explore the philosophical foundations that guide design systems: systems thinking, socio-technical infrastructure, and the tradeoffs that shape how design systems mature from pattern libraries to operational ecosystems.',
  slug: 'philosophy',
  canonicalUrl: 'https://darianrosebrook.com/blueprints/foundations/philosophy',
  published_at: new Date().toISOString(),
  modified_at: new Date().toISOString(),
  image: 'https://darianrosebrook.com/darianrosebrook.jpg',
  keywords: 'design systems, systems thinking, philosophy, architecture',
  learning: {
    learning_level: 'foundation',
    role_relevance: ['design', 'engineering', 'governance'],
    prerequisites: [],
    next_units: ['tokens', 'accessibility'],
    assessment_required: false,
    estimated_reading_time: 18,
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
    expertise: ['Design Systems', 'Systems Thinking', 'Architecture'],
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
          Design systems are not simply libraries of UI components—they are
          socio-technical infrastructures that support product teams in shipping
          accessible, performant, high-quality interfaces at scale. To operate
          effectively within them, practitioners need fluency across multiple
          layers: how decisions propagate through an ecosystem, how components
          and tokens really work, and how systems evolve responsibly over time.
        </p>
        <p>
          This philosophical foundation helps practitioners understand not just{' '}
          <em>what</em> to build, but <em>why</em> we build it this way, and{' '}
          <em>how</em> these choices contribute to the coherence, scalability,
          and maintainability of the overall system.
        </p>
      </>
    ),
  },
  {
    type: 'core-concepts',
    id: 'core-concepts',
    title: 'Core Concepts',
    order: 4,
    content: (
      <>
        <h3>Systems Thinking in Product Development</h3>
        <p>
          Systems thinking is the recognition that design systems are not
          collections of independent parts, but interconnected networks where
          changes in one area ripple through the entire system. When you modify
          a color token, it affects every component that references it. When you
          change a component's API, it impacts every product team using it.
        </p>
        <p>This interconnectedness means that every decision must consider:</p>
        <ul>
          <li>
            <strong>Cascading effects:</strong> How will this change propagate
            through dependent systems?
          </li>
          <li>
            <strong>Backward compatibility:</strong> Will this break existing
            implementations?
          </li>
          <li>
            <strong>Forward compatibility:</strong> Will this scale as the
            system grows?
          </li>
          <li>
            <strong>Platform consistency:</strong> How does this align across
            web, iOS, Android?
          </li>
        </ul>

        <h3>Design Systems as Socio-Technical Infrastructure</h3>
        <p>
          Design systems exist at the intersection of design craft, engineering
          discipline, and organizational culture. They are simultaneously:
        </p>
        <ul>
          <li>
            <strong>Technical artifacts:</strong> Code, tokens, components, and
            tooling
          </li>
          <li>
            <strong>Design language:</strong> Visual patterns, interaction
            models, and brand expression
          </li>
          <li>
            <strong>Social contracts:</strong> Governance models, contribution
            workflows, and shared vocabulary
          </li>
        </ul>
        <p>
          This triple nature means that system success depends on balancing
          governance with flexibility, standards with creativity, and control
          with autonomy. Too much governance creates rigidity; too little
          creates chaos. The philosophical challenge is finding the right
          balance for your organization.
        </p>

        <h3>Tradeoffs in API Design and Visual Abstraction</h3>
        <p>
          Every design system choice involves tradeoffs. More flexibility means
          less consistency. More abstraction means less direct control. More
          opinionation means less customization.
        </p>
        <p>
          Consider a button component: Should it have 5 variants or 50? Five
          variants provide consistency but limit expression. Fifty variants
          provide flexibility but create maintenance burden. The philosophical
          question isn't "which is correct?" but "what tradeoffs align with our
          system's goals?"
        </p>
        <p>
          Design system maturity is measured not by the absence of tradeoffs,
          but by the intentionality with which we make them.
        </p>
      </>
    ),
  },
  {
    type: 'system-roles',
    id: 'system-roles',
    title: 'System Roles: The Why in Practice',
    order: 5,
    content: (
      <>
        <p>
          These philosophical principles translate into concrete impacts across
          the system:
        </p>

        <h3>Accessibility Impact</h3>
        <p>
          When accessibility is treated as a philosophical invariant—a
          non-negotiable requirement rather than an optional enhancement—it
          shapes every decision. Token definitions must encode contrast
          requirements. Component APIs must enforce accessible patterns.
          Documentation must explain why, not just how.
        </p>

        <h3>Performance Impact</h3>
        <p>
          Systems thinking reveals that performance isn't just about individual
          components—it's about the relationships between them. A component that
          loads quickly in isolation might slow down the entire page when used
          in combination with others. The philosophy of performance means
          designing for system-wide impact, not local optimization.
        </p>

        <h3>Governance Impact</h3>
        <p>
          Recognizing design systems as socio-technical infrastructure means
          governance must balance technical correctness with human adoption.
          Perfect technical solutions that teams won't use are failures. The
          philosophy of governance is enabling, not restricting—providing
          constraints that unlock creativity rather than stifle it.
        </p>
      </>
    ),
  },
  {
    type: 'design-code-interplay',
    id: 'design-code-interplay',
    title: 'Design & Code Interplay',
    order: 6,
    content: (
      <>
        <p>
          The philosophy that design and code are inseparable manifests in how
          we structure tokens, components, and documentation. Let's examine how
          systems thinking, socio-technical balance, and tradeoff decisions
          appear in actual code.
        </p>

        <h3>Systems Thinking in Component Dependencies</h3>
        <p>
          Systems thinking recognizes that components are interconnected, not
          isolated. When we build a <code>TextField</code>, it depends on{' '}
          <code>Input</code> and <code>Label</code> primitives. This dependency
          creates a cascade: changes to <code>Input</code> automatically affect
          every <code>TextField</code> in the system.
        </p>

        <p>Here's how the dependency structure enforces consistency:</p>

        <pre>
          <code>{`// TextField composes Input and Label
// This creates a dependency that ensures consistency

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, ...inputProps }, ref) => {
    return (
      <div className={styles.field}>
        {label && (
          <Label htmlFor={inputId}>
            {label}
          </Label>
        )}
        <Input
          ref={ref}
          invalid={!!error}
          {...inputProps}
        />
        {error && (
          <div role="alert" className={styles.error}>
            {error}
          </div>
        )}
      </div>
    );
  }
);

// When Input's API changes, TextField must adapt
// This dependency ensures system-wide consistency
// But it also means changes propagate—systems thinking in action`}</code>
        </pre>

        <p>
          This dependency structure means that when we improve{' '}
          <code>Input</code>'s accessibility or styling, every{' '}
          <code>TextField</code> automatically benefits. This is systems
          thinking: optimizing for system-wide impact, not local optimization.
        </p>

        <h3>Socio-Technical Balance in API Design</h3>
        <p>
          Design systems exist at the intersection of human practice and
          technical implementation. The <code>Button</code> component's API
          reflects this balance through its polymorphic design—it can be a
          button or an anchor, depending on context.
        </p>

        <p>
          This design balances technical correctness (semantic HTML) with human
          needs (simple API, fewer decisions):
        </p>

        <pre>
          <code>{`// Button's polymorphic API balances technical needs with human needs
// Technical: Must render correct HTML (button vs anchor)
// Human: Should be simple to use, fewer decisions

export type ButtonProps = 
  | (ButtonBaseProps & { as?: 'button' } & ButtonHTMLAttributes)
  | (ButtonBaseProps & { as: 'a' } & AnchorHTMLAttributes);

// The API guides correct usage:
<Button onClick={handleClick}>Click me</Button>        // Button
<Button as="a" href="/path">Link</Button>                // Anchor

// This balance ensures:
// - Developers use correct semantics (technical correctness)
// - API is intuitive (human adoption)
// - System maintains consistency (governance)`}</code>
        </pre>

        <p>
          The polymorphic API provides a single component interface while
          ensuring correct HTML semantics. This is socio-technical balance:
          technical correctness that enables rather than restricts human
          creativity.
        </p>

        <h3>Tradeoff Decisions in Code</h3>
        <p>
          Every design system choice involves tradeoffs. The <code>Button</code>{' '}
          component demonstrates the flexibility vs. consistency tradeoff
          through its variant system:
        </p>

        <pre>
          <code>{`// Button variants: balancing flexibility with consistency
// More variants = more flexibility, less consistency
// Fewer variants = more consistency, less flexibility

export type ButtonVariant =
  | 'primary'      // Most common, highest contrast
  | 'secondary'    // Less emphasis, still prominent
  | 'tertiary'     // Subtle, low emphasis
  | 'ghost'        // Minimal, no background
  | 'destructive'  // Dangerous actions
  | 'outline';     // Bordered, transparent fill

// The tradeoff:
// - 6 variants provide enough flexibility for most cases
// - But not so many that decisions become overwhelming
// - Each variant has clear semantic meaning
// - The system enforces consistency by limiting options

// This is intentional constraint: limiting options to enable creativity
// Too many options = decision paralysis
// Too few options = inability to express nuance`}</code>
        </pre>

        <p>
          By providing exactly 6 variants—not 3, not 20—the system makes an
          intentional tradeoff. This constraint creates consistency while
          preserving enough flexibility for creative expression. The philosophy
          guides the decision: balance is more important than perfection.
        </p>

        <h3>Composition Patterns as Governance</h3>
        <p>
          The <code>Field</code> component uses a compound component pattern
          with slots, demonstrating how composition becomes a governance
          strategy:
        </p>

        <pre>
          <code>{`// Field uses composition to enforce structure
// The compound pattern provides slots for predictable composition

export const Field = Object.assign(FieldComponent, {
  Label,
  Error: ErrorText,
  Help: HelpText,
});

// Usage enforces structure:
<Field>
  <Field.Label>Email</Field.Label>
  <Input />
  <Field.Error>Invalid email</Field.Error>
  <Field.Help>Enter your email address</Field.Help>
</Field>

// The composition pattern:
// - Enforces correct structure (governance)
// - Provides flexibility within constraints (creativity)
// - Makes relationships explicit (systems thinking)
// - Reduces decision fatigue (human practice)

// This is governance through structure, not restrictions`}</code>
        </pre>

        <p>
          The compound pattern doesn't restrict creativity—it channels it into
          predictable, maintainable structures. This is philosophy in practice:
          governance that enables rather than restricts.
        </p>

        <h3>Real-World Impact</h3>
        <p>
          These patterns don't exist in isolation. When a designer specifies a
          button in Figma, that decision flows through tokens, components, and
          APIs to become code. The philosophy that design and code are
          inseparable means that every design decision has a code consequence,
          and every code decision has a design impact.
        </p>

        <p>
          By understanding these connections, practitioners can make informed
          decisions that benefit the entire system, not just their immediate
          needs. This is systems thinking applied to code: recognizing that
          every change ripples through the system, and designing APIs that
          channel those ripples productively.
        </p>
      </>
    ),
  },
  {
    type: 'applied-example',
    id: 'applied-example',
    title: 'Applied Example: Navigating a Design System Decision',
    order: 7,
    content: (
      <>
        <p>
          Let's walk through a real scenario: Your team needs to add a new
          button variant. Here's how the philosophy guides decision-making:
        </p>

        <h3>Step 1: Identify the Request</h3>
        <p>
          A designer requests a "ghost" button variant—transparent background
          with visible border. This seems like a simple addition.
        </p>

        <h3>Step 2: Systems Thinking Analysis</h3>
        <p>Before adding the variant, consider cascading effects:</p>
        <ul>
          <li>
            <strong>Token implications:</strong> Does this variant need new
            tokens or can it reuse existing ones?
          </li>
          <li>
            <strong>Component dependencies:</strong> Will this affect other
            components that use Button?
          </li>
          <li>
            <strong>Accessibility:</strong> Will transparent background meet
            contrast requirements?
          </li>
          <li>
            <strong>Usage patterns:</strong> Is this a one-off need or a pattern
            that will repeat?
          </li>
        </ul>

        <h3>Step 3: Tradeoff Evaluation</h3>
        <p>Evaluate the tradeoffs:</p>
        <ul>
          <li>
            <strong>Add variant:</strong> More flexibility, but increases API
            surface area and decision complexity
          </li>
          <li>
            <strong>Compose variant:</strong> More work per usage, but keeps
            system simpler
          </li>
          <li>
            <strong>Reuse existing:</strong> May not perfectly match design, but
            maintains consistency
          </li>
        </ul>

        <h3>Step 4: Socio-Technical Consideration</h3>
        <p>Consider how this decision affects team adoption:</p>
        <ul>
          <li>
            <strong>Developer experience:</strong> Will developers understand
            when to use this variant?
          </li>
          <li>
            <strong>Designer experience:</strong> Does this align with design
            tooling capabilities?
          </li>
          <li>
            <strong>Documentation:</strong> Can we clearly explain when to use
            this vs. other variants?
          </li>
        </ul>

        <h3>Step 5: Decision Framework</h3>
        <p>Apply the philosophy:</p>
        <ul>
          <li>
            <strong>If pattern will repeat:</strong> Add to system (systems
            thinking)
          </li>
          <li>
            <strong>If one-off:</strong> Enable composition, don't add variant
            (pragmatism)
          </li>
          <li>
            <strong>If ambiguous:</strong> Ship with clear limitations, gather
            usage data, evolve (iterative evolution)
          </li>
        </ul>

        <h3>Step 6: Implementation</h3>
        <p>Assuming we add the variant, implement with philosophy in mind:</p>
        <pre>
          <code>{`// ✅ Systems thinking: reuse existing tokens
export const Button = ({ variant = 'primary', ...props }) => {
  const variantStyles = {
    primary: 'bg-primary text-white',
    secondary: 'bg-secondary text-foreground',
    ghost: 'bg-transparent border-foreground text-foreground', // New variant
  };
  
  return (
    <button
      className={variantStyles[variant]}
      {...props}
    >
      {children}
    </button>
  );
};

// ✅ Socio-technical: clear documentation
/**
 * Button variants:
 * - primary: Main actions
 * - secondary: Secondary actions
 * - ghost: Subtle actions, minimal emphasis
 */

// ✅ Pragmatism: ship with limitations
// Note: Ghost variant may not meet contrast requirements on all backgrounds.
// Use with caution and test accessibility.`}</code>
        </pre>

        <h3>Real-World Impact</h3>
        <p>This decision-making process demonstrates philosophy in action:</p>
        <ul>
          <li>
            <strong>Systems thinking:</strong> Considered cascading effects
            before implementation
          </li>
          <li>
            <strong>Tradeoff awareness:</strong> Explicitly evaluated
            flexibility vs. simplicity
          </li>
          <li>
            <strong>Socio-technical balance:</strong> Considered both technical
            and human factors
          </li>
          <li>
            <strong>Pragmatic evolution:</strong> Shipped with limitations,
            ready to evolve based on usage
          </li>
        </ul>

        <p>
          By following this process, the decision becomes intentional and
          explainable, not arbitrary. This is philosophy guiding practice.
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
        <p>
          The philosophical approach to design systems requires accepting that
          perfect solutions don't exist. Every choice has consequences:
        </p>
        <ul>
          <li>
            <strong>Abstraction vs. Directness:</strong> More abstraction
            enables consistency but obscures control. Direct implementations
            provide control but create inconsistency.
          </li>
          <li>
            <strong>Opinionation vs. Flexibility:</strong> Strong opinions
            reduce decision fatigue but limit creativity. High flexibility
            enables expression but increases cognitive load.
          </li>
          <li>
            <strong>Governance vs. Autonomy:</strong> Tight governance ensures
            quality but slows innovation. High autonomy enables speed but risks
            drift.
          </li>
        </ul>
        <p>
          The philosophical question isn't "which is better?" but "which aligns
          with our system's purpose and our organization's needs?"
        </p>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'common-pitfalls',
    title: 'Common Pitfalls & Failure Modes',
    order: 8.5,
    content: (
      <>
        <p>
          Understanding failure modes helps avoid common mistakes. Here are
          patterns that indicate systems thinking failures:
        </p>

        <h3>1. Local Optimization Over System Impact</h3>
        <p>
          <strong>The Problem:</strong> Optimizing individual components without
          considering system-wide effects.
        </p>
        <pre>
          <code>{`// ❌ Local optimization: fastest button implementation
const Button = ({ onClick, children }) => {
  return (
    <div onClick={onClick} className="button">
      {children}
    </div>
  );
};

// Problems:
// - No keyboard support (local optimization)
// - No semantic HTML (ignores accessibility)
// - Breaks system consistency (no variant system)
// - Forces every consumer to add accessibility themselves

// ✅ Systems thinking: consider all consumers
const Button = ({ variant, size, onClick, children }) => {
  return (
    <button
      onClick={onClick}
      className={\`button button--\${variant} button--\${size}\`}
    >
      {children}
    </button>
  );
};

// Benefits:
// - Native keyboard support (system-wide accessibility)
// - Consistent API across all buttons
// - System maintains quality standards`}</code>
        </pre>

        <h3>2. Ignoring Cascading Effects</h3>
        <p>
          <strong>The Problem:</strong> Making changes without considering how
          they propagate through the system.
        </p>
        <pre>
          <code>{`// ❌ Changing Input API without considering TextField
// Input component changes from:
<Input value={value} onChange={onChange} />

// To:
<Input value={value} onInput={onInput} />

// Impact: Every TextField breaks, every form breaks
// Result: System-wide breaking change, mass migration required

// ✅ Systems thinking: versioned API with deprecation
<Input 
  value={value}
  onChange={onChange} // Deprecated, but still works
  onInput={onInput}  // New API
/>

// Impact: Gradual migration, no breaking changes
// Result: System evolves without breaking consumers`}</code>
        </pre>

        <h3>3. Treating Design Systems as Libraries</h3>
        <p>
          <strong>The Problem:</strong> Focusing only on code artifacts,
          ignoring social and governance aspects.
        </p>
        <pre>
          <code>{`// ❌ Library mindset: "Just ship components"
// - Components exist
// - No usage guidelines
// - No governance model
// - No contribution workflow
// - No adoption strategy

// Result: Components exist but aren't used
// Teams reinvent because they don't understand intent

// ✅ Systems thinking: operational infrastructure
// - Components with clear APIs
// - Usage guidelines and examples
// - Governance model (when to contribute vs. fork)
// - Contribution workflow (how to propose changes)
// - Adoption strategy (how teams onboard)

// Result: System becomes part of team workflow`}</code>
        </pre>

        <h3>4. Over-Abstraction</h3>
        <p>
          <strong>The Problem:</strong> Creating abstractions that obscure
          important decisions.
        </p>
        <pre>
          <code>{`// ❌ Over-abstraction: "universal" component
<UniversalComponent
  type="button"
  appearance="primary"
  behavior="clickable"
  layout="horizontal"
  // ... 20 more props
/>

// Problems:
// - Too many decisions per usage
// - Hidden complexity makes debugging hard
// - Breaks when new use cases appear
// - System becomes rigid despite "flexibility"

// ✅ Systems thinking: layered composition
<Button variant="primary">
  Click me
</Button>

// Clear, simple API
// Complexity managed through composition
// System evolves through layers, not single component`}</code>
        </pre>

        <h3>5. Under-Governance</h3>
        <p>
          <strong>The Problem:</strong> Lack of clear boundaries and decision
          frameworks leads to drift.
        </p>
        <pre>
          <code>{`// ❌ No governance: "anything goes"
// - Teams create components ad-hoc
// - No naming conventions
// - Inconsistent APIs
// - Token duplication
// - No review process

// Result: System becomes chaotic, inconsistent
// Teams lose trust, fork their own solutions

// ✅ Systems thinking: governance through structure
// - Clear layer boundaries (primitive → compound → composer)
// - Naming conventions enforced
// - API standards documented
// - Token architecture prevents duplication
// - Review process ensures quality

// Result: System maintains coherence while enabling creativity`}</code>
        </pre>

        <h3>6. Perfectionism Over Pragmatism</h3>
        <p>
          <strong>The Problem:</strong> Waiting for perfect solutions instead of
          shipping good-enough solutions that evolve.
        </p>
        <pre>
          <code>{`// ❌ Perfectionism: "Can't ship until perfect"
// - Endless research phase
// - No real-world usage data
// - Over-engineered solutions
// - Delayed delivery

// Result: System never ships, teams build their own

// ✅ Systems thinking: iterative evolution
// - Ship MVP with clear limitations
// - Gather usage data
// - Evolve based on real needs
// - Document tradeoffs explicitly

// Result: System improves based on actual usage`}</code>
        </pre>

        <h3>Warning Signs</h3>
        <p>Watch for these indicators of philosophical drift:</p>
        <ul>
          <li>
            <strong>Component duplication:</strong> Multiple implementations of
            the same pattern indicate lack of systems thinking
          </li>
          <li>
            <strong>Breaking changes:</strong> Frequent breaking changes
            indicate lack of consideration for cascading effects
          </li>
          <li>
            <strong>Low adoption:</strong> If teams aren't using the system, it
            may be treating design as library, not infrastructure
          </li>
          <li>
            <strong>Prop explosion:</strong> Components with 20+ props indicate
            over-abstraction or wrong layer
          </li>
          <li>
            <strong>Inconsistent APIs:</strong> Similar components with
            different APIs indicate lack of governance
          </li>
          <li>
            <strong>No evolution:</strong> System that never changes indicates
            perfectionism over pragmatism
          </li>
        </ul>

        <h3>Recovery Strategies</h3>
        <p>If you recognize these patterns, here's how to recover:</p>
        <ul>
          <li>
            <strong>Audit dependencies:</strong> Map component dependencies to
            understand cascading effects
          </li>
          <li>
            <strong>Establish governance:</strong> Create clear boundaries and
            decision frameworks
          </li>
          <li>
            <strong>Simplify abstractions:</strong> Break down over-abstracted
            components into layered architecture
          </li>
          <li>
            <strong>Enable composition:</strong> Provide building blocks instead
            of trying to anticipate every use case
          </li>
          <li>
            <strong>Ship incrementally:</strong> Start with good-enough
            solutions and evolve based on usage
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'system-health-metrics',
    title: 'Warning Signs & System Health Metrics',
    order: 8.75,
    content: (
      <>
        <p>
          Monitoring system health helps identify problems before they become
          crises. Here are key metrics and warning signs to watch:
        </p>

        <h3>Adoption Metrics</h3>
        <p>
          <strong>Component Usage Rate:</strong> Track how many teams are using
          system components vs. building their own.
        </p>
        <ul>
          <li>
            <strong>Healthy:</strong> {'>'}80% of components use system
            primitives
          </li>
          <li>
            <strong>Warning:</strong> 60-80% usage—some teams are bypassing
            system
          </li>
          <li>
            <strong>Critical:</strong> {'<'}60% usage—system is failing to meet
            needs
          </li>
        </ul>

        <p>
          <strong>Token Adoption:</strong> Percentage of hardcoded values vs.
          token references.
        </p>
        <ul>
          <li>
            <strong>Healthy:</strong> {'<'}5% hardcoded values
          </li>
          <li>
            <strong>Warning:</strong> 5-15% hardcoded—some teams not using
            tokens
          </li>
          <li>
            <strong>Critical:</strong> {'>'}15% hardcoded—token system not
            working
          </li>
        </ul>

        <h3>Consistency Metrics</h3>
        <p>
          <strong>Component Duplication:</strong> Number of duplicate component
          implementations.
        </p>
        <ul>
          <li>
            <strong>Healthy:</strong> Zero duplicates—all teams use system
            components
          </li>
          <li>
            <strong>Warning:</strong> 1-3 duplicates—some teams reinventing
          </li>
          <li>
            <strong>Critical:</strong> {'>'}3 duplicates—system not meeting
            needs
          </li>
        </ul>

        <p>
          <strong>API Consistency:</strong> Variation in component APIs across
          implementations.
        </p>
        <ul>
          <li>
            <strong>Healthy:</strong> Consistent APIs—same patterns across
            components
          </li>
          <li>
            <strong>Warning:</strong> Some inconsistency—patterns diverging
          </li>
          <li>
            <strong>Critical:</strong> High inconsistency—no shared patterns
          </li>
        </ul>

        <h3>Quality Metrics</h3>
        <p>
          <strong>Breaking Changes:</strong> Frequency of breaking changes per
          release.
        </p>
        <ul>
          <li>
            <strong>Healthy:</strong> Zero breaking changes—system evolves
            smoothly
          </li>
          <li>
            <strong>Warning:</strong> 1-2 breaking changes—some cascading
            effects
          </li>
          <li>
            <strong>Critical:</strong> {'>'}3 breaking changes—poor systems
            thinking
          </li>
        </ul>

        <p>
          <strong>Accessibility Regression:</strong> Number of accessibility
          issues introduced per release.
        </p>
        <ul>
          <li>
            <strong>Healthy:</strong> Zero regressions—accessibility maintained
          </li>
          <li>
            <strong>Warning:</strong> 1-2 regressions—needs attention
          </li>
          <li>
            <strong>Critical:</strong> {'>'}3 regressions—accessibility not
            prioritized
          </li>
        </ul>

        <h3>Performance Metrics</h3>
        <p>
          <strong>Bundle Size Growth:</strong> Rate of bundle size increase.
        </p>
        <ul>
          <li>
            <strong>Healthy:</strong> {'<'}5% growth per quarter
          </li>
          <li>
            <strong>Warning:</strong> 5-10% growth—monitoring needed
          </li>
          <li>
            <strong>Critical:</strong> {'>'}10% growth—system bloat
          </li>
        </ul>

        <p>
          <strong>Component Load Time:</strong> Average time to load system
          components.
        </p>
        <ul>
          <li>
            <strong>Healthy:</strong> {'<'}100ms load time
          </li>
          <li>
            <strong>Warning:</strong> 100-200ms—acceptable but monitor
          </li>
          <li>
            <strong>Critical:</strong> {'>'}200ms—performance degradation
          </li>
        </ul>

        <h3>Governance Metrics</h3>
        <p>
          <strong>PR Review Time:</strong> Average time to review system
          contributions.
        </p>
        <ul>
          <li>
            <strong>Healthy:</strong> {'<'}24 hours—responsive governance
          </li>
          <li>
            <strong>Warning:</strong> 24-48 hours—some delays
          </li>
          <li>
            <strong>Critical:</strong> {'>'}48 hours—governance bottleneck
          </li>
        </ul>

        <p>
          <strong>Contribution Rate:</strong> Number of teams contributing to
          system.
        </p>
        <ul>
          <li>
            <strong>Healthy:</strong> Multiple teams contributing—system is
            collaborative
          </li>
          <li>
            <strong>Warning:</strong> Only system team contributing—adoption
            issue
          </li>
          <li>
            <strong>Critical:</strong> No contributions—system is library, not
            infrastructure
          </li>
        </ul>

        <h3>Early Warning Signs</h3>
        <p>Watch for these indicators that precede larger problems:</p>
        <ul>
          <li>
            <strong>Increasing support requests:</strong> Teams asking "how do I
            do X?" indicates missing patterns
          </li>
          <li>
            <strong>Forking behavior:</strong> Teams creating their own
            components indicates system gaps
          </li>
          <li>
            <strong>Slow adoption:</strong> New components not being adopted
            indicates usability issues
          </li>
          <li>
            <strong>Breaking changes:</strong> Frequent breaking changes
            indicate poor systems thinking
          </li>
          <li>
            <strong>Documentation gaps:</strong> Outdated or missing docs
            indicate maintenance issues
          </li>
          <li>
            <strong>Test failures:</strong> Increasing test failures indicate
            quality degradation
          </li>
        </ul>

        <h3>Monitoring Strategy</h3>
        <p>Implement monitoring to track these metrics:</p>
        <ul>
          <li>
            <strong>Automated tracking:</strong> Use tools to track component
            usage, token adoption, and API consistency
          </li>
          <li>
            <strong>Regular audits:</strong> Quarterly reviews of system health
            metrics
          </li>
          <li>
            <strong>Team surveys:</strong> Gather feedback on system usability
            and gaps
          </li>
          <li>
            <strong>Performance monitoring:</strong> Track bundle size, load
            times, and runtime performance
          </li>
          <li>
            <strong>Accessibility scans:</strong> Automated accessibility
            testing to catch regressions
          </li>
        </ul>
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

// Add verification checklist
content.verificationChecklist = [
  {
    id: 'systems-thinking',
    label:
      'I can explain how a change in one part of the system affects other parts',
    description: 'Understanding cascading effects',
    required: true,
  },
  {
    id: 'tradeoff-awareness',
    label: 'I can identify tradeoffs in design system decisions',
    description: 'Recognizing that every choice has consequences',
    required: true,
  },
  {
    id: 'socio-technical',
    label: 'I understand how technical decisions impact team adoption',
    description: 'Seeing systems as socio-technical infrastructure',
    required: false,
  },
];

// Add assessment prompts
content.assessmentPrompts = [
  {
    question:
      'Think about a recent design system decision. What tradeoffs were involved? How did the system philosophy guide that decision?',
    type: 'reflection',
  },
  {
    question:
      'Describe a scenario where a "perfect" technical solution failed due to social/organizational factors. How could systems thinking have prevented this?',
    type: 'application',
  },
];

// Add cross-references
content.crossReferences = {
  concepts: [
    {
      slug: 'tokens',
      title: 'Design Tokens',
      description: 'How tokens encode design decisions',
      type: 'foundation',
    },
    {
      slug: 'component-architecture',
      title: 'Component Architecture',
      description: 'How philosophy shapes component structure',
      type: 'foundation',
    },
  ],
  components: [],
  glossary: ['design-system', 'token', 'component'],
};

export const metadata = generateFoundationMetadata(pageMetadata);

export default function PhilosophyPage() {
  return <FoundationPage content={content} />;
}
