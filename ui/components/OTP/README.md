# OTP (Composer)

A composer for one-time passcodes (OTP). Headless logic + slot-based UI for multi-brand reuse.

## When to use

- Login, 2FA, device verification, high-risk actions
- Any scenario requiring secure code entry with enhanced UX

## Key ideas

- **Headless logic** in `useOTP` (paste, focus, validation, completion)
- **Slotting**: replace `OTPField`, `OTPSeparator`, `OTPLabel`, `OTPError` freely
- **Tokenized visuals** for brand theming
- **Cross-platform** accessibility (web, iOS/Android PWAs, desktop)

## Architecture

### Layer: Composer

Orchestrates multiple primitives (inputs), coordinates focus and paste behavior, exposes slots for customization.

### Meta-patterns

- **Headless logic hook**: `useOTP` contains all state management
- **Context provider**: `OTPProvider` orchestrates and provides context
- **Slotting & substitution**: All visual components are replaceable slots

## API

### OTPProvider Props

```typescript
interface OTPProviderProps {
  /** Number of OTP digits (3–12 typical). Default: 6 */
  length?: number;
  /** Numeric-only, alphanumeric, or custom regex guard. Default: "numeric" */
  mode?: 'numeric' | 'alphanumeric' | RegExp;
  /** Autofill hints for platforms that support it. Default: 'one-time-code' */
  autocomplete?: string;
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
}
```

### Slot Components

- **`OTPInput`**: Group wrapper with `role="group"` semantics
- **`OTPField`**: Individual input field (pure primitive, replaceable)
- **`OTPLabel`**: Label component for accessibility
- **`OTPError`**: Error announcement with `role="alert"`
- **`OTPSeparator`**: Visual separator between fields

## Usage Examples

### Basic Usage

```tsx
import {
  OTPProvider,
  OTPInput,
  OTPField,
  OTPLabel,
  OTPError,
} from '@/ui/components/OTP';

export function BasicOTP() {
  return (
    <OTPProvider
      length={6}
      mode="numeric"
      onComplete={(code) => console.log('OTP:', code)}
    >
      <OTPLabel>Enter the 6-digit code</OTPLabel>
      <OTPInput>
        {Array.from({ length: 6 }).map((_, i) => (
          <OTPField key={i} index={i} />
        ))}
      </OTPInput>
      <OTPError id="otp-error">
        {/* Show error text when server rejects */}
      </OTPError>
    </OTPProvider>
  );
}
```

### With Custom Separators

```tsx
<OTPProvider length={6} mode="numeric">
  <OTPLabel>Enter verification code</OTPLabel>
  <OTPInput>
    <OTPField index={0} />
    <OTPField index={1} />
    <OTPField index={2} />
    <OTPSeparator>-</OTPSeparator>
    <OTPField index={3} />
    <OTPField index={4} />
    <OTPField index={5} />
  </OTPInput>
</OTPProvider>
```

### Controlled Mode

```tsx
function ControlledOTP() {
  const [code, setCode] = useState('');

  return (
    <OTPProvider
      length={4}
      mode="alphanumeric"
      value={code}
      onChange={setCode}
      onComplete={(code) => submitCode(code)}
    >
      <OTPLabel>Enter alphanumeric code</OTPLabel>
      <OTPInput>
        {Array.from({ length: 4 }).map((_, i) => (
          <OTPField key={i} index={i} />
        ))}
      </OTPInput>
    </OTPProvider>
  );
}
```

### With Masking

```tsx
<OTPProvider
  length={6}
  mode="numeric"
  mask={true}
  onComplete={handleSecureCode}
>
  <OTPLabel>Enter secure PIN</OTPLabel>
  <OTPInput>
    {Array.from({ length: 6 }).map((_, i) => (
      <OTPField key={i} index={i} />
    ))}
  </OTPInput>
</OTPProvider>
```

### Custom Validation (Hex Only)

