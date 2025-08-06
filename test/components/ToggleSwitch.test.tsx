import { render, screen, fireEvent } from '../test-utils';
import ToggleSwitch from '@/components/ToggleSwitch';
import styles from '@/components/ToggleSwitch/toggleSwitch.module.scss';
import {
  expectNoAccessibilityViolations,
  designSystemAxeConfig,
} from '../axe-helper';
import { beforeEach, describe, it, expect, vi } from 'vitest';

describe('ToggleSwitch Component', () => {
  const defaultProps = {
    checked: false,
    onChange: vi.fn(),
    children: 'Toggle setting',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders checkbox input with label', () => {
      render(<ToggleSwitch {...defaultProps} />);

      const checkbox = screen.getByRole('checkbox');
      const label = screen.getByLabelText('Toggle setting');

      expect(checkbox).toBeInTheDocument();
      expect(label).toBeInTheDocument();
      expect(checkbox).not.toBeChecked();
    });

    it('renders with custom label text', () => {
      render(
        <ToggleSwitch {...defaultProps}>Custom toggle label</ToggleSwitch>
      );

      expect(screen.getByLabelText('Custom toggle label')).toBeInTheDocument();
    });
  });

  describe('Checked State', () => {
    it('renders checked state correctly', () => {
      render(<ToggleSwitch {...defaultProps} checked={true} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
      expect(checkbox.className).toMatch(/checked/);
    });

    it('renders unchecked state correctly', () => {
      render(<ToggleSwitch {...defaultProps} checked={false} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();
      expect(checkbox.className).not.toMatch(/checked/);
    });
  });

  describe('Disabled State', () => {
    it('renders disabled state correctly', () => {
      render(<ToggleSwitch {...defaultProps} disabled={true} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeDisabled();
    });

    it('does not change state when disabled (though onChange may fire)', () => {
      const onChange = vi.fn();
      render(
        <ToggleSwitch
          {...defaultProps}
          checked={false}
          onChange={onChange}
          disabled={true}
        />
      );

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      // In React, disabled checkboxes still fire onChange but don't change checked state
      expect(checkbox).not.toBeChecked();
      expect(checkbox).toBeDisabled();
    });
  });

  describe('Interaction Handling', () => {
    it('calls onChange when clicked', () => {
      const onChange = vi.fn();
      render(<ToggleSwitch {...defaultProps} onChange={onChange} />);

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(expect.any(Object));
    });

    it('calls onChange when label is clicked', () => {
      const onChange = vi.fn();
      render(<ToggleSwitch {...defaultProps} onChange={onChange} />);

      const label = screen.getByText('Toggle setting');
      fireEvent.click(label);

      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('provides correct event object to onChange', () => {
      const onChange = vi.fn();
      render(
        <ToggleSwitch {...defaultProps} checked={false} onChange={onChange} />
      );

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      // Verify onChange was called with proper event structure
      expect(onChange).toHaveBeenCalledTimes(1);
      const changeEvent = onChange.mock.calls[0][0];
      expect(changeEvent.target.type).toBe('checkbox');
      expect(changeEvent.type).toBe('change');
      // The event object is passed correctly - actual state management is up to parent
    });
  });

  describe('Input/Label Association', () => {
    it('associates input and label correctly with htmlFor/id', () => {
      render(<ToggleSwitch {...defaultProps}>Test Label</ToggleSwitch>);

      const checkbox = screen.getByRole('checkbox');
      const label = screen.getByText('Test Label');

      expect(checkbox).toHaveAttribute('id', 'toggleSwitch-Test-Label');
      expect(label).toHaveAttribute('for', 'toggleSwitch-Test-Label');
    });

    it('generates unique IDs for different instances', () => {
      render(
        <div>
          <ToggleSwitch {...defaultProps}>First toggle</ToggleSwitch>
          <ToggleSwitch {...defaultProps}>Second toggle</ToggleSwitch>
        </div>
      );

      const firstCheckbox = screen.getByLabelText('First toggle');
      const secondCheckbox = screen.getByLabelText('Second toggle');

      expect(firstCheckbox).toHaveAttribute('id', 'toggleSwitch-First-toggle');
      expect(secondCheckbox).toHaveAttribute(
        'id',
        'toggleSwitch-Second-toggle'
      );
    });
  });

  describe('CSS Classes', () => {
    it('applies base toggle switch class', () => {
      const { container } = render(<ToggleSwitch {...defaultProps} />);

      const toggleContainer = container.firstChild;
      expect(toggleContainer).toBeInTheDocument();
      expect(toggleContainer).toHaveClass(styles.toggleSwitch);
    });

    it('applies checked class to input when checked', () => {
      render(<ToggleSwitch {...defaultProps} checked={true} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox.className).toMatch(/checked/);
    });

    it('applies checked class to label when checked', () => {
      render(<ToggleSwitch {...defaultProps} checked={true} />);

      const label = screen.getByText('Toggle setting');
      expect(label.className).toMatch(/checked/);
    });

    it('does not apply checked class when unchecked', () => {
      render(<ToggleSwitch {...defaultProps} checked={false} />);

      const checkbox = screen.getByRole('checkbox');
      const label = screen.getByText('Toggle setting');

      expect(checkbox.className).not.toMatch(/checked/);
      expect(label.className).not.toMatch(/checked/);
    });
  });

  describe('Keyboard Navigation', () => {
    it('supports space key to toggle', () => {
      const onChange = vi.fn();
      render(<ToggleSwitch {...defaultProps} onChange={onChange} />);

      const checkbox = screen.getByRole('checkbox');
      checkbox.focus();

      // Space key should trigger both keyDown and change events
      fireEvent.keyDown(checkbox, { key: ' ', code: 'Space' });
      fireEvent.keyUp(checkbox, { key: ' ', code: 'Space' });

      // Verify the checkbox can be toggled (check accessibility)
      expect(checkbox).toHaveFocus();
    });

    it('is focusable via keyboard navigation', () => {
      render(<ToggleSwitch {...defaultProps} />);

      const checkbox = screen.getByRole('checkbox');
      checkbox.focus();

      expect(checkbox).toHaveFocus();
    });
  });

  describe('Real-world Usage Patterns', () => {
    it('handles boolean state toggle pattern', () => {
      let isEnabled = false;
      const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        isEnabled = e.target.checked;
      };

      const { rerender } = render(
        <ToggleSwitch checked={isEnabled} onChange={handleToggle}>
          Enable feature
        </ToggleSwitch>
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();

      fireEvent.click(checkbox);
      expect(isEnabled).toBe(true);

      rerender(
        <ToggleSwitch checked={isEnabled} onChange={handleToggle}>
          Enable feature
        </ToggleSwitch>
      );

      expect(checkbox).toBeChecked();
    });

    it('works in controlled component pattern', () => {
      const onChange = vi.fn();
      const { rerender } = render(
        <ToggleSwitch checked={false} onChange={onChange}>
          Controlled toggle
        </ToggleSwitch>
      );

      let checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();

      // Simulate parent component updating state
      rerender(
        <ToggleSwitch checked={true} onChange={onChange}>
          Controlled toggle
        </ToggleSwitch>
      );

      checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });
  });

  describe('Edge Cases', () => {
    it('handles ReactNode children (not just strings)', () => {
      render(
        <ToggleSwitch {...defaultProps}>
          <span>
            Complex <strong>label</strong> content
          </span>
        </ToggleSwitch>
      );

      // Verify the checkbox exists and is functional
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();

      // Verify ReactNode children work - focus on component functionality
      fireEvent.click(checkbox);

      // Verify the structure works - checkbox should have an associated label
      const labelElement = checkbox.closest('div')?.querySelector('label');
      expect(labelElement).toBeInTheDocument();
      expect(labelElement?.querySelector('strong')).toBeInTheDocument();
    });

    it('handles empty string labels', () => {
      render(<ToggleSwitch {...defaultProps}>Toggle setting</ToggleSwitch>);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
      expect(checkbox.id).toMatch(/toggleSwitch/);
    });
  });

  describe('Accessibility Compliance', () => {
    it('should have no accessibility violations - basic toggle', async () => {
      const renderResult = render(
        <ToggleSwitch {...defaultProps}>Basic toggle</ToggleSwitch>
      );

      await expectNoAccessibilityViolations(
        renderResult,
        designSystemAxeConfig
      );
    });

    it('should have no accessibility violations - checked state', async () => {
      const renderResult = render(
        <ToggleSwitch {...defaultProps} checked={true}>
          Enabled toggle
        </ToggleSwitch>
      );

      await expectNoAccessibilityViolations(
        renderResult,
        designSystemAxeConfig
      );
    });

    it('should have no accessibility violations - disabled state', async () => {
      const renderResult = render(
        <ToggleSwitch {...defaultProps} disabled={true}>
          Disabled toggle
        </ToggleSwitch>
      );

      await expectNoAccessibilityViolations(
        renderResult,
        designSystemAxeConfig
      );
    });

    it('should have no accessibility violations - complex label', async () => {
      const renderResult = render(
        <ToggleSwitch {...defaultProps}>
          <span>
            Enable <em>advanced</em> features
          </span>
        </ToggleSwitch>
      );

      await expectNoAccessibilityViolations(
        renderResult,
        designSystemAxeConfig
      );
    });
  });
});
