Purpose

This document defines how coding agents should classify, structure, and validate components in the design system. It encodes system-thinking heuristics (primitives → compounds → composers → assemblies) and ties them to enforceable file standards, meta-patterns, and validation rules.

The goal: anticipate complexity before it manifests in code.

⸻

1. Component Layer Classification

Agents must classify each new component into one of four layers. This determines scope, file structure, and props strategy.

Primitive
• Examples: Button, Input, Checkbox, Icon
• Definition: irreducible building blocks, stable and boring.
• Rules:
• Must use design tokens (no hardcoded values).
• Minimal props: only intrinsic variations (size, state, type).
• Accessibility required (labels, ARIA, keyboard support).
• Structure: single file + tokens; no Provider or context.

⸻

Compound
• Examples: TextField (input + label + error), TableRow
• Definition: predictable bundles of primitives.
• Rules:
• Encodes conventions: what sub-parts exist, what variations are blessed.
• Props surface narrow customization. Avoid wcombinatorial explosion.
• Structure: colocated sub-components (TextField.Label.tsx), re-export via index.tsx.

⸻

Composer
• Examples: Modal, Popover, Form, MessageComposer
• Definition: orchestrates interaction, state, and context.
• Rules:
• Must separate logic and presentation.
• Must provide a Provider + context for orchestration.
• Must support slotting (header, body, footer, etc.) rather than prop explosion.
• Structure:
• useComponentLogic.ts (state/behavior)
• Provider.tsx (context orchestration)
• ComponentName.tsx (visual scaffolding)

⸻

Application-Specific Assembly
• Examples: CheckoutFlow, ProjectBoard, AnalyticsDashboard
• Definition: product-level containers, not universal system parts.
• Rules:
• Lives in /apps or /features, never in system root.
• Built using primitives, compounds, and composers.
• Structure: follows feature conventions; exempt from strict DS validation.

⸻

2. Meta-Patterns to Enforce

Agents must check for the following strategies across all components:

Boolean Prop Detection
• Signal: More than 3-4 boolean props indicates composition is needed.
• Fix: Extract variants into child components or slots.
• Example: `<Modal isEdit isThread isForward />` → `<Modal.Thread><Modal.Edit /></Modal.Thread>`

Slotting & Substitution
• Anticipate custom regions (children, slots, render props).
• Prefer explicit composition over hidden conditionals.
• JSX becomes the abstraction layer: render what you need, omit what you don't.

Headless Abstractions
• Logic in hooks (useComponent.ts), presentation in .tsx.
• Makes behavior testable and UI swappable.
• Critical for composers that orchestrate complex state.

Contextual Orchestration
• Composers must provide context rather than relying on deeply nested props.
• Provider pattern enables "regular composer + tiny addition" vs "regular composer + dozen conditions."
• State location becomes explicit and liftable.

⸻

3. Standard File Structure

Every component folder follows this structure:

ComponentName/
├── index.tsx # Export entry point
├── ComponentName.tsx # Visual definition
├── useComponentName.ts # Hook for logic/state (composers only)
├── ComponentName.module.scss # Styles (if applicable)
├── ComponentName.contract.json # Machine-readable contract (API, a11y, tokens)
├── ComponentName.tokens.json # Component-specific tokens
├── ComponentName.tokens.generated.scss # Auto-generated tokens (do not edit)
├── README.md # Usage, props, accessibility
├── tests/ # Required tests (unit + a11y)
└── utils/ # Optional component-specific utilities

Rules by Layer
• Primitive: no useComponentName.ts unless intrinsic state (e.g., Checkbox).
• Compound: colocated sub-components allowed.
• Composer: must include Provider.tsx + useComponentName.ts.
• Assembly: exempt, lives outside /ui/components.

⸻

4. Documentation Standards

Every component must include README.md with:
• Purpose + usage examples
• Props table with types and defaults
• Accessibility notes (labels, keyboard, screen readers)
• Design tokens consumed
• Related components

