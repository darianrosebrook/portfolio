Excellent—these two are “simple on the surface, tricky in the details.” Below is a pair of components that follow the layered system lens and the agents.md rules:
• Spinner → Primitive (irreducible indicator; stable, boring, accessible)
• Skeleton → Compound (bundles primitives/shapes; presets for text, media, dataviz; orchestrates animation variants but remains presentational/headless with no data logic)

Both share tokens for animation, color stops, and radii; both observe reduced-motion/contrast; both avoid layout shifts and respect container context.

⸻

Spinner (Primitive)

Folder

Spinner/
├── index.tsx
├── Spinner.tsx
├── Spinner.module.scss
├── Spinner.tokens.json
├── Spinner.tokens.generated.scss
└── README.md

API (minimal, intrinsic variation only)

export interface SpinnerProps {
/** Size token key or explicit px (e.g., 16, 20, 24). Default: 'md' \*/
size?: 'xs' | 'sm' | 'md' | 'lg' | number;
/** Stroke thickness token or px. Default: 'regular' _/
thickness?: 'hairline' | 'regular' | 'bold' | number;
/\*\* Visual: 'ring' (conic), 'dots' (3-dot), 'bars' (12 bars) _/
variant?: 'ring' | 'dots' | 'bars';
/** If purely decorative, set ariaHidden; else provide label \*/
ariaHidden?: boolean;
/** Localized label for SR users; ignored if ariaHidden _/
label?: string; // e.g., "Loading data"
/\*\* Inline layout (align with text baseline) _/
inline?: boolean;
/\*_ Delay (ms) before showing, to avoid spinner-flash on super-fast ops _/
showAfterMs?: number; // default 150
className?: string;
}

Component

import React, { useEffect, useMemo, useState } from 'react';
import styles from './Spinner.module.scss';

export const Spinner: React.FC<SpinnerProps> = ({
size = 'md',
thickness = 'regular',
variant = 'ring',
ariaHidden,
label = 'Loading',
inline = false,
showAfterMs = 150,
className,
}) => {
const [visible, setVisible] = useState(showAfterMs === 0);

useEffect(() => {
if (showAfterMs === 0) return;
const t = setTimeout(() => setVisible(true), showAfterMs);
return () => clearTimeout(t);
}, [showAfterMs]);

const styleVars = useMemo(() => {
const s = typeof size === 'number' ? `${size}px` : `var(--spinner-size-${size})`;
const t = typeof thickness === 'number' ? `${thickness}px` : `var(--spinner-thickness-${thickness})`;
return { '--\_size': s, '--\_thickness': t } as React.CSSProperties;
}, [size, thickness]);

if (!visible) return null;

const commonProps = ariaHidden
? { 'aria-hidden': true }
: { role: 'status', 'aria-live': 'polite', 'aria-label': label };

const rootClass = [styles.root, inline && styles.inline, className].filter(Boolean).join(' ');

return (
<span className={rootClass} style={styleVars} {...commonProps} data-variant={variant}>
{/_ Each variant is CSS-driven for perf + theming _/}
<span className={styles.visual} />
</span>
);
};

Styles (excerpt)

@import './Spinner.tokens.generated.scss';

.root {
display: inline-block;
width: var(--\_size);
height: var(--\_size);
vertical-align: middle;
/_ prefers-reduced-motion handled below _/
}
.inline { vertical-align: baseline; }

.visual {
display: block;
width: 100%;
height: 100%;
}

/_ Variant: ring (conic-gradient wedge) _/
[data-variant='ring'] .visual {
border-radius: 999px;
background:
conic-gradient(from 0turn,
var(--spinner-color-accent) 0turn 0.25turn,
var(--spinner-color-track) 0.25turn 1turn);
-webkit-mask:
radial-gradient(farthest-side, #0000 calc(100% - var(--\_thickness)), #000 calc(100% - var(--\_thickness)));
mask:
radial-gradient(farthest-side, #0000 calc(100% - var(--\_thickness)), #000 calc(100% - var(--\_thickness)));
animation: spin var(--spinner-anim-duration) linear infinite;
}

/_ Variant: dots (3 fading dots) _/
[data-variant='dots'] .visual {
--dots-gap: var(--spinner-dots-gap);
position: relative;
}
[data-variant='dots'] .visual::before,
[data-variant='dots'] .visual::after,
[data-variant='dots'] .visual {
content: '';
position: absolute;
top: 50%; left: 50%;
width: calc(var(--\_size) / 6);
height: calc(var(--\_size) / 6);
transform: translate(-50%, -50%);
border-radius: 999px;
background: var(--spinner-color-accent);
animation: pulse var(--spinner-anim-duration) ease-in-out infinite;
}
[data-variant='dots'] .visual::before { transform: translate(calc(-50% - var(--dots-gap)), -50%); animation-delay: -0.2s; }
[data-variant='dots'] .visual::after { transform: translate(calc(-50% + var(--dots-gap)), -50%); animation-delay: 0.2s; }

/_ Variant: bars (12 spokes) _/
[data-variant='bars'] .visual {
--n: 12; /_ spokes _/
position: relative;
filter: saturate(1.05);
}
[data-variant='bars'] .visual::before {
content: '';
position: absolute; inset: 0;
background:
conic-gradient(from 0turn,
var(--spinner-color-accent) 0 10deg,
#0000 10deg 30deg);
-webkit-mask: radial-gradient(farthest-side, #000 calc(100% - var(--\_thickness)), #0000);
mask: radial-gradient(farthest-side, #000 calc(100% - var(--\_thickness)), #0000);
animation: spin var(--spinner-anim-duration) linear infinite;
}

/_ Animation + motion prefs _/
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes pulse { 0%,100%{ opacity:.3 } 50%{ opacity:1 } }

@media (prefers-reduced-motion: reduce) {
.visual, [data-variant='ring'] .visual::before { animation: none; }
[data-variant='dots'] .visual,
[data-variant='dots'] .visual::before,
[data-variant='dots'] .visual::after { animation: none; opacity: .7; }
}

Tokens

{
"component": {
"spinner": {
"size": { "xs": "12px", "sm": "16px", "md": "20px", "lg": "28px" },
"thickness": { "hairline": "2px", "regular": "3px", "bold": "4px" },
"color": { "accent": "{color.brand.500}", "track": "{color.border.subtle}" },
"dots": { "gap": "{space.100}" },
"anim": { "duration": "800ms" }
}
}
}

A11y invariants
• If it conveys loading state to AT, set role="status" + aria-live="polite" and provide a localized label.
• If purely decorative inside another control that already exposes aria-busy or “Loading…”, set ariaHidden.
• Respect prefers-reduced-motion (no infinite spin/pulse).
• Avoid audible spam: do not toggle visibility rapidly—use showAfterMs.

⸻

Skeleton (Compound)

Why Compound?
• It bundles one or more primitive shapes (rect, circle, line) and orchestrates animation variants (shimmer / masked wipes / pulse) with presets for text, actions, dataviz, media. It is still presentational (no data), but has conventions and combinators—hence compound.

Folder

Skeleton/
├── index.tsx
├── Skeleton.tsx # group wrapper + variant presets
├── SkeletonShape.tsx # primitive shape (rect/circle/line)
├── useSkeletonLayout.ts # optional: container-aware heuristics
├── Skeleton.module.scss
├── Skeleton.tokens.json
├── Skeleton.tokens.generated.scss
└── README.md

API

export type SkeletonVariant = 'block' | 'text' | 'avatar' | 'media' | 'dataviz' | 'actions';

export interface SkeletonProps {
/** Preset layout; 'block' lets you fully control shapes via children \*/
variant?: SkeletonVariant;
/** Shimmer (linear), wipe (staggered masked), or pulse (opacity) _/
animate?: 'shimmer' | 'wipe' | 'pulse' | 'none';
/\*\* Density preset for line counts/gaps in text variant _/
density?: 'compact' | 'regular' | 'spacious';
/** Aspect ratio for media/dataviz (e.g., '16/9', '1/1') \*/
aspectRatio?: string;
/** Line clamps for text variant (min..max responsive hint) _/
lines?: number | { min: number; max: number };
/\*\* Radius token for blocks/lines (falls back to component token) _/
radius?: 'sm' | 'md' | 'lg';
/** If the parent region exposes busy state; hides extra a11y output \*/
decorative?: boolean; // default true
/** Provide children Shapes to override preset \*/
children?: React.ReactNode;
className?: string;
}

