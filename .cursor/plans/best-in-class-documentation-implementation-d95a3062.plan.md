<!-- d95a3062-7f0b-477f-bfd3-e2032d64a7bc 3e3906b7-5750-44be-8a22-e09316515a07 -->

# Best-in-Class Documentation: Implementation Plan

## Overview

This plan addresses all gaps identified in the progress assessment to achieve best-in-class documentation. The work is organized into 4 milestones that build on each other, focusing on wiring existing components first, then expanding coverage and capabilities.

## Milestone 1: Wire Existing Components (Quick Wins)

**Goal**: Integrate already-implemented components into the documentation experience.

### 1.1 Wire PerfPanel into ComprehensiveComponentDoc

**Files to modify**:

- `app/blueprints/component-standards/_components/ComprehensiveComponentDoc.tsx`

**Tasks**:

- Import `PerfPanel` from `@/ui/modules/CodeSandbox`
- Add PerfPanel to Examples section (after DocInteractive/DocVariants)
- Connect `targetWindow` prop to `getPreviewWindow()` callback
- Add explanatory text about performance monitoring
- Style to match existing panel styling (A11yPanel, TokenPanel)

**Implementation details**:

- Place PerfPanel in a collapsible section similar to A11yPanel
- Use same iframe detection pattern as A11yPanel
- Add helper text: "Monitor render performance when toggling component props"

### 1.2 Create Migration Page Template with DocDiff

**Files to create**:

- `app/blueprints/component-standards/_components/MigrationDoc.tsx`
- `app/blueprints/component-standards/_lib/migrationData.ts` (data structure)

**Files to modify**:

- `app/blueprints/component-standards/_components/ComprehensiveComponentDoc.tsx` (add migration section if data exists)

**Tasks**:

- Create MigrationDoc component that uses DocDiff
- Define migration data structure: `{ fromVersion, toVersion, before: VirtualProject, after: VirtualProject, notes: string[] }`
- Add migration section to ComprehensiveComponentDoc (conditional render)
- Create example migration page route (e.g., `/blueprints/component-standards/migrations/button-v1-v2`)

**Implementation details**:

- DocDiff props: `left={before}`, `right={after}`, `view="split"`, `showPreviews={true}`
- Include migration notes as markdown content above/below DocDiff
- Link from component docs to migration pages when migrations exist

### 1.3 Add Copy Token Affordance to TokenPanel

**Files to modify**:

- `ui/modules/CodeSandbox/primitives/TokenPanel.tsx`

**Tasks**:

- Add copy button next to each token value
- Use `navigator.clipboard.writeText()` for copy functionality
- Show temporary "Copied!" feedback
- Make copy button keyboard accessible

### 1.4 Bind A11yPanel Results to Checklist

**Files to modify**:

- `app/blueprints/component-standards/_components/ComprehensiveComponentDoc.tsx`

**Tasks**:

- Extract A11yPanel scan results (hook into A11yPanel state or events)
- Map WCAG violations to checklist items
- Update checklist badges to show pass/fail based on scan results
- Add visual indicators (checkmarks/X icons) dynamically

**Implementation details**:

- May need to extend A11yPanel to expose scan results via callback prop
- Create mapping: `{ 'keyboard-navigation': 'Keyboard navigation support', ... }`
- Update checklist items to show dynamic status

## Milestone 2: Expand Coverage & Content

**Goal**: Increase playground coverage and add missing content sections.

### 2.1 Expand Playground Coverage

**Files to create**:

- `docs/examples/accordion.playground.ts`
- `docs/examples/alert.playground.ts`
- `docs/examples/checkbox.playground.ts`
- `docs/examples/dialog.playground.ts`
- `docs/examples/form.playground.ts`
- `docs/examples/switch.playground.ts`
- `docs/examples/textarea.playground.ts`

**Files to reference**:

- `docs/examples/button.playground.ts` (as template)

**Tasks**:

- Create playground files for 7+ additional core components
- Each playground should export `*Interactive` and `*Variants` configs
- Include sections with code ranges
- Add variant grids with meaningful prop combinations

**Implementation details**:

- Follow pattern from existing playgrounds
- Use `generateEnhancedInteractiveProject` as fallback reference
- Focus on components with multiple variants/states

### 2.2 Add Content Design Section

**Files to modify**:

- `app/blueprints/component-standards/_components/ComprehensiveComponentDoc.tsx`
- `app/blueprints/component-standards/_lib/componentsData.ts` (extend ComponentItem type)

**Files to create**:

- `app/blueprints/component-standards/_lib/contentGuidelines.ts` (data structure)

**Tasks**:

