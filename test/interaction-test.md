# Interaction Test Checklist

## Setup

1. Start the dev server: `npm run dev`
2. Navigate to: `http://localhost:3000/dev/interaction-test`

## Test Cases

### 1. Keyboard Shortcuts

- [ ] Press `d` - Should toggle details view
  - Expected: Details state changes in "Current State" panel
  - Expected: Log entry appears: "Keyboard: Toggled details"
- [ ] Press `` ` `` - Should toggle debug overlay
  - Expected: Log entry appears: "Keyboard: Toggled debug overlay"
- [ ] Press `?` - Should show help
  - Expected: Log entry appears: "Keyboard: Showed help"

### 2. Pointer Dragging (Axis Adjustment)

- [ ] Click and drag horizontally on the SVG canvas
  - Expected: Weight axis value changes in "Current State" panel
  - Expected: Log entries show axis value changes
  - Expected: Cursor position updates in real-time

### 3. Pointer Events Test Area

- [ ] Move mouse in the "Pointer Event Test" area
  - Expected: Red circle indicator follows cursor
  - Expected: "Hover Position" updates in State panel
- [ ] Click and drag in the test area
  - Expected: Dashed line shows drag path
  - Expected: Log entry: "Pointer down at (x, y)"
  - Expected: "Drag State" shows "Active"
  - Expected: "Drag Delta" updates in real-time
  - Expected: Log entry: "Pointer up" when released

### 4. State Monitoring

- [ ] Verify all state panels update correctly:
  - [ ] Details Visible state matches actual visibility
  - [ ] Weight and Optical Size values display correctly
  - [ ] Hover Position updates on mouse movement
  - [ ] Drag State toggles correctly

### 5. Interaction Log

- [ ] Verify log entries appear for:
  - [ ] Keyboard shortcuts
  - [ ] Axis value changes
  - [ ] Pointer down events
  - [ ] Pointer up events
- [ ] Verify "Clear Log" button works

### 6. Visual Feedback

- [ ] Pointer indicator appears and follows cursor in test area
- [ ] Drag line appears during drag operations
- [ ] All visual elements render correctly

## Browser Console Check

Open DevTools console and verify:

- [ ] No errors or warnings
- [ ] Help message appears when pressing `?`

## Accessibility Check

- [ ] Keyboard shortcuts work without mouse
- [ ] Focus indicators visible when using keyboard navigation
- [ ] All interactive elements are accessible
