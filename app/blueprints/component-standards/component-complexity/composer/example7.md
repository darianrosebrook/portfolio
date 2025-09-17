Great brief. Forms are where “component layers” really earn their keep: labels, inputs, and messages must compose in a way that (1) centralizes association and validation state, (2) avoids duplicating label/error logic per control, and (3) scales to many control types (text, select, checkbox, radios, date, custom widgets).

Below is a framework-agnostic pattern implemented in React/TS that treats each form field as a composer with headless logic and composable slots. It gives you a single Label, HelpText, and ErrorText that work with any control (text, select, checkbox…) by binding through a field context and a small useFieldControl() helper. It follows the agents.md rules: headless hooks, context orchestration, slotting, tokenized visuals, and strict a11y invariants.

⸻

Field (Composer) — shared label/validation across inputs

Folder

Field/
├── index.tsx
├── Field.tsx # group wrapper and slot composition
├── FieldProvider.tsx # context + orchestration
├── useField.ts # headless logic (state, ids, associations)
├── Label.tsx # reusable label across all controls
├── HelpText.tsx # optional description
├── ErrorText.tsx # error live-region
├── useFieldControl.ts # helper for any control to bind correctly
├── Field.tokens.json
├── Field.tokens.generated.scss
├── Field.module.scss
└── README.md

Layer: Composer (elevates state and associations).
Meta-patterns: headless logic, context provider, slotting & substitution.
Works for primitives (text input, checkbox) without redefining label or error per type.

⸻

Core design
• One place computes and owns:
• Stable IDs (inputId, labelId, helpId, errorId),
• a11y associations (htmlFor, aria-describedby, aria-errormessage),
• validation state (required, touched, dirty, errors, status),
• message visibility and live-region rules.
• Controls bind via useFieldControl():
• Returns the exact props an <input>, <select>, <textarea>, custom widget, or checkbox needs to attach to the current field.
• Slots (<Label/>, <HelpText/>, <ErrorText/>, and <Field.Control> region) are reusable across all controls, ensuring consistent a11y without per-control reinvention.

⸻

Types

// types.ts
export type FieldStatus = 'idle' | 'validating' | 'valid' | 'invalid';

export interface FieldProps {
/** Field name for forms and analytics \*/
name: string;
/** Optional explicit id for the control; auto-generated if omitted _/
id?: string;
/\*\* Required semantics + indicator policy _/
required?: boolean;
/** Disable user interaction \*/
disabled?: boolean;
/** Read-only semantics _/
readOnly?: boolean;
/\*\* Initial value for uncontrolled _/
defaultValue?: any;
/** Controlled value \*/
value?: any;
/** Change handler for controlled _/
onChange?(value: any): void;
/\*\* Validate on change/blur/submit; return string | string[] | null _/
validate?(
value: any,
context: { name: string; touched: boolean; dirty: boolean }
): string | string[] | null | Promise<string | string[] | null>;
/** Optional label text for default Label slot; you can also pass custom <Label/> \*/
label?: React.ReactNode;
/** Optional help text for default HelpText slot \*/
helpText?: React.ReactNode;
}

⸻

Headless orchestration

useField.ts

import { useCallback, useId, useMemo, useRef, useState } from 'react';
import type { FieldStatus, FieldProps } from './types';

