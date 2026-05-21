# TEST-AUDIT-001 — Findings

**Audit date:** 2026-05-20
**Baseline:** 89 failed / 1194 passed / 1 skipped (1284 total)
**Scope:** all 89 failures pre-existing before the FIX-SEC-001 deps upgrade

Each item is classified as:

- **component-rewrite** — the source component is wrong (a11y gap, missing contract, stale code). Rewrite both source and test.
- **test-only** — the component is correct; the test asserts against a contract that never existed or was changed. Rewrite only the test.
- **both** — multiple failures in the same file split across the two categories.

Items are grouped by classification, then ordered roughly by impact.

---

## Component-rewrite (real bugs caught by tests)

These fix a11y gaps, broken contracts, or stale scaffolding. Rewriting only the test would mask the bug.

### Icon (4 failing)
- **Root cause:** Component renders `<span class="icon" data-ds-component="Icon">` with no `role`/`aria-label`. Tests correctly query `getByRole('img')` per ARIA pattern for non-decorative icons.
- **Component fix:** Add `role="img"` + `aria-label` props; apply `aria-hidden="true"` when no label supplied. Optional `title` prop driving SVG `<title>`.
- **Test rewrite:** Cover both labelled and decorative paths.

### Skeleton (6 failing)
- **Root cause:** Defaults `decorative={true}` → `aria-hidden="true"` on root, so `getByRole(...)` finds nothing. Also `SkeletonProps` doesn't extend `React.HTMLAttributes`, so `data-testid` and arbitrary HTML attrs aren't spread.
- **Component fix:** Flip default to `decorative={false}`; expose `role="status"` (correct ARIA for a loading placeholder, not `progressbar`); extend `HTMLAttributes` so DOM-level props pass through.
- **Test rewrite:** Use `role="status"`, not `role="progressbar"`.

### Spinner (6 failing)
- **Root cause:** `showAfterMs` defaults to 150ms; component returns `null` until timer fires. Tests don't advance timers, so DOM is empty. Component also doesn't expose `aria-busy` or `data-size`.
- **Component fix:** Default `showAfterMs` to `0`; add `aria-busy="true"`; add `data-size` attribute for styling hooks.
- **Test rewrite:** Cover both default-immediate and delayed (`showAfterMs > 0`) cases.

### AspectRatio (3 failing — 2 test-only + 1 component)
- **Component fix (1):** Add `data-ratio` attribute (human-readable string like `"16/9"`) as a debugging/styling hook. Component currently only sets inline `aspect-ratio` CSS.
- **Test rewrite (2):** Class is `container`, not `aspectRatio`.

### Popover (4 failing — 2 component + 2 test-only)
- **Component fix:** Change `aria-haspopup="true"` → `aria-haspopup="dialog"` per ARIA spec. (Portal content visibility in jsdom: needs test-side setup, not component change.)
- **Test rewrite:** `className` is applied to the container, not trigger — adjust assertions. Design-tokens test expects class `popover` but trigger has class `popoverTrigger`.

### Tabs (3 failing)
- **Root cause:** `Tabs` component wraps children in its own internal `TabsProvider` (defaulting to `'tab1'`), but tests wrap an outer `TabsProvider` with `defaultValue="one"`. The inner provider wins, so no tab is initially selected.
- **Component fix:** `Tabs` must either not create an internal provider when one already exists (use context detection), or forward all provider props from any wrapping `TabsProvider`. The double-provider is the structural bug.
- **Test rewrite:** Tests are correctly written against the documented API; keep them.

### Toast (3 failing — 2 component + 1 test-only)
- **Component fix:** Move `aria-live` from `ToastViewport` to individual `ToastItem` (polite for non-error, assertive for error). Add `data-variant` attribute on `ToastItem`.
- **Test rewrite:** "Handles multiple toast types" — error variant uses `role="alert"`, not `role="status"`; test must query both roles.

