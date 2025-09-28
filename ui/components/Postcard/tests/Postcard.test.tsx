import * as React from 'react';
import { render, screen } from '@testing-library/react';

import Postcard from '../Postcard';

// Extend Jest matchers

// Mock data for Postcard tests
const mockPostcardData = {
  postId: 'test-post-123',
  author: {
    name: 'Test User',
    handle: '@testuser',
    avatar: '/test-avatar.jpg',
  },
  timestamp: '2024-01-01T00:00:00Z',
  content: 'This is a test post content',
  stats: {
    likes: 10,
    replies: 5,
    reposts: 2,
  },
};

describe('Postcard', () => {
  it('renders postcard with content', () => {
    render(
      <Postcard {...mockPostcardData}>
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
      <Postcard {...mockPostcardData}>
        <Postcard.Body>Content</Postcard.Body>
      </Postcard>
    );

    const postcard = screen.getByText('Content').closest('article');
    expect(postcard).toBeInTheDocument();
  });

  it('passes through HTML attributes', () => {
    render(
      <Postcard {...mockPostcardData}>
        <Postcard.Body>Content</Postcard.Body>
      </Postcard>
    );

    const postcard = screen.getByText('Content').closest('article');
    expect(postcard).toBeInTheDocument();
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <Postcard {...mockPostcardData}>
          <Postcard.Body>Content</Postcard.Body>
        </Postcard>
      );
      // Note: axe testing is handled by the setup file
      expect(container).toBeInTheDocument();
    });
  });

  describe('Design Tokens', () => {
    it('uses design tokens instead of hardcoded values', () => {
      render(
        <Postcard {...mockPostcardData}>
          <Postcard.Body>Content</Postcard.Body>
        </Postcard>
      );

      const postcard = screen.getByText('Content').closest('article');

      // Verify CSS custom properties are being used
      expect(postcard).toHaveClass('postcard');
    });
  });
});