export function useField(props: FieldProps) {
const {
name, id: providedId, required = false, disabled, readOnly,
defaultValue, value, onChange, validate, label, helpText
} = props;

const reactId = useId(); // stable per mount
const inputId = providedId ?? `fld-${name}-${reactId}`;
const labelId = `lbl-${name}-${reactId}`;
const helpId = `hlp-${name}-${reactId}`;
const errId = `err-${name}-${reactId}`;

const isControlled = typeof value !== 'undefined';
const [internal, setInternal] = useState<any>(defaultValue ?? '');
const current = isControlled ? value : internal;

const [touched, setTouched] = useState(false);
const [dirty, setDirty] = useState(false);
const [status, setStatus] = useState<FieldStatus>('idle');
const [errors, setErrors] = useState<string[]>([]);

const runValidate = useCallback(async (val: any) => {
if (!validate) return setErrors([]), setStatus('idle');
setStatus('validating');
const res = await Promise.resolve(validate(val, { name, touched, dirty }));
const arr = !res ? [] : Array.isArray(res) ? res : [res];
setErrors(arr);
setStatus(arr.length ? 'invalid' : 'valid');
}, [validate, name, touched, dirty]);

const handleChange = useCallback((val: any) => {
if (!isControlled) setInternal(val);
setDirty(true);
onChange?.(val);
// Validate-on-change (configurable; could gate behind a policy)
runValidate(val);
}, [isControlled, onChange, runValidate]);

const handleBlur = useCallback(() => {
if (!touched) setTouched(true);
runValidate(current);
}, [touched, current, runValidate]);

const describedBy = useMemo(() => {
const ids = [];
if (helpText) ids.push(helpId);
if (errors.length) ids.push(errId);
return ids.join(' ') || undefined;
}, [helpText, helpId, errors.length, errId]);

return {
// identity & associations
name, inputId, labelId, helpId, errId, describedBy,
// state
value: current, required, disabled, readOnly, touched, dirty, status, errors,
// handlers
setValue: handleChange, onBlur: handleBlur, setTouched,
// passthrough for default slots to render if provided
label, helpText,
};
}

⸻

Context & provider

FieldProvider.tsx

import React, { createContext, useContext, useMemo } from 'react';
import { useField } from './useField';
import type { FieldProps } from './types';

export type FieldCtx = ReturnType<typeof useField>;
const Ctx = createContext<FieldCtx | null>(null);

export const useFieldCtx = () => {
const ctx = useContext(Ctx);
if (!ctx) throw new Error('Field components must be used within <FieldProvider>');
return ctx;
};

