'use client';
import * as React from 'react';
import styles from './page.module.scss';

// Import all components at the top to avoid require() issues during SSR
import Text from '@/ui/components/Text';
import Button from '@/ui/components/Button';
import Badge from '@/ui/components/Badge';
import List from '@/ui/components/List';
import { Card } from '@/ui/components/Card';
import Alert from '@/ui/components/Alert';
import Input from '@/ui/components/Input';
import Avatar from '@/ui/components/Avatar';
import Progress from '@/ui/components/Progress';
import Spinner from '@/ui/components/Spinner';
import Divider from '@/ui/components/Divider';
import Blockquote from '@/ui/components/Blockquote';
import { SwitchField } from '@/ui/components/Switch';
import { FieldProvider, Field } from '@/ui/components/Field';
import TextInputAdapter from '@/ui/components/Field/TextInputAdapter';
import CheckboxAdapter from '@/ui/components/Field/CheckboxAdapter';
import {
  Select,
  SelectProvider,
  SelectTrigger,
  SelectContent,
  SelectOptions,
  SelectSearch,
} from '@/ui/components/Select';
import Tabs from '@/ui/components/Tabs';
import Tooltip from '@/ui/components/Tooltip';
import Skeleton from '@/ui/components/Skeleton';
import Details from '@/ui/components/Details';
import Image from '@/ui/components/Image';

type DemoKey =
  | 'Text'
  | 'Button'
  | 'Badge'
  | 'List'
  | 'Card'
  | 'Alert'
  | 'Input'
  | 'Avatar'
  | 'Progress'
  | 'Spinner'
  | 'Divider'
  | 'Blockquote'
  | 'Switch'
  | 'Field'
  | 'Select'
  | 'Tabs'
  | 'Tooltip'
  | 'Toast'
  | 'Skeleton'
  | 'Details'
  | 'Image';

interface ShowcaseCardProps {
  title: string;
  demo: DemoKey;
}

class Boundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch() {
    // no-op: in-page demo boundary
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: 'var(--semantic-color-foreground-danger)' }}>
          Failed to render demo.
        </div>
      );
    }
    return this.props.children as React.ReactElement;
  }
}

function SwitchDemo() {
  const [checked1, setChecked1] = React.useState(false);
  const [checked2, setChecked2] = React.useState(true);
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--core-spacing-size-03)',
      }}
    >
      <SwitchField
        checked={checked1}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setChecked1(e.target.checked)
        }
        label="Enable notifications"
      />
      <SwitchField
        checked={checked2}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setChecked2(e.target.checked)
        }
        label="Dark mode"
      />
      <SwitchField checked={false} disabled onChange={() => {}} label="Disabled switch" />
    </div>
  );
}

function SelectDemo() {
  const options = [
    { id: '1', title: 'Option 1' },
    { id: '2', title: 'Option 2' },
    { id: '3', title: 'Option 3' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--core-spacing-size-03)',
      }}
    >
      <SelectProvider options={options}>
        <Select>
          <SelectTrigger placeholder="Choose an option" />
          <SelectContent>
            <SelectOptions />
          </SelectContent>
        </Select>
      </SelectProvider>
      <SelectProvider options={options}>
        <Select>
          <SelectTrigger placeholder="Search options..." />
          <SelectContent>
            <SelectSearch />
            <SelectOptions />
          </SelectContent>
        </Select>
      </SelectProvider>
    </div>
  );
}