```tsx
<OTPProvider
  length={8}
  mode={/^[A-F0-9]$/i}
  inputMode="text"
  onComplete={handleHexCode}
>
  <OTPLabel>Enter hex code</OTPLabel>
  <OTPInput>
    {Array.from({ length: 8 }).map((_, i) => (
      <OTPField key={i} index={i} />
    ))}
  </OTPInput>
</OTPProvider>
```

## Accessibility

### Cross-platform Support

- **Group semantics**: wrap fields in a `role="group"` container
- **Label association**: via visible `<label>` or `aria-labelledby`
- **Error announcements**: point errors via `aria-describedby` on the group
- **Autocomplete & inputmode**: `autocomplete="one-time-code"` and `inputMode="numeric"` (or `tel`) improve mobile keyboards and iOS OTP auto-fill

### Keyboard Navigation

- **Paste behavior**: handle multi-char paste into any field and distribute across slots
- **Backspace**: if a slot is empty, backspace moves focus to previous slot; if filled, it clears the current slot first
- **Arrow keys**: `ArrowLeft`/`ArrowRight` navigate between fields
- **Screen readers**: each field has an `aria-label` like "Digit 1"

### Error Handling

- **Role alert**: errors announced via `role="alert"` region
- **Validation**: real-time character validation based on mode
- **Visual feedback**: invalid states reflected in styling

### Reduced Motion

- **Deterministic focus**: only shift focus on valid entry
- **No aggressive jumps**: provide predictable arrow key navigation
- **Respect preferences**: honor `prefers-reduced-motion`

## Behavior Details

### Input Validation

- **Numeric mode**: accepts only digits 0-9
- **Alphanumeric mode**: accepts letters and numbers
- **Custom regex**: provide your own validation pattern
- **Character extraction**: automatically extracts last character from multi-char input

### Focus Management

- **Auto-advance**: focus moves to next field on valid input
- **Backspace logic**:
  - Empty field: move to previous field
  - Filled field: clear current field
- **Completion**: calls `onComplete` when all fields are filled

### Paste Handling

- **Smart distribution**: paste content is distributed across available fields
- **Validation**: invalid characters are filtered during paste
- **Positioning**: paste from any field position
- **Boundary respect**: doesn't exceed available field count

## Customization

### Alternate Skins

Because logic is headless and slots are explicit, any product can:

- Replace `OTPField` with bespoke field (rounded, underlined, glassmorphism)
- Change separators (spaces, dashes, icons)
- Modify length, mask behavior, mode (e.g., alphanumeric for enterprise SSO)

### Token-based Theming

All visual properties are controlled via design tokens:

- Typography, spacing, radius, color live in `OTP.tokens.json`
- Multi-brand theming is automatic
- No hardcoded values in components

## Files Structure

```
OTP/
├── index.tsx                    # Exports
├── OTP.tsx                      # Main wrapper (legacy)
├── OTPProvider.tsx              # Context + orchestration
├── useOTP.ts                    # Headless logic
├── slots/
│   ├── OTPInput.tsx            # Group wrapper
│   ├── OTPField.tsx            # Input primitive
│   ├── OTPLabel.tsx            # Label slot
│   ├── OTPError.tsx            # Error slot
│   └── OTPSeparator.tsx        # Separator slot
├── OTP.module.scss             # Styles
├── OTP.tokens.json             # Design tokens
├── OTP.tokens.generated.scss   # Generated token CSS
└── README.md                   # This file
```

## Why This Travels Well

- **Composer, not configuration**: orchestration is in `useOTP` and context. Props stay minimal; variation emerges through slots + tokens
- **Headless by default**: products can reskin without re-implementing focus choreography, validation, or paste logic
- **Tokenized**: typography, spacing, radius, color live in tokens, so multi-brand theming is automatic
- **Clear boundaries**: OTP remains a system composer; checkout/login flows live as assemblies within app code and import OTP as a dependency

## Testing

Comprehensive test coverage includes:

- Unit tests for `useOTP` hook logic
- Integration tests for paste behavior
- Accessibility tests with screen readers
- Cross-platform input mode tests
- Keyboard navigation scenarios
- Focus management edge cases

Run tests with:

```bash
npm test -- OTP
```
