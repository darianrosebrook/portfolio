Great target. A Toolbar / Filter Action Bar is a classic “looks simple, hides state + orchestration.” We’ll design it as a composer that:
• Works when the exact actions are unknown at build time (action registry).
• Adapts to container width (priority-based overflow → “More” menu).
• Preserves app conventions: keyboard model, ARIA toolbar, roving tabindex, group semantics, toggle/selection state, and tokens.
• Composes primitives you already have (Button, ToggleButton, Select, Input, Menu, Popover, Chip).

Below is a drop-in React/TS blueprint consistent with your agents.md rules: headless logic, provider/context, slotting, tokenized visuals, and validator-friendly invariants.

⸻

Toolbar (Composer)

Folder

Toolbar/
├── index.tsx
├── Toolbar.tsx # visual scaffold + role="toolbar"
├── ToolbarProvider.tsx # context + orchestration
├── useToolbar.ts # headless state: registry, layout, overflow
├── ToolbarItem.tsx # action renderer (pluggable kinds)
├── ToolbarSection.tsx # primary/secondary groups
├── ToolbarOverflow.tsx # "More" menu (uses Menu/Popover)
├── types.ts # ActionSpec, kinds, events
├── Toolbar.module.scss
├── Toolbar.tokens.json
├── Toolbar.tokens.generated.scss
└── README.md

⸻

Mental model
• Action registry: you pass a list of ActionSpecs; the toolbar decides rendering, disabled, selected, and where actions live (visible vs overflow).
• Layout policy: priority → measure widths → collapse low-priority actions first. Live ResizeObserver recomputes layout. No layout animation; only visibility transitions.
• Composability: provide default renderers for common kinds (button, toggle, select, search, chip-filter, divider) but allow custom renderers per action.
• A11y: role="toolbar", roving tabindex among interactive children; aria-orientation="horizontal". Groups (e.g., mutually exclusive toggles) use role="group" + aria-label.

⸻

Types

// types.ts
export type ActionKind =
| 'button' // click action
| 'toggle' // on/off
| 'select' // single choice (uses Select primitive)
| 'search' // inline textbox
| 'chip-filter' // removable applied filter
| 'separator' // visual divider
| 'custom'; // user renderer

export type Priority = 1 | 2 | 3; // 1 = most important (collapse last)