function Demo({ demo }: { demo: DemoKey }) {
  if (demo === 'Text') {
    return (
      <div>
        <Text as="p" variant="body" size="md">
          The quick brown fox jumps over the lazy dog.
        </Text>
        <Text as="h3" variant="title" size="lg">
          Heading Example
        </Text>
      </div>
    );
  }

  if (demo === 'Button') {
    return (
      <div
        style={{
          display: 'flex',
          gap: 'var(--core-spacing-size-03)',
          flexWrap: 'wrap',
        }}
      >
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button size="large">Large</Button>
      </div>
    );
  }

  if (demo === 'Badge') {
    return (
      <div
        style={{
          display: 'flex',
          gap: 'var(--core-spacing-size-03)',
          flexWrap: 'wrap',
        }}
      >
        <Badge>Default</Badge>
        <Badge variant="status" intent="success">
          Success
        </Badge>
        <Badge variant="counter">42</Badge>
      </div>
    );
  }

  if (demo === 'List') {
    return (
      <List as="ul">
        <li>First item</li>
        <li>Second item</li>
        <li>Third item</li>
      </List>
    );
  }

  if (demo === 'Card') {
    return (
      <Card interactive>
        <Card.Header>
          <Card.Title>Example Card</Card.Title>
          <Card.Badge status="in-progress">In Progress</Card.Badge>
        </Card.Header>
        <Card.Content>
          <p>Cards compose content with header, body, and actions.</p>
        </Card.Content>
        <Card.Actions>
          <Button variant="secondary">Action</Button>
        </Card.Actions>
      </Card>
    );
  }

  if (demo === 'Alert') {
    return (
      <Alert intent="warning">
        <Alert.Icon intent="warning" />
        <Alert.Title>Heads up</Alert.Title>
        <Alert.Body>This is a warning-level alert example.</Alert.Body>
      </Alert>
    );
  }

  if (demo === 'Input') {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--core-spacing-size-03)',
        }}
      >
        <Input placeholder="Enter text..." />
        <Input placeholder="Invalid input" invalid />
        <Input placeholder="Disabled input" disabled />
      </div>
    );
  }

  if (demo === 'Avatar') {
    return (
      <div
        style={{
          display: 'flex',
          gap: 'var(--core-spacing-size-03)',
          alignItems: 'center',
        }}
      >
        <Avatar name="John Doe" size="small" />
        <Avatar name="Jane Smith" size="medium" />
        <Avatar name="Bob Johnson" size="large" />
      </div>
    );
  }

  if (demo === 'Progress') {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--core-spacing-size-04)',
        }}
      >
        <Progress value={75} label="Loading progress" showValue />
        <Progress variant="circular" value={60} size="sm" />
        <Progress label="Indeterminate progress" />
      </div>
    );
  }

  if (demo === 'Spinner') {
    return (
      <div
        style={{
          display: 'flex',
          gap: 'var(--core-spacing-size-03)',
          alignItems: 'center',
        }}
      >
        <Spinner size="sm" />
        <Spinner size="md" />
        <Spinner size="lg" />
        <Spinner variant="dots" />
      </div>
    );
  }

  if (demo === 'Divider') {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--core-spacing-size-03)',
        }}
      >
        <div>Content above</div>
        <Divider />
        <div>Content below</div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--core-spacing-size-03)',
          }}
        >
          <span>Left</span>
          <Divider orientation="vertical" style={{ height: '20px' }} />
          <span>Right</span>
        </div>
      </div>
    );
  }

  if (demo === 'Blockquote') {
    return (
      <Blockquote variant="bordered" cite="https://example.com">
        &quot;The best way to predict the future is to create it.&quot;
      </Blockquote>
    );
  }

  if (demo === 'Switch') {
    return <SwitchDemo />;
  }

  if (demo === 'Field') {
    const options = [
      { id: 'us', title: 'United States' },
      { id: 'ca', title: 'Canada' },
      { id: 'mx', title: 'Mexico' },
    ];

    return (
      <div style={{ display: 'grid', gap: 'var(--core-spacing-size-04)' }}>
        <FieldProvider
          name="email"
          required
          label="Email address"
          helpText="We’ll never share your email."
          validate={(v: unknown) => {
            const val = String(v || '');
            if (!val) return 'Email is required';
            return /\S+@\S+\.\S+/.test(val) ? null : 'Enter a valid email';
          }}
        >
          <Field>
            <TextInputAdapter placeholder="you@example.com" />
          </Field>
        </FieldProvider>

        <FieldProvider
          name="country"
          label="Country"
          defaultValue=""
          validate={(v: unknown) => (!v ? 'Please choose a country' : null)}
        >
          <Field>
            <SelectProvider options={options}>
              <Select>
                <SelectTrigger placeholder="Choose…" />
                <SelectContent>
                  <SelectOptions />
                </SelectContent>
              </Select>
            </SelectProvider>
          </Field>
        </FieldProvider>

        <FieldProvider
          name="tos"
          label="I agree to the Terms"
          defaultValue={false}
          validate={(v: unknown) => (v ? null : 'You must accept the terms')}
        >
          <Field>
            <CheckboxAdapter />
          </Field>
        </FieldProvider>
      </div>
    );
  }

  if (demo === 'Select') {
    return <SelectDemo />;
  }

  if (demo === 'Tabs') {
    return (
      <Tabs>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--core-spacing-size-03)',
          }}
        >
          <div style={{ display: 'flex', gap: 'var(--core-spacing-size-02)' }}>
            <button
              style={{
                padding: 'var(--core-spacing-size-02)',
                border: '1px solid var(--semantic-color-border-primary)',
                background: 'var(--semantic-color-background-primary)',
              }}
            >
              Tab 1
            </button>
            <button
              style={{
                padding: 'var(--core-spacing-size-02)',
                border: '1px solid var(--semantic-color-border-primary)',
                background: 'var(--semantic-color-background-primary)',
              }}
            >
              Tab 2
            </button>
            <button
              style={{
                padding: 'var(--core-spacing-size-02)',
                border: '1px solid var(--semantic-color-border-primary)',
                background: 'var(--semantic-color-background-primary)',
              }}
            >
              Tab 3
            </button>
          </div>
          <div
            style={{
              padding: 'var(--core-spacing-size-04)',
              border: '1px solid var(--semantic-color-border-primary)',
              borderRadius: 'var(--core-shape-radius-medium)',
            }}
          >
            Tab content goes here
          </div>
        </div>
      </Tabs>
    );
  }

  if (demo === 'Tooltip') {
    return (
      <div style={{ display: 'flex', gap: 'var(--core-spacing-size-03)' }}>
        <Tooltip content="This is a tooltip">
          <Button>Hover me</Button>
        </Tooltip>
        <Tooltip content="Click to show tooltip" trigger="click">
          <Button variant="secondary">Click me</Button>
        </Tooltip>
      </div>
    );
  }

  if (demo === 'Toast') {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--core-spacing-size-03)',
        }}
      >
        <div
          style={{
            padding: 'var(--core-spacing-size-04)',
            border: '1px solid var(--semantic-color-border-primary)',
            borderRadius: 'var(--core-shape-radius-medium)',
            background: 'var(--semantic-color-background-secondary)',
          }}
        >
          Toast notification example
        </div>
        <div
          style={{
            padding: 'var(--core-spacing-size-04)',
            border: '1px solid var(--semantic-color-border-success)',
            borderRadius: 'var(--core-shape-radius-medium)',
            background: 'var(--semantic-color-background-success)',
          }}
        >
          Success toast
        </div>
      </div>
    );
  }

  if (demo === 'Skeleton') {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--core-spacing-size-04)',
        }}
      >
        <Skeleton variant="text" lines={3} />
        <Skeleton variant="avatar" />
        <Skeleton variant="actions" />
        <Skeleton variant="media" aspectRatio="16/9" />
      </div>
    );
  }

  if (demo === 'Details') {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--core-spacing-size-03)',
        }}
      >
        <Details summary="Click to expand">
          <p>
            This is the collapsible content that appears when you click the
            summary.
          </p>
        </Details>
        <Details summary="Another details section" defaultOpen>
          <p>This one is open by default.</p>
        </Details>
      </div>
    );
  }

  if (demo === 'Image') {
    return (
      <div style={{ display: 'flex', gap: 'var(--core-spacing-size-03)' }}>
        <Image
          src="/darian-square.jpg"
          alt="Example image"
          size="sm"
          radius="md"
          aspectRatio="square"
        />
        <Image
          src="/darian-square.jpg"
          alt="Example image"
          size="md"
          radius="lg"
          aspectRatio="video"
        />
      </div>
    );
  }

  return null;
}

