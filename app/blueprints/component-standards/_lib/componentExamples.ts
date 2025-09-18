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

// Component-specific project generators
function generateButtonProject(): VirtualProject {
  return {
    files: [
      {
        path: '/App.tsx',
        contents: `import React, { useState } from 'react';
import Button from '@/ui/components/Button';
import { Icon } from '@/ui/components/Icon';

export default function App() {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <section>
        <h2>Button Variants</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="tertiary">Tertiary</Button>
        </div>
      </section>

      <section>
        <h2>Button Sizes</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <Button size="small">Small</Button>
          <Button size="medium">Medium</Button>
          <Button size="large">Large</Button>
        </div>
      </section>

      <section>
        <h2>Button States</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Button>Default</Button>
          <Button disabled>Disabled</Button>
          <Button loading={loading} onClick={handleClick}>
            {loading ? 'Loading...' : 'Click to Load'}
          </Button>
        </div>
      </section>

      <section>
        <h2>Icon Buttons</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Button ariaLabel="Settings">
            <Icon name="settings" />
          </Button>
          <Button>
            <Icon name="download" />
            Download
          </Button>
        </div>
      </section>
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
        path: '/App.tsx',
        contents: `import React from 'react';
import Avatar from '@/ui/components/Avatar';

export default function App() {
  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <section>
        <h2>Avatar Sizes</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Avatar size="small" src="/darian-profile.webp" alt="Small avatar" />
          <Avatar size="medium" src="/darian-profile.webp" alt="Medium avatar" />
          <Avatar size="large" src="/darian-profile.webp" alt="Large avatar" />
        </div>
      </section>

      <section>
        <h2>Avatar Fallbacks</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Avatar initials="DR" alt="Darian Rosebrook" />
          <Avatar initials="JS" alt="Jane Smith" />
          <Avatar initials="AB" alt="Alex Brown" />
        </div>
      </section>

      <section>
        <h2>Avatar States</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Avatar src="/darian-profile.webp" alt="Online user" status="online" />
          <Avatar src="/darian-profile.webp" alt="Away user" status="away" />
          <Avatar src="/darian-profile.webp" alt="Offline user" status="offline" />
        </div>
      </section>
    </div>
  );
}`,
      },
    ],
    entry: '/App.tsx',
  };
}

function generateCardProject(): VirtualProject {
  return {
    files: [
      {
        path: '/App.tsx',
        contents: `import React from 'react';
import Card from '@/ui/components/Card';
import Button from '@/ui/components/Button';
import Avatar from '@/ui/components/Avatar';

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
  return {
    files: [
      {
        path: '/App.tsx',
        contents: `import React, { useState } from 'react';
import Switch from '@/ui/components/Switch';

export default function App() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoSave, setAutoSave] = useState(true);

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <section>
        <h2>Switch Sizes</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Switch size="small" checked={true} onChange={() => {}}>
            Small switch
          </Switch>
          <Switch size="medium" checked={true} onChange={() => {}}>
            Medium switch
          </Switch>
          <Switch size="large" checked={true} onChange={() => {}}>
            Large switch
          </Switch>
        </div>
      </section>

      <section>
        <h2>Interactive Switches</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Switch 
            checked={notifications} 
            onChange={setNotifications}
          >
            Enable notifications
          </Switch>
          <Switch 
            checked={darkMode} 
            onChange={setDarkMode}
          >
            Dark mode
          </Switch>
          <Switch 
            checked={autoSave} 
            onChange={setAutoSave}
          >
            Auto-save documents
          </Switch>
        </div>
      </section>

      <section>
        <h2>Switch States</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Switch checked={false} onChange={() => {}}>
            Unchecked switch
          </Switch>
          <Switch checked={true} onChange={() => {}}>
            Checked switch
          </Switch>
          <Switch checked={false} disabled onChange={() => {}}>
            Disabled unchecked
          </Switch>
          <Switch checked={true} disabled onChange={() => {}}>
            Disabled checked
          </Switch>
        </div>
      </section>
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

  return {
    files: [
      {
        path: '/App.tsx',
        contents: `import React from 'react';
import ${componentName} from '@/ui/components/${componentName}';

export default function App() {
  return (
    <div style={{ padding: '2rem' }}>
      <h2>${componentName} Example</h2>
      <${componentName}>
        Example ${componentName.toLowerCase()} content
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
  return {
    files: [
      {
        path: '/App.tsx',
        contents: `import React from 'react';
import Badge from '@/ui/components/Badge';

export default function App() {
  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <section>
        <h2>Badge Variants</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Badge variant="default">Default</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="danger">Danger</Badge>
        </div>
      </section>

      <section>
        <h2>Badge Sizes</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <Badge size="small">Small</Badge>
          <Badge size="medium">Medium</Badge>
          <Badge size="large">Large</Badge>
        </div>
      </section>

      <section>
        <h2>Notification Badges</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Badge count={5} />
          <Badge count={99} />
          <Badge count={999} max={99} />
          <Badge dot />
        </div>
      </section>
    </div>
  );
}`,
      },
    ],
    entry: '/App.tsx',
  };
}

function generateInputProject(): VirtualProject {
  return {
    files: [
      {
        path: '/App.tsx',
        contents: `import React, { useState } from 'react';
import Input from '@/ui/components/Input';

export default function App() {
  const [value, setValue] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '400px' }}>
      <section>
        <h2>Input Types</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input 
            type="text" 
            placeholder="Enter text..." 
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <Input 
            type="email" 
            placeholder="Enter email..." 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input 
            type="password" 
            placeholder="Enter password..." 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </section>

      <section>
        <h2>Input Sizes</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input size="small" placeholder="Small input" />
          <Input size="medium" placeholder="Medium input" />
          <Input size="large" placeholder="Large input" />
        </div>
      </section>

      <section>
        <h2>Input States</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input placeholder="Default input" />
          <Input placeholder="Disabled input" disabled />
          <Input placeholder="Error input" error />
          <Input placeholder="Success input" success />
        </div>
      </section>
    </div>
  );
}`,
      },
    ],
    entry: '/App.tsx',
  };
}

function generateTabsProject(): VirtualProject {
  return {
    files: [
      {
        path: '/App.tsx',
        contents: `import React from 'react';
import Tabs from '@/ui/components/Tabs';

export default function App() {
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Tabs Example</h2>
      <Tabs defaultValue="tab1">
        <Tabs.List>
          <Tabs.Trigger value="tab1">Overview</Tabs.Trigger>
          <Tabs.Trigger value="tab2">Details</Tabs.Trigger>
          <Tabs.Trigger value="tab3">Settings</Tabs.Trigger>
        </Tabs.List>
        
        <Tabs.Content value="tab1">
          <div style={{ padding: '1rem' }}>
            <h3>Overview</h3>
            <p>This is the overview tab content. It provides a general summary of the information.</p>
          </div>
        </Tabs.Content>
        
        <Tabs.Content value="tab2">
          <div style={{ padding: '1rem' }}>
            <h3>Details</h3>
            <p>This tab contains detailed information and specifications.</p>
            <ul>
              <li>Feature 1</li>
              <li>Feature 2</li>
              <li>Feature 3</li>
            </ul>
          </div>
        </Tabs.Content>
        
        <Tabs.Content value="tab3">
          <div style={{ padding: '1rem' }}>
            <h3>Settings</h3>
            <p>Configure your preferences and options here.</p>
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
  return {
    files: [
      {
        path: '/App.tsx',
        contents: `import React from 'react';
import Toast from '@/ui/components/Toast';
import Button from '@/ui/components/Button';

export default function App() {
  const showToast = (type: string) => {
    Toast.show({
      title: \`\${type.charAt(0).toUpperCase() + type.slice(1)} Toast\`,
      description: \`This is a \${type} toast notification.\`,
      variant: type,
    });
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Toast Examples</h2>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <Button onClick={() => showToast('success')}>
          Show Success Toast
        </Button>
        <Button onClick={() => showToast('error')}>
          Show Error Toast
        </Button>
        <Button onClick={() => showToast('warning')}>
          Show Warning Toast
        </Button>
        <Button onClick={() => showToast('info')}>
          Show Info Toast
        </Button>
      </div>
      
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
  return {
    files: [
      {
        path: '/App.tsx',
        contents: `import React from 'react';
import Tooltip from '@/ui/components/Tooltip';
import Button from '@/ui/components/Button';

export default function App() {
  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <section>
        <h2>Tooltip Positions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', textAlign: 'center' }}>
          <Tooltip content="Top tooltip" position="top">
            <Button>Top</Button>
          </Tooltip>
          <Tooltip content="Right tooltip" position="right">
            <Button>Right</Button>
          </Tooltip>
          <Tooltip content="Bottom tooltip" position="bottom">
            <Button>Bottom</Button>
          </Tooltip>
          <Tooltip content="Left tooltip" position="left">
            <Button>Left</Button>
          </Tooltip>
        </div>
      </section>

      <section>
        <h2>Tooltip Variants</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Tooltip content="Default tooltip">
            <Button>Default</Button>
          </Tooltip>
          <Tooltip content="Dark tooltip" variant="dark">
            <Button>Dark</Button>
          </Tooltip>
          <Tooltip content="Light tooltip" variant="light">
            <Button>Light</Button>
          </Tooltip>
        </div>
      </section>
    </div>
  );
}`,
      },
    ],
    entry: '/App.tsx',
  };
}
