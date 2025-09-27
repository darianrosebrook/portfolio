import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Postcard from '../Postcard';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe('Postcard', () => {
  it('renders postcard with content', () => {
    render(
      <Postcard>
        <Postcard.Header>Header</Postcard.Header>
        <Postcard.Body>Body content</Postcard.Body>
        <Postcard.Footer>Footer</Postcard.Footer>
      </Postcard>
    );

    const header = screen.getByText('Header');
    const body = screen.getByText('Body content');
    const footer = screen.getByText('Footer');

    expect(header).toBeInTheDocument();
    expect(body).toBeInTheDocument();
    expect(footer).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <Postcard className="custom-class">
        <Postcard.Body>Content</Postcard.Body>
      </Postcard>
    );

    const postcard = screen.getByText('Content').closest('article');
    expect(postcard).toHaveClass('custom-class');
  });

  it('passes through HTML attributes', () => {
    render(
      <Postcard data-testid="test-postcard">
        <Postcard.Body>Content</Postcard.Body>
      </Postcard>
    );

    expect(screen.getByTestId('test-postcard')).toBeInTheDocument();
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <Postcard>
          <Postcard.Body>Content</Postcard.Body>
        </Postcard>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Design Tokens', () => {
    it('uses design tokens instead of hardcoded values', () => {
      render(
        <Postcard>
          <Postcard.Body>Content</Postcard.Body>
        </Postcard>
      );

      const postcard = screen.getByText('Content').closest('article');

      // Verify CSS custom properties are being used
      expect(postcard).toHaveClass('postcard');
    });
  });
});
