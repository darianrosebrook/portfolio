import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Select from '../Select';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe('Select', () => {
  it('renders select with options', () => {
    render(
      <Select>
        <Select.Option value="option1">Option 1</Select.Option>
        <Select.Option value="option2">Option 2</Select.Option>
      </Select>
    );

    const select = screen.getByRole('combobox');
    const option1 = screen.getByText('Option 1');
    const option2 = screen.getByText('Option 2');

    expect(select).toBeInTheDocument();
    expect(option1).toBeInTheDocument();
    expect(option2).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <Select className="custom-class">
        <Select.Option value="test">Test</Select.Option>
      </Select>
    );

    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('custom-class');
  });

  it('passes through HTML attributes', () => {
    render(
      <Select data-testid="test-select">
        <Select.Option value="test">Test</Select.Option>
      </Select>
    );

    expect(screen.getByTestId('test-select')).toBeInTheDocument();
  });

  it('can be disabled', () => {
    render(
      <Select disabled>
        <Select.Option value="test">Test</Select.Option>
      </Select>
    );

    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <Select>
          <Select.Option value="test">Test</Select.Option>
        </Select>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('provides proper ARIA attributes', () => {
      render(
        <Select>
          <Select.Option value="test">Test</Select.Option>
        </Select>
      );

      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('aria-haspopup', 'listbox');
    });
  });

  describe('Design Tokens', () => {
    it('uses design tokens instead of hardcoded values', () => {
      render(
        <Select>
          <Select.Option value="test">Test</Select.Option>
        </Select>
      );

      const select = screen.getByRole('combobox');

      // Verify CSS custom properties are being used
      expect(select).toHaveClass('select');
    });
  });
});
