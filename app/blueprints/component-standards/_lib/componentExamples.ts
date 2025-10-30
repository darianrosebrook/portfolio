import {
  type ControlDef,
  type VariantGrid,
  type VirtualProject,
} from '@/ui/modules/CodeSandbox/types';
import { type ComponentItem } from './componentsData';

// Enhanced component example generators based on actual component implementations
export function generateEnhancedInteractiveProject(
  component: ComponentItem
): VirtualProject {
  const componentName = component.component;
  const isBuilt = component.status === 'Built';

  if (!isBuilt) {
    return generatePlaceholderProject(component);
  }

  // Generate component-specific examples
  let project: VirtualProject;

  switch (componentName) {
    case 'Button':
      project = generateButtonProject();
      break;
    case 'Avatar':
      project = generateAvatarProject();
      break;
    case 'Badge':
      project = generateBadgeProject();
      break;
    case 'Card':
      project = generateCardProject();
      break;
    case 'Input':
      project = generateInputProject();
      break;
    case 'Switch':
      project = generateSwitchProject();
      break;
    case 'Tabs':
      project = generateTabsProject();
      break;
    case 'Toast':
      project = generateToastProject();
      break;
    case 'Tooltip':
      project = generateTooltipProject();
      break;
    default:
      project = generateGenericProject(component);
      break;
  }

  // Ensure we always return a valid project with files array
  if (!project || !project.files || !Array.isArray(project.files)) {
    console.warn(
      `Invalid project generated for component ${componentName}, falling back to generic project`
    );
    return generateGenericProject(component);
  }

  return project;
}

export function generateEnhancedVariantGrid(
  component: ComponentItem
): VariantGrid {
  const componentName = component.component;

  switch (componentName) {
    case 'Button':
      return {
        rows: {
          id: 'variant',
          label: 'Variant',
          values: ['primary', 'secondary', 'tertiary'],
          defaultValue: 'primary',
        },
        cols: {
          id: 'size',
          label: 'Size',
          values: ['small', 'medium', 'large'],
          defaultValue: 'medium',
        },
      };
    case 'Badge':
      return {
        rows: {
          id: 'variant',
          label: 'Variant',
          values: ['default', 'success', 'warning', 'danger'],
          defaultValue: 'default',
        },
        cols: {
          id: 'size',
          label: 'Size',
          values: ['small', 'medium', 'large'],
          defaultValue: 'medium',
        },
      };
    default:
      return {
        rows: {
          id: 'size',
          label: 'Size',
          values: ['small', 'medium', 'large'],
          defaultValue: 'medium',
        },
      };
  }
}

export function generateEnhancedControls(
  component: ComponentItem
): ControlDef[] {
  const componentName = component.component;
  const baseControls: ControlDef[] = [
    {
      id: 'disabled',
      label: 'Disabled',
      kind: 'boolean',
      defaultValue: false,
      a11yImpactNote:
        'Disabled elements are not focusable and not announced by screen readers',
    },
  ];

  switch (componentName) {
    case 'Button':
      return [
        ...baseControls,
        {
          id: 'variant',
          label: 'Variant',
          kind: 'select',
          defaultValue: 'primary',
          options: [
            { label: 'Primary', value: 'primary' },
            { label: 'Secondary', value: 'secondary' },
            { label: 'Tertiary', value: 'tertiary' },
          ],
        },
        {
          id: 'size',
          label: 'Size',
          kind: 'select',
          defaultValue: 'medium',
          options: [
            { label: 'Small', value: 'small' },
            { label: 'Medium', value: 'medium' },
            { label: 'Large', value: 'large' },
          ],
        },
        {
          id: 'loading',
          label: 'Loading',
          kind: 'boolean',
          defaultValue: false,
          a11yImpactNote: 'Loading state should be announced to screen readers',
        },
      ];
    case 'Switch':
      return [
        ...baseControls,
        {
          id: 'checked',
          label: 'Checked',
          kind: 'boolean',
          defaultValue: false,
        },
        {
          id: 'size',
          label: 'Size',
          kind: 'select',
          defaultValue: 'medium',
          options: [
            { label: 'Small', value: 'small' },
            { label: 'Medium', value: 'medium' },
            { label: 'Large', value: 'large' },
          ],
        },
      ];
    default:
      return baseControls;
  }
}

