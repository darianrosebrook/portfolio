Perfect—pagination is a great stress-test for “composer + dynamic layout” thinking. Below is a framework-agnostic React/TS blueprint that mirrors the toolbar approach:
• Layer: Composer
• Meta-patterns: headless logic hook, provider/context, slotting, overflow model
• Dynamic inputs: total items (or total pages), page size, current page; responsive sibling/boundary counts; overflow → ellipses; compact thresholds
• Variants: page-numbered pagination and cursor (Prev/Next) for infinite/unknown totals
• A11y: nav landmark, list semantics, aria-current="page", rel="prev|next", keyboard model

⸻

Pagination (Composer)

Folder

Pagination/
├── index.tsx
├── Pagination.tsx # visual scaffold (<nav>/<ul>)
├── PaginationProvider.tsx # context + orchestration
├── usePagination.ts # headless model (items: first,prev,numbers,ellipsis,next,last)
├── PageButton.tsx # primitive control, a11y rules
├── PageInput.tsx # “Go to page” optional slot
├── PageSizeSelect.tsx # page size control (optional)
├── RangeSummary.tsx # “1–25 of 2,341” optional slot
├── Pagination.module.scss
├── Pagination.tokens.json
├── Pagination.tokens.generated.scss
└── README.md

⸻

Core API

// types.ts
export type PaginationVariant = 'pages' | 'cursor';

