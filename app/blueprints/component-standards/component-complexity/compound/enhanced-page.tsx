import {
  DocLayout,
  DocLayoutProvider,
  DocNavigation,
  DocSection,
  useDocLayout,
  type DocSection as DocSectionType,
} from '@/ui/modules/DocLayout/Index';
import Link from 'next/link';

export const metadata = {
  title: 'Compounds | Component Standards',
  description:
    'Compounds bundle primitives into predictable, reusable groupings with baked-in conventions and accessibility.',
  keywords: [
    'Compounds',
    'Design System',
    'Accessibility',
    'Conventions',
    'TextField',
    'TableRow',
    'Card',
    'Chip',
  ],
  complexity: 'compound',
};

const sections: DocSectionType[] = [
  {
    id: 'overview',
    title: 'Why Compounds Exist',
    codeHighlight: {
      file: '/TextField.tsx',
      lines: [1, 25],
    },
  },
  {
    id: 'characteristics',
    title: 'Characteristics',
    codeHighlight: {
      file: '/TextField.tsx',
      lines: [200, 230],
    },
  },
  {
    id: 'examples',
    title: 'Examples',
    codeHighlight: {
      file: '/App.tsx',
      lines: [15, 40],
    },
  },
  {
    id: 'system-work',
    title: 'System Work',
    codeHighlight: {
      file: '/TextField.tsx',
      lines: [40, 80],
    },
  },
  {
    id: 'pitfalls',
    title: 'Pitfalls',
    codeHighlight: {
      file: '/TextField.tsx',
      lines: [100, 150],
    },
  },
  {
    id: 'textfield-example',
    title: 'TextField Example',
    codeHighlight: {
      file: '/App.tsx',
      lines: [1, 60],
    },
  },
];

const codeFiles = {
  '/Input.tsx': `// Primitive Input component (from previous layer)
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  size?: 'sm' | 'md' | 'lg';
}

export function Input(props: InputProps) {
  const { size = 'md', ...inputProps } = props;
  
  return (
    <input 
      {...inputProps} 
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
      }}
      onBlur={(e) => {
        e.target.style.borderColor = '#ccc';
        e.target.style.boxShadow = 'none';
      }}
    />
  );
}`,
  '/TextField.tsx': `import { Input } from './Input';

export interface TextFieldProps {
  id: string;
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export function TextField({ 
  id, 
  label, 
  error, 
  helperText, 
  required, 
  placeholder,
  disabled 
}: TextFieldProps) {
  const describedBy = [
    error ? \`\${id}-error\` : null,
    helperText ? \`\${id}-helper\` : null
  ].filter(Boolean).join(' ') || undefined;

  return (
    <div style={{ marginBottom: '16px' }}>
      <label 
        htmlFor={id}
        style={{
          display: 'block',
          marginBottom: '4px',
          fontWeight: '500',
          color: error ? '#dc3545' : '#333'
        }}
      >
        {label}
        {required && <span style={{ color: '#dc3545' }}>*</span>}
      </label>
      
      <Input 
        id={id}
        placeholder={placeholder}
        disabled={disabled}
        aria-describedby={describedBy}
        aria-invalid={!!error}
        style={{
          borderColor: error ? '#dc3545' : undefined
        }}
      />
      
      {helperText && (
        <p 
          id={\`\${id}-helper\`}
          style={{
            margin: '4px 0 0 0',
            fontSize: '14px',
            color: '#666'
          }}
        >
          {helperText}
        </p>
      )}
      
      {error && (
        <p 
          id={\`\${id}-error\`}
          style={{
            margin: '4px 0 0 0',
            fontSize: '14px',
            color: '#dc3545'
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}`,
  '/App.tsx': `import { TextField } from './TextField';
import { useState } from 'react';

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{email?: string; password?: string}>({});

  const validateEmail = (value: string) => {
    if (!value) return 'Email is required';
    if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value)) return 'Invalid email format';
    return '';
  };

  const validatePassword = (value: string) => {
    if (!value) return 'Password is required';
    if (value.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    
    setErrors({
      email: emailError,
      password: passwordError
    });
    
    if (!emailError && !passwordError) {
      alert('Form submitted successfully!');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui', maxWidth: '400px' }}>
      <h2>TextField Compound Examples</h2>
      
      <form onSubmit={handleSubmit}>
        <TextField
          id="email"
          label="Email Address"
          placeholder="Enter your email"
          required
          error={errors.email}
          helperText="We'll never share your email"
        />
        
        <TextField
          id="password"
          label="Password"
          placeholder="Enter your password"
          required
          error={errors.password}
          helperText="Must be at least 6 characters"
        />
        
        <TextField
          id="optional"
          label="Optional Field"
          placeholder="This field is optional"
          helperText="You can skip this if you want"
        />
        
        <TextField
          id="disabled"
          label="Disabled Field"
          placeholder="This field is disabled"
          disabled
          helperText="This field cannot be edited"
        />
        
        <button 
          type="submit"
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '16px'
          }}
        >
          Submit
        </button>
      </form>
      
      <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <h3>Compound Benefits:</h3>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>✅ Bundles Input + Label + Error + Helper</li>
          <li>✅ Consistent accessibility (aria-describedby)</li>
          <li>✅ Standardized spacing and styling</li>
          <li>✅ Reduces repetitive markup</li>
        </ul>
      </div>
    </div>
  );
}`,
};