### Field (3 failing — 1 component + 2 test-only)
- **Component fix:** Add explicit `aria-live="polite"` to `ErrorText` (since `role="alert"` doesn't set the HTML attribute, only implies it).
- **Test rewrite:** Controlled/uncontrolled test misuses `rerender` with fresh provider identity — rewrite as separate `render` calls. Design-tokens test uses wrong class selector (`field` vs `root`).

### Calendar (4 failing)
- **Root cause:** Component is explicitly marked `@status SCAFFOLD`. Renders bare `<div>` with no `role`/`aria-label`. All 4 tests query APG-correct `role="application"` + `aria-label="Calendar"`.
- **Component fix:** Minimally add `role="application"` and `aria-label="Calendar"` to unblock tests. Full APG calendar (grid, nav, date cells) is a separate larger task — file a follow-up spec.
- **Test rewrite:** Keep them; they're targeting the right contract.

### Details (2 failing — 1 component + 1 test-only)
- **Component fix:** Add explicit `hidden={!isOpen}` to content `<div>` so jsdom can assert collapsed state (don't rely on UA stylesheet).
- **Test rewrite:** Keyboard navigation test should focus `<summary>`, not `<details>` — per HTML spec, summary is the focusable element.

### SlinkyCursor (3 failing)
- **Root cause:** Component calls `useInteraction()` without provider; throws on mount. Tests render bare.
- **Decision needed:** Either tests should wrap in `<InteractionProvider>` (test-only fix), OR component should handle missing context gracefully (component fix). Recommend: tests wrap — the context dependency is a real architectural requirement, not a defect.
- **Reclassify if you prefer:** This could be test-only depending on stance. Default plan: test wrap.

### useOTP / OTP page-level (3 + 2 failing)
- **Component fix (`utils/useOTP.ts`):** `clearChar` and `handlePaste` have stale-closure bugs — they capture initial `chars` instead of latest state. Switch to functional state updates or `useRef` for latest value.
- **Test rewrite:** Keep tests; they assert correct semantics. Page-level paste test needs source to be fixed first.

### Truncate (1 failing — `UtilityComponents.test.tsx`)
- **Component fix:** `Truncate` does not set `style={{ '--truncate-lines': lines }}` — add it so the CSS variable is present.
- **Test rewrite:** Already correct.

### ErrorBoundary (1 failing)
- **Component fix:** `resetErrorWithDelay` has 100ms timeout that's unnecessary for the "Try Again" button (only "Retry in 3s" needs delay). Inline reset; keep delay only on countdown path.
- **Test rewrite:** Already correct.

### componentContractSchema (2 failing)
- **Component fix (`app/component.contract.schema.json`):**
  1. Add `schemaVersion` as allowed string property at root (currently rejected by `additionalProperties: false`).
  2. `tokens` definition is too flat — make it recursive so nested group objects (e.g. `{ layout: { fixedWidth: {...} } }`) validate.
- **Test rewrite:** Tests assert correct evolved contract; keep them.

### designTokens (5 failing)
- **Component fix (`utils/designTokens.ts`):**
  1. `determineNamespace` always returns `'semantic'` as default → produces `--semantic-brand-button-bg` instead of `--brand-button-bg`. Return `''` for non-`core`/`non-semantic` paths.
  2. `builtInTransforms` has 6 entries; test asserts 5 — decide which is correct (likely add the missing one or remove `shadow` if unintended).
  3. `systemTokenPrefix` and `referenceNamespace` config options not threaded through `resolveInterpolated` fallback-chain path. Thread them in.
- **Test rewrite:** Update transform-count assertion to match the decided number.

### Tabs note
See above; listed once under component-rewrite.

---

## Test-only (component is correct; test is stale or wrong)

These can be fixed by editing the test alone.

### Text (4 failing)
- Component uses CSS class names (`body`, `md`, `color-default`) and root class `body md weight-normal`.
- **Test fix:** Replace `toHaveAttribute('data-variant', ...)` with `toHaveClass('body')`, etc.

### Truncate (2 failing in `ui/components/Truncate/tests/`)
- `getByText(...)` finds inner `<span class="content">`, not the outer wrapper that carries `custom-class` and `truncate` classes.
- **Test fix:** Query outer wrapper via `data-ds-component="Truncate"` or `.closest('[data-ds-component="Truncate"]')`.

### Progress (2 failing)
- Component uses CSS classes (`circular`, `lg`); test asserts `data-variant` / `data-size` attributes.
- **Test fix:** Switch to `toHaveClass`.

### Command (2 failing)
- Group headings render `'File'` and `'Navigation'` (uppercase is CSS-only). Keyboard nav test expects `mockItems[0].onSelect` after one ArrowDown + Enter, but ArrowDown advances from 0 → 1.
- **Test fix:** Use case-insensitive matcher; correct keyboard nav expectation to `mockItems[1].onSelect` (or remove the ArrowDown).

### Avatar (3 failing)
- Tests query `getByText('JD')` (inner span), expect Next/Image to preserve raw `src`, and check `data-size` attribute.
- **Test fix:** Query outer container; check `alt` attribute or `data-slot` instead of raw src; switch to `toHaveClass('large')` for size.

### Button (2 failing)
- Component uses CSS classes for variant/size; test asserts `data-variant` / `data-size`.
- **Test fix:** Switch to `toHaveClass`.

### TextField (2 failing)
- Test asserts `aria-labelledby` on input; component uses native `htmlFor`/`id` pairing (which is already tested elsewhere in the same file).
- **Test fix:** Drop the `aria-labelledby` assertion.

### Image (2 failing)
- `className` is on wrapper `<div>`, not on `<img>`. `aspectRatio` is a style + class, not `data-aspect-ratio`.
- **Test fix:** Query the container; check style or class instead of data attribute.

### Links (4 failing)
- Animated `Links` renders each text in two `<span>` elements (`.text` + `.clone[aria-hidden]`), so `getByText` finds multiples.
- **Test fix:** Use `getAllByText` or `getByRole('link', { name: ... })`. Check class on `<a>`, not inner span. Use `.closest('a')` for href.

### Shuttle (2 failing)
- `getByText('Item')` finds inner `<div class="item">`; outer wrapper carries `custom-class` and `shuttle`.
- **Test fix:** Query container via `data-ds-component="Shuttle"`.

### PageTransition (1 failing)
- Component doesn't spread extra props (`data-testid` doesn't pass through). The component **could** be rewritten to spread `...rest`, but it has an explicit prop interface and intentionally controls what it accepts.
- **Decision:** Test-only fix — query via existing `data-ds-component="PageTransition"`.
- (If you prefer the component to spread, this becomes component-rewrite.)

### Postcard (1 failing)
- Test expects class `postcard`; component sets class `post`.
- **Test fix:** `toHaveClass('post')`.

### OTP composer (2 failing — `ui/components/OTP/tests/OTP.test.tsx`)
- Test renders `<OTP />` bare and queries `getAllByRole('textbox')`. Composer is a container-only `<div role="group">` that requires child `<OTPInput>` slot components.
- **Test fix:** Render with slot children, OR change assertions to match the bare container.

### AlertNotice composer (2 failing)
- Test expects `data-level="inline"`; component applies `level` as a CSS class. Test expects class `alertNotice`; component uses `alert`.
- **Test fix:** `toHaveClass('inline')`, `toHaveClass('alert')`.

### AlertNotice page (1 failing)
- Test expects BEM `alert__page--warning`; component emits flat `alert page warning`.
- **Test fix:** Update regex from `/alert__page/` to `/page/`, etc.

### Walkthrough (1 failing)
- Outside-click handler is correct, but the popover has a 150ms leaving animation. Test asserts synchronously.
- **Test fix:** Use `await waitFor(...)` or `vi.useFakeTimers()` + `vi.runAllTimers()`.

### DocVariants URL (1 failing)
- Test queries `getByRole('button')`; component renders links, not buttons.
- **Test fix:** Use `getAllByRole('link')` or add `data-testid`.

---

## Summary stats

| Classification     | Failing tests | Components/files affected |
| ------------------ | ------------- | ------------------------- |
| component-rewrite  | ~46           | 16                        |
| test-only          | ~43           | 16                        |
| **Total**          | **89**        | **~32**                   |

## Notable themes

1. **a11y gaps** dominate the component-rewrite bucket: missing `role`, missing `aria-live`, missing `aria-busy`, hardcoded `aria-haspopup="true"` instead of `"dialog"`. Tests caught real defects.
2. **Stale `data-*` attribute conventions** dominate the test-only bucket: tests written assuming a `data-variant` / `data-size` API that the codebase moved away from (toward CSS-class-driven styling).
3. **Stale-closure bugs** in `useOTP` (component side) — clear signal that the hook needs a refactor to functional state updates.
4. **Schema/util drift**: `designTokens` and `componentContractSchema` tests are asserting against an evolved contract the source hasn't caught up to.
5. **Tabs double-provider** is an architectural issue worth flagging — anyone using `<Tabs>` inside a custom `<TabsProvider>` today is silently getting the inner provider's defaults.

## Working order (suggested)

1. **Phase 1 — utils & schemas** (low blast radius): `useOTP`, `designTokens`, `componentContractSchema`. These have downstream consumers.
2. **Phase 2 — a11y component fixes** (medium blast): Icon, Spinner, Skeleton, Popover, Toast, Field, Calendar, Details. Each is self-contained.
3. **Phase 3 — Tabs structural fix** (higher blast): the double-provider needs care to not regress other consumers.
4. **Phase 4 — test-only sweep** (mechanical): the ~43 test-only fixes in a single PR.

## Out of scope (won't fix here)

- Calendar full APG implementation — file separate `FEAT-CALENDAR-001`. This spec only does the minimal `role`/`aria-label`.
- SlinkyCursor reclassification: defaulting to test-only (wrap in provider). If preference shifts to graceful-degradation in the component, reclassify.
