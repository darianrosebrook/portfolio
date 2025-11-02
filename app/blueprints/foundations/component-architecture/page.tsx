/**
 * Foundation: Component Architecture Basics
 * Aligned with the layered component-complexity philosophy
 */

import type {
  FoundationPageMetadata,
  FoundationSection,
} from '@/types/foundationContent';
import { generateFoundationMetadata } from '@/utils/metadata/foundationMetadata';
import Link from 'next/link';
import { createFoundationContent } from '../_lib/contentBuilder';
import { FoundationPage } from '../_lib/pageWrapper';

const pageMetadata: FoundationPageMetadata = {
  title: 'Component Architecture Basics',
  description:
    'Learn the layered approach to component architecture: primitives, compounds, composers, and assemblies. Understand how composition becomes a governance strategy that channels complexity into legible, maintainable structures.',
  slug: 'component-architecture',
  canonicalUrl:
    'https://darianrosebrook.com/blueprints/foundations/component-architecture',
  published_at: new Date().toISOString(),
  modified_at: new Date().toISOString(),
  image: 'https://darianrosebrook.com/darianrosebrook.jpg',
  keywords:
    'components, architecture, primitives, compounds, composers, assemblies, composition',
  learning: {
    learning_level: 'foundation',
    role_relevance: ['engineering', 'design'],
    prerequisites: ['tokens', 'accessibility'],
    next_units: [],
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
    expertise: ['Component Architecture', 'React', 'Design Systems'],
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
    title: 'Why Component Architecture Matters',
    order: 3,
    content: (
      <>
        <p>
          When design systems first take root, they begin with components:
          buttons, inputs, icons, toggles. The goal is consistency, but
          consistency alone doesn't explain why complexity creeps in. Over time,
          you notice the neat catalog breaks down: forms behave differently
          across contexts, toolbars overflow with actions, editors sprout
          feature walk-throughs, and pagination mutates with ellipses and
          compact modes.
        </p>
        <p>
          The problem isn't that your system is "messy." The problem is that
          you're seeing composition at work. Complexity in digital interfaces
          rarely comes from primitives themselves—it emerges when small parts
          are combined, orchestrated, and pushed against application workflows.
        </p>
        <p>
          To build systems that endure, you need a lens that helps you
          anticipate this layering before it manifests in code. The layered
          component methodology provides: a way to classify, compose, and govern
          components across four levels of scale—primitives, compounds,
          composers, and assemblies.
        </p>
      </>
    ),
  },
  {
    type: 'core-concepts',
    id: 'core-concepts',
    title: 'Core Concepts: The Four Layers',
    order: 4,
    content: (
      <>
        <h3>1. Primitives</h3>
        <p>
          Primitives are the ground floor: irreducible building blocks like
          buttons, text inputs, checkboxes, icons, and typographic elements.
          Their goals are stability, accessibility, and consistency. They should
          be as "boring" as possible.
        </p>
        <p>
          <strong>Examples:</strong> Button, Input, Checkbox, Icon
        </p>
        <p>
          <strong>Work of the system:</strong> naming, tokens, accessibility
          patterns
        </p>
        <p>
          <strong>Pitfalls:</strong> bloated props, reinventing label or error
          logic inside each input
        </p>
        <p>
          The paradox of primitives is that their importance is inversely
          proportional to their excitement. The most boring components—when
          standardized and consistent—enable the most creative outcomes at
          higher layers.
        </p>

        <h3>2. Compounds</h3>
        <p>
          Compounds bundle primitives into predictable, reusable groupings. They
          codify conventions and reduce repeated decision-making. Compounds
          emerge when teams repeatedly combine the same primitives in the same
          ways.
        </p>
        <p>
          <strong>Examples:</strong> TextField (input + label + error),
          TableRow, Card, Chip
        </p>
        <p>
          <strong>Work of the system:</strong> defining which sub-parts exist,
          providing safe variations
        </p>
        <p>
          <strong>Pitfalls:</strong> "mega-props" that attempt to account for
          every variation
        </p>
        <p>
          The compound layer is where convention becomes codified. Instead of
          asking designers and developers to reinvent the bundle every time, the
          system codifies the convention.
        </p>

        <h3>3. Composers</h3>
        <p>
          Composers orchestrate state, interaction, and context across multiple
          children. This is where systems meet complexity: modals, toolbars,
          message composers, pagination. They often contain compounds and
          primitives.
        </p>
        <p>
          <strong>Examples:</strong> Modal, Form Field, Toolbar, Pagination,
          Rich Text Editor
        </p>
        <p>
          <strong>Work of the system:</strong> governing orchestration, exposing
          slots, avoiding prop explosion
        </p>
        <p>
          <strong>Pitfalls:</strong> burying orchestration in ad-hoc props
          instead of a clear context model
        </p>
        <p>
          Composers exist because user interactions don't stop at a single
          element— they span across elements. They coordinate multiple states,
          flows, and roles.
        </p>

        <h3>4. Assemblies</h3>
        <p>
          Assemblies are application-specific flows encoded as components. They
          aren't universal system primitives; they're product constructs that
          use the system's primitives, compounds, and composers.
        </p>
        <p>
          <strong>Examples:</strong> Checkout Flow, Project Board, Analytics
          Dashboard
        </p>
        <p>
          <strong>Work of the system:</strong> provide the building blocks;
          assemblies live at the app layer
        </p>
        <p>
          <strong>Pitfalls:</strong> accidentally "baking in" assemblies as
          universal components, which ossifies the system
        </p>
        <p>
          Assemblies belong at the application layer, not the system layer. The
          system provides the language; assemblies are the sentences written in
          that language.
        </p>

        <h3>Meta-Patterns Across All Layers</h3>
        <p>Regardless of layer, three meta-patterns ensure scalability:</p>
        <ul>
          <li>
            <strong>Slotting & Substitution:</strong> Anticipate replaceable
            regions (children, slots, render props). This enables composition
            without breaking orchestration.
          </li>
          <li>
            <strong>Headless Abstractions:</strong> Separate logic (hooks,
            providers) from presentation (styled components). This enables reuse
            across platforms and contexts.
          </li>
          <li>
            <strong>Contextual Orchestration:</strong> Treat composers as state
            providers, not just visual containers. This enables complex
            interactions without prop drilling.
          </li>
        </ul>
        <p>
          These aren't just coding tricks—they're governance strategies. They
          help a design system resist collapse under exceptions.
        </p>
      </>
    ),
  },
  {
    type: 'system-roles',
    id: 'system-roles',
    title: 'System Roles: How Layering Shapes System Success',
    order: 5,
    content: (
      <>
        <h3>Scalability Impact</h3>
        <p>
          Layered architecture enables systems to scale gracefully. When you
          need a new variant, you compose existing pieces rather than creating
          new components. Primitives provide stability, compounds codify
          conventions, composers orchestrate complexity, and assemblies remain
          at the product layer.
        </p>

        <h3>Governance Impact</h3>
        <p>
          Clear layer boundaries make governance easier. Primitive APIs change
          rarely because every downstream component depends on them. Compounds
          provide blessed combinations that prevent drift. Composers govern
          orchestration patterns. Assemblies stay out of the system entirely.
        </p>

        <h3>Team Autonomy Impact</h3>
        <p>
          Layered architecture enables team autonomy. Product teams can compose
          solutions inside system boundaries without waiting for new one-off
          components. The system team defines boundaries and patterns; product
          teams compose solutions within those boundaries.
        </p>

        <h3>Complexity Management Impact</h3>
        <p>
          The layered approach channels complexity into legible structures. A
          button is stable. A field is orchestrated. A toolbar overflows
          gracefully. A rich text editor governs the chaos of paste and plugins.
          Complexity isn't eliminated—it's governed.
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
          The layered architecture bridges design and code. Let's examine how
          each layer manifests in actual component implementations.
        </p>

        <h3>Primitives: Minimal, Stable APIs</h3>
        <p>
          Primitives are the foundation layer. They have minimal APIs, stable
          interfaces, and single responsibilities. Here's how a primitive{' '}
          <code>Button</code> looks:
        </p>

        <pre>
          <code>{`// Primitive: Button - minimal, stable API
export interface ButtonProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'tertiary';
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ size = 'medium', variant = 'primary', disabled, onClick, children }, ref) => {
    return (
      <button
        ref={ref}
        className={styles.button}
        data-size={size}
        data-variant={variant}
        disabled={disabled}
        onClick={onClick}
      >
        {children}
      </button>
    );
  }
);

// Primitive characteristics:
// - Single responsibility: renders a button
// - Minimal props: size, variant, disabled, onClick
// - Stable API: rarely changes
// - No dependencies on other components
// - Composable: can be used anywhere`}</code>
        </pre>

        <h3>Compounds: Composed Primitives</h3>
        <p>
          Compounds combine primitives into common patterns. They provide
          blessed combinations that prevent drift. Here's how a compound{' '}
          <code>TextField</code> composes <code>Input</code> and{' '}
          <code>Label</code>:
        </p>

        <pre>
          <code>{`// Compound: TextField - composes Input + Label
export interface TextFieldProps {
  id?: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  // ... Input props
}

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  ({ id, label, description, error, ...inputProps }, ref) => {
    const inputId = React.useId();
    const resolvedId = id ?? \`tf-\${inputId}\`;
    
    return (
      <div className={styles.field}>
        {label && (
          <Label htmlFor={resolvedId}>
            {label}
          </Label>
        )}
        <Input
          id={resolvedId}
          ref={ref}
          aria-describedby={describedBy}
          invalid={!!error}
          {...inputProps}
        />
        {description && (
          <div className={styles.description}>
            {description}
          </div>
        )}
        {error && (
          <div role="alert" className={styles.error}>
            {error}
          </div>
        )}
      </div>
    );
  }
);

// Compound characteristics:
// - Composes primitives (Input, Label)
// - Handles relationships (label association, error display)
// - Provides blessed pattern (field structure)
// - More complex than primitives, less than composers
// - Common enough to deserve a compound`}</code>
        </pre>

        <h3>Composers: Stateful Orchestration</h3>
        <p>
          Composers orchestrate complex interactions through context and state
          management. They provide slots for composition while managing
          orchestration logic. Here's how a composer <code>Field</code> works:
        </p>

        <pre>
          <code>{`// Composer: Field - stateful orchestration with slots
const FieldContext = createContext<FieldContextValue | null>(null);

export const Field = Object.assign(FieldComponent, {
  Label,
  Error: ErrorText,
  Help: HelpText,
});

const FieldComponent = React.forwardRef<HTMLDivElement, FieldProps>(
  ({ children, className }, ref) => {
    const fieldContext = useFieldCtx();
    
    return (
      <FieldProvider value={fieldContext}>
        <div
          ref={ref}
          className={styles.root}
          role="group"
          aria-labelledby={fieldContext.labelId}
          data-status={fieldContext.status}
        >
          <div className={styles.header}>
            <Field.Label />
          </div>
          <div className={styles.control}>
            {children} {/* Slot for input component */}
            {fieldContext.status === 'validating' && (
              <Spinner size="sm" />
            )}
          </div>
          <div className={styles.meta}>
            <Field.Error />
            <Field.Help />
          </div>
        </div>
      </FieldProvider>
    );
  }
);

// Usage: Field orchestrates, user provides input
<Field>
  <Input /> {/* Slot */}
</Field>

// Composer characteristics:
// - Manages state (validation, focus, errors)
// - Provides context for child components
// - Has slots for composition (children)
// - Orchestrates complex interactions
// - More complex than compounds, but still reusable`}</code>
        </pre>

        <h3>API Design Differences Between Layers</h3>
        <p>
          Each layer has different API design constraints. Primitives expose
          props directly. Compounds manage relationships. Composers manage state
          and provide context:
        </p>

        <pre>
          <code>{`// Primitive API: Direct props
<Button variant="primary" size="medium" onClick={handleClick}>
  Submit
</Button>

// Compound API: Managed relationships
<TextField
  label="Email"
  description="Enter your email address"
  error={errors.email}
  value={email}
  onChange={setEmail}
/>

// Composer API: Context + slots
<Field>
  <Field.Label>Email</Field.Label>
  <Input
    value={email}
    onChange={setEmail}
  />
  <Field.Error>{errors.email}</Field.Error>
  <Field.Help>Enter your email address</Field.Help>
</Field>

// Layer comparison:
// - Primitives: Simple props, no dependencies
// - Compounds: Managed props, composes primitives
// - Composers: Context + slots, manages state`}</code>
        </pre>

        <h3>Composition Patterns</h3>
        <p>
          Different layers use different composition patterns. Primitives use
          direct composition. Compounds use controlled composition. Composers
          use context-based composition:
        </p>

        <pre>
          <code>{`// Pattern 1: Direct Composition (Primitives)
// User composes primitives directly
<div>
  <Label htmlFor="email">Email</Label>
  <Input id="email" />
  <Button onClick={handleSubmit}>Submit</Button>
</div>

// Pattern 2: Compound Composition (Compounds)
// Compound handles internal composition
<TextField
  label="Email"
  error={errors.email}
/>

// Pattern 3: Slot Composition (Composers)
// Composer provides slots, user fills them
<Card>
  <Card.Header>
    <Card.Title>Title</Card.Title>
  </Card.Header>
  <Card.Content>
    Content here
  </Card.Content>
  <Card.Footer>
    <Button>Action</Button>
  </Card.Footer>
</Card>

// Pattern 4: Context Composition (Composers)
// Context manages state, slots provide flexibility
<Field>
  <Field.Label>Email</Field.Label>
  <Input /> {/* Context provides state */}
  <Field.Error />
</Field>`}</code>
        </pre>

        <h3>Real-World Impact</h3>
        <p>
          This layered architecture enables predictable scaling. When you need a
          new button variant, you add it to the primitive. When you need a new
          field pattern, you compose primitives into a compound. When you need
          complex orchestration, you create a composer with slots.
        </p>

        <p>
          The layers create boundaries that guide decisions. Should this be a
          primitive? Does it need state management? Should it be reusable? The
          layer answers these questions, making architecture decisions
          predictable and scalable.
        </p>
      </>
    ),
  },
  {
    type: 'applied-example',
    id: 'applied-example',
    title: 'Applied Example: Building a Form Field System',
    order: 7,
    content: (
      <>
        <p>
          Let's build a form field system following the layered architecture
          approach:
        </p>

        <h3>Step 1: Start with Primitives</h3>
        <p>Build stable, boring primitives first:</p>
        <pre>
          <code>{`// ✅ Primitive: Input - stable, boring, predictable
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(styles.input, className)}
        aria-invalid={invalid}
        {...props}
      />
    );
  }
);

// Primitive characteristics:
// - Single responsibility: just input
// - No assumptions about context
// - Stable API (rarely changes)
// - Composable (can be used anywhere)

// ✅ Primitive: Label - also stable
export const Label = ({ htmlFor, children, ...props }) => {
  return (
    <label htmlFor={htmlFor} {...props}>
      {children}
    </label>
  );
};

// ✅ Primitive: ErrorText - stable
export const ErrorText = ({ id, children, ...props }) => {
  return (
    <span id={id} role="alert" {...props}>
      {children}
    </span>
  );
};`}</code>
        </pre>

        <h3>Step 2: Create Compound Component</h3>
        <p>Compose primitives into a compound component:</p>
        <pre>
          <code>{`// ✅ Compound: TextField - codifies convention
export const TextField = ({ 
  label, 
  error, 
  id,
  ...inputProps 
}) => {
  const inputId = id || useId();
  const errorId = \`\${inputId}-error\`;
  
  return (
    <div className={styles.field}>
      <Label htmlFor={inputId}>
        {label}
      </Label>
      <Input
        id={inputId}
        invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        {...inputProps}
      />
      {error && (
        <ErrorText id={errorId}>
          {error}
        </ErrorText>
      )}
    </div>
  );
};

// Compound characteristics:
// - Codifies convention: label + input + error
// - Handles relationships between primitives
// - Provides accessibility (aria-describedby)
// - Standardizes spacing and layout`}</code>
        </pre>

        <h3>Step 3: Build Composer for Complex Cases</h3>
        <p>Create composer for complex form orchestration:</p>
        <pre>
          <code>{`// ✅ Composer: Field - orchestrates complexity
const FieldContext = createContext<FieldContextValue | null>(null);

export const Field = ({ children, error, required, ...props }) => {
  const id = useId();
  const errorId = \`\${id}-error\`;
  
  const contextValue = {
    id,
    errorId,
    error,
    required,
  };
  
  return (
    <FieldContext.Provider value={contextValue}>
      <div className={styles.field} {...props}>
        {children}
      </div>
    </FieldContext.Provider>
  );
};

// Field sub-components use context:
Field.Label = ({ children }) => {
  const context = useContext(FieldContext);
  if (!context) throw new Error('Field.Label must be inside Field');
  
  return (
    <Label htmlFor={context.id} required={context.required}>
      {children}
    </Label>
  );
};

Field.Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ ...props }, ref) => {
    const context = useContext(FieldContext);
    if (!context) throw new Error('Field.Input must be inside Field');
    
    return (
      <Input
        ref={ref}
        id={context.id}
        invalid={!!context.error}
        aria-describedby={context.error ? context.errorId : undefined}
        {...props}
      />
    );
  }
);

Field.Error = ({ children }) => {
  const context = useContext(FieldContext);
  if (!context) return null;
  
  return (
    <ErrorText id={context.errorId}>
      {context.error || children}
    </ErrorText>
  );
};

Field.Help = ({ children }) => {
  const context = useContext(FieldContext);
  if (!context) return null;
  
  return (
    <span id={\`\${context.id}-help\`} className={styles.help}>
      {children}
    </span>
  );
};

// Usage:
<Field error={formErrors.email}>
  <Field.Label>Email</Field.Label>
  <Field.Input type="email" />
  <Field.Error />
  <Field.Help>We'll never share your email</Field.Help>
</Field>`}</code>
        </pre>

        <h3>Step 4: Choose the Right Layer</h3>
        <p>Decide which layer to use based on complexity:</p>
        <ul>
          <li>
            <strong>Simple case:</strong> Use compound (TextField)
            <pre>
              <code>{`<TextField 
  label="Email"
  error={errors.email}
  type="email"
/>`}</code>
            </pre>
          </li>
          <li>
            <strong>Complex case:</strong> Use composer (Field)
            <pre>
              <code>{`<Field error={errors.email}>
  <Field.Label>Email</Field.Label>
  <Field.Input type="email" />
  <Field.Error />
  <Field.Help>We'll never share your email</Field.Help>
</Field>`}</code>
            </pre>
          </li>
          <li>
            <strong>Edge case:</strong> Compose primitives directly
            <pre>
              <code>{`<div className={styles.customField}>
  <Label htmlFor="custom">Custom</Label>
  <Input id="custom" />
  {/* Custom layout, custom error handling */}
</div>`}</code>
            </pre>
          </li>
        </ul>

        <h3>Step 5: Understand Layer Responsibilities</h3>
        <p>Each layer has clear responsibilities:</p>
        <ul>
          <li>
            <strong>Primitives:</strong> Single responsibility, stable APIs,
            composable
          </li>
          <li>
            <strong>Compounds:</strong> Codify conventions, handle common
            relationships, standardize patterns
          </li>
          <li>
            <strong>Composers:</strong> Orchestrate complex state, provide
            context, enable flexible composition
          </li>
        </ul>

        <h3>Real-World Impact</h3>
        <p>This layered architecture provides:</p>
        <ul>
          <li>
            <strong>Flexibility:</strong> Use the right layer for each use case
          </li>
          <li>
            <strong>Stability:</strong> Primitives rarely change, enabling
            system evolution
          </li>
          <li>
            <strong>Consistency:</strong> Compounds ensure standard patterns
            across the system
          </li>
          <li>
            <strong>Power:</strong> Composers handle complex cases without
            breaking simple ones
          </li>
          <li>
            <strong>Maintainability:</strong> Clear boundaries make system
            easier to understand and evolve
          </li>
        </ul>
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
        <p>Layered architecture involves tradeoffs:</p>
        <ul>
          <li>
            <strong>Boring vs. Expressive:</strong> Primitives must be boring to
            be stable. Expressiveness belongs in compounds, composers, or
            assemblies. This can feel limiting but enables creativity at higher
            layers.
          </li>
          <li>
            <strong>Convention vs. Flexibility:</strong> Compounds codify
            conventions, which limits flexibility but prevents drift. Teams must
            decide when to use compounds versus composing primitives directly.
          </li>
          <li>
            <strong>Orchestration vs. Simplicity:</strong> Composers add
            complexity through orchestration but simplify usage through context.
            Simple use cases might feel over-engineered, but complex cases
            benefit from orchestration.
          </li>
          <li>
            <strong>System vs. Product:</strong> Assemblies belong at the
            product layer, not the system layer. This can feel restrictive but
            prevents system ossification.
          </li>
        </ul>
        <p>
          The key is understanding when to operate at each layer and respecting
          layer boundaries. Primitives demand standards. Compounds demand
          conventions. Composers demand orchestration. Assemblies demand
          boundaries.
        </p>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'component-anti-patterns',
    title: 'Component Anti-Patterns & Layer Misclassification',
    order: 8.5,
    content: (
      <>
        <p>
          Understanding component anti-patterns helps avoid common mistakes that
          undermine architectural integrity:
        </p>

        <h3>1. Layer Misclassification</h3>
        <p>
          <strong>The Problem:</strong> Components placed in the wrong layer,
          breaking architectural boundaries.
        </p>
        <pre>
          <code>{`// ❌ Anti-pattern: Compound as Primitive
// Input primitive that includes label logic
export const Input = ({ label, error, ...props }) => {
  return (
    <div>
      <label>{label}</label>
      <input {...props} />
      {error && <span>{error}</span>}
    </div>
  );
};

// Problems:
// - Primitive doing compound work
// - Can't use Input without label/error
// - Breaks layer boundaries
// - Hard to compose flexibly

// ✅ Correct: Layer separation
// Primitive: just the input
export const Input = ({ ...props }) => {
  return <input {...props} />;
};

// Compound: Input + Label + Error
export const TextField = ({ label, error, ...props }) => {
  return (
    <div>
      <Label>{label}</Label>
      <Input {...props} />
      {error && <ErrorText>{error}</ErrorText>}
    </div>
  );
};

// Benefits:
// - Clear layer boundaries
// - Primitive can be used independently
// - Compound composes primitives
// - Flexible composition`}</code>
        </pre>

        <h3>2. Prop Explosion</h3>
        <p>
          <strong>The Problem:</strong> Components with too many props,
          indicating wrong layer or poor abstraction.
        </p>
        <pre>
          <code>{`// ❌ Anti-pattern: prop explosion
<UniversalComponent
  type="button"
  variant="primary"
  size="medium"
  icon="arrow"
  iconPosition="left"
  loading={false}
  disabled={false}
  fullWidth={false}
  rounded={true}
  shadow={true}
  gradient={false}
  animation="fade"
  // ... 20 more props
/>

// Problems:
// - Too many decisions per usage
// - Hard to remember all props
// - Indicates wrong layer
// - Tries to be everything

// ✅ Correct: Composition over configuration
<Button variant="primary" size="medium">
  <Icon name="arrow" />
  Click me
</Button>

// Benefits:
// - Simple, clear API
// - Composition handles complexity
// - Right layer for the problem
// - Easy to understand`}</code>
        </pre>

        <h3>3. Tight Coupling</h3>
        <p>
          <strong>The Problem:</strong> Components tightly coupled to specific
          implementations, preventing reuse.
        </p>
        <pre>
          <code>{`// ❌ Anti-pattern: tight coupling
export const FormField = () => {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  
  // Hardcoded validation logic
  const validate = () => {
    if (!value.includes('@')) {
      setError('Invalid email');
    }
  };
  
  return (
    <div>
      <input value={value} onChange={(e) => setValue(e.target.value)} />
      {error && <span>{error}</span>}
    </div>
  );
};

// Problems:
// - Validation logic baked in
// - Can't reuse for other fields
// - Tightly coupled to email
// - Hard to test

// ✅ Correct: Separation of concerns
export const TextField = ({ value, onChange, error, ...props }) => {
  return (
    <div>
      <Input value={value} onChange={onChange} {...props} />
      {error && <ErrorText>{error}</ErrorText>}
    </div>
  );
};

// Validation handled outside component
<TextField
  value={email}
  onChange={setEmail}
  error={validateEmail(email)}
/>

// Benefits:
// - Reusable component
// - Validation logic separate
// - Easy to test
// - Flexible usage`}</code>
        </pre>

        <h3>4. Wrong Layer for Problem</h3>
        <p>
          <strong>The Problem:</strong> Using the wrong layer for the problem,
          creating unnecessary complexity or constraints.
        </p>
        <pre>
          <code>{`// ❌ Anti-pattern: Composer for simple problem
// Using Field composer for simple input
<Field>
  <Field.Label>Email</Field.Label>
  <Input />
  <Field.Error />
</Field>

// Problems:
// - Over-engineered for simple case
// - Too much ceremony
// - Harder than needed
// - Wrong tool for job

// ✅ Correct: Right layer for problem
// Simple case: use Compound
<TextField label="Email" />

// Complex case: use Composer
<Field>
  <Field.Label>Email</Field.Label>
  <Input />
  <Field.Error />
  <Field.Help />
</Field>

// Benefits:
// - Right tool for the job
// - Simple cases stay simple
// - Complex cases have power
// - Clear when to use what`}</code>
        </pre>

        <h3>5. Missing Abstractions</h3>
        <p>
          <strong>The Problem:</strong> Repeating patterns instead of creating
          reusable abstractions.
        </p>
        <pre>
          <code>{`// ❌ Anti-pattern: repeating patterns
// Same pattern repeated everywhere
function EmailField() {
  return (
    <div>
      <label>Email</label>
      <input type="email" />
    </div>
  );
}

function PasswordField() {
  return (
    <div>
      <label>Password</label>
      <input type="password" />
    </div>
  );
}

// Problems:
// - Code duplication
// - Inconsistent implementations
// - Hard to maintain
// - Missed abstraction opportunity

// ✅ Correct: Abstract the pattern
export const TextField = ({ label, type, ...props }) => {
  return (
    <div>
      <Label>{label}</Label>
      <Input type={type} {...props} />
    </div>
  );
};

// Usage:
<TextField label="Email" type="email" />
<TextField label="Password" type="password" />

// Benefits:
// - Single source of truth
// - Consistent implementation
// - Easy to maintain
// - Reusable abstraction`}</code>
        </pre>

        <h3>6. Over-Composition</h3>
        <p>
          <strong>The Problem:</strong> Creating unnecessary layers when simpler
          solutions would work.
        </p>
        <pre>
          <code>{`// ❌ Anti-pattern: unnecessary abstraction
// Creating wrapper for simple case
export const EmailInput = () => {
  return <TextField type="email" />;
};

// Problems:
// - Unnecessary abstraction
// - Adds no value
// - Extra layer to maintain
// - Over-engineering

// ✅ Correct: Use directly
<TextField type="email" label="Email" />

// Benefits:
// - Direct usage
// - No unnecessary layers
// - Clear intent
// - Simpler codebase`}</code>
        </pre>

        <h3>Warning Signs</h3>
        <p>Watch for these indicators of architectural problems:</p>
        <ul>
          <li>
            <strong>Prop explosion:</strong> Components with 20+ props indicate
            wrong layer or poor abstraction
          </li>
          <li>
            <strong>Layer violations:</strong> Primitives doing compound work or
            compounds doing composer work
          </li>
          <li>
            <strong>Code duplication:</strong> Same patterns repeated across
            components indicate missing abstractions
          </li>
          <li>
            <strong>Tight coupling:</strong> Components that can't be used
            independently indicate wrong boundaries
          </li>
          <li>
            <strong>Over-engineering:</strong> Complex solutions for simple
            problems indicate wrong layer
          </li>
          <li>
            <strong>Under-engineering:</strong> Simple solutions for complex
            problems indicate missing abstractions
          </li>
        </ul>

        <h3>Recovery Strategies</h3>
        <p>If you recognize these patterns, here's how to recover:</p>
        <ul>
          <li>
            <strong>Audit layer boundaries:</strong> Review components to ensure
            they're in the right layer
          </li>
          <li>
            <strong>Extract abstractions:</strong> Identify repeated patterns
            and create reusable components
          </li>
          <li>
            <strong>Simplify APIs:</strong> Break down components with too many
            props into compositions
          </li>
          <li>
            <strong>Refactor boundaries:</strong> Move components to correct
            layers based on responsibilities
          </li>
          <li>
            <strong>Enable composition:</strong> Provide building blocks instead
            of monolithic components
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'architecture-health-metrics',
    title: 'Warning Signs & Architecture Health',
    order: 8.75,
    content: (
      <>
        <p>
          Monitor component architecture health to maintain system integrity:
        </p>

        <h3>Layer Health Metrics</h3>
        <p>
          <strong>Layer Violations:</strong> Number of components in wrong
          layers.
        </p>
        <ul>
          <li>
            <strong>Healthy:</strong> Zero violations—all components in correct
            layers
          </li>
          <li>
            <strong>Warning:</strong> 1-3 violations—some misclassification
          </li>
          <li>
            <strong>Critical:</strong> {'>'}3 violations—architecture breaking
          </li>
        </ul>

        <p>
          <strong>Primitive Stability:</strong> Percentage of primitives that
          haven't changed APIs in 6 months.
        </p>
        <ul>
          <li>
            <strong>Healthy:</strong> {'>'}90% stable—primitives are stable
          </li>
          <li>
            <strong>Warning:</strong> 70-90% stable—some instability
          </li>
          <li>
            <strong>Critical:</strong> {'<'}70% stable—primitives not stable
          </li>
        </ul>

        <h3>Composition Metrics</h3>
        <p>
          <strong>Composition Rate:</strong> Percentage of components using
          composition vs. monolithic.
        </p>
        <ul>
          <li>
            <strong>Healthy:</strong> {'>'}80% composed—system uses composition
          </li>
          <li>
            <strong>Warning:</strong> 60-80% composed—some monolithic components
          </li>
          <li>
            <strong>Critical:</strong> {'<'}60% composed—missing composition
            patterns
          </li>
        </ul>

        <p>
          <strong>Prop Explosion:</strong> Number of components with {'>'}15
          props.
        </p>
        <ul>
          <li>
            <strong>Healthy:</strong> Zero—all components have reasonable APIs
          </li>
          <li>
            <strong>Warning:</strong> 1-3 components—some need refactoring
          </li>
          <li>
            <strong>Critical:</strong> {'>'}3 components—wrong layer or poor
            abstraction
          </li>
        </ul>

        <h3>Reusability Metrics</h3>
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
          <strong>API Consistency:</strong> Percentage of components following
          consistent API patterns.
        </p>
        <ul>
          <li>
            <strong>Healthy:</strong> {'>'}90% consistent—clear patterns
          </li>
          <li>
            <strong>Warning:</strong> 70-90% consistent—some divergence
          </li>
          <li>
            <strong>Critical:</strong> {'<'}70% consistent—no shared patterns
          </li>
        </ul>

        <h3>Early Warning Signs</h3>
        <p>Watch for these indicators of architecture problems:</p>
        <ul>
          <li>
            <strong>Increasing prop counts:</strong> Components with more props
            indicate wrong layer
          </li>
          <li>
            <strong>Component duplication:</strong> Teams creating their own
            versions indicates gaps
          </li>
          <li>
            <strong>Tight coupling:</strong> Components that can't be used
            independently indicate wrong boundaries
          </li>
          <li>
            <strong>Missing abstractions:</strong> Repeated patterns indicate
            missing component layers
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'architecture-migration-strategies',
    title: 'Component Architecture Migration & Evolution',
    order: 8.9,
    content: (
      <>
        <p>
          Evolving component architecture requires careful refactoring
          strategies:
        </p>

        <h3>Layer Refactoring</h3>
        <p>Move components to correct layers:</p>
        <ol>
          <li>
            <strong>Identify layer violations:</strong> Find components in wrong
            layers
          </li>
          <li>
            <strong>Extract primitives:</strong> Break down compound components
            into primitives
          </li>
          <li>
            <strong>Recompose:</strong> Build compounds from primitives
          </li>
          <li>
            <strong>Update consumers:</strong> Migrate usage to new structure
          </li>
          <li>
            <strong>Deprecate old:</strong> Remove old component after migration
          </li>
        </ol>

        <h3>Component Refactoring Pattern</h3>
        <p>Refactor components while maintaining compatibility:</p>
        <pre>
          <code>{`// Phase 1: Extract primitives from compound
// Before: Compound doing too much
export const TextField = ({ label, error, ...props }) => {
  return (
    <div>
      <label>{label}</label>
      <input {...props} />
      {error && <span>{error}</span>}
    </div>
  );
};

// After: Extract primitives
export const Label = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor}>{children}</label>
);

export const Input = ({ ...props }) => (
  <input {...props} />
);

export const ErrorText = ({ id, children }) => (
  <span id={id} role="alert">{children}</span>
);

// Phase 2: Recompose as compound
export const TextField = ({ label, error, id, ...props }) => {
  const inputId = id || useId();
  const errorId = \`\${inputId}-error\`;
  
  return (
    <div>
      <Label htmlFor={inputId}>{label}</Label>
      <Input id={inputId} {...props} />
      {error && <ErrorText id={errorId}>{error}</ErrorText>}
    </div>
  );
};

// Phase 3: Support both APIs during migration
// Phase 4: Deprecate old API
// Phase 5: Remove old API`}</code>
        </pre>

        <h3>Prop Explosion Recovery</h3>
        <p>Refactor components with too many props:</p>
        <ul>
          <li>
            <strong>Extract variants:</strong> Create separate components for
            different variants
          </li>
          <li>
            <strong>Use composition:</strong> Break into smaller composable
            components
          </li>
          <li>
            <strong>Context API:</strong> Use context for shared state instead
            of props
          </li>
          <li>
            <strong>Compound pattern:</strong> Use compound components for
            flexible APIs
          </li>
        </ul>

        <h3>Versioning Strategy</h3>
        <p>Version components to enable safe evolution:</p>
        <pre>
          <code>{`// Version components for breaking changes
// v1: Original API
export const ButtonV1 = ({ variant, ...props }) => {
  return <button className={variantStyles[variant]} {...props} />;
};

// v2: New API (breaking change)
export const ButtonV2 = ({ appearance, ...props }) => {
  return <button className={appearanceStyles[appearance]} {...props} />;
};

// Main export supports both during transition
export const Button = ({ variant, appearance, ...props }) => {
  if (appearance) {
    return <ButtonV2 appearance={appearance} {...props} />;
  }
  console.warn('Button variant prop deprecated. Use appearance instead.');
  return <ButtonV1 variant={variant} {...props} />;
};

// After migration: Remove v1 support`}</code>
        </pre>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'cross-platform-components',
    title: 'Cross-Platform Component Considerations',
    order: 8.95,
    content: (
      <>
        <p>
          Component architecture must adapt to different platforms while
          maintaining consistency:
        </p>

        <h3>Platform-Native Components</h3>
        <p>Use platform-native primitives when appropriate:</p>
        <ul>
          <li>
            <strong>Web:</strong> HTML elements (button, input, select)
          </li>
          <li>
            <strong>iOS:</strong> UIKit/SwiftUI components (UIButton,
            UITextField)
          </li>
          <li>
            <strong>Android:</strong> Material Components (Button, TextInput)
          </li>
          <li>
            <strong>React Native:</strong> Cross-platform primitives (View,
            Text, TouchableOpacity)
          </li>
        </ul>

        <h3>Shared Component Contracts</h3>
        <p>Define consistent APIs across platforms:</p>
        <pre>
          <code>{`// Shared component contract (TypeScript interface)
interface ButtonProps {
  label: string;
  variant: 'primary' | 'secondary' | 'ghost';
  size: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  onPress: () => void;
}

// Web implementation
export const Button: React.FC<ButtonProps> = ({
  label,
  variant,
  size,
  disabled,
  loading,
  onPress,
}) => {
  return (
    <button
      className={\`button button--\${variant} button--\${size}\`}
      disabled={disabled || loading}
      onClick={onPress}
    >
      {loading ? 'Loading...' : label}
    </button>
  );
};

// iOS implementation (Swift)
struct Button: View {
  let label: String
  let variant: Variant
  let size: Size
  let disabled: Bool
  let loading: Bool
  let onPress: () -> Void
  
  var body: some View {
    SwiftUI.Button(action: onPress) {
      Text(loading ? "Loading..." : label)
    }
    .buttonStyle(ButtonStyle(variant: variant, size: size))
    .disabled(disabled || loading)
  }
}

// Android implementation (Kotlin)
class Button(
  context: Context,
  attrs: AttributeSet
) : MaterialButton(context, attrs) {
  fun setVariant(variant: Variant) { /* ... */ }
  fun setSize(size: Size) { /* ... */ }
  fun setLoading(loading: Boolean) { /* ... */ }
}`}</code>
        </pre>

        <h3>Layer Consistency Across Platforms</h3>
        <p>Maintain consistent layer architecture:</p>
        <ul>
          <li>
            <strong>Primitives:</strong> Platform-native elements with
            consistent APIs
          </li>
          <li>
            <strong>Compounds:</strong> Platform-specific implementations with
            shared patterns
          </li>
          <li>
            <strong>Composers:</strong> Orchestration logic can be shared
            (business logic)
          </li>
        </ul>

        <h3>Platform-Specific Adaptations</h3>
        <p>Adapt components for platform conventions:</p>
        <ul>
          <li>
            <strong>Touch targets:</strong> iOS (44pt), Android (48dp), Web
            (44px)
          </li>
          <li>
            <strong>Navigation:</strong> iOS (back button), Android (system
            back), Web (browser back)
          </li>
          <li>
            <strong>Typographic scales:</strong> Platform-specific font
            rendering requires adjustments
          </li>
          <li>
            <strong>Animation:</strong> Platform-specific animation APIs
          </li>
        </ul>

        <h3>Cross-Platform Testing</h3>
        <p>Test components across platforms:</p>
        <ul>
          <li>
            <strong>Visual regression:</strong> Compare screenshots across
            platforms
          </li>
          <li>
            <strong>Interaction testing:</strong> Verify interactions work
            correctly on each platform
          </li>
          <li>
            <strong>Accessibility:</strong> Test with platform-specific
            assistive technologies
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'component-testing-strategies',
    title: 'Component Testing Strategies',
    order: 8.97,
    content: (
      <>
        <p>
          Comprehensive testing ensures component quality and prevents
          regressions:
        </p>

        <h3>Unit Testing</h3>
        <p>Test component behavior in isolation:</p>
        <pre>
          <code>{`// Component unit test
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with label', () => {
    render(<Button label="Click me" onPress={jest.fn()} />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  it('calls onPress when clicked', () => {
    const onPress = jest.fn();
    render(<Button label="Click me" onPress={onPress} />);
    fireEvent.click(screen.getByText('Click me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
  
  it('disables button when disabled prop is true', () => {
    render(<Button label="Click me" disabled onPress={jest.fn()} />);
    expect(screen.getByText('Click me')).toBeDisabled();
  });
  
  it('shows loading state', () => {
    render(<Button label="Click me" loading onPress={jest.fn()} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByText('Click me')).toBeDisabled();
  });
});`}</code>
        </pre>

        <h3>Accessibility Testing</h3>
        <p>Test component accessibility:</p>
        <pre>
          <code>{`// Accessibility testing
import { axe, toHaveNoViolations } from 'jest-axe';
import { render } from '@testing-library/react';
import { Button } from './Button';

expect.extend(toHaveNoViolations);

describe('Button accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(
      <Button label="Click me" onPress={jest.fn()} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  it('should be keyboard accessible', () => {
    render(<Button label="Click me" onPress={jest.fn()} />);
    const button = screen.getByRole('button');
    button.focus();
    expect(button).toHaveFocus();
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(onPress).toHaveBeenCalled();
  });
  
  it('should have accessible label', () => {
    render(<Button label="Click me" onPress={jest.fn()} />);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });
});`}</code>
        </pre>

        <h3>Visual Regression Testing</h3>
        <p>Test visual consistency across changes:</p>
        <pre>
          <code>{`// Visual regression testing with Chromatic/Storybook
import { within, userEvent } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

export default {
  title: 'Components/Button',
  component: Button,
};

export const Primary = {
  args: {
    label: 'Click me',
    variant: 'primary',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await userEvent.click(button);
    await expect(button).toHaveClass('button--primary');
  },
};

// Chromatic captures screenshots automatically
// Compares against baseline images`}</code>
        </pre>

        <h3>Integration Testing</h3>
        <p>Test component interactions with other components:</p>
        <pre>
          <code>{`// Integration test: Form with Button
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from './Form';
import { Button } from './Button';

describe('Form integration', () => {
  it('submits form when button is clicked', async () => {
    const onSubmit = jest.fn();
    render(
      <Form onSubmit={onSubmit}>
        <input name="email" />
        <Button label="Submit" type="submit" />
      </Form>
    );
    
    await userEvent.type(screen.getByRole('textbox', { name: /email/i }), 'test@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
    });
  });
});`}</code>
        </pre>

        <h3>Layer-Specific Testing</h3>
        <p>Test each layer appropriately:</p>
        <ul>
          <li>
            <strong>Primitives:</strong> Test props, rendering, basic
            interactions
          </li>
          <li>
            <strong>Compounds:</strong> Test composition, relationships between
            primitives
          </li>
          <li>
            <strong>Composers:</strong> Test state management, context
            propagation, complex interactions
          </li>
        </ul>

        <h3>Test Coverage Goals</h3>
        <p>Maintain appropriate test coverage:</p>
        <ul>
          <li>
            <strong>Primitives:</strong> 100% coverage—simple, critical building
            blocks
          </li>
          <li>
            <strong>Compounds:</strong> 90%+ coverage—important conventions
          </li>
          <li>
            <strong>Composers:</strong> 80%+ coverage—complex, prioritize
            critical paths
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'applied-example',
    id: 'architecture-case-studies',
    title: 'Real-World Architecture Case Studies',
    order: 8.98,
    content: (
      <>
        <p>These case studies demonstrate component architecture evolution:</p>

        <h3>Case Study 1: Layer Refactoring</h3>
        <p>
          <strong>Challenge:</strong> A "compound" component (TextField) was
          doing too much—handling validation, styling, layout, and business
          logic.
        </p>
        <p>
          <strong>Process:</strong>
        </p>
        <ol>
          <li>Identified layer violation (compound doing composer work)</li>
          <li>Extracted primitives (Input, Label, ErrorText)</li>
          <li>Recomposed as proper compound (TextField using primitives)</li>
          <li>Moved business logic to composer layer (FormField)</li>
          <li>Migrated existing usage incrementally</li>
        </ol>
        <p>
          <strong>Results:</strong>
        </p>
        <ul>
          <li>TextField API simplified (5 props → 3 props)</li>
          <li>Primitives reusable in other contexts</li>
          <li>Business logic isolated and testable</li>
          <li>System became more flexible and maintainable</li>
        </ul>

        <h3>Case Study 2: Prop Explosion Recovery</h3>
        <p>
          <strong>Challenge:</strong> A Button component had 22 props, making it
          difficult to use and maintain.
        </p>
        <p>
          <strong>Process:</strong>
        </p>
        <ol>
          <li>Analyzed all button usage patterns</li>
          <li>Identified that props were solving different problems</li>
          <li>
            Extracted variants to separate components (IconButton,
            LoadingButton)
          </li>
          <li>Used compound pattern for complex cases (ButtonGroup)</li>
          <li>Reduced core Button to 5 essential props</li>
        </ol>
        <p>
          <strong>Results:</strong>
        </p>
        <ul>
          <li>Button props: 22 → 5</li>
          <li>Component usage became clearer</li>
          <li>Fewer bugs (simpler API = fewer edge cases)</li>
          <li>Teams adopted new API quickly</li>
        </ul>

        <h3>Case Study 3: Component Duplication Elimination</h3>
        <p>
          <strong>Challenge:</strong> 5 teams had created their own versions of
          the same component (Card), leading to inconsistency.
        </p>
        <p>
          <strong>Process:</strong>
        </p>
        <ol>
          <li>Audited all duplicate components</li>
          <li>Identified common patterns and differences</li>
          <li>Built flexible compound component (Card with slots)</li>
          <li>Migrated teams to shared component</li>
          <li>Documented usage patterns</li>
        </ol>
        <p>
          <strong>Results:</strong>
        </p>
        <ul>
          <li>Component duplication: 5 versions → 1 shared component</li>
          <li>Visual consistency improved across product</li>
          <li>Maintenance burden reduced (1 component vs. 5)</li>
          <li>Teams contributed improvements to shared component</li>
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

// Add verification checklist
content.verificationChecklist = [
  {
    id: 'layer-understanding',
    label:
      'I understand the four layers: primitives, compounds, composers, assemblies',
    description: 'Understanding layer taxonomy',
    required: true,
  },
  {
    id: 'primitive-stability',
    label: 'I keep primitives boring, stable, and predictable',
    description: 'Primitive stability',
    required: true,
  },
  {
    id: 'compound-conventions',
    label: 'I use compounds to codify conventions, not solve every variation',
    description: 'Compound conventions',
    required: true,
  },
  {
    id: 'composer-orchestration',
    label:
      'I use composers to orchestrate complexity, not just bundle components',
    description: 'Composer orchestration',
    required: true,
  },
  {
    id: 'assembly-boundaries',
    label: 'I keep assemblies at the product layer, not the system layer',
    description: 'Assembly boundaries',
    required: true,
  },
  {
    id: 'meta-patterns',
    label:
      'I apply meta-patterns (slotting, headless, contextual orchestration) appropriately',
    description: 'Meta-pattern application',
    required: false,
  },
];

// Add assessment prompts
content.assessmentPrompts = [
  {
    question:
      'When should you create a new primitive versus a compound versus a composer? What factors influence this decision?',
    type: 'reflection',
  },
  {
    question:
      'Explain how composition becomes a governance strategy. How does layered architecture enable team autonomy while maintaining system coherence?',
    type: 'application',
  },
  {
    question:
      'Describe a scenario where a component was built at the wrong layer. How would you refactor it to the correct layer?',
    type: 'application',
  },
];

// Add cross-references
content.crossReferences = {
  concepts: [
    {
      slug: 'philosophy',
      title: 'Philosophy of Design Systems',
      description: 'The systems thinking behind layered architecture',
      type: 'foundation',
    },
    {
      slug: 'tokens',
      title: 'Design Tokens',
      description: 'How tokens integrate with component layers',
      type: 'foundation',
    },
    {
      slug: 'accessibility',
      title: 'Accessibility',
      description: 'How accessibility shapes component APIs across layers',
      type: 'foundation',
    },
  ],
  components: [],
  glossary: ['primitive', 'compound', 'composer', 'assembly'],
};

// Add additional resources section
sections.push({
  type: 'additional-resources',
  id: 'deep-dives',
  title: 'Deep Dives',
  order: 12,
  content: (
    <>
      <p>Explore detailed guidance on each layer:</p>
      <ul>
        <li>
          <Link href="/blueprints/component-standards/component-complexity/primitives">
            Primitives Deep Dive
          </Link>
          {' — Irreducible building blocks'}
        </li>
        <li>
          <Link href="/blueprints/component-standards/component-complexity/compound">
            Compounds Deep Dive
          </Link>
          {' — Predictable bundles'}
        </li>
        <li>
          <Link href="/blueprints/component-standards/component-complexity/composer">
            Composers Deep Dive
          </Link>
          {' — Orchestration patterns'}
        </li>
        <li>
          <Link href="/blueprints/component-standards/component-complexity/assemblies">
            Assemblies Deep Dive
          </Link>
          {' — Product layer boundaries'}
        </li>
        <li>
          <Link href="/blueprints/component-standards/component-complexity">
            Component Complexity Overview
          </Link>
          {' — Full methodology and case studies'}
        </li>
      </ul>
    </>
  ),
});

export const metadata = generateFoundationMetadata(pageMetadata);

export default function ComponentArchitecturePage() {
  return <FoundationPage content={content} />;
}
