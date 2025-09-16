'use client';
import * as React from 'react';
import styles from './page.module.scss';

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
  | 'Field';

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

function Demo({ demo }: { demo: DemoKey }) {
  if (demo === 'Text') {
    const Text = require('@/ui/components/Text')
      .default as React.ComponentType<any>;
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
    const Button = require('@/ui/components/Button')
      .default as React.ComponentType<any>;
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
    const Badge = require('@/ui/components/Badge')
      .default as React.ComponentType<any>;
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
    const List = require('@/ui/components/List')
      .default as React.ComponentType<any>;
    return (
      <List as="ul">
        <li>First item</li>
        <li>Second item</li>
        <li>Third item</li>
      </List>
    );
  }

  if (demo === 'Card') {
    const { Card } = require('@/ui/components/Card');
    const Button = require('@/ui/components/Button')
      .default as React.ComponentType<any>;
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
    const Alert = require('@/ui/components/Alert').default as any;
    return (
      <Alert intent="warning">
        <Alert.Icon intent="warning" />
        <Alert.Title>Heads up</Alert.Title>
        <Alert.Body>This is a warning-level alert example.</Alert.Body>
      </Alert>
    );
  }

  if (demo === 'Input') {
    const Input = require('@/ui/components/Input')
      .default as React.ComponentType<any>;
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
    const Avatar = require('@/ui/components/Avatar')
      .default as React.ComponentType<any>;
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
    const Progress = require('@/ui/components/Progress')
      .default as React.ComponentType<any>;
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
    const Spinner = require('@/ui/components/Spinner')
      .default as React.ComponentType<any>;
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
    const Divider = require('@/ui/components/Divider')
      .default as React.ComponentType<any>;
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
    const Blockquote = require('@/ui/components/Blockquote')
      .default as React.ComponentType<any>;
    return (
      <Blockquote variant="bordered" cite="https://example.com">
        "The best way to predict the future is to create it."
      </Blockquote>
    );
  }

  if (demo === 'Switch') {
    const Switch = require('@/ui/components/Switch')
      .default as React.ComponentType<any>;
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
        <Switch
          checked={checked1}
          onChange={(e) => setChecked1(e.target.checked)}
        >
          Enable notifications
        </Switch>
        <Switch
          checked={checked2}
          onChange={(e) => setChecked2(e.target.checked)}
        >
          Dark mode
        </Switch>
        <Switch checked={false} disabled>
          Disabled switch
        </Switch>
      </div>
    );
  }

  if (demo === 'Field') {
    const {
      FieldProvider,
      Field,
      TextInputAdapter,
      SelectAdapter,
      CheckboxAdapter,
    } = require('@/ui/components/Field');

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
            <SelectAdapter options={options} placeholder="Choose…" />
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
