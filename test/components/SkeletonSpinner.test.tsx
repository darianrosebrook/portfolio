import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Skeleton from '@/ui/components/Skeleton';
import Spinner from '@/ui/components/Spinner';

expect.extend(toHaveNoViolations);

describe('Loading Components', () => {
  it('renders Skeleton text and is axe-clean', async () => {
    render(
      <main>
        <Skeleton variant="text" lines={{ min: 2, max: 3 }} />
      </main>
    );
    const results = await axe(document.body);
    expect(results).toHaveNoViolations();
  });

  it('renders Spinner with role status and is axe-clean', async () => {
    render(
      <main>
        <Spinner label="Loading" showAfterMs={0} />
      </main>
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
    const results = await axe(document.body);
    expect(results).toHaveNoViolations();
  });
});
