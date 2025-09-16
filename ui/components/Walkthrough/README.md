# Walkthrough (Coachmark / Feature Tour)

A composer that sequences contextual coachmarks anchored to UI elements. Built on the Popover composer; headless logic lives in `useWalkthrough`.

## When to use

- Feature introductions, progressive onboarding, new-UI tours
- Product walkthroughs and guided experiences
- Contextual help and feature discovery
- Multi-step tutorials with anchored content

## Key ideas

- **Headless orchestration**: state, sequencing, anchor resolution, persistence
- **Composable UI**: replace content, controls, and progress via slots
- **Robust target policy**: skip/pin/hide when anchors are missing
- **Built on Popover**: reuses positioning, collision detection, and accessibility
- **Tokenized visuals**: all styling controlled via design tokens

## Architecture

### Layer: Composer

Orchestrates multiple primitives (Popover, buttons, progress indicators), coordinates focus and positioning behavior, exposes slots for customization.

### Meta-patterns

- **Headless logic hook**: `useWalkthrough` contains all state management
- **Context provider**: `WalkthroughProvider` orchestrates and provides context
- **Slotting & substitution**: All visual components are replaceable slots
- **Popover integration**: Built on top of existing Popover composer

## API

### WalkthroughProvider Props

```typescript
interface WalkthroughProps {
  /** Steps can be declared or discovered via <WalkthroughStep/> children */
  steps?: WalkthroughStepSpec[];
  /** Start index (0-based) if uncontrolled */
  defaultIndex?: number;
  /** Controlled index (0-based) */
  index?: number;
  /** Called whenever index changes (controlled or uncontrolled) */
  onIndexChange?(next: number, prev: number): void;
  /** Persist progress with this key (localStorage); omit to disable */
  storageKey?: string;
  /** Autostart when mounted if true and not previously completed */
  autoStart?: boolean;
  /** If true, allow multiple coachmarks concurrently across pages (multi-root) */
  allowConcurrent?: boolean;
  /** Close behavior when clicking target or outside */
  closeOnOutsideClick?: boolean;
  /** Lifecycle */
  onStart?(): void;
  onComplete?(): void;
  onCancel?(): void;
}
```

### Step Specification

```typescript
interface WalkthroughStepSpec {
  /** Stable identifier (analytics, persistence) */
  id: StepId;
  /** Optional: DOM anchor target — selector or element */
  target?: string | HTMLElement | null;
  /** Optional: Popover placement; falls back to Popover default */
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto' | string;
  /** Optional: preferred offset in px */
  offset?: number;
  /** Optional: when true, step is skippable by validator (e.g., target missing) */
  optional?: boolean;
  /** Content hints used by default slots */
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Optional: per-step onEnter/onExit hooks */
  onEnter?(index: number): void | Promise<void>;
  onExit?(index: number): void | Promise<void>;
}
```

### Slot Components

- **`Walkthrough`**: Main wrapper with Popover integration
- **`WalkthroughControls`**: Default controls (Next/Back/Skip/Done)
- **`WalkthroughProgress`**: Progress indicator (dots or counter)
- **`WalkthroughAnchor`**: Target registration helper
- **`WalkthroughStep`**: Declarative step API (optional)

## Usage Examples

### Basic Singular Coachmark

```tsx
import {
  WalkthroughProvider,
  Walkthrough,
  WalkthroughProgress,
  WalkthroughControls,
} from '@/ui/components/Walkthrough';

export function SingularCoachmark() {
  return (
    <WalkthroughProvider
      steps={[
        {
          id: 'search-bar',
          target: '#globalSearch',
          placement: 'bottom',
          title: 'Search everything',
          description:
            'Use the global search to find projects, issues, and people.',
        },
      ]}
      autoStart
      storageKey="walkthrough.search.v1"
      onComplete={() => console.log('done')}
    >
      <Walkthrough>
        <WalkthroughProgress />
        <WalkthroughControls />
      </Walkthrough>
    </WalkthroughProvider>
  );
}
```

