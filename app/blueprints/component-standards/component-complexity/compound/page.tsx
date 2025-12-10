import Link from 'next/link';
import { Sandpack } from '@codesandbox/sandpack-react';

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

const textFieldCode = `// Production-grade TextField Compound
// Demonstrates bundling primitives with baked-in accessibility

import { useState, useId } from 'react';

// ============================================================================
// PRIMITIVE: Input (from the primitive layer)
// ============================================================================

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Visual size of the input */
  inputSize?: 'sm' | 'md' | 'lg';
  /** Whether the input has an error state */
  hasError?: boolean;
}

function Input({ inputSize = 'md', hasError, className, ...props }: InputProps) {
  const sizeStyles = {
    sm: { padding: '6px 10px', fontSize: '13px' },
    md: { padding: '10px 14px', fontSize: '15px' },
    lg: { padding: '14px 18px', fontSize: '17px' },
  };

  return (
    <input
      {...props}
      style={{
        ...sizeStyles[inputSize],
        width: '100%',
        boxSizing: 'border-box',
        border: \`1px solid \${hasError ? '#dc3545' : '#d1d5db'}\`,
        borderRadius: '8px',
        backgroundColor: props.disabled ? '#f9fafb' : 'white',
        color: props.disabled ? '#9ca3af' : '#111827',
        outline: 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        cursor: props.disabled ? 'not-allowed' : 'text',
        fontFamily: 'inherit',
        ...props.style,
      }}
      onFocus={(e) => {
        if (!props.disabled) {
          e.target.style.borderColor = hasError ? '#dc3545' : '#3b82f6';
          e.target.style.boxShadow = \`0 0 0 3px \${hasError ? 'rgba(220, 53, 69, 0.15)' : 'rgba(59, 130, 246, 0.15)'}\`;
        }
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        e.target.style.borderColor = hasError ? '#dc3545' : '#d1d5db';
        e.target.style.boxShadow = 'none';
        props.onBlur?.(e);
      }}
    />
  );
}

// ============================================================================
// COMPOUND: TextField (bundles Input + Label + Helper + Error)
// ============================================================================

interface TextFieldProps {
  /** Unique identifier - auto-generated if not provided */
  id?: string;
  /** Label text (always visible - compounds enforce this) */
  label: string;
  /** Error message to display */
  error?: string;
  /** Helper text for guidance */
  helperText?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Input type */
  type?: string;
  /** Controlled value */
  value?: string;
  /** Change handler */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Blur handler for validation */
  onBlur?: () => void;
  /** Visual size */
  size?: 'sm' | 'md' | 'lg';
  /** Autocomplete hint */
  autoComplete?: string;
}

function TextField({
  id: providedId,
  label,
  error,
  helperText,
  required,
  placeholder,
  disabled,
  type = 'text',
  value,
  onChange,
  onBlur,
  size = 'md',
  autoComplete,
}: TextFieldProps) {
  // Auto-generate ID if not provided (compound handles this complexity)
  const generatedId = useId();
  const id = providedId || generatedId;
  
  // Build aria-describedby for proper screen reader association
  const errorId = error ? \`\${id}-error\` : undefined;
  const helperId = helperText && !error ? \`\${id}-helper\` : undefined;
  const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

  const labelSizes = {
    sm: { fontSize: '13px', marginBottom: '4px' },
    md: { fontSize: '14px', marginBottom: '6px' },
    lg: { fontSize: '15px', marginBottom: '8px' },
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      {/* Label - compounds enforce this is always present */}
      <label
        htmlFor={id}
        style={{
          display: 'block',
          fontWeight: 500,
          color: error ? '#dc3545' : '#374151',
          ...labelSizes[size],
        }}
      >
        {label}
        {required && (
          <span style={{ color: '#dc3545', marginLeft: '4px' }} aria-hidden="true">
            *
          </span>
        )}
      </label>

      {/* Input primitive with compound-managed accessibility */}
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        inputSize={size}
        hasError={!!error}
        autoComplete={autoComplete}
        aria-describedby={describedBy}
        aria-invalid={!!error}
        aria-required={required}
      />

      {/* Helper text - only shown when no error */}
      {helperText && !error && (
        <p
          id={helperId}
          style={{
            margin: '6px 0 0',
            fontSize: size === 'sm' ? '12px' : '13px',
            color: '#6b7280',
          }}
        >
          {helperText}
        </p>
      )}

      {/* Error message with role="alert" for screen readers */}
      {error && (
        <p
          id={errorId}
          role="alert"
          style={{
            margin: '6px 0 0',
            fontSize: size === 'sm' ? '12px' : '13px',
            color: '#dc3545',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// DEMO: TextField in action
// ============================================================================

export default function App() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  const validators: Record<string, (value: string) => string | undefined> = {
    email: (v) => {
      if (!v) return 'Email is required';
      if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(v)) return 'Please enter a valid email';
      return undefined;
    },
    password: (v) => {
      if (!v) return 'Password is required';
      if (v.length < 8) return 'Password must be at least 8 characters';
      if (!/(?=.*[A-Z])/.test(v)) return 'Include at least one uppercase letter';
      if (!/(?=.*[0-9])/.test(v)) return 'Include at least one number';
      return undefined;
    },
    username: (v) => {
      if (!v) return 'Username is required';
      if (v.length < 3) return 'Username must be at least 3 characters';
      if (!/^[a-zA-Z0-9_]+$/.test(v)) return 'Only letters, numbers, and underscores';
      return undefined;
    },
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validators[field]?.(formData[field as keyof typeof formData]);
    setErrors((prev) => ({ ...prev, [field]: error || '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors: Record<string, string> = {};
    Object.keys(validators).forEach((field) => {
      const error = validators[field](formData[field as keyof typeof formData]);
      if (error) newErrors[field] = error;
    });
    
    setErrors(newErrors);
    setTouched({ email: true, password: true, username: true });

    if (Object.keys(newErrors).length === 0) {
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  return (
    <div style={{ padding: '24px', fontFamily: 'system-ui, sans-serif', maxWidth: '480px' }}>
      <h2 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: 600 }}>
        Create Account
      </h2>
      <p style={{ margin: '0 0 24px', color: '#6b7280' }}>
        TextField compound handles all accessibility automatically.
      </p>

      <form onSubmit={handleSubmit}>
        <TextField
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          required
          value={formData.email}
          onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
          onBlur={() => handleBlur('email')}
          error={touched.email ? errors.email : undefined}
          helperText="We'll send your confirmation here"
          autoComplete="email"
        />

        <TextField
          label="Username"
          placeholder="Choose a username"
          required
          value={formData.username}
          onChange={(e) => setFormData((p) => ({ ...p, username: e.target.value }))}
          onBlur={() => handleBlur('username')}
          error={touched.username ? errors.username : undefined}
          helperText="Letters, numbers, and underscores only"
          autoComplete="username"
        />

        <TextField
          label="Password"
          type="password"
          placeholder="Create a strong password"
          required
          value={formData.password}
          onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
          onBlur={() => handleBlur('password')}
          error={touched.password ? errors.password : undefined}
          helperText="8+ characters with uppercase and number"
          autoComplete="new-password"
        />

        <TextField
          label="Referral Code"
          placeholder="Optional"
          helperText="Enter a friend's code for bonus credits"
        />

        <TextField
          label="Disabled Field"
          placeholder="Cannot edit"
          disabled
          helperText="This field is locked"
        />

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '12px 20px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
            marginTop: '8px',
          }}
        >
          Create Account
        </button>
      </form>

      {submitted && (
        <div
          style={{
            marginTop: '16px',
            padding: '12px 16px',
            backgroundColor: '#d1fae5',
            border: '1px solid #6ee7b7',
            borderRadius: '8px',
            color: '#065f46',
            fontSize: '14px',
          }}
        >
          Account created successfully!
        </div>
      )}

      <div
        style={{
          marginTop: '24px',
          padding: '16px',
          backgroundColor: '#f3f4f6',
          borderRadius: '8px',
          fontSize: '14px',
        }}
      >
        <strong style={{ display: 'block', marginBottom: '8px' }}>
          Compound Benefits:
        </strong>
        <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: 1.6 }}>
          <li>Bundles Input + Label + Helper + Error</li>
          <li>Auto-generates IDs and ARIA associations</li>
          <li>Consistent spacing and visual rhythm</li>
          <li>Error states with role="alert"</li>
          <li>Impossible to forget accessibility</li>
        </ul>
      </div>
    </div>
  );
}`;

