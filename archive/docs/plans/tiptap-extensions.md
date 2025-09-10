# Tiptap Extensions Implementation Plan

> Status: Core v3 extensions added; Pro equivalents localized. Tests added.

## Goals

- Align with Tiptap v3 and avoid v2 Pro packages
- Localize missing Pro features: Details, TOC, UniqueId, DragHandle
- Use design tokens; avoid hard-coded colors
- Add tests for critical behaviors

## Changes

- Added Focus and Dropcursor v3 in `modules/Tiptap/extensions.ts`
- Local extensions:
  - `Details` with React NodeView and commands
  - `TableOfContents` with live update and scroll-to
  - `UniqueId` with collision-free IDs for headings
  - `DragHandle` decoration-based handle
- Replaced hard-coded colors with CSS variables
- Removed duplicate Details files in `modules/Tiptap/Extensions/`
- Removed `@tiptap-pro/*` deps from `package.json`
- Tests: `UniqueIdExtension.test.ts`, `TableOfContentsExtension.test.ts`

## Next

- Consider slash commands for inserting Details/TOC nodes
- Accessibility audit for keyboard navigation of drag handles

## Files

- `modules/Tiptap/extensions.ts`
- `modules/Tiptap/Extensions/*`
- `test/components/*`
