import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Checkbox from '../Checkbox';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe('Checkbox', () => {
  it('renders with default props', () => {
    render(<Checkbox />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it('renders with custom id', () => {
    const customId = 'custom-checkbox';
    render(<Checkbox id={customId} />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('id', customId);
  });

  it('handles checked state', () => {
    render(<Checkbox checked />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('handles disabled state', () => {
    render(<Checkbox disabled />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDisabled();
  });

  it('handles indeterminate state', () => {
    render(<Checkbox indeterminate />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-checked', 'mixed');
  });

  it('handles size variants', () => {
    const { rerender } = render(<Checkbox size="sm" />);
    let checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('data-size', 'sm');

    rerender(<Checkbox size="md" />);
    checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('data-size', 'md');

    rerender(<Checkbox size="lg" />);
    checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('data-size', 'lg');
  });

  it('handles onChange events', () => {
    const handleChange = jest.fn();
    render(<Checkbox onChange={handleChange} />);
    const checkbox = screen.getByRole('checkbox');

    fireEvent.click(checkbox);
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Checkbox ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('should not have accessibility violations', async () => {
    const { container } = render(<Checkbox />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should not have accessibility violations when checked', async () => {
    const { container } = render(<Checkbox checked />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should not have accessibility violations when disabled', async () => {
    const { container } = render(<Checkbox disabled />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should not have accessibility violations when indeterminate', async () => {
    const { container } = render(<Checkbox indeterminate />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