const cardCompoundCode = `// Card Compound - Bundles header, body, footer with consistent structure
import { useState } from 'react';

// ============================================================================
// COMPOUND: Card with slots for structured content
// ============================================================================

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
  selected?: boolean;
  onClick?: () => void;
}

function Card({ 
  children, 
  variant = 'default', 
  padding = 'md',
  interactive,
  selected,
  onClick 
}: CardProps) {
  const paddingMap = { none: 0, sm: 12, md: 20, lg: 28 };
  
  const variantStyles: Record<string, React.CSSProperties> = {
    default: { 
      backgroundColor: 'white', 
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
    },
    elevated: { 
      backgroundColor: 'white', 
      boxShadow: '0 4px 12px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08)'
    },
    outlined: { 
      backgroundColor: 'transparent', 
      border: '1px solid #d1d5db'
    },
    filled: { 
      backgroundColor: '#f3f4f6', 
      border: '1px solid transparent'
    },
  };

  const interactiveStyles: React.CSSProperties = interactive ? {
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  } : {};

  const selectedStyles: React.CSSProperties = selected ? {
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)',
  } : {};

  return (
    <div
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (interactive && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick?.();
        }
      }}
      style={{
        borderRadius: '12px',
        padding: paddingMap[padding],
        ...variantStyles[variant],
        ...interactiveStyles,
        ...selectedStyles,
      }}
    >
      {children}
    </div>
  );
}

// Slot components for semantic structure
Card.Header = ({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '1px solid #f3f4f6'
  }}>
    <div>{children}</div>
    {action && <div>{action}</div>}
  </div>
);

Card.Title = ({ children }: { children: React.ReactNode }) => (
  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#111827' }}>
    {children}
  </h3>
);

Card.Subtitle = ({ children }: { children: React.ReactNode }) => (
  <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#6b7280' }}>
    {children}
  </p>
);

Card.Body = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontSize: '15px', color: '#374151', lineHeight: 1.6 }}>
    {children}
  </div>
);

Card.Footer = ({ children, align = 'end' }: { children: React.ReactNode; align?: 'start' | 'center' | 'end' | 'between' }) => {
  const alignMap = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    between: 'space-between'
  };
  
  return (
    <div style={{ 
      display: 'flex', 
      gap: '12px', 
      justifyContent: alignMap[align],
      marginTop: '20px',
      paddingTop: '16px',
      borderTop: '1px solid #f3f4f6'
    }}>
      {children}
    </div>
  );
};

// ============================================================================
// DEMO: Card compound variations
// ============================================================================

export default function App() {
  const [selectedCard, setSelectedCard] = useState<number | null>(null);

  const plans = [
    { id: 1, name: 'Starter', price: '$9', features: ['5 projects', '10GB storage', 'Email support'] },
    { id: 2, name: 'Pro', price: '$29', features: ['Unlimited projects', '100GB storage', 'Priority support', 'API access'] },
    { id: 3, name: 'Enterprise', price: '$99', features: ['Everything in Pro', 'Dedicated support', 'Custom integrations', 'SLA guarantee'] },
  ];

  return (
    <div style={{ padding: '24px', fontFamily: 'system-ui', maxWidth: '800px' }}>
      <h2 style={{ margin: '0 0 24px' }}>Card Compound Examples</h2>

      {/* Basic Card */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', color: '#6b7280', marginBottom: '12px' }}>Basic Card with Slots</h3>
        <Card variant="elevated">
          <Card.Header action={<button style={{ padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: '6px', background: 'white', cursor: 'pointer' }}>Edit</button>}>
            <Card.Title>Project Overview</Card.Title>
            <Card.Subtitle>Last updated 2 hours ago</Card.Subtitle>
          </Card.Header>
          <Card.Body>
            <p style={{ margin: 0 }}>
              Cards bundle header, body, and footer with consistent spacing and structure. 
              The compound ensures semantic organization while allowing flexible content.
            </p>
          </Card.Body>
          <Card.Footer>
            <button style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '6px', background: 'white', cursor: 'pointer' }}>Cancel</button>
            <button style={{ padding: '8px 16px', border: 'none', borderRadius: '6px', background: '#3b82f6', color: 'white', cursor: 'pointer' }}>Save Changes</button>
          </Card.Footer>
        </Card>
      </div>

      {/* Interactive Selection Cards */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', color: '#6b7280', marginBottom: '12px' }}>Interactive Selection</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {plans.map((plan) => (
            <Card
              key={plan.id}
              variant="outlined"
              interactive
              selected={selectedCard === plan.id}
              onClick={() => setSelectedCard(plan.id)}
            >
              <Card.Title>{plan.name}</Card.Title>
              <p style={{ fontSize: '28px', fontWeight: 700, margin: '12px 0', color: '#111827' }}>
                {plan.price}<span style={{ fontSize: '14px', fontWeight: 400, color: '#6b7280' }}>/mo</span>
              </p>
              <ul style={{ margin: 0, padding: '0 0 0 20px', fontSize: '14px', color: '#4b5563' }}>
                {plan.features.map((f, i) => <li key={i} style={{ marginBottom: '4px' }}>{f}</li>)}
              </ul>
            </Card>
          ))}
        </div>
      </div>

      {/* Variant Showcase */}
      <h3 style={{ fontSize: '16px', color: '#6b7280', marginBottom: '12px' }}>Card Variants</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        <Card variant="default">
          <Card.Title>Default</Card.Title>
          <Card.Body>Subtle border with light shadow</Card.Body>
        </Card>
        <Card variant="elevated">
          <Card.Title>Elevated</Card.Title>
          <Card.Body>Prominent shadow for emphasis</Card.Body>
        </Card>
        <Card variant="outlined">
          <Card.Title>Outlined</Card.Title>
          <Card.Body>Border only, transparent background</Card.Body>
        </Card>
        <Card variant="filled">
          <Card.Title>Filled</Card.Title>
          <Card.Body>Solid background color</Card.Body>
        </Card>
      </div>

      <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f3f4f6', borderRadius: '8px', fontSize: '14px' }}>
        <strong>Card Compound Benefits:</strong>
        <ul style={{ margin: '8px 0 0', paddingLeft: '20px' }}>
          <li>Semantic slots: Header, Title, Subtitle, Body, Footer</li>
          <li>Consistent spacing and visual rhythm</li>
          <li>Interactive mode with keyboard support</li>
          <li>Selection state management</li>
          <li>Variant system for different contexts</li>
        </ul>
      </div>
    </div>
  );
}`;

