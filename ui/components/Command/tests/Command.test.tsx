import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Command } from '../Command';

const mockItems = [
  {
    id: '1',
    label: 'Create New File',
    description: 'Create a new file in the current directory',
    group: 'File',
    onSelect: jest.fn(),
  },
  {
    id: '2',
    label: 'Open File',
    description: 'Open an existing file',
    group: 'File',
    onSelect: jest.fn(),
  },
  {
    id: '3',
    label: 'Search',
    description: 'Search across all files',
    group: 'Navigation',
    onSelect: jest.fn(),
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

    expect(screen.getByText('FILE')).toBeInTheDocument();
    expect(screen.getByText('NAVIGATION')).toBeInTheDocument();
  });

  it('calls onSelect when item is clicked', () => {
    const onSelectMock = jest.fn();
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

    // Arrow down should select first item
    fireEvent.keyDown(input, { key: 'ArrowDown' });

    // Enter should trigger onSelect
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(mockItems[0].onSelect).toHaveBeenCalledTimes(1);
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
});
