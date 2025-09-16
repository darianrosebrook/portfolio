# Tabs (Composer)

Accessible tabbed interface with headless logic, context orchestration, and slot-based UI. Includes View Transitions for panel swaps and an animated active indicator.

## Usage

```tsx
import { TabsProvider } from '@/ui/components/Tabs';
import Tabs from '@/ui/components/Tabs';
import { TabList, Tab, TabPanel } from '@/ui/components/Tabs';

export function Example() {
  return (
    <TabsProvider defaultValue="one">
      <Tabs>
        <TabList>
          <Tab value="one">One</Tab>
          <Tab value="two">Two</Tab>
          <Tab value="three" disabled>
            Three
          </Tab>
        </TabList>
        <TabPanel value="one">Panel One</TabPanel>
        <TabPanel value="two">Panel Two</TabPanel>
        <TabPanel value="three">Panel Three</TabPanel>
      </Tabs>
    </TabsProvider>
  );
}
```

## Accessibility

- `role="tablist"` for list; each tab `role="tab"`, roving `tabIndex`.
- `aria-selected`, `aria-disabled` managed; `role="tabpanel"` for content.
- Keyboard: Arrow keys cycle, Home/End jump, Enter/Space activate.
- Disabled tabs are skipped in focus and cannot be activated.

## Props

- Provider: `defaultValue`, `value`, `onValueChange`, `activationMode`, `unmountInactive`.

## Notes

- Indicator animates via transform.
- Panels can unmount when inactive via `unmountInactive`.