const chipCompoundCode = `// Chip/Tag Compound - Bundles label, icon, and dismiss action
import { useState } from 'react';

// ============================================================================
// COMPOUND: Chip with optional icon and dismiss
// ============================================================================

interface ChipProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  onDismiss?: () => void;
  onClick?: () => void;
  disabled?: boolean;
}

function Chip({
  children,
  variant = 'default',
  size = 'md',
  icon,
  onDismiss,
  onClick,
  disabled,
}: ChipProps) {
  const sizeStyles = {
    sm: { padding: '2px 8px', fontSize: '12px', gap: '4px' },
    md: { padding: '4px 12px', fontSize: '13px', gap: '6px' },
    lg: { padding: '6px 14px', fontSize: '14px', gap: '8px' },
  };

  const variantStyles: Record<string, { bg: string; text: string; border: string }> = {
    default: { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' },
    primary: { bg: '#dbeafe', text: '#1d4ed8', border: '#93c5fd' },
    success: { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' },
    warning: { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
    error: { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },
  };

  const colors = variantStyles[variant];
  const isInteractive = onClick || onDismiss;

  return (
    <span
      role={onClick ? 'button' : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
      onClick={disabled ? undefined : onClick}
      onKeyDown={(e) => {
        if (onClick && !disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: '9999px',
        fontWeight: 500,
        border: \`1px solid \${colors.border}\`,
        backgroundColor: colors.bg,
        color: colors.text,
        cursor: isInteractive && !disabled ? 'pointer' : 'default',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.15s',
        ...sizeStyles[size],
      }}
    >
      {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
      <span>{children}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) onDismiss();
          }}
          disabled={disabled}
          aria-label="Remove"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            marginLeft: '2px',
            marginRight: '-4px',
            width: size === 'sm' ? '14px' : size === 'lg' ? '20px' : '16px',
            height: size === 'sm' ? '14px' : size === 'lg' ? '20px' : '16px',
            border: 'none',
            borderRadius: '50%',
            background: 'transparent',
            color: 'inherit',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: 0.7,
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
            <path d="M1.5 1.5l7 7m0-7l-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </span>
  );
}

// ============================================================================
// COMPOUND: ChipGroup for managing multiple chips
// ============================================================================

interface ChipGroupProps {
  children: React.ReactNode;
  label?: string;
  wrap?: boolean;
}

function ChipGroup({ children, label, wrap = true }: ChipGroupProps) {
  return (
    <div role="group" aria-label={label}>
      {label && (
        <span style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#374151' }}>
          {label}
        </span>
      )}
      <div style={{ display: 'flex', flexWrap: wrap ? 'wrap' : 'nowrap', gap: '8px' }}>
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// DEMO: Chip compound in action
// ============================================================================

export default function App() {
  const [tags, setTags] = useState(['React', 'TypeScript', 'Design Systems', 'Accessibility', 'Components']);
  const [selectedFilters, setSelectedFilters] = useState<string[]>(['Active']);

  const filters = ['All', 'Active', 'Completed', 'Archived'];
  const statuses = [
    { label: 'Published', variant: 'success' as const },
    { label: 'Draft', variant: 'default' as const },
    { label: 'Review', variant: 'warning' as const },
    { label: 'Rejected', variant: 'error' as const },
  ];

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));
  
  const toggleFilter = (filter: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
    );
  };

  return (
    <div style={{ padding: '24px', fontFamily: 'system-ui', maxWidth: '600px' }}>
      <h2 style={{ margin: '0 0 24px' }}>Chip Compound Examples</h2>

      {/* Dismissible Tags */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '16px', color: '#6b7280', marginBottom: '12px' }}>Dismissible Tags</h3>
        <ChipGroup label="Skills">
          {tags.map((tag) => (
            <Chip key={tag} variant="primary" onDismiss={() => removeTag(tag)}>
              {tag}
            </Chip>
          ))}
        </ChipGroup>
      </div>

      {/* Filter Chips */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '16px', color: '#6b7280', marginBottom: '12px' }}>Filter Selection</h3>
        <ChipGroup label="Status Filter">
          {filters.map((filter) => (
            <Chip
              key={filter}
              variant={selectedFilters.includes(filter) ? 'primary' : 'default'}
              onClick={() => toggleFilter(filter)}
            >
              {filter}
            </Chip>
          ))}
        </ChipGroup>
      </div>

      {/* Status Badges */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '16px', color: '#6b7280', marginBottom: '12px' }}>Status Indicators</h3>
        <ChipGroup>
          {statuses.map((status) => (
            <Chip
              key={status.label}
              variant={status.variant}
              icon={
                <span style={{ 
                  width: '6px', 
                  height: '6px', 
                  borderRadius: '50%', 
                  backgroundColor: 'currentColor' 
                }} />
              }
            >
              {status.label}
            </Chip>
          ))}
        </ChipGroup>
      </div>

      {/* Sizes */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '16px', color: '#6b7280', marginBottom: '12px' }}>Sizes</h3>
        <ChipGroup>
          <Chip size="sm">Small</Chip>
          <Chip size="md">Medium</Chip>
          <Chip size="lg">Large</Chip>
          <Chip size="md" disabled>Disabled</Chip>
        </ChipGroup>
      </div>

      <div style={{ padding: '16px', backgroundColor: '#f3f4f6', borderRadius: '8px', fontSize: '14px' }}>
        <strong>Chip Compound Benefits:</strong>
        <ul style={{ margin: '8px 0 0', paddingLeft: '20px' }}>
          <li>Bundles label, icon, and dismiss button</li>
          <li>Keyboard accessible (Enter/Space to activate)</li>
          <li>Semantic variants for different contexts</li>
          <li>ChipGroup provides proper grouping semantics</li>
          <li>Consistent sizing and visual rhythm</li>
        </ul>
      </div>
    </div>
  );
}`;

