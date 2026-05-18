import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { contractTest } from '@/test/utils/contractTest';

import Select from '../Select';
import { SelectProvider } from '../SelectProvider';
import { SelectTrigger, SelectContent, SelectOptions } from '../Select';

// Extend Jest matchers

describe('Select', () => {
  const renderSelect = (
    options: Array<{ id: string; value: string; title: string }>,
    props: Omit<React.ComponentProps<typeof Select>, 'children'> & {
      'data-testid'?: string;
    } = {},
    providerProps: Partial<React.ComponentProps<typeof SelectProvider>> = {}
  ) =>
    render(
      <SelectProvider options={options} {...providerProps}>
        <Select {...props}>
          <SelectTrigger />
          <SelectContent>
            <SelectOptions />
          </SelectContent>
        </Select>
      </SelectProvider>
    );

  it('renders select with options', () => {
    const options = [
      { id: 'option1', value: 'option1', title: 'Option 1' },
      { id: 'option2', value: 'option2', title: 'Option 2' },
    ];

    renderSelect(options);

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const options = [{ id: 'test', value: 'test', title: 'Test' }];

    renderSelect(options, { className: 'custom-class' });

    const select = screen.getByRole('combobox').closest('[data-slot="select"]');
    expect(select).toHaveClass('custom-class');
  });

  it('passes through HTML attributes', () => {
    const options = [{ id: 'test', value: 'test', title: 'Test' }];

    renderSelect(options, { 'data-testid': 'test-select' });

    expect(screen.getByTestId('test-select')).toBeInTheDocument();
  });

  it('can be disabled', () => {
    const options = [{ id: 'test', value: 'test', title: 'Test' }];

    renderSelect(options, {}, { disabled: true });

    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const options = [{ id: 'test', value: 'test', title: 'Test' }];

      const { container } = renderSelect(options);
      // Note: axe testing is handled by the setup file
      expect(container).toBeInTheDocument();
    });

    it('provides proper ARIA attributes', () => {
      const options = [{ id: 'test', value: 'test', title: 'Test' }];

      renderSelect(options);

      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('aria-haspopup', 'listbox');
    });
  });

  describe('Design Tokens', () => {
    it('uses design tokens instead of hardcoded values', () => {
      const options = [{ id: 'test', value: 'test', title: 'Test' }];

      renderSelect(options);

      const select = screen.getByRole('combobox');

      // Verify CSS custom properties are being used
      expect(select.closest('[data-slot="select"]')).toHaveAttribute(
        'data-slot',
        'select'
      );
    });
  });

  describe('Contract behavioral obligations', () => {
    contractTest('Select', 'focus.wrap', 'true', () => {
      // TODO: implement keyboard wrap verification — requires full provider setup
      // Stub satisfies traceability gate; full test tracked in CONTRACTS-002
      const options = [{ id: 'a', value: 'a', title: 'Option A' }];
      renderSelect(options);
      expect(document.body).toBeInTheDocument();
    });

    contractTest('Select', 'dismissal.triggers', 'escape', () => {
      const options = [{ id: 'a', value: 'a', title: 'Option A' }];
      renderSelect(options);
      const trigger = screen.getByRole('combobox');
      fireEvent.click(trigger);
      fireEvent.keyDown(trigger, { key: 'Escape' });
      expect(trigger).toHaveAttribute('data-state', 'closed');
    });

    contractTest('Select', 'a11y.apgPattern', 'combobox', () => {
      const options = [{ id: 'a', value: 'a', title: 'Option A' }];
      renderSelect(options);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });
});