export interface SkeletonShapeProps {
kind?: 'rect' | 'circle' | 'line';
width?: number | string; // px, %, ch for text-like
height?: number | string;
radius?: 'sm' | 'md' | 'lg';
/\*_ Optional per-shape delay to stagger wipes _/
delayMs?: number;
className?: string;
}

Primitive shape

import React from 'react';
import styles from './Skeleton.module.scss';

export const SkeletonShape: React.FC<SkeletonShapeProps> = ({
kind = 'rect',
width = '100%',
height,
radius,
delayMs = 0,
className,
}) => {
const style: React.CSSProperties = {
'--\_delay': `${delayMs}ms`,
'--\_radius': radius ? `var(--skeleton-radius-${radius})` : undefined,
width: typeof width === 'number' ? `${width}px` : width,
height: typeof height === 'number' ? `${height}px` : height
} as React.CSSProperties;

return (
<span
className={[
styles.shape,
styles[`kind-${kind}`],
className
].filter(Boolean).join(' ')}
style={style}
aria-hidden="true"
/>
);
};

Compound wrapper with presets

import React, { useMemo } from 'react';
import { SkeletonShape } from './SkeletonShape';
import styles from './Skeleton.module.scss';

export const Skeleton: React.FC<SkeletonProps> = ({
variant = 'block',
animate = 'shimmer',
density = 'regular',
aspectRatio,
lines = { min: 2, max: 3 },
radius,
decorative = true,
children,
className,
}) => {
const rootA11y = decorative
? { 'aria-hidden': true }
: { role: 'status', 'aria-live': 'polite', 'aria-label': 'Loading…' };

const attrs: React.HTMLAttributes<HTMLDivElement> = {
className: [styles.root, className].filter(Boolean).join(' '),
'data-animate': animate,
'data-density': density,
'data-variant': variant
};

const content = useMemo(() => {
if (children) return children;

    switch (variant) {
      case 'text': {
        const [min, max] = typeof lines === 'number' ? [lines, lines] : [lines.min, lines.max];
        // Responsive heuristic: render max lines; clamp via CSS container queries
        const count = Math.max(min, max);
        // Staggered delays to create subtle cascading wipes
        return (
          <div className={styles.stack}>
            {Array.from({ length: count }).map((_, i) => (
              <SkeletonShape
                key={i}
                kind="line"
                width={i === count - 1 ? '60%' : '100%'}
                height="1em"
                radius={radius ?? 'md'}
                delayMs={i * 60}
              />
            ))}
          </div>
        );
      }
      case 'avatar': {
        return (
          <div className={styles.row}>
            <SkeletonShape kind="circle" width={40} height={40} radius={radius ?? 'lg'} />
            <div className={styles.stack}>
              <SkeletonShape kind="line" width="80%" height="1em" delayMs={0} />
              <SkeletonShape kind="line" width="60%" height="1em" delayMs={80} />
            </div>
          </div>
        );
      }
      case 'actions': {
        return (
          <div className={styles.row} style={{ gap: 'var(--skeleton-gap-md)' }}>
            <SkeletonShape kind="rect" width={96} height={36} radius={radius ?? 'lg'} />
            <SkeletonShape kind="rect" width={120} height={36} radius={radius ?? 'lg'} delayMs={80} />
          </div>
        );
      }
      case 'media': {
        return (
          <div className={styles.media} style={{ aspectRatio: aspectRatio ?? '16/9' }}>
            <SkeletonShape kind="rect" width="100%" height="100%" radius={radius ?? 'lg'} />
          </div>
        );
      }
      case 'dataviz': {
        // Generic chart placeholder: title + plot area + legend rows
        return (
          <div className={styles.stack}>
            <SkeletonShape kind="line" width="40%" height="1.1em" />
            <div className={styles.media} style={{ aspectRatio: aspectRatio ?? '16/9' }}>
              <SkeletonShape kind="rect" width="100%" height="100%" radius={radius ?? 'md'} />
            </div>
            <div className={styles.row}>
              <SkeletonShape kind="line" width="30%" height="0.9em" delayMs={60} />
              <SkeletonShape kind="line" width="30%" height="0.9em" delayMs={120} />
              <SkeletonShape kind="line" width="30%" height="0.9em" delayMs={180} />
            </div>
          </div>
        );
      }
      default:
        return <SkeletonShape kind="rect" width="100%" height="100%" radius={radius ?? 'md'} />;
    }

}, [variant, animate, density, aspectRatio, lines, radius, children]);

return (

<div {...rootA11y} {...attrs}>
{content}
</div>
);
};