Required A11y Details (interactive components):
• ARIA role and naming strategy (aria-label/aria-labelledby)
• Keyboard map (key → action, focus origin, result)
• Focus management (initial focus, trapped focus, return focus)
• APG pattern referenced

Keyboard Map Template:

| Key         | When focus is on | Action   | Result                 | Notes         |
| ----------- | ---------------- | -------- | ---------------------- | ------------- |
| Enter/Space | root             | activate | invokes primary action | —             |
| Escape      | any              | dismiss  | closes popup/overlay   | if applicable |

⸻

5. Validation Workflow

Agents must run validation after generation:

npm run validate:components

Validation checks:
• Required files present
• Folder/file naming correct
• Design tokens referenced, not hardcoded
• TypeScript props exported with JSDoc
• README.md present and complete
• If composer → check for logic/UI separation + context provider
• Contract file present and valid schema (ComponentName.contract.json)
• A11y section complete (role, labeling, keyboard table) for interactive components
• forwardRef to the native element and stable displayName
• Styling uses tokens only (no hex/rgb literals, no hardcoded pixel values for spacing/colors)
• Data attributes represent state (e.g., data-state) where relevant
• Tests exist and pass: unit + basic axe checks

Example output:

Validating Modal
✅ Required file exists: Modal.tsx
✅ Found useModal.ts (logic separation)
✅ Found ModalProvider.tsx (context orchestration)
⚠️ README missing accessibility notes

⸻

6. Complexity Progression Signals

Agents must recognize when a component is outgrowing its current layer:

Primitive → Compound
• Signal: Need for label association, error states, help text.
• Example: `<Input />` becomes `<TextField />` with Label + Input + Error.

Compound → Composer  
• Signal: More than 4 boolean props, conditional UI logic, or state coordination.
• Example: `<Modal large closable animated />` becomes `<Modal><Modal.Header /><Modal.Body /></Modal>`

Composer → Assembly
• Signal: Deep domain logic, workflow orchestration, multiple data sources.
• Example: Generic `<Form />` becomes domain-specific `<CheckoutFlow />`

⸻

7. Teaching the Architectural Jump

Key lesson for agents: components aren't flat—they're layered. Always ask:
• What layer am I working in?
• If primitive: keep it clean, no complexity leakage.
• If compound: flexible but stable, narrow customization.
• If composer: resist prop toggles, compose from smaller parts.
• If assembly: encode product workflows, blend design and engineering.

The shift from "adding booleans" to "start composing" is the difference between implementation and architecture.

⸻

8. Example Blueprints

TextField (Compound)

TextField/
├── index.tsx
├── TextField.tsx
├── TextField.Label.tsx
├── TextField.Error.tsx
├── TextField.module.scss
├── TextField.tokens.json
└── README.md

    •	Exports sub-components via index.tsx.
    •	README documents label association + error messaging accessibility.

⸻

Modal (Composer)

Modal/
├── index.tsx
├── Modal.tsx
├── useModal.ts
├── ModalProvider.tsx
├── Modal.module.scss
└── README.md

    •	useModal manages open/close state.
    •	Modal.tsx defines slots (header, body, footer).
    •	README explains orchestration pattern, warns against over-prop’ing.

⸻

9. System Legibility Principles

The goal of composition is making systems readable—both human and machine:

Explicit Architecture
• When a composer uses explicit child components instead of hidden conditionals, you can see the architecture at a glance.
• You know where state lives, can lift it higher if needed for global sync, or keep it local if ephemeral.
• Implementation details become swappable because the interface remains stable.

Teaching Pattern Recognition
• The Slack message composer exemplifies this: looks simple, incredibly complex under the hood.
• Naive approach (boolean props) teaches what not to do.
• Compositional approach shows how to manage complexity as systems scale.

⸻

10. Agent Prompts

When generating/refactoring a component:

1. Classify: primitive / compound / composer / assembly.
2. Check for boolean prop explosion (>3-4 = composition needed).
3. Apply structure rules for that layer.
4. Enforce meta-patterns (slotting, headless, orchestration).
5. Generate files with correct names and tokens.
6. Run validation and fix errors before finalizing.
7. Document the architectural decisions in README.md.

⸻

11. Scaffold CLI (Required)

Use the scaffold CLI to create new components that conform to structure and token usage.

Usage:

```bash
# Primitive
npm run scaffold:component -- --name Button --layer primitive

# Compound
npm run scaffold:component -- --name Card --layer compound

# Composer
npm run scaffold:component -- --name Modal --layer composer

# Custom base directory
npm run scaffold:component -- --name Status --layer primitive --dir ui/components
```

Outputs (by layer):

- Primitive/Compound:
  - index.tsx
  - Component.tsx
  - Component.module.scss
  - Component.tokens.json
  - Component.tokens.generated.scss (placeholder; replaced by tokens build)
  - README.md
- Composer adds:
  - ComponentProvider.tsx
  - useComponent.ts

After scaffolding:

- Fill out tokens JSON and run `npm run tokens:build`
- Implement a11y and usage docs in README
- Run `npm run validate:components`

⸻

12. Component Contract Schema

Each component includes `ComponentName.contract.json` describing API, variants, states, slots, a11y, and tokens. This enables auto-docs, tests, and validation.

Minimum fields:
• name, layer (primitive | compound | composer | assembly)
• anatomy (slots), variants, states
• a11y: role, labeling, keyboard map, APG pattern
• tokens: per-slot token references
• ssr/hydration policy (none | interaction | immediate)
• rtl: flipping/mirroring rules

Example (abridged):

```
{
  "name": "Button",
  "layer": "primitive",
  "anatomy": ["root", "icon", "label"],
  "variants": { "variant": ["primary", "secondary"], "size": ["sm", "md", "lg"] },
  "states": ["hover", "focus", "active", "disabled", "loading"],
  "slots": { "icon": { "optional": true } },
  "a11y": {
    "role": "button",
    "labeling": ["aria-label", "aria-labelledby"],
    "keyboard": [{ "key": "Enter|Space", "when": "root", "then": "activate" }],
    "apgPattern": "button"
  },
  "tokens": { "root": ["surface.primary", "color.text.on-primary", "radius.md"] },
  "ssr": { "hydrateOn": "interaction" },
  "rtl": { "flipIcon": true }
}
```

⸻

13. Props and API Conventions

• Always `forwardRef` to the native element and export `Props` via `ComponentPropsWithoutRef<'tag'>` composition.
• Prefer enums over booleans for style choices; avoid boolean-prop explosion.
• Controlled/uncontrolled: support both with `value/onChange` + `defaultValue`; never require both.
• Polymorphic `as` prop allowed for visual primitives; disallowed for semantic form controls.
• Emit `data-*` attributes for visual state (e.g., `data-state="open|closed|loading"`).

⸻

14. Styling and Tokens

• No hardcoded colors/spacing/typography; use design tokens only.
• Favor container queries and logical properties (margin-inline, inset-inline) for responsiveness and RTL.
• Use `:where()` to keep specificity low; consider `:has()` with progressive enhancement.
• Map visual states from `data-*` attributes; avoid deep descendant selectors.

## Modern CSS Nesting Standards

We are transitioning from BEM-style naming conventions to modern CSS nesting to leverage native SCSS nesting capabilities. This approach provides better readability, maintainability, and clearer component relationships while reducing verbosity.

### Key Principles

#### 1. Leverage SCSS Nesting

Use SCSS nesting to create visual hierarchy that matches component structure:

```scss
// ✅ Modern approach
.switch {
  // Root styles

  .input {
    // Input-specific styles
  }

  .label {
    // Label-specific styles
  }

  &.sm {
    // Size modifier styles
    .input {
      /* Size-specific input styles */
    }
  }
}
```

#### 2. Semantic Class Names

Use semantic, readable class names that describe the element's purpose:

```scss
// ✅ Good
.button {
  .icon {
  }
  .text {
  }

  &.primary {
  }
  &.loading {
  }
}

// ❌ Avoid
.button {
  .button__icon {
  }
  .button__text {
  }

  &.button--primary {
  }
  &.button--loading {
  }
}
```

#### 3. Component Scope

Keep related styles grouped together under their parent component:

```scss
.card {
  // Card root styles

  .header {
    // Header styles
  }

  .body {
    // Body styles
  }

  .footer {
    // Footer styles
  }

  &.featured {
    // Featured card styles
    .header {
      /* Featured header styles */
    }
  }
}
```

### Migration from BEM

**Before (BEM):**

```scss
.switch {
  .switch__input {
  }
  .switch__label {
  }
  &.switch--sm .switch__input {
  }
}
```

**After (Modern Nesting):**

```scss
.switch {
  .input {
  }
  .label {
  }

  &.sm {
    .input {
    }
  }
}
```

### Best Practices

#### 1. Nesting Depth

- **Limit to 3-4 levels** maximum
- **Use `&` for modifiers** to keep specificity low
- **Break into separate classes** for complex components

#### 2. Specificity Management

- **Use `&` for modifiers** instead of deep selectors
- **Avoid over-nesting** that increases specificity
- **Use CSS custom properties** for theming

#### 3. Component Organization

- **Group related styles** together
- **Use comments** to separate logical sections
- **Put modifiers after base styles**

### Common Patterns

#### Size Variants

```scss
.component {
  &.sm {
    /* Small size styles */
  }
  &.md {
    /* Medium size styles */
  }
  &.lg {
    /* Large size styles */
  }
}
```

#### State Modifiers

```scss
.component {
  &.loading {
    /* Loading state */
  }
  &.error {
    /* Error state */
  }
  &.disabled {
    /* Disabled state */
  }
}
```

#### Complex Components

```scss
.modal {
  .overlay {
    /* Overlay styles */
  }
  .content {
    /* Content styles */
  }
  .header {
    /* Header styles */
  }
  .body {
    /* Body styles */
  }
  .footer {
    /* Footer styles */
  }

  // Size variants
  &.sm {
    .content {
      width: 400px;
    }
  }
  &.lg {
    .content {
      width: 800px;
    }
  }

  // States
  &.open {
    .overlay {
      opacity: 1;
    }
  }
}
```

### Benefits

- **Better Readability**: Visual hierarchy matches component structure
- **Improved Maintainability**: Changes are localized to component scope
- **Modern CSS Features**: Leverages native SCSS nesting
- **Reduced Bundle Size**: Shorter class names and better compression

### Implementation Guidelines

- **New Components**: Use modern nesting for all new components
- **Existing Components**: Migrate high-traffic components first, maintain backward compatibility during transition
- **Legacy Cleanup**: Remove old BEM classes once migrated and update any hardcoded class references

⸻

15. Performance and SSR/Hydration

• Primitives default to server components; composers are client when interaction demands.
• Hydration policy from contract: `none`, `interaction`, or `immediate`.
• Budget JS for primitives; avoid layout thrash (prefer transform/opacity).
• Lazy-load heavy composers; split logic and presentation to minimize updates.

⸻

16. Testing Requirements

• Unit tests: render, variants, ref forwarding, controlled/uncontrolled.
• A11y tests: axe checks, keyboard navigation for interactives.
• Token usage snapshots to guard against accidental hardcoding.

⸻

17. Internationalization and RTL

• Use logical CSS properties; avoid left/right unless intentional.
• Contract specifies mirroring and icon flipping.
• Props for localized labels; avoid embedding language in icons.

⸻

18. Deprecation and Change Management

• Document breaking changes in `deprecations.md` per component.
• Provide runtime warnings for deprecated props during a transition window.

⸻

19. Contribution and CI

• Pre-commit: run `validate:components` and fast a11y checks.
• PR checklist: contract present, APG/keyboard documented, tokens verified, tests added, docs updated.

⸻
