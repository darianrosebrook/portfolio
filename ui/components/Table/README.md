# Table

Comprehensive table component with proper semantic structure and accessibility.

## Usage

```tsx
import { Table } from '@/ui/components/Table';

// Basic table
<Table.Root>
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
</Table.Root>

// Responsive table
<Table.Root responsive>
  {/* table content */}
</Table.Root>
```

## Components

### Table.Root

Container component with responsive scrolling.

**Props:**

- `responsive?: boolean` - Enable horizontal scrolling (default: true)

### Table.Header

Table header section.

### Table.Body

Table body section.

### Table.Row

Table row.

### Table.Head

Header cell.

**Props:**

- `align?: 'left' | 'center' | 'right'` - Text alignment

### Table.Cell

Data cell.

**Props:**

- `align?: 'left' | 'center' | 'right'` - Text alignment

## Accessibility

- Proper semantic HTML structure (`<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>`)
- ARIA attributes for screen readers
- Keyboard navigation support
- Focus management

## Design Tokens

### Colors

- `--table-color-background`
- `--table-color-foreground`
- `--table-color-border`

### Spacing

- `--table-spacing-padding-cell`
- `--table-spacing-padding-head`

### Typography

- `--table-typography-font-size`
- `--table-typography-line-height`

## Related Components

- [DataGrid](../DataGrid/) - Advanced data table with sorting/filtering
- [List](../List/) - Simple list component

