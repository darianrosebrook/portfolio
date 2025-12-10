import Link from 'next/link';
import { Sandpack } from '@codesandbox/sandpack-react';

export const metadata = {
  title: 'Composers | Component Standards',
  description:
    'Composers orchestrate state, focus, accessibility, and interaction across multiple children using slots and context.',
  keywords: [
    'Composers',
    'Design System',
    'Accessibility',
    'Orchestration',
    'Modal',
    'Toolbar',
    'Pagination',
    'Form Field',
    'Rich Text Editor',
  ],
  complexity: 'composer',
};

export default function Page() {
  return (
    <section className="content">
      <article>
        <h1>Deep Dive: Composers</h1>
        <h2>Why Composers Exist</h2>
        <p>
          Primitives give us atoms, compounds give us molecules — but product
          interfaces demand more. A composer is where a design system stops
          bundling parts and starts orchestrating interaction and state.
        </p>
        <p>
          Think of a modal, a toolbar, pagination, or a form fieldset. These
          aren’t just bundles of primitives — they coordinate:
        </p>
        <ul>
          <li>
            Multiple states (open/closed, selected/unselected, error/valid).
          </li>
          <li>
            Multiple flows (keyboard vs mouse, small vs large screen, logged in
            vs logged out).
          </li>
          <li>
            Multiple roles (what happens to focus, what gets announced to a
            screen reader, what rules apply when contents vary).
          </li>
        </ul>
        <p>
          Composers exist because user interactions don’t stop at a single
          element — they span across elements.
        </p>
        <h2>Characteristics of Composers</h2>
        <ul>
          <li>
            Orchestration: manage focus, context, and state for child
            primitives/compounds.
          </li>
          <li>
            Slotting: expose defined areas (header, body, footer, actions) for
            flexible composition.
          </li>
          <li>
            Variation by pattern, not prop: handle families of behavior (e.g.,
            ellipses in pagination) rather than a Boolean soup of configuration.
          </li>
          <li>
            Context Providers: share state between sub-parts without forcing
            prop-drilling.
          </li>
        </ul>
        <h2>Examples of Composers</h2>
        <ul>
          <li>
            Modal: orchestrates open/close, traps focus, provides slots for
            header/body/footer.
          </li>
          <li>
            Form Field: orchestrates label, input, error messaging across
            multiple input types.
          </li>
          <li>
            Toolbar / Filter Bar: orchestrates a dynamic set of actions,
            priorities, and overflow menus.
          </li>
          <li>
            Pagination: orchestrates page numbers, overflow ellipses, compact vs
            full modes.
          </li>
          <li>
            Rich Text Editor: orchestrates schema, commands, plugins, and UI
            slots.
          </li>
        </ul>
        <h2>The Work of the System at the Composer Layer</h2>
        <h3>1. Orchestration</h3>
        <ul>
          <li>
            Control state transitions (modal open → trap focus → restore focus
            on close).
          </li>
          <li>
            Govern keyboard interaction models (arrow key navigation in
            toolbars, tab order in forms).
          </li>
          <li>
            Provide context for sub-parts (form state, toolbar action registry).
          </li>
        </ul>
        <h3>2. Variation by Pattern</h3>
        <ul>
          <li>
            Instead of adding a prop for every variant, encode structural
            patterns.
          </li>
          <li>
            Example: Pagination doesn’t expose showEllipses: boolean; it defines
            a policy for when ellipses appear.
          </li>
        </ul>
        <h3>3. Slots for Composition</h3>
        <ul>
          <li>
            Provide places for product-specific content without breaking
            orchestration.
          </li>
          <li>
            Example: Modal slots for header/body/footer let teams add what they
            need while the system enforces a11y and focus rules.
          </li>
        </ul>
        <h2>Pitfalls of Composers</h2>
        <ol>
          <li>
            Prop Explosion as a Lazy Shortcut
            <ul>
              <li>
                Composers often start with props for each variation:
                hasCloseButton, showFooter, isInline, isSticky.
              </li>
              <li>
                Guardrail: encode variations as structural patterns, not
                toggles.
              </li>
            </ul>
          </li>
          <li>
            Leaking Internal State
            <ul>
              <li>
                If a form composer exposes internal validation state poorly,
                teams may hack around it.
              </li>
              <li>
                Guardrail: provide a clean context/hook API for internal
                orchestration.
              </li>
            </ul>
          </li>
          <li>
            Breaking Accessibility in the Orchestration
            <ul>
              <li>
                Example: a modal that doesn’t trap focus or a toolbar without
                roving tabindex.
              </li>
              <li>
                Guardrail: accessibility rules must be first-class
                orchestration, not optional add-ons.
              </li>
            </ul>
          </li>
          <li>
            Overgeneralization
            <ul>
              <li>
                Composers aren’t universal solutions. A “SuperModal” that tries
                to handle every drawer/alert/dialog variant will be brittle.
              </li>
              <li>
                Guardrail: scope composers to a pattern family, not the entire
                design problem space.
              </li>
            </ul>
          </li>
        </ol>

        <h2>The Problem: Without Composers</h2>
        <p>
          Before we see composers in action, let&apos;s understand what happens
          without them. Consider building modals across a large application:
        </p>

        <Sandpack
          template="react-ts"
          theme="light"
          files={{
            '/BadModal.tsx': `// Without Composer: Scattered logic, inconsistent behavior
import { useState, useEffect } from 'react';

export function BadModal({ isOpen, onClose, children }: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  // Each modal reimplements focus trap differently (or not at all)
  useEffect(() => {
    if (isOpen) {
      // Some modals handle escape, others don't
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      // Some modals close on backdrop click, others don't
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          maxWidth: '400px'
        }}
        // Missing stopPropagation - closes when clicking content!
      >
        {children}
      </div>
    </div>
  );
}`,
            '/App.tsx': `import { useState } from 'react';
import { BadModal } from './BadModal';

export default function App() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui' }}>
      <h2>Problems Without Composers</h2>
      
      <button 
        onClick={() => setShowModal(true)}
        style={{
          padding: '10px 20px',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Open Problematic Modal
      </button>

      <BadModal isOpen={showModal} onClose={() => setShowModal(false)}>
        <h3>Issues with this approach:</h3>
        <ul style={{ textAlign: 'left', paddingLeft: '20px' }}>
          <li>Clicking content closes modal (missing stopPropagation)</li>
          <li>No focus trap or ARIA attributes</li>
          <li>Every modal reimplements escape key handling</li>
          <li>No responsive behavior considerations</li>
          <li>Inconsistent styling across modals</li>
          <li>Hard to test - logic scattered everywhere</li>
        </ul>
        
        <button 
          onClick={() => setShowModal(false)}
          style={{
            marginTop: '16px',
            padding: '8px 16px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Close
        </button>
      </BadModal>
      
      <div style={{ 
        marginTop: '20px', 
        padding: '16px', 
        backgroundColor: '#f8d7da', 
        border: '1px solid #f5c6cb',
        borderRadius: '4px',
        color: '#721c24'
      }}>
        <strong>Result:</strong> Every team builds modals differently, creating inconsistent UX, 
        accessibility gaps, and maintenance nightmares. This is exactly what composers solve.
      </div>
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

        <h2>The Solution: Modal Composer</h2>
        <p>
          Now let&apos;s see how a composer centralizes this complexity into a
          reliable, reusable orchestration layer:
        </p>

        <Sandpack
          template="react-ts"
          theme="light"
          files={{
            '/Button.tsx': `// Primitive Button (from previous layers)
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  disabled, 
  children,
  onClick 
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: size === 'sm' ? '8px 12px' : size === 'lg' ? '12px 20px' : '10px 16px',
        backgroundColor: variant === 'primary' ? '#007bff' : variant === 'danger' ? '#dc3545' : '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        fontSize: size === 'sm' ? '14px' : size === 'lg' ? '18px' : '16px'
      }}
    >
      {children}
    </button>
  );
}`,
            '/Modal.tsx': `import { useEffect } from 'react';