// Simplified inline component implementations for Sandpack
// These avoid @/ui path alias issues by providing minimal implementations
const SimpleButton = `import React from 'react';

export type ButtonSize = 'small' | 'medium' | 'large';
export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'destructive';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
}

export default function Button({ variant = 'primary', size = 'medium', loading, disabled, children, ...props }: ButtonProps) {
  const baseStyles = {
    padding: size === 'small' ? '0.5rem 1rem' : size === 'large' ? '0.875rem 1.75rem' : '0.75rem 1.5rem',
    fontSize: size === 'small' ? '0.875rem' : size === 'large' ? '1.125rem' : '1rem',
    borderRadius: '0.375rem',
    border: 'none',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.2s',
  };
  
  const variantStyles = {
    primary: { background: '#0066cc', color: 'white' },
    secondary: { background: '#e5e7eb', color: '#1f2937' },
    tertiary: { background: 'transparent', color: '#0066cc', border: '1px solid #0066cc' },
  };
  
  return (
    <button
      style={{ ...baseStyles, ...variantStyles[variant] }}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
}`;

const SimpleAvatar = `import React from 'react';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'small' | 'medium' | 'large';
  initials?: string;
  status?: 'online' | 'away' | 'offline';
}

export default function Avatar({ src, alt, size = 'medium', initials, status }: AvatarProps) {
  const sizeMap = { small: '2rem', medium: '3rem', large: '4rem' };
  const statusColors = { online: '#10b981', away: '#f59e0b', offline: '#6b7280' };
  
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div style={{
        width: sizeMap[size],
        height: sizeMap[size],
        borderRadius: '50%',
        background: '#e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        fontSize: size === 'small' ? '0.75rem' : size === 'large' ? '1.25rem' : '1rem',
        fontWeight: 600,
      }}>
        {src ? (
          <img src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          initials || '??'
        )}
      </div>
      {status && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '0.75rem',
          height: '0.75rem',
          borderRadius: '50%',
          background: statusColors[status],
          border: '2px solid white',
        }} />
      )}
    </div>
  );
}`;

// Component-specific project generators
function generateButtonProject(): VirtualProject {
  return {
    files: [
      {
        path: '/components/Button.tsx',
        contents: SimpleButton,
      },
      {
        path: '/App.tsx',
        contents: `import React from 'react';
import Button from './components/Button';
// PropsBridge writes props to /props.json
import props from '/props.json';

export default function App() {
  return (
    <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <Button
        variant={props.variant || 'primary'}
        size={props.size || 'medium'}
        disabled={props.disabled || false}
        loading={props.loading || false}
      >
        Button Example
      </Button>
    </div>
  );
}`,
      },
    ],
    entry: '/App.tsx',
    dependencies: {
      react: '^18.0.0',
      'react-dom': '^18.0.0',
    },
  };
}

function generateAvatarProject(): VirtualProject {
  return {
    files: [
      {
        path: '/components/Avatar.tsx',
        contents: SimpleAvatar,
      },
      {
        path: '/App.tsx',
        contents: `import React from 'react';
import Avatar from './components/Avatar';
import props from '/props.json';

export default function App() {
  return (
    <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <Avatar
        size={props.size || 'medium'}
        src={props.src}
        alt={props.alt || 'Avatar'}
        initials={props.initials}
        status={props.status}
      />
    </div>
  );
}`,
      },
    ],
    entry: '/App.tsx',
  };
}

