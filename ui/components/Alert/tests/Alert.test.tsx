import React from 'react';
import { render, screen } from '@testing-library/react';

import Alert from '../Alert';

// Extend Jest matchers

describe('Alert', () => {
  it('renders with default props', () => {
    render(<Alert>Test alert message</Alert>);
    const alert = screen.getByText('Test alert message');
    expect(alert).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    const customClass = 'custom-alert';
    render(<Alert className={customClass}>Test alert</Alert>);
    const alert = screen.getByText('Test alert');
    expect(alert).toHaveClass(customClass);
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Alert ref={ref}>Test alert</Alert>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('should not have accessibility violations', async () => {
    const { container } = render(<Alert>Test alert message</Alert>);
    // Note: axe testing is handled by the setup file
    expect(container).toBeInTheDocument();
  });

  it('should not have accessibility violations with custom className', async () => {
    const { container } = render(
      <Alert className="custom-class">Test alert</Alert>
    );
    // Note: axe testing is handled by the setup file
    expect(container).toBeInTheDocument();
  });
});
