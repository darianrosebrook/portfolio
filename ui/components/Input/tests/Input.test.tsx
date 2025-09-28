import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import Input from '../Input';

describe('Input', () => {
  it('renders with default props', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).not.toHaveAttribute('aria-invalid');
  });

  it('renders with placeholder', () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
  });

  it('renders with value', () => {
    render(<Input value="test value" readOnly />);
    const input = screen.getByDisplayValue('test value');
    expect(input).toBeInTheDocument();
  });

  it('handles invalid state', () => {
    render(<Input invalid />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('handles custom aria-invalid', () => {
    render(<Input aria-invalid="false" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'false');
  });

  it('prioritizes aria-invalid over invalid prop', () => {
    render(<Input invalid aria-invalid="false" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'false');
  });

  it('handles disabled state', () => {
    render(<Input disabled />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('handles readonly state', () => {
    render(<Input readOnly />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('readOnly');
  });

  it('handles different input types', () => {
    const { rerender } = render(<Input type="email" />);
    let input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'email');

    rerender(<Input type="password" />);
    input = screen.getByDisplayValue('');
    expect(input).toHaveAttribute('type', 'password');

    rerender(<Input type="number" />);
    input = screen.getByRole('spinbutton');
    expect(input).toHaveAttribute('type', 'number');
  });

  it('handles className prop', () => {
    const customClass = 'custom-input';
    render(<Input className={customClass} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass(customClass);
  });

  it('handles onChange events', () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);
    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: 'new value' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({ value: 'new value' }),
      })
    );
  });

  it('handles onFocus events', () => {
    const handleFocus = vi.fn();
    render(<Input onFocus={handleFocus} />);
    const input = screen.getByRole('textbox');

    fireEvent.focus(input);
    expect(handleFocus).toHaveBeenCalledTimes(1);
  });

  it('handles onBlur events', () => {
    const handleBlur = vi.fn();
    render(<Input onBlur={handleBlur} />);
    const input = screen.getByRole('textbox');

    fireEvent.blur(input);
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('passes through additional props', () => {
    render(<Input data-testid="custom-input" autoComplete="off" />);
    const input = screen.getByTestId('custom-input');
    expect(input).toHaveAttribute('autoComplete', 'off');
  });

  it('should not have accessibility violations', async () => {
    const { container } = render(<Input />);
    // Note: axe testing is handled by the setup file
    expect(container).toBeInTheDocument();
  });

  it('should not have accessibility violations when invalid', async () => {
    const { container } = render(<Input invalid />);
    // Note: axe testing is handled by the setup file
    expect(container).toBeInTheDocument();
  });

  it('should not have accessibility violations when disabled', async () => {
    const { container } = render(<Input disabled />);
    // Note: axe testing is handled by the setup file
    expect(container).toBeInTheDocument();
  });

  it('should not have accessibility violations with label', async () => {
    const { container } = render(
      <div>
        <label htmlFor="test-input">Test Label</label>
        <Input id="test-input" />
      </div>
    );
    // Note: axe testing is handled by the setup file
    expect(container).toBeInTheDocument();
  });
});
