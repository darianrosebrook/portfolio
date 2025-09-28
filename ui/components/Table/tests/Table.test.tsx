import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Table } from '../Table';

describe('Table', () => {
  it('renders table structure correctly', () => {
    render(
      <Table>
        <Table.Element>
          <Table.Header>
            <Table.Row>
              <Table.Head>Name</Table.Head>
              <Table.Head>Age</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>John</Table.Cell>
              <Table.Cell>30</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Element>
      </Table>
    );

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('John')).toBeInTheDocument();
  });

  it('handles sortable columns', () => {
    const mockSort = vi.fn();

    render(
      <Table>
        <Table.Element>
          <Table.Header>
            <Table.Row>
              <Table.Head sortable onSort={mockSort}>
                Name
              </Table.Head>
            </Table.Row>
          </Table.Header>
        </Table.Element>
      </Table>
    );

    const sortableHeader = screen.getByRole('button');
    fireEvent.click(sortableHeader);

    expect(mockSort).toHaveBeenCalledTimes(1);
  });

  it('supports keyboard navigation for sortable columns', () => {
    const mockSort = vi.fn();

    render(
      <Table>
        <Table.Element>
          <Table.Header>
            <Table.Row>
              <Table.Head sortable onSort={mockSort}>
                Name
              </Table.Head>
            </Table.Row>
          </Table.Header>
        </Table.Element>
      </Table>
    );

    const sortableHeader = screen.getByRole('button');
    fireEvent.keyDown(sortableHeader, { key: 'Enter' });

    expect(mockSort).toHaveBeenCalledTimes(1);
  });

  it('displays sort direction indicators', () => {
    render(
      <Table>
        <Table.Element>
          <Table.Header>
            <Table.Row>
              <Table.Head sortable sortDirection="asc">
                Name
              </Table.Head>
            </Table.Row>
          </Table.Header>
        </Table.Element>
      </Table>
    );

    const header = screen.getByRole('button');
    expect(header).toHaveAttribute('aria-sort', 'ascending');
  });

  it('applies selected state to rows', () => {
    render(
      <Table>
        <Table.Element>
          <Table.Body>
            <Table.Row selected>
              <Table.Cell>Selected Row</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Element>
      </Table>
    );

    const row = screen.getByText('Selected Row').closest('tr');
    expect(row).toHaveAttribute('data-state', 'selected');
  });
});
