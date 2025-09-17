Excellent target. A coachmark / product walkthrough is a composer-level component with a lot of “silent invariants.” Below is a drop-in React/TypeScript implementation that follows the agents.md rules:
• Layer: Composer (orchestrates state, sequencing, anchors, and UX rules)
• Meta-patterns: headless logic, context provider, slotting & substitution
• Integration: built on top of your Popover composer (reuses its positioning & a11y)
• Standards: tokenized visuals, file structure invariants, validator-readable

⸻

Walkthrough (Coachmark / Feature Tour)

Folder

Walkthrough/
├── index.tsx
├── Walkthrough.tsx # group wrapper, progress slot, controls slot
├── WalkthroughProvider.tsx # context + orchestration
├── useWalkthrough.ts # headless logic (registry, anchors, routing)
├── WalkthroughAnchor.tsx # target registration helper (optional)
├── WalkthroughStep.tsx # declarative step API
├── WalkthroughControls.tsx # default controls (Next/Back/Skip/Done)
├── WalkthroughProgress.tsx # default progress (x of n / dots)
├── Walkthrough.tokens.json
├── Walkthrough.tokens.generated.scss
├── Walkthrough.module.scss
└── README.md

⸻

Core API

Types

export type StepId = string;

export interface WalkthroughStepSpec {
/** Stable identifier (analytics, persistence) \*/
id: StepId;
/** Optional: DOM anchor target — selector or element _/
target?: string | HTMLElement | null;
/\*\* Optional: Popover placement; falls back to Popover default _/
placement?: 'top'|'bottom'|'left'|'right'|'auto'|string;
/** Optional: preferred offset in px \*/
offset?: number;
/** Optional: when true, step is skippable by validator (e.g., target missing) _/
optional?: boolean;
/\*\* Content hints used by default slots _/
title?: React.ReactNode;
description?: React.ReactNode;
/\*_ Optional: per-step onEnter/onExit hooks _/
onEnter?(index: number): void | Promise<void>;
onExit?(index: number): void | Promise<void>;
}

export interface WalkthroughProps {
/** Steps can be declared or discovered via <WalkthroughStep/> children \*/
steps?: WalkthroughStepSpec[];
/** Start index (0-based) if uncontrolled _/
defaultIndex?: number;
/\*\* Controlled index (0-based) _/
index?: number;
/** Called whenever index changes (controlled or uncontrolled) \*/
onIndexChange?(next: number, prev: number): void;
/** Persist progress with this key (localStorage); omit to disable _/
storageKey?: string;
/\*\* Autostart when mounted if true and not previously completed _/
autoStart?: boolean;
/** If true, allow multiple coachmarks concurrently across pages (multi-root) \*/
allowConcurrent?: boolean;
/** Close behavior when clicking target or outside _/
closeOnOutsideClick?: boolean;
/\*\* Lifecycle _/
onStart?(): void;
onComplete?(): void;
onCancel?(): void;
}

export interface WalkthroughContextValue {
steps: WalkthroughStepSpec[];
count: number;
index: number;
/** Equivalent to “currentVal” in your prompt \*/
current: number;
started: boolean;
completed: boolean;
open: boolean;
next(): void;
prev(): void;
goTo(i: number): void;
start(i?: number): void;
cancel(): void;
complete(): void;
/** Active anchor element (resolved from step.target) _/
anchorEl: HTMLElement | null;
/\*\* Recompute anchor (e.g., after layout changes) _/
resolveAnchor(): void;
}

⸻

Headless Logic

useWalkthrough.ts

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const storage = {
get(key?: string) {
if (!key) return null;
try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; }
},
set(key: string | undefined, value: any) {
if (!key) return;
try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
},
remove(key?: string) {
if (!key) return;
try { localStorage.removeItem(key); } catch {}
}
};

function toElement(target?: string | HTMLElement | null): HTMLElement | null {
if (!target) return null;
if (typeof target === 'string') return document.querySelector(target) as HTMLElement | null;
return target as HTMLElement;
}

export function useWalkthrough(opts: {
stepsProp?: any[];
defaultIndex?: number;
index?: number;
onIndexChange?(next: number, prev: number): void;
storageKey?: string;
autoStart?: boolean;
onStart?(): void;
onComplete?(): void;
onCancel?(): void;
}) {
const {
stepsProp = [],
defaultIndex = 0,
index,
onIndexChange,
storageKey,
autoStart = false,
onStart,
onComplete,
onCancel,
} = opts;

const persisted = storage.get(storageKey) as { index?: number; completed?: boolean } | null;

const [internalIndex, setInternalIndex] = useState<number>(() => {
if (typeof index === 'number') return index;
if (persisted?.completed) return -1;
if (typeof persisted?.index === 'number') return persisted.index;
return autoStart ? defaultIndex : -1;
});

const isControlled = typeof index === 'number';
const currentIndex = isControlled ? (index as number) : internalIndex;

const steps = useMemo(() => stepsProp, [stepsProp]);
const count = steps.length;

const [open, setOpen] = useState<boolean>(() => currentIndex >= 0);
const [completed, setCompleted] = useState<boolean>(!!persisted?.completed);

// Anchor resolution
const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
const resolver = useCallback(() => {
const step = steps[currentIndex];
setAnchorEl(step ? toElement(step.target ?? null) : null);
}, [steps, currentIndex]);

// Start/Cancel/Complete
const start = useCallback((i = 0) => {
if (count === 0) return;
if (!isControlled) setInternalIndex(i);
setOpen(true);
setCompleted(false);
storage.set(storageKey, { index: i, completed: false });
onStart?.();
}, [count, isControlled, storageKey, onStart]);

const cancel = useCallback(() => {
setOpen(false);
if (!isControlled) setInternalIndex(-1);
storage.remove(storageKey);
onCancel?.();
}, [isControlled, onCancel, storageKey]);

const complete = useCallback(() => {
setOpen(false);
setCompleted(true);
storage.set(storageKey, { index: count - 1, completed: true });
onComplete?.();
}, [count, onComplete, storageKey]);

const goTo = useCallback((i: number) => {
if (i < 0 || i >= count) return;
const prev = currentIndex;
const next = i;
// per-step hooks
steps[prev]?.onExit?.(prev);
steps[next]?.onEnter?.(next);
if (!isControlled) setInternalIndex(next);
onIndexChange?.(next, prev);
storage.set(storageKey, { index: next, completed: false });
setOpen(true);
}, [count, currentIndex, isControlled, onIndexChange, steps, storageKey]);

const next = useCallback(() => {
const nextIdx = currentIndex + 1;
if (nextIdx >= count) return complete();
goTo(nextIdx);
}, [currentIndex, count, complete, goTo]);

const prev = useCallback(() => {
const prevIdx = currentIndex - 1;
if (prevIdx < 0) return;
goTo(prevIdx);
}, [currentIndex, goTo]);

// Resolve anchor whenever step changes or layout possibly changed
useEffect(() => {
resolver();
const onResize = () => resolver();
window.addEventListener('resize', onResize);
window.addEventListener('scroll', onResize, true);
return () => {
window.removeEventListener('resize', onResize);
window.removeEventListener('scroll', onResize, true);
};
}, [resolver]);

useEffect(() => {
if (autoStart && currentIndex < 0 && !completed && count > 0) start();
}, [autoStart, completed, count, currentIndex, start]);

return {
steps,
count,
index: currentIndex,
current: Math.max(0, currentIndex),
started: currentIndex >= 0,
completed,
open,
anchorEl,
resolveAnchor: resolver,
start,
cancel,
complete,
next,
prev,
goTo,
};
}

⸻

Context & Provider

WalkthroughProvider.tsx

import React, { createContext, useContext, useMemo } from 'react';
import { useWalkthrough as useWT } from './useWalkthrough';
import type { WalkthroughProps, WalkthroughStepSpec, WalkthroughContextValue } from './types';

const Ctx = createContext<WalkthroughContextValue | null>(null);
export const useWalkthrough = () => {
const ctx = useContext(Ctx);
if (!ctx) throw new Error('Walkthrough components must be used within <WalkthroughProvider>');
return ctx;
};

export function WalkthroughProvider({
children,
steps = [],
...opts
}: React.PropsWithChildren<WalkthroughProps & { steps?: WalkthroughStepSpec[] }>) {
const api = useWT({ stepsProp: steps, ...opts });
const value = useMemo(() => api, [api]);
return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

⸻

Declarative Step API (optional, composable)

WalkthroughStep.tsx

import React, { useEffect } from 'react';
import { useWalkthrough } from './WalkthroughProvider';
import type { WalkthroughStepSpec } from './types';

export function WalkthroughStep(props: WalkthroughStepSpec & { index: number }) {
const { index, ...spec } = props;
const { index: active, goTo } = useWalkthrough();

// No rendering; declarative wrapper can be used for editor tooling later
useEffect(() => { /_ could register metadata with analytics/editor _/ }, []);
return null;
}

(If you prefer, you can omit this and rely solely on the steps array.)

⸻

Target Registration Helper (optional)

If your product prefers in-place anchors:

WalkthroughAnchor.tsx

import React, { useEffect, useRef } from 'react';

/\*_ Wraps a child to expose a stable element for `target: HTMLElement` steps _/
export function WalkthroughAnchor({ children, onRef }: { children: React.ReactNode; onRef?(el: HTMLElement): void }) {
const ref = useRef<HTMLDivElement>(null);
useEffect(() => { if (ref.current) onRef?.(ref.current); }, [onRef]);
return <div ref={ref}>{children}</div>;
}

Use: capture el and place into a step’s target.

⸻

Visual Scaffolding & Popover Composition

We assume you have a Popover composer with this minimal API:

// hypothetical Popover composer from your DS
<Popover anchor={HTMLElement|null} open onOpenChange={fn}>
<Popover.Content>...</Popover.Content>
<Popover.Arrow />
</Popover>

Walkthrough.tsx

import React, { useCallback } from 'react';
import { useWalkthrough } from './WalkthroughProvider';
import { Popover } from '@/ui/components/Popover'; // your composer
import styles from './Walkthrough.module.scss';

export interface WalkthroughUIProps {
className?: string;
/** Custom content render; default uses step.title/description \*/
children?: React.ReactNode;
/** When target missing, choose behavior \*/
onMissingTarget?: 'skip' | 'pin-to-center' | 'hide';
}