### Multi-step Product Walkthrough

```tsx
const steps = [
  {
    id: 'nav-inbox',
    target: '#inbox',
    placement: 'right',
    title: 'Inbox',
    description: 'Your messages live here.',
  },
  {
    id: 'nav-boards',
    target: '#boards',
    placement: 'right',
    title: 'Boards',
    description: 'Organize work visually.',
  },
  {
    id: 'btn-new',
    target: '#newItem',
    placement: 'bottom',
    title: 'Create',
    description: 'Start something new.',
  },
];

export function ProductTour() {
  return (
    <WalkthroughProvider
      steps={steps}
      defaultIndex={0}
      storageKey="tour.app.v2"
      autoStart
      onIndexChange={(next) =>
        window.dispatchEvent(new CustomEvent('tour:step', { detail: { next } }))
      }
      onComplete={() => console.log('completed')}
    >
      <Walkthrough onMissingTarget="skip">
        <WalkthroughProgress />
        <WalkthroughControls />
      </Walkthrough>
    </WalkthroughProvider>
  );
}
```

### Custom Content and Controls

```tsx
export function CustomWalkthrough() {
  return (
    <WalkthroughProvider steps={steps} autoStart>
      <Walkthrough>
        {/* Custom content */}
        <div className="custom-header">
          <h3>Welcome to our app!</h3>
          <WalkthroughProgress dots={false} />
        </div>
        <div className="custom-body">
          <p>Let's show you around...</p>
        </div>
        <WalkthroughControls
          onNext={() => console.log('custom next')}
          onSkip={() => console.log('custom skip')}
        />
      </Walkthrough>
    </WalkthroughProvider>
  );
}
```

### Dynamic Anchors with WalkthroughAnchor

```tsx
function CardWithAnchor({ stepRef }: { stepRef: (el: HTMLElement) => void }) {
  return (
    <WalkthroughAnchor onRef={stepRef}>
      <Card id="dynamicCard" />
    </WalkthroughAnchor>
  );
}

function Page() {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const steps = [{ id: 'dynamic', target: anchorEl, title: 'Dynamic target' }];

  return (
    <WalkthroughProvider steps={steps} autoStart>
      <CardWithAnchor stepRef={setAnchorEl} />
      <Walkthrough />
    </WalkthroughProvider>
  );
}
```

### Controlled Mode

```tsx
function ControlledWalkthrough() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);

  return (
    <WalkthroughProvider
      steps={steps}
      index={isActive ? currentStep : -1}
      onIndexChange={setCurrentStep}
      onComplete={() => setIsActive(false)}
      onCancel={() => setIsActive(false)}
    >
      <button onClick={() => setIsActive(true)}>Start Tour</button>
      <Walkthrough />
    </WalkthroughProvider>
  );
}
```

## Behavior Details

### Target Resolution

- **String selectors**: Uses `document.querySelector()` to find elements
- **HTMLElement**: Direct element references
- **null/undefined**: Triggers missing target policy

### Missing Target Policies

- **`skip`** (default): Automatically advance to next step
- **`pin-to-center`**: Show popover centered on screen
- **`hide`**: Hide the walkthrough until target becomes available

### Persistence

When `storageKey` is provided:

- Progress is saved to `localStorage`
- Completed state is remembered
- Resumes from last step on page reload
- Cleared when tour is cancelled

### Lifecycle Hooks

```typescript
// Per-step hooks
onEnter?(index: number): void | Promise<void>;
onExit?(index: number): void | Promise<void>;

// Global hooks
onStart?(): void;
onComplete?(): void;
onCancel?(): void;
```

## Accessibility

### Cross-platform Support

- **Popover integration**: Inherits focus management and escape/close semantics
- **Progress announcements**: Uses `aria-live="polite"` for step changes
- **Keyboard navigation**: Supports Tab, Enter, Escape, and arrow keys
- **Screen reader support**: Proper labeling and role attributes

