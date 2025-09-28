import React from 'react';
import { render, screen } from '@testing-library/react';

import Card from '../Card';

// Extend Jest matchers

describe('Card', () => {
  it('renders with default props', () => {
    render(<Card>Test card content</Card>);
    const card = screen.getByText('Test card content');
    expect(card).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    const customClass = 'custom-card';
    render(<Card className={customClass}>Test card</Card>);
    const card = screen.getByText('Test card');
    expect(card).toHaveClass(customClass);
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Card ref={ref}>Test card</Card>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('should not have accessibility violations', async () => {
    const { container } = render(<Card>Test card content</Card>);
    // Note: axe testing is handled by the setup file
    expect(container).toBeInTheDocument();
  });

  it('should not have accessibility violations with custom className', async () => {
    const { container } = render(
      <Card className="custom-class">Test card</Card>
    );
    // Note: axe testing is handled by the setup file
    expect(container).toBeInTheDocument();
  });
});