export interface PaginationProps {
/\*_ Which model to use: numeric pages or cursor _/
variant?: PaginationVariant;

/\*_ --- Numeric pages model --- _/
totalItems?: number; // if unknown, omit and use totalPages
totalPages?: number; // precomputed, or Math.ceil(totalItems/pageSize)
pageSize?: number; // default 25
page?: number; // 1-based current page (controlled)
defaultPage?: number; // uncontrolled start page
onPageChange?(next: number): void;

/** How many page buttons to show adjacent to the current page (each side) \*/
siblingCount?: number; // default 1
/** How many page buttons to always show at the ends _/
boundaryCount?: number; // default 1
/\*\* Switch to compact UX below this physical width or item count threshold _/
compactBreakpointPx?: number; // default 480
compactMinPages?: number; // default 7

/\*_ --- Cursor model --- _/
hasPrev?: boolean;
hasNext?: boolean;
onPrev?(): void;
onNext?(): void;

/\*_ Common _/
showFirstLast?: boolean; // default true
showPrevNext?: boolean; // default true
disabled?: boolean;
ariaLabel?: string; // e.g., "Results pagination"
}

⸻

Headless orchestration

usePagination.ts

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PaginationProps } from './types';

type ItemType = 'first' | 'prev' | 'page' | 'ellipsis' | 'next' | 'last';
export interface PaginationItem {
key: string;
type: ItemType;
page?: number; // for type 'page'
disabled?: boolean;
selected?: boolean;
rel?: 'prev' | 'next';
}

function range(start: number, end: number) {
const out: number[] = [];
for (let i = start; i <= end; i++) out.push(i);
return out;
}

/\*_ Build the visible item model for page-numbered pagination _/
function buildPageItems(opts: {
page: number; totalPages: number;
siblingCount: number; boundaryCount: number;
showFirstLast: boolean; showPrevNext: boolean;
}): PaginationItem[] {
const { page, totalPages, siblingCount, boundaryCount, showFirstLast, showPrevNext } = opts;

const first = 1;
const last = Math.max(1, totalPages);

const startPages = range(first, Math.min(first + boundaryCount - 1, last));
const endPages = range(Math.max(first, last - boundaryCount + 1), last);

const leftSiblingStart = Math.max(page - siblingCount, first);
const rightSiblingEnd = Math.min(page + siblingCount, last);

const siblings = range(leftSiblingStart, rightSiblingEnd);

const items: PaginationItem[] = [];

if (showFirstLast) items.push({ key: 'first', type: 'first', disabled: page === first });
if (showPrevNext) items.push({ key: 'prev', type: 'prev', disabled: page === first, rel: 'prev' });

// Merge with ellipses where needed
const merged: number[] = [];
const all = [...startPages, ...(siblings.filter(n => n > startPages[startPages.length-1] && n < endPages[0])), ...endPages];
let lastAdded = 0;
for (const n of all) {
if (lastAdded && n - lastAdded > 1) {
// gap: insert sentinel -1 as ellipsis marker
merged.push(-1);
}
merged.push(n);
lastAdded = n;
}

for (const n of merged) {
if (n === -1) items.push({ key: `el-${items.length}`, type: 'ellipsis', disabled: true });
else items.push({ key: `p-${n}`, type: 'page', page: n, selected: n === page });
}

if (showPrevNext) items.push({ key: 'next', type: 'next', disabled: page === last, rel: 'next' });
if (showFirstLast) items.push({ key: 'last', type: 'last', disabled: page === last });

return items;
}

export function usePagination(props: PaginationProps) {
const {
variant = 'pages',
totalItems, totalPages: totalPagesProp, pageSize = 25,
page, defaultPage = 1, onPageChange,
siblingCount = 1, boundaryCount = 1,
compactBreakpointPx = 480, compactMinPages = 7,
hasPrev, hasNext, onPrev, onNext,
showFirstLast = true, showPrevNext = true,
disabled
} = props;

const isControlled = typeof page === 'number';
const [internalPage, setInternalPage] = useState<number>(defaultPage);
const currentPage = isControlled ? (page as number) : internalPage;

const computedTotalPages =
variant === 'pages'
? totalPagesProp ?? (typeof totalItems === 'number' ? Math.max(1, Math.ceil(totalItems / pageSize)) : 1)
: 1;

/\*_ Compact mode heuristics: small viewport or very few pages → shrink UI _/
const containerRef = useRef<HTMLElement | null>(null);
const [compact, setCompact] = useState<boolean>(false);
useEffect(() => {
if (!containerRef.current) return;
const ro = new ResizeObserver(([entry]) => {
const w = entry.contentRect.width;
setCompact(w < compactBreakpointPx || computedTotalPages <= compactMinPages);
});
ro.observe(containerRef.current);
return () => ro.disconnect();
}, [compactBreakpointPx, computedTotalPages]);

const items: PaginationItem[] = useMemo(() => {
if (variant === 'cursor') {
// Cursor model: only prev/next
return [
{ key: 'prev', type: 'prev', disabled: disabled || !hasPrev, rel: 'prev' },
{ key: 'next', type: 'next', disabled: disabled || !hasNext, rel: 'next' }
];
}

    const sc = compact ? Math.min(1, siblingCount) : siblingCount;
    const bc = compact ? 1 : boundaryCount;
    return buildPageItems({
      page: Math.min(Math.max(1, currentPage), computedTotalPages),
      totalPages: computedTotalPages,
      siblingCount: sc,
      boundaryCount: bc,
      showFirstLast: showFirstLast && !compact, // hide first/last in compact
      showPrevNext
    });

}, [
variant, compact, siblingCount, boundaryCount,
currentPage, computedTotalPages,
showFirstLast, showPrevNext, disabled, hasPrev, hasNext
]);

// Navigation API
const goTo = useCallback((n: number) => {
if (variant !== 'pages') return;
const next = Math.min(Math.max(1, n), computedTotalPages);
if (!isControlled) setInternalPage(next);
onPageChange?.(next);
}, [variant, computedTotalPages, isControlled, onPageChange]);

const prev = useCallback(() => {
if (variant === 'cursor') return onPrev?.();
goTo(currentPage - 1);
}, [variant, currentPage, goTo, onPrev]);

const next = useCallback(() => {
if (variant === 'cursor') return onNext?.();
goTo(currentPage + 1);
}, [variant, currentPage, goTo, onNext]);

return {
containerRef,
items,
page: currentPage,
totalPages: computedTotalPages,
pageSize,
variant,
compact,
goTo,
prev,
next,
disabled: !!disabled
};
}

⸻

Context & provider

PaginationProvider.tsx

import React, { createContext, useContext, useMemo } from 'react';
import { usePagination } from './usePagination';
import type { PaginationProps } from './types';

const Ctx = createContext<ReturnType<typeof usePagination> | null>(null);
export const usePaginationCtx = () => {
const c = useContext(Ctx);
if (!c) throw new Error('Pagination components must be used within <PaginationProvider>');
return c;
};

export function PaginationProvider({ children, ...props }: React.PropsWithChildren<PaginationProps>) {
const api = usePagination(props);
const value = useMemo(() => api, [api]);
return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

⸻

Visual scaffold & subcomponents

Pagination.tsx

import React from 'react';
import { usePaginationCtx } from './PaginationProvider';
import styles from './Pagination.module.scss';
import { PageButton } from './PageButton';

export function Pagination({ className }: { className?: string }) {
const pg = usePaginationCtx();
const cls = [styles.root, pg.compact && styles.compact, className].filter(Boolean).join(' ');

return (

<nav className={cls} aria-label="Pagination" ref={el => (pg.containerRef.current = el)}>
<ul className={styles.list} role="list">
{pg.items.map(item => (
<li key={item.key} className={styles.item}>
<PageButton item={item} />
</li>
))}
</ul>
</nav>
);
}

PageButton.tsx

import React from 'react';
import { usePaginationCtx } from './PaginationProvider';
import type { PaginationItem } from './usePagination';
import styles from './Pagination.module.scss';

export function PageButton({ item }: { item: PaginationItem }) {
const pg = usePaginationCtx();

if (item.type === 'ellipsis') {
return <span className={styles.ellipsis} aria-hidden="true">…</span>;
}

const isNumber = item.type === 'page';
const label =
item.type === 'first' ? 'First page' :
item.type === 'prev' ? 'Previous page' :
item.type === 'next' ? 'Next page' :
item.type === 'last' ? 'Last page' :
`Page ${item.page}`;

const ariaCurrent = isNumber && item.selected ? ('page' as const) : undefined;

const onClick = () => {
if (item.disabled) return;
switch (item.type) {
case 'first': return pg.goTo(1);
case 'prev': return pg.prev();
case 'next': return pg.next();
case 'last': return pg.goTo(pg.totalPages);
case 'page': return pg.goTo(item.page!);
}
};

return (
<button
type="button"
className={[
styles.button,
item.selected && styles.selected,
item.disabled && styles.disabled
].filter(Boolean).join(' ')}
onClick={onClick}
disabled={item.disabled || pg.disabled}
aria-label={label}
aria-current={ariaCurrent}
rel={item.rel}
data-type={item.type} >
{isNumber ? item.page : iconFor(item.type)}
</button>
);
}

// You'd swap these for your Icon primitives
function iconFor(t: string) {
if (t === 'prev') return '‹';
if (t === 'next') return '›';
if (t === 'first') return '«';
if (t === 'last') return '»';
return '';
}

Optional slots

// RangeSummary.tsx
import React from 'react';
import { usePaginationCtx } from './PaginationProvider';

export function RangeSummary({ totalLabel = 'of' }: { totalLabel?: string }) {
const { page, pageSize, totalPages } = usePaginationCtx();
const start = (page - 1) _ pageSize + 1;
const end = Math.min(page _ pageSize, pageSize _ totalPages);
const totalItems = pageSize _ totalPages; // if exact total unknown, this is an upper bound
return <span aria-live="polite">{start}–{end} {totalLabel} {totalItems}</span>;
}

// PageInput.tsx – direct jump
import React, { useState } from 'react';
import { usePaginationCtx } from './PaginationProvider';

export function PageInput() {
const { page, totalPages, goTo } = usePaginationCtx();
const [val, setVal] = useState(page.toString());
return (

<form onSubmit={(e) => { e.preventDefault(); const n = Number(val|0); if (n) goTo(n); }}>
<label className="sr-only" htmlFor="goto">Go to page</label>
<input id="goto" inputMode="numeric" pattern="[0-9]\*" value={val} onChange={(e)=>setVal(e.target.value)} />
<span aria-hidden="true">/ {totalPages}</span>
<button type="submit">Go</button>
</form>
);
}

// PageSizeSelect.tsx
import React from 'react';
import { usePaginationCtx } from './PaginationProvider';
export function PageSizeSelect({ options = [10, 25, 50, 100], onChange }: { options?: number[]; onChange?: (n:number)=>void }) {
const { page, pageSize, goTo } = usePaginationCtx();
return (
<select
aria-label="Items per page"
value={pageSize}
onChange={(e) => {
const nextSize = Number(e.currentTarget.value);
onChange?.(nextSize);
// Optional policy: keep first item of current page visible
const firstItemIndex = (page - 1) \* pageSize + 1;
const newPage = Math.max(1, Math.ceil(firstItemIndex / nextSize));
goTo(newPage);
}} >
{options.map(n => <option key={n} value={n}>{n} / page</option>)}
</select>
);
}

⸻

Styles & tokens (essentials)

/_ Pagination.module.scss _/
@import './Pagination.tokens.generated.scss';

.root { display: flex; align-items: center; gap: var(--pagination-gap-x); }
.list { display: inline-flex; list-style: none; padding: 0; margin: 0; gap: var(--pagination-gap-x); }
.item { display: contents; }

.button {
min-width: var(--pagination-min-size);
height: var(--pagination-min-size);
padding: 0 var(--pagination-pad-x);
border-radius: var(--pagination-radius);
border: 1px solid var(--pagination-border);
background: var(--pagination-bg);
color: var(--pagination-fg);
}
.button:hover:not(:disabled) { background: var(--pagination-bg-hover); }
.button:focus-visible { outline: none; box-shadow: 0 0 0 3px color-mix(in oklab, var(--pagination-focus) 30%, transparent); }
.selected { background: var(--pagination-selected-bg); border-color: var(--pagination-selected-border); color: var(--pagination-selected-fg); }
.disabled { opacity: .5; cursor: not-allowed; }

.ellipsis { min-width: var(--pagination-min-size); text-align: center; color: var(--pagination-fg-muted); }

.compact .button[data-type='first'],
.compact .button[data-type='last'] { display: none; }

// Pagination.tokens.json
{
"component": {
"pagination": {
"gap": { "x": "{space.100}" },
"radius": "{radius.md}",
"minSize": "32px",
"pad": { "x": "{space.150}" },
"color": {
"bg": "{color.background.surface}",
"bgHover": "{color.background.subtle}",
"fg": "{color.foreground.default}",
"fgMuted": "{color.foreground.muted}",
"border": "{color.border.subtle}",
"focus": "{color.border.focus}",
"selectedBg": "{color.brand.50}",
"selectedBorder": "{color.brand.300}",
"selectedFg": "{color.brand.900}"
}
}
}
}

⸻

Usage

Numeric pages (known totals)

import {
PaginationProvider, Pagination, RangeSummary, PageInput, PageSizeSelect
} from '@/ui/components/Pagination';

export function ResultsFooter({ totalItems }: { totalItems: number }) {
const [page, setPage] = React.useState(1);
const [size, setSize] = React.useState(25);

return (
<PaginationProvider
      variant="pages"
      totalItems={totalItems}
      pageSize={size}
      page={page}
      onPageChange={setPage}
      siblingCount={1}
      boundaryCount={1}
      showFirstLast
    >

<div className="footer">
<RangeSummary />
<Pagination />
<PageSizeSelect onChange={setSize} />
<PageInput />
</div>
</PaginationProvider>
);
}

Cursor model (unknown totals, e.g., infinite scroll fallback header)

export function CursorPager({ hasPrev, hasNext, onPrev, onNext }: any) {
return (
<PaginationProvider variant="cursor" hasPrev={hasPrev} hasNext={hasNext} onPrev={onPrev} onNext={onNext}>
<Pagination />
</PaginationProvider>
);
}

⸻

A11y & UX invariants (guardrails) 1. Landmark + list semantics
• Root is <nav aria-label="Pagination">, children are <ul role="list"> with <li> items.
• Current page button has aria-current="page".
• “Prev/Next” buttons include rel="prev|next" for link renderers and SEO. 2. Keyboard behavior
• Tab moves into the nav; arrow keys are not roved by default (pagination isn’t a composite widget).
• Activate with Space/Enter; ensure hit area meets 44×44 dp on touch targets (tokenized minSize). 3. Ellipses
• Render as inert text … with aria-hidden="true"; keyboard should skip over them. 4. Compact mode
• Below compactBreakpointPx or if totalPages <= compactMinPages, reduce visual complexity: hide first/last, clamp siblingCount to 1, keep prev/next visible. 5. Responsiveness
• The component observes its own width via ResizeObserver rather than viewport only; it adapts when placed in narrow panels. 6. Localization
• Supply localized labels for Prev/Next/First/Last; numeric labels use "Page N" for SR text (override via props if needed). 7. Server round-trip safety
• Disable buttons while a page fetch is in flight to prevent multi-click double requests. You can pass disabled at the provider level during pending state. 8. SEO / link rendering (optional)
• If you render <a href="?page=N">, keep button semantics for a11y (or use <Link> with role="button"> policy); maintain rel attributes.

⸻

Failure-mode notes & policies
• Edge pages: The algorithm clamps to [1, totalPages]; prev/first disabled at page 1; next/last disabled at totalPages.
• Huge totals: With siblingCount=1 and boundaryCount=1, visible numbers stay O(1): first, …, page-1, page, page+1, …, last.
• Unknown totals: Use variant="cursor"; don’t fake counts. It prevents misleading UX and heavy queries just to compute totals.
• Page size changes: The sample policy keeps the first visible item stable across size changes; adjust if your product prefers goTo(1) on size change.
• URL sync: Keep page in the URL (e.g., ?page=3) for deep links; the provider stays controlled via page/onPageChange.

⸻

Validator invariants (for your repo script)
• Composer exports: PaginationProvider, Pagination, PageButton, RangeSummary, PageInput, PageSizeSelect.
• Uses tokens from Pagination.tokens.generated.scss; no hardcoded colors.
• Root contains <nav aria-label=…> and child <ul role="list">.
• Numeric model: ellipsis items render with aria-hidden="true".
• Compact policy present: either through width observer or min-page clamp.
• Cursor model supported: variant="cursor" only shows Prev/Next and honors hasPrev/hasNext.

⸻

Why this fits your system lens
• It’s a composer that turns a dense set of UX rules (overflow, compaction, counts, a11y, and two pagination paradigms) into a single orchestration point.
• Headless logic gives you a stable item model the UI can skin with your Button/Link primitives; tokens make parity across brands straightforward.
• The compact/overflow policy acts like the toolbar’s priority rules but translates to page windows & ellipses—teams can’t “invent” pagination variants that drift from app conventions.

If useful next, I can add:
• A test matrix (Playwright) covering: boundaries, compact switching, ellipsis placement, rel attributes, and cursor mode.
• A Link-renderer variant of PageButton for SSR/Next.js routing, including aria-current and rel.
• A “sticky footer” example that pairs RangeSummary + PageSizeSelect with the main Pagination and demonstrates disabled state during async fetch.