import { Button } from './Button';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ open, onClose, children }: ModalProps) {
  // Focus trap and escape key handling
  useEffect(() => {
    if (!open) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

// Slot components for composition
Modal.Header = ({ children }: { children: React.ReactNode }) => (
  <div style={{
    padding: '20px 20px 0 20px',
    borderBottom: '1px solid #eee',
    paddingBottom: '16px',
    marginBottom: '16px'
  }}>
    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
      {children}
    </h2>
  </div>
);

Modal.Body = ({ children }: { children: React.ReactNode }) => (
  <div style={{ padding: '0 20px 16px 20px' }}>
    {children}
  </div>
);

Modal.Footer = ({ children }: { children: React.ReactNode }) => (
  <div style={{
    padding: '16px 20px 20px 20px',
    borderTop: '1px solid #eee',
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end'
  }}>
    {children}
  </div>
);`,
            '/App.tsx': `import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

export default function App() {
  const [showBasic, setShowBasic] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showForm, setShowForm] = useState(false);

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui' }}>
      <h2>Modal Composer Examples</h2>
      <p>Modals orchestrate focus, escape handling, and overlay behavior while providing slots for flexible content.</p>
      
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <Button onClick={() => setShowBasic(true)}>
          Basic Modal
        </Button>
        <Button onClick={() => setShowConfirm(true)} variant="danger">
          Confirm Dialog
        </Button>
        <Button onClick={() => setShowForm(true)} variant="secondary">
          Form Modal
        </Button>
      </div>

      {/* Basic Modal */}
      <Modal open={showBasic} onClose={() => setShowBasic(false)}>
        <Modal.Header>Welcome!</Modal.Header>
        <Modal.Body>
          <p>This is a basic modal with header and body slots.</p>
          <p>The modal composer handles:</p>
          <ul>
            <li>Focus trap and escape key</li>
            <li>Overlay click to close</li>
            <li>Flexible content via slots</li>
            <li>Consistent styling</li>
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setShowBasic(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Confirmation Modal */}
      <Modal open={showConfirm} onClose={() => setShowConfirm(false)}>
        <Modal.Header>Confirm Action</Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this item? This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowConfirm(false)}
          >
            Cancel
          </Button>
          <Button 
            variant="danger"
            onClick={() => {
              alert('Item deleted!');
              setShowConfirm(false);
            }}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Form Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)}>
        <Modal.Header>Add New Item</Modal.Header>
        <Modal.Body>
          <form style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                Name
              </label>
              <input 
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '16px'
                }}
                placeholder="Enter item name"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                Description
              </label>
              <textarea 
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '16px',
                  minHeight: '80px',
                  resize: 'vertical'
                }}
                placeholder="Enter description"
              />
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowForm(false)}
          >
            Cancel
          </Button>
          <Button onClick={() => {
            alert('Item saved!');
            setShowForm(false);
          }}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      <div style={{ 
        marginTop: '40px', 
        padding: '16px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '4px' 
      }}>
        <h3>Composer Benefits:</h3>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li><strong>Orchestration:</strong> Handles focus, keyboard, overlay behavior</li>
          <li><strong>Slotting:</strong> Header/Body/Footer for flexible composition</li>
          <li><strong>Accessibility:</strong> Focus trap, escape key, ARIA built-in</li>
          <li><strong>Reusability:</strong> Same modal, different content patterns</li>
        </ul>
      </div>
    </div>
  );
}`,
          }}
          options={{
            showLineNumbers: true,
            showInlineErrors: true,
            wrapContent: true,
            editorHeight: 450,
          }}
        />

        <h2>Advanced Example: Form Field Composer</h2>
        <p>
          Let&apos;s see a more complex composer that demonstrates context-based
          orchestration, managing multiple children and coordinating validation
          state:
        </p>

        <Sandpack
          template="react-ts"
          theme="light"
          files={{
            '/Input.tsx': `// Primitive Input (from previous layers)
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
    />
  );
}`,
            '/FormField.tsx': `// Form Field Composer: Context-based orchestration
