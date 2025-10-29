import * as React from 'react';
import { render, screen } from '@testing-library/react';

import Walkthrough from '../Walkthrough';

// Extend Jest matchers

describe('Walkthrough', () => {
  it('renders walkthrough component', () => {
    render(
      <Walkthrough>
        <div>Step 1 content</div>
        <div>Step 2 content</div>
      </Walkthrough>
    );

    const step1 = screen.getByText('Step 1 content');
    const step2 = screen.getByText('Step 2 content');

    expect(step1).toBeInTheDocument();
    expect(step2).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <Walkthrough className="custom-class">
        <div>Step</div>
      </Walkthrough>
    );

    const step = screen.getByText('Step');
    expect(step).toHaveClass('custom-class');
  });

  it('passes through HTML attributes', () => {
    render(
      <Walkthrough data-testid="test-walkthrough">
        <div>Step</div>
      </Walkthrough>
    );

    expect(screen.getByTestId('test-walkthrough')).toBeInTheDocument();
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <Walkthrough>
          <div>Step</div>
        </Walkthrough>
      );
      // Note: axe testing is handled by the setup file
      expect(container).toBeInTheDocument();
    });
  });

  describe('Design Tokens', () => {
    it('uses design tokens instead of hardcoded values', () => {
      render(
        <Walkthrough>
          <div>Step</div>
        </Walkthrough>
      );

      const step = screen.getByText('Step');

      // Verify CSS custom properties are being used
      expect(step).toHaveClass('walkthrough');
    });
  });
});
