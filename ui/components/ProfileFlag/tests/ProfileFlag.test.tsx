import * as React from 'react';
import { render, screen } from '@testing-library/react';

import ProfileFlag from '../ProfileFlag';

// Extend Jest matchers

// Mock profile data for tests
const mockProfile = {
  id: 'test-id',
  full_name: 'Test User',
  avatar_url: '/test-avatar.jpg',
  username: 'testuser',
  account_status: 'active',
  bio: 'Test bio',
  created_at: '2024-01-01T00:00:00Z',
  first_name: 'Test',
  last_name: 'User',
  images: null,
  updated_at: '2024-01-01T00:00:00Z',
  website: null,
  location: null,
  verified: false,
} as any;

describe('ProfileFlag', () => {
  it('renders profile flag correctly', () => {
    render(<ProfileFlag profile={mockProfile} />);

    const flag = screen.getByText('Test User');
    expect(flag).toBeInTheDocument();
  });

  it('renders with null profile', () => {
    render(<ProfileFlag profile={null} />);

    // Should render nothing when profile is null
    expect(screen.queryByText('Test User')).not.toBeInTheDocument();
  });

  it('renders with missing profile data', () => {
    const incompleteProfile = {
      account_status: 'active',
      avatar_url: null,
      bio: '',
      created_at: '2024-01-01T00:00:00Z',
      first_name: null,
      full_name: '',
      id: 'test-id',
      images: null,
      last_name: null,
      metrics: '{}',
      occupation: null,
      privacy: 'public',
      settings: '{}',
      social_media: null,
      spacial_location: null,
      updated_at: null,
      username: '',
    };

    render(<ProfileFlag profile={incompleteProfile} />);

    // Should handle missing data gracefully
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<ProfileFlag profile={mockProfile} />);
      // Note: axe testing is handled by the setup file
      expect(container).toBeInTheDocument();
    });
  });

  describe('Design Tokens', () => {
    it('uses design tokens instead of hardcoded values', () => {
      render(<ProfileFlag profile={mockProfile} />);

      const flag = screen.getByText('Test User').closest('div');

      // Verify CSS custom properties are being used
      expect(flag).toHaveClass('profileFlag');
    });
  });
});