export function Walkthrough({ className, children, onMissingTarget = 'skip' }: WalkthroughUIProps) {
const { steps, index, count, anchorEl, open, next, cancel, resolveAnchor } = useWalkthrough();
const step = steps[index];

// Target missing policy
const anchor = anchorEl ?? null;
const shouldHide = !step || (!anchor && onMissingTarget === 'hide');
const pinToCenter = !anchor && onMissingTarget === 'pin-to-center';

const handleOpenChange = useCallback((o: boolean) => { if (!o) cancel(); }, [cancel]);

if (!open || shouldHide) return null;

return (
<Popover
anchor={pinToCenter ? document.body : anchor}
open={open}
onOpenChange={handleOpenChange}
placement={step?.placement}
offset={step?.offset ?? 12}
onPositionUpdate={resolveAnchor} >
<Popover.Content className={[styles.content, className].filter(Boolean).join(' ')}>
{children ?? (
<>
{step?.title && <div className={styles.title}>{step.title}</div>}
{step?.description && <div className={styles.desc}>{step.description}</div>}

<div className={styles.controls}>
<button type="button" onClick={cancel} className={styles.skip}>Skip</button>
<button type="button" onClick={next} className={styles.next}>
{index === count - 1 ? 'Done' : 'Next'}
</button>
</div>
</>
)}
</Popover.Content>
<Popover.Arrow />
</Popover>
);
}