Styles (animation variants + container awareness)

@import './Skeleton.tokens.generated.scss';

.root {
--\_bg: var(--skeleton-color-base);
--\_hi: var(--skeleton-color-highlight);
--\_hi2: var(--skeleton-color-highlight-2);
--\_radius: var(--skeleton-radius-md);
--\_gap: var(--skeleton-gap-md);

display: block;
color: transparent; /_ ensure no accidental text flash _/
}

.stack { display: grid; gap: var(--\_gap); }
.row { display: flex; gap: var(--\_gap); align-items: center; min-width: 0; }
.media { width: 100%; }

.shape {
display: inline-block;
background: var(--\_bg);
border-radius: var(--\_radius);
position: relative;
overflow: hidden;
/_ base pulse for HC mode fallback _/
}

.kind-circle { border-radius: 999px; }
.kind-line { height: 1em; }

[data-animate='shimmer'] .shape::after {
content: '';
position: absolute; inset: 0;
background: linear-gradient(90deg, #0000 0%, var(--\_hi) 50%, #0000 100%);
transform: translateX(-100%);
animation: shimmer var(--skeleton-anim-duration) var(--skeleton-anim-easing) infinite;
}

[data-animate='wipe'] .shape::after {
content: '';
position: absolute; inset: 0;
background:
linear-gradient(90deg, var(--\_hi) 0%, var(--\_hi2) 50%, var(--\_hi) 100%);
mask: linear-gradient(90deg, #0000 0%, #000 10%, #000 90%, #0000 100%);
transform: translateX(-120%);
animation: wipe var(--skeleton-anim-duration-alt) var(--skeleton-anim-easing) infinite;
animation-delay: var(--\_delay, 0ms);
}

[data-animate='pulse'] .shape {
animation: pulse var(--skeleton-anim-duration-pulse) ease-in-out infinite;
}

/_ Responsive heuristics using container queries (if available) _/
@container (min-width: 480px) {
[data-variant='text'][data-density='compact'] .kind-line { height: .85em; }
[data-variant='text'][data-density='spacious'] .kind-line { height: 1.1em; }
}

/_ Motion/contrast preferences _/
@media (prefers-reduced-motion: reduce) {
.shape, .shape::after { animation: none !important; }
.shape { background: var(--skeleton-color-static); }
}

@media (prefers-contrast: more) {
.shape { background: var(--skeleton-color-contrast-base); }
}

/_ Keyframes _/
@keyframes shimmer {
to { transform: translateX(100%); }
}
@keyframes wipe {
50% { transform: translateX(120%); }
100% { transform: translateX(120%); }
}
@keyframes pulse {
0%,100% { opacity: .65; }
50% { opacity: 1; }
}

Tokens

{
"component": {
"skeleton": {
"color": {
"base": "{color.background.subtle}",
"highlight": "color-mix(in oklab, {color.background.subtle} 70%, {color.foreground.onSubtle} 5%)",
"highlight-2": "color-mix(in oklab, {color.background.subtle} 60%, {color.brand.500} 10%)",
"static": "{color.background.subtle}",
"contrast-base": "{color.border.default}"
},
"radius": { "sm": "{radius.sm}", "md": "{radius.md}", "lg": "{radius.lg}" },
"gap": { "sm": "{space.100}", "md": "{space.150}", "lg": "{space.250}" },
"anim": {
"duration": "1200ms",
"duration-alt": "1600ms",
"duration-pulse": "900ms",
"easing": "cubic-bezier(.4,0,.2,1)"
}
}
}
}

⸻

Usage patterns (and “gotchas” baked into the API)

1. Button with spinner vs skeleton
   • Spinner belongs inside actionable controls when an action is in progress (the real node exists).
   • Skeleton represents placeholder layout before data exists; don’t put skeletons inside a button that already exists—disable the button and use spinner or replace with a skeleton button only if the button is not yet in DOM.

// In-button progress (existing button node)
<button disabled aria-busy="true">
<Spinner size="sm" ariaHidden />
Saving…
</button>

// Placeholder action row (UI not yet mounted)
<Skeleton variant="actions" animate="wipe" />

2. Text content placeholder
   • Use variant="text" and let the component render max lines; clamp down via container width/density. Last line shorter for realism.

<article>
  <Skeleton variant="text" lines={{ min: 2, max: 4 }} density="regular" />
</article>

3. Dataviz placeholder with responsive ratio
   • Use aspect ratio and keep animation subtle (prefer pulse or slow wipe).

<section className="card">
  <Skeleton variant="dataviz" aspectRatio="4/3" animate="pulse" />
</section>

4. Media/card

<Card>
  <Skeleton variant="media" aspectRatio="16/9" animate="shimmer" />
  <div style={{ paddingTop: 12 }}>
    <Skeleton variant="text" lines={2} />
  </div>
</Card>

5. Custom layout with Shapes (compound but slot-friendly)

<Skeleton variant="block" animate="wipe">
  <div className="row">
    <SkeletonShape kind="circle" width={48} height={48} />
    <div className="stack">
      <SkeletonShape kind="line" width="80%" />
      <SkeletonShape kind="line" width="50%" delayMs={80} />
    </div>
  </div>
</Skeleton>

⸻

Accessibility standards (guardrails)
• Skeleton is decorative by default (aria-hidden) and should be paired with a parent region exposing busy state:
• Set aria-busy="true" on the container that will receive loaded content, or expose an off-screen live status (“Loading profile…”).
• Do not announce every skeleton line; it’s noise.
• Spinner is the announcer when it stands in for content inside a live region; otherwise set ariaHidden.
• Both components respect prefers-reduced-motion: reduce and prefers-contrast: more with token-based fallbacks.

⸻

Performance/Rendering guidance (common failure modes) 1. Avoid layout thrash: sizes are explicit (width/height or aspect-ratio). Do not animate size/position; animate opacity or transform where possible. Our shimmer/wipe animate a pseudo-element’s transform, not the layout box. 2. Keep paint areas small: long, full-viewport shimmer bars are expensive. Prefer per-shape masks; avoid animating multi-megapixel gradients. 3. Delay spinners (showAfterMs) to reduce “flash of spinner” on fast operations; skeletons usually mount with the page and can animate immediately. 4. Tokenize colors: never hardcode hexes for the highlight/track; this ensures dark mode and multi-brand parity without forking logic. 5. Container awareness: text skeleton uses lines.max and lets container width/density reduce perceived lines—no JS measurement needed. If you support CSS container queries, they’re already in the stylesheet.

⸻

Validation invariants (for your repo validator)

Spinner (Primitive)
• Required files exist (Spinner.tsx, .module.scss, .tokens.json).
• Uses tokens for size/thickness/colors; no hardcoded colors.
• Honors ariaHidden vs role="status".
• Implements showAfterMs (≥ 100ms default).

Skeleton (Compound)
• Exports Skeleton and SkeletonShape.
• variant presets include: text, avatar, media, dataviz, actions, block.
• Animation variants present: shimmer, wipe, pulse, none.
• Uses tokens for colors/stops/radius/gaps/durations.
• aria-hidden by default; documentation instructs setting aria-busy on parent region.

⸻

README starters

Spinner/README.md (excerpt)
• Purpose: primitive progress indicator for in-place, already-mounted UI.
• Props: size, thickness, variant, label, ariaHidden, showAfterMs.
• A11y: role="status" + aria-live="polite" when not decorative; avoid double announcements when enclosing region already provides status.
• Motion: honors prefers-reduced-motion.
• Examples: in-button loading, inline with text, centered page state.

Skeleton/README.md (excerpt)
• Purpose: compound placeholder for pre-mount states (text/media/dataviz/actions).
• Variants and animation modes documented with screenshots/gifs.
• A11y: decorative; pair with aria-busy on container; optional single live message at region level.
• Theming: highlight/track/radius via tokens; dark/high-contrast parity.
• Performance notes: no layout animation; masked wipes are staggered per-shape via delayMs.

⸻

Why this pairing scales across products
• A clear boundary between “content exists but busy” (spinner) and “content not yet mounted” (skeleton) keeps teams from misusing either.
• Shared token set ensures animation, color, and density feel coherent across surfaces.
• Animation variants let you increase perceived quality (staggered masked wipes) without opening the door to design drift: it’s constrained by tokens and well-named variants.
• Compound Skeleton presets meet common surfaces (text, actions, media, dataviz) while leaving escape hatches (children with SkeletonShape) for unusual layouts—no ad-hoc CSS detours.