function ShowcaseCard({ title, demo }: ShowcaseCardProps) {
  return (
    <div style={{ width: '100%' }}>
      <div
        style={{
          marginBottom: 'var(--core-spacing-size-03)',
          fontSize: '0.875rem',
          color: 'var(--semantic-color-foreground-secondary)',
        }}
      >
        {title}
      </div>
      <Boundary>
        <Demo demo={demo} />
      </Boundary>
    </div>
  );
}

const demos: {
  key: string;
  title: string;
  demo: DemoKey;
}[] = [
  { key: 'Text', title: 'Text', demo: 'Text' },
  { key: 'Button', title: 'Button', demo: 'Button' },
  { key: 'Badge', title: 'Badge', demo: 'Badge' },
  { key: 'List', title: 'List', demo: 'List' },
  { key: 'Card', title: 'Card', demo: 'Card' },
  { key: 'Alert', title: 'Alert', demo: 'Alert' },
  { key: 'Input', title: 'Input', demo: 'Input' },
  { key: 'Avatar', title: 'Avatar', demo: 'Avatar' },
  { key: 'Progress', title: 'Progress', demo: 'Progress' },
  { key: 'Spinner', title: 'Spinner', demo: 'Spinner' },
  { key: 'Divider', title: 'Divider', demo: 'Divider' },
  { key: 'Blockquote', title: 'Blockquote', demo: 'Blockquote' },
  { key: 'Switch', title: 'Switch', demo: 'Switch' },
  { key: 'Field', title: 'Field (composer)', demo: 'Field' },
  { key: 'Select', title: 'Select', demo: 'Select' },
  { key: 'Tabs', title: 'Tabs', demo: 'Tabs' },
  { key: 'Tooltip', title: 'Tooltip', demo: 'Tooltip' },
  { key: 'Toast', title: 'Toast', demo: 'Toast' },
  { key: 'Skeleton', title: 'Skeleton', demo: 'Skeleton' },
  { key: 'Details', title: 'Details', demo: 'Details' },
  { key: 'Image', title: 'Image', demo: 'Image' },
];

export function ComponentGrid() {
  return (
    <div className={styles.grid}>
      {demos.map((d) => (
        <div key={d.key} className={styles.card}>
          <ShowcaseCard title={d.title} demo={d.demo} />
        </div>
      ))}
    </div>
  );
}
