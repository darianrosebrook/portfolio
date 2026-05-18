/**
 * Table (Compound)
 * A comprehensive table component with proper semantic structure and accessibility.
 */
'use client';
import * as React from 'react';
import './Table.css';

// Root Table Container Component
export interface TableProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Enable responsive horizontal scrolling */
  responsive?: boolean;
}

const TableRoot = React.forwardRef<HTMLDivElement, TableProps>(
  ({ className = '', children, responsive = true, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        data-ds-component="Table"
        className={['container', responsive ? 'responsive' : '', className]
          .filter(Boolean)
          .join(' ')}
        data-slot="table-container"
        {...rest}
      >
        {children}
      </div>
    );
  }
);

// Table Element Component
export interface TableElementProps extends React.TableHTMLAttributes<HTMLTableElement> {}

const TableElement = React.forwardRef<HTMLTableElement, TableElementProps>(
  ({ className = '', children, ...rest }, ref) => {
    return (
      <table
        ref={ref}
        className={['table', className].filter(Boolean).join(' ')}
        data-slot="table"
        {...rest}
      >
        {children}
      </table>
    );
  }
);

// Table Header Component
export interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className = '', children, ...rest }, ref) => {
    return (
      <thead
        ref={ref}
        className={['header', className].filter(Boolean).join(' ')}
        data-slot="table-header"
        {...rest}
      >
        {children}
      </thead>
    );
  }
);

// Table Body Component
export interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className = '', children, ...rest }, ref) => {
    return (
      <tbody
        ref={ref}
        className={['body', className].filter(Boolean).join(' ')}
        data-slot="table-body"
        {...rest}
      >
        {children}
      </tbody>
    );
  }
);

// Table Footer Component
export interface TableFooterProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

const TableFooter = React.forwardRef<HTMLTableSectionElement, TableFooterProps>(
  ({ className = '', children, ...rest }, ref) => {
    return (
      <tfoot
        ref={ref}
        className={['footer', className].filter(Boolean).join(' ')}
        data-slot="table-footer"
        {...rest}
      >
        {children}
      </tfoot>
    );
  }
);

// Table Row Component
export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  /** Whether the row is selected */
  selected?: boolean;
  /** Whether the row is interactive (hoverable) */
  interactive?: boolean;
}

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  (
    { className = '', children, selected = false, interactive = true, ...rest },
    ref
  ) => {
    return (
      <tr
        ref={ref}
        className={[
          'row',
          interactive ? 'interactive' : '',
          selected ? 'selected' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        data-slot="table-row"
        data-state={selected ? 'selected' : undefined}
        {...rest}
      >
        {children}
      </tr>
    );
  }
);

// Table Head Cell Component
export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  /** Whether the column is sortable */
  sortable?: boolean;
  /** Current sort direction */
  sortDirection?: 'asc' | 'desc' | null;
  /** Sort handler */
  onSort?: () => void;
}

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  (
    {
      className = '',
      children,
      sortable = false,
      sortDirection = null,
      onSort,
      ...rest
    },
    ref
  ) => {
    const handleClick = () => {
      if (sortable && onSort) {
        onSort();
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (sortable && onSort && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        onSort();
      }
    };

    return (
      <th
        ref={ref}
        className={['head', sortable ? 'sortable' : '', className]
          .filter(Boolean)
          .join(' ')}
        data-slot="table-head"
        data-sortable={sortable || undefined}
        data-sort-direction={sortDirection || undefined}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={sortable ? 0 : undefined}
        role={sortable ? 'button' : undefined}
        aria-sort={
          sortDirection === 'asc'
            ? 'ascending'
            : sortDirection === 'desc'
              ? 'descending'
              : sortable
                ? 'none'
                : undefined
        }
        {...rest}
      >
        <div className="headContent">
          {children}
          {sortable && (
            <span className="sortIcon" aria-hidden="true">
              {sortDirection === 'asc'
                ? '↑'
                : sortDirection === 'desc'
                  ? '↓'
                  : '↕'}
            </span>
          )}
        </div>
      </th>
    );
  }
);

// Table Cell Component
export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  /** Whether the cell content should be truncated */
  truncate?: boolean;
}

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className = '', children, truncate = false, ...rest }, ref) => {
    return (
      <td
        ref={ref}
        className={['cell', truncate ? 'truncate' : '', className]
          .filter(Boolean)
          .join(' ')}
        data-slot="table-cell"
        {...rest}
      >
        {children}
      </td>
    );
  }
);

// Table Caption Component
export interface TableCaptionProps extends React.HTMLAttributes<HTMLTableCaptionElement> {}

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  TableCaptionProps
>(({ className = '', children, ...rest }, ref) => {
  return (
    <caption
      ref={ref}
      className={['caption', className].filter(Boolean).join(' ')}
      data-slot="table-caption"
      {...rest}
    >
      {children}
    </caption>
  );
});

// Compound export
export const Table = Object.assign(TableRoot, {
  Element: TableElement,
  Header: TableHeader,
  Body: TableBody,
  Footer: TableFooter,
  Row: TableRow,
  Head: TableHead,
  Cell: TableCell,
  Caption: TableCaption,
});

// Set display names
TableRoot.displayName = 'Table';
TableElement.displayName = 'Table.Element';
TableHeader.displayName = 'Table.Header';
TableBody.displayName = 'Table.Body';
TableFooter.displayName = 'Table.Footer';
TableRow.displayName = 'Table.Row';
TableHead.displayName = 'Table.Head';
TableCell.displayName = 'Table.Cell';
TableCaption.displayName = 'Table.Caption';

export default Table;
