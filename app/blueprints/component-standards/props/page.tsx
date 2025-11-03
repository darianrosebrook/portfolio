import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Props & API Standards | Component Standards',
  description:
    'Standardize component properties, events, and slots. Learn prop design patterns, API conventions, and how to avoid prop explosion.',
  keywords: [
    'Design System',
    'Component Props',
    'API Design',
    'Component Interface',
    'Prop Patterns',
  ],
};

export default function PropsStandardsPage() {
  return (
    <section>
      <article className="content">
        <h1>Props & API Standards</h1>
        <p>
          Component props define the interface between your design system and
          the teams using it. Well-designed props enable adoption, prevent
          misuse, and scale with complexity. Poorly designed props lead to prop
          explosion, inconsistent usage, and maintenance nightmares.
        </p>

        <h2>Why Props Matter</h2>
        <p>
          Props are the contract between components and consumers. They
          determine:
        </p>
        <ul>
          <li>
            <strong>Usability:</strong> Can developers understand and use the
            component without reading implementation?
          </li>
          <li>
            <strong>Flexibility:</strong> Does the API accommodate common use
            cases without requiring workarounds?
          </li>
          <li>
            <strong>Consistency:</strong> Do similar components follow similar
            prop patterns?
          </li>
          <li>
            <strong>Maintainability:</strong> Can the component evolve without
            breaking consumers?
          </li>
        </ul>

        <h2>Core Principles</h2>

        <h3>1. Prop Names Should Describe Purpose, Not Implementation</h3>
        <pre>
          <code>{`// ❌ Bad: Implementation detail
<Button variant="blue" />

// ✅ Good: Purpose-driven
<Button variant="primary" />`}</code>
        </pre>
        <p>
          Names should communicate intent, not how something is implemented.
          This allows implementation to evolve without breaking the API.
        </p>

        <h3>2. Follow Layer-Appropriate Patterns</h3>
        <p>Different component layers have different prop patterns:</p>
        <ul>
          <li>
            <strong>Primitives:</strong> Minimal props, stable API, predictable
            behavior
          </li>
          <li>
            <strong>Compounds:</strong> Props that coordinate sub-components,
            but avoid prop explosion
          </li>
          <li>
            <strong>Composers:</strong> Use composition patterns (slots, render
            props, context) instead of many props
          </li>
        </ul>

        <h3>3. Use Semantic Types</h3>
        <pre>
          <code>{`// ❌ Bad: Generic types
size: 'small' | 'medium' | 'large'
variant: '1' | '2' | '3'

// ✅ Good: Semantic types
size: 'sm' | 'md' | 'lg'
variant: 'primary' | 'secondary' | 'ghost'`}</code>
        </pre>

        <h3>4. Provide Sensible Defaults</h3>
        <pre>
          <code>{`// ✅ Good: Defaults enable simple usage
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost'; // defaults to 'primary'
  size?: 'sm' | 'md' | 'lg'; // defaults to 'md'
  disabled?: boolean; // defaults to false
}

// Usage: Simple cases don't need all props
<Button>Click me</Button>

// Complex cases can still customize
<Button variant="ghost" size="sm" disabled>
  Cancel
</Button>`}</code>
        </pre>

        <h2>Common Prop Patterns</h2>

        <h3>Variant Pattern</h3>
        <p>
          Use variants for visual style variations that are semantically
          different:
        </p>
        <pre>
          <code>{`interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}

// Variants communicate intent, not just appearance
<Button variant="primary">Save</Button>
<Button variant="danger">Delete</Button>
<Button variant="ghost">Cancel</Button>`}</code>
        </pre>

        <h3>Size Pattern</h3>
        <p>Use consistent size tokens across components:</p>
        <pre>
          <code>{`interface ButtonProps {
  size?: 'sm' | 'md' | 'lg';
}

// Consistent size prop across components
<Button size="sm">Small</Button>
<Input size="sm" />
<Avatar size="sm" />`}</code>
        </pre>

        <h3>State Props</h3>
        <p>Use boolean props for binary states:</p>
        <pre>
          <code>{`interface ButtonProps {
  disabled?: boolean;
  loading?: boolean;
  active?: boolean;
}

// Clear, predictable state management
<Button disabled={isSubmitting}>
  {isSubmitting ? 'Saving...' : 'Save'}
</Button>`}</code>
        </pre>

        <h2>Anti-Patterns & Pitfalls</h2>

        <h3>1. Prop Explosion</h3>
        <p>
          <strong>Problem:</strong> Too many props make components hard to use
          and maintain.
        </p>
        <pre>
          <code>{`// ❌ Bad: 15+ props
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  loadingText?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  rounded?: boolean;
  shadow?: boolean;
  uppercase?: boolean;
  // ... and more
}

// ✅ Good: Use composition instead
<Button variant="primary" icon={<Icon />} iconPosition="left">
  Save
</Button>

// Or extract to compound components
<ButtonGroup>
  <Button variant="primary">Save</Button>
  <Button variant="secondary">Cancel</Button>
</ButtonGroup>`}</code>
        </pre>
        <p>
          <strong>Solution:</strong> Extract related props into compound
          components or use composition patterns.
        </p>

        <h3>2. Magic String Props</h3>
        <p>
          <strong>Problem:</strong> String literals without type safety lead to
          errors.
        </p>
        <pre>
          <code>{`// ❌ Bad: No type safety
<Button variant="primay" /> // Typo! No error

// ✅ Good: TypeScript unions
type ButtonVariant = 'primary' | 'secondary' | 'ghost';
interface ButtonProps {
  variant?: ButtonVariant;
}

<Button variant="primay" /> // TypeScript error!`}</code>
        </pre>

        <h3>3. Props That Control Multiple Concerns</h3>
        <p>
          <strong>Problem:</strong> Single prop controlling multiple behaviors
          creates confusion.
        </p>
        <pre>
          <code>{`// ❌ Bad: One prop controls multiple things
<Button mode="loading-primary-large" />

// ✅ Good: Separate concerns
<Button variant="primary" size="lg" loading />`}</code>
        </pre>

        <h3>4. Inconsistent Prop Names</h3>
        <p>
          <strong>Problem:</strong> Similar components use different prop names
          for the same concept.
        </p>
        <pre>
          <code>{`// ❌ Bad: Inconsistent naming
<Button size="sm" />
<Input scale="sm" />
<Avatar dimension="sm" />

// ✅ Good: Consistent naming
<Button size="sm" />
<Input size="sm" />
<Avatar size="sm" />`}</code>
        </pre>

        <h2>Layer-Specific Guidelines</h2>

        <h3>Primitives</h3>
        <p>Primitives should have minimal, stable props:</p>
        <ul>
          <li>
            <strong>Keep props minimal:</strong> Only essential props, avoid
            convenience props
          </li>
          <li>
            <strong>Stable API:</strong> Props should rarely change
          </li>
          <li>
            <strong>Predictable behavior:</strong> Props should behave
            consistently
          </li>
        </ul>
        <pre>
          <code>{`// ✅ Good primitive: Minimal, stable props
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}`}</code>
        </pre>

        <h3>Compounds</h3>
        <p>
          Compounds coordinate multiple primitives but avoid prop explosion:
        </p>
        <ul>
          <li>
            <strong>Use composition:</strong> Allow children/props to configure
            sub-components
          </li>
          <li>
            <strong>Avoid mega-props:</strong> Don't try to control every
            variation
          </li>
          <li>
            <strong>Provide sensible defaults:</strong> Common cases should work
            out of the box
          </li>
        </ul>
        <pre>
          <code>{`// ✅ Good compound: Coordinates without explosion
interface TextFieldProps {
  label?: string;
  error?: string;
  hint?: string;
  // Delegate to Input primitive
  inputProps?: InputProps;
}

// Simple usage
<TextField label="Email" />

// Advanced usage
<TextField 
  label="Email"
  inputProps={{ type: "email", placeholder: "Enter email" }}
/>`}</code>
        </pre>

        <h3>Composers</h3>
        <p>Composers should use composition patterns, not many props:</p>
        <ul>
          <li>
            <strong>Use slots:</strong> Allow consumers to customize sub-parts
          </li>
          <li>
            <strong>Use render props:</strong> For dynamic content
          </li>
          <li>
            <strong>Use context:</strong> For shared state across children
          </li>
        </ul>
        <pre>
          <code>{`// ✅ Good composer: Uses composition
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode; // Slot for customization
}

<Modal isOpen={isOpen} onClose={handleClose} title="Confirm">
  <p>Are you sure?</p>
  <Modal.Footer> {/* Slot */}
    <Button onClick={handleClose}>Cancel</Button>
    <Button variant="primary">Confirm</Button>
  </Modal.Footer>
</Modal>`}</code>
        </pre>

        <h2>Documentation Standards</h2>

        <h3>Required Documentation</h3>
        <p>Every prop should include:</p>
        <ul>
          <li>
            <strong>Type:</strong> TypeScript type definition
          </li>
          <li>
            <strong>Required:</strong> Whether the prop is required or optional
          </li>
          <li>
            <strong>Default:</strong> Default value if optional
          </li>
          <li>
            <strong>Description:</strong> What the prop does and when to use it
          </li>
          <li>
            <strong>Examples:</strong> Code examples showing usage
          </li>
        </ul>

        <h3>JSDoc Comments</h3>
        <pre>
          <code>{`/**
 * Button component for user actions
 * 
 * @example
 * <Button variant="primary" onClick={handleClick}>
 *   Click me
 * </Button>
 */
interface ButtonProps {
  /**
   * Visual style variant
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'ghost';
  
  /**
   * Size of the button
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Whether the button is disabled
   * @default false
   */
  disabled?: boolean;
  
  /**
   * Click handler
   */
  onClick?: () => void;
  
  /**
   * Button content
   */
  children: React.ReactNode;
}`}</code>
        </pre>

        <h2>Migration & Evolution</h2>

        <h3>Adding New Props</h3>
        <p>When adding props:</p>
        <ol>
          <li>Make them optional with sensible defaults</li>
          <li>Document them thoroughly</li>
          <li>Add examples showing usage</li>
          <li>Consider if composition would be better</li>
        </ol>

        <h3>Deprecating Props</h3>
        <p>When deprecating props:</p>
        <ol>
          <li>Add deprecation warning in JSDoc</li>
          <li>Provide migration path</li>
          <li>Support both old and new API during transition</li>
          <li>Remove after grace period (e.g., 6 months)</li>
        </ol>
        <pre>
          <code>{`interface ButtonProps {
  /**
   * @deprecated Use variant="primary" instead
   */
  primary?: boolean;
  
  /**
   * Visual style variant
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'ghost';
}

// Component implementation
export function Button({ primary, variant, ...props }: ButtonProps) {
  // Support both during migration
  const finalVariant = variant || (primary ? 'primary' : undefined);
  
  if (primary) {
    console.warn('Button primary prop deprecated. Use variant="primary" instead.');
  }
  
  return <button className={variantStyles[finalVariant]} {...props} />;
}`}</code>
        </pre>

        <h2>Related Resources</h2>
        <ul>
          <li>
            <Link href="/blueprints/foundations/component-architecture">
              Component Architecture Basics
            </Link>{' '}
            — Understanding component layers and prop patterns
          </li>
          <li>
            <Link href="/blueprints/foundations/philosophy">
              Philosophy of Design Systems
            </Link>{' '}
            — Systems thinking behind API design
          </li>
          <li>
            <Link href="/blueprints/component-standards/component-complexity">
              Component Complexity Methodology
            </Link>{' '}
            — Layer-specific prop guidelines
          </li>
        </ul>
      </article>
    </section>
  );
}