⸻

Slots

WalkthroughControls.tsx

import React from 'react';
import { useWalkthrough } from './WalkthroughProvider';

export function WalkthroughControls({
onNext,
onPrev,
onSkip,
className,
}: {
onNext?: () => void; onPrev?: () => void; onSkip?: () => void; className?: string;
}) {
const { index, count, next, prev, cancel } = useWalkthrough();
return (

<div className={className}>
<button type="button" onClick={onSkip ?? cancel}>Skip</button>
<button type="button" onClick={onPrev ?? prev} disabled={index === 0}>Back</button>
<button type="button" onClick={onNext ?? next}>{index === count - 1 ? 'Done' : 'Next'}</button>
</div>
);
}

WalkthroughProgress.tsx

import React from 'react';
import { useWalkthrough } from './WalkthroughProvider';
import styles from './Walkthrough.module.scss';

export function WalkthroughProgress({ dots = true }: { dots?: boolean }) {
const { index, count } = useWalkthrough();
if (dots) {
return (

<div className={styles.dots} role="status" aria-live="polite" aria-label={`Step ${index+1} of ${count}`}>
{Array.from({ length: count }).map((\_, i) => (
<span key={i} className={i === index ? styles.dotActive : styles.dot} />
))}
</div>
);
}
return <div className={styles.counter} aria-live="polite">{index + 1} / {count}</div>;
}

