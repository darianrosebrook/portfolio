# Field (Composer)

Headless field orchestration for labels, help text, errors, and validation across form controls. Implements a single source of truth for ids, associations, and status. Visuals are token-driven.

## Usage

```tsx
import { FieldProvider, Field } from '@/ui/components/Field';
import { TextInputAdapter } from '@/ui/components/Field/TextInputAdapter';

<FieldProvider name="email" label="Email" required>
  <Field>
    <TextInputAdapter placeholder="you@example.com" />
  </Field>
</FieldProvider>;
```

## API

- FieldProvider props: `name`, `id?`, `required?`, `disabled?`, `readOnly?`, `defaultValue?`, `value?`, `onChange?(value)`, `validate?(value, ctx)`, `label?`, `helpText?`.
- Status: `idle | validating | valid | invalid`.
- Slots: `<Label/>`, `<HelpText/>`, `<ErrorText/>` included by default via `Field`.
- Helpers: `useField()`, `useFieldControl()`.

## Adapters

- `TextInputAdapter`, `TextareaAdapter`, `SelectAdapter`, `CheckboxAdapter`, `SwitchAdapter`, `RadioGroupAdapter`.

## A11y

- Single label per field: `label[for=inputId]`.
- `aria-describedby` concatenates help + error ids; `aria-errormessage` only when errors.
- Errors are announced via a single `role="alert"` region.
- Validating indicator uses `Spinner` and avoids duplicate announcements.

## Theming

- `Field.tokens.json` → `Field.tokens.generated.scss` → `Field.module.scss`.
- No hardcoded colors; respects prefers-contrast.

## Examples

- Async validate with inline spinner:

```tsx
<FieldProvider
  name="username"
  label="Username"
  validate={async (v) =>
    !v ? 'Required' : v === 'taken' ? 'Unavailable' : null
  }
>
  <Field>
    <TextInputAdapter />
  </Field>
</FieldProvider>
```