export default function Page() {
  return (
    <section className="content">
      <article>
        <h1>Deep Dive: Compounds</h1>

        <h2>Why Compounds Exist</h2>
        <p>
          If primitives are the raw parts, compounds are the predictable
          bundles. They emerge when teams repeatedly combine the same primitives
          in the same ways. Instead of asking designers and developers to
          reinvent the bundle every time, the system codifies the convention.
        </p>

        <p>
          Compounds give structure to combinations that look obvious in
          hindsight but are fragile in practice:
        </p>
        <ul>
          <li>A text input always needs a label for accessibility.</li>
          <li>A table row always assumes a parent table context.</li>
          <li>
            A card usually pairs heading, body, and actions in a fixed layout.
          </li>
          <li>A chip bundles a label with an optional dismiss button.</li>
        </ul>

        <p>
          The compound layer is where convention becomes codified. It&apos;s
          where the design system says &ldquo;these primitives always travel
          together, and here&apos;s how.&rdquo;
        </p>

        <h2>Characteristics of Compounds</h2>
        <ul>
          <li>
            <strong>Predictable combinations:</strong> The system declares which
            primitives belong together and how they relate. A TextField always
            includes a label, input, and optional helper/error text.
          </li>
          <li>
            <strong>Narrow scope:</strong> Compounds aren&apos;t meant to
            anticipate every possible combination — only the blessed ones that
            the system has validated and documented.
          </li>
          <li>
            <strong>Stable defaults:</strong> Compounds handle spacing,
            grouping, and visual rhythm once, so teams don&apos;t keep tweaking
            the same details across implementations.
          </li>
          <li>
            <strong>Consistent behavior:</strong> Accessibility rules like label
            associations, ARIA attributes, and keyboard support are guaranteed,
            not optional.
          </li>
          <li>
            <strong>Semantic structure:</strong> Compounds often expose
            &ldquo;slots&rdquo; (Header, Body, Footer) that enforce semantic
            organization while allowing flexible content.
          </li>
        </ul>

        <h2>Examples of Compounds</h2>
        <ul>
          <li>
            <strong>TextField:</strong> Bundles Input, Label, HelperText, and
            ErrorMessage with proper ARIA associations.
          </li>
          <li>
            <strong>Card:</strong> Bundles Header, Body, and Footer with
            standardized spacing and optional interactive states.
          </li>
          <li>
            <strong>Chip/Tag:</strong> Bundles Label, optional Icon, and
            optional DismissButton with semantic variants.
          </li>
          <li>
            <strong>TableRow:</strong> Bundles TableCell primitives with
            semantics tied to the parent Table context.
          </li>
          <li>
            <strong>ListItem:</strong> Bundles leading content,
            primary/secondary text, and trailing actions in a consistent layout.
          </li>
          <li>
            <strong>Avatar:</strong> Bundles image, fallback initials, and
            optional status indicator.
          </li>
        </ul>

        <h2>Example: TextField Compound</h2>
        <p>
          The TextField is the canonical example of a compound. It bundles an
          Input primitive with Label, HelperText, and ErrorMessage, while
          managing all the accessibility associations automatically:
        </p>

        <Sandpack
          template="react-ts"
          theme="light"
          files={{
            '/App.tsx': textFieldCode,
          }}
          options={{
            showLineNumbers: true,
            showInlineErrors: true,
            wrapContent: true,
            editorHeight: 500,
          }}
        />

        <h3>What Makes This a Good Compound</h3>
        <ul>
          <li>
            <strong>Auto-generated IDs:</strong> Uses <code>useId()</code> to
            ensure unique IDs without requiring consumers to manage them.
          </li>
          <li>
            <strong>ARIA associations:</strong> Automatically links the input to
            its label, helper text, and error message via{' '}
            <code>aria-describedby</code>.
          </li>
          <li>
            <strong>Error announcements:</strong> Error messages have{' '}
            <code>role=&quot;alert&quot;</code> so screen readers announce them
            immediately.
          </li>
          <li>
            <strong>Consistent spacing:</strong> The compound manages all
            internal spacing, ensuring visual rhythm across all instances.
          </li>
          <li>
            <strong>Size variants:</strong> All parts (label, input, helper
            text) scale together, maintaining proportions.
          </li>
        </ul>

        <h2>Example: Card Compound</h2>
        <p>
          Cards demonstrate the &ldquo;slot&rdquo; pattern, where the compound
          defines semantic areas (Header, Body, Footer) while allowing flexible
          content within each slot:
        </p>

        <Sandpack
          template="react-ts"
          theme="light"
          files={{
            '/App.tsx': cardCompoundCode,
          }}
          options={{
            showLineNumbers: true,
            showInlineErrors: true,
            wrapContent: true,
            editorHeight: 500,
          }}
        />

        <h3>Card Compound Patterns</h3>
        <ul>
          <li>
            <strong>Semantic slots:</strong> <code>Card.Header</code>,{' '}
            <code>Card.Body</code>, <code>Card.Footer</code> enforce structure
            while allowing any content.
          </li>
          <li>
            <strong>Interactive mode:</strong> When <code>interactive</code> is
            true, the card becomes keyboard-accessible with proper focus
            handling.
          </li>
          <li>
            <strong>Selection state:</strong> Cards can indicate selection with
            visual feedback, useful for choice interfaces.
          </li>
          <li>
            <strong>Variant system:</strong> Different visual treatments
            (elevated, outlined, filled) for different contexts.
          </li>
        </ul>

        <h2>Example: Chip Compound</h2>
        <p>
          Chips demonstrate how compounds bundle interactive elements with
          proper accessibility, including dismissible actions and keyboard
          support:
        </p>

        <Sandpack
          template="react-ts"
          theme="light"
          files={{
            '/App.tsx': chipCompoundCode,
          }}
          options={{
            showLineNumbers: true,
            showInlineErrors: true,
            wrapContent: true,
            editorHeight: 500,
          }}
        />

        <h2>The Work of the System at the Compound Layer</h2>

        <h3>1. Define Conventions</h3>
        <ul>
          <li>
            Establish what belongs together: label + input, icon + text, header
            + footer.
          </li>
          <li>
            Document approved variations (e.g., TextField can have optional
            helper text, but never hides the label).
          </li>
          <li>
            Specify the relationship between parts (e.g., error replaces helper
            text, not stacks with it).
          </li>
        </ul>

        <h3>2. Encode Blessed Combinations</h3>
        <ul>
          <li>
            Bake spacing, order, and accessibility rules directly into the
            compound implementation.
          </li>
          <li>
            Example: a TextField enforces label placement above the input and
            links <code>aria-describedby</code> to error/helper text
            automatically.
          </li>
          <li>
            Consumers can&apos;t accidentally break these associations because
            they&apos;re not exposed as options.
          </li>
        </ul>

        <h3>3. Allow Controlled Flexibility</h3>
        <ul>
          <li>
            Compounds should allow flexibility through slots and optional props,
            but within defined boundaries.
          </li>
          <li>
            The key is to prevent unbounded prop creep — flexibility should
            follow the system&apos;s conventions, not bypass them.
          </li>
          <li>
            Example: A Card allows any content in its Body slot, but the spacing
            between Header and Body is fixed.
          </li>
        </ul>

        <h2>Pitfalls of Compounds</h2>

        <ol>
          <li>
            <strong>Prop Explosion</strong>
            <ul>
              <li>
                When compounds try to solve every variation, they mutate into
                composers. If you find yourself adding a boolean prop every
                sprint, you&apos;ve crossed layers.
              </li>
              <li>
                <em>Guardrail:</em> Compounds support only the blessed
                variations. Complex orchestration belongs in composers.
              </li>
            </ul>
          </li>
          <li>
            <strong>Breaking Accessibility by Accident</strong>
            <ul>
              <li>
                A text field without a proper <code>&lt;label&gt;</code> or{' '}
                <code>aria-describedby</code> is a broken compound. Making
                accessibility optional defeats the purpose.
              </li>
              <li>
                <em>Guardrail:</em> Accessibility associations must be baked in
                and impossible to disable.
              </li>
            </ul>
          </li>
          <li>
            <strong>Over-abstracting Visuals</strong>
            <ul>
              <li>
                Avoid infinite layout variations. A Card that allows every
                combination of header/body/footer permutations becomes
                ungovernable.
              </li>
              <li>
                <em>Guardrail:</em> Fix the expected structure, allow slots for
                content variation.
              </li>
            </ul>
          </li>
          <li>
            <strong>Duplication of Logic</strong>
            <ul>
              <li>
                Don&apos;t reimplement primitive behaviors inside compounds.
                Don&apos;t reinvent Checkbox logic inside a
                &ldquo;FilterRow&rdquo; compound.
              </li>
              <li>
                <em>Guardrail:</em> Compounds compose primitives; they
                don&apos;t replace them.
              </li>
            </ul>
          </li>
          <li>
            <strong>Leaking Internal Structure</strong>
            <ul>
              <li>
                Exposing too many internal details (like specific CSS classes or
                DOM structure) makes compounds fragile to change.
              </li>
              <li>
                <em>Guardrail:</em> Expose semantic props and slots, not
                implementation details.
              </li>
            </ul>
          </li>
        </ol>

        <h2>Compounds vs. Primitives vs. Composers</h2>
        <p>
          Understanding where compounds fit in the component hierarchy is
          crucial for proper system design:
        </p>

        <ul>
          <li>
            <strong>Primitives</strong> are single-purpose, atomic components
            (Button, Input, Icon). They have no opinion about how they&apos;re
            used together.
          </li>
          <li>
            <strong>Compounds</strong> are blessed combinations of primitives
            with baked-in conventions (TextField = Input + Label + Error). They
            encode &ldquo;these things always go together.&rdquo;
          </li>
          <li>
            <strong>Composers</strong> orchestrate state, focus, and interaction
            across multiple children (Modal, FormField, Toolbar). They manage
            complex behavior, not just structure.
          </li>
        </ul>

        <p>
          A good rule of thumb: if you&apos;re managing state transitions, focus
          trapping, or multi-step interactions, you&apos;re in composer
          territory. If you&apos;re bundling parts that always appear together
          with consistent styling, you&apos;re in compound territory.
        </p>

        <h2>Why Compounds Are Critical</h2>
        <ul>
          <li>
            <strong>Reduce cognitive load:</strong> Designers and engineers
            don&apos;t have to reassemble primitives every time or remember
            accessibility requirements.
          </li>
          <li>
            <strong>Prevent inconsistent conventions:</strong> Spacing, order,
            and accessibility are centralized and enforced.
          </li>
          <li>
            <strong>Free the system team:</strong> By pre-blessing common
            bundles, the system reduces requests for one-off variations.
          </li>
          <li>
            <strong>Create legibility:</strong> &ldquo;TextField&rdquo;
            communicates intent better than &ldquo;Input + Label + Error stacked
            manually.&rdquo;
          </li>
          <li>
            <strong>Enable safe updates:</strong> When the compound
            implementation improves, all consumers benefit automatically.
          </li>
        </ul>

        <h2>Summary</h2>
        <p>
          Compounds are the codified bundles of your design system. They
          represent the layer where the system says &ldquo;these primitives
          always travel together, and here&apos;s the blessed way to combine
          them.&rdquo;
        </p>

        <ul>
          <li>
            <strong>Examples:</strong> TextField, Card, Chip, TableRow,
            ListItem, Avatar
          </li>
          <li>
            <strong>Work of the system:</strong> Define conventions, encode
            blessed combinations, bake in accessibility
          </li>
          <li>
            <strong>Pitfalls:</strong> Prop explosion, accessibility drift,
            ungoverned permutations, logic duplication
          </li>
          <li>
            <strong>Key benefit:</strong> Impossible to forget accessibility or
            spacing conventions
          </li>
        </ul>

        <p>
          If{' '}
          <Link href="/blueprints/component-standards/component-complexity/primitives">
            primitives
          </Link>{' '}
          are the boring DNA, compounds are the grammar rules — they make sure
          the words can be combined into predictable, legible sentences.
        </p>

        <h2>Next Steps</h2>
        <p>
          Compounds work well on their own, but they really shine when
          orchestrated by{' '}
          <Link href="/blueprints/component-standards/component-complexity/composer">
            composers
          </Link>{' '}
          (which add state management and complex interactions) or combined into{' '}
          <Link href="/blueprints/component-standards/component-complexity/assemblies">
            assemblies
          </Link>{' '}
          (which create complete product flows).
        </p>

        <p>
          Return to the{' '}
          <Link href="/blueprints/component-standards/component-complexity">
            Component Complexity overview
          </Link>{' '}
          to see how all these layers work together.
        </p>
      </article>
      <Link href="/blueprints/component-standards/component-complexity">
        ← Back to Component Standards
      </Link>
    </section>
  );
}