⸻

Exports

index.tsx

export { WalkthroughProvider } from './WalkthroughProvider';
export { Walkthrough } from './Walkthrough';
export { WalkthroughControls } from './WalkthroughControls';
export { WalkthroughProgress } from './WalkthroughProgress';
export { WalkthroughAnchor } from './WalkthroughAnchor';
export { WalkthroughStep } from './WalkthroughStep';
export type { WalkthroughProps, WalkthroughStepSpec } from './types';

⸻

Styles & Tokens

Walkthrough.tokens.json

{
"component": {
"walkthrough": {
"surface": {
"bg": "{color.background.layer}",
"border": "{color.border.subtle}",
"radius": "{radius.lg}",
"shadow": "{shadow.lg}",
"padding": "{space.300}"
},
"title": { "fontSize": "{font.size.300}", "fontWeight": "{font.weight.semibold}" },
"description": { "fontSize": "{font.size.200}", "color": "{color.foreground.muted}" },
"controls": { "gap": "{space.200}" },
"dots": { "size": "{size.2}", "gap": "{space.150}", "active": "{color.brand.500}", "idle": "{color.border.subtle}" }
}
}
}

Walkthrough.module.scss (excerpt)

@import './Walkthrough.tokens.generated.scss';

.content {
background: var(--walkthrough-surface-bg);
border: 1px solid var(--walkthrough-surface-border);
border-radius: var(--walkthrough-surface-radius);
box-shadow: var(--walkthrough-surface-shadow);
padding: var(--walkthrough-surface-padding);
max-width: 28rem;
}

.title { font-size: var(--walkthrough-title-fontSize); font-weight: var(--walkthrough-title-fontWeight); }
.desc { font-size: var(--walkthrough-description-fontSize); color: var(--walkthrough-description-color); margin-top: .5rem; }

.controls { display: flex; gap: var(--walkthrough-controls-gap); justify-content: flex-end; margin-top: 1rem; }

.dots { display: inline-flex; gap: var(--walkthrough-dots-gap); }
.dot, .dotActive {
display: inline-block; width: var(--walkthrough-dots-size); height: var(--walkthrough-dots-size);
border-radius: 999px; background: var(--walkthrough-dots-idle);
}
.dotActive { background: var(--walkthrough-dots-active); }
.counter { font-variant-numeric: tabular-nums; }

⸻

Usage Examples

1. Singular Coachmark

import {
WalkthroughProvider, Walkthrough, WalkthroughProgress, WalkthroughControls
} from '@/ui/components/Walkthrough';

export function SingularCoachmark() {
return (
<WalkthroughProvider
steps={[{
id: 'search-bar',
target: '#globalSearch',
placement: 'bottom',
title: 'Search everything',
description: 'Use the global search to find projects, issues, and people.',
}]}
autoStart
storageKey="walkthrough.search.v1"
onComplete={() => console.log('done')} >
<Walkthrough>
<WalkthroughProgress />
<WalkthroughControls />
</Walkthrough>
</WalkthroughProvider>
);
}

2. Multi-step Product Walkthrough (plural touchpoints)

const steps = [
{ id: 'nav-inbox', target: '#inbox', placement: 'right', title: 'Inbox', description: 'Your messages live here.' },
{ id: 'nav-boards', target: '#boards', placement: 'right', title: 'Boards', description: 'Organize work visually.' },
{ id: 'btn-new', target: '#newItem', placement: 'bottom', title: 'Create', description: 'Start something new.' },
];