- Add `contentDesign` field to ComponentItem type: `{ voice: string, tone: string, examples: { good: string, bad: string }[], patterns: string[] }`
- Create new section "Content Guidelines" in ComprehensiveComponentDoc
- Display voice/tone guidance per component
- Show "Do/Don't" content examples
- Include UI copy patterns (labels, error messages, empty states)

**Implementation details**:

- Place Content Guidelines section after Usage section
- Style similar to Dos and Don'ts section
- Include examples inline with component playgrounds

### 2.3 Add Governance Section (Changelog)

**Files to modify**:

- `app/blueprints/component-standards/_lib/componentsData.ts` (extend ComponentItem)
- `app/blueprints/component-standards/_components/ComprehensiveComponentDoc.tsx`

**Files to create**:

- `app/blueprints/component-standards/_lib/changelogData.ts` (data structure)

**Tasks**:

- Define changelog data structure: `{ version: string, date: string, changes: { type: 'added' | 'changed' | 'deprecated' | 'removed', description: string }[] }`
- Add `changelog` field to ComponentItem type
- Create "Changelog" section in ComprehensiveComponentDoc
- Display version history with dates and change types
- Add "Last updated" date to component header

**Implementation details**:

- Changelog section before Related Components
- Use semantic versioning format
- Color-code change types (added=green, changed=yellow, deprecated=orange, removed=red)

### 2.4 Add Component Status Matrix Dashboard

**Files to create**:

- `app/blueprints/component-standards/_components/StatusMatrix.tsx`
- `app/blueprints/component-standards/status/page.tsx`

**Files to modify**:

- `app/blueprints/component-standards/page.tsx` (add link to status matrix)

**Tasks**:

- Create StatusMatrix component showing all components in table
- Columns: Component, Status, Last Updated, Playground, Docs, Tests
- Filterable by category, layer, status
- Link each row to component doc page

**Implementation details**:

- Read from `componentsData.ts`
- Use existing table styling from component-standards page
- Add search/filter functionality

## Milestone 3: Auto-Generation & Infrastructure

**Goal**: Reduce manual maintenance through automation.

### 3.1 Auto-Generate API Props Table

**Files to create**:

- `app/blueprints/component-standards/_lib/extractProps.ts` (TypeScript parser)
- `scripts/generateComponentAPI.mjs` (build script)

**Files to modify**:

- `app/blueprints/component-standards/_components/ComprehensiveComponentDoc.tsx` (use extracted props)

**Tasks**:

- Use TypeScript compiler API or `ts-morph` to parse component files
- Extract prop interfaces/types from component source
- Generate props table data: `{ name, type, default, required, description }`
- Run generation script in build process
- Store props data in JSON or inject into ComponentItem

**Implementation details**:

- Parse `ui/components/{ComponentName}/{ComponentName}.tsx`
- Extract props from component function signature or interface
- Handle JSDoc comments for descriptions
- Cache generated data to avoid re-parsing on every request

### 3.2 Generate Anatomy Diagrams

**Files to create**:

- `app/blueprints/component-standards/_lib/generateAnatomy.ts` (diagram generator)
- `app/blueprints/component-standards/_components/AnatomyDiagram.tsx` (visual component)

**Files to modify**:

- `app/blueprints/component-standards/_components/ComprehensiveComponentDoc.tsx` (use AnatomyDiagram)

**Tasks**:

- Analyze component JSX structure to identify parts (header, body, footer, etc.)
- Generate SVG or React component diagram with labeled parts
- Show spacing/dimensions from design tokens
- Render diagram in Anatomy section

**Implementation details**:

- Parse component JSX to find semantic parts (Card.Header, Card.Body, etc.)
- Use design tokens for spacing visualization
- Create labeled boxes/regions showing component structure
- May need manual annotation for complex components initially

### 3.3 Add Analytics Tracking

**Files to create**:

- `app/blueprints/component-standards/_lib/analytics.ts` (event tracking)

**Files to modify**:

- `app/blueprints/component-standards/_components/ComprehensiveComponentDoc.tsx`
- `ui/modules/CodeSandbox/variants/DocInteractive.tsx`
- `ui/modules/CodeSandbox/variants/DocVariants.tsx`

**Tasks**:

- Track playground interactions (variant selection, code view toggles)
- Track panel opens (A11yPanel, PerfPanel, TokenPanel)
- Track search queries with no results
- Log component page views and time spent

**Implementation details**:

- Use existing analytics infrastructure (if available)
- Or implement simple event logging to console/API
- Events: `playground_interaction`, `panel_open`, `search_no_result`, `component_view`

## Milestone 4: Internationalization & Advanced Features