function NavigationWrapper() {
  const { activeSection } = useDocLayout();

  return (
    <DocNavigation
      sections={sections}
      activeSection={activeSection}
      onSectionClick={(id) => {
        const element = document.getElementById(id);
        element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }}
    />
  );
}

export default function EnhancedCompoundPage() {
  return (
    <DocLayoutProvider sections={sections}>
      <NavigationWrapper />
      <DocLayout
        codeFiles={codeFiles}
        sandpackOptions={{
          template: 'react-ts',
          options: {
            showLineNumbers: true,
            showInlineErrors: true,
            wrapContent: true,
            editorHeight: '100vh',
            readOnly: false,
          },
        }}
      >
        <article className="content" style={{ padding: '3rem' }}>
          <DocSection id="overview">
            <h1>Deep Dive: Compounds</h1>
            <h2>Why Compounds Exist</h2>
            <p>
              If primitives are the raw parts, compounds are the predictable
              bundles. They emerge when teams repeatedly combine the same
              primitives in the same ways. Instead of asking designers and
              developers to reinvent the bundle every time, the system codifies
              the convention.
            </p>
            <p>
              Compounds give structure to combinations that look obvious in
              hindsight but are fragile in practice. A text input always needs a
              label. A table row always assumes a parent table. A card usually
              pairs heading, body, and actions in a fixed layout.
            </p>
            <p>The compound layer is where convention becomes codified.</p>
          </DocSection>

          <DocSection id="characteristics">
            <h2>Characteristics of Compounds</h2>
            <ul>
              <li>
                Predictable combinations: the system says, "these primitives
                always travel together."
              </li>
              <li>
                Narrow scope: compounds aren't meant to anticipate every
                combination—only the blessed ones.
              </li>
              <li>
                Stable defaults: compounds take care of padding, grouping, or
                spacing rules once, so teams don't keep tweaking.
              </li>
              <li>
                Consistent behavior: accessibility rules (like label
                associations) are guaranteed, not optional.
              </li>
            </ul>
          </DocSection>

          <DocSection id="examples">
            <h2>Examples of Compounds</h2>
            <ul>
              <li>TextField: bundles Input, Label, ErrorMessage.</li>
              <li>
                TableRow: bundles TableCell primitives with semantics tied to
                Table.
              </li>
              <li>
                Card: bundles Heading, Body, Footer with standardized spacing.
              </li>
              <li>Tag / Chip: bundles Label and DismissButton.</li>
            </ul>
          </DocSection>

          <DocSection id="system-work">
            <h2>The Work of the System at the Compound Layer</h2>
            <h3>1. Conventions</h3>
            <ul>
              <li>
                Define what belongs together: label + input, icon + text, header
                + footer.
              </li>
              <li>
                Define approved variations (e.g., TextField can have optional
                helper text, but never hides the label).
              </li>
            </ul>
            <h3>2. Blessed Combinations</h3>
            <ul>
              <li>
                Encode spacing, order, and accessibility rules into the
                compound.
              </li>
              <li>
                Example: a TextField enforces label placement and
                aria-describedby linking to the error state.
              </li>
            </ul>
            <h3>3. Flexibility Without Drift</h3>
            <ul>
              <li>
                Compounds should allow a controlled amount of flexibility
                (slots, optional props).
              </li>
              <li>
                The key is to prevent unbounded prop creep—flexibility should
                follow the system's conventions.
              </li>
            </ul>
          </DocSection>

          <DocSection id="pitfalls">
            <h2>Pitfalls of Compounds</h2>
            <ol>
              <li>
                Prop Explosion
                <ul>
                  <li>
                    When compounds try to solve every variation, they mutate
                    into composers.
                  </li>
                  <li>
                    Guardrail: compounds support only the blessed variations. If
                    you find yourself adding a boolean every sprint, you've
                    crossed layers.
                  </li>
                </ul>
              </li>
              <li>
                Breaking Accessibility by Accident
                <ul>
                  <li>
                    A text field without a proper &lt;label&gt; or
                    aria-describedby is a broken compound.
                  </li>
                  <li>
                    Guardrail: accessibility associations must be baked in, not
                    optional.
                  </li>
                </ul>
              </li>
              <li>
                Over-abstracting Visuals
                <ul>
                  <li>
                    Avoid infinite layout variations. For instance, a Card that
                    allows every combination of header/body/footer permutations
                    becomes ungovernable.
                  </li>
                  <li>
                    Guardrail: fix the expected structure, allow slots for
                    content.
                  </li>
                </ul>
              </li>
              <li>
                Duplication of Logic
                <ul>
                  <li>
                    Don't reimplement primitive behaviors inside compounds
                    (e.g., don't reinvent Checkbox logic inside a "FilterRow"
                    compound).
                  </li>
                  <li>
                    Guardrail: compounds compose primitives; they don't replace
                    them.
                  </li>
                </ul>
              </li>
            </ol>
          </DocSection>

          <DocSection id="textfield-example">
            <h2>Example: TextField</h2>
            <p>
              The TextField component demonstrates all the key principles of
              compounds:
            </p>
            <ul>
              <li>
                The Input primitive is still used, but labeling, error
                messaging, and helper text are orchestrated once.
              </li>
              <li>
                Teams now can't "forget" accessibility—they inherit it
                automatically.
              </li>
              <li>Consistent spacing and styling are applied automatically.</li>
              <li>The component handles all the ARIA associations properly.</li>
            </ul>

            <h2>Why Compounds are Critical</h2>
            <ul>
              <li>
                They reduce cognitive load: designers and engineers don't have
                to reassemble primitives every time.
              </li>
              <li>
                They prevent inconsistent conventions: spacing, order,
                accessibility are centralized.
              </li>
              <li>
                They free the system team from triaging endless one-offs: by
                pre-blessing common bundles, the system reduces churn.
              </li>
              <li>
                They create legibility in design files and codebases:
                "TextField" communicates intent better than "Input + Label +
                Error stacked manually."
              </li>
            </ul>

            <h2>Summary</h2>
            <p>Compounds are the codified bundles of your design system.</p>
            <ul>
              <li>Examples: TextField, TableRow, Card, Chip</li>
              <li>
                Work of the system: conventions, blessed combinations, baked-in
                accessibility
              </li>
              <li>
                Pitfalls: prop explosion, accessibility drift, ungoverned
                permutations, logic duplication
              </li>
            </ul>
            <p>
              If{' '}
              <Link href="/blueprints/component-standards/component-complexity/primitives">
                primitives
              </Link>{' '}
              are the boring DNA, compounds are the grammar rules—they make sure
              the words can be combined into predictable, legible sentences.
            </p>

            <h2>Next Steps</h2>
            <p>
              Compounds work well on their own, but they really shine when
              orchestrated by{' '}
              <Link href="/blueprints/component-standards/component-complexity/composer">
                composers
              </Link>{' '}
              or combined into{' '}
              <Link href="/blueprints/component-standards/component-complexity/assemblies">
                assemblies
              </Link>
              .
            </p>
          </DocSection>
        </article>
      </DocLayout>
    </DocLayoutProvider>
  );
}
