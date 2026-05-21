import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Command } from '../Command';
import { contractTest } from '@/test/utils/contractTest';

const mockItems = [
  {
    id: '1',
    label: 'Create New File',
    description: 'Create a new file in the current directory',
    group: 'File',
    onSelect: vi.fn(),
  },
  {
    id: '2',
    label: 'Open File',
    description: 'Open an existing file',
    group: 'File',
    onSelect: vi.fn(),
  },
  {
    id: '3',
    label: 'Search',
    description: 'Search across all files',
    group: 'Navigation',
    onSelect: vi.fn(),
  },
];

describe('Command', () => {
  it('renders command input', () => {
    render(
      <Command items={mockItems}>
        <Command.Input placeholder="Type a command..." />
        <Command.List>
          <Command.Items />
        </Command.List>
      </Command>
    );

    expect(
      screen.getByPlaceholderText('Type a command...')
    ).toBeInTheDocument();
  });

  it('displays all items when no search term', () => {
    render(
      <Command items={mockItems}>
        <Command.Input />
        <Command.List>
          <Command.Items />
        </Command.List>
      </Command>
    );

    expect(screen.getByText('Create New File')).toBeInTheDocument();
    expect(screen.getByText('Open File')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  it('filters items based on search input', () => {
    render(
      <Command items={mockItems}>
        <Command.Input />
        <Command.List>
          <Command.Items />
        </Command.List>
      </Command>
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'create' } });

    expect(screen.getByText('Create New File')).toBeInTheDocument();
    expect(screen.queryByText('Open File')).not.toBeInTheDocument();
    expect(screen.queryByText('Search')).not.toBeInTheDocument();
  });

  it('groups items by group property', () => {
    render(
      <Command items={mockItems}>
        <Command.Input />
        <Command.List>
          <Command.Items />
        </Command.List>
      </Command>
    );

    // Group headings render with the original casing from the group property;
    // uppercase appearance is CSS-only (text-transform). Match actual DOM text.
    expect(screen.getByText('File')).toBeInTheDocument();
    expect(screen.getByText('Navigation')).toBeInTheDocument();
  });

  it('calls onSelect when item is clicked', () => {
    const onSelectMock = vi.fn();
    const itemsWithMock = [{ ...mockItems[0], onSelect: onSelectMock }];

    render(
      <Command items={itemsWithMock}>
        <Command.Input />
        <Command.List>
          <Command.Items />
        </Command.List>
      </Command>
    );

    fireEvent.click(screen.getByText('Create New File'));
    expect(onSelectMock).toHaveBeenCalledTimes(1);
  });

  it('navigates with keyboard arrows', () => {
    render(
      <Command items={mockItems}>
        <Command.Input />
        <Command.List>
          <Command.Items />
        </Command.List>
      </Command>
    );

    const input = screen.getByRole('textbox');

    // selectedIndex starts at 0; ArrowDown advances it to 1.
    // Enter therefore fires onSelect on mockItems[1], not mockItems[0].
    fireEvent.keyDown(input, { key: 'ArrowDown' });

    // Enter should trigger onSelect for the now-selected item (index 1)
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(mockItems[1].onSelect).toHaveBeenCalledTimes(1);
  });

  it('shows empty message when no results', () => {
    render(
      <Command items={mockItems}>
        <Command.Input />
        <Command.List emptyMessage="No commands found">
          <Command.Items />
        </Command.List>
      </Command>
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'nonexistent' } });

    expect(screen.getByText('No commands found')).toBeInTheDocument();
  });

  describe('Contract behavioral obligations', () => {
    contractTest('Command', 'a11y.apgPattern', 'dialog-modal', () => {
      render(
        <Command open items={[]}>
          <Command.Dialog items={[]} modal>
            <Command.Input placeholder="Search..." />
          </Command.Dialog>
        </Command>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });
  });
});
