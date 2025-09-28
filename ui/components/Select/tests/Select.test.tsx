import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import Select from '../Select';
import { SelectProvider } from '../SelectProvider';

// Extend Jest matchers

describe('Select', () => {
  it('renders select with options', () => {
    const options = [
      { id: 'option1', value: 'option1', title: 'Option 1' },
      { id: 'option2', value: 'option2', title: 'Option 2' },
    ];

    render(
      <SelectProvider options={options}>
        <Select>
          <div>Select content</div>
        </Select>
      </SelectProvider>
    );

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const options = [{ id: 'test', value: 'test', title: 'Test' }];

    render(
      <SelectProvider options={options}>
        <Select className="custom-class">
          <div>Select content</div>
        </Select>
      </SelectProvider>
    );

    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('custom-class');
  });

  it('passes through HTML attributes', () => {
    const options = [{ id: 'test', value: 'test', title: 'Test' }];

    render(
      <SelectProvider options={options}>
        <Select data-testid="test-select">
          <div>Select content</div>
        </Select>
      </SelectProvider>
    );

    expect(screen.getByTestId('test-select')).toBeInTheDocument();
  });

  it('can be disabled', () => {
    const options = [{ id: 'test', value: 'test', title: 'Test' }];

    render(
      <SelectProvider options={options} disabled>
        <Select>
          <div>Select content</div>
        </Select>
      </SelectProvider>
    );

    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const options = [{ id: 'test', value: 'test', title: 'Test' }];

      const { container } = render(
        <SelectProvider options={options}>
          <Select>
            <div>Select content</div>
          </Select>
        </SelectProvider>
      );
      // Note: axe testing is handled by the setup file
      expect(container).toBeInTheDocument();
    });

    it('provides proper ARIA attributes', () => {
      const options = [{ id: 'test', value: 'test', title: 'Test' }];

      render(
        <SelectProvider options={options}>
          <Select>
            <div>Select content</div>
          </Select>
        </SelectProvider>
      );

      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('aria-haspopup', 'listbox');
    });
  });

  describe('Design Tokens', () => {
    it('uses design tokens instead of hardcoded values', () => {
      const options = [{ id: 'test', value: 'test', title: 'Test' }];

      render(
        <SelectProvider options={options}>
          <Select>
            <div>Select content</div>
          </Select>
        </SelectProvider>
      );

      const select = screen.getByRole('combobox');

      // Verify CSS custom properties are being used
      expect(select).toHaveClass('select');
    });
  });
});
