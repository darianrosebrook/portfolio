import Link from 'next/link';
import { Sandpack } from '@codesandbox/sandpack-react';

export const metadata = {
  title: 'Primitives | Component Standards',
  description:
    'Primitives are irreducible, stable, accessible building blocks that consume tokens and set the foundation for compounds, composers, and assemblies.',
  keywords: [
    'Primitives',
    'Design System',
    'Accessibility',
    'Tokens',
    'Button',
    'Input',
    'Checkbox',
    'Icon',
  ],
  complexity: 'primitive',
};

export default function Page() {
  return (
    <section className="content">
      <article>
        <h1>Deep Dive: Primitives in Design Systems</h1>
        <h2>Why Primitives Matter</h2>
        <p>
          Primitives are the ground floor of any design system. They're the
          atoms: the smallest irreducible components that represent a single
          design decision. Buttons, inputs, checkboxes, icons, typographic
          elements—each is small enough to feel trivial, but together they form
          the grammar of every interface.
        </p>
        <p>
          The paradox of primitives is that their importance is inversely
          proportional to their excitement. The most boring components—when
          standardized and consistent—enable the most creative outcomes at
          higher layers. When they're unstable or inconsistent, complexity
          compounds exponentially across compounds, composers, and assemblies.
        </p>
        <p>That's why primitives must be:</p>
        <ul>
          <li>
            Stable: their APIs change rarely, because every downstream component
            depends on them.
          </li>
          <li>
            Accessible: they bake in baseline ARIA and keyboard support, so
            teams can't "forget" the fundamentals.
          </li>
          <li>
            Consistent: they enforce token usage and naming conventions that
            ripple through the entire system.
          </li>
        </ul>
        <p>
          In short: primitives must be boring, so everything above them can be
          interesting.
        </p>
        <h2>The Work of Primitives</h2>
        <h3>1. Standards and Naming</h3>
        <p>
          Primitives encode standards into the system. A Button isn't just a
          clickable element—it carries naming conventions, semantic intent, and
          design tokens for states (default, hover, active, disabled).
        </p>
        <ul>
          <li>
            Correct naming avoids confusion: ButtonPrimary vs. ButtonSecondary
            is clearer than BlueButton vs. GrayButton.
          </li>
          <li>
            Token references ensure consistency: --color-action-primary instead
            of #0055ff.
          </li>
        </ul>
        <h3>2. Tokens as DNA</h3>
        <p>
          Every primitive should consume tokens, not hardcoded values. This
          links design intent directly to code and allows system-wide theming
          without rewrites.
        </p>
        <ul>
          <li>
            Typography primitives consume font.size, font.weight, line-height.
          </li>
          <li>Inputs consume color.border, radius.sm, space.200.</li>
          <li>
            Buttons consume color.background.brand, color.foreground.onBrand.
          </li>
        </ul>
        <h3>3. Accessibility Baselines</h3>
        <p>Primitives are the system's first line of accessibility defense.</p>
        <ul>
          <li>
            Buttons must always be focusable, keyboard-activatable, and
            screen-reader friendly.
          </li>
          <li>
            Inputs must handle labels, ARIA attributes, and states like disabled
            and required.
          </li>
          <li>
            Checkboxes must be operable with space/enter, expose
            checked/indeterminate states, and be properly labelled.
          </li>
        </ul>
        <p>
          Because these patterns are embedded in primitives, downstream teams
          don't have to learn them anew for every feature.
        </p>
        <h2>Pitfalls of Primitives</h2>
        <ol>
          <li>
            Bloated Props
            <p>
              A primitive is not meant to cover every use case. Overloading a
              Button with every possible prop ("size, variant, tone, emphasis,
              density, iconPosition, isLoading, isGhost, isText, isIconOnly,
              shape, animation, elevation…") is a sign that you're asking a
              primitive to do compound or composer work.
            </p>
            <p>
              Guardrail: primitives should expose only intrinsic variations. For
              Button, that might be:
            </p>
            <ul>
              <li>size (sm, md, lg)</li>
              <li>variant (primary, secondary, danger)</li>
              <li>state (disabled, loading)</li>
            </ul>
          </li>
          <li>
            Reinventing Label/Error Logic
            <p>
              Inputs are especially prone to this. A TextInput primitive should
              not reinvent labels or error messaging inside itself. That's the
              job of a Field composer. Mixing these concerns creates duplicated
              accessibility bugs and inconsistent UX.
            </p>
          </li>
          <li>
            Skipping Tokens
            <p>
              A primitive that uses hex codes or inline styles instead of tokens
              creates technical debt: theming, dark mode, and cross-brand parity
              all break downstream.
            </p>
          </li>
          <li>
            "Cute" or Over-Styled Primitives
            <p>
              Primitives should be boring. Introducing expressive styles
              (gradients, shadows, animations) into primitives makes them
              fragile. Expressiveness belongs in compounds, composers, or
              product assemblies—not in the atomic layer.
            </p>
          </li>
        </ol>
        <h2>Examples in Practice</h2>
        <h3>Button</h3>
        <Sandpack
          template="react-ts"
          theme="light"
          files={{
            '/Button.tsx': `export interface ButtonProps {
  /** Visual weight of the button */
  variant?: 'primary' | 'secondary' | 'danger';
  /** Size of the button */
  size?: 'sm' | 'md' | 'lg';
  /** Disabled state */
  disabled?: boolean;
  /** Optional loading spinner */
  isLoading?: boolean;
  children: React.ReactNode;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  disabled, 
  isLoading, 
  children 
}: ButtonProps) {
  return (
    <button
      className={\`btn btn-\${variant} btn-\${size}\`}
      disabled={disabled || isLoading}
      style={{
        padding: size === 'sm' ? '8px 12px' : size === 'lg' ? '12px 20px' : '10px 16px',
        backgroundColor: variant === 'primary' ? '#007bff' : variant === 'danger' ? '#dc3545' : '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        opacity: disabled || isLoading ? 0.6 : 1,
        fontSize: size === 'sm' ? '14px' : size === 'lg' ? '18px' : '16px'
      }}
    >
      {isLoading && <span>⏳ </span>}
      <span>{children}</span>
    </button>
  );
}`,
            '/App.tsx': `import { Button } from './Button';

export default function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui' }}>
      <h2>Button Primitive Examples</h2>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="danger">Danger</Button>
      </div>
      
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </div>
      
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <Button disabled>Disabled</Button>
        <Button isLoading>Loading</Button>
      </div>
      
      <p style={{ marginTop: '20px', color: '#666' }}>
        ✅ Stable API with clear props<br/>
        ✅ Consistent styling via design tokens<br/>
        ✅ Accessible by default<br/>
        ✅ Predictable behavior
      </p>
    </div>
  );
}`,
          }}
          options={{
            showLineNumbers: true,
            showInlineErrors: true,
            wrapContent: true,
            editorHeight: 350,
          }}
        />
        <ul>
          <li>
            Boring: it doesn't manage focus rings, tooltips, or confirm dialogs.
          </li>
          <li>
            Tokenized: btn-${'${variant}'} and btn-${'${size}'} map to system
            tokens.
          </li>
          <li>
            Accessible: spinner has aria-hidden; disabled state is standard
            HTML.
          </li>
        </ul>
        <h3>Input (primitive, no labels/errors)</h3>
        <Sandpack
          template="react-ts"
          theme="light"
          files={{
            '/Input.tsx': `export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Visual size */
  size?: 'sm' | 'md' | 'lg';
}

export function Input(props: InputProps) {
  const { size = 'md', ...inputProps } = props;
  
  return (
    <input 
      {...inputProps} 
      className={\`input input-\${size}\`}
      style={{
        padding: size === 'sm' ? '6px 8px' : size === 'lg' ? '12px 16px' : '8px 12px',
        fontSize: size === 'sm' ? '14px' : size === 'lg' ? '18px' : '16px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        outline: 'none',
        width: '100%',
        boxSizing: 'border-box',
        ...props.disabled && { 
          backgroundColor: '#f5f5f5', 
          cursor: 'not-allowed' 
        }
      }}
      onFocus={(e) => {
        e.target.style.borderColor = '#007bff';
        e.target.style.boxShadow = '0 0 0 2px rgba(0, 123, 255, 0.25)';
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        e.target.style.borderColor = '#ccc';
        e.target.style.boxShadow = 'none';
        props.onBlur?.(e);
      }}
    />
  );
}`,
            '/App.tsx': `import { Input } from './Input';

export default function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui' }}>
      <h2>Input Primitive Examples</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Sizes</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Input size="sm" placeholder="Small input" />
          <Input size="md" placeholder="Medium input (default)" />
          <Input size="lg" placeholder="Large input" />
        </div>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>States</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Input placeholder="Normal input" />
          <Input placeholder="Disabled input" disabled />
          <Input placeholder="Required input" required />
        </div>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Types</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Input type="text" placeholder="Text input" />
          <Input type="email" placeholder="Email input" />
          <Input type="password" placeholder="Password input" />
          <Input type="number" placeholder="Number input" />
        </div>
      </div>
      
      <p style={{ color: '#666' }}>
        ✅ No labels or error handling (that's for Field composer)<br/>
        ✅ Focuses on core input behavior<br/>
        ✅ Consistent sizing via props<br/>
        ✅ Extends native HTML input attributes
      </p>
    </div>
  );
}`,
          }}
          options={{
            showLineNumbers: true,
            showInlineErrors: true,
            wrapContent: true,
            editorHeight: 350,
          }}
        />
        <ul>
          <li>
            Labels and error messages are handled by the Field composer, not
            inside Input.
          </li>
          <li>
            Accessibility features (like associating &lt;label for&gt; with id)
            are downstream responsibilities.
          </li>
        </ul>
        <h2>Why "Boring" is Strategic</h2>
        <p>
          Primitives exist in the most places, and they change the least often.
          If you get primitives wrong:
        </p>
        <ul>
          <li>Every higher-level component inherits the problem.</li>
          <li>Fixes become exponentially expensive.</li>
          <li>
            Teams lose trust in the system and roll their own "button" or
            "input," fragmenting the system.
          </li>
        </ul>
        <p>If you get primitives right:</p>
        <ul>
          <li>
            Accessibility, consistency, and tokens scale automatically across
            compounds and composers.
          </li>
          <li>
            Designers and developers think less about the basics and more about
            solving domain problems.
          </li>
          <li>
            Your system becomes the default choice because it's easier to use
            than to reimplement.
          </li>
        </ul>
        <h2>Summary</h2>
        <p>
          Primitives are irreducible, boring, and essential. They demand
          standards because they set the foundation on which all{' '}
          <Link href="/blueprints/component-standards/component-complexity/compound">
            compounds
          </Link>
          ,
          <Link href="/blueprints/component-standards/component-complexity/composer">
            composers
          </Link>
          , and{' '}
          <Link href="/blueprints/component-standards/component-complexity/assemblies">
            assemblies
          </Link>{' '}
          depend. Their role is not to be expressive—it's to be predictable,
          tokenized, and accessible.
        </p>
        <ul>
          <li>Examples: Button, Input, Checkbox, Icon</li>
          <li>Work of the system: naming, tokens, accessibility patterns</li>
          <li>
            Pitfalls: bloated props, reinventing label/error logic, skipping
            tokens
          </li>
        </ul>
        <p>
          In the layered methodology, primitives are the only layer where
          "boring is a feature, not a bug." Their discipline is what allows the
          more complex layers—
          <Link href="/blueprints/component-standards/component-complexity/compound">
            compounds
          </Link>
          ,{' '}
          <Link href="/blueprints/component-standards/component-complexity/composer">
            composers
          </Link>
          , and{' '}
          <Link href="/blueprints/component-standards/component-complexity/assemblies">
            assemblies
          </Link>
          —to flourish without collapsing under exceptions.
        </p>

        <h2>Next Steps</h2>
        <p>
          Once you have solid primitives, you can start building{' '}
          <Link href="/blueprints/component-standards/component-complexity/compound">
            compounds
          </Link>{' '}
          that bundle them together, or explore how{' '}
          <Link href="/blueprints/component-standards/component-complexity/composer">
            composers
          </Link>{' '}
          orchestrate them in complex interactions.
        </p>
      </article>
      <Link href="/blueprints/component-standards/component-complexity">
        ← Back to Component Standards
      </Link>
    </section>
  );
}
