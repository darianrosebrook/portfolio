# Sidebar

A layout component for creating collapsible sidebar navigation with support for different positions and responsive behavior.

## Purpose

Sidebar provides a flexible navigation container that can be positioned on either side of the main content area, with support for collapsing/expanding and responsive behavior across different screen sizes.

## Usage

```tsx
import Sidebar from '@/ui/components/Sidebar';

function Example() {
  return (
    <Sidebar position="left" collapsible>
      <nav>
        <ul>
          <li>
            <a href="/dashboard">Dashboard</a>
          </li>
          <li>
            <a href="/projects">Projects</a>
          </li>
          <li>
            <a href="/settings">Settings</a>
          </li>
        </ul>
      </nav>
    </Sidebar>
  );
}
```

## Props

| Prop        | Type              | Default | Description                        |
| ----------- | ----------------- | ------- | ---------------------------------- |
| position    | 'left' \| 'right' | 'left'  | Which side to position the sidebar |
| collapsible | boolean           | false   | Whether sidebar can collapse       |
| collapsed   | boolean           | false   | Current collapsed state            |
| onToggle    | () => void        | -       | Handler for collapse/expand toggle |
| width       | string            | '280px' | Width of the expanded sidebar      |
| className   | string            | ''      | Additional CSS class names         |
| children    | React.ReactNode   | -       | Sidebar content                    |

## Examples

### Basic Sidebar

```tsx
<Sidebar>
  <nav>
    <h3>Navigation</h3>
    <ul>
      <li>
        <a href="/home">Home</a>
      </li>
      <li>
        <a href="/about">About</a>
      </li>
      <li>
        <a href="/contact">Contact</a>
      </li>
    </ul>
  </nav>
</Sidebar>
```

### Collapsible Sidebar

```tsx
const [collapsed, setCollapsed] = useState(false);

<Sidebar
  collapsible
  collapsed={collapsed}
  onToggle={() => setCollapsed(!collapsed)}
>
  <nav>
    <button onClick={() => setCollapsed(!collapsed)}>
      {collapsed ? '→' : '←'}
    </button>
    <ul>
      <li>
        <a href="/dashboard">Dashboard</a>
      </li>
      <li>
        <a href="/analytics">Analytics</a>
      </li>
    </ul>
  </nav>
</Sidebar>;
```

### Right-positioned Sidebar

```tsx
<Sidebar position="right" width="320px">
  <aside>
    <h3>Quick Actions</h3>
    <button>New Project</button>
    <button>Import Data</button>
  </aside>
</Sidebar>
```

## Design Tokens

This component uses design tokens for consistent styling:

### Layout

- Sidebar width and positioning
- Collapse/expand animations
- Responsive breakpoints

### Colors

- Background and border colors
- Shadow and overlay effects
- Focus and hover states

### Spacing

- Internal padding and margins
- Content spacing and alignment

## Accessibility

### Keyboard Navigation

- All interactive elements are keyboard accessible
- Focus management during collapse/expand
- Logical tab order maintained

### Screen Reader Support

- Proper landmark roles (navigation, complementary)
- Collapse state announced to screen readers
- Skip links for main content access

### Focus Management

- Focus remains within sidebar when appropriate
- Clear focus indicators on all interactive elements
- Escape key support for closing

## Related Components

- **Navigation** - Often used within sidebar content
- **Button** - For toggle and action buttons
- **Icon** - For collapse/expand indicators

## Implementation Notes

- Uses CSS transforms for smooth animations
- Supports both controlled and uncontrolled modes
- Responsive behavior with mobile considerations
- Overlay mode for smaller screens
- Persistent state management options
- Performance optimized animations
- Supports nested navigation structures
