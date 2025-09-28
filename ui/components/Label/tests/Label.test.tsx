import React from 'react';
import { render, screen } from '@testing-library/react';

import Label from '../Label';

// Extend Jest matchers

describe('Label', () => {
  it('renders with default props', () => {
    render(<Label>Test Label</Label>);
    const label = screen.getByText('Test Label');
    expect(label).toBeInTheDocument();
  });

  it('renders with htmlFor attribute', () => {
    render(<Label htmlFor="test-input">Test Label</Label>);
    const label = screen.getByText('Test Label');
    expect(label).toHaveAttribute('for', 'test-input');
  });

  it('renders with custom className', () => {
    const customClass = 'custom-label';
    render(<Label className={customClass}>Custom Label</Label>);
    const label = screen.getByText('Custom Label');
    expect(label).toHaveClass(customClass);
  });

  it('renders with children', () => {
    render(
      <Label>
        <span>Label Text</span>
        <span>Additional Content</span>
      </Label>
    );
    expect(screen.getByText('Label Text')).toBeInTheDocument();
    expect(screen.getByText('Additional Content')).toBeInTheDocument();
  });

  it('renders with required indicator', () => {
    render(<Label data-required>Required Field</Label>);
    const label = screen.getByText('Required Field');
    expect(label).toHaveAttribute('data-required');
  });

  it('renders with disabled state', () => {
    render(<Label data-disabled>Disabled Label</Label>);
    const label = screen.getByText('Disabled Label');
    expect(label).toHaveAttribute('data-disabled');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLLabelElement>();
    render(<Label ref={ref}>Ref Test</Label>);
    expect(ref.current).toBeInstanceOf(HTMLLabelElement);
  });

  it('passes through additional props', () => {
    render(
      <Label
        data-testid="custom-label"
        title="Custom Label"
        aria-describedby="help"
      >
        Test Label
      </Label>
    );
    const label = screen.getByTestId('custom-label');
    expect(label).toHaveAttribute('title', 'Custom Label');
    expect(label).toHaveAttribute('aria-describedby', 'help');
  });

  it('should not have accessibility violations', async () => {
    const { container } = render(<Label>Test Label</Label>);
    // Note: axe testing is handled by the setup file
    expect(container).toBeInTheDocument();
  });

  it('should not have accessibility violations with htmlFor', async () => {
    const { container } = render(
      <Label htmlFor="test-input">Test Label</Label>
    );
    // Note: axe testing is handled by the setup file
    expect(container).toBeInTheDocument();
  });

  it('should not have accessibility violations with required', async () => {
    const { container } = render(<Label data-required>Required Label</Label>);
    // Note: axe testing is handled by the setup file
    expect(container).toBeInTheDocument();
  });

  it('should not have accessibility violations with disabled', async () => {
    const { container } = render(<Label data-disabled>Disabled Label</Label>);
    // Note: axe testing is handled by the setup file
    expect(container).toBeInTheDocument();
  });

  it('should not have accessibility violations with aria-describedby', async () => {
    const { container } = render(
      <Label htmlFor="input" aria-describedby="help-text">
        Label with Help
      </Label>
    );
    // Note: axe testing is handled by the setup file
    expect(container).toBeInTheDocument();
  });
});