export interface ActionSpec {
id: string;
kind: ActionKind;
label?: string; // L10n-visible label
icon?: React.ReactNode;
tooltip?: string;
groupId?: string; // for grouped toggles
priority?: Priority; // default 2
disabled?: boolean;
hidden?: boolean;
selected?: boolean; // for toggles
value?: any; // for select/search/chip
shortcut?: string; // E.g., "⌘K"
/** Render override for 'custom' or exotic kinds \*/
render?: (ctx: ToolbarRenderCtx) => React.ReactNode;
/** Visibility/business logic hook _/
visibleWhen?(ctx: ToolbarState): boolean;
/\*\* Event intents (agent-friendly) _/
onExecute?(ctx: ToolbarState): void;
onToggle?(next: boolean, ctx: ToolbarState): void;
onChange?(value: any, ctx: ToolbarState): void;
}

export interface ToolbarProps {
actions: ActionSpec[];
/** Optional: controlled list of applied filters (chips) \*/
appliedFilters?: Array<{ id: string; label: string; onRemove(): void }>;
/** Orientation; default horizontal _/
orientation?: 'horizontal' | 'vertical';
/\*\* Minimum space reserved for overflow trigger (px) _/
overflowReservePx?: number; // default 48
/** Enable/disable overflow behavior \*/
overflow?: 'auto' | 'never' | 'always'; // default 'auto'
/** Strategy when space tight: "collapse" (priority) or "wrap" _/
strategy?: 'collapse' | 'wrap';
/\*\* A11y name for screen readers _/
ariaLabel?: string;
/\*_ Sections boundaries: primary (left) vs secondary (right) _/
sections?: Array<{ id: 'primary' | 'secondary'; match: (a: ActionSpec) => boolean }>;
}

⸻

Headless orchestration

useToolbar.ts

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ActionSpec, ToolbarProps } from './types';

export interface LayoutItem {
action: ActionSpec;
width: number; // measured px
visible: boolean;
section: 'primary' | 'secondary';
}

export interface ToolbarState {
items: LayoutItem[];
containerWidth: number;
overflowIds: string[];
visibleIds: string[];
appliedFilters?: ToolbarProps['appliedFilters'];
}

export function useToolbar(props: ToolbarProps) {
const {
actions,
appliedFilters,
sections = [
{ id: 'primary' as const, match: () => true },
{ id: 'secondary' as const, match: (a) => a.kind === 'search' } // example
],
overflow = 'auto',
overflowReservePx = 48,
strategy = 'collapse',
orientation = 'horizontal'
} = props;

const containerRef = useRef<HTMLDivElement>(null);
const [containerWidth, setContainerWidth] = useState(0);
const [measures, setMeasures] = useState<Record<string, number>>({});

// Filter by visibility predicates
const activeActions = useMemo(
() => actions.filter(a => !a.hidden && (a.visibleWhen ? a.visibleWhen(state()) : true)),
// eslint-disable-next-line react-hooks/exhaustive-deps
[actions, containerWidth, appliedFilters]
);

// Section assignment
const withSections = useMemo<LayoutItem[]>(
() =>
activeActions.map(a => {
const sec = sections.find(s => s.match(a))?.id ?? 'primary';
return { action: a, width: measures[a.id] ?? 0, visible: true, section: sec };
}),
[activeActions, measures, sections]
);

// Resize observer
useEffect(() => {
const el = containerRef.current;
if (!el) return;
const ro = new ResizeObserver(([entry]) => {
setContainerWidth(Math.floor(entry.contentRect.width));
});
ro.observe(el);
return () => ro.disconnect();
}, []);

// Layout algorithm (collapse → overflow)
const layout = useMemo(() => {
if (overflow === 'never' || orientation === 'vertical' || strategy === 'wrap') {
return { items: withSections, overflowIds: [], visibleIds: withSections.map(i => i.action.id) };
}

    // Sum widths by DOM measurement; if any width unknown, optimistically show then reflow.
    const items = [...withSections];
    const total = items.reduce((acc, it) => acc + (it.width || 0), 0);
    if (total + overflowReservePx <= containerWidth) {
      return { items, overflowIds: [], visibleIds: items.map(i => i.action.id) };
    }

    // Sort by priority (3 collapses first, then 2, then 1). Stable within priority by original order.
    const collapseOrder = items
      .map((it, idx) => ({ it, idx, pr: it.action.priority ?? 2 }))
      .sort((a, b) => (b.pr - a.pr) || (b.idx - a.idx)); // lower priority collapses first

    const overflowIds: string[] = [];
    let used = overflowReservePx; // reserve "More" trigger
    // Keep adding from most important; overflow the rest
    for (const { it } of collapseOrder.reverse()) {
      const next = used + (it.width || 0);
      if (next <= containerWidth) {
        it.visible = true;
        used = next;
      } else {
        it.visible = false;
        overflowIds.push(it.action.id);
      }
    }
    const visibleIds = items.filter(i => i.visible).map(i => i.action.id);
    return { items, overflowIds, visibleIds };

}, [withSections, containerWidth, overflow, overflowReservePx, orientation, strategy]);

function state(): ToolbarState {
return {
items: layout.items,
containerWidth,
overflowIds: layout.overflowIds,
visibleIds: layout.visibleIds,
appliedFilters
};
}

// Public API
const registerMeasure = useCallback((id: string, w: number) => {
setMeasures(m => (m[id] === w ? m : { ...m, [id]: w }));
}, []);

return { containerRef, state, registerMeasure };
}

⸻

Context & Provider

ToolbarProvider.tsx

import React, { createContext, useContext, useMemo } from 'react';
import { useToolbar } from './useToolbar';
import type { ToolbarProps } from './types';

const Ctx = createContext<ReturnType<typeof useToolbar> | null>(null);
export const useToolbarCtx = () => {
const c = useContext(Ctx);
if (!c) throw new Error('Toolbar components must be used within <ToolbarProvider>');
return c;
};

export function ToolbarProvider({ children, ...props }: React.PropsWithChildren<ToolbarProps>) {
const api = useToolbar(props);
const value = useMemo(() => api, [api]);
return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

⸻

Visual scaffold + ARIA

Toolbar.tsx

import React, { useEffect, useRef } from 'react';
import { useToolbarCtx } from './ToolbarProvider';
import { ToolbarSection } from './ToolbarSection';
import { ToolbarOverflow } from './ToolbarOverflow';
import styles from './Toolbar.module.scss';

export function Toolbar({
ariaLabel = 'Toolbar',
className,
children
}: { ariaLabel?: string; className?: string; children?: React.ReactNode }) {
const { containerRef, state } = useToolbarCtx();
const rootRef = useRef<HTMLDivElement>(null);

// Roving tabindex: first visible interactive gets tabIndex=0; others -1.
useEffect(() => {
const root = rootRef.current;
if (!root) return;
const focusables = root.querySelectorAll<HTMLElement>('[data-tb-focusable="true"]');
let first = true;
focusables.forEach(el => (el.tabIndex = first ? 0 : -1, first = false));
}, [state().visibleIds.join(',')]);

const cls = [styles.root, className].filter(Boolean).join(' ');

return (

<div ref={(el) => { rootRef.current = el; containerRef.current = el!; }}
role="toolbar"
aria-label={ariaLabel}
className={cls}
aria-orientation="horizontal">
{/_ Primary & Secondary slots (left/right) _/}
<ToolbarSection id="primary" />
<div className={styles.spacer} />
<ToolbarSection id="secondary" />
<ToolbarOverflow />
{children /_ optional custom regions _/}
</div>
);
}

ToolbarSection.tsx

import React, { useLayoutEffect, useRef } from 'react';
import { useToolbarCtx } from './ToolbarProvider';
import { ToolbarItem } from './ToolbarItem';
import styles from './Toolbar.module.scss';

export function ToolbarSection({ id }: { id: 'primary' | 'secondary' }) {
const { state, registerMeasure } = useToolbarCtx();
const measRef = useRef<Record<string, HTMLElement | null>>({});

// Measure child widths once mounted (no layout animation)
useLayoutEffect(() => {
const s = state();
for (const it of s.items.filter(i => i.section === id)) {
const el = measRef.current[it.action.id];
if (el) registerMeasure(it.action.id, Math.ceil(el.getBoundingClientRect().width));
}
}, [id, registerMeasure, state]);

const s = state();
const items = s.items.filter(i => i.section === id && i.visible);

return (

<div className={styles.section} data-section={id}>
{items.map(i => (
<div key={i.action.id}
ref={el => { measRef.current[i.action.id] = el; }}
className={styles.item}>
<ToolbarItem action={i.action} />
</div>
))}
</div>
);
}

⸻

Action renderer (pluggable kinds)

ToolbarItem.tsx

import React from 'react';
import type { ActionSpec } from './types';
import { Button } from '@/ui/components/Button';
import { ToggleButton } from '@/ui/components/ToggleButton';
import { Select } from '@/ui/components/Select';
import { Input } from '@/ui/components/Input';
import { Chip } from '@/ui/components/Chip';

export function ToolbarItem({ action }: { action: ActionSpec }) {
if (action.kind === 'separator') return <div aria-hidden="true" className="tb-sep" />;

const common = {
'data-tb-focusable': 'true',
title: action.tooltip,
'aria-keyshortcuts': action.shortcut,
disabled: action.disabled
} as const;

switch (action.kind) {
case 'button':
return (
<Button {...common} onClick={() => action.onExecute?.({} as any)}>
{action.icon}{action.label}
</Button>
);
case 'toggle':
return (
<ToggleButton {...common}
pressed={!!action.selected}
onPressedChange={(v) => action.onToggle?.(v, {} as any)}>
{action.icon}{action.label}
</ToggleButton>
);
case 'select':
return (
<Select {...common}
value={action.value}
onValueChange={(v) => action.onChange?.(v, {} as any)}
aria-label={action.label}>
{/_ options provided by upstream via render or value schema _/}
</Select>
);
case 'search':
return (
<Input {...common}
type="search"
value={action.value ?? ''}
onChange={(e) => action.onChange?.(e.currentTarget.value, {} as any)}
placeholder={action.label ?? 'Search'} />
);
case 'chip-filter':
return (
<Chip {...common} onRemove={() => action.onExecute?.({} as any)}>
{action.label}
</Chip>
);
case 'custom':
return action.render ? <>{action.render({} as any)}</> : null;
default:
return null;
}
}

⸻

Overflow

ToolbarOverflow.tsx

import React from 'react';
import { useToolbarCtx } from './ToolbarProvider';
import { Menu, MenuItem, MenuSeparator } from '@/ui/components/Menu';
import { Button } from '@/ui/components/Button';
import { Popover } from '@/ui/components/Popover';

export function ToolbarOverflow() {
const { state } = useToolbarCtx();
const s = state();
if (!s.overflowIds.length) return null;

// Render overflow items inside a Menu. Kinds map to equivalents.
const overflowItems = s.items.filter(i => s.overflowIds.includes(i.action.id));

return (
<Popover>
<Popover.Trigger asChild>
<Button data-tb-focusable="true" aria-label="More actions">⋯</Button>
</Popover.Trigger>
<Popover.Content>

<Menu>
{overflowItems.map(({ action }, idx) => {
if (action.kind === 'separator') return <MenuSeparator key={idx} />;
return (
<MenuItem key={action.id}
disabled={action.disabled}
onSelect={() => action.onExecute?.(s)}>
{action.icon}{action.label}
</MenuItem>
);
})}
</Menu>
</Popover.Content>
</Popover>
);
}

⸻

Tokens (excerpt)

{
"component": {
"toolbar": {
"gap": { "x": "{space.150}", "y": "{space.100}" },
"item": { "padX": "{space.150}", "padY": "{space.100}" },
"sep": { "color": "{color.border.subtle}" },
"overflow": { "reserve": "48px" },
"focus": { "ring": "{color.border.focus}" },
"density": { "compact": "8px", "regular": "12px", "comfortable": "16px" }
}
}
}

⸻

Styles (essentials)

@import './Toolbar.tokens.generated.scss';

.root {
display: flex;
align-items: center;
gap: var(--toolbar-gap-x);
min-height: calc(2.5rem); /_ from tokens via items' heights _/
}

.section { display: inline-flex; align-items: center; gap: var(--toolbar-gap-x); }
.spacer { flex: 1; min-width: 0; }
.item { display: inline-flex; align-items: center; }
.tb-sep { width: 1px; height: 1.5em; background: var(--toolbar-sep-color); }

:where([data-tb-focusable='true']):focus-visible {
outline: none;
box-shadow: 0 0 0 3px color-mix(in oklab, var(--toolbar-focus-ring) 30%, transparent);
}

⸻

Usage

Filter action bar with unknown mix of actions

import {
ToolbarProvider, Toolbar
} from '@/ui/components/Toolbar';

const actions: ActionSpec[] = [
{ id: 'search', kind: 'search', label: 'Search', priority: 1, value: '' ,
onChange: (v) => console.log('search', v) },
{ id: 'status', kind: 'select', label: 'Status', priority: 1,
onChange: (v) => console.log('status', v) },
{ id: 'assignee', kind: 'select', label: 'Assignee', priority: 2 },
{ id: 'tag', kind: 'select', label: 'Tag', priority: 2 },
{ id: 'save', kind: 'button', label: 'Save view', icon: <SaveIcon />, priority: 1,
onExecute: () => console.log('save') },
{ id: 'dense', kind: 'toggle', label: 'Dense', priority: 3,
onToggle: (v) => console.log('dense', v) },
{ id: 'sep1', kind: 'separator', priority: 3 },
{ id: 'export', kind: 'button', label: 'Export CSV', priority: 3 }
];

export function IssuesFilterBar() {
return (
<ToolbarProvider
actions={actions}
appliedFilters={[
{ id: 'f1', label: 'Status: Open', onRemove: () => {} },
{ id: 'f2', label: 'Assignee: You', onRemove: () => {} }
]}
overflow="auto"
strategy="collapse"
ariaLabel="Issues filters"
sections={[
{ id: 'primary', match: (a) => a.kind !== 'button' || a.id === 'save' },
{ id: 'secondary', match: (a) => a.kind === 'button' && a.id !== 'save' }
]} >
<Toolbar />
</ToolbarProvider>
);
}

⸻

A11y & UX invariants (guardrails) 1. role="toolbar" + roving tabindex
• Only one tabbable child at a time; arrow keys move focus within the toolbar.
• aria-orientation="horizontal"; groups (e.g., text alignment toggles) use role="group" and an accessible label. 2. Overflow is not second-class
• Items moved to overflow must remain keyboard accessible; shortcuts (if any) still work.
• The overflow trigger is focusable and announced (“More actions”). 3. Consistent semantics across kinds
• Button → onExecute, Toggle → onToggle, Select/Search → onChange. Same event envelopes for analytics/agents. 4. Predictable collapse
• Priority (3→2→1) defines collapse order. Visual affordances remain stable; do not reorder within equal priority groups. 5. No layout animation
• We measure once and swap visibility; avoid animating widths to prevent thrash. Respect reduced-motion globally via your primitives. 6. Tokens, not hex
• Spacing, focus rings, separators all token-driven; multi-brand parity without forks.

⸻

Validator invariants (for your repo script)
• Composer must export ToolbarProvider, Toolbar, ToolbarSection, ToolbarOverflow, ToolbarItem.
• Uses ResizeObserver; no hardcoded widths.
• role="toolbar" present; roving tabindex enforced; overflow trigger present when items hidden.
• No hardcoded colors; uses Toolbar.tokens.generated.scss.
• Action kinds cover: button, toggle, select, search, chip-filter, separator (plus custom renderer).

⸻

Why this fits your system lens
• Composer centralizes orchestration (registry, layout, overflow) while delegating visuals to your primitives—so app conventions stay consistent.
• Unknown actions aren’t a problem: the registry pattern + renderers mean products can inject whatever they need without violating a11y or layout invariants.
• Forward-compatible: new kinds (e.g., “split-button” or “segmented-control”) add via a new renderer; the toolbar’s measurement/overflow remains unchanged.