**Goal**: Add global-ready demonstrations and advanced documentation features.

### 4.1 Add RTL Toggle to Preview Shell

**Files to modify**:

- `ui/modules/CodeSandbox/primitives/ThemeSwitcher.tsx` (extend to include RTL)
- Or create `ui/modules/CodeSandbox/primitives/PreviewControls.tsx` (new component)

**Files to modify**:

- `app/blueprints/component-standards/_components/ComprehensiveComponentDoc.tsx` (add RTL state)

**Tasks**:

- Add RTL toggle control (separate from theme switcher or combined)
- Update preview iframe `dir` attribute when RTL enabled
- Persist RTL preference (localStorage)
- Show RTL toggle in preview controls area

**Implementation details**:

- State: `[rtl, setRTL] = useState(false)`
- Apply `dir="rtl"` to preview iframe
- Update preview config to include `dir` prop
- May need to update Sandpack preview to respect dir attribute

### 4.2 Create i18n Demonstration Examples

**Files to create**:

- `docs/examples/i18n/rtl-example.playground.ts`
- `docs/examples/i18n/long-text-example.playground.ts`
- `docs/examples/i18n/date-formatting.playground.ts`

**Files to modify**:

- `app/blueprints/component-standards/_components/ComprehensiveComponentDoc.tsx` (add i18n section)

**Tasks**:

- Create playground examples showing RTL layout
- Create examples with long text strings (pseudo-localization)
- Create date/number formatting demos
- Add "Internationalization" section to component docs

**Implementation details**:

- Use `dir="rtl"` in playground examples
- Use long German/Spanish strings for text expansion demos
- Use `Intl.DateTimeFormat` and `Intl.NumberFormat` for locale demos
- Link from component docs to i18n examples when relevant

### 4.3 Add Contribution Workflow Links

**Files to modify**:

- `app/blueprints/component-standards/_components/ComprehensiveComponentDoc.tsx`

**Files to create**:

- `app/blueprints/component-standards/_lib/contributionConfig.ts` (workflow links)

**Tasks**:

- Add "Contribute" section to component docs footer
- Link to GitHub issues template
- Link to contribution guidelines
- Link to design system team contact (if applicable)
- Show "Edit this page" link

**Implementation details**:

- Add footer section with contribution links
- Use GitHub edit URL pattern: `{repo}/edit/{branch}/{filePath}`
- Include "Report issue" link with pre-filled component name

### 4.4 Enhance Search with No-Result Tracking

**Files to modify**:

- Search implementation (if exists)
- `app/blueprints/component-standards/_lib/analytics.ts`

**Tasks**:

- Track search queries that return no results
- Log to analytics for documentation gap analysis
- Suggest related components on no results
- Display "Was this helpful?" feedback

**Implementation details**:

- If search exists, add no-result event tracking
- Store queries in analytics
- Generate "suggested components" based on query terms
- Add feedback mechanism for documentation improvement

## Implementation Notes

### Dependencies Between Milestones

- Milestone 1 can be done independently
- Milestone 2 builds on Milestone 1 (uses wired components)
- Milestone 3 can run in parallel with Milestone 2
- Milestone 4 completes the vision

### Key Files Reference

**Core Documentation Component**:

- `app/blueprints/component-standards/_components/ComprehensiveComponentDoc.tsx` (870 lines)

**Data Structures**:

- `app/blueprints/component-standards/_lib/componentsData.ts` (ComponentItem type)

**Existing Components**:

- `ui/modules/CodeSandbox/primitives/PerfPanel.tsx` (fully implemented)
- `ui/modules/CodeSandbox/variants/DocDiff.tsx` (fully implemented)
- `ui/modules/CodeSandbox/primitives/TokenPanel.tsx` (needs copy affordance)
- `ui/modules/CodeSandbox/primitives/A11yPanel.tsx` (may need to expose results)

**Playground Examples**:

- `docs/examples/button.playground.ts` (template)
- `docs/examples/card.playground.ts`
- `docs/examples/input.playground.ts`
- `docs/examples/select.playground.ts`
- `docs/examples/tooltip.playground.ts`

### Testing Considerations

- Test PerfPanel with iframe detection
- Test DocDiff with migration examples
- Test RTL toggle with various components
- Test auto-generated props extraction
- Verify analytics events fire correctly

### Success Criteria

- All 3 panels (A11yPanel, TokenPanel, PerfPanel) visible and functional in component docs
- DocDiff used in at least one migration page
- 12+ components have dedicated playground files
- Changelog visible on component pages
- API props auto-generated from source
- RTL toggle functional in preview
- Component status matrix dashboard available
