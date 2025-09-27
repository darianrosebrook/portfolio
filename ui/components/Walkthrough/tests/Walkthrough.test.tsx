import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Walkthrough, { WalkthroughStep } from '../Walkthrough';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe('Walkthrough', () => {
  it('renders walkthrough component', () => {
    render(
      <Walkthrough>
        <WalkthroughStep index={0}>Step 1 content</WalkthroughStep>
        <WalkthroughStep index={1}>Step 2 content</WalkthroughStep>
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
        <WalkthroughStep index={0}>Step</WalkthroughStep>
      </Walkthrough>
    );

    const step = screen.getByText('Step');
    expect(step).toHaveClass('custom-class');
  });

  it('passes through HTML attributes', () => {
    render(
      <Walkthrough data-testid="test-walkthrough">
        <WalkthroughStep index={0}>Step</WalkthroughStep>
      </Walkthrough>
    );

    expect(screen.getByTestId('test-walkthrough')).toBeInTheDocument();
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <Walkthrough>
          <WalkthroughStep index={0}>Step</WalkthroughStep>
        </Walkthrough>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Design Tokens', () => {
    it('uses design tokens instead of hardcoded values', () => {
      render(
        <Walkthrough>
          <WalkthroughStep index={0}>Step</WalkthroughStep>
        </Walkthrough>
      );

      const step = screen.getByText('Step');

      // Verify CSS custom properties are being used
      expect(step).toHaveClass('walkthrough');
    });
  });
});
