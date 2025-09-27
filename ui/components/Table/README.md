# Table

A flexible table component for displaying structured data. Supports sorting, selection, and various table patterns with accessible markup.

## Usage

```tsx
import { Table } from '@/ui/components/Table';

function DataTable() {
  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.Head>Name</Table.Head>
          <Table.Head>Email</Table.Head>
          <Table.Head>Role</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        <Table.Row>
          <Table.Cell>John Doe</Table.Cell>
          <Table.Cell>john@example.com</Table.Cell>
          <Table.Cell>Admin</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  );
}
```

## Props

| Prop      | Type   | Default | Description              |
| --------- | ------ | ------- | ------------------------ |
| children  | ReactNode | -     | Table content            |
| className | string | ''      | Additional CSS classes   |

## Examples

### Basic Table

```tsx
<Table>
  <Table.Caption>Employee Directory</Table.Caption>
  <Table.Header>
    <Table.Row>
      <Table.Head>Name</Table.Head>
      <Table.Head>Department</Table.Head>
      <Table.Head>Status</Table.Head>
    </Table.Row>
  </Table.Header>
  <Table.Body>
    <Table.Row>
      <Table.Cell>Jane Smith</Table.Cell>
      <Table.Cell>Engineering</Table.Cell>
      <Table.Cell>Active</Table.Cell>
    </Table.Row>
  </Table.Body>
</Table>
```

### With Sorting

```tsx
<Table>
  <Table.Header>
    <Table.Row>
      <Table.Head sortable onSort={() => console.log('Sort by name')}>
        Name
      </Table.Head>
      <Table.Head>Department</Table.Head>
    </Table.Row>
  </Table.Header>
  <Table.Body>
    <Table.Row>
      <Table.Cell>Alice Johnson</Table.Cell>
      <Table.Cell>Design</Table.Cell>
    </Table.Row>
  </Table.Body>
</Table>
```

## Design Tokens

This component uses the following design tokens:

- `--color-background-primary` - Table background
- `--color-border-subtle` - Border colors
- `--color-text-primary` - Text color
- `--color-text-secondary` - Secondary text
- `--space-sm` - Cell padding
- `--font-family-base` - Font family
- `--border-radius-small` - Border radius

## Accessibility

### Keyboard Navigation

- Tab to navigate through table cells
- Arrow keys for cell navigation in some implementations
- Enter/Space for interactive elements

### Screen Reader Support

- Proper table semantics with headers
- Row and column associations
- Caption for table description
- Sort state announcements

### States

- Hover states for interactive rows
- Selection states clearly indicated
- Loading states for async data

## Related Components

- **List** - For simpler list patterns
- **Card** - For displaying individual items
- **Pagination** - For large data sets