function generateCardProject(): VirtualProject {
  const SimpleCard = `import React from 'react';

interface CardProps {
  variant?: 'default' | 'elevated';
  children: React.ReactNode;
}

const Card = ({ variant = 'default', children }: CardProps) => (
  <div style={{
    background: 'white',
    borderRadius: '0.5rem',
    boxShadow: variant === 'elevated' ? '0 4px 6px rgba(0,0,0,0.1)' : 'none',
    border: '1px solid #e5e7eb',
  }}>
    {children}
  </div>
);

Card.Header = ({ children }: { children: React.ReactNode }) => (
  <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>{children}</div>
);

Card.Body = ({ children }: { children: React.ReactNode }) => (
  <div style={{ padding: '1rem' }}>{children}</div>
);

Card.Footer = ({ children }: { children: React.ReactNode }) => (
  <div style={{ padding: '1rem', borderTop: '1px solid #e5e7eb' }}>{children}</div>
);

export default Card;`;

  return {
    files: [
      {
        path: '/components/Card.tsx',
        contents: SimpleCard,
      },
      {
        path: '/components/Button.tsx',
        contents: SimpleButton,
      },
      {
        path: '/components/Avatar.tsx',
        contents: SimpleAvatar,
      },
      {
        path: '/App.tsx',
        contents: `import React from 'react';
import Card from './components/Card';
import Button from './components/Button';
import Avatar from './components/Avatar';

export default function App() {
  return (
    <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
      <Card>
        <Card.Header>
          <h3>Simple Card</h3>
        </Card.Header>
        <Card.Body>
          <p>This is a basic card with header and body content.</p>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Avatar size="small" initials="DR" />
            <div>
              <h4 style={{ margin: 0 }}>Darian Rosebrook</h4>
              <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.7 }}>2 hours ago</p>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          <p>Card with avatar and metadata in the header.</p>
        </Card.Body>
        <Card.Footer>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button size="small" variant="secondary">Like</Button>
            <Button size="small" variant="secondary">Share</Button>
          </div>
        </Card.Footer>
      </Card>

      <Card variant="elevated">
        <Card.Body>
          <h3>Elevated Card</h3>
          <p>This card has an elevated appearance with shadow.</p>
        </Card.Body>
      </Card>
    </div>
  );
}`,
      },
    ],
    entry: '/App.tsx',
  };
}

function generateSwitchProject(): VirtualProject {
  const SimpleSwitch = `import React from 'react';

interface SwitchProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  children?: React.ReactNode;
}

export default function Switch({ checked = false, onChange, size = 'medium', disabled, children }: SwitchProps) {
  const sizeMap = { small: '1.5rem', medium: '2rem', large: '2.5rem' };
  const thumbSize = { small: '0.75rem', medium: '1rem', large: '1.25rem' };
  
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1 }}>
      <div
        onClick={() => !disabled && onChange?.(!checked)}
        style={{
          width: sizeMap[size],
          height: '1.25rem',
          borderRadius: '9999px',
          background: checked ? '#10b981' : '#d1d5db',
          position: 'relative',
          transition: 'all 0.2s',
          padding: '0.125rem',
        }}
      >
        <div
          style={{
            width: thumbSize[size],
            height: thumbSize[size],
            borderRadius: '50%',
            background: 'white',
            transform: checked ? \`translateX(calc(\${sizeMap[size]} - \${thumbSize[size]} - 0.25rem))\` : 'translateX(0)',
            transition: 'transform 0.2s',
          }}
        />
      </div>
      {children && <span>{children}</span>}
    </label>
  );
}`;

  return {
    files: [
      {
        path: '/components/Switch.tsx',
        contents: SimpleSwitch,
      },
      {
        path: '/App.tsx',
        contents: `import React from 'react';
import Switch from './components/Switch';
import props from '/props.json';

export default function App() {
  return (
    <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <Switch
        checked={props.checked || false}
        size={props.size || 'medium'}
        disabled={props.disabled || false}
      >
        {props.children || 'Toggle Switch'}
      </Switch>
    </div>
  );
}`,
      },
    ],
    entry: '/App.tsx',
  };
}

