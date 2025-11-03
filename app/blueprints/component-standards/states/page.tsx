import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'States & Variants Standards | Component Standards',
  description:
    'Define and show all interactive states and visual variants. Learn how to document component states, variants, and their interactions.',
  keywords: [
    'Design System',
    'Component States',
    'Component Variants',
    'Interactive States',
    'Visual Variants',
  ],
};

export default function StatesStandardsPage() {
  return (
    <section>
      <article className="content">
        <h1>States & Variants Standards</h1>
        <p>
          Components exist in multiple states and variants. States represent
          interactive conditions (hover, focus, disabled), while variants
          represent visual style options (primary, secondary, ghost). Clearly
          defining and documenting these ensures consistent implementation and
          predictable user experiences.
        </p>

        <h2>Why States & Variants Matter</h2>
        <p>Well-defined states and variants:</p>
        <ul>
          <li>
            <strong>Consistency:</strong> Same states work the same way across
            components
          </li>
          <li>
            <strong>Predictability:</strong> Users know what to expect
          </li>
          <li>
            <strong>Accessibility:</strong> States communicate meaning to all
            users
          </li>
          <li>
            <strong>Maintainability:</strong> Clear definitions prevent drift
          </li>
        </ul>

        <h2>Component States</h2>

        <h3>Default State</h3>
        <p>The base, unmodified state of a component:</p>
        <pre>
          <code>{`// Default button state
<Button>Click me</Button>

// Default state styling
.button {
  background: var(--semantic-color-background-primary);
  color: var(--semantic-color-foreground-primary);
}`}</code>
        </pre>

        <h3>Interactive States</h3>
        <p>States triggered by user interaction:</p>
        <ul>
          <li>
            <strong>Hover:</strong> Mouse pointer over element
          </li>
          <li>
            <strong>Focus:</strong> Element has keyboard focus
          </li>
          <li>
            <strong>Active:</strong> Element is being activated (click/press)
          </li>
          <li>
            <strong>Pressed:</strong> Element is in pressed state (toggle
            buttons)
          </li>
        </ul>
        <pre>
          <code>{`// Interactive states
.button {
  &:hover {
    background: var(--semantic-color-background-primary-hover);
  }
  
  &:focus-visible {
    outline: 2px solid var(--semantic-color-border-focus);
    outline-offset: 2px;
  }
  
  &:active {
    background: var(--semantic-color-background-primary-active);
  }
  
  &[aria-pressed="true"] {
    background: var(--semantic-color-background-primary-pressed);
  }
}`}</code>
        </pre>

        <h3>Functional States</h3>
        <p>States related to component functionality:</p>
        <ul>
          <li>
            <strong>Disabled:</strong> Component is not interactive
          </li>
          <li>
            <strong>Loading:</strong> Component is processing an action
          </li>
          <li>
            <strong>Error:</strong> Component has an error state
          </li>
          <li>
            <strong>Success:</strong> Component indicates successful action
          </li>
        </ul>
        <pre>
          <code>{`// Functional states
<Button disabled>Disabled</Button>
<Button loading>Loading...</Button>
<Input error="Invalid email" />
<Input success />

// State styling
.button {
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
  
  &[aria-busy="true"] {
    opacity: 0.7;
    cursor: wait;
  }
}`}</code>
        </pre>

        <h3>State Combinations</h3>
        <p>Components can have multiple states simultaneously:</p>
        <pre>
          <code>{`// Multiple states
<Button disabled loading>Processing...</Button>

// Handle state combinations
.button {
  &:disabled {
    // Disabled takes precedence
    pointer-events: none;
    
    &:hover {
      // Disabled buttons don't hover
      background: inherit;
    }
  }
}`}</code>
        </pre>

        <h2>Component Variants</h2>

        <h3>Visual Variants</h3>
        <p>Variants that change visual appearance:</p>
        <pre>
          <code>{`// Button variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>

// Variant styling
.button {
  &--primary {
    background: var(--semantic-color-background-primary);
    color: var(--semantic-color-foreground-on-primary);
  }
  
  &--secondary {
    background: var(--semantic-color-background-secondary);
    color: var(--semantic-color-foreground-on-secondary);
  }
  
  &--ghost {
    background: transparent;
    border: 1px solid var(--semantic-color-border-default);
  }
  
  &--danger {
    background: var(--semantic-color-background-error);
    color: var(--semantic-color-foreground-on-error);
  }
}`}</code>
        </pre>

        <h3>Size Variants</h3>
        <p>Variants that change component size:</p>
        <pre>
          <code>{`// Size variants
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// Size styling
.button {
  &--sm {
    padding: var(--semantic-spacing-padding-button-sm);
    font-size: var(--semantic-typography-size-button-sm);
  }
  
  &--md {
    padding: var(--semantic-spacing-padding-button-md);
    font-size: var(--semantic-typography-size-button-md);
  }
  
  &--lg {
    padding: var(--semantic-spacing-padding-button-lg);
    font-size: var(--semantic-typography-size-button-lg);
  }
}`}</code>
        </pre>

        <h2>State Documentation</h2>

        <h3>Required Documentation</h3>
        <p>Every component should document:</p>
        <ul>
          <li>
            <strong>All States:</strong> Default, interactive, functional
          </li>
          <li>
            <strong>Visual Examples:</strong> Show each state visually
          </li>
          <li>
            <strong>Trigger Conditions:</strong> What causes each state
          </li>
          <li>
            <strong>State Combinations:</strong> How states interact
          </li>
          <li>
            <strong>Accessibility:</strong> How states are communicated
          </li>
        </ul>

        <h3>State Matrix</h3>
        <p>Document all state combinations:</p>
        <pre>
          <code>{`/**
 * Button State Matrix
 * 
 * States: default | hover | focus | active | disabled | loading
 * Variants: primary | secondary | ghost | danger
 * 
 * Valid combinations:
 * - primary + default
 * - primary + hover
 * - primary + focus
 * - primary + active
 * - primary + disabled
 * - primary + loading
 * - secondary + default
 * - ... (all combinations)
 * 
 * Invalid combinations:
 * - disabled + hover (disabled prevents hover)
 * - disabled + active (disabled prevents active)
 */`}</code>
        </pre>

        <h2>Variant Patterns</h2>

        <h3>Consistent Variant Names</h3>
        <p>Use consistent variant names across components:</p>
        <pre>
          <code>{`// ✅ Good: Consistent naming
<Button variant="primary" />
<Input variant="primary" />
<Card variant="primary" />

// ❌ Bad: Inconsistent naming
<Button variant="primary" />
<Input appearance="primary" />
<Card style="primary" />`}</code>
        </pre>

        <h3>Semantic Variants</h3>
        <p>Variants should describe purpose, not appearance:</p>
        <pre>
          <code>{`// ✅ Good: Semantic variants
<Button variant="primary" /> // Main action
<Button variant="secondary" /> // Secondary action
<Button variant="danger" /> // Destructive action

// ❌ Bad: Appearance-based variants
<Button variant="blue" />
<Button variant="outlined" />
<Button variant="solid" />`}</code>
        </pre>

        <h2>State Management</h2>

        <h3>Controlled vs Uncontrolled</h3>
        <p>Document whether component manages its own state:</p>
        <pre>
          <code>{`// Uncontrolled: Component manages state
<Button>Click me</Button>

// Controlled: Parent manages state
<Button 
  disabled={isDisabled}
  loading={isLoading}
  onClick={handleClick}
>
  Click me
</Button>`}</code>
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

        <h2>Visual Documentation</h2>

        <h3>State Examples</h3>
        <p>Visual examples help teams understand states:</p>
        <ul>
          <li>
            <strong>Interactive Showcase:</strong> Live examples users can
            interact with
          </li>
          <li>
            <strong>State Grid:</strong> Grid showing all state combinations
          </li>
          <li>
            <strong>Before/After:</strong> Comparison of state transitions
          </li>
        </ul>

        <h2>Common Pitfalls</h2>

        <h3>1. Missing States</h3>
        <pre>
          <code>{`// ❌ Bad: Missing focus state
.button {
  &:hover {
    background: blue;
  }
  // No focus state!
}

// ✅ Good: All states defined
.button {
  &:hover {
    background: blue;
  }
  &:focus-visible {
    outline: 2px solid blue;
  }
}`}</code>
        </pre>

        <h3>2. Inconsistent State Behavior</h3>
        <pre>
          <code>{`// ❌ Bad: Different disabled behavior
.button.disabled { opacity: 0.5; }
.input.disabled { opacity: 0.3; } // Inconsistent!

// ✅ Good: Consistent disabled behavior
.button:disabled,
.input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}`}</code>
        </pre>

        <h3>3. State Conflicts</h3>
        <pre>
          <code>{`// ❌ Bad: States conflict
.button {
  &:disabled {
    opacity: 0.5;
  }
  &:hover {
    background: blue; // Hover still works when disabled!
  }
}

// ✅ Good: Disabled prevents hover
.button {
  &:disabled {
    opacity: 0.5;
    pointer-events: none;
    
    &:hover {
      background: inherit; // No hover when disabled
    }
  }
}`}</code>
        </pre>

        <h2>Related Resources</h2>
        <ul>
          <li>
            <Link href="/blueprints/component-standards/props">
              Props & API Standards
            </Link>{' '}
            — How props control states and variants
          </li>
          <li>
            <Link href="/blueprints/component-standards/accessibility">
              Accessibility Standards
            </Link>{' '}
            — How states support accessibility
          </li>
          <li>
            <Link href="/blueprints/foundations/tokens">Design Tokens</Link> —
            How tokens define state styling
          </li>
        </ul>
      </article>
    </section>
  );
}
