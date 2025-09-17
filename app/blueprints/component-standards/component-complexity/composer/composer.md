⸻

Deep Dive: Composers

Why Composers Exist

Primitives give us atoms, compounds give us molecules — but product interfaces demand more. A composer is where a design system stops bundling parts and starts orchestrating interaction and state.

Think of a modal, a toolbar, pagination, or a form fieldset. These aren’t just bundles of primitives — they coordinate:
• Multiple states (open/closed, selected/unselected, error/valid).
• Multiple flows (keyboard vs mouse, small vs large screen, logged in vs logged out).
• Multiple roles (what happens to focus, what gets announced to a screen reader, what rules apply when contents vary).

Composers exist because user interactions don’t stop at a single element — they span across elements.

⸻

Characteristics of Composers
• Orchestration: manage focus, context, and state for child primitives/compounds.
• Slotting: expose defined areas (header, body, footer, actions) for flexible composition.
• Variation by pattern, not prop: handle families of behavior (e.g., ellipses in pagination) rather than a Boolean soup of configuration.
• Context Providers: share state between sub-parts without forcing prop-drilling.

⸻

Examples of Composers
• Modal: orchestrates open/close, traps focus, provides slots for header/body/footer.
• Form Field: orchestrates label, input, error messaging across multiple input types.
• Toolbar / Filter Bar: orchestrates a dynamic set of actions, priorities, and overflow menus.
• Pagination: orchestrates page numbers, overflow ellipses, compact vs full modes.
• Rich Text Editor: orchestrates schema, commands, plugins, and UI slots.

⸻

The Work of the System at the Composer Layer

1. Orchestration
   • Control state transitions (modal open → trap focus → restore focus on close).
   • Govern keyboard interaction models (arrow key navigation in toolbars, tab order in forms).
   • Provide context for sub-parts (form state, toolbar action registry).

2. Variation by Pattern
   • Instead of adding a prop for every variant, encode structural patterns.
   • Example: Pagination doesn’t expose showEllipses: boolean; it defines a policy for when ellipses appear.

3. Slots for Composition
   • Provide places for product-specific content without breaking orchestration.
   • Example: Modal slots for header/body/footer let teams add what they need while the system enforces a11y and focus rules.

⸻

Pitfalls of Composers 1. Prop Explosion as a Lazy Shortcut
• Composers often start with props for each variation: hasCloseButton, showFooter, isInline, isSticky.
• Guardrail: encode variations as structural patterns, not toggles. 2. Leaking Internal State
• If a form composer exposes internal validation state poorly, teams may hack around it.
• Guardrail: provide a clean context/hook API for internal orchestration. 3. Breaking Accessibility in the Orchestration
• Example: a modal that doesn’t trap focus or a toolbar without roving tabindex.
• Guardrail: accessibility rules must be first-class orchestration, not optional add-ons. 4. Overgeneralization
• Composers aren’t universal solutions. A “SuperModal” that tries to handle every drawer/alert/dialog variant will be brittle.
• Guardrail: scope composers to a pattern family, not the entire design problem space.

⸻

Example: Modal Composer

export interface ModalProps {
open: boolean;
onClose(): void;
children: React.ReactNode;
}

export function Modal({ open, onClose, children }: ModalProps) {
return (

<Dialog open={open} onOpenChange={onClose}>
<Dialog.Overlay className="overlay" />
<Dialog.Content className="content">
{children}
</Dialog.Content>
</Dialog>
);
}

Modal.Header = ({ children }: { children: React.ReactNode }) => (
<Dialog.Title className="header">{children}</Dialog.Title>
);

Modal.Body = ({ children }: { children: React.ReactNode }) => (

  <div className="body">{children}</div>
);

Modal.Footer = ({ children }: { children: React.ReactNode }) => (

  <div className="footer">{children}</div>
);

    •	Orchestration: open/close, overlay click, focus trap handled once.
    •	Slots: Header, Body, Footer as sub-components.
    •	Composition: teams can put whatever primitives inside, but accessibility and focus rules are enforced.

⸻

Why Composers are Critical
• They channel complexity into predictable patterns rather than scattered workarounds.
• They protect accessibility models at the multi-element level (focus, ARIA roles, keyboard models).
• They enable flexibility without chaos: slots allow teams to insert or omit, but orchestration keeps rules consistent.
• They free product teams from rebuilding orchestration logic (which is hard, error-prone, and often missed).

⸻

Summary

Composers are the system’s conductors: they coordinate state, focus, and interaction across multiple children.
• Examples: Modal, Form Field, Toolbar, Pagination, Rich Text Editor
• Work of the system: orchestration, variation by pattern, slotting, context providers
• Pitfalls: prop explosion, leaking state, accessibility drift, overgeneralization

If primitives are the boring DNA, and compounds are the grammar rules, then composers are the syntax that makes the grammar work in practice. They’re where design systems prove their worth — not just in how things look, but in how they behave.

⸻