### Focus Management

- **Non-intrusive**: Doesn't hijack global focus outside the popover
- **Escape handling**: Closes walkthrough on Escape key
- **Tab trapping**: Contained within popover content

### Reduced Motion

- **Respects preferences**: Honors `prefers-reduced-motion`
- **Minimal animations**: Avoids large auto-scrolls
- **Deterministic positioning**: Predictable anchor resolution

## Accessibility Invariants (Gotchas Handled)

1. **Missing targets**: Policy-driven handling prevents blocking users
2. **Focus & keyboard order**: Delegated to Popover with consistent shortcuts
3. **Scroll into view & positioning**: Minimal, deterministic motion
4. **Fixed/portal layers**: Renders in top-level portal above modals
5. **Route transitions**: Persists progress and re-resolves anchors
6. **Analytics miscounts**: Triggers events exactly once per action
7. **Internationalization**: Delegates directional placement to Popover
8. **Theming**: No hardcoded colors; all styles from tokens
9. **Interference**: Minimal global event handling

## Customization

### Token-based Theming

All visual properties are controlled via design tokens in `Walkthrough.tokens.json`:

- Surface styling (background, border, radius, shadow, padding)
- Typography (title and description sizing, weights, colors)
- Controls (button styling, spacing, colors)
- Progress indicators (dot sizing, colors, spacing)

### Slot Replacement

Replace any visual component:

```tsx
// Custom progress component
function CustomProgress() {
  const { index, count } = useWalkthrough();
  return (
    <div>
      Step {index + 1} of {count}
    </div>
  );
}

// Custom controls
function CustomControls() {
  const { next, prev, cancel } = useWalkthrough();
  return (
    <div>
      <button onClick={prev}>← Previous</button>
      <button onClick={next}>Next →</button>
      <button onClick={cancel}>✕</button>
    </div>
  );
}

// Usage
<Walkthrough>
  <CustomProgress />
  <CustomControls />
</Walkthrough>;
```

## Files Structure

```
Walkthrough/
├── index.tsx                    # Exports
├── types.ts                     # TypeScript interfaces
├── useWalkthrough.ts            # Headless logic
├── WalkthroughProvider.tsx      # Context + orchestration
├── Walkthrough.tsx              # Main component with Popover integration
├── slots/
│   ├── WalkthroughControls.tsx  # Default controls
│   ├── WalkthroughProgress.tsx  # Progress indicator
│   ├── WalkthroughAnchor.tsx    # Anchor helper
│   └── WalkthroughStep.tsx      # Declarative step API
├── Walkthrough.module.scss      # Styles
├── Walkthrough.tokens.json      # Design tokens
├── Walkthrough.tokens.generated.scss # Generated token CSS
└── README.md                    # This file
```

## Why This Travels Well

- **Composer, not configuration**: Orchestration is in `useWalkthrough` and context. Props stay minimal; variation emerges through slots + tokens
- **Headless by default**: Products can reskin without re-implementing sequencing, anchoring, or persistence logic
- **Popover reuse**: Keeps accessibility and collision logic centralized
- **Tokenized**: Typography, spacing, radius, color live in tokens, so multi-brand theming is automatic
- **Clear boundaries**: Walkthrough remains a system composer; specific product flows live as assemblies within app code

## Testing

Comprehensive test coverage should include:

- Unit tests for `useWalkthrough` hook logic
- Integration tests for step sequencing
- Accessibility tests with screen readers
- Cross-platform positioning tests
- Keyboard navigation scenarios
- Persistence and storage scenarios
- Missing target policy handling

Run tests with:

```bash
npm test -- Walkthrough
```

## Performance Considerations

- **Lazy anchor resolution**: Only resolves targets when needed
- **Event listener cleanup**: Proper cleanup on unmount
- **Storage optimization**: Minimal localStorage usage
- **Popover reuse**: Leverages existing positioning optimizations
- **Reduced motion**: Respects user preferences for animations
