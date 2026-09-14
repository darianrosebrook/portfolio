# CSS Migration Playbook

How portfolio UI components are styled, scoped, and migrated. This is the
document component CSS headers cite as the migration authority.

## Component CSS pattern (QDS-style scoping)

- Each component owns `<Component>.css`, hand-authored, and
  `<Component>.tokens.css`, generated from `<Component>.tokens.json` by
  `npm run tokens:components` (never edited by hand).
- Rules are scoped with the attribute hook `[data-ds-component="Pascal"]`,
  stamped on the component root element in TSX. Class names inside the scope
  are plain semantic names (`.button`, `.primary`, `.small`) — no CSS Modules
  hashing.
- Component CSS is **intentionally unlayered**. The app ships an unlayered
  reset (`* { padding: 0; min-height: 0; }`); layered rules always lose to
  unlayered ones regardless of selector weight, so the composite
  `[data-ds-component="X"].class` selector (0,2,0) must stay unlayered to win
  that fight.
- Component-local custom properties are prefixed `--ds-<component>-`;
  global semantic/core tokens (`--semantic-*`, `--core-*`, `--font-*`) are
  referenced directly.
- `<Component>.tokens.json` holds the component token tree (DTCG-style
  `{group: {path: "{ref}"}}` values). References resolve to
  `var(--semantic-*|--core-*, <default-theme literal>)` at generation time;
  the literal comes from the first assignment in `app/designTokens.scss`.
- `<Component>.contract.json` documents token resolution entries
  (`{resolvesTo, fallback, property, layer}` or `{literal, property}`) and is
  verified against the generated tokens.css by
  `node scripts/check-contract-tokens.mjs` (wired into `npm run validate`).

## Box-model slot pattern

The shared layout override surface, adopted from the FSDS design system's
box-model primitive without its codegen rail: hand-authored CSS consumes a
component-agnostic slot pool, and each component declares its own defaults.

### The slot pool

Eleven longhand slots (see `ui/primitives/boxModel.css`):
`--ds-box-model-{padding-block-start, padding-block-end,
padding-inline-start, padding-inline-end, gap, width, min-width, max-width,
height, min-height, max-height}`.

Longhand-only by design. Shorthand and axis slots (`padding`,
`padding-block`, `padding-inline`) are excluded to avoid the
shorthand-vs-longhand cascade confusion the FSDS implementation documents;
consumers compose axis shorthands from two slots when both sides are read in
one rule (`padding-block: var(--ds-box-model-padding-block-start)
var(--ds-box-model-padding-block-end)`), which keeps each side independently
overridable.

Slot names are dimension-agnostic: consumers may spell the property
physically or logically (`width`/`inline-size`, `height`/`block-size`).

### How a component adopts

1. Add a `boxModel` group to `<Component>.tokens.json` with the component's
   default per slot (`"gap": "{core.spacing.size.04}"` or a literal like
   `"fit-content"`). Regenerate; the generator emits shared
   `--ds-box-model-<slot>` declarations scoped to the component attribute.
   Unknown slot names fail the build.
2. `@import '../../primitives/boxModel.css';` at the top of the component CSS
   (before the tokens import). The primitive resets unset slots to
   `initial` on `:where([data-ds-component])` so they fall back cleanly.
3. Replace layout declarations in the base rule with slot consumers.
   The pre-adoption computed value must become the slot default so the
   migration is a visual no-op (the artifact tests pin this).
4. Variants, container queries, and state branches re-declare **slots**
   (not properties) when they change layout, so a consumer's slot override
   stays supreme: `--ds-box-model-gap: var(--ds-button-size-gap-small);`.
   State-driven one-offs (e.g. a validation `padding-inline-end`) may stay
   as direct property declarations where the state should outrank consumer
   overrides.
5. Add matching `box-model.*` entries to the contract; the token-fidelity
   validator checks presence, reference, and fallback parity.

### Override semantics

- A consumer sets a slot **on the component element** (inline style or any
  same-element rule). That beats the scope-level default declaration and any
  variant re-declaration of lower specificity; inline style beats everything.
- Slot defaults are declared on the `[data-ds-component]` scope and inherit
  to descendants — a component may consume slots on a descendant that is its
  primary box (Dialog's panel) or on nested controls (Field's native input).
- An ancestor-level slot setting does **not** reach the element: the
  element's own default declaration (and the `initial` reset) beats
  inheritance. Override at the element, not from a wrapper.
- Slots model the component's **primary box**. Internal descendant layout
  that is not part of the component's layout identity stays on
  component-prefixed tokens.

### Reference adoptions

Button, Card, Input, Field, and Dialog are the reference migrations;
`test/unit/designTokens/boxModel.artifacts.test.mjs` pins their slot
defaults to the pre-adoption literals (visual no-op by construction) and
asserts the consumer/variant shape.
