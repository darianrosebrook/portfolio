Great target. A One-Time Passcode (OTP) input is an excellent composer-level example: it orchestrates multiple primitives (inputs), coordinates focus and paste behavior, exposes slots for customization, and carries non-trivial accessibility requirements across platforms (web, iOS/Android PWAs, desktop).

Below is a drop-in, framework-agnostic blueprint implemented in React/TypeScript that follows the agents.md rules:
• Layer: Composer
• Meta-patterns: headless logic hook, context provider, slotting & substitution
• Docs: props contract, a11y notes, token usage
• Structure: ready to colocate in /ui/components/OTPInput

⸻

OTPInput (Composer)

Folder

OTPInput/
├── index.tsx
├── OTPInput.tsx # visual scaffolding (slots)
├── OTPProvider.tsx # context + orchestration
├── useOtp.ts # headless logic (state, focus, paste)
├── OTPField.tsx # default field primitive (can be swapped)
├── OTPSeparator.tsx # optional slot
├── OTPLabel.tsx # optional slot
├── OTPError.tsx # optional slot
├── OTPInput.module.scss
├── OTPInput.tokens.json
├── OTPInput.tokens.generated.scss
└── README.md

⸻

API (minimal, orchestration-first)

export interface OTPInputProps {
/** Number of OTP digits (3–12 typical). Default: 6 \*/
length?: number;
/** Numeric-only, alphanumeric, or custom regex guard. Default: "numeric" _/
mode?: 'numeric' | 'alphanumeric' | RegExp;
/\*\* Autofill hints for platforms that support it. Default: 'one-time-code' _/
autocomplete?: 'one-time-code' | 'otp' | string;
/** Controlled value as a string of length N (optional) \*/
value?: string;
/** Uncontrolled default value (optional) _/
defaultValue?: string;
/\*\* Called when all N slots are filled with valid characters _/
onComplete?(code: string): void;
/** Called on any change (partial codes included) \*/
onChange?(code: string): void;
/** Disabled / readOnly semantics _/
disabled?: boolean;
readOnly?: boolean;
/\*\* Ids for a11y grouping & descriptions (label, error, help) _/
id?: string;
'aria-describedby'?: string;
/** Optional mask (e.g., show • instead of digits) \*/
mask?: boolean;
/** Optional separator render strategy ('space' by default) _/
separator?: 'none' | 'space' | 'dash' | React.ReactNode;
/\*\* Inputmode hint to virtual keyboards; defaults inferred from mode _/
inputMode?: React.InputHTMLAttributes<HTMLInputElement>['inputMode'];
}

⸻

Headless logic

useOtp.ts (core behaviors: input, paste, focus choreography, backspace semantics)

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type Guard = 'numeric' | 'alphanumeric' | RegExp;

const guardChar = (ch: string, mode: Guard) => {
if (mode === 'numeric') return /^[0-9]$/.test(ch);
  if (mode === 'alphanumeric') return /^[a-zA-Z0-9]$/.test(ch);
return (mode as RegExp).test(ch);
};

export interface UseOtpOptions {
length: number;
mode: Guard;
value?: string;
defaultValue?: string;
disabled?: boolean;
readOnly?: boolean;
onChange?(code: string): void;
onComplete?(code: string): void;
}

export function useOtp(opts: UseOtpOptions) {
const { length, mode, value, defaultValue, disabled, readOnly, onChange, onComplete } = opts;

const isControlled = typeof value === 'string';
const [internal, setInternal] = useState<string[]>(
() => (defaultValue ? defaultValue.slice(0, length).split('') : Array.from({ length }, () => ''))
);

const refs = useRef<HTMLInputElement[]>([]);

const code = (isControlled ? value! : internal.join('')).padEnd(length, '').slice(0, length);
const chars = code.split('');

const setChar = useCallback(
(index: number, ch: string) => {
if (disabled || readOnly) return;
if (!guardChar(ch, mode)) return;

      const next = chars.slice();
      next[index] = ch;

      const joined = next.join('');
      if (!isControlled) setInternal(next);
      onChange?.(joined);

      // Advance focus
      if (index < length - 1) refs.current[index + 1]?.focus();
      else onComplete?.(joined);
    },
    [chars, disabled, readOnly, isControlled, length, mode, onChange, onComplete]

);

const clearChar = useCallback(
(index: number) => {
if (disabled || readOnly) return;
const next = chars.slice();
next[index] = '';
const joined = next.join('');
if (!isControlled) setInternal(next);
onChange?.(joined);
},
[chars, disabled, readOnly, isControlled, onChange]
);

const handlePaste = useCallback(
(index: number, text: string) => {
if (disabled || readOnly) return;
const clean = Array.from(text).filter(ch => guardChar(ch, mode)).slice(0, length - index);
if (clean.length === 0) return;

      const next = chars.slice();
      for (let i = 0; i < clean.length; i++) next[index + i] = clean[i];

      const joined = next.join('');
      if (!isControlled) setInternal(next);
      onChange?.(joined);

      // focus terminal cell or call onComplete
      const last = Math.min(index + clean.length - 1, length - 1);
      if (next.every(Boolean)) onComplete?.(joined);
      refs.current[last]?.focus();
    },
    [chars, disabled, readOnly, isControlled, length, mode, onChange, onComplete]

);

const register = useCallback((el: HTMLInputElement | null, i: number) => {
if (el) refs.current[i] = el;
}, []);

const api = useMemo(
() => ({
length,
chars,
disabled: !!disabled,
readOnly: !!readOnly,
register,
setChar,
clearChar,
handlePaste,
focus(i: number) {
refs.current[i]?.focus();
},
}),
[length, chars, disabled, readOnly, register, setChar, clearChar, handlePaste]
);

return api;
}

⸻

Context & Provider

OTPProvider.tsx

import React, { createContext, useContext } from 'react';
import { useOtp, UseOtpOptions } from './useOtp';

interface Ctx extends ReturnType<typeof useOtp> {
id?: string;
describedBy?: string;
autocomplete?: string;
inputMode?: React.InputHTMLAttributes<HTMLInputElement>['inputMode'];
mask?: boolean;
separator?: 'none' | 'space' | 'dash' | React.ReactNode;
}

const OtpCtx = createContext<Ctx | null>(null);
export const useOtpCtx = () => {
const ctx = useContext(OtpCtx);
if (!ctx) throw new Error('OTP components must be used within <OTPProvider>');
return ctx;
};

export interface OTPProviderProps extends UseOtpOptions {
children: React.ReactNode;
id?: string;
'aria-describedby'?: string;
autocomplete?: string;
inputMode?: React.InputHTMLAttributes<HTMLInputElement>['inputMode'];
mask?: boolean;
separator?: 'none' | 'space' | 'dash' | React.ReactNode;
}

export function OTPProvider(props: OTPProviderProps) {
const {
children,
id,
autocomplete = 'one-time-code',
inputMode,
mask = false,
separator = 'space',
'aria-describedby': describedBy,
...opts
} = props;

const api = useOtp(opts);

return (
<OtpCtx.Provider
value={{
        ...api,
        id,
        describedBy,
        autocomplete,
        inputMode,
        mask,
        separator,
      }} >
{children}
</OtpCtx.Provider>
);
}

⸻

Visual scaffolding & slots

OTPInput.tsx (group wrapper)

import React from 'react';
import { useOtpCtx } from './OTPProvider';
import styles from './OTPInput.module.scss';

export function OTPInput(props: { children: React.ReactNode; className?: string }) {
const { id, describedBy, length, disabled, readOnly } = useOtpCtx();
return (

<div
role="group"
className={[styles.root, props.className].filter(Boolean).join(' ')}
aria-disabled={disabled || undefined}
aria-readonly={readOnly || undefined}
aria-describedby={describedBy}
id={id}
data-length={length} >
{props.children}
</div>
);
}

OTPField.tsx (default field primitive; can be replaced by consumers)

import React, { useCallback } from 'react';
import { useOtpCtx } from './OTPProvider';
import styles from './OTPInput.module.scss';

export interface OTPFieldProps {
index: number;
className?: string;
'aria-label'?: string;
}

export function OTPField({ index, className, ...aria }: OTPFieldProps) {
const { chars, register, setChar, clearChar, handlePaste, disabled, readOnly, autocomplete, inputMode, mask } =
useOtpCtx();

const onKeyDown = useCallback(
(e: React.KeyboardEvent<HTMLInputElement>) => {
const key = e.key;
if (key === 'Backspace') {
if (!chars[index]) {
// move backward if empty
if (index > 0) (e.currentTarget.form?.elements[index - 1] as HTMLElement | undefined)?.focus();
} else {
clearChar(index);
}
e.preventDefault();
}
if (key === 'ArrowLeft' && index > 0) {
(e.currentTarget.form?.elements[index - 1] as HTMLElement | undefined)?.focus();
e.preventDefault();
}
if (key === 'ArrowRight' && index < chars.length - 1) {
(e.currentTarget.form?.elements[index + 1] as HTMLElement | undefined)?.focus();
e.preventDefault();
}
},
[chars, index, clearChar]
);

const onChange = useCallback(
(e: React.ChangeEvent<HTMLInputElement>) => {
const v = e.target.value;
if (!v) return;
const ch = v.slice(-1); // keep last typed char
setChar(index, ch);
},
[index, setChar]
);

const onPaste = useCallback(
(e: React.ClipboardEvent<HTMLInputElement>) => {
const text = e.clipboardData.getData('text');
if (text) {
e.preventDefault();
handlePaste(index, text);
}
},
[handlePaste, index]
);

return (
<input
ref={el => register(el, index)}
className={[styles.field, className].filter(Boolean).join(' ')}
value={mask && chars[index] ? '•' : chars[index] || ''}
inputMode={inputMode}
autoComplete={autocomplete}
pattern={undefined} // platform heuristics suffice; validation lives in hook
maxLength={1}
onKeyDown={onKeyDown}
onChange={onChange}
onPaste={onPaste}
disabled={disabled}
readOnly={readOnly}
aria-label={aria['aria-label'] ?? `Digit ${index + 1}`}
aria-invalid={undefined}
/>
);
}

OTPSeparator.tsx (optional)

import React from 'react';
export function OTPSeparator({ children = ' ', className }: { children?: React.ReactNode; className?: string }) {
return <span className={className}>{children}</span>;
}

Label & Error slots

// OTPLabel.tsx
import React from 'react';
export function OTPLabel({ htmlFor, children, className }: { htmlFor?: string; children: React.ReactNode; className?: string }) {
return (
<label htmlFor={htmlFor} className={className}>
{children}
</label>
);
}

// OTPError.tsx
import React from 'react';
export function OTPError({ id, children, className }: { id?: string; children?: React.ReactNode; className?: string }) {
if (!children) return null;
return (

<div role="alert" id={id} className={className}>
{children}
</div>
);
}

⸻

Exports

index.tsx

export { OTPProvider } from './OTPProvider';
export { OTPInput } from './OTPInput';
export { OTPField } from './OTPField';
export { OTPSeparator } from './OTPSeparator';
export { OTPLabel } from './OTPLabel';
export { OTPError } from './OTPError';
export type { OTPInputProps } from './types'; // optional if you extract

⸻

Styles & Tokens

OTPInput.tokens.json

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

OTPInput.module.scss (example usage of generated tokens)

@import './OTPInput.tokens.generated.scss';

.root {
display: inline-flex;
align-items: center;
gap: var(--otp-field-gap);
}

.field {
min-width: var(--otp-field-minWidth);
height: var(--otp-field-height);
text-align: center;
font-size: var(--otp-field-fontSize);
font-weight: var(--otp-field-fontWeight);
border-radius: var(--otp-field-radius);
color: var(--otp-color-text);
background: var(--otp-color-bg);
border: 1px solid var(--otp-color-border);
outline: none;
}

.field:focus-visible {
border-color: var(--otp-color-focus);
box-shadow: 0 0 0 3px color-mix(in oklab, var(--otp-color-focus) 30%, transparent);
}

⸻

Usage (headless slots + default visuals)

import {
OTPProvider,
OTPInput,
OTPField,
OTPSeparator,
OTPLabel,
OTPError,
} from '@/ui/components/OTPInput';

export function CheckoutOtpExample() {
return (

<form
onSubmit={e => {
e.preventDefault();
// read code from controlled state if needed
}} >
<OTPProvider length={6} mode="numeric" onComplete={(code) => console.log('OTP:', code)}>
<OTPLabel>Enter the 6-digit code</OTPLabel>
<OTPInput>
<OTPField index={0} />
<OTPField index={1} />
<OTPField index={2} />
<OTPSeparator>-</OTPSeparator>
<OTPField index={3} />
<OTPField index={4} />
<OTPField index={5} />
</OTPInput>
<OTPError id="otp-error">{/_ show error text when server rejects _/}</OTPError>
</OTPProvider>
<button type="submit">Verify</button>
</form>
);
}

Alternate skins (brand/product reuse)

Because logic is headless and slots are explicit, any product can:
• Replace OTPField with a bespoke field (rounded, underlined, glassmorphism)
• Change separators (spaces, dashes, icons)
• Change length, mask behavior, mode (e.g., alphanumeric for enterprise SSO)

⸻

Accessibility Notes (cross-platform)
• Group semantics: wrap fields in a role="group" container; associate label via visible <label> or aria-labelledby and point errors via aria-describedby on the group.
• Autocomplete & inputmode: autocomplete="one-time-code" and inputMode="numeric" (or tel) improve mobile keyboards and iOS OTP auto-fill.
• Paste behavior: handle multi-char paste into any field and distribute across slots; do not block pasting.
• Backspace: if a slot is empty, backspace should move focus to the previous slot; if filled, it should clear the current slot first.
• Screen readers: each field has an aria-label like “Digit 1”; announce errors via role="alert" region.
• Masking: if masking, keep the underlying value accessible (no extra secrecy needed for short-lived OTPs; masking is aesthetic/observational).
• Reduced motion: avoid aggressive autofocus jumps; only shift focus on valid entry and provide deterministic arrow key navigation.

⸻

Why this travels well across products
• Composer, not configuration dump: orchestration is in useOtp and the context. Props stay minimal; variation emerges through slots + tokens.
• Headless by default: products can reskin without re-implementing focus choreography, validation, or paste logic.
• Tokenized: typography, spacing, radius, color live in tokens, so multi-brand theming is automatic.
• Boundaries: OTP remains a system composer; checkout/login flows live as assemblies within app code and import OTP as a dependency.

⸻

Quick Verification (for your validator)
• Folder contains OTPProvider.tsx and useOtp.ts (composer invariant)
• index.tsx exports OTPProvider, OTPInput, and slot components
• README.md includes usage, props, a11y notes
• SCSS uses generated token variables, no hardcoded colors
• No prop explosion: primary variations via length, mode, mask, separator

⸻

README.md (starter)

# OTPInput

A composer for one-time passcodes (OTP). Headless logic + slot-based UI for multi-brand reuse.

## When to use

- Login, 2FA, device verification, high-risk actions.

## Key ideas

- Headless logic in `useOtp` (paste, focus, validation, completion).
- Slotting: replace `OTPField`, `OTPSeparator`, `OTPLabel`, `OTPError` freely.
- Tokenized visuals for brand theming.

## Props

See `OTPInputProps` in source. Minimal surface: `length`, `mode`, `onComplete`, `onChange`, a11y ids, `mask`, `separator`.

## Accessibility

- Grouped with `role="group"`, labeled and described.
- `autocomplete="one-time-code"`, `inputMode` hints for keyboards.
- Backspace & arrow navigation semantics included.
- Paste distribution supported.

## Examples

```tsx
<OTPProvider length={6} mode="numeric" onComplete={(c)=>...}>
  <OTPLabel>Enter the 6-digit code</OTPLabel>
  <OTPInput>
    {Array.from({length:6}).map((_,i)=><OTPField key={i} index={i}/>)}
  </OTPInput>
</OTPProvider>

---

```