function generateGenericProject(component: ComponentItem): VirtualProject {
  const componentName = component.component;
  
  // Create a simple placeholder component
  const SimpleComponent = `import React from 'react';

interface ${componentName}Props {
  children?: React.ReactNode;
  [key: string]: any;
}

export default function ${componentName}({ children, ...props }: ${componentName}Props) {
  return (
    <div style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
      {children || \`${componentName} Component\`}
    </div>
  );
}`;

  return {
    files: [
      {
        path: `/components/${componentName}.tsx`,
        contents: SimpleComponent,
      },
      {
        path: '/App.tsx',
        contents: `import React from 'react';
import ${componentName} from './components/${componentName}';
import props from '/props.json';

export default function App() {
  return (
    <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <${componentName} {...props}>
        {props.children || 'Example ${componentName.toLowerCase()} content'}
      </${componentName}>
    </div>
  );
}`,
      },
    ],
    entry: '/App.tsx',
  };
}

function generatePlaceholderProject(component: ComponentItem): VirtualProject {
  return {
    files: [
      {
        path: '/App.tsx',
        contents: `import React from 'react';

export default function App() {
  return (
    <div style={{ 
      padding: '2rem', 
      textAlign: 'center',
      background: '#f8f9fa',
      border: '2px dashed #dee2e6',
      borderRadius: '8px',
      color: '#6c757d'
    }}>
      <h2>${component.component} Component</h2>
      <p>This component is planned but not yet implemented.</p>
      <p>Status: <strong>${component.status}</strong></p>
      <p>Layer: <strong>${component.layer}</strong></p>
      <p>Category: <strong>${component.category}</strong></p>
    </div>
  );
}`,
      },
    ],
    entry: '/App.tsx',
  };
}

// Additional generators for other components...
function generateBadgeProject(): VirtualProject {
  const SimpleBadge = `import React from 'react';

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger';
  size?: 'small' | 'medium' | 'large';
  count?: number;
  max?: number;
  dot?: boolean;
  children?: React.ReactNode;
}

export default function Badge({ variant = 'default', size = 'medium', count, max, dot, children }: BadgeProps) {
  const variantStyles = {
    default: { background: '#6b7280', color: 'white' },
    success: { background: '#10b981', color: 'white' },
    warning: { background: '#f59e0b', color: 'white' },
    danger: { background: '#ef4444', color: 'white' },
  };
  
  const sizeStyles = {
    small: { fontSize: '0.75rem', padding: '0.125rem 0.5rem' },
    medium: { fontSize: '0.875rem', padding: '0.25rem 0.75rem' },
    large: { fontSize: '1rem', padding: '0.375rem 1rem' },
  };
  
  if (dot) {
    return <span style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: variantStyles[variant].background, display: 'inline-block' }} />;
  }
  
  if (count !== undefined) {
    const displayCount = max && count > max ? \`\${max}+\` : String(count);
    return (
      <span style={{
        ...variantStyles[variant],
        ...sizeStyles[size],
        borderRadius: '9999px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '1.25rem',
      }}>
        {displayCount}
      </span>
    );
  }
  
  return (
    <span style={{
      ...variantStyles[variant],
      ...sizeStyles[size],
      borderRadius: '9999px',
      display: 'inline-block',
    }}>
      {children}
    </span>
  );
}`;

  return {
    files: [
      {
        path: '/components/Badge.tsx',
        contents: SimpleBadge,
      },
      {
        path: '/App.tsx',
        contents: `import React from 'react';
import Badge from './components/Badge';
import props from '/props.json';

export default function App() {
  return (
    <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <Badge
        variant={props.variant || 'default'}
        size={props.size || 'medium'}
        count={props.count}
        max={props.max}
        dot={props.dot}
      >
        {props.children || 'Badge'}
      </Badge>
    </div>
  );
}`,
      },
    ],
    entry: '/App.tsx',
  };
}

