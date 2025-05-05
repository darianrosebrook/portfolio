# Blueprints Hero Animation Unification Plan

> **Status:**
> Implementation complete, pending review and testing.

## Goal

Unify and simplify the mouse/scroll animation logic in hero components (Blueprints, Swatches) by using a single source of truth from InteractionContext, reducing duplication and improving maintainability.

---

## Current State

- **Blueprints** and **Swatches** both use `useInteraction` for mouse, scroll, and window state.
- Blueprints had custom logic for `hasMouseMoved` and fallback to scroll-based animation; Swatches did not.
- Both components had similar but duplicated animation loop logic.

---

## Problems Identified

- **Duplication:** Animation/fallback logic was repeated and inconsistent.
- **Maintainability:** Any change to interaction logic required updating multiple places.

---

## Refactor Plan

1. **Add `hasMouseMoved` to MouseState in context**
   - [x] Update MouseState type and context logic.
2. **Refactor Blueprints and Swatches**
   - [x] Use `hasMouseMoved` from context for unified fallback logic.
   - [x] Remove local type extensions and ad-hoc logic.
   - [x] Use safe defaults and early returns.
3. **Document and Test**
   - [x] Create this plan file.
   - [x] Confirm both components animate correctly with mouse and scroll, including during scroll events.

---

## Code References

- **InteractionContext:**
  - Now provides `hasMouseMoved` in mouse state.
- **Blueprints/Swatches:**
  - Both use unified fallback logic for animation.
  - Animation now continues during scroll events.