export function FieldProvider({ children, ...props }: React.PropsWithChildren<FieldProps>) {
const api = useField(props);
const value = useMemo(() => api, [api]);
return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

⸻

Slot components (reused across all controls)

Label.tsx

import React from 'react';
import { useFieldCtx } from './FieldProvider';

export function Label({ children }: { children?: React.ReactNode }) {
const f = useFieldCtx();
return (
<label id={f.labelId} htmlFor={f.inputId}>
{children ?? f.label}
{f.required ? <span aria-hidden="true"> \*</span> : null}
</label>
);
}

HelpText.tsx

import React from 'react';
import { useFieldCtx } from './FieldProvider';

export function HelpText({ children }: { children?: React.ReactNode }) {
const f = useFieldCtx();
const content = children ?? f.helpText;
if (!content) return null;
return <div id={f.helpId}>{content}</div>;
}

ErrorText.tsx

import React from 'react';
import { useFieldCtx } from './FieldProvider';

export function ErrorText() {
const f = useFieldCtx();
if (!f.errors.length) return null;
// role="alert" is OK because errors change as a unit; keep messages short
return (

<div id={f.errId} role="alert">
{f.errors.map((e, i) => <div key={i}>{e}</div>)}
</div>
);
}

⸻

Control binding helper

This single helper is what every control calls to get the exact props it should place on its focusable element. It guarantees consistent id, name, aria-\* and validation semantics.

useFieldControl.ts

import { useMemo } from 'react';
import { useFieldCtx } from './FieldProvider';

export function useFieldControl<T extends HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>() {
const f = useFieldCtx();

return useMemo(() => ({
/** Props to spread on the control element \*/
controlProps: {
id: f.inputId,
name: f.name,
'aria-labelledby': f.labelId,
'aria-describedby': f.describedBy,
'aria-errormessage': f.errors.length ? f.errId : undefined,
'aria-invalid': f.errors.length ? true : undefined,
required: f.required || undefined,
disabled: f.disabled || undefined,
readOnly: f.readOnly || undefined,
onBlur: () => f.onBlur(),
// value/onChange left to control adapters (text vs checkbox)
} as React.ComponentPropsWithoutRef<any>,
/** Field state for adapters \*/
field: f
}), [f]);
}

⸻

Default visual scaffold (optional)

You may provide a reference layout that teams can reuse or replace. This layer is styling only; logic stays in the hook/provider.

Field.tsx

import React from 'react';
import { Label } from './Label';
import { HelpText } from './HelpText';
import { ErrorText } from './ErrorText';
import { useFieldCtx } from './FieldProvider';
import styles from './Field.module.scss';

export function Field({ children, className }: { children: React.ReactNode; className?: string }) {
const f = useFieldCtx();
const cls = [styles.root, f.status === 'invalid' && styles.invalid, className].filter(Boolean).join(' ');
return (

<div className={cls} role="group" aria-labelledby={f.labelId} data-status={f.status}>
<div className={styles.header}><Label /></div>
<div className={styles.control}>{children}</div>
<div className={styles.meta}>
<ErrorText />
<HelpText />
</div>
</div>
);
}

⸻

Example controls (adapters) using useFieldControl

Text input

import React from 'react';
import { useFieldControl } from './useFieldControl';

export function TextControl(props: { type?: string; placeholder?: string; className?: string }) {
const { controlProps, field } = useFieldControl<HTMLInputElement>();
const type = props.type ?? 'text';
return (
<input
{...controlProps}
className={props.className}
type={type}
value={field.value ?? ''}
onChange={(e) => field.setValue(e.currentTarget.value)}
placeholder={props.placeholder}
/>
);
}

Select

export function SelectControl(
props: { children: React.ReactNode; className?: string }
) {
const { controlProps, field } = useFieldControl<HTMLSelectElement>();
return (
<select
{...controlProps}
className={props.className}
value={field.value ?? ''}
onChange={(e) => field.setValue(e.currentTarget.value)} >
{props.children}
</select>
);
}

Checkbox

Checkboxes are boolean; value handling and labeling differ. The same Label is used; users click the label to toggle the checkbox via htmlFor.

export function CheckboxControl(props: { className?: string }) {
const { controlProps, field } = useFieldControl<HTMLInputElement>();
return (
<input
{...controlProps}
className={props.className}
type="checkbox"
checked={!!field.value}
onChange={(e) => field.setValue(e.currentTarget.checked)}
/>
);
}

⸻

Putting it together

Text field with validation

import { FieldProvider } from './FieldProvider';
import { Field } from './Field';
import { TextControl } from './TextControl';

export function EmailField() {
return (
<FieldProvider
name="email"
required
label="Email address"
helpText="We’ll never share your email."
validate={(v) => {
if (!v) return 'Email is required';
return /\S+@\S+\.\S+/.test(v) ? null : 'Enter a valid email';
}} >
<Field>
<TextControl placeholder="you@example.com" />
</Field>
</FieldProvider>
);
}

Select field

export function CountryField() {
return (
<FieldProvider
name="country"
label="Country"
defaultValue=""
validate={(v) => (!v ? 'Please choose a country' : null)} >
<Field>
<SelectControl>

<option value="" disabled>Choose…</option>
<option>United States</option>
<option>Canada</option>
<option>Mexico</option>
</SelectControl>
</Field>
</FieldProvider>
);
}

Checkbox field

export function TOSField() {
return (
<FieldProvider
name="tos"
label="I agree to the Terms"
validate={(v) => (v ? null : 'You must accept the terms')} >
<Field>
<CheckboxControl />
</Field>
</FieldProvider>
);
}

⸻

Styles & tokens (excerpt)

/_ Field.module.scss _/
@import './Field.tokens.generated.scss';

.root { display: grid; gap: var(--field-gap-y); }
.header { font-size: var(--field-label-fontSize); color: var(--field-label-color); }
.control :is(input, select, textarea) {
border: 1px solid var(--field-border);
border-radius: var(--field-radius);
padding: var(--field-pad-y) var(--field-pad-x);
background: var(--field-bg);
color: var(--field-fg);
outline: none;
}
.control :is(input, select, textarea):focus-visible {
border-color: var(--field-focus-border);
box-shadow: 0 0 0 3px color-mix(in oklab, var(--field-focus-border) 30%, transparent);
}
[data-status='invalid'] .control :is(input, select, textarea) {
border-color: var(--field-invalid-border);
}
.meta { display: grid; gap: var(--field-gap-meta); }
.meta [role='alert'] { color: var(--field-invalid-text); }

// Field.tokens.json
{
"component": {
"field": {
"gap": { "y": "{space.150}", "meta": "{space.100}" },
"label": { "fontSize": "{font.size.200}", "color": "{color.foreground.muted}" },
"radius": "{radius.md}",
"pad": { "x": "{space.200}", "y": "{space.150}" },
"color": {
"bg": "{color.background.surface}",
"fg": "{color.foreground.default}",
"border": "{color.border.subtle}",
"focus-border": "{color.border.focus}",
"invalid-border": "{color.border.danger}",
"invalid-text": "{color.text.danger}"
}
}
}
}

⸻

A11y & UX invariants (guardrails) 1. Exactly one label per field
• Label uses htmlFor=inputId. Do not create labels per control type.
• For grouped controls (radios/checkbox group), this same pattern scales by rendering multiple focusables under one field with one label; each control still uses the same aria-describedby and aria-errormessage. 2. Associations are centralized
• aria-describedby concatenates helpId and errId (in that order).
• aria-errormessage is set only when errors exist.
• aria-invalid is only present when invalid. 3. Validation lifecycle
• status transitions: idle → validating → valid|invalid.
• On first blur, touched=true; we run validation. On change, we set dirty=true and optionally validate (policy-controlled). 4. Live region hygiene
• ErrorText uses role="alert" and only mounts when errors exist. Keep messages concise; avoid stacking duplicate alerts. 5. Required vs. asterisk
• required drives semantics; the \* is purely visual (aria-hidden). Do not infer required from label text alone. 6. Checkbox vs text semantics
• Same Label, different control adapter. For checkboxes/radios, the label is still clickable via htmlFor, and the error/help semantics remain identical. 7. Theming & density
• No hardcoded colors; all visuals read from Field tokens. Density and radii are tokens (brand/system-wide parity). 8. Composability
• Teams can replace TextControl with a masked input, date picker, or custom widget by using useFieldControl() to inherit the associations and validation state.

⸻

Variants beyond basics (extensible without new APIs)
• Inline field (label to the left): provide an alternate Field skin that reorders slots via CSS grid areas; logic stays the same.
• Compact density: create a density token set for padding/line-height; no code changes.
• Async validation: the validate function already accepts async; status='validating' can drive a mini spinner inside the control.

⸻

Why this fits your system lens
• Composer, not a prop dump: labels/help/error/ids are orchestrated once and reused across controls.
• Control adapters are thin: each control implements only value semantics; all associations and validation are injected.
• Headless by default: you can skin Field or swap in different controls without breaking invariants.
• Portable across frameworks: the pattern (ids + associations + slots) is not React-specific; the same orchestration applies to iOS/Android or web component wrappers.

If you want next, I can add:
• A RadioGroupControl and CheckboxGroupControl that demonstrate the same field composer handling multi-focusable groups (single label + per-option labeling),
• A minimal FormProvider that aggregates submission, visited/dirty maps, and server-side error hydration while preserving the same per-field API,
• A validator test matrix (Playwright/Cypress) that asserts ID/association correctness, live-region announcements, and required semantics across all controls.