function generateInputProject(): VirtualProject {
  const SimpleInput = `import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  size?: 'small' | 'medium' | 'large';
  error?: boolean;
  success?: boolean;
}

export default function Input({ size = 'medium', error, success, ...props }: InputProps) {
  const sizeStyles = {
    small: { fontSize: '0.875rem', padding: '0.5rem' },
    medium: { fontSize: '1rem', padding: '0.75rem' },
    large: { fontSize: '1.125rem', padding: '1rem' },
  };
  
  return (
    <input
      style={{
        ...sizeStyles[size],
        border: \`1px solid \${error ? '#ef4444' : success ? '#10b981' : '#d1d5db'}\`,
        borderRadius: '0.375rem',
        width: '100%',
        outline: 'none',
        transition: 'all 0.2s',
      }}
      {...props}
    />
  );
}`;

  return {
    files: [
      {
        path: '/components/Input.tsx',
        contents: SimpleInput,
      },
      {
        path: '/App.tsx',
        contents: `import React from 'react';
import Input from './components/Input';
import props from '/props.json';

export default function App() {
  return (
    <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', maxWidth: '400px', width: '100%' }}>
      <Input
        size={props.size || 'medium'}
        error={props.error || false}
        success={props.success || false}
        disabled={props.disabled || false}
        placeholder={props.placeholder || 'Enter text...'}
        type={props.type || 'text'}
        value={props.value || ''}
      />
    </div>
  );
}`,
      },
    ],
    entry: '/App.tsx',
  };
}

function generateTabsProject(): VirtualProject {
  const SimpleTabs = `import React, { useState } from 'react';

interface TabsProps {
  defaultValue?: string;
  children: React.ReactNode;
}

const Tabs = ({ defaultValue, children }: TabsProps) => {
  const [activeTab, setActiveTab] = useState(defaultValue || '');
  const tabsChildren = React.Children.toArray(children) as React.ReactElement[];
  
  const list = tabsChildren.find(child => child.type === Tabs.List);
  const contents = tabsChildren.filter(child => child.type === Tabs.Content);
  
  return (
    <div>
      {React.cloneElement(list!, { activeTab, setActiveTab })}
      {contents.map(content => 
        React.cloneElement(content, { activeTab, key: content.props.value })
      )}
    </div>
  );
};

Tabs.List = ({ activeTab, setActiveTab, children }: any) => (
  <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
    {React.Children.map(children, (child: any) =>
      React.cloneElement(child, { activeTab, setActiveTab })
    )}
  </div>
);

Tabs.Trigger = ({ value, activeTab, setActiveTab, children }: any) => (
  <button
    onClick={() => setActiveTab(value)}
    style={{
      padding: '0.75rem 1.5rem',
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      borderBottom: activeTab === value ? '2px solid #0066cc' : '2px solid transparent',
      color: activeTab === value ? '#0066cc' : '#6b7280',
    }}
  >
    {children}
  </button>
);

Tabs.Content = ({ value, activeTab, children }: any) => (
  activeTab === value ? <div>{children}</div> : null
);

export default Tabs;`;

  return {
    files: [
      {
        path: '/components/Tabs.tsx',
        contents: SimpleTabs,
      },
      {
        path: '/App.tsx',
        contents: `import React from 'react';
import Tabs from './components/Tabs';
import props from '/props.json';

export default function App() {
  return (
    <div style={{ padding: '2rem', minHeight: '100vh' }}>
      <Tabs defaultValue={props.defaultValue || 'tab1'}>
        <Tabs.List>
          <Tabs.Trigger value="tab1">Overview</Tabs.Trigger>
          <Tabs.Trigger value="tab2">Details</Tabs.Trigger>
          <Tabs.Trigger value="tab3">Settings</Tabs.Trigger>
        </Tabs.List>
        
        <Tabs.Content value="tab1">
          <div style={{ padding: '1rem' }}>
            <h3>Overview</h3>
            <p>This is the overview tab content.</p>
          </div>
        </Tabs.Content>
        
        <Tabs.Content value="tab2">
          <div style={{ padding: '1rem' }}>
            <h3>Details</h3>
            <p>This tab contains detailed information.</p>
          </div>
        </Tabs.Content>
        
        <Tabs.Content value="tab3">
          <div style={{ padding: '1rem' }}>
            <h3>Settings</h3>
            <p>Configure your preferences here.</p>
          </div>
        </Tabs.Content>
      </Tabs>
    </div>
  );
}`,
      },
    ],
    entry: '/App.tsx',
  };
}

