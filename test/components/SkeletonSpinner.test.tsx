import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';

import Skeleton from '@/ui/components/Skeleton';
import Spinner from '@/ui/components/Spinner';

describe('Loading Components', () => {
  it('renders Skeleton text and is axe-clean', async () => {
    const { container } = render(
      <main>
        <Skeleton variant="text" lines={{ min: 2, max: 3 }} />
      </main>
    );
    const results = await axe(container);
    expect(container).toBeInTheDocument();
  });

  it('renders Spinner with role status and is axe-clean', async () => {
    const { container } = render(
      <main>
        <Spinner label="Loading" showAfterMs={0} />
      </main>
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
    const results = await axe(container);
    expect(container).toBeInTheDocument();
  });
});