import { createContext, useContext, useState, useId } from 'react';
import { Input } from './Input';

// Context for child coordination
interface FieldContextValue {
  id: string;
  error?: string;
  required: boolean;
  disabled: boolean;
  describedBy: string;
  setError: (error?: string) => void;
  validate: () => boolean;
}

const FieldContext = createContext<FieldContextValue | null>(null);

// Hook for children to access field state
export function useField() {
  const context = useContext(FieldContext);
  if (!context) {
    throw new Error('useField must be used within a FormField');
  }
  return context;
}

// Main composer component
export interface FormFieldProps {
  children: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
  validator?: (value: string) => string | undefined;
}

export function FormField({ 
  children, 
  required = false, 
  disabled = false,
  validator 
}: FormFieldProps) {
  const id = useId();
  const [error, setError] = useState<string>();
  const [value, setValue] = useState('');
  
  // Orchestrated validation
  const validate = () => {
    if (required && !value.trim()) {
      setError('This field is required');
      return false;
    }
    
    if (validator && value) {
      const validationError = validator(value);
      setError(validationError);
      return !validationError;
    }
    
    setError(undefined);
    return true;
  };
  
  // Build describedBy for accessibility
  const describedBy = [
    error ? \`\${id}-error\` : null,
    \`\${id}-helper\`
  ].filter(Boolean).join(' ');
  
  const contextValue: FieldContextValue = {
    id,
    error,
    required,
    disabled,
    describedBy,
    setError,
    validate
  };
  
  return (
    <FieldContext.Provider value={contextValue}>
      <div style={{ marginBottom: '20px' }}>
        {children}
      </div>
    </FieldContext.Provider>
  );
}

// Slot components that use context
FormField.Label = ({ children }: { children: React.ReactNode }) => {
  const { id, required, error } = useField();
  
  return (
    <label 
      htmlFor={id}
      style={{
        display: 'block',
        marginBottom: '6px',
        fontWeight: '500',
        color: error ? '#dc3545' : '#333'
      }}
    >
      {children}
      {required && <span style={{ color: '#dc3545', marginLeft: '2px' }}>*</span>}
    </label>
  );
};

FormField.Input = (props: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'id'>) => {
  const { id, error, disabled, describedBy, setError } = useField();
  
  return (
    <Input
      {...props}
      id={id}
      disabled={disabled}
      aria-describedby={describedBy}
      aria-invalid={!!error}
      style={{
        ...props.style,
        borderColor: error ? '#dc3545' : undefined
      }}
      onChange={(e) => {
        props.onChange?.(e);
        // Clear error on change
        if (error) setError(undefined);
      }}
    />
  );
};

FormField.Helper = ({ children }: { children: React.ReactNode }) => {
  const { id } = useField();
  
  return (
    <p 
      id={\`\${id}-helper\`}
      style={{
        margin: '4px 0 0 0',
        fontSize: '14px',
        color: '#666'
      }}
    >
      {children}
    </p>
  );
};

FormField.Error = () => {
  const { id, error } = useField();
  
  if (!error) return null;
  
  return (
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
  );
};`,
            '/App.tsx': `import { useState } from 'react';
import { FormField } from './FormField';

export default function App() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const emailValidator = (value: string) => {
    if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value)) {
      return 'Please enter a valid email address';
    }
  };

  const passwordValidator = (value: string) => {
    if (value.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)/.test(value)) {
      return 'Password must contain uppercase, lowercase, and number';
    }
  };

  const confirmPasswordValidator = (value: string) => {
    if (value !== formData.password) {
      return 'Passwords do not match';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In real implementation, you'd validate all fields
    alert('Form submitted! Check console for orchestration benefits.');
    console.log('Composer Benefits Demonstrated:');
    console.log('- Consistent ARIA relationships across all fields');
    console.log('- Centralized validation orchestration');
    console.log('- Context-based child coordination');
    console.log('- No prop drilling - children access field state via context');
    console.log('- Reusable validation patterns');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui', maxWidth: '500px' }}>
      <h2>Form Field Composer</h2>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        This composer orchestrates validation, accessibility, and child coordination 
        through React Context. Notice how each field is self-contained yet consistent.
      </p>
      
      <form onSubmit={handleSubmit}>
        <FormField required validator={emailValidator}>
          <FormField.Label>Email Address</FormField.Label>
          <FormField.Input 
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          />
          <FormField.Helper>We'll never share your email with anyone</FormField.Helper>
          <FormField.Error />
        </FormField>

        <FormField required validator={passwordValidator}>
          <FormField.Label>Password</FormField.Label>
          <FormField.Input 
            type="password"
            placeholder="Create a password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
          />
          <FormField.Helper>Must be 8+ chars with uppercase, lowercase, and number</FormField.Helper>
          <FormField.Error />
        </FormField>

        <FormField required validator={confirmPasswordValidator}>
          <FormField.Label>Confirm Password</FormField.Label>
          <FormField.Input 
            type="password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
          />
          <FormField.Helper>Must match your password above</FormField.Helper>
          <FormField.Error />
        </FormField>

        <button 
          type="submit"
          style={{
            padding: '12px 24px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            marginTop: '10px'
          }}
        >
          Create Account
        </button>
      </form>
      
      <div style={{ 
        marginTop: '30px', 
        padding: '20px', 
        backgroundColor: '#d4edda', 
        border: '1px solid #c3e6cb',
        borderRadius: '4px',
        color: '#155724'
      }}>
        <h3 style={{ margin: '0 0 12px 0' }}>Composer Orchestration:</h3>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li><strong>Context Coordination:</strong> Children access field state without prop drilling</li>
          <li><strong>ARIA Management:</strong> Automatic describedBy relationships</li>
          <li><strong>Validation Orchestration:</strong> Centralized error handling</li>
          <li><strong>State Synchronization:</strong> Error clearing, required indicators</li>
          <li><strong>Consistent Behavior:</strong> All fields follow same patterns</li>
        </ul>
      </div>
    </div>
  );
}`,
          }}
          options={{
            showLineNumbers: true,
            showInlineErrors: true,
            wrapContent: true,
            editorHeight: 500,
          }}
        />

        <h2>Why Composers Are Essential</h2>
        <p>
          Composers solve the &ldquo;coordination problem&rdquo; that emerges in
          design systems at scale. When multiple elements must work together —
          sharing state, managing focus, responding to keyboard input, and
          maintaining accessibility semantics — the complexity can quickly
          spiral out of control. Composers provide governance through
          orchestration, ensuring that this complexity is handled once and
          reused everywhere.
        </p>

        <div className="content">
          <h3>Orchestration Benefits</h3>
          <ul>
            <li>
              <strong>Single Source of Truth:</strong> Complex behavior lives in
              one place, not scattered across implementations. When focus
              management needs to change, you update the composer — not dozens
              of individual components.
            </li>
            <li>
              <strong>Consistent Patterns:</strong> Every modal, form field, or
              toolbar behaves identically. Users build muscle memory, and
              developers build confidence.
            </li>
            <li>
              <strong>Accessibility by Default:</strong> ARIA relationships,
              focus management, and keyboard behavior are built-in. Teams
              don&apos;t need to remember to add them — they&apos;re
              automatically correct.
            </li>
            <li>
              <strong>Easier Testing:</strong> Test the composer once, trust it
              everywhere. Integration tests can focus on business logic rather
              than re-verifying that focus trapping works.
            </li>
          </ul>

          <h3>Composition Benefits</h3>
          <ul>
            <li>
              <strong>Flexible Content:</strong> Slots allow varied content
              while maintaining consistent behavior. A modal can contain a form,
              a confirmation message, or rich media — the orchestration remains
              the same.
            </li>
            <li>
              <strong>Context Coordination:</strong> Children access
              orchestrated state without prop drilling. A form field&apos;s
              label, input, and error message all know the field&apos;s state
              without explicit wiring.
            </li>
            <li>
              <strong>Separation of Concerns:</strong> Content creators focus on
              content, not complex behavior. They slot in what they need; the
              composer handles the rest.
            </li>
            <li>
              <strong>Reusable Patterns:</strong> Same orchestration, infinite
              content variations. One modal composer supports confirmation
              dialogs, forms, media previews, and more.
            </li>
          </ul>

          <h3>Governance Benefits</h3>
          <ul>
            <li>
              <strong>Prevents Drift:</strong> Teams can&apos;t accidentally
              build inconsistent versions. The composer defines the rules;
              variations happen through slots, not reimplementation.
            </li>
            <li>
              <strong>Enforces Standards:</strong> Accessibility and UX patterns
              are automatic. You can&apos;t forget to trap focus in a modal
              because the composer does it for you.
            </li>
            <li>
              <strong>Reduces Maintenance:</strong> Fix behavior once, it&apos;s
              fixed everywhere. A bug in focus restoration gets patched in one
              place and deployed to all modals.
            </li>
            <li>
              <strong>Enables Scale:</strong> New team members get consistent
              behavior &ldquo;for free.&rdquo; They learn the slot pattern once
              and can use any composer in the system.
            </li>
          </ul>
        </div>

        <hr />

        <h2>Case Study: OTP Composer</h2>
        <p>
          A one-time passcode (OTP) input is a compelling example of a composer
          because it demonstrates the full spectrum of orchestration challenges.
          What appears to be a simple &ldquo;enter 6 digits&rdquo; interface
          actually involves:
        </p>
        <ul>
          <li>
            <strong>Multi-field coordination:</strong> Six separate inputs that
            must behave as a single logical unit
          </li>
          <li>
            <strong>Focus management:</strong> Auto-advance on valid input,
            backspace navigation, arrow key movement
          </li>
          <li>
            <strong>Paste handling:</strong> Distributing a pasted code across
            all fields correctly
          </li>
          <li>
            <strong>Input validation:</strong> Guarding against invalid
            characters in real-time
          </li>
          <li>
            <strong>Accessibility:</strong> Screen reader announcements, proper
            labeling, keyboard semantics
          </li>
          <li>
            <strong>Platform hints:</strong> Autofill support, virtual keyboard
            optimization
          </li>
        </ul>
        <p>
          Without a composer, each implementation would need to solve these
          problems independently. With a composer, the logic lives in a headless
          hook (<code>useOtp</code>), the orchestration lives in a context
          provider (<code>OTPProvider</code>), and the UI is fully slottable —
          allowing brands to reskin without touching the behavior.
        </p>

        <Sandpack
          template="react-ts"
          theme="light"
          files={{
            '/App.tsx': `import { createContext, useContext, useCallback, useMemo, useRef, useState } from 'react';

// Headless OTP hook - core logic lives here
type Guard = 'numeric' | 'alphanumeric';

const guardChar = (ch: string, mode: Guard) => {
  if (mode === 'numeric') return /^[0-9]$/.test(ch);
  return /^[a-zA-Z0-9]$/.test(ch);
};

function useOtp(length: number, mode: Guard, onComplete?: (code: string) => void) {
  const [chars, setChars] = useState<string[]>(() => Array(length).fill(''));
  const refs = useRef<HTMLInputElement[]>([]);

  const setChar = useCallback((index: number, ch: string) => {
    if (!guardChar(ch, mode)) return;
    
    setChars(prev => {
      const next = [...prev];
      next[index] = ch;
      
      // Auto-advance focus
      if (index < length - 1) {
        refs.current[index + 1]?.focus();
      } else if (next.every(Boolean)) {
        onComplete?.(next.join(''));
      }
      return next;
    });
  }, [length, mode, onComplete]);

  const clearChar = useCallback((index: number) => {
    setChars(prev => {
      const next = [...prev];
      next[index] = '';
      return next;
    });
  }, []);

  const handlePaste = useCallback((index: number, text: string) => {
    const clean = Array.from(text).filter(ch => guardChar(ch, mode)).slice(0, length - index);
    if (clean.length === 0) return;

    setChars(prev => {
      const next = [...prev];
      clean.forEach((ch, i) => { next[index + i] = ch; });
      
      const lastIndex = Math.min(index + clean.length - 1, length - 1);
      refs.current[lastIndex]?.focus();
      
      if (next.every(Boolean)) onComplete?.(next.join(''));
      return next;
    });
  }, [length, mode, onComplete]);

  const register = useCallback((el: HTMLInputElement | null, i: number) => {
    if (el) refs.current[i] = el;
  }, []);

  return { chars, setChar, clearChar, handlePaste, register, refs };
}

// Context for orchestration
interface OTPContextValue {
  chars: string[];
  setChar: (index: number, ch: string) => void;
  clearChar: (index: number) => void;
  handlePaste: (index: number, text: string) => void;
  register: (el: HTMLInputElement | null, i: number) => void;
}

const OTPContext = createContext<OTPContextValue | null>(null);

function useOTPContext() {
  const ctx = useContext(OTPContext);
  if (!ctx) throw new Error('OTP components must be used within OTPProvider');
  return ctx;
}

// Provider component - orchestrates state
function OTPProvider({ 
  children, 
  length = 6, 
  mode = 'numeric' as Guard,
  onComplete 
}: { 
  children: React.ReactNode; 
  length?: number; 
  mode?: Guard;
  onComplete?: (code: string) => void;
}) {
  const api = useOtp(length, mode, onComplete);
  return <OTPContext.Provider value={api}>{children}</OTPContext.Provider>;
}

// Slot: Input group container
function OTPInput({ children }: { children: React.ReactNode }) {
  return (
    <div role="group" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      {children}
    </div>
  );
}

// Slot: Individual field
function OTPField({ index }: { index: number }) {
  const { chars, setChar, clearChar, handlePaste, register } = useOTPContext();

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!chars[index]) {
        // Traverse siblings backwards to find the previous input, skipping separators
        let prev: Element | null = e.currentTarget.previousElementSibling;
        while (prev && prev.tagName !== 'INPUT') {
          prev = prev.previousElementSibling;
        }
        (prev as HTMLInputElement)?.focus();
      } else {
        clearChar(index);
      }
      e.preventDefault();
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const ch = e.target.value.slice(-1);
    if (ch) setChar(index, ch);
  };

  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text');
    if (text) {
      e.preventDefault();
      handlePaste(index, text);
    }
  };

  return (
    <input
      ref={(el) => register(el, index)}
      value={chars[index] || ''}
      inputMode="numeric"
      maxLength={1}
      onKeyDown={onKeyDown}
      onChange={onChange}
      onPaste={onPaste}
      aria-label={\`Digit \${index + 1}\`}
      style={{
        width: 44,
        height: 44,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 600,
        borderRadius: 8,
        border: '1px solid #ced4da'
      }}
    />
  );
}

// Slot: Separator
function OTPSeparator({ children = '-' }: { children?: React.ReactNode }) {
  return <span style={{ padding: '0 4px', color: '#666' }}>{children}</span>;
}

// Slot: Label
function OTPLabel({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
      {children}
    </label>
  );
}

// Main App demonstrating the composer
export default function App() {
  return (
    <div style={{ padding: 20, fontFamily: 'system-ui', maxWidth: 480 }}>
      <h2>OTP Composer</h2>
      <p style={{ color: '#666', marginBottom: 20 }}>
        Demonstrates headless logic + slots. Try pasting a 6-digit code, using arrow keys, or backspacing across fields.
      </p>
      
      <form onSubmit={(e) => { e.preventDefault(); alert('Verified!'); }}>
        <OTPProvider 
          length={6} 
          mode="numeric" 
          onComplete={(code) => alert('Code complete: ' + code)}
        >
          <OTPLabel>Enter the 6-digit code</OTPLabel>
          <OTPInput>
            <OTPField index={0} />
            <OTPField index={1} />
            <OTPField index={2} />
            <OTPSeparator />
            <OTPField index={3} />
            <OTPField index={4} />
            <OTPField index={5} />
          </OTPInput>
        </OTPProvider>
        
        <button 
          type="submit" 
          style={{ 
            marginTop: 20, 
            padding: '10px 20px', 
            borderRadius: 6, 
            border: '1px solid #ced4da', 
            background: '#f8f9fa',
            cursor: 'pointer'
          }}
        >
          Verify
        </button>
      </form>

      <div style={{ 
        marginTop: 30, 
        padding: 16, 
        background: '#f8f9fa', 
        borderRadius: 8,
        fontSize: 14
      }}>
        <strong>Composer Pattern Demonstrated:</strong>
        <ul style={{ margin: '8px 0 0', paddingLeft: 20 }}>
          <li><strong>Headless hook (useOtp):</strong> Core logic for state, validation, focus</li>
          <li><strong>Context provider:</strong> Orchestrates state across children</li>
          <li><strong>Slots:</strong> OTPInput, OTPField, OTPSeparator, OTPLabel</li>
          <li><strong>No prop drilling:</strong> Children access state via context</li>
        </ul>
      </div>
    </div>
  );
}
`,
          }}
          options={{
            showLineNumbers: true,
            showInlineErrors: true,
            wrapContent: true,
            editorHeight: 520,
          }}
        />

        <h3>API (minimal, orchestration-first)</h3>
        <ul>
          <li>
            <strong>length</strong>: number of digits; default 6
          </li>
          <li>
            <strong>mode</strong>: &lsquo;numeric&rsquo; |
            &lsquo;alphanumeric&rsquo; | RegExp
          </li>
          <li>
            <strong>value / defaultValue</strong>: controlled or uncontrolled
          </li>
          <li>
            <strong>onChange / onComplete</strong>: callbacks for progress and
            completion
          </li>
          <li>
            <strong>mask</strong>: visual masking (•) only; logic remains
            accessible
          </li>
          <li>
            <strong>separator</strong>: &lsquo;none&rsquo; | &lsquo;space&rsquo;
            | &lsquo;dash&rsquo; | React node
          </li>
          <li>
            <strong>autocomplete / inputMode</strong>: platform hints for
            keyboards and auto-fill
          </li>
        </ul>

        <h3>Meta-patterns</h3>
        <ul>
          <li>
            <strong>Headless logic hook</strong>: core OTP behaviors live in{' '}
            <code>useOtp</code>
          </li>
          <li>
            <strong>Context provider</strong>: <code>OTPProvider</code> exposes
            orchestrated state
          </li>
          <li>
            <strong>Slotting &amp; substitution</strong>: UI parts are
            replaceable (field, label, error, separator)
          </li>
          <li>
            <strong>Token-driven visuals</strong>: no hard-coded colors; styles
            map to tokens
          </li>
        </ul>

        <h3>Folder structure</h3>
        <pre>
          {`OTPInput/
├── index.tsx
├── OTPInput.tsx            # visual scaffolding (slots)
├── OTPProvider.tsx         # context + orchestration
├── useOtp.ts               # headless logic (state, focus, paste)
├── OTPField.tsx            # default field primitive (swappable)
├── OTPSeparator.tsx        # optional slot
├── OTPLabel.tsx            # optional slot
├── OTPError.tsx            # optional slot
├── OTPInput.module.scss
├── OTPInput.tokens.json
├── OTPInput.tokens.generated.scss
└── README.md`}
        </pre>

        <h3>Accessibility Notes</h3>
        <ul>
          <li>
            <strong>Group semantics</strong>: wrap fields in a
            role=&quot;group&quot; and associate labels/errors via described-by
          </li>
          <li>
            <strong>Paste</strong>: allow multi-character paste and distribute
            across slots
          </li>
          <li>
            <strong>Backspace</strong>: backspace moves focus left when empty;
            clears when filled
          </li>
          <li>
            <strong>Virtual keyboards</strong>:
            autocomplete=&quot;one-time-code&quot;,
            inputMode=&quot;numeric&quot; or &quot;tel&quot;
          </li>
          <li>
            <strong>Screen readers</strong>: each field has an aria-label (e.g.,
            &ldquo;Digit 1&rdquo;)
          </li>
          <li>
            <strong>Reduced motion</strong>: advance focus only on valid entry;
            deterministic arrow navigation
          </li>
        </ul>

        <h3>Why this travels well</h3>
        <ul>
          <li>
            <strong>Headless logic</strong>: products can reskin without
            re-implementing paste/focus/validation
          </li>
          <li>
            <strong>Slotting</strong>: replace <code>OTPField</code>,
            separators, and text slots freely
          </li>
          <li>
            <strong>Tokenized visuals</strong>: map typography, radius, spacing,
            and colors to tokens
          </li>
          <li>
            <strong>Clear boundaries</strong>: OTP is a system composer; flows
            like checkout live as assemblies
          </li>
        </ul>

        <h3>Quick verification</h3>
        <ul>
          <li>
            Composer invariants: <code>useOtp</code> + <code>OTPProvider</code>{' '}
            exist
          </li>
          <li>Exports include provider, group, field, and slots</li>
          <li>README-style guidance covers usage, props, and a11y</li>
          <li>No prop explosion; variations derive from slots + tokens</li>
        </ul>

        <h3>Explicit props interface</h3>
        <pre>
          {`export interface OTPInputProps {
  /** Number of OTP digits (3–12 typical). Default: 6 */
  length?: number;
  /** Numeric-only, alphanumeric, or custom regex guard. Default: "numeric" */
  mode?: 'numeric' | 'alphanumeric' | RegExp;
  /** Autofill hints for platforms that support it. Default: 'one-time-code' */
  autocomplete?: 'one-time-code' | 'otp' | string;
  /** Controlled value as a string of length N (optional) */
  value?: string;
  /** Uncontrolled default value (optional) */
  defaultValue?: string;
  /** Called when all N slots are filled with valid characters */
  onComplete?(code: string): void;
  /** Called on any change (partial codes included) */
  onChange?(code: string): void;
  /** Disabled / readOnly semantics */
  disabled?: boolean;
  readOnly?: boolean;
  /** Ids for a11y grouping & descriptions (label, error, help) */
  id?: string;
  'aria-describedby'?: string;
  /** Optional mask (e.g., show • instead of digits) */
  mask?: boolean;
  /** Optional separator render strategy ('space' by default) */
  separator?: 'none' | 'space' | 'dash' | React.ReactNode;
  /** Inputmode hint to virtual keyboards; defaults inferred from mode */
  inputMode?: React.InputHTMLAttributes<HTMLInputElement>['inputMode'];
}`}
        </pre>

        <h3>Tokens and styles</h3>
        <p>Example token JSON and SCSS usage:</p>
        <pre>
          {`// OTPInput.tokens.json
{
  "component": {
    "otpInput": {
      "field": {
        "size": { "minWidth": "{size.12}", "height": "{size.12}" },
        "typo": { "fontSize": "{font.size.300}", "fontWeight": "{font.weight.semibold}" },
        "radius": "{radius.md}",
        "gap": "{space.200}"
      },
      "color": {
        "text": "{color.foreground.default}",
        "bg": "{color.background.surface}",
        "border": "{color.border.subtle}",
        "focus": "{color.border.focus}",
        "invalid": "{color.border.danger}"
      }
    }
  }
}

// OTPInput.module.scss
@import './OTPInput.tokens.generated.scss';

.root {
  display: inline-flex;
  align-items: center;
  gap: var(--component-otp-field-gap);
}

.field {
  min-width: var(--component-otp-field-min-width);
  height: var(--component-otp-field-height);
  text-align: center;
  font-size: var(--component-otp-field-font-size);
  font-weight: var(--component-otp-field-font-weight);
  border-radius: var(--component-otp-field-radius);
  color: var(--component-otp-color-text);
  background: var(--component-otp-color-bg);
  border: 1px solid var(--component-otp-color-border);
  outline: none;
}

.field:focus-visible {
  border-color: var(--component-otp-color-focus);
  box-shadow: 0 0 0 3px color-mix(in oklab, var(--component-otp-color-focus) 30%, transparent);
}`}
        </pre>

        <h3>Usage (slots + defaults)</h3>
        <pre>
          {`import {
  OTPProvider,
  OTPInput,
  OTPField,
  OTPSeparator,
  OTPLabel,
  OTPError,
} from '@/ui/components/OTPInput';

export function CheckoutOtpExample() {
  return (
    <form onSubmit={(e) => { e.preventDefault(); }}>
      <OTPProvider length={6} mode="numeric" onComplete={(code) => console.log('OTP:', code)}>
        <OTPLabel>Enter the 6-digit code</OTPLabel>
        <OTPInput>
          {Array.from({ length: 6 }).map((_, i) => <OTPField key={i} index={i} />)}
        </OTPInput>
        <OTPError id="otp-error">{/* show error when server rejects */}</OTPError>
      </OTPProvider>
      <button type="submit">Verify</button>
    </form>
  );
}`}
        </pre>

        <h3>README starter</h3>
        <pre>
          {`# OTPInput

A composer for one-time passcodes (OTP). Headless logic + slot-based UI for multi-brand reuse.

## When to use
- Login, 2FA, device verification, high-risk actions.

## Key ideas
- Headless logic in useOtp (paste, focus, completion)
- Slotting: replace OTPField, OTPSeparator, OTPLabel, OTPError freely
- Tokenized visuals for brand theming

## Props
See OTPInputProps. Minimal surface: length, mode, onComplete, onChange, a11y ids, mask, separator.

## Accessibility
- Grouped with role="group", labeled and described
- autocomplete="one-time-code", inputMode hints for keyboards
- Backspace & arrow navigation semantics included
- Paste distribution supported
`}
        </pre>

        <h2>Anatomy of a Modal Composer</h2>
        <p>
          The modal example above demonstrates the core principles of composer
          design. Let&apos;s break down what makes it work:
        </p>
        <ul>
          <li>
            <strong>Centralized orchestration:</strong> The <code>Modal</code>{' '}
            component handles open/close state, overlay click-to-close, escape
            key handling, and event propagation. This logic is written once and
            applies to every modal in the system.
          </li>
          <li>
            <strong>Slot-based composition:</strong> <code>Modal.Header</code>,{' '}
            <code>Modal.Body</code>, and <code>Modal.Footer</code> provide
            semantic areas for content. Teams can omit the footer for simple
            alerts or add complex forms in the body — the orchestration remains
            intact.
          </li>
          <li>
            <strong>Accessibility enforcement:</strong> Focus trapping, escape
            key dismissal, and proper stacking context are automatic. Teams
            can&apos;t accidentally break these behaviors because they&apos;re
            not exposed as options.
          </li>
          <li>
            <strong>Primitive reuse:</strong> The modal uses the{' '}
            <code>Button</code> primitive for its actions. This demonstrates how
            composers build on lower layers without duplicating their
            functionality.
          </li>
        </ul>

        <h2>Why Composers are Critical</h2>
        <p>
          At their core, composers exist to solve a fundamental tension in
          design systems: the need for consistency versus the need for
          flexibility. They accomplish this through a clear separation of
          concerns:
        </p>
        <ul>
          <li>
            <strong>Behavior is centralized:</strong> Focus management, keyboard
            navigation, state transitions, and accessibility semantics are
            defined once in the composer. This complexity is solved, tested, and
            maintained in a single location.
          </li>
          <li>
            <strong>Content is decentralized:</strong> Through slots and
            context, teams can inject whatever content they need. The composer
            doesn&apos;t care what goes in the modal body — it just ensures the
            body is properly accessible and focusable.
          </li>
          <li>
            <strong>Accessibility is automatic:</strong> Multi-element
            accessibility is notoriously difficult. Focus trapping, roving
            tabindex, ARIA relationships, and screen reader announcements
            require deep expertise. Composers encode this expertise once and
            apply it everywhere.
          </li>
          <li>
            <strong>Testing is tractable:</strong> Instead of testing every
            modal implementation for focus behavior, you test the modal composer
            once. Product teams can focus their testing on business logic, not
            interaction mechanics.
          </li>
          <li>
            <strong>Evolution is safe:</strong> When accessibility requirements
            change or browser behavior shifts, you update the composer. Every
            consumer automatically gets the fix without code changes.
          </li>
        </ul>

        <h2>Summary</h2>
        <p>
          Composers are the system&apos;s conductors: they coordinate state,
          focus, and interaction across multiple children. They represent the
          point where a design system transitions from providing building blocks
          to providing behavior.
        </p>

        <h3>Key Characteristics</h3>
        <ul>
          <li>
            <strong>Orchestration:</strong> Composers manage state transitions,
            focus flow, and interaction patterns across their children.
          </li>
          <li>
            <strong>Slotting:</strong> They expose defined areas (header, body,
            footer, actions) for flexible content injection.
          </li>
          <li>
            <strong>Context Providers:</strong> They share state between
            sub-parts without requiring prop drilling.
          </li>
          <li>
            <strong>Variation by Pattern:</strong> They encode structural
            patterns rather than exposing Boolean props for every variation.
          </li>
        </ul>

        <h3>Common Examples</h3>
        <ul>
          <li>
            <strong>Modal:</strong> Orchestrates open/close, focus trapping,
            escape key handling, and overlay behavior
          </li>
          <li>
            <strong>Form Field:</strong> Coordinates label, input, helper text,
            and error messaging with proper ARIA relationships
          </li>
          <li>
            <strong>Toolbar:</strong> Manages action priorities, overflow menus,
            and keyboard navigation patterns
          </li>
          <li>
            <strong>Pagination:</strong> Handles page number rendering, ellipsis
            logic, and compact vs. full display modes
          </li>
          <li>
            <strong>Rich Text Editor:</strong> Orchestrates schema, commands,
            plugins, and UI slots
          </li>
        </ul>

        <h3>Pitfalls to Avoid</h3>
        <ul>
          <li>
            <strong>Prop explosion:</strong> Adding Boolean props for every
            variation instead of encoding patterns
          </li>
          <li>
            <strong>Leaking internal state:</strong> Exposing implementation
            details that force consumers to work around the composer
          </li>
          <li>
            <strong>Accessibility drift:</strong> Treating a11y as optional
            rather than core orchestration
          </li>
          <li>
            <strong>Overgeneralization:</strong> Building a &ldquo;super
            composer&rdquo; that tries to handle every variant
          </li>
        </ul>

        <p>
          If{' '}
          <Link href="/blueprints/component-standards/component-complexity/primitives">
            primitives
          </Link>{' '}
          are the boring DNA, and{' '}
          <Link href="/blueprints/component-standards/component-complexity/compound">
            compounds
          </Link>{' '}
          are the grammar rules, then composers are the syntax that makes the
          grammar work in practice. They&apos;re where design systems prove
          their worth — not just in how things look, but in how they behave.
        </p>

        <h2>Next Steps</h2>
        <p>
          Composers occupy the middle of the component complexity spectrum. They
          build on{' '}
          <Link href="/blueprints/component-standards/component-complexity/primitives">
            primitives
          </Link>{' '}
          (the atomic building blocks) and{' '}
          <Link href="/blueprints/component-standards/component-complexity/compound">
            compounds
          </Link>{' '}
          (the molecular combinations), adding orchestration and state
          management.
        </p>
        <p>
          When composers need to work together to create complete user flows —
          like a checkout process with modals, forms, and navigation — they
          combine into{' '}
          <Link href="/blueprints/component-standards/component-complexity/assemblies">
            assemblies
          </Link>
          . Assemblies represent the final layer of the component hierarchy,
          where system components meet product-specific requirements.
        </p>
      </article>
      <Link href="/blueprints/component-standards/component-complexity">
        ← Back to Component Standards
      </Link>
    </section>
  );
}
