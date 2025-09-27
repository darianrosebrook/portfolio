import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Badge from '../Badge';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe('Badge', () => {
  it('renders with default props', () => {
    render(<Badge>Test Badge</Badge>);
    const badge = screen.getByText('Test Badge');
    expect(badge).toBeInTheDocument();
  });

  it('renders with different variants', () => {
    const { rerender } = render(<Badge variant="default">Default</Badge>);
    let badge = screen.getByText('Default');
    expect(badge).toBeInTheDocument();

    rerender(<Badge variant="status">Status</Badge>);
    badge = screen.getByText('Status');
    expect(badge).toBeInTheDocument();

    rerender(<Badge variant="counter">Counter</Badge>);
    badge = screen.getByText('Counter');
    expect(badge).toBeInTheDocument();

    rerender(<Badge variant="tag">Tag</Badge>);
    badge = screen.getByText('Tag');
    expect(badge).toBeInTheDocument();
  });

  it('renders with different intents', () => {
    const { rerender } = render(
      <Badge variant="status" intent="success">
        Success
      </Badge>
    );
    let badge = screen.getByText('Success');
    expect(badge).toBeInTheDocument();

    rerender(
      <Badge variant="status" intent="warning">
        Warning
      </Badge>
    );
    badge = screen.getByText('Warning');
    expect(badge).toBeInTheDocument();

    rerender(
      <Badge variant="status" intent="danger">
        Danger
      </Badge>
    );
    badge = screen.getByText('Danger');
    expect(badge).toBeInTheDocument();

    rerender(
      <Badge variant="status" intent="info">
        Info
      </Badge>
    );
    badge = screen.getByText('Info');
    expect(badge).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Badge size="sm">Small</Badge>);
    let badge = screen.getByText('Small');
    expect(badge).toBeInTheDocument();

    rerender(<Badge size="md">Medium</Badge>);
    badge = screen.getByText('Medium');
    expect(badge).toBeInTheDocument();

    rerender(<Badge size="lg">Large</Badge>);
    badge = screen.getByText('Large');
    expect(badge).toBeInTheDocument();
  });

  it('renders with icon', () => {
    const icon = <span data-testid="icon">🎯</span>;
    render(<Badge icon={icon}>With Icon</Badge>);
    const badge = screen.getByText('With Icon');
    const iconElement = screen.getByTestId('icon');
    expect(badge).toBeInTheDocument();
    expect(iconElement).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    const customClass = 'custom-badge';
    render(<Badge className={customClass}>Custom</Badge>);
    const badge = screen.getByText('Custom');
    expect(badge).toHaveClass(customClass);
  });

  it('renders without children', () => {
    render(<Badge />);
    // Should render without crashing
    const badge = document.querySelector('[class*="badge"]');
    expect(badge).toBeInTheDocument();
  });

  it('renders with icon only', () => {
    const icon = <span data-testid="icon-only">🎯</span>;
    render(<Badge icon={icon} />);
    const iconElement = screen.getByTestId('icon-only');
    expect(iconElement).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Badge ref={ref}>Ref Test</Badge>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('passes through additional props', () => {
    render(
      <Badge data-testid="custom-badge" title="Custom Badge">
        Test
      </Badge>
    );
    const badge = screen.getByTestId('custom-badge');
    expect(badge).toHaveAttribute('title', 'Custom Badge');
  });

  it('should not have accessibility violations', async () => {
    const { container } = render(<Badge>Test Badge</Badge>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should not have accessibility violations with icon', async () => {
    const icon = <span aria-hidden="true">🎯</span>;
    const { container } = render(<Badge icon={icon}>With Icon</Badge>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should not have accessibility violations with status variant', async () => {
    const { container } = render(
      <Badge variant="status" intent="success">
        Success
      </Badge>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should not have accessibility violations with different sizes', async () => {
    const { container } = render(<Badge size="lg">Large Badge</Badge>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});



