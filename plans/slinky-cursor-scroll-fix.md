# SlinkyCursor Scroll Integration Fix Plan

> **Status:**
> Implementation complete, pending review and testing.

## Goal

Ensure the SlinkyCursor stays visually in sync with the pointer even when the user scrolls the page.

---

## Current State

- **Component:** `components/SlinkyCursor/index.tsx`
- **Mouse Tracking:** Uses `mouse` from `useInteraction()` for x/y position.
- **Scroll Tracking:** `scroll` state is available in context but not used by SlinkyCursor.
- **Problem:** Cursor y position does not update on scroll, causing visual desync.

---

## Problem Identified

- **Desync on Scroll:** Cursor does not follow the pointer when the page is scrolled, as it only tracks mouse movement, not scroll position.

---

## Implementation Steps

1. **Update SlinkyCursor to use scroll context**
   - [x] Import `scroll` from `useInteraction()`.
   - [x] Add `scroll.y` to the calculation of the cursor's y position.
   - [x] Update animation logic to react to scroll changes.
2. **Test behavior**
   - [ ] Confirm cursor stays in sync with pointer during scroll.

---

## Code References

- **InteractionContext:**
  - Provides `mouse` and `scroll` state.
- **SlinkyCursor:**
  - Now uses both `mouse` and `scroll` for position. 