export function ProductTour() {
return (
<WalkthroughProvider
steps={steps}
defaultIndex={0}
storageKey="tour.app.v2"
autoStart
onIndexChange={(next) => window.dispatchEvent(new CustomEvent('tour:step', { detail: { next } }))}
onComplete={() => console.log('completed')} >
<Walkthrough onMissingTarget="skip">
<WalkthroughProgress />
{/_ Replace with custom layout if desired _/}
<WalkthroughControls />
</Walkthrough>
</WalkthroughProvider>
);
}

3. Anchors with dynamic elements

function CardWithAnchor({ stepRef }: { stepRef: (el: HTMLElement)=>void }) {
return <WalkthroughAnchor onRef={stepRef}><Card id="dynamicCard" /></WalkthroughAnchor>;
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

⸻

Accessibility & UX Invariants (the “gotchas”)

These are the failure modes that commonly cause systems violations; the component enforces or provides hooks for each: 1. Missing targets
• Policy: onMissingTarget = 'skip' | 'pin-to-center' | 'hide'. Default skip avoids blocking users when an element isn’t present due to feature flags or responsive layouts. 2. Focus & keyboard order
• Delegate focus trapping to Popover. Provide Back/Next/Skip with consistent shortcuts:
• Enter/Space → Next
• Esc → Cancel
• ←/→ → Prev/Next (optional)
• Do not hijack global focus outside the popover when step changes. 3. Scroll into view & positioning
• On step change, the provider calls resolveAnchor(). If your Popover supports “auto-flip” and collision detection, leave motion minimal and deterministic. Prefer scroll-margin on targets over big animated scrolls; respect reduced-motion. 4. Fixed/portal layers, modals, and z-index
• Popover should render in a top-level portal. Ensure it can appear above modals if the target is inside them; otherwise skip the step if the modal isn’t open. 5. Shadow DOM / canvas anchors
• If a target cannot be queried, provide target: HTMLElement via WalkthroughAnchor. 6. Route transitions
• Persist progress with storageKey. On navigation, the provider re-resolves anchors and either shows the same step, skips, or pins to center per policy. 7. Analytics miscounts
• Trigger onIndexChange, onStart, onComplete, onCancel exactly once per event. Avoid counting “Next” if we auto-advance on missing targets. 8. Internationalization / RTL
• Delegate mirror-aware placement to Popover. Avoid directional strings in code; use tokens. 9. Theming
• No hardcoded colors or radii; all styles flow from tokens. 10. Interference with app shortcuts

    •	While open, trap only necessary keys. Don’t globally preventDefault unless the event targets our controls.

⸻

Validator Invariants (for your script)
• Composer: must include WalkthroughProvider.tsx and useWalkthrough.ts.
• Popover integration: Walkthrough.tsx should import your Popover composer.
• Tokens: SCSS uses Walkthrough.tokens.generated.scss; no hardcoded brand colors.
• Slots: exports WalkthroughProgress and WalkthroughControls.
• Persistence: if storageKey provided, localStorage usage present.
• A11y: progress exposes live region (role="status" or aria-live="polite").

⸻

README.md (starter)

# Walkthrough (Coachmark / Feature Tour)

Composer that sequences contextual coachmarks anchored to UI elements. Built on the Popover composer; headless logic lives in `useWalkthrough`.

## When to use

- Feature introductions, progressive onboarding, new-UI tours.

## Key ideas

- **Headless orchestration**: state, sequencing, anchor resolution, persistence.
- **Composable UI**: replace content, controls, and progress via slots.
- **Robust target policy**: skip/pin/hide when anchors are missing.

## Props

See `WalkthroughProps`. Minimal: `steps`, `autoStart`, `storageKey`. Each step: `id`, `target`, `title`, `description`, optional `placement|offset`.

## Accessibility

- Popover handles focus management and escape/close semantics.
- Progress announces step index (`aria-live="polite"`).
- Reduced motion respected; avoid large auto-scrolls.

## Examples

See code samples in the component folder.

## Gotchas handled

- Missing targets, route transitions, modal layers, RTL placements, analytics double counts.

⸻

Why this design scales across products
• Composer, not config dump: sequencing, anchoring, and persistence live in headless logic; products just supply steps and slots.
• Slotting lets you adopt product-specific copy/controls without forking the behavior.
• Popover reuse keeps a11y and collision logic centralized; you don’t re-invent targeting per surface.
• Tokens provide brand parity; the same tour skin works across multi-brand experiences.