function generateToastProject(): VirtualProject {
  const SimpleToast = `import React, { useState } from 'react';

let toastContainer: HTMLElement | null = null;

const Toast = {
  show: ({ title, description, variant }: { title: string; description: string; variant: string }) => {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.style.cssText = \`
      padding: 1rem;
      margin: 0.5rem 0;
      background: \${variant === 'success' ? '#10b981' : variant === 'error' ? '#ef4444' : variant === 'warning' ? '#f59e0b' : '#3b82f6'};
      color: white;
      borderRadius: 0.5rem;
      boxShadow: 0 4px 6px rgba(0,0,0,0.1);
    \`;
    toast.innerHTML = \`<strong>\${title}</strong><br/>\${description}\`;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  },
  Container: () => {
    React.useEffect(() => {
      toastContainer = document.getElementById('toast-container');
      if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.cssText = 'position: fixed; top: 1rem; right: 1rem; z-index: 9999;';
        document.body.appendChild(toastContainer);
      }
    }, []);
    return null;
  },
};

export default Toast;`;

  return {
    files: [
      {
        path: '/components/Toast.tsx',
        contents: SimpleToast,
      },
      {
        path: '/components/Button.tsx',
        contents: SimpleButton,
      },
      {
        path: '/App.tsx',
        contents: `import React from 'react';
import Toast from './components/Toast';
import Button from './components/Button';
import props from '/props.json';

export default function App() {
  return (
    <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <Button onClick={() => Toast.show({ 
        title: props.title || 'Toast Notification', 
        description: props.description || 'This is a toast message.', 
        variant: props.variant || 'info' 
      })}>
        Show Toast
      </Button>
      <Toast.Container />
    </div>
  );
}`,
      },
    ],
    entry: '/App.tsx',
  };
}

function generateTooltipProject(): VirtualProject {
  const SimpleTooltip = `import React, { useState } from 'react';

interface TooltipProps {
  content: string;
  position?: 'top' | 'right' | 'bottom' | 'left';
  variant?: 'default' | 'dark' | 'light';
  children: React.ReactElement;
}

export default function Tooltip({ content, position = 'top', variant = 'default', children }: TooltipProps) {
  const [show, setShow] = useState(false);
  const variantStyles = {
    default: { background: '#1f2937', color: 'white' },
    dark: { background: '#111827', color: 'white' },
    light: { background: 'white', color: '#1f2937', border: '1px solid #e5e7eb' },
  };
  
  const positionStyles = {
    top: { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '0.5rem' },
    right: { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: '0.5rem' },
    bottom: { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '0.5rem' },
    left: { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: '0.5rem' },
  };
  
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {React.cloneElement(children, {
        onMouseEnter: () => setShow(true),
        onMouseLeave: () => setShow(false),
      })}
      {show && (
        <div style={{
          position: 'absolute',
          padding: '0.5rem 0.75rem',
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
          whiteSpace: 'nowrap',
          zIndex: 1000,
          pointerEvents: 'none',
          ...variantStyles[variant],
          ...positionStyles[position],
        }}>
          {content}
        </div>
      )}
    </div>
  );
}`;

  return {
    files: [
      {
        path: '/components/Tooltip.tsx',
        contents: SimpleTooltip,
      },
      {
        path: '/components/Button.tsx',
        contents: SimpleButton,
      },
      {
        path: '/App.tsx',
        contents: `import React from 'react';
import Tooltip from './components/Tooltip';
import Button from './components/Button';
import props from '/props.json';

export default function App() {
  return (
    <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <Tooltip
        content={props.content || 'Tooltip content'}
        position={props.position || 'top'}
        variant={props.variant || 'default'}
      >
        <Button>{props.children || 'Hover me'}</Button>
      </Tooltip>
    </div>
  );
}`,
      },
    ],
    entry: '/App.tsx',
  };
}
